/**
 * 파일명: lib/component/CheckButton.jsx
 * 설명: 토글 버튼 형태의 체크 컴포넌트
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { forwardRef, useEffect, useState } from "react";
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
 * @description 토글 버튼 스타일의 체크 컴포넌트. checked/onChange 또는 dataObj/dataKey로 제어한다.
 */
const CheckButton = forwardRef((props, ref) => {
  const {
    children,
    name,
    checked,
    dataObj,
    dataKey,
    color = "primary",
    disabled = false,
    className = "",
    onChange,
    onValueChange,
  } = props;

  const isControlled = typeof checked === "boolean";
  const resolvedColor = COLOR_MAP[color] || color || COLOR_MAP.default;
  const boundKey =
    dataKey || name || (typeof children === "string" ? children : undefined);
  const [innerChecked, setInnerChecked] = useState(() => {
    if (isControlled) return !!checked;
    if (dataObj && boundKey) return !!dataObj[boundKey];
    return false;
  });
  const currentChecked = isControlled ? !!checked : innerChecked;

  useEffect(() => {
    if (isControlled) return;
    if (dataObj && boundKey) {
      const next = !!dataObj[boundKey];
      setInnerChecked((prev) => (prev === next ? prev : next));
      if (typeof dataObj === "object" && dataObj !== null) {
        dataObj.checked = next;
      }
    }
  }, [boundKey, dataObj, isControlled]);

  const handleToggle = () => {
    if (disabled) return;
    const next = !currentChecked;
    if (!isControlled) {
      setInnerChecked(next);
      if (dataObj && boundKey) {
        dataObj[boundKey] = next;
        if (typeof dataObj === "object" && dataObj !== null) {
          dataObj.checked = next;
        }
      }
    }
    if (onValueChange) {
      onValueChange(next);
    }
    if (onChange) {
      onChange({
        type: "change",
        target: {
          name: boundKey,
          value: next,
          checked: next,
        },
      });
    }
  };

  const baseStyle =
    "flex-row items-center justify-center px-4 py-2 rounded-md border text-sm font-medium";
  const disabledStyle = disabled ? "opacity-50" : "active:opacity-80";
  const colorStyle = currentChecked
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
      ref={ref}
      onPress={handleToggle}
      accessibilityRole="button"
      accessibilityState={{ disabled, checked: currentChecked }}
      disabled={disabled}
      className={cn(baseStyle, disabledStyle, className)}
      style={colorStyle}
    >
      {typeof children === "string" ? (
        <Text
          className="text-sm font-medium"
          style={{ color: colorStyle.color }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
});

CheckButton.displayName = "CheckButton";

export default CheckButton;
