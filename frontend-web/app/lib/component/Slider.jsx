/**
 * Slider.jsx
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

const Slider = forwardRef(function Slider(
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

  // ASCII-safe icons to avoid encoding issues in some terminals
  const collapseIcons = { right: '>', left: '<', top: '^', bottom: 'v' };
  // Place button inside the panel to avoid overflow clipping
  const collapsePos = {
    right: 'absolute top-2 left-2',
    left: 'absolute top-2 right-2',
    top: 'absolute bottom-2 left-2',
    bottom: 'absolute top-2 left-2'
  };

  const assignRef = (el) => {
    rootRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
      }}
    >
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${exiting ? 'opacity-0' : 'opacity-100'}`} />

      {/* Panel */}
      <div
        ref={assignRef}
        className={`absolute bg-white shadow-xl will-change-transform transition-transform duration-300 ${conf.base} ${transformCls} ${sizeCls} ${resizeCls} ${className}`.trim()}
        {...props}
      >
        {children}

        {collapseButton && (
          <button
            type="button"
            aria-label="collapse"
            className={`bg-white border rounded-full w-6 h-6 flex items-center justify-center shadow z-10 ${collapsePos[side]}`}
            onClick={() => onClose?.()}
          >
            {collapseIcons[side]}
          </button>
        )}
      </div>
    </div>
  );
});

Slider.displayName = 'Slider';

export default Slider;

