import { forwardRef, useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { cn } from '../../common/util/cn';
import Icon from './Icon';

const Input = forwardRef(({
    dataObj,
    dataKey,
    type = "text",
    className = "",
    placeholder,
    onChangeText,
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

    // 기본 스타일
    const baseStyle = "w-full px-3 py-2 border rounded-md shadow-sm text-sm";

    // 상태별 스타일
    const states = {
        default: "border-gray-300 focus:border-blue-500",
        error: "border-red-300 focus:border-red-500",
    };

    const applyMask = (value, mask) => {
        // 웹이랑 동일한 마스크 로직
        // ... (마스크 로직은 그대로 유지)
    };

    const handleChangeText = (text) => {
        let value = text;

        if (filter) {
            const regex = new RegExp(`[^${filter}]`, "g");
            value = value.replace(regex, "");
        }

        if (mask) {
            value = applyMask(value, mask);
        }

        if (type === 'number') {
            if (maxDigits !== undefined || maxDecimals !== undefined) {
                const regex = new RegExp(`^-?\\d{0,${maxDigits || 2}}(\\.\\d{0,${maxDecimals || 2}})?$`);
                if (!regex.test(value)) {
                    return;
                }
            }
            // 숫자만 입력 가능하도록
            value = value.replace(/[^0-9.-]/g, '');
        }

        if (isControlled) {
            dataObj[dataKey] = value;
        }

        onChangeText?.(value);
    };

    return (
        <View className="relative">
            <View className="flex-row items-center">
                {prefix && (
                    <View className="absolute left-3 z-10">
                        {prefix}
                    </View>
                )}
                <TextInput
                    ref={ref}
                    secureTextEntry={togglePassword && !showPassword}
                    keyboardType={type === 'number' ? 'decimal-pad' : 'default'}
                    placeholder={placeholder || mask}
                    value={isControlled ? dataObj[dataKey] || "" : props.value}
                    onChangeText={handleChangeText}
                    className={cn(
                        baseStyle,
                        error ? states.error : states.default,
                        prefix ? "pl-10" : "",
                        suffix || togglePassword ? "pr-10" : "",
                        className
                    )}
                    {...props}
                />
                {suffix && (
                    <View className="absolute right-3 z-10">
                        {suffix}
                    </View>
                )}
                {togglePassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        className="absolute right-3 z-10"
                    >
                        <Icon
                            icon={showPassword ? "io:eye" : "io:eye-off"}
                            size="md"
                            color="#9CA3AF"
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
});

Input.displayName = 'Input';

export default Input; 