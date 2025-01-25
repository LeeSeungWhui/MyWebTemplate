import { useState, useRef, useCallback } from 'react';
function useEasyList(initialData = []) {
    const [, forceUpdate] = useState({});
    const dataRef = useRef(Array.isArray(initialData) ? initialData : []);

    const createProxy = useCallback((target) => {
        const handler = {
            get(obj, prop) {
                if (prop === 'forAll') {
                    return function (callback) {
                        obj.forEach((item, index, array) => {
                            callback(item, index, array);
                        });
                        forceUpdate({});
                    };
                }

                if (prop === 'copy') {
                    return function (newData) {
                        if (Array.isArray(newData)) {
                            obj.length = 0;
                            obj.push(...newData);
                            forceUpdate({});
                        } else {
                            console.error('copy method expects an array as argument');
                        }
                    };
                }

                if (typeof prop === 'string') {
                    const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
                    if (arrayMethods.includes(prop)) {
                        return function (...args) {
                            const result = Array.prototype[prop].apply(obj, args);
                            forceUpdate({});
                            return result;
                        };
                    }
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

    const proxyArray = useRef(null);
    if (!proxyArray.current) {
        proxyArray.current = createProxy(dataRef.current);
    }
    return proxyArray.current;
}

function EasyList(initialData = []) {
    return useEasyList(initialData);
}
export default EasyList;