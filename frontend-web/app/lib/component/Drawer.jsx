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

  // ASCII-safe icons to avoid encoding issues in some terminals
  const collapseIcons = { right: '>', left: '<', top: '^', bottom: 'v' };
  // Place button INSIDE the panel at edge center
  const collapsePos = {
    right: 'absolute left-2 top-1/2 -translate-y-1/2',
    left: 'absolute right-2 top-1/2 -translate-y-1/2',
    top: 'absolute bottom-2 left-1/2 -translate-x-1/2',
    bottom: 'absolute top-2 left-1/2 -translate-x-1/2'
  };
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
        className={`absolute bg-white shadow-xl will-change-transform transition-transform duration-300 ${conf.base} ${transformCls} ${sizeCls} ${resizeCls} ${className}`.trim()}
        {...props}
      >
        <div className={contentPad}>
          {children}
        </div>

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

Drawer.displayName = 'Drawer';

export default Drawer;
