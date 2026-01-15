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

const createObjectProxy = (target, notify) => {
  const handler = {
    get(obj, prop) {
      if (prop === '__isProxy') return true;
      if (prop === '__rawObject') return obj;
      if (prop === 'copy') {
        return (source) => {
          const raw = source && source.__rawObject ? source.__rawObject : source;
          const src = isObject(raw) ? raw : {};
          Object.keys(obj).forEach((key) => {
            // eslint-disable-next-line no-param-reassign
            delete obj[key];
          });
          Object.entries(src).forEach(([key, value]) => {
            // eslint-disable-next-line no-param-reassign
            obj[key] = value;
          });
          notify();
        };
      }
      if (prop === 'deepCopy') {
        return (source) => {
          const raw = source && source.__rawObject ? source.__rawObject : source;
          const copied = deepCopy(raw);
          Object.keys(obj).forEach((key) => {
            // eslint-disable-next-line no-param-reassign
            delete obj[key];
          });
          if (isObject(copied)) {
            Object.entries(copied).forEach(([key, value]) => {
              // eslint-disable-next-line no-param-reassign
              obj[key] = value;
            });
          }
          notify();
        };
      }
      if (prop === 'forAll') {
        return (fn) => {
          if (typeof fn !== 'function') return obj;
          const keys = Object.keys(obj);
          for (let i = 0; i < keys.length; i += 1) {
            const key = keys[i];
            const current = obj[key];
            const next = fn(current, key, obj);
            if (typeof next !== 'undefined') {
              // eslint-disable-next-line no-param-reassign
              obj[key] = next;
            }
          }
          notify();
          return obj;
        };
      }
      if (prop === 'toJSON') {
        return () => obj;
      }
      if (prop === 'toString') {
        return () => JSON.stringify(obj);
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
  };

  return new Proxy(target, handler);
};

function useEasyObj(initialData = {}) {
  const [, forceRender] = useState({});
  const rootRef = useRef(isObject(initialData) ? deepCopy(initialData) : {});

  const notify = () => {
    scheduleUpdate(() => {
      forceRender({});
    });
  };

  if (!rootRef.current.__isProxy) {
    rootRef.current = createObjectProxy(rootRef.current, notify);
  }

  return rootRef.current;
}

function EasyObj(initialData = {}) {
  return useEasyObj(initialData);
}

export default EasyObj;
export { useEasyObj };

