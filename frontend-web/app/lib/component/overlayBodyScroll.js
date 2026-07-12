/**
 * 파일명: overlayBodyScroll.js
 * 작성자: HWI
 * 갱신일: 2026-07-12
 * 설명: 중첩 오버레이의 body 스크롤 잠금을 공유 관리
 */
let overlayBodyScrollLockCount = 0;
let previousBodyOverflow = '';

/**
 * @description 열린 오버레이들이 body 스크롤 잠금을 공유하도록 참조 카운트를 관리한다.
 * @returns {() => void} 현재 오버레이의 잠금을 한 번만 해제하는 cleanup 함수.
 */
export const acquireOverlayBodyScrollLock = () => {
  if (typeof document === 'undefined') return () => {};

  if (overlayBodyScrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
  }
  overlayBodyScrollLockCount += 1;
  document.body.style.overflow = 'hidden';

  let isReleased = false;
  return () => {
    if (isReleased) return;
    isReleased = true;
    overlayBodyScrollLockCount = Math.max(0, overlayBodyScrollLockCount - 1);
    if (overlayBodyScrollLockCount === 0) {
      document.body.style.overflow = previousBodyOverflow;
      previousBodyOverflow = '';
    }
  };
};
