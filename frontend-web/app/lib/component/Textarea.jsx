/**
 * 파일명: Textarea.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Textarea UI 컴포넌트 구현
 */
import { useState, forwardRef, useEffect, useRef } from 'react';
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
  const isPropControlled = propValue !== undefined;
  const isData = !!(dataObj && dataKey);

  const [innerValue, setInnerValue] = useState(defaultValue);
  const [draftValue, setDraftValue] = useState(undefined);
  const composingRef = useRef(false);

  /**
   * @description prop/dataObj/internal 상태 우선순위에 따라 현재 표시값을 계산한다.
   * @returns {string}
   * @updated 2026-02-27
   */
  const getExternalValue = () => {
    if (isPropControlled) return propValue ?? '';
    if (isData) return getBoundValue(dataObj, dataKey) ?? '';
    return innerValue ?? '';
  };

  useEffect(() => {
    const external = getExternalValue();
    if (draftValue !== undefined && draftValue === external) {
      setDraftValue(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propValue, dataObj, dataKey, draftValue]);

  /**
   * @description 입력값을 저장소(dataObj 또는 내부 state)에 반영하고 상위 폼 동기화를 유지한다.
   * @param {string} raw
   * @param {React.SyntheticEvent | undefined} event
   * @returns {void}
   * @updated 2026-02-27
   */
  const commit = (raw, event) => {
    if (isData) setBoundValue(dataObj, dataKey, raw);
    if (!isPropControlled && !isData) setInnerValue(raw);
    const ctx = buildCtx({ dataKey, dataObj, source: 'user', dirty: true, valid: null });
    const evt = event ? { ...event, target: { ...event.target, value: raw } } : { target: { value: raw } };
    fireValueHandlers({ onChange, onValueChange, value: raw, ctx, event: evt });
  };

  const base = 'block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white';
  const states = error ? 'border border-red-300 focus:ring-red-500 focus:border-red-500' : 'border border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  const value = draftValue ?? getExternalValue();

  return (
    <textarea
      ref={ref}
      className={`${base} ${states} ${className}`.trim()}
      rows={rows}
      value={value}
      onChange={(event) => {
        const composing = event.nativeEvent?.isComposing || composingRef.current;
        const raw = event.target.value;
        setDraftValue(raw);
        if (!composing) {
          commit(raw, event);
        }
      }}
      onCompositionStart={() => { composingRef.current = true; }}
      onCompositionEnd={(event) => { composingRef.current = false; commit(event.target.value, event); }}
      onBlur={(event) => { commit(event.target.value, event); }}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      aria-invalid={!!error}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

/**
 * @description Textarea 컴포넌트를 기본 export한다.
 * @returns {React.ComponentType} Textarea 컴포넌트
 */
export default Textarea;
