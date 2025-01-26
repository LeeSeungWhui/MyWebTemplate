import { useState, useEffect } from 'react';
import styles from './Radiobox.module.css';

const Radiobox = ({
    label,
    name,
    value,
    onChange,
    dataObj,
    dataKey,
    className = "",
    checked: propChecked,
    defaultChecked,
    disabled = false,
    color = "primary",
    ...props
}) => {
    const isControlled = propChecked !== undefined;
    const isDataObjControlled = dataObj && (dataKey || label);

    // name이나 dataKey가 없을 경우 label을 name으로 사용
    const inputName = name || label || dataKey;
    const dataKeyName = dataKey || name || label;

    const [internalChecked, setInternalChecked] = useState(() => {
        if (dataObj && dataKeyName) {
            return dataObj[dataKeyName] === value;
        }
        return defaultChecked || false;
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

    // CSS 색상값인지 확인 (HEX, RGB, RGBA, HSL, HSLA)
    const isCssColor = /^(#|rgb[a]?\(|hsl[a]?\()/.test(color);

    // 라디오 색상 스타일
    const colorStyle = isCssColor ? {
        '--radio-color': color
    } : {};

    return (
        <label className={`${styles.wrapper} ${className}`}>
            <input
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
};

export default Radiobox; 