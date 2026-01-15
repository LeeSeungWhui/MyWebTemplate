/**
 * 파일명: Radiobox.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Radiobox UI 컴포넌트 구현
 */
import { useState, useEffect, forwardRef } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../../binding';
import styles from './Radiobox.module.css';

const Radiobox = forwardRef(({
    label,
    name,
    value,
    onChange,
    onValueChange,
    dataObj,
    dataKey,
    className = "",
    checked: propChecked,
    defaultChecked,
    disabled = false,
    color = "primary",
    ...props
}, ref) => {
    const isControlled = propChecked !== undefined;
    const isDataObjControlled = dataObj && (dataKey || label);

    // name이나 dataKey가 없을 경우 label을 name으로 사용
    const inputName = name || label || dataKey;
    const dataKeyName = dataKey || name || label;

    const [internalChecked, setInternalChecked] = useState(() => {
        if (dataObj && dataKeyName) {
            return getBoundValue(dataObj, dataKeyName) === value;
        }
        return defaultChecked || false;
    });

    useEffect(() => {
        if (isDataObjControlled) {
            const currentValue = getBoundValue(dataObj, dataKeyName);
            const next = currentValue === value;
            setInternalChecked(next);
            setBoundValue(dataObj, 'checked', next);
        }
    }, [isDataObjControlled, dataObj, dataKeyName, value]);

    const handleChange = (e) => {
        e.stopPropagation();
        const newChecked = e.target.checked;

        if (!isControlled) {
            setInternalChecked(newChecked);
        }

        if (isDataObjControlled && newChecked) {
            setBoundValue(dataObj, dataKeyName, value, { source: 'user' });
            setBoundValue(dataObj, 'checked', true, { source: 'user' });
        }

        const ctx = buildCtx({ dataKey: dataKeyName, dataObj, source: 'user', dirty: true, valid: null });
        if (newChecked) {
            try { e.target.value = value; } catch (_) { /* ignore */ }
        }
        fireValueHandlers({
            onChange,
            onValueChange,
            value: newChecked ? value : undefined,
            ctx,
            event: e,
        });
    };

    const getCheckedState = () => {
        if (isControlled) return propChecked;
        if (isDataObjControlled) return getBoundValue(dataObj, dataKeyName) === value;
        return internalChecked;
    };

    // CSS 색상값인지 확인 (HEX, RGB, RGBA, HSL, HSLA)
    const isCssColor = /^(#|rgb[a]?\(|hsl[a]?\()/.test(color);

    // 라디오 색상 스타일
    const colorStyle = isCssColor ? {
        '--radio-color': color
    } : {};

    return (
        <label className={`${styles.wrapper} ${className}`}>
            <input
                ref={ref}
                type="radio"
                name={inputName}
                value={value}
                checked={getCheckedState()}
                disabled={disabled}
                onChange={handleChange}
                className={styles.radio}
                style={colorStyle}
                {...props}
            />
            {label && <span className={styles.label}>{label}</span>}
        </label>
    );
});

Radiobox.displayName = 'Radiobox';

export default Radiobox; 
