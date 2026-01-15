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
            setBoundValue(dataObj, 'checked', next);
        }
    }, [isDataObjControlled, dataObj, dataKeyName]);

    const handleChange = (e) => {
        e.stopPropagation();
        const newChecked = e.target.checked;

        if (!isControlled) {
            setInternalChecked(newChecked);
        }

        if (isDataObjControlled) {
            setBoundValue(dataObj, dataKeyName, newChecked);
            setBoundValue(dataObj, 'checked', newChecked);
        }

        const ctx = buildCtx({ dataKey: dataKeyName, dataObj, source: 'user', dirty: true, valid: null });
        fireValueHandlers({ onChange, onValueChange, value: newChecked, ctx, event: e });
    };

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
        '--checkbox-color': '#3b82f6'  // primary color
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

export default Checkbox; 
