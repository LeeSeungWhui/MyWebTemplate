// NumberInput.jsx
// Updated: 2025-09-09
// Purpose: Numeric input with step controls and EasyObj binding support
import { forwardRef, useEffect, useRef, useState } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';

const clamp = (n, min, max) => {
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
};

const parseNum = (v) => {
  if (v === '' || v === null || v === undefined) return '';
  const n = Number(v);
  return Number.isFinite(n) ? n : '';
};

const NumberInput = forwardRef(({ 
  dataObj,
  dataKey,
  value: propValue,
  defaultValue = '',
  onChange,
  onValueChange,
  min,
  max,
  step = 1,
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
  const inputRef = useRef(null);

  const getExternal = () => {
    if (isPropControlled) return propValue ?? '';
    if (isData) return getBoundValue(dataObj, dataKey) ?? '';
    return inner ?? '';
  };

  useEffect(() => {
    // sync on external change
  }, [propValue, dataObj, dataKey]);

  const commit = (raw, event) => {
    const n = raw === '' ? '' : parseNum(raw);
    const next = n === '' ? '' : clamp(n, min, max);
    if (!isPropControlled && !isData) setInner(next);
    if (isData) setBoundValue(dataObj, dataKey, next);
    const ctx = buildCtx({ dataKey, dataObj, source: 'user', dirty: true, valid: null });
    const evt = event ? { ...event, target: { ...event.target, value: next } } : { target: { value: next } };
    fireValueHandlers({ onChange, onValueChange, value: next, ctx, event: evt });
  };

  const changeBy = (delta) => {
    if (disabled || readOnly) return;
    const cur = getExternal();
    const base = cur === '' ? 0 : Number(cur) || 0;
    const next = clamp(base + delta, min, max);
    commit(next);
  };

  const value = getExternal();

  const baseCls = 'block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white border';
  const stateCls = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  const inputId = id || (dataKey ? `num_${String(dataKey).replace(/[^a-zA-Z0-9_]+/g, '_')}` : undefined);

  return (
    <div className={`relative inline-flex items-stretch w-full ${className}`.trim()} {...props}>
      <button
        type="button"
        className="px-2 text-sm border border-r-0 rounded-l-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
        onClick={() => changeBy(-step)}
        disabled={disabled || readOnly}
        aria-label="decrement"
      >
        −
      </button>
      <input
        ref={(node) => { inputRef.current = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; }}
        id={inputId}
        type="text"
        inputMode="decimal"
        pattern="[0-9.-]*"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          // allow empty or partial numeric input, commit raw but normalized later
          if (v === '' || /^-?\d*(?:\.\d*)?$/.test(v)) {
            if (!isPropControlled && !isData) setInner(v);
          }
        }}
        onBlur={(e) => commit(e.target.value, e)}
        className={`${baseCls} ${stateCls} rounded-none border-l-0 border-r-0`.trim()}
        disabled={disabled}
        readOnly={readOnly}
        role="spinbutton"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value === '' ? undefined : Number(value)}
      />
      <button
        type="button"
        className="px-2 text-sm border border-l-0 rounded-r-md bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
        onClick={() => changeBy(+step)}
        disabled={disabled || readOnly}
        aria-label="increment"
      >
        +
      </button>
    </div>
  );
});

NumberInput.displayName = 'NumberInput';

export default NumberInput;

