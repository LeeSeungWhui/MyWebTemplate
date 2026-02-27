/**
 * 파일명: Checkbox.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Checkbox UI 컴포넌트 구현
 */
import { useState, useEffect, forwardRef } from 'react';
import styles from './Checkbox.module.css';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../../binding';

const Checkbox = forwardRef(({
    label,
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
    const isDataObjControlled = dataObj && (dataKey || label);

    // name이나 dataKey가 없을 경우 label을 사용
    const inputName = name || label || dataKey;
    const dataKeyName = dataKey || label;

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
     * @description 체크박스 변경값을 내부 상태와 dataObj에 반영하고 이벤트를 전파
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

        if (isDataObjControlled) {
            setBoundValue(dataObj, dataKeyName, newChecked);
        }

        const ctx = buildCtx({ dataKey: dataKeyName, dataObj, source: 'user', dirty: true, valid: null });
        fireValueHandlers({ onChange, onValueChange, value: newChecked, ctx, event });
    };

    /**
     * @description controlled/dataObj/internal 우선순위로 렌더링 체크 상태를 결정
     * @returns {boolean}
     * @updated 2026-02-27
     */
    const getCheckedState = () => {
        if (isControlled) return propChecked;
        if (isDataObjControlled) return [true, 'Y', 'y', '1', 1].includes(getBoundValue(dataObj, dataKeyName));
        return internalChecked;
    };

    // CSS 색상값인지 확인 (HEX, RGB, RGBA, HSL, HSLA)
    const isCssColor = /^(#|rgb[a]?\(|hsl[a]?\()/.test(color);

    // 체크박스 색상 스타일
    const colorStyle = isCssColor ? {
        '--checkbox-color': color
    } : {
        '--checkbox-color': '#3b82f6'  // 한글설명: primary color
    };

    return (
        <label className={`${styles.wrapper} ${className}`}>
            <input
                ref={ref}
                type="checkbox"
                name={inputName}
                checked={getCheckedState()}
                disabled={disabled}
                onChange={handleChange}
                className={styles.checkbox}
                style={colorStyle}
                role="checkbox"
                aria-checked={getCheckedState()}
                aria-disabled={disabled}
                {...props}
            />
            {label && <span className={styles.label}>{label}</span>}
        </label>
    );
});

Checkbox.displayName = 'Checkbox';

/**
 * @description Checkbox 컴포넌트를 기본 export
 * @returns {React.ComponentType} Checkbox 컴포넌트
 */
export default Checkbox; 
