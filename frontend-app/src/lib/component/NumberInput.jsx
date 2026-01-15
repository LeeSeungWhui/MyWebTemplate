/**
 * 파일명: lib/component/NumberInput.jsx
 * 설명: 스텝 버튼과 min/max를 지원하는 숫자 입력 (EasyObj/controlled 지원)
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { forwardRef, useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { cn } from "../../common/util/cn";
import Icon from "./Icon";

const clamp = (value, min, max) => {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
};

const toNumberOrEmpty = (raw) => {
  if (raw === "" || raw === "-" || raw === "." || raw === "-.") return "";
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : "";
};

/**
 * @description 숫자 입력 필드. value/onValueChange 또는 dataObj/dataKey로 제어하며 step 버튼으로 증감한다.
 */
const NumberInput = forwardRef((props, ref) => {
  const {
    value,
    defaultValue = "",
    dataObj,
    dataKey,
    min,
    max,
    step = 1,
    placeholder,
    disabled = false,
    readOnly = false,
    className = "",
    onChange,
    onValueChange,
  } = props;

  const isControlled = value !== undefined;
  const hasBinding = !!(dataObj && dataKey);

  const [innerValue, setInnerValue] = useState(() => {
    if (isControlled) return String(value ?? "");
    if (hasBinding) return String(dataObj[dataKey] ?? "");
    if (defaultValue !== undefined && defaultValue !== null) return String(defaultValue);
    return "";
  });

  const currentValue = isControlled
    ? String(value ?? "")
    : hasBinding
    ? String(dataObj[dataKey] ?? "")
    : innerValue;

  useEffect(() => {
    if (isControlled) return;
    if (!hasBinding) return;
    const next = String(dataObj[dataKey] ?? "");
    setInnerValue((prev) => (prev === next ? prev : next));
  }, [dataObj, dataKey, hasBinding, isControlled]);

  const emitChange = (nextValue) => {
    if (hasBinding) {
      dataObj[dataKey] = nextValue;
    } else if (!isControlled) {
      setInnerValue(String(nextValue));
    }
    if (onValueChange) onValueChange(nextValue);
    if (onChange) {
      onChange({
        type: "change",
        target: { value: nextValue },
      });
    }
  };

  const commit = (raw) => {
    const parsed = toNumberOrEmpty(raw);
    if (parsed === "") {
      emitChange("");
      return;
    }
    const clamped = clamp(parsed, min, max);
    emitChange(clamped);
  };

  const handleTextChange = (text) => {
    const numericLike = /^-?\d*(?:\.\d*)?$/.test(text);
    if (!numericLike) return;
    if (hasBinding) {
      dataObj[dataKey] = text;
    }
    if (!isControlled) {
      setInnerValue(text);
    }
    if (onValueChange) onValueChange(text);
    if (onChange) {
      onChange({
        type: "change",
        target: { value: text },
      });
    }
  };

  const changeByStep = (delta) => {
    if (disabled || readOnly) return;
    const parsed = toNumberOrEmpty(currentValue);
    const base = parsed === "" ? 0 : parsed;
    const next = clamp(base + delta, min, max);
    emitChange(next);
  };

  const displayValue = currentValue;

  return (
    <View className={cn("flex-row items-center space-x-2", className)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="decrement"
        onPress={() => changeByStep(-step)}
        disabled={disabled || readOnly}
        className={cn(
          "h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white",
          disabled || readOnly ? "opacity-50" : "active:bg-gray-100",
        )}
      >
        <Icon icon="md:remove" size={18} color="#374151" />
      </Pressable>

      <TextInput
        ref={ref}
        editable={!disabled && !readOnly}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        value={displayValue}
        onChangeText={handleTextChange}
        onEndEditing={(e) => commit(e.nativeEvent.text)}
        className={cn(
          "flex-1 h-10 px-3 rounded-md border text-sm",
          disabled || readOnly ? "bg-gray-100 text-gray-500" : "bg-white text-gray-900",
          "border-gray-300",
        )}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="increment"
        onPress={() => changeByStep(step)}
        disabled={disabled || readOnly}
        className={cn(
          "h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white",
          disabled || readOnly ? "opacity-50" : "active:bg-gray-100",
        )}
      >
        <Icon icon="md:add" size={18} color="#374151" />
      </Pressable>
    </View>
  );
});

NumberInput.displayName = "NumberInput";

export default NumberInput;
