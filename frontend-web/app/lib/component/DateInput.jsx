/**
 * 파일명: DateInput.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-11
 * 설명: DateInput UI 컴포넌트 구현
 */

import { forwardRef, useEffect, useRef, useState } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';
import Icon from './Icon';
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko';

/**
 * @description YYYY-MM-DD 텍스트를 Date 객체로 변환. 입력/출력 계약을 함께 명시
 * 실패 동작: 형식/유효 날짜가 아니면 null을 반환한다.
 * @updated 2026-02-27
 */
const parseDateText = (dateText) => {
  if (!dateText || typeof dateText !== 'string') return null;
  const parsedMatch = dateText.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
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
const isSameDate = (firstDate, secondDate) => {
  if (!firstDate || !secondDate) return false;
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
};

const isDateWithinBounds = (dateValue, minDate, maxDate) => {
  if (!dateValue) return false;
  if (minDate && dateValue < minDate) return false;
  if (maxDate && dateValue > maxDate) return false;
  return true;
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
  const isDataBound = Boolean(dataObj && dataKey);

  const [innerValue, setInnerValue] = useState(defaultValue);
  const [dateText, setDateText] = useState(() => (propValue ?? (isDataBound ? getBoundValue(dataObj, dataKey) : innerValue) ?? ''));
  const [isOpen, setIsOpen] = useState(false);

  /**
   * @description prop/data/inner 값 변경을 dateText 표시 문자열에 동기화
   * 처리 규칙: isPropControlled·isDataBound 우선순위로 setDateText를 갱신한다.
   */
  useEffect(() => {
    let externalValue = innerValue ?? '';
    if (isPropControlled) {
      externalValue = propValue ?? '';
    } else if (isDataBound) {
      externalValue = getBoundValue(dataObj, dataKey) ?? '';
    }
    setDateText(externalValue);
  }, [propValue, dataObj, dataKey, innerValue, isDataBound, isPropControlled]);

  /**
   * @description 확정된 날짜 문자열을 상태/바인딩/이벤트 핸들러에 동기화
   * 부작용: dateText, innerValue, dataObj[dataKey] 및 onChange/onValueChange 호출에 영향을 준다.
   * @updated 2026-02-27
   */
  const commitDateValue = (rawDateValue, event) => {
    setDateText(rawDateValue);
    if (!isPropControlled && !isDataBound) setInnerValue(rawDateValue);
    if (isDataBound) setBoundValue(dataObj, dataKey, rawDateValue);
    const bindingCtx = buildCtx({ dataKey, dataObj, source: 'user', dirty: true, valid: null });
    const nextEvent = event ? { ...event, target: { ...event.target, value: rawDateValue } } : { target: { value: rawDateValue } };
    fireValueHandlers({ onChange, onValueChange, value: rawDateValue, ctx: bindingCtx, event: nextEvent });
  };

  let currentDateValue = innerValue ?? '';
  if (isPropControlled) {
    currentDateValue = propValue ?? '';
  } else if (isDataBound) {
    currentDateValue = getBoundValue(dataObj, dataKey) ?? '';
  }
  const inputId = id || (dataKey ? `date_${String(dataKey).replace(/[^a-zA-Z0-9_]+/g, '_')}` : undefined);
  const rootRef = useRef(null);

  const minDate = parseDateText(min);
  const maxDate = parseDateText(max);
  const selectedDate = parseDateText(currentDateValue);
  const today = new Date();
  const [viewYear, setViewYear] = useState(() => (selectedDate?.getFullYear() ?? new Date().getFullYear()));
  const [viewMonth, setViewMonth] = useState(() => (selectedDate?.getMonth() ?? new Date().getMonth())); // 0-11

  const commitDateDraft = (rawDateValue, event) => {
    const parsedDate = parseDateText(rawDateValue);
    if (!isDateWithinBounds(parsedDate, minDate, maxDate)) {
      setDateText(currentDateValue);
      return false;
    }
    const committedDateValue = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
    commitDateValue(committedDateValue, event);
    return true;
  };

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

  const monthFirstDate = new Date(viewYear, viewMonth, 1);
  const weekStartDay = monthFirstDate.getDay(); // 0 Sun
  const gridStartDate = new Date(viewYear, viewMonth, 1 - weekStartDay);
  const minDateLimit = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : null;
  const maxDateLimit = maxDate ? new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()) : null;
  const monthDayList = [];
  for (let dayIndex = 0; dayIndex < 42; dayIndex += 1) {
    const dayDate = new Date(gridStartDate);
    dayDate.setDate(gridStartDate.getDate() + dayIndex);
    const isInMonth = dayDate.getMonth() === viewMonth;
    const dayDateText = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
    let isDayDisabled = false;
    if (minDateLimit && dayDate < minDateLimit) {
      isDayDisabled = true;
    }
    if (maxDateLimit && dayDate > maxDateLimit) {
      isDayDisabled = true;
    }
    monthDayList.push({ dayDate, dayDateText, isInMonth, disabled: isDayDisabled });
  }

  /**
   * @description isOpen일 때 document mousedown으로 달력 패널 닫기 처리
   * 처리 규칙: cleanup에서 outside-click 리스너를 제거한다.
   */
  useEffect(() => {
    if (!isOpen) return;

    /**
     * @description 컴포넌트 외부 클릭 시 달력 패널 닫기
     * 처리 규칙: rootRef 영역 바깥 mouse down 이벤트에서만 open=false로 전환한다.
     * @updated 2026-02-27
     */
    const handleDocMouseDown = (event) => { if (rootRef.current && !rootRef.current.contains(event.target)) setIsOpen(false); };

    /**
     * @description Escape 키 입력으로 달력 패널 닫기
     * 처리 규칙: key 값이 Escape일 때만 close 동작을 수행한다.
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
        className="block h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-900/5 placeholder:text-slate-400 transition-colors duration-150 focus:outline-none focus:ring-0 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 read-only:bg-slate-50"
        value={dateText}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(event) => setDateText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commitDateDraft(event.currentTarget.value, event);
            setIsOpen(false);
          }
          if (event.key === 'ArrowDown' && (event.altKey || !isOpen)) {
            event.preventDefault();
            setIsOpen(true);
          }
          if (event.key === 'Escape') setIsOpen(false);
        }}
        onBlur={(event) => commitDateDraft(event.target.value, event)}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={false}
        aria-haspopup="dialog"
        {...props}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-2 my-auto flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        aria-label={COMMON_COMPONENT_LANG_KO.dateInput.openDatePicker}
        disabled={disabled || readOnly}
      >
        <Icon icon="md:MdCalendarToday" className="h-4 w-4" />
      </button>
      {isOpen && (
        <div role="dialog" aria-modal="false" className="absolute z-10 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-lg ring-1 ring-slate-900/5">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20" onClick={() => changeMonth(-1)} aria-label={COMMON_COMPONENT_LANG_KO.dateInput.prevMonth}>
              <Icon icon="md:MdChevronLeft" className="w-5 h-5" />
            </button>
            <div className="text-sm font-semibold text-slate-900">{viewYear}{COMMON_COMPONENT_LANG_KO.dateInput.yearSuffix} {viewMonth + 1}{COMMON_COMPONENT_LANG_KO.dateInput.monthSuffix}</div>
            <button type="button" className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20" onClick={() => changeMonth(+1)} aria-label={COMMON_COMPONENT_LANG_KO.dateInput.nextMonth}>
              <Icon icon="md:MdChevronRight" className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
            {COMMON_COMPONENT_LANG_KO.dateInput.weekdaysShort.map((dayLabel) => (<div key={dayLabel}>{dayLabel}</div>))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDayList.map(({ dayDate, dayDateText, isInMonth, disabled: isDisabled }) => {
              const isSelected = isSameDate(dayDate, selectedDate);
              const isToday = isSameDate(dayDate, today);
              const dayButtonClassName = [
                'flex h-8 items-center justify-center rounded-md text-sm font-medium transition-colors',
                isInMonth ? 'text-slate-700' : 'text-slate-300',
                isDisabled ? 'cursor-not-allowed text-slate-300 opacity-60' : 'hover:bg-slate-100 hover:text-slate-900',
                isSelected ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-600 hover:text-white' : '',
                !isSelected && isToday ? 'ring-1 ring-indigo-200 text-indigo-700' : ''
              ].join(' ').trim();
              return (
                <button
                  key={dayDateText}
                  type="button"
                  className={dayButtonClassName}
                  disabled={isDisabled}
                  onClick={() => {
                    commitDateValue(dayDateText);
                    setIsOpen(false);
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
