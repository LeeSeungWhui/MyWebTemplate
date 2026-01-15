/**
 * 파일명: lib/component/Switch.jsx
 * 설명: 토글 스위치 컴포넌트(EasyObj/controlled 지원)
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { useEffect, useState } from "react";
import { Pressable, View, Text } from "react-native";
import { cn } from "../../common/util/cn";

const truthy = (v) => [true, "Y", "y", "1", 1].includes(v) || v === true;

/**
 * @description 스위치 토글. checked/onValueChange 또는 dataObj/dataKey로 제어하며 checked 플래그를 함께 기록한다.
 */
const Switch = ({
  label,
  name,
  checked,
  defaultChecked = false,
  dataObj,
  dataKey,
  disabled = false,
  className = "",
  onChange,
  onValueChange,
}) => {
  const isControlled = typeof checked === "boolean";
  const hasBinding = !!(dataObj && dataKey);

  const [innerChecked, setInnerChecked] = useState(
    isControlled ? !!checked : !!defaultChecked,
  );

  const currentChecked = isControlled
    ? !!checked
    : hasBinding
    ? truthy(dataObj[dataKey])
    : innerChecked;

  useEffect(() => {
    if (isControlled || !hasBinding) return;
    const next = truthy(dataObj[dataKey]);
    setInnerChecked((prev) => (prev === next ? prev : next));
    if (typeof dataObj === "object" && dataObj !== null) {
      dataObj.checked = next;
    }
  }, [dataObj, dataKey, hasBinding, isControlled]);

  const handleToggle = () => {
    if (disabled) return;
    const next = !currentChecked;
    if (!isControlled) {
      if (hasBinding) {
        dataObj[dataKey] = next;
        if (typeof dataObj === "object" && dataObj !== null) {
          dataObj.checked = next;
        }
      } else {
        setInnerChecked(next);
      }
    }
    if (onValueChange) onValueChange(next);
    if (onChange) {
      onChange({
        type: "change",
        target: { name: name || dataKey, value: next, checked: next },
      });
    }
  };

  return (
    <Pressable
      onPress={handleToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: currentChecked, disabled }}
      disabled={disabled}
      className={cn(
        "flex-row items-center space-x-2",
        disabled ? "opacity-50" : "active:opacity-80",
        className,
      )}
    >
      <View
        className={cn(
          "w-10 h-6 rounded-full px-1 flex-row items-center",
          currentChecked ? "bg-blue-600" : "bg-gray-300",
        )}
      >
        <View
          className={cn(
            "w-4 h-4 rounded-full bg-white",
            currentChecked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </View>
      {label ? <Text className="text-sm text-gray-800">{label}</Text> : null}
    </Pressable>
  );
};

export default Switch;
