/**
 * 파일명: Dropdown.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Dropdown UI 컴포넌트 구현
 */
/**
 * 파일명: Dropdown.jsx
 * 설명: 경량 Dropdown 컴포넌트 (EasyList 지원, 접근성 포함)
 * 스타일: 기본값을 모던한 Material 느낌으로 개선 (rounded, elevation, subtle hover)
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
  // 스타일 옵션
  variant = 'outlined', // 'outlined' | 'filled' | 'text'
  size = 'md', // 'sm' | 'md' | 'lg'
  rounded = 'rounded-lg', // tailwind rounded class
  elevation = 'shadow-md', // shadow-sm|md|lg|xl
  buttonClassName = '',
  iconClassName = '',
  selectedItemClassName = 'text-blue-700',
  showCheck = true,
  side = 'bottom',
  align = 'start',
  className = '',
  menuClassName = '',
  itemClassName = '',
  activeClassName = 'bg-gray-100',
  closeOnSelect = true,
  multiSelect = false,
  disabled = false,
}) => {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = typeof openProp === 'boolean' ? openProp : openState;
  const setOpen = (v) => (typeof openProp === 'boolean' ? onOpenChange?.(v) : setOpenState(v));
  const data = useMemo(() => toArray(dataList), [dataList]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const rootRef = useRef(null);
  const effectiveCloseOnSelect = multiSelect ? false : closeOnSelect;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (!data.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => (i + 1) % data.length); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => (i - 1 + data.length) % data.length); }
      if (e.key === 'Enter' && activeIdx >= 0) {
        const item = data[activeIdx];
        // 키보드 Enter도 클릭과 동일하게 처리
        handleItemActivate(item);
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

  // 선택 상태 계산 (EasyList 프록시 지원)
  const selectedItems = [];
  for (const it of data) {
    const sel = it?.get ? it.get('selected') : it?.selected;
    if (sel) selectedItems.push(it);
  }
  const selectedItem = selectedItems.length > 0 ? selectedItems[0] : null;
  let selectedLabel = null;
  if (!multiSelect) {
    selectedLabel = selectedItem
      ? (selectedItem?.get ? selectedItem.get(labelKey) : selectedItem?.[labelKey])
      : null;
  } else if (selectedItems.length === 1) {
    const first = selectedItems[0];
    selectedLabel = first?.get ? first.get(labelKey) : first?.[labelKey];
  } else if (selectedItems.length > 1) {
    selectedLabel = `${selectedItems.length}개 선택됨`;
  }

  const handleItemActivate = (item) => {
    if (!item) return;
    const value = item?.get ? item.get(valueKey) : item?.[valueKey];
    if (dataList?.forAll) {
      dataList.forAll((node) => {
        const nodeValue = node?.get ? node.get(valueKey) : node?.[valueKey];
        const isTarget = String(nodeValue) === String(value);
        if (node?.set) {
          if (multiSelect) {
            node.set('selected', isTarget ? !node.get('selected') : !!node.get('selected'));
          } else {
            node.set('selected', isTarget);
          }
        } else if (node) {
          if (multiSelect) {
            node.selected = isTarget ? !node.selected : !!node.selected;
          } else {
            node.selected = isTarget;
          }
        }
        return node;
      });
    } else if (Array.isArray(dataList)) {
      dataList.forEach((node) => {
        const nodeValue = node?.[valueKey];
        const isTarget = String(nodeValue) === String(value);
        if (!node) return;
        if (multiSelect) {
          node.selected = isTarget ? !node.selected : !!node.selected;
        } else {
          node.selected = isTarget;
        }
      });
    }
    onSelect?.(item);
    if (effectiveCloseOnSelect) setOpen(false);
  };

  // 버튼 스타일 계산 (Material-esque)
  const sizeCls = size === 'sm' ? 'min-w-[140px] px-2.5 py-1.5 text-sm'
                  : size === 'lg' ? 'min-w-[200px] px-4 py-2.5 text-base'
                  : 'min-w-[170px] px-3 py-2 text-sm';
  const variantCls = variant === 'filled'
    ? 'bg-gray-50 border border-transparent hover:bg-gray-100 shadow-inner'
    : variant === 'text'
      ? 'bg-transparent border border-transparent hover:bg-gray-50 shadow-none'
      : 'bg-white border border-gray-300 hover:bg-gray-50 shadow-sm';
  const btnCls = `inline-flex items-center justify-between gap-2 ${sizeCls} ${rounded} ${variantCls} focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${buttonClassName}`.trim();
  const iconCls = `text-gray-500 ${iconClassName}`.trim();

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`.trim()}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : 'false'}
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={btnCls}
      >
        {(() => {
          if (typeof trigger === 'function') {
            return trigger({
              selectedItem,
              selectedItems,
              selectedLabel,
            });
          }
          // 우선순위: 선택 라벨 > 사용자 제공 트리거 노드 > placeholder
          return (selectedLabel ?? trigger ?? placeholder);
        })()}
        <svg width="16" height="16" viewBox="0 0 12 12" aria-hidden className={`${open ? 'rotate-180' : ''} transition-transform ${iconCls}`}>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul role="menu" className={`absolute z-30 min-w-56 bg-white border border-gray-200 ${rounded} ${elevation} ${pos} ${menuClassName} transition ease-out duration-150 transform origin-top-left opacity-100 scale-100`.trim()}>
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
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 text-sm ${isActive || selected ? activeClassName : ''} hover:bg-gray-50 disabled:opacity-50 ${itemClassName}`.trim()}
                  disabled={!!disabledItem}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onFocus={() => setActiveIdx(idx)}
                  onClick={() => {
                    if (disabledItem) return;
                    handleItemActivate(it);
                  }}
                >
                  {/* 체크 아이콘 (선택 시 표시) */}
                  {showCheck && (
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden className={`${selected ? 'opacity-100 text-blue-600' : 'opacity-0'} transition-opacity`}>
                      <path d="M6.5 10.5L3.5 7.5L2.5 8.5L6.5 12.5L13.5 5.5L12.5 4.5L6.5 10.5Z" fill="currentColor" />
                    </svg>
                  )}
                  <span className={`${disabledItem ? 'text-gray-400' : selected ? selectedItemClassName : 'text-gray-800'}`}>{String(label ?? '')}</span>
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
