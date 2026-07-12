/**
 * 파일명: Drawer.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Drawer UI 컴포넌트 구현
 */
import { forwardRef, useEffect, useRef } from 'react';
import Icon from './Icon';
import { acquireOverlayBodyScrollLock } from './overlayBodyScroll';
import {
  claimOverlayEscape,
  focusOverlay,
  registerOverlay,
  releaseOverlay,
} from './overlayStack';

const drawerSideMapObj = {
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
const resizeClassMapObj = {
  horizontal: 'resize-x overflow-auto',
  vertical: 'resize-y overflow-auto',
};

/**
 * @description 렌더링 및 열림 상태 전환 처리
 * 처리 규칙: 열림 상태에 따라 위치/사이즈/접힘 버튼 UI를 계산하고 외부 닫기 이벤트를 전파.
 * @updated 2026-02-27
 */
const Drawer = forwardRef(function Drawer(
  {
    isOpen = false,
    onClose,
    side = 'right',
    size = '',
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

  const sideConfigObj = drawerSideMapObj[side] || drawerSideMapObj.right;
  const drawerRef = useRef(null);
  const overlayEntryRef = useRef(null);
  const focusTimerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const focusableSelector =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  /**
   * @description isOpen일 때 document keydown으로 Escape 닫기 처리
   * 처리 규칙: cleanup에서 keydown 리스너를 제거하고 closeOnEsc일 때 onClose를 호출한다.
   */
  useEffect(() => {
    if (!isOpen) return undefined;

    const releaseBodyScrollLock = acquireOverlayBodyScrollLock();
    const overlayEntry = registerOverlay(drawerRef.current, document.activeElement);
    overlayEntryRef.current = overlayEntry;
    clearTimeout(focusTimerRef.current);
    focusTimerRef.current = setTimeout(() => {
      focusOverlay(overlayEntry);
    }, 0);

    /**
     * @description Esc 입력을 감지해 closeOnEsc 옵션이 켜진 경우 패널을 닫힘 상태로 전환
     * @param {KeyboardEvent} keyboardEvent
     * @returns {void}
     * @updated 2026-02-27
     */
    const handleDocKeyDown = (keyboardEvent) => {
      if (
        closeOnEsc
        && keyboardEvent.key === 'Escape'
        && claimOverlayEscape(overlayEntryRef.current, keyboardEvent)
      ) onCloseRef.current?.();
    };

    document.addEventListener('keydown', handleDocKeyDown);
    return () => {
      clearTimeout(focusTimerRef.current);
      focusTimerRef.current = null;
      document.removeEventListener('keydown', handleDocKeyDown);
      releaseBodyScrollLock();
      releaseOverlay(overlayEntry);
      if (overlayEntryRef.current === overlayEntry) overlayEntryRef.current = null;
    };
  }, [isOpen, closeOnEsc]);



  const sizeClassName = typeof size === 'string' ? size.trim() : '';
  const resizeAxisKey = side === 'top' || side === 'bottom' ? 'vertical' : 'horizontal';
  const resizeClassName = resizable ? resizeClassMapObj[resizeAxisKey] : '';
  const transformClassName = isOpen ? sideConfigObj.transform.open : sideConfigObj.transform.closed;


  const handlePositionMapObj = {
    right: 'absolute left-1 top-1/2 -translate-y-1/2',
    left: 'absolute right-1 top-1/2 -translate-y-1/2',
    top: 'absolute bottom-1 left-1/2 -translate-x-1/2',
    bottom: 'absolute top-1 left-1/2 -translate-x-1/2'
  };

  const handleShapeMapObj = {
    right: 'h-16 w-7 rounded-r-lg border-l',
    left: 'h-16 w-7 rounded-l-lg border-r',
    top: 'w-16 h-7 rounded-b-lg border-t',
    bottom: 'w-16 h-7 rounded-t-lg border-b'
  };
  const arrowRotateClassMap = { right: '', left: 'rotate-180', top: '-rotate-90', bottom: 'rotate-90' };

  /**
   * @description forwardRef가 함수형/객체형인 경우를 모두 지원해 패널 DOM 참조를 전달
   * @param {HTMLElement | null} el
   * @returns {void}
   * @updated 2026-02-27
   */
  const assignRef = (el) => {
    drawerRef.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) ref.current = el;
  };

  /**
   * @description 열린 드로어 안에서 Tab 포커스를 순환시킨다.
   * 처리 규칙: 첫/마지막 focusable 경계에서 반대쪽으로 이동하고, 항목이 없으면 패널에 포커스를 유지한다.
   */
  const handleDialogKeyDown = (keyboardEvent) => {
    props?.onKeyDown?.(keyboardEvent);
    if (keyboardEvent.defaultPrevented) return;
    if (!isOpen || keyboardEvent.key !== 'Tab' || !drawerRef.current) return;

    const focusables = Array.from(drawerRef.current.querySelectorAll(focusableSelector));
    if (!focusables.length) {
      keyboardEvent.preventDefault();
      try { drawerRef.current.focus(); } catch {}
      return;
    }

    const firstFocusable = focusables[0];
    const lastFocusable = focusables[focusables.length - 1];
    if (keyboardEvent.shiftKey && (document.activeElement === firstFocusable || document.activeElement === drawerRef.current)) {
      keyboardEvent.preventDefault();
      try { lastFocusable.focus(); } catch {}
      return;
    }
    if (!keyboardEvent.shiftKey && document.activeElement === lastFocusable) {
      keyboardEvent.preventDefault();
      try { firstFocusable.focus(); } catch {}
    }
  };

  const drawerPropsObj = { ...(props || {}) };
  delete drawerPropsObj.style;
  delete drawerPropsObj.onKeyDown;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      aria-hidden={!isOpen}
      inert={isOpen ? undefined : true}
    >

      {/* 배경 레이어 */}
      <div
        className={`absolute inset-0 bg-slate-950/35 backdrop-blur-[2px] transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => { if (closeOnBackdrop) onClose?.(); }}
        aria-hidden="true"
      />

      {/* 패널 */}
      <div
        ref={assignRef}
        className={`absolute overflow-hidden bg-white text-slate-700 shadow-2xl shadow-slate-950/10 ring-1 ring-slate-900/10 transform-gpu will-change-transform transition-transform duration-300 ease-in-out ${sideConfigObj.base} ${collapseButton ? {
          bottom: 'rounded-t-2xl',
          left: 'rounded-r-2xl',
          right: 'rounded-l-2xl',
          top: 'rounded-b-2xl',
        }[side] : ''} ${transformClassName} ${sizeClassName} ${resizeClassName} ${className}`.trim()}
        role="dialog"
        aria-modal={isOpen ? 'true' : undefined}
        aria-label="드로어"
        tabIndex={-1}
        data-side={side}
        data-state={isOpen ? 'open' : 'closed'}
        onKeyDown={handleDialogKeyDown}
        {...drawerPropsObj}
      >
        <div className={`h-full min-h-0 ${collapseButton ? {
          bottom: 'pt-10',
          left: 'pr-10',
          right: 'pl-10',
          top: 'pb-10',
        }[side] : ''}`}>
          {children}
        </div>

        {collapseButton && (
          <button
            type="button"
            aria-label="드로어 닫기"
            className={`flex items-center justify-center bg-white/95 text-slate-500 border-slate-200/80 shadow-sm ring-1 ring-slate-900/5 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/25 ${handleShapeMapObj[side]} ${handlePositionMapObj[side]} z-10`}
            onClick={() => onClose?.()}
          >

            <Icon icon="hi:HiChevronRight" className={arrowRotateClassMap[side]} size="12px" />
          </button>
        )}
      </div>
    </div>
  );
});

Drawer.displayName = 'Drawer';

/**
 * @description Drawer 컴포넌트 진입점 노출
 * 반환값: 측면 패널 열림/닫힘 동작을 제공하는 Drawer 컴포넌트.
 * @returns {React.ComponentType}
 */
export default Drawer;
