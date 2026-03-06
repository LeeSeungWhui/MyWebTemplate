/**
 * 파일명: apiResult.js
 * 작성자: LSH
 * 갱신일: 2026-03-05
 * 설명: apiJSON 표준 응답(payload.result) 타입별 EasyObj/EasyList 동기화 유틸
 */

const RESULT_TYPE = {
  OBJ: "obj",
  LIST: "list",
  OTHER: "other",
};

/**
 * @description 값이 plain object인지 판별
 * 처리 규칙: null/배열 제외 object 타입만 true 반환.
 * @param {unknown} value
 * @returns {boolean}
 */
const isPlainObject = (value) => (
  Boolean(value)
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
  if (Array.isArray(payload?.result)) {
    apiList?.copy?.(payload.result);
    return {
      resultType: RESULT_TYPE.LIST,
      result: payload.result,
    };
  }
  if (isPlainObject(payload?.result)) {
    apiObj?.copy?.(payload.result);
    return {
      resultType: RESULT_TYPE.OBJ,
      result: payload.result,
    };
  }
  return {
    resultType: RESULT_TYPE.OTHER,
    result: payload?.result,
  };
};

export default syncApiResult;
