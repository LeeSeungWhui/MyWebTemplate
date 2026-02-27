/**
 * 파일명: Drawer.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Drawer UI 컴포넌트 구현
 */
/**
 * Drawer.jsx
 * 한글설명: Side-mounted sliding panel component (Tailwind only)
 */
import { forwardRef, useEffect } from 'react';

const sides = {
  right: {
    base: 'inset-y-0 right-0 w-80 max-w-full rounded-l-2xl',
    transform: { open: 'translate-x-0', closed: 'translate-x-full' }
  },
  left: {
    base: 'inset-y-0 left-0 w-80 max-w-full rounded-r-2xl',
    transform: { open: 'translate-x-0', closed: '-translate-x-full' }
  },
  top: {
    base: 'inset-x-0 top-0 h-72 max-h-full rounded-b-2xl',
    transform: { open: 'translate-y-0', closed: '-translate-y-full' }
  },
  bottom: {
    base: 'inset-x-0 bottom-0 h-72 max-h-full rounded-t-2xl',
    transform: { open: 'translate-y-0', closed: 'translate-y-full' }
  }
};

const Drawer = forwardRef(function Drawer(
  {
    isOpen = false,
    onClose,
    side = 'right',
    size,
    closeOnBackdrop = true,
    closeOnEsc = true,
    resizable = false,
    collapseButton = false,
    className = '',
    children,
    ...props
  },
  ref
) {
  const conf = sides[side] || sides.right;

  // 한글설명: ESC to close + lock body scroll while visible
  useEffect(() => {
    if (!isOpen) return undefined;

    /**
     * @description Esc 입력을 감지해 closeOnEsc 옵션이 켜진 경우 패널을 닫힘 상태로 전환한다.
     * @param {KeyboardEvent} keyboardEvent
     * @returns {void}
     * @updated 2026-02-27
     */
    const onKey = (keyboardEvent) => {
      if (closeOnEsc && keyboardEvent.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, closeOnEsc, onClose]);

  // 한글설명: size: number or numeric string -> px width/height depending on side
  // 한글설명: non-numeric string -> treated as className (tailwind etc.)
  let numericSize = null;
  let sizeCls = '';
  if (size != null) {
    if (typeof size === 'number') {
      numericSize = size;
    } else if (typeof size === 'string') {
      const trimmedSize = size.trim();
      const pxSuffix = trimmedSize.endsWith('px');
      const numericText = pxSuffix ? trimmedSize.slice(0, -2) : trimmedSize;
      const numericCandidate = Number(numericText);
      if (numericText && !Number.isNaN(numericCandidate)) {
        numericSize = numericCandidate;
      } else {
        sizeCls = size; // 한글설명: assume classes like 'w-96' or 'h-80'
      }
    }
  }
  let resizeCls = '';
  if (resizable) {
    if (side === 'top' || side === 'bottom') resizeCls = 'resize-y overflow-auto';
    else resizeCls = 'resize-x overflow-auto';
  }
  const transformCls = isOpen ? conf.transform.open : conf.transform.closed;

  // 한글설명: Emphasize the corner where the handle lives
  let cornerBoost = '';
  if (collapseButton) {
    if (side === 'right') cornerBoost = 'rounded-l-2xl';
    else if (side === 'left') cornerBoost = 'rounded-r-2xl';
    else if (side === 'top') cornerBoost = 'rounded-b-2xl';
    else cornerBoost = 'rounded-t-2xl';
  }

  // 한글설명: Handle placement at edge center (inside panel)
  const handlePos = {
    right: 'absolute left-1 top-1/2 -translate-y-1/2',
    left: 'absolute right-1 top-1/2 -translate-y-1/2',
    top: 'absolute bottom-1 left-1/2 -translate-x-1/2',
    bottom: 'absolute top-1 left-1/2 -translate-x-1/2'
  };
  // 한글설명: Handle sizing/shape per side (tab-like)
  const handleShape = {
    right: 'h-16 w-7 rounded-r-lg border-l',
    left: 'h-16 w-7 rounded-l-lg border-r',
    top: 'w-16 h-7 rounded-b-lg border-t',
    bottom: 'w-16 h-7 rounded-t-lg border-b'
  };
  const handleBase = 'bg-gray-100/90 hover:bg-gray-200 text-gray-500 border-gray-200 shadow-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/30';
  const arrowRotate = { right: '', left: 'rotate-180', top: '-rotate-90', bottom: 'rotate-90' };
  // 한글설명: Add edge padding so the button does not overlap content
  let contentPad = '';
  if (collapseButton) {
    if (side === 'right') contentPad = 'pl-10';
    else if (side === 'left') contentPad = 'pr-10';
    else if (side === 'top') contentPad = 'pb-10';
    else contentPad = 'pt-10';
  }

  /**
   * @description forwardRef가 함수형/객체형인 경우를 모두 지원해 패널 DOM 참조를 전달한다.
   * @param {HTMLElement | null} el
   * @returns {void}
   * @updated 2026-02-27
   */
  const assignRef = (el) => {
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => { if (closeOnBackdrop) onClose?.(); }}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={assignRef}
        className={`absolute bg-white shadow-xl transform-gpu will-change-transform transition-transform duration-300 ease-in-out ${conf.base} ${cornerBoost} ${transformCls} ${sizeCls} ${resizeCls} ${className}`.trim()}
        {...(() => {
          const { style: userStyle, ...rest } = props || {};
          const dim = (numericSize != null)
            ? (side === 'left' || side === 'right'
                ? { width: `${numericSize}px` }
                : { height: `${numericSize}px` })
            : {};
          return { ...rest, style: { ...dim, ...(userStyle || {}) } };
        })()}
      >
        <div className={contentPad}>
          {children}
        </div>

        {collapseButton && (
          <button
            type="button"
            aria-label="collapse"
            className={`${handleBase} ${handleShape[side]} ${handlePos[side]} z-10`}
            onClick={() => onClose?.()}
          >
            {/* 한글설명: inline SVG arrow to avoid encoding issues */}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={arrowRotate[side]} aria-hidden>
              <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
});

Drawer.displayName = 'Drawer';

/**
 * @description Drawer 컴포넌트를 기본 export한다.
 * @returns {React.ComponentType} Drawer 컴포넌트
 */
export default Drawer;
