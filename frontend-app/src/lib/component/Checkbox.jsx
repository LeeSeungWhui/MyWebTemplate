/**
 * 파일명: lib/component/Checkbox.jsx
 * 설명: 라벨/색상/바인딩을 지원하는 공통 체크박스 컴포넌트
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Icon from "./Icon";
import { cn } from "../../common/util/cn";

const COLOR_MAP = {
  primary: "#2563EB",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  default: "#2563EB",
};

/**
 * @description 체크박스 컴포넌트. controlled/비제어, dataObj 바인딩을 모두 지원한다.
 */
const Checkbox = ({
  label,
  name,
  checked,
  dataObj,
  dataKey,
  color = "primary",
  disabled = false,
  className = "",
  onChange,
}) => {
  const isControlled = typeof checked === "boolean";
  const resolvedColor = COLOR_MAP[color] || color || COLOR_MAP.default;
  const [innerChecked, setInnerChecked] = useState(() => {
    if (isControlled) return !!checked;
    if (dataObj && dataKey) return !!dataObj[dataKey];
    return false;
  });
  const currentChecked = isControlled ? !!checked : innerChecked;

  useEffect(() => {
    if (isControlled) return;
    if (dataObj && dataKey) {
      const next = !!dataObj[dataKey];
      setInnerChecked((prev) => (prev === next ? prev : next));
      if (typeof dataObj === "object" && dataObj !== null) {
        // 체크 상태를 checked 플래그로도 남긴다.
        dataObj.checked = next;
      }
    }
  }, [dataObj, dataKey, isControlled]);

  const handleToggle = () => {
    if (disabled) return;
    const next = !currentChecked;
    if (!isControlled) {
      setInnerChecked(next);
      if (dataObj && dataKey) {
        dataObj[dataKey] = next;
        if (typeof dataObj === "object" && dataObj !== null) {
          dataObj.checked = next;
        }
      }
    }
    if (onChange) {
      onChange({
        type: "change",
        target: {
          name: name || dataKey || label,
          checked: next,
          value: next,
        },
      });
    }
  };

  return (
    <Pressable
      onPress={handleToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: currentChecked, disabled }}
      disabled={disabled}
      className={cn("flex-row items-center", disabled ? "opacity-60" : "", className)}
    >
      <View
        className={cn(
          "w-5 h-5 rounded border items-center justify-center mr-2",
          currentChecked ? "" : "bg-white"
        )}
        style={{
          borderColor: currentChecked ? resolvedColor : "#d1d5db",
          backgroundColor: currentChecked ? resolvedColor : "#ffffff",
        }}
      >
        {currentChecked ? (
          <Icon icon="md:check" size={16} color="#ffffff" />
        ) : null}
      </View>
      {label ? (
        <Text className="text-sm text-gray-800" numberOfLines={2}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
};

export default Checkbox;
