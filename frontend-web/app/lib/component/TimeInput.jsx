/**
 * 파일명: TimeInput.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: TimeInput UI 컴포넌트 구현
 */
// TimeInput.jsx
// Updated: 2025-09-09
// 한글설명: Purpose: Simple time input with EasyObj binding
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';
import Icon from './Icon';
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko';

const pad2 = (numberValue) => String(numberValue).padStart(2, '0');

const TimeInput = forwardRef(({ 
  dataObj,
  dataKey,
  value: propValue,
  defaultValue = '',
  onChange,
  onValueChange,
  min,
  max,
  step,
  className = '',
  disabled = false,
  readOnly = false,
  placeholder,
  id,
  ...props
}, ref) => {
  const isPropControlled = propValue !== undefined;
  const isData = !!(dataObj && dataKey);

  const [inner, setInner] = useState(defaultValue);
  const [text, setText] = useState(() => (propValue ?? (isData ? getBoundValue(dataObj, dataKey) : inner) ?? ''));
  const [open, setOpen] = useState(false);

  const getExternal = () => {
    if (isPropControlled) return propValue ?? '';
    if (isData) return getBoundValue(dataObj, dataKey) ?? '';
    return inner ?? '';
  };

  useEffect(() => {
    if (isPropControlled) {
      setText(propValue ?? '');
      return;
    }
    if (isData) {
      setText(getBoundValue(dataObj, dataKey) ?? '');
      return;
    }
    setText(inner ?? '');
  }, [propValue, dataObj, dataKey, inner, isData, isPropControlled]);

  const commit = (raw, event) => {
    setText(raw);
    if (!isPropControlled && !isData) setInner(raw);
    if (isData) setBoundValue(dataObj, dataKey, raw);
    const ctx = buildCtx({ dataKey, dataObj, source: 'user', dirty: true, valid: null });
    const evt = event ? { ...event, target: { ...event.target, value: raw } } : { target: { value: raw } };
    fireValueHandlers({ onChange, onValueChange, value: raw, ctx, event: evt });
  };

  const value = getExternal();
  const base = 'block w-full pr-10 pl-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white border';
  const state = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  const inputId = id || (dataKey ? `time_${String(dataKey).replace(/[^a-zA-Z0-9_]+/g, '_')}` : undefined);
  const inputRef = useRef(null);
  const rootRef = useRef(null);

  const interval = Math.max(1, step ?? 30); // 한글설명: seconds step for list granularity (default 30)
  const items = useMemo(() => {
    const options = [];
    for (let secondCursor = 0; secondCursor < 24 * 60 * 60; secondCursor += interval * 60) {
      const hourValue = Math.floor(secondCursor / 3600);
      const minuteValue = Math.floor((secondCursor % 3600) / 60);
      options.push(`${pad2(hourValue)}:${pad2(minuteValue)}`);
    }
    return options;
  }, [interval]);

  useEffect(() => {
    if (!open) return;
    const handler = (event) => { if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false); };
    const esc = (keyboardEvent) => { if (keyboardEvent.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', esc); };
  }, [open]);

  return (
    <div className={`relative ${className}`.trim()} ref={rootRef}>
      <input
        ref={(node) => { inputRef.current = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; }}
        id={inputId}
        type="text"
        className={`${base} ${state}`.trim()}
        value={text}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            const typedValue = event.currentTarget.value;
            if (/^\d{2}:\d{2}$/.test(typedValue)) commit(typedValue, event);
            else setText(value);
            setOpen(false);
          }
        }}
        onBlur={(event) => {
          const typedValue = event.target.value;
          if (/^\d{2}:\d{2}$/.test(typedValue)) commit(typedValue, event);
          else setText(value);
        }}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={false}
        aria-haspopup="listbox"
        aria-expanded={open}
        {...props}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-2 my-auto h-6 w-6 rounded hover:bg-gray-100 text-gray-500 flex items-center justify-center"
        onClick={() => setOpen((previousOpen) => !previousOpen)}
        tabIndex={-1}
        aria-label={COMMON_COMPONENT_LANG_KO.timeInput.openPickerAriaLabel}
        disabled={disabled || readOnly}
      >
        <Icon icon="md:MdAccessTime" className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-40 max-h-64 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg p-1" role="listbox" id={inputId ? `${inputId}_list` : undefined}>
          {items.map((timeOption) => (
            <div
              key={timeOption}
              role="option"
              aria-selected={timeOption === value}
              className={`px-2 py-1 text-sm rounded cursor-pointer hover:bg-blue-50 ${timeOption === value ? 'bg-blue-100' : ''}`}
              onClick={() => {
                commit(timeOption);
                setOpen(false);
              }}
            >
              {timeOption}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

TimeInput.displayName = 'TimeInput';

/**
 * @description TimeInput export를 노출한다.
 */
export default TimeInput;
