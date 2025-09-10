/**
 * 파일명: Tooltip.jsx
 * 작성자: ChatGPT
 * 갱신일: 2025-02-14
 * 설명: hover/click에 반응하는 툴팁 컴포넌트
 */
import { forwardRef, useEffect, useId, useRef, useState } from 'react';

const placements = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

/**
 * 툴팁 본체
 * 갱신일: 2025-02-14
 */
const Tooltip = forwardRef(({ content, placement = 'top', delay = 150, disabled = false, trigger = 'hover', className = '', children, orientation = 'horizontal' }, ref) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const timer = useRef(null);
  const rootRef = useRef(null);

  const show = () => {
    if (disabled) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const clickToggle = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  return (
    <span
      ref={rootRef}
      className={`relative inline-flex ${className}`.trim()}
      onMouseEnter={trigger === 'hover' ? show : undefined}
      onMouseLeave={trigger === 'hover' ? hide : undefined}
      onFocus={show}
      onBlur={hide}
      onClick={trigger === 'click' ? clickToggle : undefined}
    >
      {children && (
        <span ref={ref} aria-describedby={open ? id : undefined}>
          {children}
        </span>
      )}
      {open && content && (
        <span
          id={id}
          role="tooltip"
          className={`pointer-events-none absolute z-20 px-2 py-1 text-xs rounded-md bg-gray-900 text-white shadow ${placements[placement] || placements.top}`}
          style={orientation === 'vertical' ? { writingMode: 'vertical-rl', textOrientation: 'upright' } : undefined}
        >
          {content}
        </span>
      )}
    </span>
  );
});

Tooltip.displayName = 'Tooltip';

export default Tooltip;
