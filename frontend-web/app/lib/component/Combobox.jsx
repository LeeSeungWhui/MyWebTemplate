/**
 * 파일명: Combobox.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-05
 * 설명: EasyList/EasyObj와 동기화되는 필터 가능한 콤보박스
 */
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  getBoundValue,
  setBoundValue,
  buildCtx,
  fireValueHandlers,
} from '../binding'
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko'

const STATUS_PRESETS = {
  default: {
    button:
      'border border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900',
    message: 'text-gray-600',
    ariaLive: 'polite',
  },
  success: {
    button:
      'border border-green-400 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900',
    message: 'text-green-600',
    defaultMessage: COMMON_COMPONENT_LANG_KO.combobox.saved,
    ariaLive: 'polite',
  },
  warning: {
    button:
      'border border-yellow-400 focus:ring-yellow-500 focus:border-yellow-500 bg-white text-gray-900',
    message: 'text-yellow-700',
    defaultMessage: COMMON_COMPONENT_LANG_KO.combobox.needsConfirm,
    ariaLive: 'polite',
  },
  error: {
    button:
      'border border-red-400 focus:ring-red-500 focus:border-red-500 bg-white text-gray-900',
    message: 'text-red-600',
    defaultMessage: COMMON_COMPONENT_LANG_KO.combobox.invalidValue,
    ariaLive: 'assertive',
  },
  info: {
    button:
      'border border-blue-300 focus:ring-blue-400 focus:border-blue-400 bg-white text-gray-900',
    message: 'text-blue-600',
    ariaLive: 'polite',
  },
  loading: {
    button:
      'border border-blue-300 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 pr-9',
    message: 'text-blue-600',
    defaultMessage: COMMON_COMPONENT_LANG_KO.combobox.loading,
    ariaLive: 'polite',
  },
  empty: {
    button:
      'border border-gray-300 bg-white text-gray-500 focus:ring-blue-400 focus:border-blue-400',
    message: 'text-gray-500',
    defaultMessage: COMMON_COMPONENT_LANG_KO.combobox.noItems,
    ariaLive: 'assertive',
  },
  disabled: {
    button:
      'border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed',
    message: 'text-gray-500',
    ariaLive: 'polite',
  },
}

const CHO = [
  '\u3131',
  '\u3132',
  '\u3134',
  '\u3137',
  '\u3138',
  '\u3139',
  '\u3141',
  '\u3142',
  '\u3143',
  '\u3145',
  '\u3146',
  '\u3147',
  '\u3148',
  '\u3149',
  '\u314A',
  '\u314B',
  '\u314C',
  '\u314D',
  '\u314E',
]
const H_BASE = 0xac00
const H_LAST = 0xd7a3

/**
 * @description 한글 문자열을 초성 검색 가능한 비교 문자열로 바꾸는 변환 유틸.
 * 처리 규칙: 완성형 한글은 초성 배열로 치환하고, 비한글 문자는 원문을 유지한다.
 * @updated 2026-02-27
 */
const getChosung = (str) => {
  if (!str) return ''
  let out = ''
  for (const ch of String(str)) {
    const code = ch.charCodeAt(0)
    if (code >= H_BASE && code <= H_LAST) {
      const idx = Math.floor((code - H_BASE) / 588)
      out += CHO[idx] || ch
    } else out += ch
  }
  return out
}

/**
 * @description 검색 비교용 문자열 정규화 유틸(소문자/무공백).
 * 반환값: null/undefined 입력도 안전하게 처리한 비교용 문자열.
 * @updated 2026-02-27
 */
const normalize = (inputText) =>
  String(inputText ?? '')
    .toLowerCase()
    .replace(/\s+/g, '')

/**
 * @description 입력 옵션 목록을 콤보박스 내부 표준 스키마로 맞추는 매퍼.
 * 처리 규칙: iterable만 허용하고 value/label/selected/placeholder/raw 필드를 생성한다.
 * @updated 2026-02-27
 */
const normalizeOptions = (dataList = [], valueKey, textKey) => {
  if (!Array.isArray(dataList) && typeof dataList?.[Symbol.iterator] !== 'function') {
    return []
  }
  return Array.from(dataList).map((item, index) => {
    const rawValue = item?.[valueKey]
    const value = Array.isArray(rawValue)
      ? rawValue.map((rawItemValue) => String(rawItemValue))
      : String(rawValue ?? '')
    return {
      key: Object.prototype.hasOwnProperty.call(item, valueKey) ? rawValue : index,
      value,
      label: String(item?.[textKey] ?? ''),
      selected: !!item?.selected,
      placeholder: !!item?.placeholder,
      raw: item,
    }
  })
}

/**
 * @description EasyObj/EasyList subscribe API를 React effect로 연결
 * 처리 규칙: subscribe 함수가 있으면 등록하고, effect cleanup에서 unsubscribe를 보장한다.
 * @updated 2026-02-27
 */
function useEasySubscription(model, handler) {
  useEffect(() => {
    if (!model || typeof model.subscribe !== 'function') return undefined
    const unsubscribe = model.subscribe(handler)
    return () => unsubscribe?.()
  }, [model, handler])
}

const Combobox = forwardRef((props, ref) => {
  const {
    dataList = [],
    valueKey = 'value',
    textKey = 'text',
    dataObj = null,
    dataKey = null,
    value: valueProp,
    defaultValue = '',
    onChange,
    onValueChange,
    placeholder = COMMON_COMPONENT_LANG_KO.combobox.placeholder,
    className = '',
    disabled = false,
    id,
    filterable = true,
    noResultsText = COMMON_COMPONENT_LANG_KO.combobox.noResults,
    multi = false,
    multiSummary = false,
    summaryText = COMMON_COMPONENT_LANG_KO.combobox.summaryText,
    showSelectAll = false,
    selectAllText = COMMON_COMPONENT_LANG_KO.combobox.selectAllText,
    clearAllText = COMMON_COMPONENT_LANG_KO.combobox.clearAllText,
    status: statusProp,
    statusMessage,
    assistiveText,
    error,
    'aria-describedby': ariaDescribedByProp,
    ...rest
  } = props

  const reactId = useId()
  const buttonId = id || `combobox-${reactId}`
  const listboxId = `${buttonId}-listbox`

  const isControlled = valueProp !== undefined

  const options = useMemo(
    () => normalizeOptions(dataList, valueKey, textKey),
    [dataList, valueKey, textKey],
  )

  const placeholderOption = useMemo(
    () => options.find((opt) => opt.placeholder),
    [options],
  )

  const selectedFromList = useMemo(() => {
    if (multi) return options.filter((opt) => opt.selected)
    return options.find((opt) => opt.selected)
  }, [options, multi])

  const deriveBoundValue = useCallback(() => {
    if (multi) {
      const bound = dataObj && dataKey ? getBoundValue(dataObj, dataKey) : undefined
      if (isControlled) {
        const arr = Array.isArray(valueProp) ? valueProp : []
        return arr.map((valueItem) => String(valueItem))
      }
      if (Array.isArray(bound)) return bound.map((valueItem) => String(valueItem))
      const selectedList = Array.isArray(selectedFromList) ? selectedFromList : []
      if (selectedList.length > 0) {
        return selectedList.map((opt) => opt.value)
      }
      if (Array.isArray(defaultValue)) return defaultValue.map((valueItem) => String(valueItem))
      return []
    }
    if (isControlled) return String(valueProp ?? '')
    const bound = dataObj && dataKey ? getBoundValue(dataObj, dataKey) : undefined
    if (bound !== undefined && bound !== null) return String(bound)
    if (selectedFromList && !Array.isArray(selectedFromList)) {
      return selectedFromList.value
    }
    if (defaultValue !== undefined && defaultValue !== null) {
      return String(defaultValue)
    }
    if (placeholderOption) return placeholderOption.value
    return ''
  }, [
    dataObj,
    dataKey,
    defaultValue,
    isControlled,
    multi,
    placeholderOption,
    selectedFromList,
    valueProp,
  ])

  const [innerValue, setInnerValue] = useState(() => deriveBoundValue())

  const currentValue = useMemo(() => {
    if (multi) {
      return (isControlled ? valueProp : innerValue) || []
    }
    return isControlled ? String(valueProp ?? '') : innerValue
  }, [innerValue, isControlled, multi, valueProp])

  const valueSet = useMemo(() => {
    if (multi) return new Set((currentValue || []).map((valueItem) => String(valueItem)))
    return new Set([String(currentValue ?? '')])
  }, [currentValue, multi])

  const isEmptySelection = multi
    ? valueSet.size === 0
    : !currentValue && placeholderOption

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)

  const normalizedStatus = disabled
    ? 'disabled'
    : statusProp || (error ? 'error' : 'default')
  const statusMeta = STATUS_PRESETS[normalizedStatus] || STATUS_PRESETS.default
  const messageText =
    statusMessage ??
    statusMeta.defaultMessage ??
    (normalizedStatus === 'disabled' ? COMMON_COMPONENT_LANG_KO.combobox.disabled : '')

  const messageId =
    messageText || assistiveText
      ? `${buttonId}-status`
      : undefined

  const filtered = useMemo(() => {
    if (!filterable || !query) return options
    const normalizedQuery = normalize(query)
    const normalizedQueryInitial = normalize(getChosung(query))
    const onlyCho = /^[\u3131-\u314E]+$/.test(query)
    return options.filter((opt) => {
      const lower = normalize(opt.label)
      const init = normalize(getChosung(opt.label))
      if (onlyCho) return init.includes(normalizedQuery)
      return lower.includes(normalizedQuery) || init.includes(normalizedQueryInitial)
    })
  }, [options, filterable, query])

  const selectableOptions = options.filter((opt) => !opt.placeholder)
  const allSelected =
    multi &&
    selectableOptions.length > 0 &&
    selectableOptions.every((opt) => valueSet.has(String(opt.value)))

  const syncDataListSelection = useCallback(
    (nextSet) => {

      /**
       * @description 개별 옵션 selected 값을 nextSet 기준으로 동기화하는 내부 updater.
       * 부작용: 원본 item.selected 값을 직접 갱신한다.
       * @updated 2026-02-27
       */
      const updater = (item) => {
        const key = Array.isArray(item?.[valueKey])
          ? item?.[valueKey].map((valueItem) => String(valueItem))
          : String(item?.[valueKey] ?? '')
        const shouldSelect = Array.isArray(key)
          ? key.every((k) => nextSet.has(k))
          : nextSet.has(String(key))
        if (item.selected !== shouldSelect) item.selected = shouldSelect
        return item
      }

      if (typeof dataList?.forAll === 'function') {
        dataList.forAll(updater)
      } else if (Array.isArray(dataList)) {
        dataList.forEach(updater)
      }
    },
    [dataList, valueKey],
  )

  useEffect(() => {
    const nextSet = new Set(valueSet)
    syncDataListSelection(nextSet)
  }, [syncDataListSelection, valueSet])

  useEffect(() => {
    if (!open) return

    /**
     * @description 컴포넌트 외부 클릭 시 드롭다운 닫기.
     * 처리 규칙: rootRef 바깥 mousedown 이벤트에서만 close를 수행한다.
     * @updated 2026-02-27
     */
    const onMouseDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    /**
     * @description Escape 키 입력으로 드롭다운 닫기.
     * 처리 규칙: key 값이 Escape일 때 open=false를 반영한다.
     * @updated 2026-02-27
     */
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    if (isControlled) return
    const next = deriveBoundValue()
    setInnerValue((prev) => {
      const prevString = JSON.stringify(prev)
      const nextString = JSON.stringify(next)
      return prevString === nextString ? prev : next
    })
  }, [deriveBoundValue, isControlled])

  useEasySubscription(
    dataObj,
    useCallback(
      (detail) => {
        if (!dataKey || !detail) return
        const key = String(dataKey)
        const changed = detail?.ctx?.dataKey ?? detail?.pathString ?? ''
        const isMatch =
          changed === key || changed.endsWith(`.${key}`)
        if (isMatch) {
          if (isControlled) return
          const next = deriveBoundValue()
          setInnerValue((prev) => {
            const prevString = JSON.stringify(prev)
            const nextString = JSON.stringify(next)
            return prevString === nextString ? prev : next
          })
        }
      },
      [dataKey, deriveBoundValue, isControlled],
    ),
  )

  useEasySubscription(
    dataList,
    useCallback(() => {
      if (isControlled) return
      const next = deriveBoundValue()
      setInnerValue((prev) => {
        const prevString = JSON.stringify(prev)
        const nextString = JSON.stringify(next)
        return prevString === nextString ? prev : next
      })
    }, [deriveBoundValue, isControlled]),
  )

  /**
   * @description 선택 결과를 정규화하고 내부 상태/바인딩/핸들러 호출을 동기화
   * 부작용: innerValue, dataObj[dataKey], onChange/onValueChange에 반영된다.
   * @updated 2026-02-27
   */
  const commit = (next, event) => {
    let normalized = String(next ?? '')
    if (multi) {
      normalized = Array.from(
        new Set(Array.isArray(next) ? next.map((valueItem) => String(valueItem)) : []),
      )
    }
    const nextSet = new Set(multi ? normalized : [normalized])
    syncDataListSelection(nextSet)

    if (!isControlled) setInnerValue(normalized)
    if (dataObj && dataKey) {
      setBoundValue(dataObj, dataKey, normalized)
    }

    const ctx = buildCtx({
      dataKey,
      dataObj,
      source: 'user',
      valid: null,
      dirty: true,
    })
    let normalizedEvent = { target: { value: normalized } }
    if (event) {
      normalizedEvent = { ...event, target: { ...event.target, value: normalized } }
    }
    fireValueHandlers({
      onChange,
      onValueChange,
      value: normalized,
      ctx,
      event: normalizedEvent,
    })
  }

  /**
   * @description 옵션 클릭 이벤트를 단일/다중 선택 모델에 맞춰 반영하는 입력 핸들러.
   * 처리 규칙: multi 모드면 토글 집합을 만들고, 단일 모드면 즉시 선택 후 패널을 닫는다.
   * @updated 2026-02-27
   */
  const handleSelect = (option) => {
    if (multi) {
      const next = new Set(valueSet)
      if (next.has(option.value)) next.delete(option.value)
      else next.add(option.value)
      commit(Array.from(next), null)
    } else {
      commit(option.value, null)
      setOpen(false)
    }
  }

  const ariaDescribedBy = [ariaDescribedByProp, messageId]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <div
      className={`relative ${className}`.trim()}
      ref={rootRef}
      {...rest}
    >
      <button
        type="button"
        id={buttonId}
        className={`w-full text-left px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
          statusMeta.button
        }`}
        onClick={() => {
          if (disabled) return
          setOpen((isOpen) => !isOpen)
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        disabled={disabled || normalizedStatus === 'disabled'}
        aria-invalid={normalizedStatus === 'error' ? true : undefined}
        aria-busy={normalizedStatus === 'loading' ? true : undefined}
        aria-describedby={ariaDescribedBy}
        ref={ref}
      >
        <span className="flex items-center justify-between gap-2">
          <span>
            {(() => {
              if (multi) {
                if (valueSet.size === 0) {
                  return placeholderOption?.label || placeholder
                }
                if (multiSummary) {
                  return (
                    <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5">
                      {summaryText.replace('{count}', String(valueSet.size))}
                    </span>
                  )
                }
                const labels = options.filter((opt) => valueSet.has(String(opt.value))).map((opt) => opt.label)
                return labels.join(', ')
              }
              const selected = options.find((opt) =>
                valueSet.has(String(opt.value)),
              )
              return (
                selected?.label ||
                placeholderOption?.label ||
                placeholder
              )
            })()}
          </span>
          <span className="flex items-center gap-1 text-gray-400">
            {normalizedStatus === 'loading' && (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-transparent"
                aria-hidden="true"
              />
            )}
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.185l3.71-3.954a.75.75 0 011.08 1.04l-4.243 4.52a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          {(multi && showSelectAll) && (
            <div className="px-3 py-2 flex items-center justify-between text-sm border-b border-gray-200">
              <span className="text-gray-700">
                {allSelected ? clearAllText : selectAllText}
              </span>
              <button
                type="button"
                className="px-2 py-0.5 text-xs rounded border border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  if (allSelected) commit([], null)
                  else
                    commit(
                      selectableOptions.map((opt) => String(opt.value)),
                      null,
                    )
                }}
              >
                {allSelected ? COMMON_COMPONENT_LANG_KO.combobox.toggleClear : COMMON_COMPONENT_LANG_KO.combobox.toggleAll}
              </button>
            </div>
          )}
          {filterable && (
            <div className="p-2 border-b border-gray-200">
              <input
                autoFocus
                className="w-full px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={COMMON_COMPONENT_LANG_KO.combobox.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}
          <ul
            id={listboxId}
            role="listbox"
            className="max-h-60 overflow-auto py-1"
            aria-multiselectable={multi || undefined}
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500 select-none">
                {noResultsText}
              </li>
            )}
            {filtered.map((opt) => {
              let selected = valueSet.has(String(opt.value))
              if (multi) {
                if (Array.isArray(currentValue)) {
                  selected = valueSet.has(String(opt.value))
                }
              }
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={selected}
                  className={`cursor-pointer px-3 py-2 text-sm hover:bg-blue-50 ${
                    selected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'
                  }`}
                  onClick={() => handleSelect(opt)}
                >
                  {opt.label}
                </li>
              )
            })}
          </ul>
        </div>
      )}

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

Combobox.displayName = 'Combobox'

/**
 * @description Combobox export를 노출
 */
export default Combobox
