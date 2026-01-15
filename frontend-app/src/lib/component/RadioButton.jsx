/**
 * 파일명: lib/component/RadioButton.jsx
 * 설명: 버튼 형태의 라디오(단일 선택) 컴포넌트
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { useEffect, useState } from "react";
import { Pressable, Text } from "react-native";
import { cn } from "../../common/util/cn";

const COLOR_MAP = {
  primary: "#2563EB",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  default: "#2563EB",
};

/**
 * @description 버튼 스타일 라디오. 같은 name/dataKey 공유 시 하나만 선택. checked/onValueChange 또는 dataObj/dataKey로 제어.
 */
const RadioButton = ({
  children,
  name,
  value,
  checked,
  dataObj,
  dataKey,
  defaultChecked = false,
  color = "primary",
  disabled = false,
  className = "",
  onChange,
  onValueChange,
}) => {
  const isControlled = typeof checked === "boolean";
  const boundKey = dataKey || name || (typeof children === "string" ? children : undefined);
  const hasBinding = !!(dataObj && boundKey);
  const resolvedColor = COLOR_MAP[color] || color || COLOR_MAP.default;

  const [innerChecked, setInnerChecked] = useState(
    isControlled ? !!checked : !!defaultChecked,
  );

  const currentChecked = isControlled
    ? !!checked
    : hasBinding
    ? dataObj[boundKey] === value
    : innerChecked;

  useEffect(() => {
    if (isControlled || !hasBinding) return;
    const next = dataObj[boundKey] === value;
    setInnerChecked((prev) => (prev === next ? prev : next));
    if (typeof dataObj === "object" && dataObj !== null) {
      dataObj.checked = next;
    }
  }, [boundKey, dataObj, hasBinding, isControlled, value]);

  const handleSelect = () => {
    if (disabled) return;
    if (!isControlled) {
      if (hasBinding) {
        dataObj[boundKey] = value;
        if (typeof dataObj === "object" && dataObj !== null) {
          dataObj.checked = true;
        }
      } else {
        setInnerChecked(true);
      }
    }
    if (onValueChange) onValueChange(value);
    if (onChange) {
      onChange({
        type: "change",
        target: { name: boundKey, value, checked: true },
      });
    }
  };

  const buttonStyle = currentChecked
    ? {
        borderColor: resolvedColor,
        backgroundColor: resolvedColor,
        color: "#ffffff",
      }
    : {
        borderColor: "#d1d5db",
        backgroundColor: "#ffffff",
        color: "#1f2937",
      };

  return (
    <Pressable
      onPress={handleSelect}
      accessibilityRole="button"
      accessibilityState={{ disabled, checked: currentChecked }}
      disabled={disabled}
      className={cn(
        "flex-row items-center justify-center px-4 py-2 rounded-md border text-sm font-medium",
        disabled ? "opacity-50" : "active:opacity-80",
        className,
      )}
      style={buttonStyle}
    >
      {typeof children === "string" ? (
        <Text className="text-sm font-medium" style={{ color: buttonStyle.color }}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
};

export default RadioButton;
