/**
 * 파일명: overlayStack.js
 * 작성자: HWI
 * 갱신일: 2026-07-12
 * 설명: 중첩 오버레이의 포커스 및 키보드 소유권 스택 관리
 */
const overlayEntryList = [];
const claimedEscapeEventSet = new WeakSet();
let outsideRestoreTarget = null;

const focusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * @description 오버레이를 전역 스택의 최상단으로 등록한다.
 * @param {HTMLElement} dialogElement
 * @param {HTMLElement | null} restoreTarget
 * @returns {{ dialogElement: HTMLElement, released: boolean }}
 */
export const registerOverlay = (dialogElement, restoreTarget) => {
  if (overlayEntryList.length === 0) {
    outsideRestoreTarget = restoreTarget || null;
  }
  const overlayEntry = { dialogElement, released: false };
  overlayEntryList.push(overlayEntry);
  return overlayEntry;
};

export const isTopOverlay = (overlayEntry) => (
  !overlayEntry?.released
  && overlayEntryList[overlayEntryList.length - 1] === overlayEntry
);

/**
 * @description 해당 엔트리가 최상단일 때만 대화상자 안으로 포커스를 이동한다.
 * @returns {boolean} 실제 포커스 이동을 시도했는지 여부.
 */
export const focusOverlay = (overlayEntry) => {
  if (!isTopOverlay(overlayEntry)) return false;
  const dialogElement = overlayEntry.dialogElement;
  if (!dialogElement?.isConnected) return false;
  const focusTarget = dialogElement.querySelector(focusableSelector) || dialogElement;
  try { focusTarget.focus(); } catch {}
  return true;
};

/**
 * @description 하나의 Escape 이벤트를 현재 최상단 오버레이만 선점한다.
 */
export const claimOverlayEscape = (overlayEntry, keyboardEvent) => {
  if (!isTopOverlay(overlayEntry) || claimedEscapeEventSet.has(keyboardEvent)) return false;
  claimedEscapeEventSet.add(keyboardEvent);
  return true;
};

/**
 * @description 오버레이를 해제하고 최상단이었다면 다음 오버레이 또는 외부 원점으로 포커스를 인계한다.
 */
export const releaseOverlay = (overlayEntry) => {
  if (!overlayEntry || overlayEntry.released) return;
  const overlayIndex = overlayEntryList.indexOf(overlayEntry);
  if (overlayIndex < 0) {
    overlayEntry.released = true;
    return;
  }
  const wasTopOverlay = overlayIndex === overlayEntryList.length - 1;
  overlayEntryList.splice(overlayIndex, 1);
  overlayEntry.released = true;
  if (!wasTopOverlay) return;

  const nextOverlayEntry = overlayEntryList[overlayEntryList.length - 1];
  if (nextOverlayEntry) {
    focusOverlay(nextOverlayEntry);
    return;
  }

  const restoreTarget = outsideRestoreTarget;
  outsideRestoreTarget = null;
  if (restoreTarget?.isConnected && typeof restoreTarget.focus === 'function') {
    try { restoreTarget.focus(); } catch {}
  }
};
