const Input = ({
    dataObj,
    dataKey,
    type = "text",
    className = "",
    placeholder,
    onChange,
    error,
    filter,
    mask,
    maxDigits,
    maxDecimals,
    ...props
}) => {
    const isControlled = dataObj && dataKey;
    const baseStyle = "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-offset-0";

    const states = {
        default: "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
        error: "border-red-300 focus:ring-red-500 focus:border-red-500",
    };

    const applyMask = (value, mask) => {
        // 마스크에서 실제 입력 가능한 문자 개수 계산
        const maxLength = mask.replace(/[^#A-Za-z?*]/g, '').length;

        // 마스크 패턴에 맞지 않는 문자 먼저 제거
        let cleanValue = '';
        let maskPosition = 0;

        for (let i = 0; i < value.length && cleanValue.length < maxLength; i++) {
            const char = value[i];

            // 마스크의 다음 입력 위치 찾기
            while (maskPosition < mask.length &&
                !['#', 'A', 'a', '?', '*'].includes(mask[maskPosition])) {
                maskPosition++;
            }

            if (maskPosition >= mask.length) break;

            const maskChar = mask[maskPosition];

            if (maskChar === '#' && /\d/.test(char)) {
                cleanValue += char;
                maskPosition++;
            } else if (maskChar === 'A' && /[a-zA-Z]/.test(char)) {
                cleanValue += char.toUpperCase();
                maskPosition++;
            } else if (maskChar === 'a' && /[a-zA-Z]/.test(char)) {
                cleanValue += char.toLowerCase();
                maskPosition++;
            } else if (maskChar === '?' && /[a-zA-Z]/.test(char)) {
                cleanValue += char;
                maskPosition++;
            } else if (maskChar === '*') {
                cleanValue += char;
                maskPosition++;
            }
        }

        // 마스크 적용
        let result = '';
        let valueIndex = 0;

        for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
            const maskChar = mask[i];

            if (['#', 'A', 'a', '?', '*'].includes(maskChar)) {
                result += cleanValue[valueIndex];
                valueIndex++;
            } else {
                result += maskChar;
            }
        }

        return result;
    };

    const handleChange = (e) => {
        const isComposing = e.nativeEvent.isComposing;
        let value = e.target.value;

        if (!isComposing) {
            if (filter) {
                const regex = new RegExp(`[^${filter}]`, "g");
                value = value.replace(regex, "");
            }

            if (mask) {
                value = applyMask(value, mask);
            }

            if (type === 'number' && (maxDigits !== undefined || maxDecimals !== undefined)) {
                const regex = new RegExp(`^-?\\d{0,${maxDigits || 2}}(\\.\\d{0,${maxDecimals || 2}})?$`);
                if (!regex.test(value)) {
                    return;
                }
            }
        }

        if (isControlled) {
            dataObj[dataKey] = value;
        }

        const event = { ...e, target: { ...e.target, value } };
        onChange && onChange(event);
    };

    const inputClass = `
        ${baseStyle}
        ${error ? states.error : states.default}
        ${className}
    `.trim();

    return (
        <input
            type={type}
            pattern={type === 'number' ? '[0-9]*' : undefined}
            inputMode={type === 'number' ? 'decimal' : undefined}
            placeholder={placeholder || mask}
            value={isControlled ? dataObj[dataKey] || "" : props.value}
            onChange={handleChange}
            onCompositionEnd={handleChange}
            className={inputClass}
            {...props}
        />
    );
};

export default Input;