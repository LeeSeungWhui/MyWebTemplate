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

  // long-press support for step buttons
  const holdRef = useRef(null);
  const startHold = (delta) => {
    changeBy(delta);
    clearInterval(holdRef.current);
    holdRef.current = setInterval(() => changeBy(delta), 150);
  };
  const stopHold = () => { clearInterval(holdRef.current); holdRef.current = null; };

  const value = getExternal();

  const baseCls = 'block w-full pr-10 pl-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white border';
  const stateCls = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  const inputId = id || (dataKey ? `num_${String(dataKey).replace(/[^a-zA-Z0-9_]+/g, '_')}` : undefined);

  return (
    <div className={`relative inline-block w-full ${className}`.trim()} {...props}>
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
          if (v === '' || /^-?\d*(?:\.\d*)?$/.test(v)) {
            if (!isPropControlled && !isData) setInner(v);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') { e.preventDefault(); changeBy(+step); }
          if (e.key === 'ArrowDown') { e.preventDefault(); changeBy(-step); }
          if (e.key === 'PageUp') { e.preventDefault(); changeBy(+step * 10); }
          if (e.key === 'PageDown') { e.preventDefault(); changeBy(-step * 10); }
        }}
        onBlur={(e) => commit(e.target.value, e)}
        className={`${baseCls} ${stateCls}`.trim()}
        disabled={disabled}
        readOnly={readOnly}
        role="spinbutton"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value === '' ? undefined : Number(value)}
      />
      <div className="absolute inset-y-0 right-1 flex flex-col justify-center">
        <button
          type="button"
          className="h-4 w-6 text-xs rounded-t-md bg-gray-100 hover:bg-gray-200 border border-gray-300 border-b-0 disabled:opacity-50"
          onMouseDown={() => startHold(+step)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onClick={() => changeBy(+step)}
          disabled={disabled || readOnly}
          aria-label="increment"
        >
          ▲
        </button>
        <button
          type="button"
          className="h-4 w-6 text-xs rounded-b-md bg-gray-100 hover:bg-gray-200 border border-gray-300 disabled:opacity-50"
          onMouseDown={() => startHold(-step)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onClick={() => changeBy(-step)}
          disabled={disabled || readOnly}
          aria-label="decrement"
        >
          ▼
        </button>
      </div>
    </div>
  );
});

NumberInput.displayName = 'NumberInput';

export default NumberInput;
