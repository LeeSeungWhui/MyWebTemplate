/**
 * 파일명: Radiobox.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Radiobox UI 컴포넌트 구현
 */
import { useState, useEffect, forwardRef } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../../binding';
import styles from './Radiobox.module.css';

/**
 * @description 렌더링 및 상호작용 처리
 * 처리 규칙: 전달된 props와 바인딩 값을 기준으로 UI 상태를 계산하고 변경 이벤트를 상위로 전달한다.
 * @updated 2026-02-27
 */
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
        }
    }, [isDataObjControlled, dataObj, dataKeyName, value]);

    /**
     * @description 라디오 변경 이벤트를 처리하고 dataObj/콜백에 선택값을 반영
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
            try { event.target.value = value; } catch (_) { /* 무시 */ }
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
     * @description controlled/dataObj/internal 우선순위에 맞춰 선택 상태를 계산. 입력/출력 계약을 함께 명시
     * @returns {boolean}
     * @updated 2026-02-27
     */
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

/**
 * @description Radiobox 컴포넌트 진입점 노출
 * 반환값: 기본 라디오 입력 UI를 제공하는 Radiobox 컴포넌트.
 * @returns {React.ComponentType}
 */
export default Radiobox;
