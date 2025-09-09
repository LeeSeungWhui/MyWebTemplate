import { forwardRef, useEffect, useRef, useState } from 'react';
import styles from './Slider.module.css';

const sides = {
  right: {
    base: 'inset-y-0 right-0 w-80 max-w-full',
    animations: { in: styles.slideInRight, out: styles.slideOutRight }
  },
  left: {
    base: 'inset-y-0 left-0 w-80 max-w-full',
    animations: { in: styles.slideInLeft, out: styles.slideOutLeft }
  },
  top: {
    base: 'inset-x-0 top-0 h-72 max-h-full',
    animations: { in: styles.slideInTop, out: styles.slideOutTop }
  },
  bottom: {
    base: 'inset-x-0 bottom-0 h-72 max-h-full',
    animations: { in: styles.slideInBottom, out: styles.slideOutBottom }
  }
};

const Slider = forwardRef(({ isOpen = false, onClose, side = 'right', size, closeOnBackdrop = true, closeOnEsc = true, className = '', children, ...props }, ref) => {
  const rootRef = useRef(null);
  const [visible, setVisible] = useState(isOpen);
  const [exiting, setExiting] = useState(false);
  const conf = sides[side] || sides.right;

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setExiting(false);
    } else if (visible) {
      setExiting(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setExiting(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, visible]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => { if (closeOnEsc && e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [visible, closeOnEsc, onClose]);

  if (!visible) return null;

  const sizeCls = size ? size : '';

  return (
    <div className="fixed inset-0 z-50" onClick={(e) => { if (closeOnBackdrop && e.target === e.currentTarget) onClose?.(); }}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        ref={(el) => { rootRef.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }}
        className={`absolute bg-white shadow-xl ${conf.base} ${exiting ? conf.animations.out : conf.animations.in} ${sizeCls} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    </div>
  );
});

Slider.displayName = 'Slider';

export default Slider;
