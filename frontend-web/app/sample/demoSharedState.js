"use client";
/**
 * 파일명: demo/demoSharedState.js
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 샘플 페이지 간 공유 상태(세션 메모리) 유틸
 */

import { useCallback, useEffect } from "react";
import { useSharedStore } from "@/app/common/store/SharedStore";
import { deepCloneValue } from "@/app/lib/runtime/json";

const cloneValue = (value) => {
  /**
   * @description 샘플 상태 값을 안전하게 깊은 복사한다.
   * @updated 2026-02-23
  */
  if (value == null) return value;
  return deepCloneValue(value, value);
};

/**
 * @description 샘플 공용 상태를 읽고 쓰는 훅을 반환한다.
 * @param {{ stateKey: string, initialValue: any }} params
 */
export const useDemoSharedState = (params) => {
  const { stateKey, initialValue } = params;
  const sharedValue = useSharedStore((state) => state.shared?.[stateKey]);
  const setShared = useSharedStore((state) => state.setShared);

  useEffect(() => {
    /**
     * @description 공유 상태가 비어있으면 초기값으로 1회 채운다.
     * @updated 2026-02-23
     */
    if (sharedValue !== undefined) return;
    setShared({ [stateKey]: cloneValue(initialValue) });
  }, [initialValue, setShared, sharedValue, stateKey]);

  const setValue = useCallback(
    (nextValueOrUpdater) => {
      /**
       * @description 현재 공유 상태를 기준으로 다음 상태를 계산해 저장한다.
       * @updated 2026-02-23
       */
      const currentShared = useSharedStore.getState()?.shared || {};
      const currentValue =
        currentShared[stateKey] === undefined
          ? cloneValue(initialValue)
          : currentShared[stateKey];
      const nextValue =
        typeof nextValueOrUpdater === "function"
          ? nextValueOrUpdater(currentValue)
          : nextValueOrUpdater;
      setShared({ [stateKey]: cloneValue(nextValue) });
    },
    [initialValue, setShared, stateKey],
  );

  const resetValue = useCallback(() => {
    /**
     * @description 공유 상태를 초기값으로 되돌린다.
     * @updated 2026-02-23
     */
    setShared({ [stateKey]: cloneValue(initialValue) });
  }, [initialValue, setShared, stateKey]);

  return {
    value: sharedValue === undefined ? initialValue : sharedValue,
    setValue,
    resetValue,
    isInitialized: sharedValue !== undefined,
  };
};
