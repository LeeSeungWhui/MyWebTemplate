/**
 * 파일명: Tab.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-07
 * 설명: Tab UI 컴포넌트 구현
 */
import { Children, useId, useRef, useState } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';

/**
 * @description Tab 자식 슬롯의 title 메타를 유지하면서 콘텐츠 노드만 반환. 입력/출력 계약을 함께 명시
 * @param {{ title: string, children: React.ReactNode }} props
 * @returns {React.ReactNode}
 * @updated 2026-02-27
 */
const TabItem = ({ title, children }) => {

    return children;
};

/**
 * @description 탭 목록 렌더링과 활성 탭 상태 전파를 담당. 입력/출력 계약을 함께 명시
 * 처리 규칙: dataObj/dataKey가 주어지면 controlled 모드로 동작하고, 없으면 내부 state를 사용한다.
 * 부작용: 탭 변경 시 setBoundValue/fireValueHandlers를 통해 외부 바인딩/콜백이 호출될 수 있다.
 * @param {Object} props
 * @returns {JSX.Element}
 * @updated 2026-02-28
 */
const Tab = ({
    dataObj,
    dataKey,
    tabIndex,
    onChange,
    onValueChange,
    variant = 'segmented',
    className = '',
    children
}) => {

    // controlled/uncontrolled 처리
    const isBound = dataObj && typeof dataKey !== 'undefined' && dataKey !== null;
    const isTabIndexControlled = !isBound && typeof tabIndex === 'number';
    const [internalTab, setInternalTab] = useState(typeof tabIndex === 'number' ? tabIndex : 0);
    const boundValue = isBound ? getBoundValue(dataObj, dataKey) : undefined;

    // children이 없거나 배열이 아닐 경우 처리
    const tabIdPrefix = useId();
    const tabItemList = Children.toArray(children).filter(Boolean);
    const isUnderlineVariant = variant === 'underline';
    const tabButtonRefList = useRef([]);
    const maximumTabIndex = Math.max(0, tabItemList.length - 1);
    const requestedTab = isBound
        ? (typeof boundValue === 'number' ? boundValue : 0)
        : (isTabIndexControlled ? tabIndex : internalTab);
    const currentTab = Math.max(0, Math.min(requestedTab, maximumTabIndex));

    /**
     * @description 탭 인덱스를 변경하고 dataObj/콜백으로 변경 이벤트를 전파
     * @param {number} index
     * @param {React.MouseEvent<HTMLButtonElement> | undefined} event
     * @returns {void}
     * @updated 2026-02-27
     */
    const handleTabChange = (index, event) => {
        if (isBound) {
            setBoundValue(dataObj, dataKey, index, { source: 'user' });
        } else if (!isTabIndexControlled) {
            setInternalTab(index);
        }
        const bindingCtx = buildCtx({ dataKey, dataObj, source: 'user', dirty: true, valid: null });
        const emittedEvent = event ?? {
            type: 'tabchange',
            target: { value: index },
            preventDefault() {},
            stopPropagation() {},
        };
        if (event) {
            event.target.value = index;
        }
        try {
            Object.defineProperty(emittedEvent, 'detail', {
                value: { value: index, ctx: bindingCtx },
                configurable: true,
                writable: true,
            });
        } catch {
            // 한글설명: 일부 합성 이벤트는 detail 재정의를 허용하지 않아 공통 핸들러 fallback에 맡긴다.
        }
        fireValueHandlers({
            onChange,
            onValueChange,
            value: index,
            ctx: bindingCtx,
            event: emittedEvent,
        });
    };

    /**
     * @description 탭 목록의 표준 방향키 탐색과 활성화를 함께 처리
     * 처리 규칙: 좌우 방향키는 순환하고 Home/End는 처음/마지막 탭으로 이동한다.
     * @param {React.KeyboardEvent<HTMLButtonElement>} event
     * @param {number} index
     * @returns {void}
     */
    const handleTabKeyDown = (event, index) => {
        if (tabItemList.length === 0) return;

        let nextIndex = null;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabItemList.length;
        else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabItemList.length) % tabItemList.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = tabItemList.length - 1;

        if (nextIndex == null) return;
        event.preventDefault();
        handleTabChange(nextIndex, event);
        tabButtonRefList.current[nextIndex]?.focus();
    };

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <div
                className={isUnderlineVariant
                    ? 'flex max-w-full gap-6 overflow-x-auto border-b border-slate-200'
                    : 'inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-lg bg-slate-100/80 p-1 ring-1 ring-slate-200/80'}
                role="tablist"
                data-variant={isUnderlineVariant ? 'underline' : 'segmented'}
            >
                {tabItemList.map((tabItemObj, index) => {
                    const isActive = currentTab === index;
                    const tabId = `${tabIdPrefix}-tab-${index}`;
                    const panelId = `${tabIdPrefix}-panel-${index}`;
                    return (
                        <button
                            type="button"
                            key={index}
                            ref={(buttonElement) => {
                                tabButtonRefList.current[index] = buttonElement;
                            }}
                            id={tabId}
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={panelId}
                            tabIndex={isActive ? 0 : -1}
                            onClick={(event) => handleTabChange(index, event)}
                            onKeyDown={(event) => handleTabKeyDown(event, index)}
                            className={`
                                ${isUnderlineVariant
                                    ? 'inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
                                    : 'inline-flex min-h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white'}
                                ${isActive && isUnderlineVariant ? 'border-indigo-600 text-indigo-700' : ''}
                                ${isActive && !isUnderlineVariant ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/80' : ''}
                                ${!isActive && isUnderlineVariant ? 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700' : ''}
                                ${!isActive && !isUnderlineVariant ? 'text-slate-600 hover:bg-white/70 hover:text-slate-900' : ''}
                            `}
                        >
                            {tabItemObj.props.title}
                        </button>
                    );
                })}
            </div>


            {tabItemList.length > 0 && <div
                id={`${tabIdPrefix}-panel-${currentTab}`}
                role="tabpanel"
                aria-labelledby={`${tabIdPrefix}-tab-${currentTab}`}
                className={isUnderlineVariant
                    ? 'py-4 text-sm text-slate-700'
                    : 'rounded-xl bg-white p-5 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200/80'}
            >
                {tabItemList[currentTab]}
            </div>}
        </div>
    );
};

Tab.Item = TabItem;

/**
 * @description Tab 컴포넌트 진입점 노출
 * 반환값: 탭 전환과 콘텐츠 분기 UI를 제공하는 Tab 컴포넌트.
 * @returns {React.ComponentType}
 */
export default Tab;
