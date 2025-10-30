/**
 * 파일명: Select.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Select UI 컴포넌트 (EasyObj/EasyList 바인딩 + 컨트롤드 지원)
 */
import { useEffect, useMemo, useState, forwardRef } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';

const Select = forwardRef(({
    // 데이터/표시
    dataList = [],
    valueKey = 'value',
    textKey = 'text',
    placeholder,
    // 바인딩/컨트롤드
    dataObj,
    dataKey,
    value,
    defaultValue,
    onChange,
    onValueChange,
    // 상태/접근성
    status = 'idle', // idle | loading | error | success | empty
    invalid,
    errorMessage,
    hint,
    className = "",
    disabled = false,
    ...props
}, ref) => {
    const isBound = !!(dataObj && dataKey);
    const isControlled = !isBound && typeof value !== 'undefined';

    // 혼용 방지 경고 (관측성): 바운드+컨트롤드 동시에 주는 경우
    useEffect(() => {
        if (dataObj && typeof value !== 'undefined') {
            // eslint-disable-next-line no-console
            console.warn('[Select] dataObj/dataKey와 value를 동시에 전달했습니다. 컨트롤 모드를 하나만 선택하세요. (CU-WEB-003)');
        }
    }, [dataObj, value]);

    // 내부 상태는 '언컨트롤드'에서만 사용
    const [innerValue, setInnerValue] = useState(() => {
        if (isBound) return '';
        if (isControlled) return value;
        if (typeof defaultValue !== 'undefined') return defaultValue;
        const sel = dataList.find((it) => it && it.selected);
        return sel ? sel[valueKey] : '';
    });
    // 바운드 모델 변화에 대응(부모 리렌더 의존 없이도 동작)
    const [, setTick] = useState(0);
    useEffect(() => {
        if (!isBound || !dataObj?.subscribe) return;
        const off = dataObj.subscribe(() => setTick((t) => t + 1));
        return () => off?.();
    }, [isBound, dataObj]);

    // 선택값 계산
    const selectedValue = useMemo(() => {
        if (isBound) return getBoundValue(dataObj, dataKey) ?? '';
        if (isControlled) return value;
        return innerValue ?? '';
    }, [isBound, isControlled, dataObj, dataKey, value, innerValue]);

    // placeholder 항목 선택 여부
    const placeholderOption = useMemo(() => dataList.find((item) => item && item.placeholder), [dataList]);
    const isPlaceholderSelected = placeholderOption && (selectedValue === '' || selectedValue === placeholderOption?.[valueKey]);

    const baseStyle = "block w-full px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none bg-white";
    const states = {
        default: "border border-gray-300 focus:ring-blue-500 focus:border-blue-500",
        error: "border border-red-300 focus:ring-red-500 focus:border-red-500",
        disabled: "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed",
        loading: "bg-gray-50 text-gray-500 border-gray-300 cursor-progress",
        empty: "bg-gray-50 text-gray-400 border-gray-300",
        success: "border border-green-300 focus:ring-green-500 focus:border-green-500",
    };

    const isEmpty = status === 'empty' || (Array.isArray(dataList) && dataList.length === 0);
    const computedDisabled = disabled || status === 'loading' || status === 'disabled';
    const isInvalid = !!(typeof invalid !== 'undefined' ? invalid : (status === 'error'));

    const selectClass = `
        ${baseStyle}
        ${computedDisabled ? states.disabled : isInvalid ? states.error : (status === 'success' ? states.success : (status === 'loading' ? states.loading : (isEmpty ? states.empty : states.default)))}
        ${isPlaceholderSelected ? 'text-gray-400' : 'text-gray-900'}
        ${className}
    `.trim();

    const handleChange = (e) => {
        const next = e.target.value;
        const selectedText = e.target.options?.[e.target.selectedIndex]?.text;

        // dataList.selected 토글
        try {
            if (dataList?.forAll) {
                dataList.forAll((item) => {
                    if (!item) return item;
                    item.selected = String(item[valueKey]) === String(next);
                    return item;
                });
            } else if (Array.isArray(dataList)) {
                dataList.forEach((item) => {
                    if (!item) return;
                    item.selected = String(item[valueKey]) === String(next);
                });
            }
        } catch {}

        // 모드별 커밋
        if (isBound) setBoundValue(dataObj, dataKey, next);
        else if (isControlled) {/* 외부가 주도 */}
        else setInnerValue(next);

        const ctx = buildCtx({ dataKey, dataObj, source: 'user', valid: null, dirty: true });
        // 원본 이벤트 그대로 전달 + detail에 값/컨텍스트 부착
        fireValueHandlers({ onChange, onValueChange, value: next, ctx, event: e });
        // 텍스트도 필요하면 e.detail.text로 참고 가능
        try {
            if (e?.detail && typeof e.detail === 'object') e.detail.text = selectedText;
        } catch {}
    };

    // 드롭다운 아이콘
    const dropdownIcon = (
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </div>
    );

    const describedByIds = [props['aria-describedby']].filter(Boolean);
    if (hint) describedByIds.push(`${props.id || 'select'}-hint`);
    if (errorMessage && isInvalid) describedByIds.push(`${props.id || 'select'}-error`);

    return (
        <div className="relative">
            <select
                ref={ref}
                value={selectedValue}
                onChange={handleChange}
                disabled={computedDisabled || isEmpty}
                className={selectClass}
                aria-invalid={isInvalid}
                aria-busy={status === 'loading' ? true : undefined}
                aria-describedby={describedByIds.length ? describedByIds.join(' ') : undefined}
                {...props}
            >
                {isEmpty ? (
                    <option value="" disabled>{placeholder || '옵션이 없습니다'}</option>
                ) : (
                    dataList.map((item, index) => (
                        <option
                            key={index}
                            value={item[valueKey]}
                            className={item.placeholder ? 'text-gray-400' : 'text-gray-900'}
                        >
                            {item[textKey]}
                        </option>
                    ))
                )}
            </select>
            {dropdownIcon}
            {hint && (
                <p id={`${props.id || 'select'}-hint`} className="mt-1 text-xs text-gray-500">{hint}</p>
            )}
            {errorMessage && isInvalid && (
                <p id={`${props.id || 'select'}-error`} className="mt-1 text-xs text-red-600">{errorMessage}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;
