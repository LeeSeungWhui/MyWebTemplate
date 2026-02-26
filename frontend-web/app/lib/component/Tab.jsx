/**
 * 파일명: Tab.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Tab UI 컴포넌트 구현
 */
import { useState } from 'react';
import { getBoundValue, setBoundValue, buildCtx, fireValueHandlers } from '../binding';

const TabItem = ({ title, children }) => {
    return children;
};

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
            {/* Tab Headers */}
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

            {/* Tab Content */}
            <div className="py-4">
                {items[currentTab]}
            </div>
        </div>
    );
};

// TabItem을 Tab의 static property로 추가
Tab.Item = TabItem;

/**
 * @description Tab export를 노출한다.
 */
export default Tab;
