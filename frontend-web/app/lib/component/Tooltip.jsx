/**
 * 파일명: Tooltip.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: hover/click에 반응하는 툴팁 컴포넌트
 */
import { cloneElement, forwardRef, isValidElement, useEffect, useId, useRef, useState } from 'react';

const tooltipSideClassMap = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const nativeInteractiveElementSet = new Set([
  'button',
  'input',
  'select',
  'textarea',
  'summary',
]);

const shouldMakeTriggerWrapperFocusable = (children) => {
  if (!isValidElement(children)) return true;
  if (typeof children.type !== 'string') return false;
  if (nativeInteractiveElementSet.has(children.type)) return false;
  if (children.type === 'a' && children.props?.href) return false;
  if (children.props?.contentEditable) return false;
  const tabIndex = children.props?.tabIndex;
  return !(typeof tabIndex === 'number' && tabIndex >= 0);
};

const mergeAriaDescribedBy = (...valueList) => {
  const idList = valueList
    .flatMap((value) => String(value || '').split(/\s+/))
    .filter(Boolean);
  return [...new Set(idList)].join(' ') || undefined;
};

/**
 * @description 렌더링 및 hover/click 트리거 표시 제어
 * 처리 규칙: trigger 모드와 지연 시간(delay)에 따라 open 상태를 관리하고 접근성 속성을 동기화.
 * @updated 2026-02-27
 */
const Tooltip = forwardRef(({ content, placement = 'top', delay = 150, disabled = false, trigger = 'hover', className = '', children, textDirection = 'lr' }, ref) => {

  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const timerRef = useRef(null);
  const rootRef = useRef(null);
  const makeTriggerWrapperFocusable = shouldMakeTriggerWrapperFocusable(children);
  const tooltipDescriptionId = isOpen && content ? id : undefined;
  const childAriaDescribedBy = isValidElement(children)
    ? children.props?.['aria-describedby']
    : undefined;
  const triggerAriaDescribedBy = mergeAriaDescribedBy(
    childAriaDescribedBy,
    tooltipDescriptionId,
  );
  const triggerContent = isValidElement(children) && !makeTriggerWrapperFocusable
    ? cloneElement(children, { 'aria-describedby': triggerAriaDescribedBy })
    : children;

  /**
   * @description 지연 시간(delay) 이후 툴팁 표시 상태 열기
   * 처리 규칙: disabled=true면 중단하고, 기존 타이머는 clear 후 새 타이머를 등록한다.
   * @updated 2026-02-27
   */
  const show = () => {
    if (disabled) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsOpen(true), delay);
  };

  /**
   * @description 언마운트 시 지연 표시 timerRef clearTimeout
   * 처리 규칙: cleanup에서 timerRef.current를 해제해 누수를 방지한다.
   */
  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    if (!disabled) return;
    clearTimeout(timerRef.current);
    setIsOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (trigger !== 'click' || !isOpen) return undefined;
    const handleDocumentMouseDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, [isOpen, trigger]);

  /**
   * @description click 트리거 모드에서 툴팁 열림 상태를 토글
   * 처리 규칙: disabled=true면 무시하고, 아니면 이전 open 상태를 반전한다.
   * @updated 2026-02-27
   */
  const clickToggle = () => {
    if (disabled) return;
    clearTimeout(timerRef.current);
    setIsOpen((wasOpen) => !wasOpen);
  };

  return (
    <span
      ref={rootRef}
      className={`relative inline-flex ${className}`.trim()}
      onMouseEnter={trigger === 'hover' ? show : undefined}
      onMouseLeave={trigger === 'hover' ? () => {
        clearTimeout(timerRef.current);
        setIsOpen(false);
      } : undefined}
      onFocus={trigger === 'click' ? undefined : show}
      onBlur={(event) => {
        if (event.currentTarget.contains(event.relatedTarget)) return;
        clearTimeout(timerRef.current);
        setIsOpen(false);
      }}
      onClick={trigger === 'click' ? clickToggle : undefined}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          clearTimeout(timerRef.current);
          setIsOpen(false);
          return;
        }
        if (
          trigger === 'click'
          && makeTriggerWrapperFocusable
          && (event.key === 'Enter' || event.key === ' ')
        ) {
          event.preventDefault();
          clickToggle();
        }
      }}
    >
      {children && (
        <span
          ref={ref}
          aria-describedby={makeTriggerWrapperFocusable ? triggerAriaDescribedBy : undefined}
          role={makeTriggerWrapperFocusable && trigger === 'click' ? 'button' : undefined}
          tabIndex={makeTriggerWrapperFocusable ? 0 : undefined}
        >
          {triggerContent}
        </span>
      )}
      {isOpen && content && (
        <span
          id={id}
          role="tooltip"
          className={`pointer-events-none absolute z-20 px-2 py-1 text-xs rounded-md bg-gray-900 text-white shadow ${tooltipSideClassMap[placement] || tooltipSideClassMap.top} ${textDirection === 'tb' ? '[writing-mode:vertical-rl] [text-orientation:upright]' : ''}`.trim()}
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
