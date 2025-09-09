import { useState, forwardRef, useEffect } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';

const Textarea = forwardRef(({ 
  dataObj,
  dataKey,
  value: propValue,
  defaultValue = '',
  onChange,
  onValueChange,
  rows = 4,
  className = '',
  error,
  disabled = false,
  readOnly = false,
  placeholder,
  ...props
}, ref) => {
  const isControlled = propValue !== undefined;
  const isData = !!(dataObj && dataKey);

  const resolveValue = () => {
    if (isControlled) return propValue;
    if (isData) return getBoundValue(dataObj, dataKey) ?? '';
    return innerValue;
  };

  const [innerValue, setInnerValue] = useState(defaultValue);

  useEffect(() => {
    if (!isControlled && !isData) return;
    // re-sync external changes
    // no-op here, value derives from props
  }, [propValue, dataObj, dataKey]);

  const commit = (raw) => {
    if (isData) setBoundValue(dataObj, dataKey, raw);
    if (!isControlled && !isData) setInnerValue(raw);
    const ctx = buildCtx({ dataKey, dataObj, source: 'user', dirty: true, valid: null });
    const evt = { target: { value: raw } };
    fireValueHandlers({ onChange, onValueChange, value: raw, ctx, event: evt });
  };

  const base = 'block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white';
  const states = error ? 'border border-red-300 focus:ring-red-500 focus:border-red-500' : 'border border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  return (
    <textarea
      ref={ref}
      className={`${base} ${states} ${className}`.trim()}
      rows={rows}
      value={resolveValue()}
      onChange={(e) => commit(e.target.value)}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      aria-invalid={!!error}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;

