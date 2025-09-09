// Combobox.jsx
// Updated: 2025-09-09
// Purpose: Simple filterable combobox with EasyObj binding
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';

const normalizeItems = (items) => (items || []).map((it) =>
  typeof it === 'string' || typeof it === 'number'
    ? { value: String(it), label: String(it) }
    : { value: String(it.value), label: String(it.label ?? it.value) }
);

// Hangul initial-consonant (초성) extraction for fuzzy search
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const H_BASE = 0xAC00, H_LAST = 0xD7A3;
const getChosung = (str) => {
  if (!str) return '';
  let out = '';
  for (const ch of String(str)) {
    const code = ch.charCodeAt(0);
    if (code >= H_BASE && code <= H_LAST) {
      const idx = Math.floor((code - H_BASE) / 588);
      out += CHO[idx] || ch;
    } else {
      out += ch;
    }
  }
  return out;
};

const normalize = (s) => String(s || '').toLowerCase().replace(/\s+/g, '');

const Combobox = forwardRef(({ 
  dataObj,
  dataKey,
  value: propValue,
  defaultValue = '',
  onChange,
  onValueChange,
  items = [],
  placeholder,
  className = '',
  disabled = false,
  id,
  filterable = true,
  noResultsText = '결과 없음',
  ...props
}, ref) => {
  const isPropControlled = propValue !== undefined;
  const isData = !!(dataObj && dataKey);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [inner, setInner] = useState(defaultValue);
  const listRef = useRef(null);

  const options = useMemo(() => normalizeItems(items), [items]);
  const normOptions = useMemo(() => options.map(o => ({
    ...o,
    _labelLower: normalize(o.label),
    _labelInit: normalize(getChosung(o.label)),
  })), [options]);
  const value = isPropControlled ? (propValue ?? '') : (isData ? (getBoundValue(dataObj, dataKey) ?? '') : (inner ?? ''));
  const selected = options.find((o) => o.value === String(value));

  const filtered = filterable && query
    ? normOptions.filter((o) => {
        const q = normalize(query);
        const qInit = normalize(getChosung(query));
        const onlyCho = /^[ㄱ-ㅎ]+$/.test(query);
        if (onlyCho) return o._labelInit.includes(q);
        // 일반 문자열 포함 + 초성 변환 매치 둘 다 허용
        return o._labelLower.includes(q) || o._labelInit.includes(qInit);
      })
    : normOptions;

  const rootRef = useRef(null);
  useEffect(() => { if (!open) setQuery(''); }, [open]);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const commit = (next, event) => {
    if (!isPropControlled && !isData) setInner(next);
    if (isData) setBoundValue(dataObj, dataKey, next);
    const ctx = buildCtx({ dataKey, dataObj, source: 'user', dirty: true, valid: null });
    const evt = event ? { ...event, target: { ...event.target, value: next } } : { target: { value: next } };
    fireValueHandlers({ onChange, onValueChange, value: next, ctx, event: evt });
  };

  const inputId = id || (dataKey ? `cb_${String(dataKey).replace(/[^a-zA-Z0-9_]+/g, '_')}` : undefined);

  return (
    <div className={`relative ${className}`.trim()} ref={rootRef} {...props}>
      <button
        type="button"
        id={inputId}
        className="w-full text-left px-3 py-2 text-sm rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={inputId ? `${inputId}_list` : undefined}
        disabled={disabled}
        ref={ref}
      >
        {selected ? selected.label : (placeholder || '선택하세요')}
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          {filterable && (
            <div className="p-2 border-b border-gray-200">
              <input
                autoFocus
                className="w-full px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="검색..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}
          <ul
            id={inputId ? `${inputId}_list` : undefined}
            role="listbox"
            className="max-h-60 overflow-auto py-1"
            ref={listRef}
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500 select-none">{noResultsText}</li>
            )}
            {filtered.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === String(value)}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${opt.value === String(value) ? 'bg-blue-100' : ''}`}
                onClick={() => { commit(opt.value); setOpen(false); }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

Combobox.displayName = 'Combobox';

export default Combobox;
