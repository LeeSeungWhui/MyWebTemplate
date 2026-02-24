/**
 * 파일명: lib/component/Radiobox.jsx
 * 설명: 단일 선택 라디오 버튼 컴포넌트(EasyObj/controlled 지원)
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { useEffect, useState } from "react";
import { Pressable, View, Text } from "react-native";
import { cn } from "../../common/util/cn";

const COLOR_MAP = {
  primary: "#2563EB",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  default: "#2563EB",
};

/**
 * @description 라디오 버튼. name을 공유하면 동일 그룹으로 동작. controlled/value 또는 dataObj/dataKey 바인딩 지원.
 */
const Radiobox = ({
  label,
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
  const boundKey = dataKey || name || label;
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
    if (isControlled) return;
    if (!hasBinding) return;
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
    if (onValueChange) {
      onValueChange(value);
    }
    if (onChange) {
      onChange({
        type: "change",
        target: {
          name: name || boundKey,
          value,
          checked: true,
        },
      });
    }
  };

  return (
    <Pressable
      onPress={handleSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected: currentChecked, disabled }}
      disabled={disabled}
      className={cn(
        "flex-row items-center",
        disabled ? "opacity-60" : "",
        className,
      )}
    >
      <View
        className="w-5 h-5 rounded-full border mr-2 items-center justify-center"
        style={{
          borderColor: currentChecked ? resolvedColor : "#d1d5db",
        }}
      >
        {currentChecked ? (
          <View
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: resolvedColor }}
          />
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

export default Radiobox;
