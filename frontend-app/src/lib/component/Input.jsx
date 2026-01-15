/**
 * 파일명: lib/component/Input.jsx
 * 설명: 텍스트/숫자/마스킹을 지원하는 공통 입력 컴포넌트
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { forwardRef, useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { cn } from '../../common/util/cn';
import Icon from './Icon';

/**
 * @description 텍스트/숫자 입력을 위한 공통 인풋. 마스킹/필터/토글 비밀번호 지원.
 */
const Input = forwardRef(({
  dataObj,
  dataKey,
  type = 'text',
  className = '',
  placeholder,
  onChangeText,
  onValueChange,
  error,
  filter,
  mask,
  maxDigits,
  maxDecimals,
  prefix,
  suffix,
  togglePassword,
  ...props
}, ref) => {
  const isControlled = dataObj && dataKey;
  const [showPassword, setShowPassword] = useState(false);
  const [innerValue, setInnerValue] = useState(() => {
    if (isControlled && dataObj && dataKey in dataObj) {
      return dataObj[dataKey] ?? '';
    }
    if (typeof props.value === 'string') {
      return props.value;
    }
    return '';
  });

  const baseStyle = 'w-full px-3 py-2 border rounded-md shadow-sm text-sm';

  const states = {
    default: 'border-gray-300 focus:border-blue-500',
    error: 'border-red-300 focus:border-red-500',
  };

  const applyMask = (rawValue, maskPattern) => {
    if (!maskPattern) {
      return rawValue;
    }

    const maxLength = maskPattern.replace(/[^#A-Za-z?*]/g, '').length;

    let cleanValue = '';
    let maskPosition = 0;

    for (let i = 0; i < rawValue.length && cleanValue.length < maxLength; i += 1) {
      const char = rawValue[i];

      while (
        maskPosition < maskPattern.length
        && !['#', 'A', 'a', '?', '*'].includes(maskPattern[maskPosition])
      ) {
        maskPosition += 1;
      }

      if (maskPosition >= maskPattern.length) {
        break;
      }

      const maskChar = maskPattern[maskPosition];

      if (maskChar === '#' && /\d/.test(char)) {
        cleanValue += char;
        maskPosition += 1;
      } else if (maskChar === 'A' && /[a-zA-Z]/.test(char)) {
        cleanValue += char.toUpperCase();
        maskPosition += 1;
      } else if (maskChar === 'a' && /[a-zA-Z]/.test(char)) {
        cleanValue += char.toLowerCase();
        maskPosition += 1;
      } else if (maskChar === '?' && /[a-zA-Z]/.test(char)) {
        cleanValue += char;
        maskPosition += 1;
      } else if (maskChar === '*') {
        cleanValue += char;
        maskPosition += 1;
      }
    }

    let result = '';
    let valueIndex = 0;

    for (let i = 0; i < maskPattern.length && valueIndex < cleanValue.length; i += 1) {
      const maskChar = maskPattern[i];
      if (['#', 'A', 'a', '?', '*'].includes(maskChar)) {
        result += cleanValue[valueIndex];
        valueIndex += 1;
      } else {
        result += maskChar;
      }
    }

    return result;
  };

  const handleChangeText = (text) => {
    let value = text ?? '';

    if (filter) {
      const regex = new RegExp(`[^${filter}]`, 'g');
      value = value.replace(regex, '');
    }

    if (mask) {
      value = applyMask(value, mask);
    }

    if (type === 'number') {
      if (maxDigits !== undefined || maxDecimals !== undefined) {
        const digitLimit = maxDigits ?? 2;
        const decimalLimit = maxDecimals ?? 2;
        const numericPattern = new RegExp(`^-?\\d{0,${digitLimit}}(\\.\\d{0,${decimalLimit}})?$`);
        if (!numericPattern.test(value)) {
          return;
        }
      }

      value = value.replace(/[^0-9.-]/g, '');
    }

    if (isControlled && dataObj) {
      dataObj[dataKey] = value;
    } else if (props.value === undefined) {
      setInnerValue(value);
    }

    if (onChangeText) {
      onChangeText(value);
    }

    if (onValueChange) {
      onValueChange(value);
    }
  };

  const resolvedValue = isControlled && dataObj
    ? (dataObj[dataKey] ?? '')
    : (props.value ?? innerValue);

  return (
    <View className="relative">
      <View className="flex-row items-center">
        {prefix ? (
          <View className="absolute left-3 z-10">
            {prefix}
          </View>
        ) : null}
        <TextInput
          ref={ref}
          secureTextEntry={togglePassword && !showPassword}
          keyboardType={type === 'number' ? 'decimal-pad' : 'default'}
          placeholder={placeholder || mask}
          value={resolvedValue}
          onChangeText={handleChangeText}
          className={cn(
            baseStyle,
            error ? states.error : states.default,
            prefix ? 'pl-10' : '',
            suffix || togglePassword ? 'pr-10' : '',
            className,
          )}
          {...props}
        />
        {suffix ? (
          <View className="absolute right-3 z-10">
            {suffix}
          </View>
        ) : null}
        {togglePassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-3 z-10"
          >
            <Icon
              icon={showPassword ? 'io:eye' : 'io:eye-off'}
              size="md"
              color="#9CA3AF"
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
});

Input.displayName = 'Input';

export default Input;
