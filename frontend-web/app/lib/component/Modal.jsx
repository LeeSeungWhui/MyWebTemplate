import { forwardRef, useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import React from 'react';

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
    top,
    left,
    className = '',
    children,
    ...props
}, ref) => {
    const modalRef = useRef(null);
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
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
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
        const handleKeyDown = (e) => {
            if (closeOnEsc && e.key === 'Escape') {
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
    const handleMouseDown = (e) => {
        if (!draggable) return;

        const modalElement = modalRef.current;
        if (!modalElement) return;

        // 헤더 영역에서만 드래그 가능하도록
        const isHeader = e.target.closest('.modal-header');
        if (!isHeader) return;

        const rect = modalElement.getBoundingClientRect();
        dragRef.current = {
            isDragging: true,
            startX: e.clientX - rect.left,
            startY: e.clientY - rect.top
        };

        document.body.style.userSelect = 'none';
        setPosition({ x: rect.left, y: rect.top });
    };

    // 드래그 중
    const handleMouseMove = (e) => {
        if (!dragRef.current.isDragging) return;

        const modalElement = modalRef.current;
        if (!modalElement) return;

        const newX = e.clientX - dragRef.current.startX;
        const newY = e.clientY - dragRef.current.startY;

        // 화면 밖으로 나가지 않도록 제한
        const rect = modalElement.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        setPosition({
            x: Math.min(Math.max(0, newX), maxX),
            y: Math.min(Math.max(0, newY), maxY)
        });
    };

    // 드래그 종료
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

    const handleBackdropClick = (e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
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

export default Modal; 