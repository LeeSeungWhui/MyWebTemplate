/**
 * 파일명: Tab.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Tab UI 컴포넌트 구현
 */
import { useState } from 'react';
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
    className = '',
    children
}) => {

    // controlled/uncontrolled 처리
    const isControlled = dataObj && typeof dataKey !== 'undefined' && dataKey !== null;
    const [internalTab, setInternalTab] = useState(tabIndex || 0);
    const boundValue = isControlled ? getBoundValue(dataObj, dataKey) : undefined;
    let currentTab = internalTab;
    if (isControlled) {
        currentTab = typeof boundValue === 'number' ? boundValue : 0;
    }

    // children이 없거나 배열이 아닐 경우 처리
    const items = Array.isArray(children) ? children : [children].filter(Boolean);

    /**
     * @description 탭 인덱스를 변경하고 dataObj/콜백으로 변경 이벤트를 전파
     * @param {number} index
     * @param {React.MouseEvent<HTMLButtonElement> | undefined} event
     * @returns {void}
     * @updated 2026-02-27
     */
    const handleTabChange = (index, event) => {
        if (isControlled) {
            setBoundValue(dataObj, dataKey, index, { source: 'user' });
        } else {
            setInternalTab(index);
        }
        const ctx = buildCtx({ dataKey, dataObj, source: 'user', dirty: true, valid: null });
        const emittedEvent = event ?? {
            type: 'tabchange',
            target: { value: index },
            preventDefault() {},
            stopPropagation() {},
        };
        if (event) {
            try { event.target.value = index; } catch (_) { /* ignore */ }
        }
        fireValueHandlers({
            onChange,
            onValueChange,
            value: index,
            ctx,
            event: emittedEvent,
        });
    };

    return (
        <div className={`flex flex-col ${className}`}>
            {/* 한글설명: 설명 동작 설명 */}
            <div className="flex border-b border-gray-200">
                {items.map((item, index) => (
                    <button
                        key={index}
                        onClick={(evt) => handleTabChange(index, evt)}
                        className={`
                            px-4 py-2 -mb-px text-sm font-medium inline-flex items-center
                            ${currentTab === index
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                        `}
                    >
                        {item.props.title}
                    </button>
                ))}
            </div>

            {/* 한글설명: 설명 동작 설명 */}
            <div className="py-4">
                {items[currentTab]}
            </div>
        </div>
    );
};

// 한글설명: 설명 동작 설명
Tab.Item = TabItem;

/**
 * @description 를 기본 export
 * @returns {React.ComponentType} Tab 컴포넌트
 */
export default Tab;
