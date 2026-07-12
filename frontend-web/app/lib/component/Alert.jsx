/**
 * 파일명: Alert.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Alert UI 컴포넌트 구현
 */
import { useEffect, useId, useRef } from 'react';
import Icon from './Icon';
import Button from './Button';
import { acquireOverlayBodyScrollLock } from './overlayBodyScroll';
import { focusOverlay, registerOverlay, releaseOverlay } from './overlayStack';
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko';

/**
 * @description 알림 모달 타입별 아이콘/스타일 렌더링 및 사용자 확인 액션 수신.
 * 처리 규칙: type(info/success/warning/error)에 따라 아이콘과 배경/보더 클래스를 분기한다.
 * 부작용: 확인 버튼 클릭 시 onClick 콜백이 실행될 수 있다.
 * @param {Object} props
 * @returns {JSX.Element}
 * @updated 2026-02-28
 */
const Alert = ({
    title = COMMON_COMPONENT_LANG_KO.alert.title,  // 제목 (옵션)
    text,           // 필수 메시지
    type = 'info',
    onClick        // 확인 버튼 클릭 핸들러
}) => {

    const titleId = useId();
    const descriptionId = useId();
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialogElement = dialogRef.current;
        const releaseBodyScrollLock = acquireOverlayBodyScrollLock();
        const overlayEntry = registerOverlay(dialogElement, document.activeElement);
        focusOverlay(overlayEntry);

        return () => {
            releaseBodyScrollLock();
            releaseOverlay(overlayEntry);
        };
    }, []);

    const handleDialogKeyDown = (event) => {
        if (event.key !== 'Tab') {
            return;
        }

        const focusableElementList = Array.from(dialogRef.current?.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) || []);
        if (focusableElementList.length === 0) {
            event.preventDefault();
            dialogRef.current?.focus();
            return;
        }

        const firstFocusableElement = focusableElementList[0];
        const lastFocusableElement = focusableElementList[focusableElementList.length - 1];
        if (
            focusableElementList.length === 1
            || (event.shiftKey && document.activeElement === firstFocusableElement)
            || (!event.shiftKey && document.activeElement === lastFocusableElement)
        ) {
            event.preventDefault();
            (event.shiftKey ? lastFocusableElement : firstFocusableElement).focus();
        }
    };

    // 타입별 스타일 및 아이콘 설정
    const alertTypeMetaObj = {
        info: {
            icon: 'ri:RiInformationLine',
            iconColor: 'text-zinc-600',
            bgColor: 'bg-zinc-50',
            borderColor: 'border-zinc-200'
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

    const displayText = typeof text === 'string' ? text.replaceAll('\\n', '\n') : text;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/70">
            <div
                ref={dialogRef}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                tabIndex={-1}
                onKeyDown={handleDialogKeyDown}
                className={`
                w-[calc(100vw-32px)] max-w-xl rounded-xl shadow-lg ring-1 ring-zinc-950/5 border ${alertTypeMetaObj[type]?.borderColor || alertTypeMetaObj.info.borderColor}
                ${alertTypeMetaObj[type]?.bgColor || alertTypeMetaObj.info.bgColor} backdrop-blur-sm
                animate-fade-in-up
            `}>
                <div className="p-6">
                    <div className="flex items-start mb-4">
                        <Icon
                            icon={alertTypeMetaObj[type]?.icon || alertTypeMetaObj.info.icon}
                            size="1.5em"
                            className={`mr-3 mt-0.5 ${alertTypeMetaObj[type]?.iconColor || alertTypeMetaObj.info.iconColor}`}
                        />
                        <div className="flex-1">
                            <h3 id={titleId} className="text-lg font-semibold text-gray-900 mb-1">
                                {title}
                            </h3>
                            <p id={descriptionId} className="text-gray-600 whitespace-pre-line break-words max-h-[50vh] overflow-y-auto pr-1">
                                {displayText}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            onClick={onClick}
                            className="min-w-[80px]"
                        >
                            {COMMON_COMPONENT_LANG_KO.alert.confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Alert;
