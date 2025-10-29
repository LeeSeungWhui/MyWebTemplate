/**
 * 파일명: CheckButton.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: CheckButton UI 컴포넌트 구현
 */
import { useState, useEffect, forwardRef } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';

const CheckButton = forwardRef(({
    children,
    name,
    onChange,
    onValueChange,
    dataObj,
    dataKey,
    className = "",
    checked: propChecked,
    disabled = false,
    color = "primary",
    ...props
}, ref) => {
    const isControlled = propChecked !== undefined;
    const isDataObjControlled = dataObj && (dataKey || name);

    // name이나 dataKey가 없을 경우 children을 name으로 사용
    const inputName = name || dataKey || (typeof children === 'string' ? children : undefined);
    const dataKeyName = dataKey || name || (typeof children === 'string' ? children : undefined);

    const [internalChecked, setInternalChecked] = useState(() => {
        if (dataObj && dataKeyName) {
            return [true, 'Y', 'y', '1', 1].includes(getBoundValue(dataObj, dataKeyName));
        }
        return false;
    });

    useEffect(() => {
        if (isDataObjControlled) {
            const value = getBoundValue(dataObj, dataKeyName);
            setInternalChecked([true, 'Y', 'y', '1', 1].includes(value));
        }
    }, [isDataObjControlled, dataObj, dataKeyName]);

    const handleChange = (e) => {
        e.stopPropagation();
        const newChecked = !getCheckedState(); // 버튼은 toggle 방식

        if (!isControlled) {
            setInternalChecked(newChecked);
        }

        if (isDataObjControlled) {
            setBoundValue(dataObj, dataKeyName, newChecked, { source: 'user' });
        }

        const ctx = buildCtx({ dataKey: dataKeyName, dataObj, source: 'user', dirty: true, valid: null });
        fireValueHandlers({
            onChange,
            onValueChange,
            value: newChecked,
            ctx,
            event: { ...e, target: { ...e.target, value: newChecked }, detail: { value: newChecked, ctx } },
        });
    };

    const getCheckedState = () => {
        if (isControlled) return propChecked;
        if (isDataObjControlled) return [true, 'Y', 'y', '1', 1].includes(getBoundValue(dataObj, dataKeyName));
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
        <button
            ref={ref}
            type="button"
            name={inputName}
            onClick={handleChange}
            disabled={disabled}
            style={buttonStyle}
            className={`
                ${baseStyle}
                ${colorStyle}
                ${disabledStyle}
                ${className}
            `.trim()}
            {...props}
        >
            {children}
        </button>
    );
});

CheckButton.displayName = 'CheckButton';

export default CheckButton; 
