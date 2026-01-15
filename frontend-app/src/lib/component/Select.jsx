/**
 * 파일명: lib/component/Select.jsx
 * 설명: EasyObj/EasyList 바인딩을 지원하는 RN 기본 Picker 기반 Select
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { forwardRef, useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { cn } from "../../common/util/cn";

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  picker: {
    width: "100%",
    color: "#111827",
  },
  disabled: {
    backgroundColor: "#f3f4f6",
    color: "#9ca3af",
    borderColor: "#e5e7eb",
  },
  message: {
    marginTop: 4,
    fontSize: 12,
  },
});

const STATUS_PRESETS = {
  default: {
    border: "border border-gray-300",
    message: "text-gray-600",
  },
  success: {
    border: "border border-green-400",
    message: "text-green-600",
    defaultMessage: "선택이 저장되었습니다.",
  },
  warning: {
    border: "border border-yellow-400",
    message: "text-yellow-700",
    defaultMessage: "추가 확인이 필요합니다.",
  },
  error: {
    border: "border border-red-400",
    message: "text-red-600",
    defaultMessage: "유효하지 않은 값입니다.",
  },
  disabled: {
    border: "border border-gray-200",
    message: "text-gray-500",
    defaultMessage: "사용할 수 없는 상태입니다.",
  },
};

const normalizeOptions = (dataList = [], valueKey, textKey, placeholder) => {
  const arr = Array.isArray(dataList)
    ? dataList
    : typeof dataList?.[Symbol.iterator] === "function"
    ? Array.from(dataList)
    : [];
  const items = arr.map((item, index) => ({
    key: Object.prototype.hasOwnProperty.call(item, valueKey)
      ? item[valueKey]
      : index,
    value: String(item?.[valueKey] ?? ""),
    label: String(item?.[textKey] ?? ""),
    placeholder: !!item?.placeholder,
    selected: !!item?.selected,
    raw: item,
  }));
  if (placeholder) {
    items.unshift({
      key: "__placeholder__",
      value: "",
      label: placeholder,
      placeholder: true,
      selected: false,
    });
  }
  return items;
};

/**
 * @description RN Picker 기반 Select. EasyObj/EasyList 또는 value/onValueChange로 제어한다.
 */
const Select = forwardRef((props, ref) => {
  const {
    dataList = [],
    valueKey = "value",
    textKey = "text",
    value: valueProp,
    defaultValue = "",
    placeholder,
    disabled = false,
    status: statusProp,
    statusMessage,
    assistiveText,
    className = "",
    onValueChange,
    onChange,
  } = props;

  const isControlled = valueProp !== undefined && valueProp !== null;
  const normalizedOptions = normalizeOptions(dataList, valueKey, textKey, placeholder);

  const findInitialValue = () => {
    if (valueProp !== undefined && valueProp !== null) {
      return String(valueProp);
    }
    const selectedFromList =
      normalizedOptions.find((opt) => opt.raw?.selected) ||
      normalizedOptions.find((opt) => opt.selected);
    if (selectedFromList) return selectedFromList.value;
    if (defaultValue !== undefined && defaultValue !== null) {
      return String(defaultValue);
    }
    if (placeholder) return "";
    return normalizedOptions[0]?.value ?? "";
  };

  const [innerValue, setInnerValue] = useState(() => findInitialValue());

  const currentValue =
    isControlled ? String(valueProp) : innerValue;

  useEffect(() => {
    if (isControlled) {
      return;
    }
    const next = findInitialValue();
    setInnerValue((prev) => (prev === next ? prev : next));
  }, [dataList, defaultValue, isControlled, placeholder, textKey, valueKey, valueProp]);

  useEffect(() => {
    const normalized = String(currentValue ?? "");
    const list = Array.from(dataList ?? []);
    list.forEach((item) => {
      const match = String(item?.[valueKey] ?? "") === normalized;
      if (item.selected !== match) {
        // eslint-disable-next-line no-param-reassign
        item.selected = match;
      }
    });
  }, [currentValue, dataList, valueKey]);

  const statusKey = disabled ? "disabled" : statusProp || "default";
  const statusMeta = STATUS_PRESETS[statusKey] || STATUS_PRESETS.default;
  const messageText =
    statusMessage ?? statusMeta.defaultMessage ?? assistiveText ?? "";

  const handleSelect = (next) => {
    const valueString = String(next ?? "");
    if (!isControlled) {
      setInnerValue(valueString);
    }
    if (onValueChange) {
      onValueChange(valueString);
    }
    if (onChange) {
      onChange({
        type: "change",
        target: { value: valueString },
      });
    }
  };

  return (
    <View>
      <View
        className={cn(
          "px-1",
          statusMeta.border,
          disabled ? "bg-gray-100" : "bg-white",
          className
        )}
        style={[
          styles.wrapper,
          disabled ? styles.disabled : null,
          statusKey === "error" ? { borderColor: "#f87171" } : null,
          statusKey === "success" ? { borderColor: "#34d399" } : null,
        ]}
      >
        <Picker
          ref={ref}
          enabled={!disabled}
          selectedValue={currentValue}
          onValueChange={(val, idx) => {
            // ignore placeholder selection when disabled
            handleSelect(val);
          }}
          style={[
            styles.picker,
            disabled ? styles.disabled : null,
            Platform.OS === "android" ? { paddingVertical: 0 } : null,
          ]}
          dropdownIconColor="#9CA3AF"
        >
          {normalizedOptions.map((opt) => (
            <Picker.Item
              key={opt.key}
              label={opt.label}
              value={opt.value}
              color={opt.placeholder ? "#9CA3AF" : "#111827"}
            />
          ))}
        </Picker>
      </View>
      {messageText ? (
        <Text
          style={styles.message}
          className={cn(
            statusMeta.message || "text-gray-600",
            disabled ? "text-gray-500" : ""
          )}
        >
          {messageText}
        </Text>
      ) : null}
    </View>
  );
});

Select.displayName = "Select";

export default Select;
