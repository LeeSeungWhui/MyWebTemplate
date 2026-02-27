/**
 * 파일명: Switch.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Switch UI 컴포넌트 구현
 */
import { useState, forwardRef, useEffect } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';

/**
 * @description 다양한 truthy 표현을 boolean true로 해석한다.
 * 반환값: `true/Y/y/1` 계열 값이면 true, 그 외는 false.
 * @updated 2026-02-27
 */
const truthy = (value) => [true, 'Y', 'y', '1', 1].includes(value) || value === true;

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

  /**
   * @description checked 값을 controlled/dataObj/local state 우선순위로 계산한다.
   * 처리 규칙: prop checked > bound value > internalChecked 순으로 fallback 한다.
   * @updated 2026-02-27
   */
  const getCheckedState = () => {
    if (isControlled) return !!propChecked;
    if (isDataObj) return truthy(getBoundValue(dataObj, dataKey));
    return internalChecked;
  };

  /**
   * @description 스위치 토글 이벤트를 상태/바인딩/핸들러 규약으로 동기화한다.
   * 부작용: internalChecked, dataObj[dataKey], onChange/onValueChange 호출 값이 함께 갱신된다.
   * @updated 2026-02-27
   */
  const handleChange = (event) => {
    event.stopPropagation();
    const newChecked = event.target.checked;

    if (!isControlled) setInternalChecked(newChecked);
    if (isDataObj) {
      setBoundValue(dataObj, dataKey, newChecked);
    }

    const ctx = buildCtx({ dataKey, dataObj, source: 'user', dirty: true, valid: null });
    fireValueHandlers({ onChange, onValueChange, value: newChecked, ctx, event });
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

/**
 * @description on/off 토글과 바인딩 연동을 지원하는 Switch 컴포넌트를 외부에 노출한다.
 * 반환값: Switch 컴포넌트 export.
 */
export default Switch;
