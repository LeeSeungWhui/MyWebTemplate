import { forwardRef, useEffect, useRef } from 'react';

const sides = {
  right: { base: 'inset-y-0 right-0 w-80 max-w-full', enter: 'translate-x-0', from: 'translate-x-full' },
  left: { base: 'inset-y-0 left-0 w-80 max-w-full', enter: 'translate-x-0', from: '-translate-x-full' },
  top: { base: 'inset-x-0 top-0 h-72 max-h-full', enter: 'translate-y-0', from: '-translate-y-full' },
  bottom: { base: 'inset-x-0 bottom-0 h-72 max-h-full', enter: 'translate-y-0', from: 'translate-y-full' },
};

const Drawer = forwardRef(({ isOpen = false, onClose, side = 'right', size, closeOnBackdrop = true, closeOnEsc = true, className = '', children, ...props }, ref) => {
  const rootRef = useRef(null);
  const conf = sides[side] || sides.right;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (closeOnEsc && e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  const sizeCls = size ? size : conf.base.includes('w-') ? '' : '';

  return (
    <div className="fixed inset-0 z-50" onClick={(e) => { if (closeOnBackdrop && e.target === e.currentTarget) onClose?.(); }}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        ref={(el) => { rootRef.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }}
        className={`absolute bg-white shadow-xl ${conf.base} transform transition-transform duration-200 ${conf.enter} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});

Drawer.displayName = 'Drawer';

export default Drawer;

