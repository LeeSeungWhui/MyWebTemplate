/**
 * 파일명: Pagination.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: 페이지 이동 내비게이션 컴포넌트 (접근성 포함)
 */
import React from 'react';
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko';
import Icon from './Icon';

const ARROW_ROTATE_CLASS_MAP = {
  down: 'rotate-90',
  left: 'rotate-180',
  right: '',
  up: '-rotate-90',
};

const DOUBLE_ARROW_ROTATE_CLASS_MAP = {
  left: 'rotate-180',
  right: '',
};

/**
 * @description 를 렌더링. 입력/출력 계약을 함께 명시
 * 반환값: 방향(dir)에 따라 회전이 적용된 단일 화살표 SVG.
 * @updated 2026-02-27
 */
const Arrow = ({ direction, className = '' }) => {

  const rotateClassName = ARROW_ROTATE_CLASS_MAP[direction] ?? '';
  return (
    <Icon icon="hi:HiChevronRight" size="16px" className={`${rotateClassName} ${className}`} />
  );
};

/**
 * @description 를 렌더링. 입력/출력 계약을 함께 명시
 * 반환값: 처음/마지막 페이지 이동 버튼에 쓰는 이중 화살표 SVG.
 * @updated 2026-02-27
 */
const DoubleArrow = ({ direction = 'right', className = '' }) => {

  const rotateClassName = DOUBLE_ARROW_ROTATE_CLASS_MAP[direction] ?? '';
  return (
    <Icon icon="hi:HiChevronDoubleRight" size="18px" className={`${rotateClassName} ${className}`} />
  );
};

/**
 * @description 페이지 번호/이동 버튼을 렌더링. 입력/출력 계약을 함께 명시
 * @param {Object} props
 * @returns {JSX.Element}
 */
const Pagination = ({
  page,
  pageCount,
  onChange,
  maxButtons = 7,
  className = '',
  showEdges = true,
}) => {

  const parsedPageCount = Number(pageCount);
  const parsedPage = Number(page);
  const parsedMaxButtons = Number(maxButtons);
  const resolvedPageCount = Number.isFinite(parsedPageCount)
    ? Math.max(1, Math.trunc(parsedPageCount))
    : 1;
  const finitePage = Number.isFinite(parsedPage) ? Math.trunc(parsedPage) : 1;
  const resolvedPage = Math.max(1, Math.min(finitePage, resolvedPageCount));
  const resolvedMaxButtons = Number.isFinite(parsedMaxButtons)
    ? Math.max(3, Math.trunc(parsedMaxButtons))
    : 7;
  const tokenList = [];

  if (resolvedPageCount <= resolvedMaxButtons) {
    for (let pageNo = 1; pageNo <= resolvedPageCount; pageNo += 1) {
      tokenList.push(pageNo);
    }
  } else {
    const reservedEdgeCount = showEdges ? 2 : 0;
    const windowSize = Math.max(3, resolvedMaxButtons - reservedEdgeCount);
    const startFloor = showEdges ? 2 : 1;
    const endCeil = showEdges ? resolvedPageCount - 1 : resolvedPageCount;

    let windowStartPage = Math.max(startFloor, resolvedPage - Math.floor((windowSize - 1) / 2));
    let windowEndPage = Math.min(endCeil, windowStartPage + windowSize - 1);
    windowStartPage = Math.max(startFloor, Math.min(windowStartPage, windowEndPage - windowSize + 1));

    if (showEdges) tokenList.push(1);
    if (showEdges && windowStartPage > 2) tokenList.push('…');
    for (let pageNo = windowStartPage; pageNo <= windowEndPage; pageNo += 1) {
      tokenList.push(pageNo);
    }
    if (showEdges && windowEndPage < resolvedPageCount - 1) tokenList.push('…');
    if (showEdges) tokenList.push(resolvedPageCount);
  }

  const navClassName = 'rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div className={`inline-flex items-center gap-1 ${className}`} role="navigation" aria-label={COMMON_COMPONENT_LANG_KO.pagination.navigationAriaLabel}>
      {showEdges ? (
        <button type="button" className={navClassName} onClick={() => onChange?.(1)} disabled={resolvedPage === 1} aria-label={COMMON_COMPONENT_LANG_KO.pagination.firstPageAriaLabel}>
          <DoubleArrow direction="left" />
        </button>
      ) : null}
      <button type="button" className={navClassName} onClick={() => onChange?.(Math.max(1, resolvedPage - 1))} disabled={resolvedPage === 1} aria-label={COMMON_COMPONENT_LANG_KO.pagination.previousPageAriaLabel}>
        <Arrow direction="left" />
      </button>
      {tokenList.map((pageToken, pageTokenIndex) => {
        if (typeof pageToken === 'number') {
          return (
            <button
              type="button"
              key={pageToken}
              className={`rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors ${pageToken === resolvedPage ? 'bg-zinc-900 text-zinc-50 font-semibold ring-1 ring-zinc-900' : 'text-zinc-700 hover:bg-zinc-100'}`}
              aria-current={pageToken === resolvedPage ? 'page' : undefined}
              onClick={() => onChange?.(pageToken)}
            >
              {pageToken}
            </button>
          );
        }
        return <span key={`ellipsis-${pageTokenIndex}`} className="px-2 text-gray-400 select-none" aria-hidden>…</span>;
      })}
      <button type="button" className={navClassName} onClick={() => onChange?.(Math.min(resolvedPageCount, resolvedPage + 1))} disabled={resolvedPage === resolvedPageCount} aria-label={COMMON_COMPONENT_LANG_KO.pagination.nextPageAriaLabel}>
        <Arrow direction="right" />
      </button>
      {showEdges ? (
        <button type="button" className={navClassName} onClick={() => onChange?.(resolvedPageCount)} disabled={resolvedPage === resolvedPageCount} aria-label={COMMON_COMPONENT_LANG_KO.pagination.lastPageAriaLabel}>
          <DoubleArrow direction="right" />
        </button>
      ) : null}
    </div>
  );
};

/**
 * @description 접근성 라벨과 페이지 윈도우 계산을 포함한 Pagination 컴포넌트를 외부에 노출
 * 반환값: Pagination 컴포넌트 export.
 */
export default Pagination;
