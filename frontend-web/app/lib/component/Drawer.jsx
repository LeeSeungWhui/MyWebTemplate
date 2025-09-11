/**
 * Drawer.jsx
 * Side-mounted sliding panel component (Tailwind only)
 */
import { forwardRef, useEffect, useRef, useState } from 'react';

const sides = {
  right: {
    base: 'inset-y-0 right-0 w-80 max-w-full rounded-l-lg',
    transform: { open: 'translate-x-0', closed: 'translate-x-full' }
  },
  left: {
    base: 'inset-y-0 left-0 w-80 max-w-full rounded-r-lg',
    transform: { open: 'translate-x-0', closed: '-translate-x-full' }
  },
  top: {
    base: 'inset-x-0 top-0 h-72 max-h-full rounded-b-lg',
    transform: { open: 'translate-y-0', closed: '-translate-y-full' }
  },
  bottom: {
    base: 'inset-x-0 bottom-0 h-72 max-h-full rounded-t-lg',
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
){
  const rootRef = useRef(null);
  const [visible, setVisible] = useState(isOpen);
  const [exiting, setExiting] = useState(false);
  const [entering, setEntering] = useState(false);

  const conf = sides[side] || sides.right;

  // Open/close visibility + enter/exit transitions
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setExiting(false);
      setEntering(true);
      const id = requestAnimationFrame(() => setEntering(false));
      return () => cancelAnimationFrame(id);
    }
    if (visible) {
      setExiting(true);
      const t = setTimeout(() => {
        setVisible(false);
        setExiting(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, visible]);

  // ESC to close + lock body scroll while visible
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => {
      if (closeOnEsc && e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [visible, closeOnEsc, onClose]);

  if (!visible) return null;

  const sizeCls = size ? String(size) : '';
  const resizeCls = resizable
    ? (side === 'top' || side === 'bottom' ? 'resize-y overflow-auto' : 'resize-x overflow-auto')
    : '';
  const transformCls = (exiting || entering) ? conf.transform.closed : conf.transform.open;

  // Emphasize the corner where the handle lives
  const cornerBoost = collapseButton
    ? (side === 'right'
        ? 'rounded-l-2xl'
        : side === 'left'
          ? 'rounded-r-2xl'
          : side === 'top'
            ? 'rounded-b-2xl'
            : 'rounded-t-2xl')
    : '';

  // Handle placement at edge center (inside panel)
  const handlePos = {
    right: 'absolute left-1 top-1/2 -translate-y-1/2',
    left: 'absolute right-1 top-1/2 -translate-y-1/2',
    top: 'absolute bottom-1 left-1/2 -translate-x-1/2',
    bottom: 'absolute top-1 left-1/2 -translate-x-1/2'
  };
  // Handle sizing/shape per side (tab-like)
  const handleShape = {
    right: 'h-16 w-7 rounded-r-lg border-l',
    left: 'h-16 w-7 rounded-l-lg border-r',
    top: 'w-16 h-7 rounded-b-lg border-t',
    bottom: 'w-16 h-7 rounded-t-lg border-b'
  };
  const handleBase = 'bg-gray-100/90 hover:bg-gray-200 text-gray-500 border-gray-200 shadow-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500/30';
  const arrowRotate = { right: '', left: 'rotate-180', top: '-rotate-90', bottom: 'rotate-90' };
  // Add edge padding so the button does not overlap content
  const contentPad = collapseButton
    ? (side === 'right'
        ? 'pl-10'
        : side === 'left'
          ? 'pr-10'
          : side === 'top'
            ? 'pb-10'
            : 'pt-10')
    : '';

  const assignRef = (el) => {
    rootRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${exiting ? 'opacity-0' : 'opacity-100'}`}
        onClick={() => { if (closeOnBackdrop) onClose?.(); }}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={assignRef}
        className={`absolute bg-white shadow-xl will-change-transform transition-transform duration-300 ${conf.base} ${cornerBoost} ${transformCls} ${sizeCls} ${resizeCls} ${className}`.trim()}
        {...props}
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
            {/* inline SVG arrow to avoid encoding issues */}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={arrowRotate[side]} aria-hidden>
              <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
});

Drawer.displayName = 'Drawer';

export default Drawer;
