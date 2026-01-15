import { forwardRef, useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { cn } from '../../common/util/cn';

const Textarea = forwardRef(({
  dataObj,
  dataKey,
  value: propValue,
  defaultValue = '',
  onChangeText,
  onValueChange,
  rows = 4,
  className = '',
  error,
  disabled = false,
  readOnly = false,
  placeholder,
  ...props
}, ref) => {
  const isPropControlled = propValue !== undefined;
  const isBound = !!(dataObj && dataKey);

  const [innerValue, setInnerValue] = useState(defaultValue);
  const [draftValue, setDraftValue] = useState(undefined);
  const composingRef = useRef(false);

  const getExternalValue = () => {
    if (isPropControlled) {
      return propValue ?? '';
    }
    if (isBound) {
      const bound = dataObj[dataKey];
      return bound ?? '';
    }
    return innerValue ?? '';
  };

  useEffect(() => {
    const external = getExternalValue();
    if (draftValue !== undefined && draftValue === external) {
      setDraftValue(undefined);
    }
  }, [propValue, dataObj, dataKey, draftValue]);

  const commit = (raw) => {
    const next = raw ?? '';
    if (isBound) {
      dataObj[dataKey] = next;
    }
    if (!isPropControlled && !isBound) {
      setInnerValue(next);
    }
    if (onChangeText) {
      onChangeText(next);
    }
    if (onValueChange) {
      onValueChange(next);
    }
  };

  const baseStyle = 'w-full px-3 py-2 text-sm rounded-md shadow-sm bg-white';
  const stateStyle = error
    ? 'border border-red-300'
    : 'border border-gray-300';

  const value = draftValue ?? getExternalValue();
  const numberOfLines = rows && rows > 0 ? rows : 4;

  const handleChange = (text) => {
    const composing = composingRef.current;
    setDraftValue(text);
    if (!composing) {
      commit(text);
    }
  };

  return (
    <View className="w-full">
      <TextInput
        ref={ref}
        multiline
        editable={!disabled && !readOnly}
        numberOfLines={numberOfLines}
        placeholder={placeholder}
        value={value}
        onChangeText={handleChange}
        onBlur={() => commit(value)}
        onCompositionStart={() => {
          composingRef.current = true;
        }}
        onCompositionEnd={() => {
          composingRef.current = false;
          commit(value);
        }}
        className={cn(
          baseStyle,
          stateStyle,
          disabled || readOnly ? 'bg-gray-100 text-gray-500' : '',
          className,
        )}
        {...props}
      />
    </View>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;

