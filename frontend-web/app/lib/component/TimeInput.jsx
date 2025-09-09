// TimeInput.jsx
// Updated: 2025-09-09
// Purpose: Simple time input with EasyObj binding
import { forwardRef, useEffect, useState } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';

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

  const getExternal = () => {
    if (isPropControlled) return propValue ?? '';
    if (isData) return getBoundValue(dataObj, dataKey) ?? '';
    return inner ?? '';
  };

  useEffect(() => { /* sync */ }, [propValue, dataObj, dataKey]);

  const commit = (raw, event) => {
    if (!isPropControlled && !isData) setInner(raw);
    if (isData) setBoundValue(dataObj, dataKey, raw);
    const ctx = buildCtx({ dataKey, dataObj, source: 'user', dirty: true, valid: null });
    const evt = event ? { ...event, target: { ...event.target, value: raw } } : { target: { value: raw } };
    fireValueHandlers({ onChange, onValueChange, value: raw, ctx, event: evt });
  };

  const value = getExternal();
  const base = 'block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white border';
  const state = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  const inputId = id || (dataKey ? `time_${String(dataKey).replace(/[^a-zA-Z0-9_]+/g, '_')}` : undefined);

  return (
    <input
      ref={ref}
      id={inputId}
      type="time"
      className={`${base} ${state} ${className}`.trim()}
      value={value}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      onChange={(e) => commit(e.target.value, e)}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={false}
      {...props}
    />
  );
});

TimeInput.displayName = 'TimeInput';

export default TimeInput;

