/**
 * 파일명: Tooltip.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
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
 * @description 렌더링 및 hover/click 트리거 표시 제어
 * 처리 규칙: trigger 모드와 지연 시간(delay)에 따라 open 상태를 관리하고 접근성 속성을 동기화.
 * @updated 2026-02-27
 */
const Tooltip = forwardRef(({ content, placement = 'top', delay = 150, disabled = false, trigger = 'hover', className = '', children, textDirection = 'lr' }, ref) => {

  const [open, setOpen] = useState(false);
  const id = useId();
  const timer = useRef(null);
  const rootRef = useRef(null);

  /**
   * @description 지연 시간(delay) 이후 툴팁 표시 상태 열기
   * 처리 규칙: disabled=true면 중단하고, 기존 타이머는 clear 후 새 타이머를 등록한다.
   * @updated 2026-02-27
   */
  const show = () => {
    if (disabled) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), delay);
  };

  /**
   * @description 툴팁을 즉시 닫고 대기 중인 표시 타이머를 정리
   * 부작용: open=false, timer.current clearTimeout이 반영된다.
   * @updated 2026-02-27
   */
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  /**
   * @description click 트리거 모드에서 툴팁 열림 상태를 토글
   * 처리 규칙: disabled=true면 무시하고, 아니면 이전 open 상태를 반전한다.
   * @updated 2026-02-27
   */
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
          style={textDirection === 'tb' ? { writingMode: 'vertical-rl', textOrientation: 'upright' } : undefined}
        >
          {content}
        </span>
      )}
    </span>
  );
});

Tooltip.displayName = 'Tooltip';

/**
 * @description hover/click 트리거와 배치 옵션을 지원하는 Tooltip 컴포넌트를 외부에 노출
 * 반환값: Tooltip 컴포넌트 export.
 */
export default Tooltip;
