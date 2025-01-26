import { useState, useEffect } from 'react';
import styles from './Checkbox.module.css';

const Checkbox = ({
    label,
    name,
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
    const isDataObjControlled = dataObj && (dataKey || label);

    // name이나 dataKey가 없을 경우 label을 사용
    const inputName = name || label || dataKey;
    const dataKeyName = dataKey || label;

    const [internalChecked, setInternalChecked] = useState(() => {
        if (dataObj && dataKeyName) {
            return [true, 'Y', 'y', '1', 1].includes(dataObj[dataKeyName]);
        }
        return false;
    });

    useEffect(() => {
        if (isDataObjControlled) {
            const value = dataObj[dataKeyName];
            setInternalChecked([true, 'Y', 'y', '1', 1].includes(value));
        }
    }, [isDataObjControlled, dataObj, dataKeyName]);

    const handleChange = (e) => {
        e.stopPropagation();
        const newChecked = e.target.checked;

        if (!isControlled) {
            setInternalChecked(newChecked);
        }

        if (isDataObjControlled) {
            dataObj[dataKeyName] = newChecked;
        }

        onChange?.(e);
    };

    const getCheckedState = () => {
        if (isControlled) return propChecked;
        if (isDataObjControlled) return [true, 'Y', 'y', '1', 1].includes(dataObj[dataKeyName]);
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
                type="checkbox"
                name={inputName}
                checked={getCheckedState()}
                disabled={disabled}
                onChange={handleChange}
                className={styles.checkbox}
                style={colorStyle}
                {...props}
            />
            {label && <span className={styles.label}>{label}</span>}
        </label>
    );
};

export default Checkbox; 