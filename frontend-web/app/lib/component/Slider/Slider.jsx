/**
 * 파일명: Slider.jsx
 * 작성자: ChatGPT
 * 갱신일: 2025-02-14
 * 설명: 화면 측면에서 슬라이드 인/아웃 되는 패널 컴포넌트
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

/**
 * 슬라이더 본체
 * 갱신일: 2025-02-14
 */
const Slider = forwardRef(({ isOpen = false, onClose, side = 'right', size, closeOnBackdrop = true, closeOnEsc = true, resizable = false, collapseButton = false, className = '', children, ...props }, ref) => {
  const rootRef = useRef(null);
  const [visible, setVisible] = useState(isOpen);
  const [exiting, setExiting] = useState(false);
  const [entering, setEntering] = useState(false);
  const conf = sides[side] || sides.right;

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setExiting(false);
      setEntering(true);
      requestAnimationFrame(() => setEntering(false));
    } else if (visible) {
      setExiting(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setExiting(false);
      }, 300);
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
  const resizeCls = resizable ? (side === 'top' || side === 'bottom' ? 'resize-y overflow-auto' : 'resize-x overflow-auto') : '';
  const transformCls = exiting || entering ? conf.transform.closed : conf.transform.open;

  const collapseIcons = { right: '▶', left: '◀', top: '▲', bottom: '▼' };
  const collapsePos = {
    right: 'absolute top-2 -left-8',
    left: 'absolute top-2 -right-8',
    top: 'absolute -bottom-8 left-2',
    bottom: 'absolute -top-8 left-2'
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={(e) => { if (closeOnBackdrop && e.target === e.currentTarget) onClose?.(); }}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${exiting ? 'opacity-0' : 'opacity-100'}`} />
      <div
        ref={(el) => { rootRef.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; }}
        className={`absolute bg-white shadow-xl transition-transform duration-300 ${conf.base} ${transformCls} ${sizeCls} ${resizeCls} ${className}`.trim()}
        {...props}
      >
        {collapseButton && (
          <button
            type="button"
            aria-label="collapse"
            className={`bg-white border rounded-full w-6 h-6 flex items-center justify-center shadow ${collapsePos[side]}`}
            onClick={() => onClose?.()}
          >
            {collapseIcons[side]}
          </button>
        )}
        {children}
      </div>
    </div>
  );
});

Slider.displayName = 'Slider';

export default Slider;

