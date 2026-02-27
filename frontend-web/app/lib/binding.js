/**
 * 파일명: binding.js
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 바인딩 유틸 함수
 */
// binding.js
// Updated: 2025-09-09
// 한글설명: Purpose: Common helpers for data binding (EasyObj/EasyList) and change context

/**
 * @description 입력 객체가 EasyObj/EasyList 프록시 래퍼인지 판별
 * 반환값: `__isProxy` 또는 `__rawObject` 메타 필드가 있으면 true.
 * @updated 2026-02-27
 */
const isProxyLike = (obj) => obj && typeof obj === 'object' && (obj.__isProxy || obj.__rawObject);

/**
 * @description 프록시 래퍼 객체에서 원본(raw) 참조를 추출
 * 반환값: `__rawObject`가 있으면 raw, 없으면 입력 객체 자체.
 * @updated 2026-02-27
 */
const getRaw = (obj) => (obj && obj.__rawObject) ? obj.__rawObject : obj;

/**
 * @description 바인딩 객체에서 key 경로 값을 읽는다.
 * 처리 규칙: dataObj.get 우선 사용, 없으면 `a.b.c` dotted path를 순회한다.
 * @updated 2026-02-24
 */
export function getBoundValue(dataObj, dataKey) {
  if (!dataObj || !dataKey) return undefined;
  // 한글설명: Prefer explicit getter if provided
  if (typeof dataObj.get === 'function') return dataObj.get(dataKey);
  // 한글설명: Dotted path support
  const parts = String(dataKey).split('.');
  let cur = dataObj;
  for (const segment of parts) {
    if (cur == null) return undefined;
    cur = cur[segment];
  }
  return cur;
}

/**
 * @description  바인딩 객체의 key 경로 값을 설정한다. 입력/출력 계약을 함께 명시
 * 부작용: 경로 중간 노드가 없으면 객체를 생성하고 마지막 키에 값을 대입한다.
 * @updated 2026-02-24
 */
export function setBoundValue(dataObj, dataKey, value, options = {}) {

  if (!dataObj || !dataKey) return;
  const meta = typeof options === 'object' && options !== null ? options : {};
  if (typeof dataObj.set === 'function') return dataObj.set(dataKey, value, { source: meta.source ?? 'user' });
  const parts = String(dataKey).split('.');
  let cur = dataObj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null || typeof cur[parts[i]] !== 'object') {
      cur[parts[i]] = {};
    }
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
  return value;
}

/**
 * @description  값 변경 컨텍스트를 구성한다. 입력/출력 계약을 함께 명시
 * 반환값: `{ dataKey, modelType, dirty, valid, source }` 형태의 공통 ctx 객체.
 * @updated 2026-02-24
 */
export function buildCtx({ dataKey, dataObj, source = 'user', valid = null, dirty = true }) {

  const raw = getRaw(dataObj);
  let modelType = null;
  if (Array.isArray(raw)) {
    modelType = 'list';
  } else if (raw && typeof raw === 'object') {
    modelType = 'obj';
  }
  return { dataKey, modelType, dirty: !!dirty, valid, source };
}

/**
 * @description onChange/onValueChange 핸들러에 공통 이벤트 규약을 전달
 * 처리 규칙: event.detail에 value/ctx를 주입하고 onChange(event) → onValueChange(value, ctx) 순으로 호출한다.
 * @updated 2026-02-24
 */
export function fireValueHandlers({ onChange, onValueChange, value, ctx, event }) {

  // 한글설명: Back-compat: if consumer provided onChange expecting event, pass event with detail
  if (event) {
    try {
      if (!Object.prototype.hasOwnProperty.call(event, 'detail') || event.detail == null) {
        Object.defineProperty(event, 'detail', { value: { value, ctx }, configurable: true, writable: true });
      } else if (typeof event.detail === 'object') {
        event.detail.value = value;
        event.detail.ctx = ctx;
      }
    } catch (error) {
      try {
        event.detail = { value, ctx };
      } catch (_) {
        // 한글설명: readonly detail; ignore
      }
    }
  }
  if (typeof onChange === 'function' && event) onChange(event);
  if (typeof onValueChange === 'function') onValueChange(value, ctx);
}

const bindingUtils = {
  getBoundValue,
  setBoundValue,
  buildCtx,
  fireValueHandlers,
};

/**
 * @description 바인딩 유틸 묶음 객체(bindingUtils)를 default export로 노출
 * 반환값: get/set/ctx/handler 함수를 담은 bindingUtils.
 */
export default bindingUtils
