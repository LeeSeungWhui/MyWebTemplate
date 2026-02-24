/**
 * 파일명: lib/component/TimeInput.jsx
 * 설명: 시간 선택 컴포넌트 (EasyObj/controlled + native DateTimePicker)
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { forwardRef, useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { cn } from "../../common/util/cn";
import Icon from "./Icon";

const pad2 = (n) => String(n).padStart(2, "0");
const formatTime = (date) => {
  if (!(date instanceof Date)) return "";
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
};

const parseTime = (value) => {
  if (!value || typeof value !== "string") return null;
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  const dt = new Date();
  dt.setHours(h, m, 0, 0);
  return dt;
};

/**
 * @description 시간 입력. value/onValueChange 또는 dataObj/dataKey로 제어한다.
 */
const TimeInput = forwardRef((props, ref) => {
  const {
    value,
    defaultValue = "",
    dataObj,
    dataKey,
    placeholder = "시간을 선택하세요",
    disabled = false,
    readOnly = false,
    className = "",
    onChange,
    onValueChange,
  } = props;

  const isControlled = value !== undefined;
  const hasBinding = !!(dataObj && dataKey);

  const [showPicker, setShowPicker] = useState(false);
  const [innerValue, setInnerValue] = useState(() => {
    if (isControlled) return value ?? "";
    if (hasBinding) return dataObj[dataKey] ?? "";
    return defaultValue ?? "";
  });

  const currentValue = isControlled
    ? (value ?? "")
    : hasBinding
      ? (dataObj[dataKey] ?? "")
      : innerValue;

  useEffect(() => {
    if (isControlled || !hasBinding) return;
    const next = dataObj[dataKey] ?? "";
    setInnerValue((prev) => (prev === next ? prev : next));
  }, [dataObj, dataKey, hasBinding, isControlled]);

  const commit = (next) => {
    if (hasBinding) {
      dataObj[dataKey] = next;
    } else if (!isControlled) {
      setInnerValue(next);
    }
    if (onValueChange) onValueChange(next);
    if (onChange) {
      onChange({
        type: "change",
        target: { value: next },
      });
    }
  };

  const handleChange = (_event, selected) => {
    setShowPicker(false);
    if (!selected) return;
    const formatted = formatTime(selected);
    commit(formatted);
  };

  const parsedCurrent = parseTime(currentValue) || new Date();

  return (
    <View className={cn("w-full", className)}>
      <Pressable
        onPress={() => !disabled && !readOnly && setShowPicker(true)}
        className={cn(
          "h-10 px-3 flex-row items-center justify-between rounded-md border",
          disabled || readOnly
            ? "bg-gray-100 border-gray-200"
            : "bg-white border-gray-300",
        )}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        <Text
          className={cn(
            "text-sm",
            currentValue ? "text-gray-900" : "text-gray-400",
          )}
        >
          {currentValue || placeholder}
        </Text>
        <Icon icon="md:schedule" size={18} color="#6b7280" />
      </Pressable>

      {showPicker ? (
        <DateTimePicker
          ref={ref}
          value={parsedCurrent}
          mode="time"
          is24Hour
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
});

TimeInput.displayName = "TimeInput";

export default TimeInput;
