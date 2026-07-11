/**
 * 파일명: json.js
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: JSON 파싱/복사 공통 유틸
 */

export const parseJsonText = (jsonText, defaultValue = null) => {
  if (typeof jsonText !== "string") return defaultValue;
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    return defaultValue;
  }
};

/**
 * @description JSON 호환 객체를 깊은 복사하고 실패 시 fallback을 반환. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 */
export const deepCloneValue = (targetValue, defaultValue = targetValue) => {
  if (targetValue == null) return targetValue;
  if (typeof globalThis.structuredClone === "function") {
    try {
      return globalThis.structuredClone(targetValue);
    } catch (error) {

    }
  }
  try {
    const jsonText = JSON.stringify(targetValue);
    return parseJsonText(jsonText, defaultValue);
  } catch (error) {
    return defaultValue;
  }
};
