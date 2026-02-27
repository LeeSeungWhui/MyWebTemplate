/**
 * 파일명: NumberInput.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: NumberInput UI 컴포넌트 구현
 */
// NumberInput.jsx
// Updated: 2025-09-09
// 한글설명: Purpose: Numeric input with step controls and EasyObj binding support
import { forwardRef, useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';

/**
 * @description 숫자 값을 min/max 범위 안으로 보정
 * 반환값: 범위를 벗어나면 경계값(min/max), 아니면 원래 숫자.
 * @updated 2026-02-27
 */
const clamp = (numberValue, min, max) => {
  if (min !== undefined && numberValue < min) return min;
  if (max !== undefined && numberValue > max) return max;
  return numberValue;
};

/**
 * @description 사용자 입력 문자열을 숫자로 파싱
 * 실패 동작: 빈값/NaN 입력은 빈 문자열을 반환한다.
 * @updated 2026-02-27
 */
const parseNum = (rawValue) => {
  if (rawValue === '' || rawValue === null || rawValue === undefined) return '';
  const parsedNumber = Number(rawValue);
  return Number.isFinite(parsedNumber) ? parsedNumber : '';
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

  /**
   * @description  현재 값을 prop/dataObj/local state 우선순위로 조회한다. 입력/출력 계약을 함께 명시
   * 처리 규칙: controlled > EasyObj 바인딩 > 내부 상태 순으로 fallback 한다.
   * @updated 2026-02-27
   */
  const getExternal = () => {
    if (isPropControlled) return propValue ?? '';
    if (isData) return getBoundValue(dataObj, dataKey) ?? '';
    return inner ?? '';
  };

  useEffect(() => {
    // 한글설명: sync on external change
  }, [propValue, dataObj, dataKey]);

  /**
   * @description 입력값을 정규화해 상태/바인딩/핸들러로 확정 반영
   * 부작용: inner, dataObj[dataKey], onChange/onValueChange 이벤트 값이 함께 갱신된다.
   * @updated 2026-02-27
   */
  const commit = (raw, event) => {
    const parsedNumber = raw === '' ? '' : parseNum(raw);
    const next = parsedNumber === '' ? '' : clamp(parsedNumber, min, max);
    if (!isPropControlled && !isData) setInner(next);
    if (isData) setBoundValue(dataObj, dataKey, next);
    const ctx = buildCtx({ dataKey, dataObj, source: 'user', dirty: true, valid: null });
    const evt = event ? { ...event, target: { ...event.target, value: next } } : { target: { value: next } };
    fireValueHandlers({ onChange, onValueChange, value: next, ctx, event: evt });
  };

  /**
   * @description step 증감(delta)으로 숫자 값을 변경
   * 처리 규칙: disabled/readOnly면 중단하고, 그 외에는 clamp 후 commit을 호출한다.
   * @updated 2026-02-27
   */
  const changeBy = (delta) => {
    if (disabled || readOnly) return;
    const cur = getExternal();
    const base = cur === '' ? 0 : Number(cur) || 0;
    const next = clamp(base + delta, min, max);
    commit(next);
  };

  // 한글설명: long-press support for step buttons (no double increment)
  const holdRef = useRef(null);       // interval
  const holdTimerRef = useRef(null);  // 한글설명: delay before repeat
  const heldStartedRef = useRef(false);

  /**
   * @description 증감 버튼 long-press 반복 입력을 시작
   * 처리 규칙: 300ms 지연 후 120ms 간격 반복 호출로 연속 증감을 수행한다.
   * @updated 2026-02-27
   */
  const startHold = (delta) => {
    clearInterval(holdRef.current);
    clearTimeout(holdTimerRef.current);
    heldStartedRef.current = false;
    holdTimerRef.current = setTimeout(() => {
      heldStartedRef.current = true;
      changeBy(delta);
      holdRef.current = setInterval(() => changeBy(delta), 120);
    }, 300);
  };

  /**
   * @description long-press 관련 타이머와 interval을 모두 정리
   * 부작용: holdRef/holdTimerRef를 null로 초기화한다.
   * @updated 2026-02-27
   */
  const stopHold = () => {
    clearInterval(holdRef.current);
    clearTimeout(holdTimerRef.current);
    holdRef.current = null;
    holdTimerRef.current = null;
  };

  const value = getExternal();

  const baseCls = 'block w-full h-10 px-3 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white border';
  const stateCls = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  const inputId = id || (dataKey ? `num_${String(dataKey).replace(/[^a-zA-Z0-9_]+/g, '_')}` : undefined);

  return (
    <div className={`inline-flex items-center gap-2 w-full ${className}`.trim()} {...props}>
      <button
        type="button"
        className="h-10 w-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        onMouseDown={() => startHold(-step)}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onClick={(event) => { if (heldStartedRef.current) { event.preventDefault(); heldStartedRef.current = false; return; } changeBy(-step); }}
        disabled={disabled || readOnly}
        aria-label="decrement"
      >
        <Icon icon="md:MdRemove" className="w-5 h-5" />
      </button>

      <input
        ref={(node) => { inputRef.current = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; }}
        id={inputId}
        type="text"
        inputMode="decimal"
        pattern="[0-9.-]*"
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          const nextInputValue = event.target.value;
          if (nextInputValue === '' || /^-?\d*(?:\.\d*)?$/.test(nextInputValue)) {
            if (!isPropControlled && !isData) setInner(nextInputValue);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp') { event.preventDefault(); changeBy(+step); }
          if (event.key === 'ArrowDown') { event.preventDefault(); changeBy(-step); }
          if (event.key === 'PageUp') { event.preventDefault(); changeBy(+step * 10); }
          if (event.key === 'PageDown') { event.preventDefault(); changeBy(-step * 10); }
        }}
        onBlur={(event) => commit(event.target.value, event)}
        className={`${baseCls} ${stateCls} flex-1`.trim()}
        disabled={disabled}
        readOnly={readOnly}
        role="spinbutton"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value === '' ? undefined : Number(value)}
      />

      <button
        type="button"
        className="h-10 w-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        onMouseDown={() => startHold(+step)}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onClick={(event) => { if (heldStartedRef.current) { event.preventDefault(); heldStartedRef.current = false; return; } changeBy(+step); }}
        disabled={disabled || readOnly}
        aria-label="increment"
      >
        <Icon icon="md:MdAdd" className="w-5 h-5" />
      </button>
    </div>
  );
});

NumberInput.displayName = 'NumberInput';

/**
 * @description 숫자 입력/step 증감/바인딩 동기화 기능을 가진 NumberInput 컴포넌트를 외부에 노출
 * 반환값: NumberInput 컴포넌트 export.
 */
export default NumberInput;
