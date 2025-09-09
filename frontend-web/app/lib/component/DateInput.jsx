// DateInput.jsx
// Updated: 2025-09-09
// Purpose: Simple date input with EasyObj binding
import { forwardRef, useEffect, useRef, useState, useMemo } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';
import Icon from './Icon';

const pad2 = (n) => String(n).padStart(2, '0');
const fmtISO = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;
const parseISO = (s) => {
  if (!s || typeof s !== 'string') return null;
  const m = s.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const da = Number(m[3]);
  const dt = new Date(y, mo - 1, da);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== da) return null;
  return dt;
};

const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

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
  
  const getExternal = () => {
    if (isPropControlled) return propValue ?? '';
    if (isData) return getBoundValue(dataObj, dataKey) ?? '';
    return inner ?? '';
  };

  useEffect(() => {
    setText(getExternal());
  }, [propValue, dataObj, dataKey]);

  const commit = (raw, event) => {
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

  const minDate = useMemo(() => parseISO(min), [min]);
  const maxDate = useMemo(() => parseISO(max), [max]);
  const selectedDate = useMemo(() => parseISO(value), [value]);
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(() => (selectedDate?.getFullYear() ?? today.getFullYear()));
  const [viewMonth, setViewMonth] = useState(() => (selectedDate?.getMonth() ?? today.getMonth())); // 0-11

  const changeMonth = (delta) => {
    let y = viewYear, m = viewMonth + delta;
    while (m < 0) { m += 12; y -= 1; }
    while (m > 11) { m -= 12; y += 1; }
    setViewYear(y); setViewMonth(m);
  };

  const monthGrid = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startDay = first.getDay(); // 0 Sun
    const start = new Date(viewYear, viewMonth, 1 - startDay);
    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const inMonth = d.getMonth() === viewMonth;
      const iso = fmtISO(d.getFullYear(), d.getMonth() + 1, d.getDate());
      let disabledDay = false;
      if (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) disabledDay = true;
      if (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) disabledDay = true;
      days.push({ d, iso, inMonth, disabled: disabledDay });
    }
    return days;
  }, [viewYear, viewMonth, minDate, maxDate]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
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
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => {
          const dt = parseISO(e.target.value);
          if (dt) commit(fmtISO(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()), e);
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
        onClick={() => setOpen((v) => !v)}
        tabIndex={-1}
        aria-label="open date picker"
        disabled={disabled || readOnly}
      >
        <Icon icon="md:MdCalendarToday" className="w-5 h-5" />
      </button>
      {open && (
        <div role="dialog" aria-modal="false" className="absolute z-10 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <button className="p-1 rounded hover:bg-gray-100" onClick={() => changeMonth(-1)} aria-label="prev month">
              <Icon icon="md:MdChevronLeft" className="w-5 h-5" />
            </button>
            <div className="text-sm font-medium">{viewYear}년 {viewMonth + 1}월</div>
            <button className="p-1 rounded hover:bg-gray-100" onClick={() => changeMonth(+1)} aria-label="next month">
              <Icon icon="md:MdChevronRight" className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
            {['일','월','화','수','목','금','토'].map((d) => (<div key={d}>{d}</div>))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthGrid.map(({ d, iso, inMonth, disabled: dis }) => {
              const isSel = selectedDate && sameDay(d, selectedDate);
              const isToday = sameDay(d, today);
              const cls = [
                'h-8 rounded text-sm flex items-center justify-center cursor-pointer',
                inMonth ? '' : 'text-gray-400',
                dis ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-50',
                isSel ? 'bg-blue-600 text-white hover:bg-blue-600' : '',
                !isSel && isToday ? 'ring-1 ring-blue-400' : ''
              ].join(' ').trim();
              return (
                <button key={iso} type="button" className={cls} disabled={dis} onClick={() => { commit(iso); setOpen(false); }}>
                  {d.getDate()}
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
