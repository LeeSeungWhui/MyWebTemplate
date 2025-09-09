// Combobox.jsx
// Updated: 2025-09-09
// Purpose: Filterable combobox with EasyList(dataList) selection model, multi-select, 초성검색, select-all
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

// Hangul initial-consonant (초성) extraction
const CHO = ['\u3131','\u3132','\u3134','\u3137','\u3138','\u3139','\u3141','\u3142','\u3143','\u3145','\u3146','\u3147','\u3148','\u3149','\u314A','\u314B','\u314C','\u314D','\u314E'];
const H_BASE = 0xAC00, H_LAST = 0xD7A3;
const getChosung = (str) => {
  if (!str) return '';
  let out = '';
  for (const ch of String(str)) {
    const code = ch.charCodeAt(0);
    if (code >= H_BASE && code <= H_LAST) {
      const idx = Math.floor((code - H_BASE) / 588);
      out += CHO[idx] || ch;
    } else out += ch;
  }
  return out;
};

const normalize = (s) => String(s || '').toLowerCase().replace(/\s+/g, '');

const toOptionsFromDataList = (list, valueKey, textKey) => (list || []).map((it) => ({
  raw: it,
  value: String(it?.[valueKey] ?? ''),
  label: String(it?.[textKey] ?? ''),
  selected: !!it?.selected,
  placeholder: !!it?.placeholder,
}));

const Combobox = forwardRef(({ 
  dataList = [],
  valueKey = 'value',
  textKey = 'text',
  value: propValue,
  defaultValue = '',
  onChange,
  onValueChange,
  placeholder,
  className = '',
  disabled = false,
  id,
  filterable = true,
  noResultsText = '결과 없음',
  multi = false,
  multiSummary = false,
  summaryText = '{count}개 선택',
  showSelectAll = false,
  selectAllText = '전체 선택',
  clearAllText = '전체 해제',
  ...props
}, ref) => {
  const isPropControlled = propValue !== undefined;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [inner, setInner] = useState(defaultValue);
  const [rev, setRev] = useState(0);
  const listRef = useRef(null);
  const rootRef = useRef(null);

  const options = toOptionsFromDataList(dataList, valueKey, textKey);
  const normOptions = useMemo(() => options.map(o => ({
    ...o,
    _labelLower: normalize(o.label),
    _labelInit: normalize(getChosung(o.label)),
  })), [dataList, valueKey, textKey, rev]);

  const selectedFromList = options.filter(o => o.selected);
  const value = isPropControlled
    ? (propValue ?? (multi ? [] : ''))
    : (multi ? selectedFromList.map(o => o.value) : (selectedFromList[0]?.value ?? (inner ?? '')));
  const selected = multi ? selectedFromList : options.find(o => o.value === String(value));

  const filtered = filterable && query
    ? normOptions.filter((o) => {
        const q = normalize(query);
        const qInit = normalize(getChosung(query));
        const onlyCho = /^[\u3131-\u314E]+$/.test(query);
        if (onlyCho) return o._labelInit.includes(q);
        return o._labelLower.includes(q) || o._labelInit.includes(qInit);
      })
    : normOptions;

  const selectableOptions = options.filter(o => !o.placeholder);
  const allSelected = multi && selectableOptions.length > 0 && selectedFromList.length >= selectableOptions.length;

  useEffect(() => { if (!open) setQuery(''); }, [open]);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', esc); };
  }, [open]);

  const commit = (next, event) => {
    let out = next;
    if (multi) {
      const nextSet = new Set(Array.isArray(next) ? next.map(String) : []);
      if (dataList?.forAll) dataList.forAll((it) => { it.selected = nextSet.has(String(it[valueKey])); return it; });
      else dataList.forEach((it) => { it.selected = nextSet.has(String(it[valueKey])); });
      out = Array.from(nextSet);
    } else {
      if (dataList?.forAll) dataList.forAll((it) => { it.selected = String(it[valueKey]) === String(next); return it; });
      else dataList.forEach((it) => { it.selected = String(it[valueKey]) === String(next); });
      out = String(next);
    }
    if (!isPropControlled && !multi) setInner(out);
    const evt = event ? { ...event, target: { ...event.target, value: out } } : { target: { value: out } };
    if (typeof onChange === 'function') onChange(evt);
    if (typeof onValueChange === 'function') onValueChange(out);
    setRev((v) => v + 1);
  };

  const inputId = id;

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
        {(() => {
          if (multi) {
            const count = (selected || []).length;
            if (count === 0) return (placeholder || '선택하세요');
            if (multiSummary) {
              const text = summaryText.replace('{count}', String(count));
              return <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5">{text}</span>;
            }
            const labels = (selected || []).map(o => o.label);
            return labels.join(', ');
          }
          return selected ? selected.label : (placeholder || options.find(o => o.placeholder)?.label || '선택하세요');
        })()}
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          {(multi && showSelectAll) && (
            <div className="px-3 py-2 flex items-center justify-between text-sm border-b border-gray-200">
              <span className="text-gray-700">{allSelected ? clearAllText : selectAllText}</span>
              <button
                type="button"
                className="px-2 py-0.5 text-xs rounded border border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  if (allSelected) commit([]); else commit(selectableOptions.map(o => o.value));
                }}
              >
                {allSelected ? '해제' : '전체'}
              </button>
            </div>
          )}
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
                aria-selected={multi ? (selected?.some?.(s => s.value === opt.value)) : (opt.value === String(value))}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${multi ? (selected?.some?.(s => s.value === opt.value) ? 'bg-blue-100' : '') : (opt.value === String(value) ? 'bg-blue-100' : '')}`}
                onClick={() => {
                  if (multi) {
                    const cur = new Set((selected || []).map(s => s.value));
                    if (cur.has(opt.value)) cur.delete(opt.value); else cur.add(opt.value);
                    commit(Array.from(cur));
                  } else {
                    commit(opt.value);
                    setOpen(false);
                  }
                }}
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

