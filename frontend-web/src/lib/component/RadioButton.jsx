import { useState, useEffect } from 'react';

const RadioButton = ({
    children,
    name,
    value,
    onChange,
    dataObj,
    dataKey,
    className = "",
    checked: propChecked,
    disabled = false,
    color = "primary",
    ...props
}) => {
    const isControlled = propChecked !== undefined;
    const isDataObjControlled = dataObj && (dataKey || name);

    // name이나 dataKey가 없을 경우 children을 name으로 사용
    const inputName = name || dataKey || (typeof children === 'string' ? children : undefined);
    const dataKeyName = dataKey || name || (typeof children === 'string' ? children : undefined);

    const [internalChecked, setInternalChecked] = useState(() => {
        if (dataObj && dataKeyName) {
            return dataObj[dataKeyName] === value;
        }
        return false;
    });

    useEffect(() => {
        if (isDataObjControlled) {
            const currentValue = dataObj[dataKeyName];
            setInternalChecked(currentValue === value);
        }
    }, [isDataObjControlled, dataObj, dataKeyName, value]);

    const handleChange = (e) => {
        e.stopPropagation();
        const newChecked = e.target.checked;

        if (!isControlled) {
            setInternalChecked(newChecked);
        }

        if (isDataObjControlled && newChecked) {
            dataObj[dataKeyName] = value;
        }

        onChange?.(e);
    };

    const getCheckedState = () => {
        if (isControlled) return propChecked;
        if (isDataObjControlled) return dataObj[dataKeyName] === value;
        return internalChecked;
    };

    const checked = getCheckedState();

    // CSS 색상값인지 확인 (HEX, RGB, RGBA, HSL, HSLA)
    const isCssColor = /^(#|rgb[a]?\(|hsl[a]?\()/.test(color);

    const baseStyle = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 border";
    const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

    // 커스텀 색상일 경우 CSS 변수만 style로 처리
    const buttonStyle = isCssColor ? {
        '--btn-color': color,
    } : {};

    // 커스텀 색상 또는 기본 색상 스타일
    const colorStyle = isCssColor
        ? `${checked
            ? "bg-[var(--btn-color)] border-[var(--btn-color)] text-white hover:opacity-90"
            : "bg-white border-gray-300 text-gray-700 hover:border-[var(--btn-color)]"
        }`
        : `${checked
            ? "bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-500"
        }`;

    return (
        <label className={`inline-block ${className}`}>
            <input
                type="radio"
                name={inputName}
                value={value}
                checked={checked}
                disabled={disabled}
                onChange={handleChange}
                className="sr-only"  // 실제 라디오 버튼은 숨김
                {...props}
            />
            <span
                style={buttonStyle}
                className={`
                    ${baseStyle}
                    ${colorStyle}
                    ${disabledStyle}
                `.trim()}
            >
                {children}
            </span>
        </label>
    );
};

export default RadioButton; 