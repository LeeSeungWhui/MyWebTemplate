/**
 * 파일명: DateInput.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: DateInput UI 컴포넌트 구현
 */

import { forwardRef, useEffect, useRef, useState, useMemo } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';
import Icon from './Icon';
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko';

/**
 * @description 월/일 숫자 두 자리 문자열 정규화
 * 처리 규칙: 1자리 숫자는 앞에 0을 붙이고, 2자리 이상은 원문을 유지한다.
 * @updated 2026-02-27
 */
const pad2 = (numberValue) => String(numberValue).padStart(2, '0');

/**
 * @description 연/월/일 숫자 YYYY-MM-DD 문자열 결합
 * 반환값: DateInput 내부 비교와 바인딩에 사용하는 ISO 날짜 문자열.
 * @updated 2026-02-27
 */
const fmtISO = (yearValue, monthValue, dayValue) => `${yearValue}-${pad2(monthValue)}-${pad2(dayValue)}`;

/**
 * @description MM-DD 텍스트를 Date 객체로 변환. 입력/출력 계약을 함께 명시
 * 실패 동작: 형식/유효 날짜가 아니면 null을 반환한다.
 * @updated 2026-02-27
 */
const parseISO = (isoText) => {
  if (!isoText || typeof isoText !== 'string') return null;
  const parsedMatch = isoText.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
  if (!parsedMatch) return null;
  const yearNumber = Number(parsedMatch[1]);
  const monthNumber = Number(parsedMatch[2]);
  const dayNumber = Number(parsedMatch[3]);
  const parsedDate = new Date(yearNumber, monthNumber - 1, dayNumber);
  if (
    parsedDate.getFullYear() !== yearNumber ||
    parsedDate.getMonth() !== monthNumber - 1 ||
    parsedDate.getDate() !== dayNumber
  ) {
    return null;
  }
  return parsedDate;
};

/**
 * @description 두 Date가 같은 연/월/일인지 비교
 * 반환값: 같은 날짜면 true, 하나라도 다르면 false.
 * @updated 2026-02-27
 */
const sameDay = (firstDate, secondDate) => {
  if (!firstDate || !secondDate) return false;
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
};

/**
 * @description 렌더링 및 상호작용 처리
 * 처리 규칙: 전달된 props와 바인딩 값을 기준으로 UI 상태를 계산하고 변경 이벤트를 상위로 전달한다.
 * @updated 2026-02-27
 */
const DateInput = forwardRef(({
  dataObj,
  dataKey,
  value: propValue,
  defaultValue = '',
  onChange,
  onValueChange,
  min,
  max,
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
  const [text, setText] = useState(() => (propValue ?? (isData ? getBoundValue(dataObj, dataKey) : inner) ?? ''));
  const [open, setOpen] = useState(false);

  /**
   * @description 외부 소스(prop/dataObj/local state) 우선순위 기반 현재 값 조회
   * 처리 규칙: controlled > EasyObj 바인딩 > 내부 상태 순으로 fallback 한다.
   * @updated 2026-02-27
   */
  const getExternal = () => {
    if (isPropControlled) return propValue ?? '';
    if (isData) return getBoundValue(dataObj, dataKey) ?? '';
    return inner ?? '';
  };

  useEffect(() => {
    setText(getExternal());
  }, [propValue, dataObj, dataKey]);

  /**
   * @description 확정된 날짜 문자열을 상태/바인딩/이벤트 핸들러에 동기화
   * 부작용: text, inner, dataObj[dataKey] 및 onChange/onValueChange 호출에 영향을 준다.
   * @updated 2026-02-27
   */
  const commit = (raw, event) => {
    setText(raw);
    if (!isPropControlled && !isData) setInner(raw);
    if (isData) setBoundValue(dataObj, dataKey, raw);
    const ctx = buildCtx({ dataKey, dataObj, source: 'user', dirty: true, valid: null });
    const evt = event ? { ...event, target: { ...event.target, value: raw } } : { target: { value: raw } };
    fireValueHandlers({ onChange, onValueChange, value: raw, ctx, event: evt });
  };

  const value = getExternal();
  const base = 'block w-full pr-10 pl-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white border';
  const state = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  const inputId = id || (dataKey ? `date_${String(dataKey).replace(/[^a-zA-Z0-9_]+/g, '_')}` : undefined);
  const inputRef = useRef(null);
  const rootRef = useRef(null);

  const minDate = parseISO(min);
  const maxDate = parseISO(max);
  const selectedDate = parseISO(value);
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(() => (selectedDate?.getFullYear() ?? today.getFullYear()));
  const [viewMonth, setViewMonth] = useState(() => (selectedDate?.getMonth() ?? today.getMonth())); // 0-11

  /**
   * @description 달력 헤더의 연/월 표시를 전달된 delta만큼 이동
   * 처리 규칙: month 범위(0~11)를 넘으면 year를 함께 보정한다.
   * @updated 2026-02-27
   */
  const changeMonth = (delta) => {
    let nextYear = viewYear;
    let nextMonth = viewMonth + delta;
    while (nextMonth < 0) {
      nextMonth += 12;
      nextYear -= 1;
    }
    while (nextMonth > 11) {
      nextMonth -= 12;
      nextYear += 1;
    }
    setViewYear(nextYear);
    setViewMonth(nextMonth);
  };

  const monthGrid = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startDay = first.getDay(); // 0 Sun
    const start = new Date(viewYear, viewMonth, 1 - startDay);
    const days = [];
    for (let dayIndex = 0; dayIndex < 42; dayIndex += 1) {
      const dayDate = new Date(start);
      dayDate.setDate(start.getDate() + dayIndex);
      const inMonth = dayDate.getMonth() === viewMonth;
      const iso = fmtISO(dayDate.getFullYear(), dayDate.getMonth() + 1, dayDate.getDate());
      let disabledDay = false;
      if (
        minDate &&
        dayDate < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
      ) {
        disabledDay = true;
      }
      if (
        maxDate &&
        dayDate > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())
      ) {
        disabledDay = true;
      }
      days.push({ dayDate, iso, inMonth, disabled: disabledDay });
    }
    return days;
  }, [viewYear, viewMonth, minDate, maxDate]);

  useEffect(() => {
    if (!open) return;

    /**
     * @description 컴포넌트 외부 클릭 시 달력 패널 닫기
     * 처리 규칙: rootRef 영역 바깥 mouse down 이벤트에서만 open=false로 전환한다.
     * @updated 2026-02-27
     */
    const handler = (event) => { if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false); };

    /**
     * @description Escape 키 입력으로 달력 패널 닫기
     * 처리 규칙: key 값이 Escape일 때만 close 동작을 수행한다.
     * @updated 2026-02-27
     */
    const esc = (keyboardEvent) => { if (keyboardEvent.key === 'Escape') setOpen(false); };

    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', esc); };
  }, [open]);

  return (
    <div className={`relative ${className}`.trim()} ref={rootRef}>
      <input
        ref={(node) => { inputRef.current = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; }}
        id={inputId}
        type="text"
        className={`${base} ${state}`.trim()}
        value={text}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            const dt = parseISO(event.currentTarget.value);
            if (dt) commit(fmtISO(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()), event);
            else setText(value);
            setOpen(false);
          }
        }}
        onBlur={(event) => {
          const dt = parseISO(event.target.value);
          if (dt) commit(fmtISO(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()), event);
          else setText(value);
        }}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={false}
        aria-haspopup="dialog"
        aria-expanded={open}
        {...props}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-2 my-auto h-6 w-6 rounded hover:bg-gray-100 text-gray-500 flex items-center justify-center"
        onClick={() => setOpen((previousOpen) => !previousOpen)}
        tabIndex={-1}
        aria-label={COMMON_COMPONENT_LANG_KO.dateInput.openDatePicker}
        disabled={disabled || readOnly}
      >
        <Icon icon="md:MdCalendarToday" className="w-5 h-5" />
      </button>
      {open && (
        <div role="dialog" aria-modal="false" className="absolute z-10 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <button className="p-1 rounded hover:bg-gray-100" onClick={() => changeMonth(-1)} aria-label={COMMON_COMPONENT_LANG_KO.dateInput.prevMonth}>
              <Icon icon="md:MdChevronLeft" className="w-5 h-5" />
            </button>
            <div className="text-sm font-medium">{viewYear}{COMMON_COMPONENT_LANG_KO.dateInput.yearSuffix} {viewMonth + 1}{COMMON_COMPONENT_LANG_KO.dateInput.monthSuffix}</div>
            <button className="p-1 rounded hover:bg-gray-100" onClick={() => changeMonth(+1)} aria-label={COMMON_COMPONENT_LANG_KO.dateInput.nextMonth}>
              <Icon icon="md:MdChevronRight" className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
            {COMMON_COMPONENT_LANG_KO.dateInput.weekdaysShort.map((dayLabel) => (<div key={dayLabel}>{dayLabel}</div>))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthGrid.map(({ dayDate, iso, inMonth, disabled: isDisabled }) => {
              const isSel = sameDay(dayDate, selectedDate);
              const isToday = sameDay(dayDate, today);
              const cls = [
                'h-8 rounded text-sm flex items-center justify-center cursor-pointer',
                inMonth ? '' : 'text-gray-400',
                isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-50',
                isSel ? 'bg-blue-600 text-white hover:bg-blue-600' : '',
                !isSel && isToday ? 'ring-1 ring-blue-400' : ''
              ].join(' ').trim();
              return (
                <button
                  key={iso}
                  type="button"
                  className={cls}
                  disabled={isDisabled}
                  onClick={() => {
                    commit(iso);
                    setOpen(false);
                  }}
                >
                  {dayDate.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

DateInput.displayName = 'DateInput';

export default DateInput;
