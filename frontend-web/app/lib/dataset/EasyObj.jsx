import { useState, useRef } from 'react';

const scheduleUpdate = (fn) => {
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        return window.requestAnimationFrame(fn);
    }
    return setTimeout(fn, 0);
};

const isObject = (value) => typeof value === 'object' && value !== null;
const isNumericKey = (key) => typeof key === 'string' && /^\d+$/.test(key);

const toSegments = (key) => {
    if (Array.isArray(key)) return key.map((segment) => (typeof segment === 'number' ? String(segment) : segment));
    if (typeof key === 'number') return [String(key)];
    if (typeof key === 'string') {
        if (key.length === 0) return [];
        return key.split('.').filter((segment) => segment.length > 0);
    }
    if (typeof key === 'symbol') return [key];
    return [String(key)];
};

const deepCopy = (value) => {
    if (!isObject(value)) return value;
    if (Array.isArray(value)) return value.map((item) => deepCopy(item));
    const out = {};
    for (const key of Object.keys(value)) out[key] = deepCopy(value[key]);
    return out;
};

const toPathString = (segments) => segments.filter((segment) => typeof segment !== 'symbol').join('.');

function useEasyObj(initialData = {}) {
    const [, forceRender] = useState({});
    const rootRef = useRef(isObject(initialData) ? deepCopy(initialData) : {});
    const listenersRef = useRef(new Set());
    const rawToProxyRef = useRef(new WeakMap());
    const proxyToRawRef = useRef(new WeakMap());
    const rootProxyRef = useRef(null);
    const dirtyFlagRef = useRef(false);

    const markDirty = () => {
        if (dirtyFlagRef.current) return;
        dirtyFlagRef.current = true;
        scheduleUpdate(() => {
            dirtyFlagRef.current = false;
            forceRender({});
        });
    };

    const unwrap = (value) => {
        if (!isObject(value)) return value;
        if (proxyToRawRef.current.has(value)) return proxyToRawRef.current.get(value);
        if (value.__rawObject) return value.__rawObject;
        return value;
    };

    const readAtPath = (pathSegments) => {
        if (!pathSegments.length) return rootRef.current;
        let cursor = rootRef.current;
        for (const segment of pathSegments) {
            if (cursor == null) return undefined;
            const key = typeof segment === 'symbol' ? segment : String(segment);
            cursor = cursor[key];
        }
        return cursor;
    };

    const ensureContainer = (cursor, key, nextKey) => {
        if (!isObject(cursor[key])) {
            const shouldBeArray = typeof nextKey === 'string' && isNumericKey(nextKey);
            cursor[key] = shouldBeArray ? [] : {};
        }
        return cursor[key];
    };

    const assignAtPath = (pathSegments, value) => {
        if (!pathSegments.length) {
            const prev = rootRef.current;
            rootRef.current = isObject(value) ? value : {};
            return { prev };
        }
        if (!isObject(rootRef.current)) rootRef.current = {};
        let cursor = rootRef.current;
        for (let idx = 0; idx < pathSegments.length - 1; idx += 1) {
            const segment = pathSegments[idx];
            const key = typeof segment === 'symbol' ? segment : String(segment);
            const nextKey = pathSegments[idx + 1];
            cursor = ensureContainer(cursor, key, typeof nextKey === 'symbol' ? undefined : String(nextKey));
        }
        const lastSegment = pathSegments[pathSegments.length - 1];
        const lastKey = typeof lastSegment === 'symbol' ? lastSegment : String(lastSegment);
        const prev = cursor[lastKey];
        cursor[lastKey] = value;
        return { prev };
    };

    const removeAtPath = (pathSegments) => {
        if (!pathSegments.length) return { prev: undefined, removed: false };
        let cursor = rootRef.current;
        for (let idx = 0; idx < pathSegments.length - 1; idx += 1) {
            const segment = pathSegments[idx];
            const key = typeof segment === 'symbol' ? segment : String(segment);
            cursor = cursor?.[key];
            if (cursor == null) return { prev: undefined, removed: false };
        }
        const leafSegment = pathSegments[pathSegments.length - 1];
        const leafKey = typeof leafSegment === 'symbol' ? leafSegment : String(leafSegment);
        if (!Object.prototype.hasOwnProperty.call(cursor ?? {}, leafKey)) {
            return { prev: undefined, removed: false };
        }
        const prev = cursor[leafKey];
        const removed = Reflect.deleteProperty(cursor, leafKey);
        return { prev, removed };
    };

    const normalizePath = (basePath, key) => {
        const nextSegments = toSegments(key);
        if (!nextSegments.length) return [...basePath];
        return [...basePath, ...nextSegments];
    };

    const wrapPrevValue = (rawPrev) => {
        if (!isObject(rawPrev)) return rawPrev;
        return deepCopy(rawPrev);
    };

    const wrapValue = (rawValue, pathSegments) => {
        if (!isObject(rawValue)) return rawValue;
        if (!pathSegments.length) return ensureRootProxy();
        return getOrCreateProxy(rawValue, pathSegments);
    };

    const synchronizeProxyTarget = (target, proxy, basePath) => {
        const latest = readAtPath(basePath);
        if (isObject(latest)) {
            if (latest !== target) {
                rawToProxyRef.current.delete(target);
                rawToProxyRef.current.set(latest, proxy);
                proxyToRawRef.current.set(proxy, latest);
            }
            return latest;
        }
        rawToProxyRef.current.delete(target);
        proxyToRawRef.current.set(proxy, latest);
        return latest;
    };

    const resolveContainer = (target, proxy, basePath) => {
        if (!basePath.length) {
            if (!isObject(rootRef.current)) rootRef.current = {};
            if (rootRef.current !== target) {
                rawToProxyRef.current.delete(target);
                rawToProxyRef.current.set(rootRef.current, proxy);
                proxyToRawRef.current.set(proxy, rootRef.current);
            }
            return rootRef.current;
        }
        return synchronizeProxyTarget(target, proxy, basePath);
    };

    const emitChange = ({ type, path, value, prev, source = 'program' }) => {
        const detail = {
            type,
            path,
            pathString: toPathString(path),
            value,
            prev,
            ctx: {
                dataKey: toPathString(path),
                modelType: 'obj',
                dirty: true,
                valid: null,
                source,
            },
        };
        listenersRef.current.forEach((listener) => {
            try {
                listener(detail);
            } catch {
                // suppress listener failures
            }
        });
    };

    const applySet = (pathSegments, incomingValue, options = {}) => {
        const source = options.source ?? 'program';
        const nextRaw = unwrap(incomingValue);
        const onRoot = pathSegments.length === 0;
        const normalizedValue = onRoot && isObject(nextRaw) ? deepCopy(nextRaw) : nextRaw;
        const { prev } = assignAtPath(pathSegments, normalizedValue);
        const prevExport = wrapPrevValue(prev);

        if (onRoot) {
            rawToProxyRef.current = new WeakMap();
            proxyToRawRef.current = new WeakMap();
        }

        if (Object.is(prev, normalizedValue)) {
            return wrapValue(normalizedValue, pathSegments);
        }

        markDirty();

        if (onRoot) ensureRootProxy();

        const latest = readAtPath(pathSegments);
        const wrappedValue = wrapValue(latest, pathSegments);
        emitChange({
            type: 'set',
            path: pathSegments,
            value: wrappedValue,
            prev: prevExport,
            source,
        });
        return wrappedValue;
    };

    const applyDelete = (pathSegments, options = {}) => {
        const source = options.source ?? 'program';
        const { prev, removed } = removeAtPath(pathSegments);
        if (!removed) return false;
        markDirty();
        const wrappedPrev = wrapPrevValue(prev);
        emitChange({
            type: 'delete',
            path: pathSegments,
            value: undefined,
            prev: wrappedPrev,
            source,
        });
        return true;
    };

    const replaceBranch = (basePath, sourceValue, options = {}) => {
        const plain = unwrap(sourceValue);
        if (Array.isArray(plain) || !isObject(plain)) {
            applySet(basePath, deepCopy(plain), options);
            return;
        }
        const nextKeys = new Set(Object.keys(plain));
        const current = readAtPath(basePath);
        const currentKeys = isObject(current) ? Object.keys(current) : [];
        currentKeys.forEach((key) => {
            if (!nextKeys.has(key)) applyDelete([...basePath, key], options);
        });
        Object.entries(plain).forEach(([key, value]) => {
            applySet([...basePath, key], value, options);
        });
    };

    function getOrCreateProxy(raw, basePath = []) {
        if (!isObject(raw)) return raw;
        const cached = rawToProxyRef.current.get(raw);
        if (cached) return cached;
        let proxy;
        const handler = {
            get(target, prop, receiver) {
                const container = resolveContainer(target, proxy, basePath);
                if (prop === '__isProxy') return true;
                if (prop === '__rawObject') return container;
                if (prop === '__path') return [...basePath];
                if (prop === 'toString' && isObject(container)) return () => JSON.stringify(container);
                if (prop === 'toJSON') return () => deepCopy(container);
                if (!isObject(container)) {
                    if (prop === 'valueOf') return () => container;
                    if (prop === 'toString') return () => String(container ?? '');
                    if (prop === Symbol.toPrimitive) {
                        return (hint) => {
                            if (hint === 'number') return Number(container);
                            if (hint === 'string') return String(container ?? '');
                            return container;
                        };
                    }
                }
                if (prop === 'copy') {
                    return (sourceObj) => replaceBranch(basePath, sourceObj ?? {}, { source: 'program' });
                }
                if (prop === 'deepCopy') {
                    return (sourceObj) => replaceBranch(basePath, deepCopy(sourceObj ?? {}), { source: 'program' });
                }
                if (prop === 'get') {
                    return (key, fallback) => {
                        const fullPath = normalizePath(basePath, key);
                        const result = readAtPath(fullPath);
                        if (typeof result === 'undefined') return fallback;
                        return wrapValue(result, fullPath);
                    };
                }
                if (prop === 'set') {
                    return (key, value, opts) => applySet(normalizePath(basePath, key), value, opts);
                }
                if (prop === 'delete') {
                    return (key, opts) => applyDelete(normalizePath(basePath, key), opts);
                }
                if (prop === 'subscribe') {
                    return (listener) => {
                        if (typeof listener !== 'function') return () => {};
                        listenersRef.current.add(listener);
                        return () => listenersRef.current.delete(listener);
                    };
                }
                if (prop === 'forAll') {
                    // 모든 1단계 필드를 순회하며 콜백을 적용한다.
                    // 콜백은 (value, key, obj) 인자를 받고, 반환값이 undefined가 아니면 해당 키에 대입한다.
                    return (fn) => {
                        if (typeof fn !== 'function') return wrapValue(container, basePath);
                        const keys = isObject(container) ? Object.keys(container) : [];
                        for (let i = 0; i < keys.length; i += 1) {
                            const key = keys[i];
                            const current = container[key];
                            const next = fn(current, key, container);
                            if (typeof next !== 'undefined') {
                                applySet(normalizePath(basePath, key), next, { source: 'program' });
                            }
                        }
                        return wrapValue(container, basePath);
                    };
                }
                if (typeof prop === 'string' && prop.includes('.')) {
                    const fullPath = normalizePath(basePath, prop);
                    const value = readAtPath(fullPath);
                    return wrapValue(value, fullPath);
                }
                const baseObject = isObject(container) ? container : Object(container ?? {});
                const value = Reflect.get(baseObject, prop, receiver);
                if (isObject(value)) {
                    const nextContainer = readAtPath(normalizePath(basePath, prop));
                    return getOrCreateProxy(nextContainer ?? value, [...basePath, typeof prop === 'symbol' ? prop : String(prop)]);
                }
                return value;
            },
            set(target, prop, value) {
                applySet(normalizePath(basePath, prop), value, { source: 'program' });
                return true;
            },
            deleteProperty(target, prop) {
                applyDelete(normalizePath(basePath, prop), { source: 'program' });
                return true;
            },
            has(target, prop) {
                const container = resolveContainer(target, proxy, basePath);
                if (!isObject(container)) {
                    const boxed = Object(container ?? {});
                    return Reflect.has(boxed, prop);
                }
                return Reflect.has(container, prop);
            },
            ownKeys(target) {
                const container = resolveContainer(target, proxy, basePath);
                if (!isObject(container)) {
                    const boxed = Object(container ?? {});
                    return Reflect.ownKeys(boxed);
                }
                return Reflect.ownKeys(container);
            },
            getOwnPropertyDescriptor(target, prop) {
                const container = resolveContainer(target, proxy, basePath);
                if (!isObject(container)) {
                    const boxed = Object(container ?? {});
                    return Object.getOwnPropertyDescriptor(boxed, prop);
                }
                return Object.getOwnPropertyDescriptor(container, prop);
            },
        };
        proxy = new Proxy(raw, handler);
        rawToProxyRef.current.set(raw, proxy);
        proxyToRawRef.current.set(proxy, raw);
        if (!basePath.length) rootProxyRef.current = proxy;
        return proxy;
    }

    function ensureRootProxy() {
        if (!isObject(rootRef.current)) rootRef.current = {};
        if (rootProxyRef.current && proxyToRawRef.current.get(rootProxyRef.current) === rootRef.current) {
            return rootProxyRef.current;
        }
        return getOrCreateProxy(rootRef.current, []);
    }

    if (!rootProxyRef.current) {
        rootProxyRef.current = getOrCreateProxy(rootRef.current, []);
    }

    return rootProxyRef.current;
}

function EasyObj(initialData = {}) {
    return useEasyObj(initialData);
}

export default EasyObj;
export { useEasyObj };
