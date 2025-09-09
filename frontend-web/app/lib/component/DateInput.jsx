// DateInput.jsx
// Updated: 2025-09-09
// Purpose: Simple date input with EasyObj binding
import { forwardRef, useEffect, useRef, useState } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';

const DateInput = forwardRef(({ 
  dataObj,
  dataKey,
  value: propValue,
  defaultValue = '',
  onChange,
  onValueChange,
  min,
  max,
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

  const getExternal = () => {
    if (isPropControlled) return propValue ?? '';
    if (isData) return getBoundValue(dataObj, dataKey) ?? '';
    return inner ?? '';
  };

  useEffect(() => { /* sync hook */ }, [propValue, dataObj, dataKey]);

  const commit = (raw, event) => {
    if (!isPropControlled && !isData) setInner(raw);
    if (isData) setBoundValue(dataObj, dataKey, raw);
    const ctx = buildCtx({ dataKey, dataObj, source: 'user', dirty: true, valid: null });
    const evt = event ? { ...event, target: { ...event.target, value: raw } } : { target: { value: raw } };
    fireValueHandlers({ onChange, onValueChange, value: raw, ctx, event: evt });
  };

  const value = getExternal();
  const base = 'block w-full pr-10 pl-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white border';
  const state = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  const inputId = id || (dataKey ? `date_${String(dataKey).replace(/[^a-zA-Z0-9_]+/g, '_')}` : undefined);
  const inputRef = useRef(null);

  return (
    <div className={`relative ${className}`.trim()}>
      <input
        ref={(node) => { inputRef.current = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; }}
        id={inputId}
        type="date"
        className={`${base} ${state}`.trim()}
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(e) => commit(e.target.value, e)}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={false}
        {...props}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-2 my-auto h-6 w-6 rounded hover:bg-gray-100 text-gray-500"
        onClick={() => inputRef.current?.showPicker?.()}
        tabIndex={-1}
        aria-label="open date picker"
        disabled={disabled || readOnly}
      >
        📅
      </button>
    </div>
  );
});

DateInput.displayName = 'DateInput';

export default DateInput;
