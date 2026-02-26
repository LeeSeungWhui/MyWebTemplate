/**
 * 파일명: Pagination.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-26
 * 설명: 페이지 이동 내비게이션 컴포넌트 (접근성 포함)
 */
import React from 'react';
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko';

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const Arrow = ({ dir, className = '' }) => {
  let rotate = '';
  if (dir === 'left') rotate = 'rotate-180';
  else if (dir === 'up') rotate = '-rotate-90';
  else if (dir === 'down') rotate = 'rotate-90';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${rotate} ${className}`} aria-hidden>
      <path d="M5.5 3L10 8L5.5 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const DoubleArrow = ({ dir = 'right', className = '' }) => {
  const rotate = dir === 'left' ? 'rotate-180' : '';
  return (
    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${rotate} ${className}`} aria-hidden>
      <path d="M3.5 3L8 8L3.5 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 3L14 8L9.5 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/**
 * @description 페이지 번호/이동 버튼을 렌더링한다.
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
  const safeChange = (nextPage) => onChange?.(clamp(nextPage, 1, pageCount));

  const tokenList = [];
  const addToken = (token) => tokenList.push(token);
  const addPages = (startPage, endPage) => {
    for (let pageNo = startPage; pageNo <= endPage; pageNo += 1) {
      addToken(pageNo);
    }
  };

  if (pageCount <= maxButtons) {
    addPages(1, pageCount);
  } else {
    const reservedEdgeCount = showEdges ? 2 : 0;
    const windowSize = Math.max(3, maxButtons - reservedEdgeCount);
    const startFloor = showEdges ? 2 : 1;
    const endCeil = showEdges ? pageCount - 1 : pageCount;

    let start = Math.max(startFloor, page - Math.floor((windowSize - 1) / 2));
    let end = Math.min(endCeil, start + windowSize - 1);
    start = Math.max(startFloor, Math.min(start, end - windowSize + 1));

    if (showEdges) addToken(1);
    if (showEdges && start > 2) addToken('…');
    addPages(start, end);
    if (showEdges && end < pageCount - 1) addToken('…');
    if (showEdges) addToken(pageCount);
  }

  const buttonClassName = 'rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors';
  const navClassName = 'rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed';
  const selectedClassName = 'bg-blue-100 text-blue-700 font-semibold ring-1 ring-blue-300';
  const normalClassName = 'text-gray-700 hover:bg-gray-100';

  return (
    <div className={`inline-flex items-center gap-1 ${className}`} role="navigation" aria-label={COMMON_COMPONENT_LANG_KO.pagination.navigationAriaLabel}>
      <button className={navClassName} onClick={() => safeChange(1)} disabled={page === 1} aria-label={COMMON_COMPONENT_LANG_KO.pagination.firstPageAriaLabel}>
        <DoubleArrow dir="left" />
      </button>
      <button className={navClassName} onClick={() => safeChange(page - 1)} disabled={page === 1} aria-label={COMMON_COMPONENT_LANG_KO.pagination.previousPageAriaLabel}>
        <Arrow dir="left" />
      </button>
      {tokenList.map((token, tokenIndex) => {
        if (typeof token === 'number') {
          return (
            <button
              key={token}
              className={`${buttonClassName} ${token === page ? selectedClassName : normalClassName}`}
              aria-current={token === page ? 'page' : undefined}
              onClick={() => safeChange(token)}
            >
              {token}
            </button>
          );
        }
        return <span key={`ellipsis-${tokenIndex}`} className="px-2 text-gray-400 select-none" aria-hidden>…</span>;
      })}
      <button className={navClassName} onClick={() => safeChange(page + 1)} disabled={page === pageCount} aria-label={COMMON_COMPONENT_LANG_KO.pagination.nextPageAriaLabel}>
        <Arrow dir="right" />
      </button>
      <button className={navClassName} onClick={() => safeChange(pageCount)} disabled={page === pageCount} aria-label={COMMON_COMPONENT_LANG_KO.pagination.lastPageAriaLabel}>
        <DoubleArrow dir="right" />
      </button>
    </div>
  );
};

/**
 * @description Pagination 컴포넌트 엔트리를 export 한다.
 */
export default Pagination;
