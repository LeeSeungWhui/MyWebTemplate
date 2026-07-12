/**
 * 파일명: Confirm.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Confirm UI 컴포넌트 구현
 */
import { useEffect, useId, useRef } from 'react';
import Icon from './Icon';
import Button from './Button';
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko';
import { acquireOverlayBodyScrollLock } from './overlayBodyScroll';
import { focusOverlay, registerOverlay, releaseOverlay } from './overlayStack';

/**
 * @description 확인/취소 액션이 필요한 시나리오를 위한 이중 버튼 확인 모달 컴포넌트.
 * 처리 규칙: type(info/warning/danger)에 따라 아이콘/색상 테마를 바꿔 위험도를 시각화한다.
 * 부작용: 확인/취소 클릭 시 onConfirm/onCancel 콜백이 실행될 수 있다.
 * @param {Object} props
 * @returns {JSX.Element}
 * @updated 2026-02-28
 */
const Confirm = ({
    title = COMMON_COMPONENT_LANG_KO.confirm.title,
    text,
    type = 'info',
    onConfirm,
    onCancel,
    confirmText = COMMON_COMPONENT_LANG_KO.confirm.confirmText,
    cancelText = COMMON_COMPONENT_LANG_KO.confirm.cancelText
}) => {

    const titleId = useId();
    const descriptionId = useId();
    const dialogRef = useRef(null);
    const focusTimerRef = useRef(null);
    const focusableSelector =
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const displayText = typeof text === 'string' ? text.replaceAll('\\n', '\n') : text;
    const confirmTypeMetaObj = {
        info: {
            icon: 'ri:RiQuestionLine',
            iconColor: 'text-zinc-600',
            bgColor: 'bg-zinc-50',
            borderColor: 'border-zinc-200'
        },
        warning: {
            icon: 'ri:RiErrorWarningLine',
            iconColor: 'text-yellow-500',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200'
        },
        danger: {
            icon: 'ri:RiAlertLine',
            iconColor: 'text-red-500',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200'
        }
    };

    useEffect(() => {
        const releaseBodyScrollLock = acquireOverlayBodyScrollLock();
        const overlayEntry = registerOverlay(dialogRef.current, document.activeElement);
        focusTimerRef.current = setTimeout(() => {
            focusOverlay(overlayEntry);
        }, 0);

        return () => {
            clearTimeout(focusTimerRef.current);
            focusTimerRef.current = null;
            releaseBodyScrollLock();
            releaseOverlay(overlayEntry);
        };
    }, []);

    const handleDialogKeyDown = (keyboardEvent) => {
        if (keyboardEvent.key !== 'Tab' || !dialogRef.current) return;
        const focusables = Array.from(dialogRef.current.querySelectorAll(focusableSelector));
        if (!focusables.length) {
            keyboardEvent.preventDefault();
            try { dialogRef.current.focus(); } catch {}
            return;
        }
        const firstFocusable = focusables[0];
        const lastFocusable = focusables[focusables.length - 1];
        if (keyboardEvent.shiftKey && (document.activeElement === firstFocusable || document.activeElement === dialogRef.current)) {
            keyboardEvent.preventDefault();
            try { lastFocusable.focus(); } catch {}
            return;
        }
        if (!keyboardEvent.shiftKey && document.activeElement === lastFocusable) {
            keyboardEvent.preventDefault();
            try { firstFocusable.focus(); } catch {}
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/70">
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                tabIndex={-1}
                onKeyDown={handleDialogKeyDown}
                className={`
                w-[calc(100vw-32px)] max-w-md rounded-xl shadow-lg ring-1 ring-zinc-950/5 border ${confirmTypeMetaObj[type]?.borderColor || confirmTypeMetaObj.info.borderColor}
                ${confirmTypeMetaObj[type]?.bgColor || confirmTypeMetaObj.info.bgColor} backdrop-blur-sm
                animate-fade-in-up
            `}>
                <div className="p-6">
                    <div className="flex items-start mb-4">
                        <Icon
                            icon={confirmTypeMetaObj[type]?.icon || confirmTypeMetaObj.info.icon}
                            size="1.5em"
                            className={`mr-3 mt-0.5 ${confirmTypeMetaObj[type]?.iconColor || confirmTypeMetaObj.info.iconColor}`}
                        />
                        <div className="flex-1">
                            <h3 id={titleId} className="text-lg font-semibold text-gray-900 mb-1">
                                {title}
                            </h3>
                            <p id={descriptionId} className="text-gray-600 whitespace-pre-line">
                                {displayText}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            className="min-w-[80px]"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className="min-w-[80px]"
                            variant={type === 'danger' ? 'danger' : 'primary'}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Confirm;
