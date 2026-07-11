/**
 * 파일명: TimeInput.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-11
 * 설명: TimeInput UI 컴포넌트 구현
 */

import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';
import Icon from './Icon';
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko';

const parseTimeMinutes = (timeText) => {
  if (typeof timeText !== 'string') return null;
  const match = timeText.match(/^([0-9]{2}):([0-9]{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
};

const isTimeWithinBounds = (timeText, min, max) => {
  const timeMinutes = parseTimeMinutes(timeText);
  if (timeMinutes == null) return false;
  const minMinutes = parseTimeMinutes(min);
  const maxMinutes = parseTimeMinutes(max);
  if (minMinutes != null && timeMinutes < minMinutes) return false;
  if (maxMinutes != null && timeMinutes > maxMinutes) return false;
  return true;
};

/**
 * @description 렌더링 및 상호작용 처리
 * 처리 규칙: 전달된 props와 바인딩 값을 기준으로 UI 상태를 계산하고 변경 이벤트를 상위로 전달한다.
 * @updated 2026-02-27
 */
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
  const isDataBound = Boolean(dataObj && dataKey);

  const [innerValue, setInnerValue] = useState(defaultValue);
  const [timeText, setTimeText] = useState(() => (propValue ?? (isDataBound ? getBoundValue(dataObj, dataKey) : innerValue) ?? ''));
  const [isOpen, setIsOpen] = useState(false);

  /**
   * @description prop/data/inner 값 변경을 timeText 표시 문자열에 동기화
   * 처리 규칙: isPropControlled·isDataBound 우선순위로 setTimeText를 갱신한다.
   */
  useEffect(() => {
    if (isPropControlled) {
      setTimeText(propValue ?? '');
      return;
    }
    if (isDataBound) {
      setTimeText(getBoundValue(dataObj, dataKey) ?? '');
      return;
    }
    setTimeText(innerValue ?? '');
  }, [propValue, dataObj, dataKey, innerValue, isDataBound, isPropControlled]);

  /**
   * @description 확정된 시간 문자열을 상태/바인딩/이벤트 핸들러에 반영
   * 부작용: timeText, innerValue, dataObj[dataKey], onChange/onValueChange 호출 값이 갱신된다.
   * @updated 2026-02-27
   */
  const commitTimeValue = (rawTimeValue, event) => {
    setTimeText(rawTimeValue);
    if (!isPropControlled && !isDataBound) setInnerValue(rawTimeValue);
    if (isDataBound) setBoundValue(dataObj, dataKey, rawTimeValue);
    const bindingCtx = buildCtx({ dataKey, dataObj, source: 'user', dirty: true, valid: null });
    const nextEvent = event ? { ...event, target: { ...event.target, value: rawTimeValue } } : { target: { value: rawTimeValue } };
    fireValueHandlers({ onChange, onValueChange, value: rawTimeValue, ctx: bindingCtx, event: nextEvent });
  };

  let currentTimeValue = innerValue ?? '';
  if (isPropControlled) {
    currentTimeValue = propValue ?? '';
  } else if (isDataBound) {
    currentTimeValue = getBoundValue(dataObj, dataKey) ?? '';
  }
  const inputId = id || (dataKey ? `time_${String(dataKey).replace(/[^a-zA-Z0-9_]+/g, '_')}` : undefined);
  const generatedListboxId = useId();
  const listboxId = inputId ? `${inputId}_list` : `time_${generatedListboxId}_list`;
  const rootRef = useRef(null);

  const commitTimeDraft = (rawTimeValue, event) => {
    if (!isTimeWithinBounds(rawTimeValue, min, max)) {
      setTimeText(currentTimeValue);
      return false;
    }
    commitTimeValue(rawTimeValue, event);
    return true;
  };

  const minuteInterval = Math.max(1, step ?? 30);
  const timeOptionList = [];
  for (let secondCursor = 0; secondCursor < 24 * 60 * 60; secondCursor += minuteInterval * 60) {
    const hourValue = Math.floor(secondCursor / 3600);
    const minuteValue = Math.floor((secondCursor % 3600) / 60);
    const timeOption = `${String(hourValue).padStart(2, '0')}:${String(minuteValue).padStart(2, '0')}`;
    if (isTimeWithinBounds(timeOption, min, max)) timeOptionList.push(timeOption);
  }

  /**
   * @description isOpen일 때 document mousedown으로 시간 패널 닫기 처리
   * 처리 규칙: cleanup에서 outside-click 리스너를 제거한다.
   */
  useEffect(() => {
    if (!isOpen) return;

    /**
     * @description 컴포넌트 외부 클릭 시 시간 옵션 패널 닫기
     * 처리 규칙: rootRef 외부 mousedown 이벤트에서만 open=false를 반영한다.
     * @updated 2026-02-27
     */
    const handleDocMouseDown = (event) => { if (rootRef.current && !rootRef.current.contains(event.target)) setIsOpen(false); };

    /**
     * @description Escape 키 입력으로 시간 옵션 패널 닫기
     * 처리 규칙: key 값이 Escape일 때만 close 동작을 적용한다.
     * @updated 2026-02-27
     */
    const handleDocKeyDown = (keyboardEvent) => { if (keyboardEvent.key === 'Escape') setIsOpen(false); };

    document.addEventListener('mousedown', handleDocMouseDown);
    document.addEventListener('keydown', handleDocKeyDown);
    return () => { document.removeEventListener('mousedown', handleDocMouseDown); document.removeEventListener('keydown', handleDocKeyDown); };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`.trim()} ref={rootRef}>
      <input
        ref={ref}
        id={inputId}
        type="text"
        className="block w-full pr-10 pl-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white border border-zinc-200 focus-visible:ring-zinc-950 focus-visible:border-zinc-900"
        value={timeText}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        onChange={(event) => setTimeText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commitTimeDraft(event.currentTarget.value, event);
            setIsOpen(false);
          }
          if (event.key === 'ArrowDown' && (event.altKey || !isOpen)) {
            event.preventDefault();
            setIsOpen(true);
          }
          if (event.key === 'Escape') setIsOpen(false);
        }}
        onBlur={(event) => commitTimeDraft(event.target.value, event)}
        disabled={disabled}
        readOnly={readOnly}
        role="combobox"
        aria-invalid={false}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        {...props}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-2 my-auto h-6 w-6 rounded hover:bg-gray-100 text-gray-500 flex items-center justify-center"
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        aria-label={COMMON_COMPONENT_LANG_KO.timeInput.openPickerAriaLabel}
        disabled={disabled || readOnly}
      >
        <Icon icon="md:MdAccessTime" className="w-5 h-5" />
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-40 max-h-64 overflow-auto rounded-lg border border-zinc-200/80 bg-white shadow-lg ring-1 ring-zinc-950/5 p-1" role="listbox" id={listboxId}>
          {timeOptionList.map((timeOption) => (
            <button
              key={timeOption}
              type="button"
              role="option"
              aria-selected={timeOption === currentTimeValue}
              className={`w-full px-2 py-1 text-left text-sm rounded cursor-pointer hover:bg-zinc-50 ${timeOption === currentTimeValue ? 'bg-zinc-100 text-zinc-900 font-medium ring-1 ring-inset ring-zinc-200/60' : 'text-zinc-900'}`}
              onClick={() => {
                commitTimeValue(timeOption);
                setIsOpen(false);
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                commitTimeValue(timeOption, event);
                setIsOpen(false);
              }}
            >
              {timeOption}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

TimeInput.displayName = 'TimeInput';

/**
 * @description 수동 입력과 옵션 선택을 지원하는 TimeInput 컴포넌트를 외부에 노출
 * 반환값: TimeInput 컴포넌트 export.
 */
export default TimeInput;
