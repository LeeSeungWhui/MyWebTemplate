// TimeInput.jsx
// Updated: 2025-09-09
// Purpose: Simple time input with EasyObj binding
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';
import Icon from './Icon';

const pad2 = (n) => String(n).padStart(2, '0');

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
  const isData = !!(dataObj && dataKey);

  const [inner, setInner] = useState(defaultValue);
  const [text, setText] = useState(() => (propValue ?? (isData ? getBoundValue(dataObj, dataKey) : inner) ?? ''));
  const [open, setOpen] = useState(false);

  const getExternal = () => {
    if (isPropControlled) return propValue ?? '';
    if (isData) return getBoundValue(dataObj, dataKey) ?? '';
    return inner ?? '';
  };

  useEffect(() => { setText(isPropControlled ? (propValue ?? '') : (isData ? (getBoundValue(dataObj, dataKey) ?? '') : inner ?? '')); }, [propValue, dataObj, dataKey]);

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
  const inputId = id || (dataKey ? `time_${String(dataKey).replace(/[^a-zA-Z0-9_]+/g, '_')}` : undefined);
  const inputRef = useRef(null);
  const rootRef = useRef(null);

  const interval = Math.max(1, step ?? 30); // seconds step for list granularity (default 30)
  const items = useMemo(() => {
    const res = [];
    for (let s = 0; s < 24 * 60 * 60; s += interval * 60) {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      res.push(`${pad2(h)}:${pad2(m)}`);
    }
    return res;
  }, [interval]);

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
        step={step}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const v = e.currentTarget.value;
            if (/^\d{2}:\d{2}$/.test(v)) commit(v, e); else setText(value);
            setOpen(false);
          }
        }}
        onBlur={(e) => {
          const v = e.target.value;
          if (/^\d{2}:\d{2}$/.test(v)) commit(v, e); else setText(value);
        }}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={false}
        aria-haspopup="listbox"
        aria-expanded={open}
        {...props}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-2 my-auto h-6 w-6 rounded hover:bg-gray-100 text-gray-500 flex items-center justify-center"
        onClick={() => setOpen((v) => !v)}
        tabIndex={-1}
        aria-label="open time picker"
        disabled={disabled || readOnly}
      >
        <Icon icon="md:MdAccessTime" className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-40 max-h-64 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg p-1" role="listbox" id={inputId ? `${inputId}_list` : undefined}>
          {items.map((t) => (
            <div
              key={t}
              role="option"
              aria-selected={t === value}
              className={`px-2 py-1 text-sm rounded cursor-pointer hover:bg-blue-50 ${t === value ? 'bg-blue-100' : ''}`}
              onClick={() => { commit(t); setOpen(false); }}
            >
              {t}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

TimeInput.displayName = 'TimeInput';

export default TimeInput;
