import { useState, forwardRef, useEffect } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';

const truthy = (v) => [true, 'Y', 'y', '1', 1].includes(v) || v === true;

const Switch = forwardRef(({ 
  label,
  name,
  onChange,
  onValueChange,
  dataObj,
  dataKey,
  className = '',
  checked: propChecked,
  defaultChecked = false,
  disabled = false,
  id,
  ...props
}, ref) => {
  const isControlled = propChecked !== undefined;
  const isDataObj = !!(dataObj && dataKey);

  const inputName = name || dataKey;

  const [internalChecked, setInternalChecked] = useState(() => {
    if (isDataObj) return truthy(getBoundValue(dataObj, dataKey));
    return !!defaultChecked;
  });

  useEffect(() => {
    if (isDataObj) {
      setInternalChecked(truthy(getBoundValue(dataObj, dataKey)));
    }
  }, [isDataObj, dataObj, dataKey]);

  const getCheckedState = () => {
    if (isControlled) return !!propChecked;
    if (isDataObj) return truthy(getBoundValue(dataObj, dataKey));
    return internalChecked;
  };

  const handleChange = (e) => {
    e.stopPropagation();
    const newChecked = e.target.checked;

    if (!isControlled) setInternalChecked(newChecked);
    if (isDataObj) setBoundValue(dataObj, dataKey, newChecked);

    const ctx = buildCtx({ dataKey, dataObj, source: 'user', dirty: true, valid: null });
    fireValueHandlers({ onChange, onValueChange, value: newChecked, ctx, event: e });
  };

  const checked = getCheckedState();
  const switchId = id || (dataKey ? `sw_${String(dataKey).replace(/[^a-zA-Z0-9_]+/g, '_')}` : undefined);

  return (
    <label className={`inline-flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`.trim()}>
      <input
        ref={ref}
        id={switchId}
        type="checkbox"
        name={inputName}
        className="sr-only"
        checked={!!checked}
        onChange={handleChange}
        disabled={disabled}
        role="switch"
        aria-checked={!!checked}
        aria-disabled={disabled}
        {...props}
      />
      <span
        aria-hidden="true"
        className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-1'}`}></span>
      </span>
      {label && (
        <span className="select-none text-sm text-gray-800">{label}</span>
      )}
    </label>
  );
});

Switch.displayName = 'Switch';

export default Switch;
