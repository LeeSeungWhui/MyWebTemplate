/**
 * 파일명: lib/component/Dropdown.jsx
 * 설명: 단일/다중 선택 드롭다운 (EasyObj/controlled + EasyList selected 동기화)
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { forwardRef, useEffect, useMemo, useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { cn } from "../../common/util/cn";
import Icon from "./Icon";

const normalizeOptions = (dataList = [], valueKey, textKey) => {
  const arr = Array.isArray(dataList)
    ? dataList
    : typeof dataList?.[Symbol.iterator] === "function"
      ? Array.from(dataList)
      : [];
  return arr.map((item, index) => ({
    key: Object.prototype.hasOwnProperty.call(item, valueKey)
      ? item[valueKey]
      : index,
    value: String(item?.[valueKey] ?? ""),
    label: String(item?.[textKey] ?? ""),
    selected: !!item?.selected,
    disabled: !!item?.disabled,
    raw: item,
  }));
};

const toggleArrayValue = (list, val) => {
  const exists = list.includes(val);
  if (exists) return list.filter((v) => v !== val);
  return [...list, val];
};

/**
 * @description 간단한 드롭다운. value/onValueChange 또는 dataObj/dataKey로 제어하며 dataList.selected도 동기화한다.
 */
const Dropdown = forwardRef((props, ref) => {
  const {
    dataList = [],
    valueKey = "value",
    textKey = "label",
    value,
    defaultValue = "",
    dataObj,
    dataKey,
    placeholder = "선택",
    disabled = false,
    multi = false,
    closeOnSelect,
    onChange,
    onValueChange,
    className = "",
  } = props;

  const isControlled = value !== undefined;
  const hasBinding = !!(dataObj && dataKey);

  const options = useMemo(
    () => normalizeOptions(dataList, valueKey, textKey),
    [dataList, valueKey, textKey],
  );

  const deriveInitial = () => {
    if (multi) {
      if (isControlled) return Array.isArray(value) ? value.map(String) : [];
      if (hasBinding) {
        const bound = dataObj[dataKey];
        if (Array.isArray(bound)) return bound.map(String);
      }
      const selected = options
        .filter((opt) => opt.selected)
        .map((opt) => opt.value);
      if (selected.length) return selected;
      if (Array.isArray(defaultValue)) return defaultValue.map(String);
      return [];
    }
    if (isControlled) return String(value ?? "");
    if (hasBinding) {
      const bound = dataObj[dataKey];
      if (bound !== undefined && bound !== null) return String(bound);
    }
    const selected = options.find((opt) => opt.selected);
    if (selected) return selected.value;
    if (defaultValue !== undefined && defaultValue !== null)
      return String(defaultValue);
    return "";
  };

  const [innerValue, setInnerValue] = useState(() => deriveInitial());
  const [open, setOpen] = useState(false);

  const currentValue = multi
    ? isControlled
      ? Array.isArray(value)
        ? value.map(String)
        : []
      : hasBinding
        ? Array.isArray(dataObj[dataKey])
          ? dataObj[dataKey].map(String)
          : []
        : Array.isArray(innerValue)
          ? innerValue
          : []
    : isControlled
      ? String(value ?? "")
      : hasBinding
        ? String(dataObj[dataKey] ?? innerValue ?? "")
        : String(innerValue ?? "");

  useEffect(() => {
    if (isControlled || !hasBinding) return;
    const next = deriveInitial();
    setInnerValue(next);
  }, [
    dataList,
    dataKey,
    dataObj,
    hasBinding,
    isControlled,
    value,
    defaultValue,
  ]);

  const syncSelectedFlags = (nextVal) => {
    const list = Array.from(dataList ?? []);
    if (multi) {
      list.forEach((item) => {
        const match = Array.isArray(nextVal)
          ? nextVal.includes(String(item?.[valueKey] ?? ""))
          : false;
        // eslint-disable-next-line no-param-reassign
        item.selected = match;
      });
    } else {
      list.forEach((item) => {
        const match = String(item?.[valueKey] ?? "") === String(nextVal ?? "");
        // eslint-disable-next-line no-param-reassign
        item.selected = match;
      });
    }
  };

  const emitChange = (next) => {
    if (hasBinding) {
      dataObj[dataKey] = next;
    } else if (!isControlled) {
      setInnerValue(next);
    }
    syncSelectedFlags(next);
    if (onValueChange) onValueChange(next);
    if (onChange) {
      onChange({
        type: "change",
        target: { value: next },
      });
    }
  };

  const handleSelect = (opt) => {
    if (disabled || opt.disabled) return;
    if (multi) {
      const next = toggleArrayValue(
        Array.isArray(currentValue) ? currentValue : [],
        opt.value,
      );
      emitChange(next);
      return;
    }
    emitChange(opt.value);
    const shouldClose = closeOnSelect !== undefined ? closeOnSelect : true;
    if (shouldClose) setOpen(false);
  };

  const displayLabel = () => {
    if (multi) {
      const arr = Array.isArray(currentValue) ? currentValue : [];
      if (!arr.length) return placeholder;
      const labels = options
        .filter((opt) => arr.includes(opt.value))
        .map((opt) => opt.label);
      return labels.join(", ");
    }
    const match = options.find((opt) => opt.value === currentValue);
    return match?.label || placeholder;
  };

  const renderItem = ({ item }) => {
    const isSelected = multi
      ? Array.isArray(currentValue) && currentValue.includes(item.value)
      : currentValue === item.value;
    return (
      <Pressable
        onPress={() => handleSelect(item)}
        disabled={item.disabled}
        className={cn(
          "px-3 py-2 border-b border-gray-100 flex-row items-center justify-between",
          item.disabled ? "opacity-50" : "active:bg-gray-100",
        )}
      >
        <Text className="text-sm text-gray-800">{item.label}</Text>
        {isSelected ? <Icon icon="md:check" size={18} color="#2563EB" /> : null}
      </Pressable>
    );
  };

  return (
    <View className={cn("w-full", className)}>
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        className={cn(
          "h-10 px-3 flex-row items-center justify-between rounded-md border",
          disabled ? "bg-gray-100 border-gray-200" : "bg-white border-gray-300",
        )}
      >
        <Text
          className={cn(
            "text-sm flex-1",
            currentValue &&
              (!Array.isArray(currentValue) || currentValue.length)
              ? "text-gray-900"
              : "text-gray-400",
          )}
          numberOfLines={1}
        >
          {displayLabel()}
        </Text>
        <Icon icon="md:arrow-drop-down" size={22} color="#6b7280" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <View className="flex-1 justify-center">
          <Pressable
            className="absolute inset-0 bg-black/30"
            onPress={() => setOpen(false)}
            accessibilityRole="button"
          />
          <View className="mx-4 bg-white rounded-lg shadow-lg border border-gray-200">
            <FlatList
              ref={ref}
              data={options}
              keyExtractor={(item) => String(item.key)}
              renderItem={renderItem}
              ListEmptyComponent={
                <View className="p-4">
                  <Text className="text-sm text-gray-500">항목 없음</Text>
                </View>
              }
            />
            {multi ? (
              <View className="flex-row justify-end px-3 py-2 border-t border-gray-100">
                <Pressable
                  onPress={() => setOpen(false)}
                  className="px-4 py-2 rounded-md bg-blue-600 active:bg-blue-700"
                >
                  <Text className="text-sm text-white">닫기</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
});

Dropdown.displayName = "Dropdown";

export default Dropdown;
