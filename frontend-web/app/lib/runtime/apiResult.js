/**
 * 파일명: apiResult.js
 * 작성자: Codex
 * 갱신일: 2026-02-28
 * 설명: apiJSON 표준 응답(payload.result) 타입별 EasyObj/EasyList 동기화 유틸
 */

/**
 * @description 값이 plain object인지 판별
 * 처리 규칙: null/배열 제외 object 타입만 true 반환.
 * @param {unknown} value
 * @returns {boolean}
 */
const isPlainObject = (value) => (
  !!value
  && typeof value === "object"
  && !Array.isArray(value)
);

/**
 * @description payload.result 타입에 따라 EasyObj/EasyList를 동기화
 * 처리 규칙: result가 object면 apiObj.copy, 배열이면 apiList.copy를 실행한다.
 * @param {Object} params
 * @param {Object} params.payload
 * @param {Object} [params.apiObj]
 * @param {Object} [params.apiList]
 * @returns {{resultType:"obj"|"list"|"other", result:unknown}}
 */
export const syncApiResult = ({
  payload,
  apiObj,
  apiList,
} = {}) => {
  const result = payload?.result;
  if (Array.isArray(result)) {
    apiList?.copy?.(result);
    return {
      resultType: "list",
      result,
    };
  }
  if (isPlainObject(result)) {
    apiObj?.copy?.(result);
    return {
      resultType: "obj",
      result,
    };
  }
  return {
    resultType: "other",
    result,
  };
};

export default syncApiResult;

