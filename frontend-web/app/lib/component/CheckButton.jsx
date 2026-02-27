/**
 * 파일명: CheckButton.jsx
 * 작성자: LSH
 * 갱신일: 2025-02-19
 * 설명: CheckButton UI 컴포넌트 구현
 */
import React, { useState, useEffect } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';

/**
 * @description 렌더링 및 상호작용 처리
 * 처리 규칙: 전달된 props와 바인딩 값을 기준으로 UI 상태를 계산하고 변경 이벤트를 상위로 전달한다.
 * @updated 2026-02-27
 */
const CheckButton = React.forwardRef(({
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
            const next = [true, 'Y', 'y', '1', 1].includes(value);
            setInternalChecked(next);
        }
    }, [isDataObjControlled, dataObj, dataKeyName]);

    /**
     * @description 버튼 클릭 값을 토글하고 bound 데이터/콜백으로 변경 이벤트를 전파
     * @param {React.MouseEvent<HTMLButtonElement>} event
     * @returns {void}
     * @updated 2026-02-27
     */
    const handleChange = (event) => {
        event.stopPropagation();
        const newChecked = !getCheckedState(); // 토글

        if (!isControlled) {
            setInternalChecked(newChecked);
        }

        if (isDataObjControlled) {
            setBoundValue(dataObj, dataKeyName, newChecked, { source: 'user' });
        }

        const ctx = buildCtx({ dataKey: dataKeyName, dataObj, source: 'user', dirty: true, valid: null });
        try { event.target.value = newChecked; } catch (_) { /* 한글설명: 설명 동작 설명 */ }
        fireValueHandlers({
            onChange,
            onValueChange,
            value: newChecked,
            ctx,
            event,
        });
    };

    /**
     * @description controlled/dataObj/internal 우선순위로 현재 체크 상태를 계산. 입력/출력 계약을 함께 명시
     * @returns {boolean}
     * @updated 2026-02-27
     */
    const getCheckedState = () => {
        if (isControlled) return propChecked;
        if (isDataObjControlled) return [true, 'Y', 'y', '1', 1].includes(getBoundValue(dataObj, dataKeyName));
        return internalChecked;
    };

    const checked = getCheckedState();
    const isCssColor = /^(#|rgb[a]?\(|hsl[a]?\()/.test(color);

    const baseStyle = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 border";
    const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
    const buttonStyle = isCssColor ? {
        '--btn-color': color,
    } : {};

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
            aria-pressed={checked}
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

/**
 * @description 를 기본 export
 * @returns {React.ComponentType} CheckButton 컴포넌트
 */
export default CheckButton;
