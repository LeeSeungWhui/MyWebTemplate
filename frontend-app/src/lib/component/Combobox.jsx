/**
 * 파일명: lib/component/Combobox.jsx
 * 설명: 검색 가능한 단일/다중 선택 콤보박스 (EasyObj/controlled 지원)
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { forwardRef, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  FlatList,
} from "react-native";
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
    placeholder: !!item?.placeholder,
    raw: item,
  }));
};

const toggleArrayValue = (list, val) => {
  const exists = list.includes(val);
  if (exists) return list.filter((v) => v !== val);
  return [...list, val];
};

/**
 * @description 검색 가능 콤보박스. 단일/다중 선택, value/onValueChange 또는 dataObj/dataKey로 제어한다.
 */
const Combobox = forwardRef((props, ref) => {
  const {
    dataList = [],
    valueKey = "value",
    textKey = "text",
    value,
    defaultValue = "",
    dataObj,
    dataKey,
    placeholder = "선택하세요",
    disabled = false,
    filterable = true,
    multi = false,
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
    const placeholderOpt = options.find((opt) => opt.placeholder);
    if (placeholderOpt) return placeholderOpt.value;
    return "";
  };

  const [innerValue, setInnerValue] = useState(() => deriveInitial());
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

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

  const syncDataListSelected = (nextVal) => {
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
    syncDataListSelected(next);
    if (onValueChange) onValueChange(next);
    if (onChange) {
      onChange({
        type: "change",
        target: { value: next },
      });
    }
  };

  const handleSelect = (opt) => {
    if (disabled) return;
    if (multi) {
      const next = toggleArrayValue(
        Array.isArray(currentValue) ? currentValue : [],
        opt.value,
      );
      emitChange(next);
    } else {
      emitChange(opt.value);
      setOpen(false);
    }
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

  const filteredOptions = useMemo(() => {
    if (!filterable || !search.trim()) return options;
    const term = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        String(opt.value).toLowerCase().includes(term),
    );
  }, [filterable, options, search]);

  const renderItem = ({ item }) => {
    const isSelected = multi
      ? Array.isArray(currentValue) && currentValue.includes(item.value)
      : currentValue === item.value;
    return (
      <Pressable
        onPress={() => handleSelect(item)}
        className={cn(
          "px-3 py-2 border-b border-gray-100 flex-row items-center justify-between",
          isSelected ? "bg-blue-50" : "bg-white",
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
        <Pressable
          className="flex-1 bg-black/30"
          onPress={() => setOpen(false)}
          accessibilityRole="button"
        />
        <View className="absolute left-4 right-4 top-24 bg-white rounded-lg shadow-lg border border-gray-200">
          {filterable ? (
            <View className="p-3 border-b border-gray-100">
              <TextInput
                ref={ref}
                placeholder="검색"
                value={search}
                onChangeText={setSearch}
                className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
              />
            </View>
          ) : null}
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => String(item.key)}
            renderItem={renderItem}
            ListEmptyComponent={
              <View className="p-4">
                <Text className="text-sm text-gray-500">결과 없음</Text>
              </View>
            }
          />
          {multi ? (
            <View className="flex-row justify-end px-3 py-2 border-t border-gray-100">
              <Pressable
                onPress={() => setOpen(false)}
                className="px-4 py-2 rounded-md bg-blue-600 active:bg-blue-700"
              >
                <Text className="text-sm text-white">완료</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
});

Combobox.displayName = "Combobox";

export default Combobox;
