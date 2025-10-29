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

function useEasyList(initialData = []) {
    const [, forceRender] = useState({});
    const rootRef = useRef(Array.isArray(initialData) ? deepCopy(initialData) : []);
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
            rootRef.current = Array.isArray(value) ? value : [value];
            return { prev };
        }
        if (!Array.isArray(rootRef.current)) rootRef.current = [];
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
        if (Array.isArray(cursor) && typeof leafKey === 'string' && isNumericKey(leafKey)) {
            const index = Number(leafKey);
            if (Number.isNaN(index) || index < 0 || index >= cursor.length) return { prev: undefined, removed: false };
            const prev = cursor[index];
            cursor.splice(index, 1);
            return { prev, removed: true };
        }
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

    const wrapValue = (rawValue, pathSegments) => {
        if (!isObject(rawValue)) return rawValue;
        return getOrCreateProxy(rawValue, pathSegments);
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
                modelType: 'list',
                dirty: true,
                valid: null,
                source,
            },
        };
        listenersRef.current.forEach((listener) => {
            try {
                listener(detail);
            } catch {
                // swallow listener errors
            }
        });
    };

    const applySet = (pathSegments, incomingValue, options = {}) => {
        const source = options.source ?? 'program';
        const nextRaw = unwrap(incomingValue);
        const { prev } = assignAtPath(pathSegments, nextRaw);
        if (Object.is(prev, nextRaw)) return wrapValue(nextRaw, pathSegments);
        markDirty();
        const latest = readAtPath(pathSegments);
        emitChange({
            type: 'set',
            path: pathSegments,
            value: wrapValue(latest, pathSegments),
            prev: wrapValue(prev, pathSegments),
            source,
        });
        return wrapValue(latest, pathSegments);
    };

    const applyDelete = (pathSegments, options = {}) => {
        const source = options.source ?? 'program';
        const { prev, removed } = removeAtPath(pathSegments);
        if (!removed) return false;
        markDirty();
        emitChange({
            type: 'delete',
            path: pathSegments,
            value: undefined,
            prev: wrapValue(prev, pathSegments),
            source,
        });
        return true;
    };

    const replaceBranch = (basePath, sourceValue, options = {}) => {
        const plain = unwrap(sourceValue);
        if (Array.isArray(plain)) {
            applySet(basePath, deepCopy(plain), options);
            return;
        }
        if (!isObject(plain)) {
            applySet(basePath, plain, options);
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
        const handler = {
            get(target, prop) {
                if (prop === '__isProxy') return true;
                if (prop === '__rawObject') return target;
                if (prop === '__path') return [...basePath];
                if (prop === 'toString') return () => JSON.stringify(target);
                if (prop === 'toJSON') return () => deepCopy(target);
                if (prop === 'copy') {
                    return (sourceList) => replaceBranch(basePath, sourceList ?? [], { source: 'program' });
                }
                if (prop === 'deepCopy') {
                    return (sourceList) => replaceBranch(basePath, deepCopy(sourceList ?? []), { source: 'program' });
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
                if (prop === 'push') {
                    return (...items) => {
                        const start = Array.isArray(target) ? target.length : 0;
                        items.forEach((item, offset) => {
                            applySet([...basePath, String(start + offset)], item, { source: 'program' });
                        });
                        return readAtPath(basePath).length;
                    };
                }
                if (prop === 'pop') {
                    return () => {
                        const arr = readAtPath(basePath);
                        if (!Array.isArray(arr) || !arr.length) return undefined;
                        const index = arr.length - 1;
                        const value = wrapValue(arr[index], [...basePath, String(index)]);
                        applyDelete([...basePath, String(index)], { source: 'program' });
                        return value;
                    };
                }
                if (prop === 'splice') {
                    return (start, deleteCount, ...items) => {
                        const arr = readAtPath(basePath);
                        const normalizedStart = Math.max(0, Math.min(arr.length, Number(start) || 0));
                        const toDelete = Math.max(0, Number(deleteCount) || 0);
                        const removed = [];
                        for (let idx = 0; idx < toDelete; idx += 1) {
                            const path = [...basePath, String(normalizedStart)];
                            const current = readAtPath(path);
                            removed.push(wrapValue(current, path));
                            applyDelete(path, { source: 'program' });
                        }
                        items.forEach((item, offset) => {
                            const path = [...basePath, String(normalizedStart + offset)];
                            applySet(path, item, { source: 'program' });
                        });
                        return removed;
                    };
                }
                if (prop === 'forAll') {
                    return (callback) => {
                        if (typeof callback !== 'function') return;
                        const arr = readAtPath(basePath);
                        if (!Array.isArray(arr)) return;
                        arr.forEach((item, index) => {
                            callback(wrapValue(item, [...basePath, String(index)]), index);
                        });
                    };
                }
                if (typeof prop === 'string' && prop.includes('.')) {
                    const fullPath = normalizePath(basePath, prop);
                    const value = readAtPath(fullPath);
                    return wrapValue(value, fullPath);
                }
                const value = Reflect.get(target, prop);
                if (isObject(value)) {
                    return getOrCreateProxy(value, [...basePath, typeof prop === 'symbol' ? prop : String(prop)]);
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
                return Reflect.has(target, prop);
            },
            ownKeys(target) {
                return Reflect.ownKeys(target);
            },
            getOwnPropertyDescriptor(target, prop) {
                return Object.getOwnPropertyDescriptor(target, prop);
            },
        };
        const proxy = new Proxy(raw, handler);
        rawToProxyRef.current.set(raw, proxy);
        proxyToRawRef.current.set(proxy, raw);
        return proxy;
    }

    if (!rootProxyRef.current) {
        rootProxyRef.current = getOrCreateProxy(rootRef.current, []);
    }

    return rootProxyRef.current;
}

function EasyList(initialData = []) {
    return useEasyList(initialData);
}

export default EasyList;
export { useEasyList };
