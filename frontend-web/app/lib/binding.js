// binding.js
// Updated: 2025-09-09
// Purpose: Common helpers for data binding (EasyObj/EasyList) and change context

const isProxyLike = (obj) => obj && typeof obj === 'object' && (obj.__isProxy || obj.__rawObject);
const getRaw = (obj) => (obj && obj.__rawObject) ? obj.__rawObject : obj;

export function getBoundValue(dataObj, dataKey) {
  if (!dataObj || !dataKey) return undefined;
  // Prefer explicit getter if provided
  if (typeof dataObj.get === 'function') return dataObj.get(dataKey);
  // Dotted path support
  const parts = String(dataKey).split('.');
  let cur = dataObj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function setBoundValue(dataObj, dataKey, value) {
  if (!dataObj || !dataKey) return;
  if (typeof dataObj.set === 'function') return dataObj.set(dataKey, value);
  const parts = String(dataKey).split('.');
  let cur = dataObj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null || typeof cur[p] !== 'object') {
      cur[p] = {};
    }
    cur = cur[p];
  }
  const last = parts[parts.length - 1];
  cur[last] = value;
}

export function buildCtx({ dataKey, dataObj, source = 'user', valid = null, dirty = true }) {
  const raw = getRaw(dataObj);
  const modelType = Array.isArray(raw) ? 'list' : (raw && typeof raw === 'object' ? 'obj' : null);
  return { dataKey, modelType, dirty: !!dirty, valid, source };
}

export function fireValueHandlers({ onChange, onValueChange, value, ctx, event }) {
  // Back-compat: if consumer provided onChange expecting event, pass event with detail
  if (event) {
    try {
      if (!event.detail) event.detail = { value, ctx };
    } catch (e) {
      // some synthetic events may be readonly; ignore
    }
  }
  if (typeof onChange === 'function' && event) onChange(event);
  if (typeof onValueChange === 'function') onValueChange(value, ctx);
}

export default {
  getBoundValue,
  setBoundValue,
  buildCtx,
  fireValueHandlers,
};

