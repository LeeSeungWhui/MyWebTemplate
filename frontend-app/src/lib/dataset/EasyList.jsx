import { useState, useRef, useCallback } from 'react';

function useEasyList(initialData = []) {
    const [, forceUpdate] = useState({});
    const dataRef = useRef(initialData);

    const createProxy = useCallback((target) => {
        const handler = {
            get(obj, prop) {
                if (prop === '__isProxy') return true;
                if (prop === '__rawObject') return obj;

                // 배열 메서드 래핑
                if (prop === 'push') {
                    return (...items) => {
                        const result = obj.push(...items);
                        requestAnimationFrame(() => forceUpdate({}));
                        return result;
                    };
                }
                if (prop === 'pop') {
                    return () => {
                        const result = obj.pop();
                        requestAnimationFrame(() => forceUpdate({}));
                        return result;
                    };
                }
                if (prop === 'shift') {
                    return () => {
                        const result = obj.shift();
                        requestAnimationFrame(() => forceUpdate({}));
                        return result;
                    };
                }
                if (prop === 'unshift') {
                    return (...items) => {
                        const result = obj.unshift(...items);
                        requestAnimationFrame(() => forceUpdate({}));
                        return result;
                    };
                }
                if (prop === 'splice') {
                    return (start, deleteCount, ...items) => {
                        const result = obj.splice(start, deleteCount, ...items);
                        requestAnimationFrame(() => forceUpdate({}));
                        return result;
                    };
                }
                if (prop === 'sort') {
                    return (compareFn) => {
                        const result = obj.sort(compareFn);
                        requestAnimationFrame(() => forceUpdate({}));
                        return result;
                    };
                }
                if (prop === 'reverse') {
                    return () => {
                        const result = obj.reverse();
                        requestAnimationFrame(() => forceUpdate({}));
                        return result;
                    };
                }

                // 유틸리티 메서드
                if (prop === 'forAll') {
                    return (callback) => {
                        obj.forEach((item, index) => {
                            if (typeof item === 'object' && item !== null) {
                                // 객체가 아직 Proxy가 아니면 만들어주기
                                if (!item.__isProxy) {
                                    obj[index] = createProxy(item);
                                }
                                callback(obj[index], index);
                            }
                        });
                        requestAnimationFrame(() => forceUpdate({}));
                    };
                }

                // 여기! 배열의 요소가 객체면 Proxy로 감싸기
                const value = Reflect.get(obj, prop);
                if (typeof value === 'object' && value !== null && !value.__isProxy) {
                    if (Array.isArray(obj) && !isNaN(prop)) {  // 배열의 인덱스인 경우
                        Reflect.set(obj, prop, createProxy(value));
                        return Reflect.get(obj, prop);
                    }
                }

                return value;
            },
            set(obj, prop, value) {
                Reflect.set(obj, prop, value);
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

function EasyList(initialData = []) {
    return useEasyList(initialData);
}
export default EasyList;