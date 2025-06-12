import { useState, useRef, useCallback } from 'react';

function useEasyObj(initialData = {}) {
    const [, forceUpdate] = useState({});
    const dataRef = useRef(initialData);

    const deepCopy = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;
        const rawObj = obj.__isProxy ? obj.__rawObject : obj;

        let copy = Array.isArray(rawObj) ? [] : {};
        for (let key in rawObj) {
            if (Object.prototype.hasOwnProperty.call(rawObj, key)) {
                copy[key] = deepCopy(rawObj[key]);
            }
        }
        return copy;
    };

    const createProxy = useCallback((target) => {
        const handler = {
            get(obj, prop) {
                if (prop === '__isProxy') return true;
                if (prop === '__rawObject') return obj;
                if (prop === 'copy') {
                    return (sourceObj) => {
                        Object.keys(obj).forEach(key => delete obj[key]);
                        Object.entries(sourceObj).forEach(([key, value]) => obj[key] = value);
                        forceUpdate({});
                    };
                }
                if (prop === 'deepCopy') {
                    return (sourceObj) => {
                        const copiedObj = deepCopy(sourceObj);
                        Object.keys(obj).forEach(key => delete obj[key]);
                        Object.entries(copiedObj).forEach(([key, value]) => obj[key] = value);
                        forceUpdate({});
                    };
                }
                if (prop === 'toString') {
                    return () => JSON.stringify(obj);
                }

                const value = Reflect.get(obj, prop);
                if (typeof value === 'object' && value !== null && !value.__isProxy) {
                    Reflect.set(obj, prop, createProxy(value));
                    return Reflect.get(obj, prop);
                }

                return Reflect.get(obj, prop);
            },
            set(obj, prop, value) {
                Reflect.set(obj, prop, value);
                // React Native의 경우 비동기 업데이트를 더 잘 처리하기 위해 
                // requestAnimationFrame 사용
                requestAnimationFrame(() => forceUpdate({}));
                return true;
            },
            deleteProperty(obj, prop) {
                const result = Reflect.deleteProperty(obj, prop);
                requestAnimationFrame(() => forceUpdate({}));
                return result;
            }
        };

        return new Proxy(target, handler);
    }, []);

    if (!dataRef.current.__isProxy) {
        dataRef.current = createProxy(dataRef.current);
    }

    return dataRef.current;
}

function EasyObj(initialData = {}) {
    return useEasyObj(initialData);
}

export default EasyObj;