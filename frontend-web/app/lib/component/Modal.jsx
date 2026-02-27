/**
 * 파일명: Modal.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Modal UI 컴포넌트 구현
 */
import { forwardRef, useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import React from 'react';

/**
 * @description Header 컴포넌트를 렌더링한다.
 * 처리 규칙: onClose가 있으면 우측 닫기 버튼을 노출하고 draggable이면 헤더에 drag 커서를 적용한다.
 * @updated 2026-02-27
 */
const Header = ({ className = '', children, onClose, draggable = false, ...props }) => {

    return (
        <div
            className={`
                modal-header
                px-6 py-4
                border-b border-gray-200
                ${draggable ? 'cursor-move' : ''}
                ${className}
            `.trim()}
            {...props}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    {children}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 ml-4 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Icon icon="ri:RiCloseLine" size="1.5em" />
                    </button>
                )}
            </div>
        </div>
    );
};

/**
 * @description Body 컴포넌트를 렌더링한다.
 * 반환값: 스크롤 가능한 본문 컨테이너 JSX.
 * @updated 2026-02-27
 */
const Body = ({ className = '', children, ...props }) => {

    return (
        <div
            className={`
                px-6 py-4
                overflow-y-auto
                ${className}
            `.trim()}
            {...props}
        >
            {children}
        </div>
    );
};

/**
 * @description Footer 컴포넌트를 렌더링한다.
 * 반환값: 액션 버튼 영역을 감싸는 하단 컨테이너 JSX.
 * @updated 2026-02-27
 */
const Footer = ({ className = '', children, ...props }) => {

    return (
        <div
            className={`
                px-6 py-4
                border-t border-gray-200
                ${className}
            `.trim()}
            {...props}
        >
            {children}
        </div>
    );
};

const Modal = forwardRef(({
    isOpen = false,
    onClose,
    size = 'md',
    draggable = false,
    closeOnBackdrop = true,
    closeOnEsc = true,
    ariaLabel,
    ariaLabelledBy,
    top,
    left,
    className = '',
    children,
    ...props
}, ref) => {
    const modalRef = useRef(null);
    const lastFocusedRef = useRef(null);
    const dragRef = useRef({ isDragging: false, startX: 0, startY: 0 });
    const [position, setPosition] = useState(null);

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4'
    };

    // 스크롤 잠금 관리
    useEffect(() => {
        if (isOpen) {
            try { lastFocusedRef.current = document.activeElement; } catch {}
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                if (!modalRef.current) return;
                const focusables = modalRef.current.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
                if (focusables.length) { try { focusables[0].focus(); } catch {} }
            }, 0);
        }
        return () => {
            document.body.style.overflow = '';
            if (lastFocusedRef.current && typeof lastFocusedRef.current.focus === 'function') {
                try { lastFocusedRef.current.focus(); } catch {}
            }
        };
    }, [isOpen]);

    // 모달이 닫힐 때 position 초기화
    useEffect(() => {
        if (!isOpen) {
            setPosition(null);
        }
    }, [isOpen]);

    // ESC 키 이벤트 처리
    useEffect(() => {

    /**
     * @description ESC 키 입력으로 모달을 닫고 드래그 위치를 초기화한다.
     * 처리 규칙: closeOnEsc=true 이고 key가 Escape일 때만 동작한다.
     * @updated 2026-02-27
     */
    const handleKeyDown = (keyboardEvent) => {
            if (closeOnEsc && keyboardEvent.key === 'Escape') {
                onClose?.();
                setPosition(null);  // ESC로 닫을 때도 position 초기화
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, closeOnEsc, onClose]);

    // 드래그 시작

    /**
     * @description 헤더 영역 마우스 다운에서 드래그 시작 좌표를 기록한다.
     * 처리 규칙: draggable=true 이고 target이 `.modal-header`일 때만 dragging 상태로 전환한다.
     * @updated 2026-02-27
     */
    const handleMouseDown = (event) => {
        if (!draggable) return;
        if (!modalRef.current) return;

        // 헤더 영역에서만 드래그 가능하도록
        const isHeader = event.target.closest('.modal-header');
        if (!isHeader) return;

        const rect = modalRef.current.getBoundingClientRect();
        dragRef.current = {
            isDragging: true,
            startX: event.clientX - rect.left,
            startY: event.clientY - rect.top
        };

        document.body.style.userSelect = 'none';
        setPosition({ x: rect.left, y: rect.top });
    };

    // 드래그 중

    /**
     * @description 드래그 중인 모달 위치를 마우스 좌표에 맞춰 업데이트한다.
     * 처리 규칙: 화면 경계(0~viewport-size) 안으로 x/y를 clamp 한다.
     * @updated 2026-02-27
     */
    const handleMouseMove = (event) => {
        if (!dragRef.current.isDragging) return;
        if (!modalRef.current) return;

        const newX = event.clientX - dragRef.current.startX;
        const newY = event.clientY - dragRef.current.startY;

        // 화면 밖으로 나가지 않도록 제한
        const rect = modalRef.current.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        setPosition({
            x: Math.min(Math.max(0, newX), maxX),
            y: Math.min(Math.max(0, newY), maxY)
        });
    };

    // 드래그 종료

    /**
     * @description 드래그 상태를 종료하고 텍스트 선택 잠금을 해제한다.
     * 부작용: dragRef.current.isDragging=false, body.userSelect=''로 복구한다.
     * @updated 2026-02-27
     */
    const handleMouseUp = () => {
        dragRef.current.isDragging = false;
        document.body.style.userSelect = '';
    };

    // 드래그 이벤트 리스너
    useEffect(() => {
        if (draggable) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [draggable]);

    /**
     * @description 백드롭 직접 클릭 시 모달을 닫고 위치 상태를 초기화한다.
     * 처리 규칙: closeOnBackdrop=true 이고 event.target===event.currentTarget 조건에서만 닫는다.
     * @updated 2026-02-27
     */
    const handleBackdropClick = (event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
            onClose?.();
            setPosition(null);  // 백드롭 클릭으로 닫을 때도 position 초기화
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/70"
            onClick={handleBackdropClick}
        >
            <div
                ref={(el) => {
                    modalRef.current = el;
                    if (typeof ref === 'function') ref(el);
                    else if (ref) ref.current = el;
                }}
                style={{
                    position: 'absolute',
                    ...(!position ? {
                        top: top || '50%',
                        left: left || '50%',
                        transform: top || left ? undefined : 'translate(-50%, -50%)'
                    } : {
                        top: `${position.y}px`,
                        left: `${position.x}px`
                    }),
                    transition: dragRef.current.isDragging ? 'none' : 'all 0.2s'
                }}
                className={`
                    relative w-full ${sizes[size]}
                    bg-white rounded-lg shadow-xl
                    animate-fade-in-up
                    ${className}
                `.trim()}
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
                onMouseDown={handleMouseDown}
                {...props}
            >
                {React.Children.map(children, child => {
                    if (child?.type === Header) {
                        return React.cloneElement(child, { draggable });
                    }
                    return child;
                })}
            </div>
        </div>
    );
});

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;
Modal.displayName = 'Modal';

/**
 * @description 헤더/본문/푸터 슬롯을 제공하는 공통 Modal 컴포넌트를 외부에 노출한다.
 * 반환값: Modal 컴포넌트 export.
 */
export default Modal; 
