import { useState, useRef, forwardRef } from 'react';
import Icon from './Icon';

const Input = forwardRef(({
    dataObj,
    dataKey,
    type = "text",
    className = "",
    placeholder,
    onChange,
    error,
    filter,
    mask,
    hardFilter = false,
    blockHangul = false,
    maxDigits,
    maxDecimals,
    prefix,
    suffix,
    togglePassword,
    ...props
}, ref) => {
    const isControlled = dataObj && dataKey;
    const [showPassword, setShowPassword] = useState(false);
    const [isComposing, setIsComposing] = useState(false);
    const [draftValue, setDraftValue] = useState(undefined);
    const [innerValue, setInnerValue] = useState(() => props.value ?? props.defaultValue ?? "");
    const composingRef = useRef(false);
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

    const commitValue = (raw) => {
        let value = raw;
        if (filter) {
            const regex = new RegExp(`[^${filter}]`, 'g');
            value = value.replace(regex, '');
        }
        if (mask) {
            value = applyMask(value, mask);
        }
        if (type === 'number' && (maxDigits !== undefined || maxDecimals !== undefined)) {
            const regex = new RegExp(`^-?\\\d{0,${maxDigits || 2}}(\\.\\\d{0,${maxDecimals || 2}})?$`);
            if (!regex.test(value)) {
                return; // reject invalid numeric pattern
            }
        }
        if (isControlled) {
            dataObj[dataKey] = value;
        } else {
            setInnerValue(value);
        }
        setDraftValue(undefined);
        return value;
    };

    const handleBeforeInput = (e) => {
        if (!hardFilter) return;
        const data = e.data;
        if (!data || typeof data !== 'string') return;
        // block by filter first
        if (filter) {
            const allow = new RegExp(`^[${filter}]+$`);
            if (!allow.test(data)) {
                e.preventDefault();
                return;
            }
        }
        // block hangul when mask present or explicitly requested
        if (mask || blockHangul) {
            const hangul = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/;
            if (hangul.test(data)) {
                e.preventDefault();
                return;
            }
        }
        // numeric type: allow digits, dot, minus only (detailed shape validated on commit)
        if (type === 'number') {
            if (!/^[0-9.\-]+$/.test(data)) {
                e.preventDefault();
                return;
            }
        }
    };

    const handleChange = (e) => {
        const composing = e.nativeEvent.isComposing || composingRef.current;
        const raw = e.target.value;
        if (composing) {
            // During IME composition, do not update external state; keep local draft for rendering
            setDraftValue(raw);
            return;
        }
        const committed = commitValue(raw);
        const event = { ...e, target: { ...e.target, value: committed } };
        onChange && onChange(event);
    };

    const inputClass = `
        ${baseStyle}
        ${error ? states.error : states.default}
        ${className}
    `.trim();

    return (
        <div className="relative flex items-center">
            {prefix && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {prefix}
                </div>
            )}
            <input
                ref={ref}
                type={togglePassword ? (showPassword ? 'text' : 'password') : type}
                pattern={type === 'number' ? '[0-9]*' : undefined}
                inputMode={type === 'number' ? 'decimal' : undefined}
                placeholder={placeholder || mask}
                value={isControlled
                    ? (draftValue ?? dataObj[dataKey] ?? "")
                    : (draftValue ?? innerValue ?? "")}
                onBeforeInput={handleBeforeInput}
                onChange={handleChange}
                onCompositionStart={() => { composingRef.current = true; setIsComposing(true); }}
                onCompositionEnd={(e) => {
                    composingRef.current = false;
                    setIsComposing(false);
                    const committed = commitValue(e.target.value);
                    onChange && onChange({ ...e, target: { ...e.target, value: committed } });
                }}
                onBlur={(e) => {
                    // Ensure final sanitize on blur in case some IME didn't fire compositionend properly
                    const committed = commitValue(e.target.value);
                    onChange && onChange({ ...e, target: { ...e.target, value: committed } });
                }}
                className={`
                    ${inputClass}
                    ${prefix ? 'pl-10' : ''}
                    ${suffix ? 'pr-10' : ''}
                    ${togglePassword ? 'pr-10' : ''}
                `}
                {...props}
            />
            {suffix && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {suffix}
                </div>
            )}
            {togglePassword && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                    <Icon
                        icon={showPassword ? "ri:RiEyeLine" : "ri:RiEyeOffLine"}
                        className="w-5 h-5 text-gray-400"
                    />
                </button>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
