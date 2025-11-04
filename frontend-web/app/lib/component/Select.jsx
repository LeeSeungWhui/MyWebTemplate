/**
 * 파일명: Select.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Select UI 컴포넌트 구현
 */
import { useEffect, useState, forwardRef } from 'react';
import { setBoundValue, buildCtx, fireValueHandlers } from '../binding';

const Select = forwardRef(({
    dataList = [],
    valueKey = 'value',
    textKey = 'text',
    onChange,
    className = "",
    disabled = false,
    error,
    ...props
}, ref) => {
    const [selectedValue, setSelectedValue] = useState('');

    useEffect(() => {
        const selectedItem = dataList.find(item => item.selected);
        setSelectedValue(selectedItem ? selectedItem[valueKey] : '');
    }, [dataList, valueKey]);

    const handleChange = (e) => {
        const selectedValue = e.target.value;
        const selectedText = e.target.options[e.target.selectedIndex].text;
        setSelectedValue(selectedValue);

        if (dataList.forAll) {
            dataList.forAll(item => {
                const itemValue = String(item[valueKey]);
                item.selected = itemValue === selectedValue;
                return item;
            });
        }
        else {
            dataList.forEach(item => {
                const itemValue = String(item[valueKey]);
                item.selected = itemValue === selectedValue;
            });
        }

        if (props.dataObj && props.dataKey) {
            setBoundValue(props.dataObj, props.dataKey, selectedValue);
        }
        const modifiedEvent = { ...e, target: { ...e.target, text: selectedText, value: selectedValue } };
        const ctx = buildCtx({ dataKey: props.dataKey, dataObj: props.dataObj, source: 'user', valid: null, dirty: true });
        fireValueHandlers({ onChange, onValueChange: props.onValueChange, value: selectedValue, ctx, event: modifiedEvent });
    };

    const baseStyle = "block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none bg-white";

    const states = {
        default: "border border-gray-300 focus:ring-blue-500 focus:border-blue-500",
        error: "border border-red-300 focus:ring-red-500 focus:border-red-500",
        disabled: "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
    };

    const placeholderOption = dataList.find(item => item.placeholder);
    const isPlaceholderSelected = placeholderOption && (selectedValue === '' || selectedValue === placeholderOption?.[valueKey]);

    const selectClass = `
        ${baseStyle}
        ${disabled ? states.disabled : error ? states.error : states.default}
        ${isPlaceholderSelected ? 'text-gray-400' : 'text-gray-900'}
        ${className}
    `.trim();

    // 드롭다운 화살표 아이콘 (SVG)
    const dropdownIcon = (
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </div>
    );

    return (
        <div className="relative">
            <select
                ref={ref}
                value={selectedValue}
                onChange={handleChange}
                disabled={disabled}
                className={selectClass}
                aria-invalid={!!error}
                {...props}
            >
                {dataList.map((item, index) => (
                    <option
                        key={index}
                        value={item[valueKey]}
                        className={item.placeholder ? 'text-gray-400' : 'text-gray-900'}
                    >
                        {item[textKey]}
                    </option>
                ))}
            </select>
            {dropdownIcon}
        </div>
    );
});

Select.displayName = 'Select';

export default Select; 
