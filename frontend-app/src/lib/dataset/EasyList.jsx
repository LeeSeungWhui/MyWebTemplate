import { useRef, useState } from 'react';

const scheduleUpdate = (fn) => {
  const g =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof window !== 'undefined'
      ? window
      : undefined;
  if (g && typeof g.requestAnimationFrame === 'function') {
    return g.requestAnimationFrame(fn);
  }
  return setTimeout(fn, 0);
};

const isObject = (value) => typeof value === 'object' && value !== null;

const deepCopy = (value) => {
  if (!isObject(value)) return value;
  if (Array.isArray(value)) return value.map((item) => deepCopy(item));
  const out = {};
  Object.keys(value).forEach((key) => {
    out[key] = deepCopy(value[key]);
  });
  return out;
};

const createObjectProxy = (target, notify) =>
  new Proxy(target, {
    get(obj, prop) {
      if (prop === '__isProxy') return true;
      if (prop === '__rawObject') return obj;
      if (prop === 'toJSON') {
        return () => obj;
      }

      const value = Reflect.get(obj, prop);
      if (isObject(value) && !value.__isProxy) {
        const proxied = createObjectProxy(value, notify);
        Reflect.set(obj, prop, proxied);
        return proxied;
      }
      return value;
    },
    set(obj, prop, value) {
      Reflect.set(obj, prop, value);
      notify();
      return true;
    },
    deleteProperty(obj, prop) {
      const result = Reflect.deleteProperty(obj, prop);
      notify();
      return result;
    },
  });

const createListProxy = (target, notify) => {
  const handler = {
    get(arr, prop) {
      if (prop === '__isProxy') return true;
      if (prop === '__rawObject') return arr;
      if (prop === 'forAll') {
        return (fn) => {
          if (typeof fn !== 'function') return arr;
          arr.forEach((item, index) => {
            if (isObject(item) && !item.__isProxy) {
              // eslint-disable-next-line no-param-reassign
              arr[index] = createObjectProxy(item, notify);
            }
            fn(arr[index], index, arr);
          });
          notify();
          return arr;
        };
      }

      // 배열 메서드 래핑
      if (prop === 'push') {
        return (...items) => {
          const normalized = items.map((item) =>
            isObject(item) ? createObjectProxy(item, notify) : item,
          );
          const result = arr.push(...normalized);
          notify();
          return result;
        };
      }
      if (prop === 'pop') {
        return () => {
          const result = arr.pop();
          notify();
          return result;
        };
      }
      if (prop === 'shift') {
        return () => {
          const result = arr.shift();
          notify();
          return result;
        };
      }
      if (prop === 'unshift') {
        return (...items) => {
          const normalized = items.map((item) =>
            isObject(item) ? createObjectProxy(item, notify) : item,
          );
          const result = arr.unshift(...normalized);
          notify();
          return result;
        };
      }
      if (prop === 'splice') {
        return (start, deleteCount, ...items) => {
          const normalized = items.map((item) =>
            isObject(item) ? createObjectProxy(item, notify) : item,
          );
          const result = arr.splice(start, deleteCount, ...normalized);
          notify();
          return result;
        };
      }
      if (prop === 'sort') {
        return (compareFn) => {
          const result = arr.sort(compareFn);
          notify();
          return result;
        };
      }
      if (prop === 'reverse') {
        return () => {
          const result = arr.reverse();
          notify();
          return result;
        };
      }

      const value = Reflect.get(arr, prop);
      if (
        Array.isArray(arr)
        && (typeof prop === 'string' || typeof prop === 'number')
      ) {
        const index = Number(prop);
        if (!Number.isNaN(index) && index >= 0 && index < arr.length) {
          const current = arr[index];
          if (isObject(current) && !current.__isProxy) {
            const proxied = createObjectProxy(current, notify);
            // eslint-disable-next-line no-param-reassign
            arr[index] = proxied;
            return proxied;
          }
        }
      }
      return value;
    },
    set(arr, prop, value) {
      const normalized =
        isObject(value) && !value.__isProxy
          ? createObjectProxy(value, notify)
          : value;
      Reflect.set(arr, prop, normalized);
      notify();
      return true;
    },
    deleteProperty(arr, prop) {
      const result = Reflect.deleteProperty(arr, prop);
      notify();
      return result;
    },
  };

  return new Proxy(target, handler);
};

function useEasyList(initialData = []) {
  const [, forceRender] = useState({});
  const rootRef = useRef(Array.isArray(initialData) ? deepCopy(initialData) : []);

  const notify = () => {
    scheduleUpdate(() => {
      forceRender({});
    });
  };

  if (!rootRef.current.__isProxy) {
    rootRef.current = createListProxy(rootRef.current, notify);
  }

  return rootRef.current;
}

function EasyList(initialData = []) {
  return useEasyList(initialData);
}

export default EasyList;
export { useEasyList };
