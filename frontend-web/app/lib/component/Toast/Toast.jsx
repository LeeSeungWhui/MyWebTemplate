/**
 * 파일명: Toast.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Toast UI 컴포넌트 구현
 */
import { forwardRef, useEffect } from 'react';
import Icon from '../Icon';
import styles from './Toast.module.css';

const Toast = forwardRef(({
    message,
    type = 'info',  // info, success, warning, error
    position = 'bottom-center',  // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
    isExiting = false,
    onClose,
    className = '',
    ...props
}, ref) => {
    const types = {
        info: {
            icon: 'ri:RiInformationLine',
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        success: {
            icon: 'ri:RiCheckboxCircleLine',
            iconColor: 'text-green-500',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        },
        warning: {
            icon: 'ri:RiErrorWarningLine',
            iconColor: 'text-yellow-500',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200'
        },
        error: {
            icon: 'ri:RiCloseCircleLine',
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200'
        }
    };

    const positions = {
        'top-left': 'top-4 left-4',
        'top-center': 'top-4 left-1/2 -translate-x-1/2',
        'top-right': 'top-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
        'bottom-right': 'bottom-4 right-4'
    };

    const currentType = types[type];
    const currentPosition = positions[position];

    // 위치에 따른 슬라이드 방향 결정
    const isTopPosition = position.startsWith('top-');
    const slideInAnimation = isTopPosition ? styles.slideDown : styles.slideUp;
    const slideOutAnimation = isTopPosition ? styles.slideUpExit : styles.slideDownExit;

    const handleClose = () => {
        onClose?.();
    };

    useEffect(() => {
        if (onClose) {
            const closeButton = document.querySelector(`[data-toast-close="${message}"]`);
            if (closeButton) {
                closeButton.addEventListener('click', handleClose);
                return () => closeButton.removeEventListener('click', handleClose);
            }
        }
    }, [onClose, message]);

    return (
        <div
            ref={ref}
            className={`
                fixed z-50 
                ${currentPosition}
                flex items-center
                min-w-[320px] max-w-[420px]
                px-4 py-3
                rounded-lg shadow-lg
                border ${currentType.borderColor}
                ${currentType.bgColor}
                backdrop-blur-sm
                ${isExiting ? slideOutAnimation : slideInAnimation}
                ${className}
            `.trim()}
            role="alert"
            {...props}
        >
            <Icon
                icon={currentType.icon}
                size="1.25em"
                className={`mr-3 ${currentType.iconColor} flex-shrink-0`}
            />
            <div className="flex-1 text-sm text-gray-600">
                {message}
            </div>
            {onClose && (
                <button
                    data-toast-close={message}
                    className="ml-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-1"
                >
                    <Icon icon="ri:RiCloseLine" size="1.25em" />
                </button>
            )}
        </div>
    );
});

Toast.displayName = 'Toast';

export default Toast; 