/**
 * 파일명: Dropdown.jsx
 * 설명: 경량 Dropdown 컴포넌트 (EasyList 지원, 접근성 포함)
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';

const isListLike = (list) => !!list && (Array.isArray(list) || typeof list.forAll === 'function' || typeof list.length === 'number');
const toArray = (list) => {
  if (!list) return [];
  if (Array.isArray(list)) return list;
  if (typeof list.forAll === 'function') {
    const arr = [];
    list.forAll((item) => arr.push(item));
    return arr;
  }
  // fallback (proxy array-like)
  try { return Array.from(list); } catch { return []; }
};

const Dropdown = ({
  dataList,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  trigger,
  labelKey = 'label',
  valueKey = 'value',
  placeholder = '선택',
  side = 'bottom',
  align = 'start',
  className = '',
  menuClassName = '',
  itemClassName = '',
  activeClassName = 'bg-gray-100',
  closeOnSelect = true,
  disabled = false,
}) => {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = typeof openProp === 'boolean' ? openProp : openState;
  const setOpen = (v) => (typeof openProp === 'boolean' ? onOpenChange?.(v) : setOpenState(v));
  const data = useMemo(() => toArray(dataList), [dataList]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (!data.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => (i + 1) % data.length); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => (i - 1 + data.length) % data.length); }
      if (e.key === 'Enter' && activeIdx >= 0) {
        const item = data[activeIdx];
        onSelect?.(item);
        if (closeOnSelect) setOpen(false);
      }
    };
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClickOutside); };
  }, [open, data, activeIdx, closeOnSelect]);

  const pos = `${side === 'bottom' ? 'top-full mt-2' : side === 'top' ? 'bottom-full mb-2' : ''} ${align === 'start' ? 'left-0' : align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2'}`.trim();
  // derive selected each render (data contains proxies so selected reflects changes)
  let selectedItem = null;
  for (const it of data) {
    const sel = it?.get ? it.get('selected') : it?.selected;
    if (sel) { selectedItem = it; break; }
  }
  const selectedLabel = selectedItem ? (selectedItem?.get ? selectedItem.get(labelKey) : selectedItem?.[labelKey]) : null;

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`.trim()}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : 'false'}
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className="inline-flex items-center gap-1 px-3 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
      >
        {typeof trigger === 'function' ? trigger({ selectedItem, selectedLabel }) : (trigger ?? (selectedLabel ?? placeholder))}
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className={`${open ? 'rotate-180' : ''} transition-transform`}>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul role="menu" className={`absolute z-30 min-w-40 bg-white border rounded shadow ${pos} ${menuClassName}`.trim()}>
          {data.map((it, idx) => {
            const label = it?.get ? it.get(labelKey) : it?.[labelKey];
            const value = it?.get ? it.get(valueKey) : it?.[valueKey];
            const selected = it?.get ? !!it.get('selected') : !!it?.selected;
            const disabledItem = it?.get ? it.get('disabled') : it?.disabled;
            const isActive = idx === activeIdx;
            return (
              <li key={(value ?? idx)} role="none">
                <button
                  type="button"
                  role="menuitem"
                  aria-disabled={disabledItem ? 'true' : 'false'}
                  aria-checked={selected ? 'true' : 'false'}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${isActive || selected ? activeClassName : ''} disabled:opacity-50 ${itemClassName}`.trim()}
                  disabled={!!disabledItem}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onFocus={() => setActiveIdx(idx)}
                  onClick={() => {
                    if (disabledItem) return;
                    // update selection model on dataList (single-select)
                    if (dataList?.forAll) dataList.forAll((node) => { const v = node?.get ? node.get(valueKey) : node?.[valueKey]; if (node?.set) node.set('selected', String(v) === String(value)); else node.selected = String(v) === String(value); return node; });
                    else if (Array.isArray(dataList)) dataList.forEach((node) => { const v = node?.[valueKey]; node.selected = String(v) === String(value); });
                    onSelect?.(it);
                    if (closeOnSelect) setOpen(false);
                  }}
                >
                  {String(label ?? '')}
                </button>
              </li>
            );
          })}
          {data.length === 0 && (
            <li role="none"><div className="px-3 py-2 text-sm text-gray-500">항목 없음</div></li>
          )}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
