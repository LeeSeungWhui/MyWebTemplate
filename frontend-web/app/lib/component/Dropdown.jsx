/**
 * 파일명: Dropdown.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-26
 * 설명: 경량 Dropdown 컴포넌트 (EasyList 지원, 접근성 포함)
 */
import React, { useEffect, useRef, useState } from 'react';
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko';

const toArray = (list) => {
  if (!list) return [];
  if (Array.isArray(list)) return list;
  if (typeof list.forAll === 'function') {
    const resultList = [];
    list.forAll((item) => resultList.push(item));
    return resultList;
  }
  try {
    return Array.from(list);
  } catch {
    return [];
  }
};

const resolvePositionClass = (side, align) => {
  let sideClassName = '';
  if (side === 'bottom') sideClassName = 'top-full mt-2';
  else if (side === 'top') sideClassName = 'bottom-full mb-2';

  let alignClassName = 'left-1/2 -translate-x-1/2';
  if (align === 'start') alignClassName = 'left-0';
  else if (align === 'end') alignClassName = 'right-0';

  return `${sideClassName} ${alignClassName}`.trim();
};

const resolveVariantClass = (variant) => {
  if (variant === 'filled') {
    return 'bg-gray-50 border border-transparent hover:bg-gray-100 shadow-inner';
  }
  if (variant === 'text') {
    return 'bg-transparent border border-transparent hover:bg-gray-50 shadow-none';
  }
  return 'bg-white border border-gray-300 hover:bg-gray-50 shadow-sm';
};

const resolveSelectedLabel = ({ multiSelect, selectedItem, selectedItems, labelKey }) => {
  if (!multiSelect) {
    if (!selectedItem) return null;
    if (selectedItem?.get) return selectedItem.get(labelKey);
    return selectedItem?.[labelKey];
  }

  if (selectedItems.length === 1) {
    if (selectedItems[0]?.get) return selectedItems[0].get(labelKey);
    return selectedItems[0]?.[labelKey];
  }

  if (selectedItems.length > 1) {
    return `${selectedItems.length}${COMMON_COMPONENT_LANG_KO.dropdown.multiSelectedSuffix}`;
  }

  return null;
};

const resolveItemLabelClassName = ({ disabledItem, selected, selectedItemClassName }) => {
  if (disabledItem) return 'text-gray-400';
  if (selected) return selectedItemClassName;
  return 'text-gray-800';
};

/**
 * @description 단일/다중 선택 Dropdown UI를 렌더링한다.
 * @param {Object} props
 * @returns {JSX.Element}
 */
const Dropdown = ({
  dataList,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onSelect,
  trigger,
  labelKey = 'label',
  valueKey = 'value',
  placeholder = COMMON_COMPONENT_LANG_KO.dropdown.placeholder,
  variant = 'outlined',
  size = 'md',
  rounded = 'rounded-lg',
  elevation = 'shadow-md',
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
  const setOpen = (nextOpen) => {
    if (typeof openProp === 'boolean') {
      onOpenChange?.(nextOpen);
      return;
    }
    setOpenState(nextOpen);
  };
  const data = toArray(dataList);
  const [activeIdx, setActiveIdx] = useState(-1);
  const rootRef = useRef(null);
  const effectiveCloseOnSelect = multiSelect ? false : closeOnSelect;

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

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (!data.length) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIdx((prevIdx) => (prevIdx + 1) % data.length);
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIdx((prevIdx) => (prevIdx - 1 + data.length) % data.length);
      }
      if (event.key === 'Enter' && activeIdx >= 0) {
        handleItemActivate(data[activeIdx]);
      }
    };

    const onClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [open, data, activeIdx]);

  const positionClassName = resolvePositionClass(side, align);

  const selectedItems = [];
  for (const item of data) {
    const isSelected = item?.get ? item.get('selected') : item?.selected;
    if (isSelected) selectedItems.push(item);
  }
  const selectedItem = selectedItems.length > 0 ? selectedItems[0] : null;
  const selectedLabel = resolveSelectedLabel({
    multiSelect,
    selectedItem,
    selectedItems,
    labelKey,
  });

  let sizeClassName = 'min-w-[170px] px-3 py-2 text-sm';
  if (size === 'sm') {
    sizeClassName = 'min-w-[140px] px-2.5 py-1.5 text-sm';
  } else if (size === 'lg') {
    sizeClassName = 'min-w-[200px] px-4 py-2.5 text-base';
  }
  const variantClassName = resolveVariantClass(variant);
  const buttonClass = `inline-flex items-center justify-between gap-2 ${sizeClassName} ${rounded} ${variantClassName} focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${buttonClassName}`.trim();
  const iconClass = `text-gray-500 ${iconClassName}`.trim();

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`.trim()}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : 'false'}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen(!open);
        }}
        className={buttonClass}
      >
        {(() => {
          if (typeof trigger === 'function') {
            return trigger({
              selectedItem,
              selectedItems,
              selectedLabel,
            });
          }
          return selectedLabel ?? trigger ?? placeholder;
        })()}
        <svg width="16" height="16" viewBox="0 0 12 12" aria-hidden className={`${open ? 'rotate-180' : ''} transition-transform ${iconClass}`}>
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul role="menu" className={`absolute z-30 min-w-56 bg-white border border-gray-200 ${rounded} ${elevation} ${positionClassName} ${menuClassName} transition ease-out duration-150 transform origin-top-left opacity-100 scale-100`.trim()}>
          {data.map((item, itemIdx) => {
            const label = item?.get ? item.get(labelKey) : item?.[labelKey];
            const value = item?.get ? item.get(valueKey) : item?.[valueKey];
            const selected = item?.get ? !!item.get('selected') : !!item?.selected;
            const disabledItem = item?.get ? item.get('disabled') : item?.disabled;
            const isActive = itemIdx === activeIdx;
            const itemLabelClassName = resolveItemLabelClassName({
              disabledItem,
              selected,
              selectedItemClassName,
            });
            return (
              <li key={value ?? itemIdx} role="none">
                <button
                  type="button"
                  role="menuitem"
                  aria-disabled={disabledItem ? 'true' : 'false'}
                  aria-checked={selected ? 'true' : 'false'}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 text-sm ${isActive || selected ? activeClassName : ''} hover:bg-gray-50 disabled:opacity-50 ${itemClassName}`.trim()}
                  disabled={!!disabledItem}
                  onMouseEnter={() => setActiveIdx(itemIdx)}
                  onFocus={() => setActiveIdx(itemIdx)}
                  onClick={() => {
                    if (disabledItem) return;
                    handleItemActivate(item);
                  }}
                >
                  {showCheck && (
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden className={`${selected ? 'opacity-100 text-blue-600' : 'opacity-0'} transition-opacity`}>
                      <path d="M6.5 10.5L3.5 7.5L2.5 8.5L6.5 12.5L13.5 5.5L12.5 4.5L6.5 10.5Z" fill="currentColor" />
                    </svg>
                  )}
                  <span className={itemLabelClassName}>{String(label ?? '')}</span>
                </button>
              </li>
            );
          })}
          {data.length === 0 && (
            <li role="none"><div className="px-3 py-2 text-sm text-gray-500">{COMMON_COMPONENT_LANG_KO.dropdown.emptyItem}</div></li>
          )}
        </ul>
      )}
    </div>
  );
};

/**
 * @description Dropdown 컴포넌트 엔트리를 export 한다.
 */
export default Dropdown;
