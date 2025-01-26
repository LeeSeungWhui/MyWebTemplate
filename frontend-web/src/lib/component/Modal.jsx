import { forwardRef, useEffect } from 'react';
import Icon from './Icon';

const Header = ({ className = '', children, onClose, ...props }) => {
    return (
        <div
            className={`
                px-6 py-4
                border-b border-gray-200
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
    className = '',
    children,
    ...props
}, ref) => {
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

    // ESC 키 이벤트 처리
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (closeOnEsc && e.key === 'Escape') {
                onClose?.();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, closeOnEsc, onClose]);

    const handleBackdropClick = (e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose?.();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/70"
            onClick={handleBackdropClick}
        >
            <div
                ref={ref}
                className={`
                    relative w-full ${sizes[size]}
                    bg-white rounded-lg shadow-xl
                    animate-fade-in-up
                    ${draggable ? 'cursor-move' : ''}
                    ${className}
                `.trim()}
                {...props}
            >
                {children}
            </div>
        </div>
    );
});

Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;
Modal.displayName = 'Modal';

export default Modal; 