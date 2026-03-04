/**
 * 파일명: RadioButton.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: RadioButton UI 컴포넌트 구현
 */
import { useState, useEffect, forwardRef } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';

/**
 * @description 렌더링 및 상호작용 처리
 * 처리 규칙: 전달된 props와 바인딩 값을 기준으로 UI 상태를 계산하고 변경 이벤트를 상위로 전달한다.
 * @updated 2026-02-27
 */
const RadioButton = forwardRef(({
    children,
    name,
    value,
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
            return getBoundValue(dataObj, dataKeyName) === value;
        }
        return false;
    });

    /**
     * @description useEffect 실행 흐름 관리
     * 처리 규칙: effect 실행/cleanup 경계를 명시적으로 유지.
     */
    useEffect(() => {
        if (isDataObjControlled) {
            const currentValue = getBoundValue(dataObj, dataKeyName);
            const next = currentValue === value;
            setInternalChecked(next);
        }
    }, [isDataObjControlled, dataObj, dataKeyName, value]);

    /**
     * @description 라디오 선택 이벤트를 처리하고 선택값을 bound 데이터와 콜백에 반영
     * @param {React.ChangeEvent<HTMLInputElement>} event
     * @returns {void}
     * @updated 2026-02-27
     */
    const handleChange = (event) => {
        event.stopPropagation();
        const newChecked = event.target.checked;

        if (!isControlled) {
            setInternalChecked(newChecked);
        }

        if (isDataObjControlled && newChecked) {
            setBoundValue(dataObj, dataKeyName, value, { source: 'user' });
        }

        const ctx = buildCtx({ dataKey: dataKeyName, dataObj, source: 'user', dirty: true, valid: null });
        if (newChecked) {
            try { event.target.value = value; } catch (eventSyncError) { void eventSyncError; /* 무시 */ }
        }
        fireValueHandlers({
            onChange,
            onValueChange,
            value: newChecked ? value : undefined,
            ctx,
            event,
        });
    };

    /**
     * @description controlled/dataObj/internal 우선순위로 현재 선택 상태를 계산. 입력/출력 계약을 함께 명시
     * @returns {boolean}
     * @updated 2026-02-27
     */
    const getCheckedState = () => {
        if (isControlled) return propChecked;
        if (isDataObjControlled) return getBoundValue(dataObj, dataKeyName) === value;
        return internalChecked;
    };

    const checked = getCheckedState();
    const baseStyle = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 border";
    const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
    const colorKey = typeof color === "string" ? color.toLowerCase() : "primary";
    const colorPresetMap = {
        primary: {
            checked: "bg-blue-500 text-white hover:bg-blue-600 border-blue-500",
            unchecked: "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500",
        },
        success: {
            checked: "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500",
            unchecked: "bg-white border-gray-300 text-gray-700 hover:bg-emerald-50 hover:border-emerald-500",
        },
        warning: {
            checked: "bg-amber-500 text-white hover:bg-amber-600 border-amber-500",
            unchecked: "bg-white border-gray-300 text-gray-700 hover:bg-amber-50 hover:border-amber-500",
        },
        danger: {
            checked: "bg-rose-500 text-white hover:bg-rose-600 border-rose-500",
            unchecked: "bg-white border-gray-300 text-gray-700 hover:bg-rose-50 hover:border-rose-500",
        },
        neutral: {
            checked: "bg-gray-600 text-white hover:bg-gray-700 border-gray-600",
            unchecked: "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-500",
        },
    };
    const colorPreset = colorPresetMap[colorKey] || colorPresetMap.primary;
    const colorStyle = checked ? colorPreset.checked : colorPreset.unchecked;

    return (
        <label className={`inline-block ${className}`}>
            <input
                ref={ref}
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
});

RadioButton.displayName = 'RadioButton';

/**
 * @description RadioButton 컴포넌트 진입점 노출
 * 반환값: 버튼형 단일 선택 입력을 제공하는 RadioButton 컴포넌트.
 * @returns {React.ComponentType}
 */
export default RadioButton;
