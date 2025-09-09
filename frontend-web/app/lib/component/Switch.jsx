import { useState, forwardRef, useEffect } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';

const Switch = forwardRef(({ 
  dataObj,
  dataKey,
  checked: propChecked,
  defaultChecked,
  onChange,
  onValueChange,
  disabled = false,
  label,
  id,
  className = '',
  ...props
}, ref) => {
  const isControlled = propChecked !== undefined;
  const isDataObj = !!(dataObj && dataKey);

  const resolveChecked = () => {
    if (isControlled) return !!propChecked;
    if (isDataObj) return !!getBoundValue(dataObj, dataKey);
    return !!defaultChecked;
  };

  const [checked, setChecked] = useState(resolveChecked);

  // Track bound value so the component re-syncs when dataObj[dataKey] changes
  const boundChecked = isDataObj ? !!getBoundValue(dataObj, dataKey) : undefined;

  useEffect(() => {
    setChecked(resolveChecked());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propChecked, dataObj, dataKey, boundChecked]);

  const toggle = (next) => {
    const value = next ?? !checked;
    // Update local state for immediate UI feedback when not controlled
    if (!isControlled) setChecked(value);
    if (isDataObj) setBoundValue(dataObj, dataKey, value);
    const ctx = buildCtx({ dataKey, dataObj, source: 'user', dirty: true, valid: null });
    const fakeEvent = { target: { checked: value, value } };
    fireValueHandlers({ onChange, onValueChange, value, ctx, event: fakeEvent });
  };

  const switchId = id || (dataKey ? `sw_${String(dataKey).replace(/[^a-zA-Z0-9_]+/g, '_')}` : undefined);

  return (
    <label className={`inline-flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}> 
      <input
        ref={ref}
        id={switchId}
        type="checkbox"
        className="sr-only"
        checked={!!checked}
        onChange={(e) => toggle(e.target.checked)}
        disabled={disabled}
        role="switch"
        aria-checked={!!checked}
        aria-disabled={disabled}
        {...props}
      />
      <span
        aria-hidden="true"
        className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
        onClick={() => !disabled && toggle()}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-1'}`}></span>
      </span>
      {label && (
        <span className="select-none text-sm text-gray-800" onClick={() => !disabled && toggle()}>{label}</span>
      )}
    </label>
  );
});

Switch.displayName = 'Switch';

export default Switch;
