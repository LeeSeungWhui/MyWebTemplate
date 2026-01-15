/**
 * 파일명: Select.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-05
 * 설명: EasyList selected 플래그 기반 커스텀 Select 컴포넌트
 */
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Icon from "./Icon";

const STATUS_PRESETS = {
  default: {
    select: "border border-gray-300 focus:ring-blue-500 focus:border-blue-500",
    message: "text-gray-600",
    ariaLive: "polite",
  },
  success: {
    select:
      "border border-green-400 focus:ring-green-500 focus:border-green-500",
    message: "text-green-600",
    defaultMessage: "선택이 저장되었습니다.",
    ariaLive: "polite",
  },
  warning: {
    select:
      "border border-yellow-400 focus:ring-yellow-500 focus:border-yellow-500",
    message: "text-yellow-700",
    defaultMessage: "추가 확인이 필요합니다.",
    ariaLive: "polite",
  },
  error: {
    select: "border border-red-400 focus:ring-red-500 focus:border-red-500",
    message: "text-red-600",
    defaultMessage: "유효하지 않은 값입니다.",
    ariaLive: "assertive",
  },
  info: {
    select: "border border-blue-300 focus:ring-blue-400 focus:border-blue-400",
    message: "text-blue-600",
    ariaLive: "polite",
  },
  loading: {
    select:
      "border border-blue-300 focus:ring-blue-500 focus:border-blue-500 pr-9",
    message: "text-blue-600",
    defaultMessage: "불러오는 중…",
    ariaLive: "polite",
  },
  empty: {
    select:
      "border border-gray-300 bg-white text-gray-500 focus:ring-blue-400 focus:border-blue-400",
    message: "text-gray-500",
    defaultMessage: "표시할 항목이 없습니다.",
    ariaLive: "assertive",
  },
  disabled: {
    select:
      "bg-gray-100 text-gray-500 border border-gray-300 cursor-not-allowed",
    message: "text-gray-500",
    ariaLive: "polite",
  },
};

const normalizeOptions = (dataList = [], valueKey, textKey) => {
  if (
    !Array.isArray(dataList) &&
    typeof dataList?.[Symbol.iterator] !== "function"
  ) {
    return [];
  }
  return Array.from(dataList).map((item, index) => ({
    key: Object.prototype.hasOwnProperty.call(item, valueKey)
      ? item[valueKey]
      : index,
    value: String(item?.[valueKey] ?? ""),
    label: String(item?.[textKey] ?? ""),
    placeholder: !!item?.placeholder,
    selected: !!item?.selected,
    raw: item,
  }));
};

const Select = forwardRef((props, ref) => {
  const {
    // NOTE: Select(Web)는 dataObj/dataKey 바운드를 지원하지 않는다(스펙: CU-WEB-003).
    // 실수로 전달돼도 DOM으로 새지 않도록 소모만 한다.
    dataObj,
    dataKey,
    dataList = [],
    valueKey = "value",
    textKey = "text",
    value: valueProp,
    defaultValue = "",
    placeholder,
    status: statusProp,
    statusMessage,
    assistiveText,
    disabled = false,
    className = "",
    id,
    onValueChange,
    onChange,
    "aria-describedby": ariaDescribedByProp,
    ...rest
  } = props;

  const reactId = useId();
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const warnedUnsupportedBindingRef = useRef(false);

  const normalizedOptions = useMemo(
    () => normalizeOptions(dataList, valueKey, textKey),
    [dataList, valueKey, textKey]
  );
  const placeholderOption = useMemo(
    () => normalizedOptions.find((opt) => opt.placeholder),
    [normalizedOptions]
  );

  const deriveValueFromSources = useCallback(() => {
    if (valueProp !== undefined && valueProp !== null) {
      return String(valueProp);
    }
    const selectedFromList =
      normalizedOptions.find((opt) => opt.raw?.selected) ||
      normalizedOptions.find((opt) => opt.selected);
    if (selectedFromList) return selectedFromList.value;
    if (defaultValue !== undefined && defaultValue !== null)
      return String(defaultValue);
    if (placeholderOption) return placeholderOption.value;
    return "";
  }, [valueProp, normalizedOptions, defaultValue, placeholderOption]);

  const [innerValue, setInnerValue] = useState(() => deriveValueFromSources());
  const currentValue =
    valueProp !== undefined && valueProp !== null
      ? String(valueProp)
      : innerValue;

  // Sync EasyList selection flags with the resolved value
  useEffect(() => {
    const normalized = String(currentValue ?? "");
    const updater = (item) => {
      const nextSelected = String(item?.[valueKey] ?? "") === normalized;
      if (item.selected !== nextSelected) item.selected = nextSelected;
      return item;
    };
    if (typeof dataList?.forAll === "function") {
      dataList.forAll(updater);
    } else if (Array.isArray(dataList)) {
      dataList.forEach(updater);
    }
  }, [dataList, valueKey, currentValue]);

  // Update inner value when external sources change
  useEffect(() => {
    const next = deriveValueFromSources();
    setInnerValue((prev) => (prev === next ? prev : next));
  }, [deriveValueFromSources]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (warnedUnsupportedBindingRef.current) return;
    if (!dataObj && !dataKey) return;
    warnedUnsupportedBindingRef.current = true;
    // eslint-disable-next-line no-console
    console.warn(
      "[Select] dataObj/dataKey 바인딩은 지원하지 않아. value/onValueChange 또는 dataList.selected로 제어해."
    );
  }, [dataObj, dataKey]);

  const normalizedStatus = disabled ? "disabled" : statusProp || "default";
  const statusMeta = STATUS_PRESETS[normalizedStatus] || STATUS_PRESETS.default;
  const messageText =
    statusMessage ??
    statusMeta.defaultMessage ??
    (normalizedStatus === "disabled" ? "사용할 수 없는 상태입니다." : "");

  const isPlaceholderSelected =
    placeholderOption &&
    (!currentValue || currentValue === placeholderOption.value);

  const messageId =
    messageText || assistiveText
      ? `${id || `select-${reactId}`}-status`
      : undefined;
  const ariaDescribedBy =
    [ariaDescribedByProp, messageId].filter(Boolean).join(" ") || undefined;

  const updateSelectionFlags = (nextValue) => {
    const normalized = String(nextValue ?? "");
    const updater = (item) => {
      const match = String(item?.[valueKey] ?? "") === normalized;
      if (item.selected !== match) item.selected = match;
      return item;
    };
    if (typeof dataList?.forAll === "function") {
      dataList.forAll(updater);
    } else if (Array.isArray(dataList)) {
      dataList.forEach(updater);
    }
  };

  const handleSelect = (nextValue) => {
    const valueString = String(nextValue ?? "");
    setInnerValue(valueString);
    updateSelectionFlags(valueString);
    if (onValueChange) {
      onValueChange(valueString);
    }
    if (onChange) {
      onChange({
        type: "change",
        target: { value: valueString },
      });
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const baseStyle =
    "w-full px-3 py-2 pr-10 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white transition-colors text-left";
  const triggerClass = [
    baseStyle,
    statusMeta.select,
    isPlaceholderSelected ? "text-gray-400" : "text-gray-900",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const currentLabel =
    normalizedOptions.find((opt) => opt.value === currentValue)?.label ||
    placeholder ||
    placeholderOption?.label ||
    "";

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={ref}
        id={id || `select-${reactId}`}
        type="button"
        disabled={disabled || normalizedStatus === "disabled"}
        className={triggerClass}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-describedby={ariaDescribedBy}
        {...rest}
        onClick={() => {
          if (disabled || normalizedStatus === "disabled") return;
          setIsOpen((prev) => !prev);
        }}
      >
        <span className={isPlaceholderSelected ? "text-gray-400" : ""}>
          {currentLabel}
        </span>
      </button>
      <div className="pointer-events-none absolute right-[6px] top-[20px] -translate-y-1/2 flex items-center justify-center">
        {normalizedStatus === "loading" ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-transparent"
            aria-hidden="true"
          />
        ) : (
          <Icon
            icon={isOpen ? "md:MdKeyboardArrowUp" : "md:MdKeyboardArrowDown"}
            size="1.5em"
            className="text-gray-400"
            decorative
          />
        )}
      </div>
      {isOpen && (
        <ul
          role="listbox"
          aria-labelledby={id || `select-${reactId}`}
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg"
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === currentValue;
            const isPlaceholder = opt.placeholder;
            const itemClass = [
              "cursor-pointer px-3 py-2",
              isSelected
                ? "bg-gray-200 text-gray-900"
                : "text-gray-900 hover:bg-gray-50",
              isPlaceholder ? "text-gray-400" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <li
                key={opt.key}
                role="option"
                aria-selected={isSelected}
                className={itemClass}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </li>
            );
          })}
          {normalizedOptions.length === 0 && (
            <li className="px-3 py-2 text-gray-500 text-sm">
              선택 가능한 항목이 없습니다.
            </li>
          )}
        </ul>
      )}
      {messageId && (
        <p
          id={messageId}
          className={`mt-1 text-xs ${
            messageText ? statusMeta.message : "sr-only"
          }`}
          aria-live={statusMeta.ariaLive || "polite"}
        >
          {messageText || assistiveText}
          {messageText && assistiveText && (
            <span className="sr-only">{assistiveText}</span>
          )}
        </p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;
