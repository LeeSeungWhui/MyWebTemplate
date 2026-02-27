"use client";
/**
 * 파일명: sample/demoSharedState.js
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 샘플 페이지 간 공유 상태(세션 메모리) 유틸
 */

import { useCallback, useEffect } from "react";
import { useSharedData } from "@/app/common/store/SharedStore";
import { deepCloneValue } from "@/app/lib/runtime/json";

/**
 * @description 샘플 상태 값을 안전하게 깊은 복사
 * @returns {any}
 * @updated 2026-02-27
 */
const cloneValue = (value) => {
  if (value == null) return value;
  return deepCloneValue(value, value);
};

/**
 * @description 샘플 공용 상태를 읽고 쓰는 훅을 반환. 입력/출력 계약을 함께 명시
 * @param {{ stateKey: string, initialValue: any }} params
 * @returns {{ value: any, setValue: (nextValueOrUpdater: any) => void, resetValue: () => void, isInitialized: boolean }}
 */
export const useDemoSharedState = ({ stateKey, initialValue }) => {

  const { shared, setShared } = useSharedData();
  const sharedValue = shared?.[stateKey];

  useEffect(() => {
    /**
     * @description 공유 상태 미존재 시 초기값 1회 채움
     * @updated 2026-02-23
     */
    if (sharedValue !== undefined) return;
    setShared({ [stateKey]: cloneValue(initialValue) });
  }, [initialValue, setShared, sharedValue, stateKey]);

  const setValue = useCallback(
    (nextValueOrUpdater) => {
      /**
       * @description 현재 공유 상태를 기준으로 다음 상태를 계산해 저장
       * @updated 2026-02-23
       */
      const currentValue =
        sharedValue === undefined
          ? cloneValue(initialValue)
          : sharedValue;
      const nextValue =
        typeof nextValueOrUpdater === "function"
          ? nextValueOrUpdater(currentValue)
          : nextValueOrUpdater;
      setShared({ [stateKey]: cloneValue(nextValue) });
    },
    [initialValue, setShared, sharedValue, stateKey],
  );

  const resetValue = useCallback(() => {
    /**
     * @description 공유 상태 초기값 복원
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
