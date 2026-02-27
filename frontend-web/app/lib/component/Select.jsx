/**
 * 파일명: Select.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-05
 * 설명: EasyObj/EasyList 바운드 및 컨트롤드 모드를 모두 지원하는 Select 컴포넌트
 */
import { forwardRef, useCallback, useEffect, useId, useMemo, useState } from 'react'
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding'
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko'

const STATUS_PRESETS = {
  default: {
    select: 'border border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    message: 'text-gray-600',
    ariaLive: 'polite',
  },
  success: {
    select:
      'border border-green-400 focus:ring-green-500 focus:border-green-500',
    message: 'text-green-600',
    defaultMessage: COMMON_COMPONENT_LANG_KO.select.saved,
    ariaLive: 'polite',
  },
  warning: {
    select:
      'border border-yellow-400 focus:ring-yellow-500 focus:border-yellow-500',
    message: 'text-yellow-700',
    defaultMessage: COMMON_COMPONENT_LANG_KO.select.needsConfirm,
    ariaLive: 'polite',
  },
  error: {
    select: 'border border-red-400 focus:ring-red-500 focus:border-red-500',
    message: 'text-red-600',
    defaultMessage: COMMON_COMPONENT_LANG_KO.select.invalidValue,
    ariaLive: 'assertive',
  },
  info: {
    select: 'border border-blue-300 focus:ring-blue-400 focus:border-blue-400',
    message: 'text-blue-600',
    ariaLive: 'polite',
  },
  loading: {
    select:
      'border border-blue-300 focus:ring-blue-500 focus:border-blue-500 pr-9',
    message: 'text-blue-600',
    defaultMessage: COMMON_COMPONENT_LANG_KO.select.loading,
    ariaLive: 'polite',
  },
  empty: {
    select:
      'border border-gray-300 bg-white text-gray-500 focus:ring-blue-400 focus:border-blue-400',
    message: 'text-gray-500',
    defaultMessage: COMMON_COMPONENT_LANG_KO.select.noItems,
    ariaLive: 'assertive',
  },
  disabled: {
    select:
      'bg-gray-100 text-gray-500 border border-gray-300 cursor-not-allowed',
    message: 'text-gray-500',
    ariaLive: 'polite',
  },
}

/**
 * @description 입력 옵션 목록을 Select 내부 표준 구조로 정규화한다.
 * 반환값: `{key,value,label,placeholder,selected,raw}` 형태의 옵션 배열.
 * @updated 2026-02-27
 */
const normalizeOptions = (dataList = [], valueKey, textKey) => {
  if (!Array.isArray(dataList) && typeof dataList?.[Symbol.iterator] !== 'function') {
    return []
  }
  return Array.from(dataList).map((item, index) => ({
    key: Object.prototype.hasOwnProperty.call(item, valueKey) ? item[valueKey] : index,
    value: String(item?.[valueKey] ?? ''),
    label: String(item?.[textKey] ?? ''),
    placeholder: !!item?.placeholder,
    selected: !!item?.selected,
    raw: item,
  }))
}

/**
 * @description EasyObj/EasyList subscribe API를 React effect 수명주기에 연결한다.
 * 처리 규칙: subscribe가 있으면 등록하고 cleanup에서 unsubscribe를 호출한다.
 * @updated 2026-02-27
 */
function useEasySubscription(model, handler) {
  useEffect(() => {
    if (!model || typeof model.subscribe !== 'function') return undefined
    const unsubscribe = model.subscribe(handler)
    return () => unsubscribe?.()
  }, [model, handler])
}

const Select = forwardRef((props, ref) => {
  const {
    dataList = [],
    valueKey = 'value',
    textKey = 'text',
    dataObj = null,
    dataKey = null,
    value: valueProp,
    defaultValue = '',
    placeholder,
    status: statusProp,
    statusMessage,
    assistiveText,
    disabled = false,
    className = '',
    id,
    onChange,
    onValueChange,
    error,
    'aria-describedby': ariaDescribedByProp,
    ...rest
  } = props

  const isControlled = valueProp !== undefined
  const reactId = useId()
  const selectId = id || `select-${reactId}`

  const normalizedOptions = useMemo(
    () => normalizeOptions(dataList, valueKey, textKey),
    [dataList, valueKey, textKey],
  )
  const placeholderOption = useMemo(
    () => normalizedOptions.find((opt) => opt.placeholder),
    [normalizedOptions],
  )

  const deriveValueFromSources = useCallback(() => {
    if (isControlled) return String(valueProp ?? '')
    const hasBoundSrc = dataObj && dataKey
    if (hasBoundSrc) {
      const bound = getBoundValue(dataObj, dataKey)
      if (bound !== undefined && bound !== null) return String(bound)
    }
    const selectedFromList =
      normalizedOptions.find((opt) => opt.raw?.selected) ||
      normalizedOptions.find((opt) => opt.selected)
    if (selectedFromList) return selectedFromList.value
    if (defaultValue !== undefined && defaultValue !== null) return String(defaultValue)
    if (placeholderOption) return placeholderOption.value
    return ''
  }, [isControlled, valueProp, dataObj, dataKey, normalizedOptions, defaultValue, placeholderOption])

  const [innerValue, setInnerValue] = useState(() => deriveValueFromSources())
  const currentValue = isControlled ? String(valueProp ?? '') : innerValue

  // 한글설명: Sync EasyList selection flags with the resolved value
  useEffect(() => {
    const normalized = String(currentValue ?? '')

    /**
     * @description 현재 값과 일치하는 항목의 selected 플래그를 재계산한다.
     * 부작용: item.selected 값을 직접 갱신한다.
     * @updated 2026-02-27
     */
    const updater = (item) => {
      const nextSelected = String(item?.[valueKey] ?? '') === normalized
      if (item.selected !== nextSelected) item.selected = nextSelected
      return item
    }

    if (typeof dataList?.forAll === 'function') {
      dataList.forAll(updater)
    } else if (Array.isArray(dataList)) {
      dataList.forEach(updater)
    }
  }, [dataList, valueKey, currentValue])

  // 한글설명: Update inner value when external sources change
  useEffect(() => {
    if (isControlled) return
    const next = deriveValueFromSources()
    setInnerValue((prev) => (prev === next ? prev : next))
  }, [deriveValueFromSources, isControlled])

  // 한글설명: Subscribe to EasyObj/EasyList updates so that external mutations reflect immediately
  useEasySubscription(
    dataObj,
    useCallback(
      (detail) => {
        if (!detail || !dataKey) return
        const key = String(dataKey)
        const changedKey =
          detail?.ctx?.dataKey ?? detail?.pathString ?? ''
        const isMatch =
          changedKey === key || changedKey.endsWith(`.${key}`)
        if (isMatch) {
          const next = deriveValueFromSources()
          setInnerValue((prev) => (prev === next ? prev : next))
        }
      },
      [dataKey, deriveValueFromSources],
    ),
  )

  useEasySubscription(
    dataList,
    useCallback(() => {
      if (isControlled) return
      const next = deriveValueFromSources()
      setInnerValue((prev) => (prev === next ? prev : next))
    }, [isControlled, deriveValueFromSources]),
  )

  const normalizedStatus = disabled
    ? 'disabled'
    : statusProp || (error ? 'error' : 'default')
  const statusMeta =
    STATUS_PRESETS[normalizedStatus] || STATUS_PRESETS.default
  const messageText =
    statusMessage ??
    statusMeta.defaultMessage ??
    (normalizedStatus === 'disabled' ? COMMON_COMPONENT_LANG_KO.select.disabled : '')

  const isPlaceholderSelected =
    placeholderOption &&
    (!currentValue || currentValue === placeholderOption.value)

  const messageId =
    messageText || assistiveText
      ? `${selectId}-status`
      : undefined
  const ariaDescribedBy =
    [ariaDescribedByProp, messageId].filter(Boolean).join(' ') || undefined

  /**
   * @description 선택 변경 이벤트를 상태/바인딩/핸들러 규약으로 동기화한다.
   * 처리 규칙: 내부 값 업데이트 후 dataList selected 플래그, dataObj[dataKey], fireValueHandlers 순서로 반영한다.
   * @updated 2026-02-27
   */
  const handleChange = (event) => {
    const nextValue = event.target.value
    if (!isControlled) setInnerValue(nextValue)
    if (typeof dataList?.forAll === 'function') {
      dataList.forAll((item) => {
        const match = String(item?.[valueKey] ?? '') === String(nextValue)
        if (item.selected !== match) item.selected = match
        return item
      })
    } else if (Array.isArray(dataList)) {
      dataList.forEach((item) => {
        item.selected = String(item?.[valueKey] ?? '') === String(nextValue)
      })
    }
    if (dataObj && dataKey) {
      setBoundValue(dataObj, dataKey, nextValue)
    }
    const ctx = buildCtx({
      dataKey,
      dataObj,
      source: 'user',
      valid: null,
      dirty: true,
    })
    const modifiedEvent = {
      ...event,
      target: { ...event.target, value: nextValue },
    }
    fireValueHandlers({
      onChange,
      onValueChange,
      value: nextValue,
      ctx,
      event: modifiedEvent,
    })
  }

  const baseStyle =
    'block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none bg-white transition-colors'
  const selectClass = [
    baseStyle,
    statusMeta.select,
    isPlaceholderSelected ? 'text-gray-400' : 'text-gray-900',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="relative">
      <select
        ref={ref}
        id={selectId}
        value={currentValue}
        onChange={handleChange}
        disabled={disabled || normalizedStatus === 'disabled'}
        className={selectClass}
        aria-invalid={normalizedStatus === 'error' ? true : undefined}
        aria-busy={normalizedStatus === 'loading' ? true : undefined}
        aria-describedby={ariaDescribedBy}
        {...rest}
      >
        {placeholder &&
          !normalizedOptions.some((opt) => opt.placeholder) && (
            <option value="" className="text-gray-400">
              {placeholder}
            </option>
          )}
        {normalizedOptions.map((opt) => (
          <option
            key={opt.key}
            value={opt.value}
            className={opt.placeholder ? 'text-gray-400' : 'text-gray-900'}
          >
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        {normalizedStatus === 'loading' ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-transparent"
            aria-hidden="true"
          />
        ) : (
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      {messageId && (
        <p
          id={messageId}
          className={`mt-1 text-xs ${
            messageText ? statusMeta.message : 'sr-only'
          }`}
          aria-live={statusMeta.ariaLive || 'polite'}
        >
          {messageText || assistiveText}
          {messageText && assistiveText && (
            <span className="sr-only">{assistiveText}</span>
          )}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

/**
 * @description Select export를 노출한다.
 */
export default Select
