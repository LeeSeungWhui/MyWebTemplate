import { useState, useRef, useCallback } from 'react';

function useEasyObj(initialData = {}) {
    const [, forceUpdate] = useState({});
    const dataRef = useRef(initialData);

    const deepCopy = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;

        // 프록시 객체인 경우 원본 객체에 접근
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
                if (prop === 'forAll') {
                    return (callback) => {
                        Object.entries(obj).forEach(([key, value]) => {
                            callback(value, key, obj);
                        });
                        forceUpdate({});
                    };
                }

                const value = Reflect.get(obj, prop);
                if (typeof value === 'object' && value !== null) {
                    return createProxy(value);
                }
                return value;
            },
            set(obj, prop, value) {
                Reflect.set(obj, prop, value);
                forceUpdate({});
                return true;
            },
            deleteProperty(obj, prop) {
                Reflect.deleteProperty(obj, prop);
                forceUpdate({});
                return true;
            }
        };

        return new Proxy(target, handler);
    }, []);

    const proxyObject = useRef(null);
    if (!proxyObject.current) {
        proxyObject.current = createProxy(dataRef.current);
    }

    return proxyObject.current;
}

function EasyObj(initialData = {}) {
    return useEasyObj(initialData);
}

export default EasyObj;