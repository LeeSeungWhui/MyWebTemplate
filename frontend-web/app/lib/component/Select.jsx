'use client';
/**
 * File: Select.jsx
 * Author: LSH
 * Updated: 2025-09-13
 * Description: Select UI component (EasyObj/EasyList binding + controlled mode).
 */
import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';

const Select = forwardRef(({
  dataList = [],
  valueKey = 'value',
  textKey = 'text',
  placeholder,
  dataObj,
  dataKey,
  value,
  defaultValue,
  onChange,
  onValueChange,
  status = 'idle',
  invalid,
  errorMessage,
  hint,
  className = '',
  disabled = false,
  emptyMessage,
  emptyMessageKey = 'component.select.empty',
  resolveResource,
  resources,
  ...props
}, ref) => {
  const isBound = !!(dataObj && dataKey);
  const isControlled = !isBound && typeof value !== 'undefined';

  useEffect(() => {
    if (dataObj && typeof value !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn('[Select] dataObj/dataKey with value prop detected. Prefer either binding or controlled mode. (CU-WEB-003)');
    }
  }, [dataObj, value]);

  const [innerValue, setInnerValue] = useState(() => {
    if (isBound) return '';
    if (isControlled) return value;
    if (typeof defaultValue !== 'undefined') return defaultValue;
    const selected = dataList.find((item) => item && item.selected);
    return selected ? selected[valueKey] : '';
  });

  const [, setTick] = useState(0);
  useEffect(() => {
    if (!isBound || !dataObj?.subscribe) return;
    const unsubscribe = dataObj.subscribe(() => setTick((t) => t + 1));
    return () => unsubscribe?.();
  }, [isBound, dataObj]);

  const resolveText = (key, fallback) => {
    if (typeof resolveResource === 'function') {
      const resolved = resolveResource(key, fallback);
      if (typeof resolved === 'string' && resolved.trim().length > 0) return resolved;
    }
    if (resources) {
      if (typeof resources === 'function') {
        const fnResolved = resources(key, fallback);
        if (typeof fnResolved === 'string' && fnResolved.trim().length > 0) return fnResolved;
      }
      if (typeof key === 'string' && typeof resources[key] === 'string' && resources[key].trim().length > 0) {
        return resources[key];
      }
      if (typeof resources?.get === 'function') {
        const got = resources.get(key, fallback);
        if (typeof got === 'string' && got.trim().length > 0) return got;
      }
      if (typeof resources?.t === 'function') {
        const translated = resources.t(key, fallback);
        if (typeof translated === 'string' && translated.trim().length > 0) return translated;
      }
    }
    if (typeof fallback === 'string' && fallback.length > 0) return fallback;
    return key;
  };

  const rawSelectedValue = isBound ? getBoundValue(dataObj, dataKey) : (isControlled ? value : innerValue);
  const selectedValue = rawSelectedValue == null ? '' : String(rawSelectedValue);

  const placeholderOption = useMemo(
    () => dataList.find((item) => item && item.placeholder),
    [dataList],
  );
  const isPlaceholderSelected = placeholderOption && (selectedValue === '' || selectedValue === String(placeholderOption?.[valueKey]));

  const baseStyle = 'block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none bg-white';
  const states = {
    default: 'border border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    error: 'border border-red-300 focus:ring-red-500 focus:border-red-500',
    disabled: 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed',
    loading: 'bg-gray-50 text-gray-500 border-gray-300 cursor-progress',
    empty: 'bg-gray-50 text-gray-400 border-gray-300',
    success: 'border border-green-300 focus:ring-green-500 focus:border-green-500',
  };

  const isEmpty = status === 'empty' || (Array.isArray(dataList) && dataList.length === 0);
  const computedDisabled = disabled || status === 'loading' || status === 'disabled';
  const isInvalid = !!(typeof invalid !== 'undefined' ? invalid : (status === 'error'));

  const emptyOptionLabel = resolveText(
    emptyMessageKey,
    typeof emptyMessage !== 'undefined'
      ? emptyMessage
      : (typeof placeholder !== 'undefined' ? placeholder : 'No options available'),
  );

  const selectClass = [
    baseStyle,
    computedDisabled
      ? states.disabled
      : isInvalid
        ? states.error
        : status === 'success'
          ? states.success
          : status === 'loading'
            ? states.loading
            : isEmpty
              ? states.empty
              : states.default,
    isPlaceholderSelected ? 'text-gray-400' : 'text-gray-900',
    className,
  ].join(' ').trim();

  const handleChange = (event) => {
    const nextValue = event.target.value;
    const selectedText = event.target.options?.[event.target.selectedIndex]?.text;

    try {
      if (dataList?.forAll) {
        dataList.forAll((item) => {
          if (!item) return item;
          item.selected = String(item[valueKey]) === String(nextValue);
          return item;
        });
      } else if (Array.isArray(dataList)) {
        dataList.forEach((item) => {
          if (!item) return;
          item.selected = String(item[valueKey]) === String(nextValue);
        });
      }
    } catch (error) {
      // ignore mutations if dataList is not writable
    }

    if (isBound) {
      setBoundValue(dataObj, dataKey, nextValue);
    } else if (!isControlled) {
      setInnerValue(nextValue);
    }

    const ctx = buildCtx({ dataKey, dataObj, source: 'user', valid: null, dirty: true });
    fireValueHandlers({ onChange, onValueChange, value: nextValue, ctx, event });

    try {
      if (event?.detail && typeof event.detail === 'object') {
        event.detail.text = selectedText;
      }
    } catch (error) {
      // ignore detail assignment issues
    }
  };

  const dropdownIcon = (
    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </div>
  );

  const describedByIds = [props['aria-describedby']].filter(Boolean);
  if (hint) describedByIds.push(`${props.id || 'select'}-hint`);
  if (errorMessage && isInvalid) describedByIds.push(`${props.id || 'select'}-error`);

  return (
    <div className="relative">
      <select
        ref={ref}
        value={selectedValue}
        onChange={handleChange}
        disabled={computedDisabled || isEmpty}
        className={selectClass}
        aria-invalid={isInvalid}
        aria-busy={status === 'loading' ? true : undefined}
        aria-describedby={describedByIds.length ? describedByIds.join(' ') : undefined}
        {...props}
      >
        {isEmpty ? (
          <option value="" disabled>{emptyOptionLabel}</option>
        ) : (
          dataList.map((item, index) => (
            <option
              key={index}
              value={item?.[valueKey] == null ? '' : String(item[valueKey])}
              className={item?.placeholder ? 'text-gray-400' : 'text-gray-900'}
            >
              {item?.[textKey]}
            </option>
          ))
        )}
      </select>
      {dropdownIcon}
      {hint && (
        <p id={`${props.id || 'select'}-hint`} className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
      {errorMessage && isInvalid && (
        <p id={`${props.id || 'select'}-error`} className="mt-1 text-xs text-red-600">{errorMessage}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
