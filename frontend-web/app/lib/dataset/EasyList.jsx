/**
 * 파일명: EasyList.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: 리스트형 반응형 데이터 모델
 */

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

/**
 * @description 프록시 감싸면 안 되는 내장 객체 여부를 판별한다.
 * @param {unknown} value
 * @returns {boolean}
 */
const isNativeFileLike = (value) => {
    if (!isObject(value)) return false;
    if (Array.isArray(value)) return false;
    if (typeof File !== 'undefined' && value instanceof File) return true;
    if (typeof Blob !== 'undefined' && value instanceof Blob) return true;
    if (typeof FileList !== 'undefined' && value instanceof FileList) return true;
    return false;
};

const deepCopy = (value) => {
    if (!isObject(value) || isNativeFileLike(value)) return value;
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
            const result = { prev: rootRef.current };
            rootRef.current = Array.isArray(value) ? value : [];
            return result;
        }
        if (!Array.isArray(rootRef.current)) rootRef.current = [];
        let cursor = rootRef.current;
        for (let idx = 0; idx < pathSegments.length - 1; idx += 1) {
            const key = typeof pathSegments[idx] === 'symbol' ? pathSegments[idx] : String(pathSegments[idx]);
            cursor = ensureContainer(
                cursor,
                key,
                typeof pathSegments[idx + 1] === 'symbol' ? undefined : String(pathSegments[idx + 1]),
            );
        }
        const lastKey =
            typeof pathSegments[pathSegments.length - 1] === 'symbol'
                ? pathSegments[pathSegments.length - 1]
                : String(pathSegments[pathSegments.length - 1]);
        const result = { prev: cursor[lastKey] };
        cursor[lastKey] = value;
        return result;
    };

    const removeAtPath = (pathSegments) => {
        if (!pathSegments.length) return { prev: undefined, removed: false };
        let cursor = rootRef.current;
        for (let idx = 0; idx < pathSegments.length - 1; idx += 1) {
            const key = typeof pathSegments[idx] === 'symbol' ? pathSegments[idx] : String(pathSegments[idx]);
            cursor = cursor?.[key];
            if (cursor == null) return { prev: undefined, removed: false };
        }
        const leafKey =
            typeof pathSegments[pathSegments.length - 1] === 'symbol'
                ? pathSegments[pathSegments.length - 1]
                : String(pathSegments[pathSegments.length - 1]);
        if (Array.isArray(cursor) && typeof leafKey === 'string' && isNumericKey(leafKey)) {
            const index = Number(leafKey);
            if (Number.isNaN(index) || index < 0 || index >= cursor.length) return { prev: undefined, removed: false };
            return { prev: cursor.splice(index, 1)[0], removed: true };
        }
        if (!Object.prototype.hasOwnProperty.call(cursor ?? {}, leafKey)) {
            return { prev: undefined, removed: false };
        }
        return {
            prev: cursor[leafKey],
            removed: Reflect.deleteProperty(cursor, leafKey),
        };
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
        if (!isObject(rawValue) || isNativeFileLike(rawValue)) return rawValue;
        if (!pathSegments.length) return ensureRootProxy();
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
                // 한글설명: swallow listener errors
            }
        });
    };

    const applySet = (pathSegments, incomingValue, options = {}) => {
        const source = options.source ?? 'program';
        const nextRaw = unwrap(incomingValue);
        const onRoot = pathSegments.length === 0;
        let normalizedValue = nextRaw;
        if (onRoot) {
            normalizedValue = Array.isArray(nextRaw) ? deepCopy(nextRaw) : nextRaw;
        }
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
            if (!Array.isArray(rootRef.current)) rootRef.current = [];
            if (rootRef.current !== target) {
                rawToProxyRef.current.delete(target);
                rawToProxyRef.current.set(rootRef.current, proxy);
                proxyToRawRef.current.set(proxy, rootRef.current);
            }
            return rootRef.current;
        }
        return synchronizeProxyTarget(target, proxy, basePath);
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
                        if (typeof listener !== 'function') return () => { };
                        listenersRef.current.add(listener);
                        return () => listenersRef.current.delete(listener);
                    };
                }
                if (prop === 'push') {
                    return (...items) => {
                        let start = 0;
                        if (Array.isArray(container)) {
                            start = container.length;
                        } else if (Array.isArray(target)) {
                            start = target.length;
                        }
                        items.forEach((item, offset) => {
                            applySet([...basePath, String(start + offset)], item, { source: 'program' });
                        });
                        const latest = readAtPath(basePath);
                        return Array.isArray(latest) ? latest.length : start + items.length;
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
                const baseObject = isObject(container) ? container : Object(container ?? {});
                const value = Reflect.get(baseObject, prop, receiver);
                if (isObject(value) && !isNativeFileLike(value)) {
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
        if (!Array.isArray(rootRef.current)) rootRef.current = [];
        if (rootProxyRef.current) {
            const rawRoot = proxyToRawRef.current.get(rootProxyRef.current);
            if (rawRoot === rootRef.current) {
                return rootProxyRef.current;
            }
        }
        return getOrCreateProxy(rootRef.current, []);
    }

    if (!rootProxyRef.current) {
        rootProxyRef.current = getOrCreateProxy(rootRef.current, []);
    }

    return rootProxyRef.current;
}

/**
 * @description EasyList export를 노출한다.
 */
function EasyList(initialData = []) {
    return useEasyList(initialData);
}

export default EasyList;
export { useEasyList };
