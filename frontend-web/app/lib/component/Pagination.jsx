/**
 * 파일명: Pagination.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-26
 * 설명: 페이지 이동 내비게이션 컴포넌트 (접근성 포함)
 */
import React from 'react';
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko';

/**
 * @description 페이지 번호를 최소/최대 범위로 보정한다.
 * 반환값: min~max 사이로 제한된 정수 값.
 * @updated 2026-02-27
 */
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

/**
 * @description Arrow 컴포넌트를 렌더링한다.
 * 반환값: 방향(dir)에 따라 회전이 적용된 단일 화살표 SVG.
 * @updated 2026-02-27
 */
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

/**
 * @description DoubleArrow 컴포넌트를 렌더링한다.
 * 반환값: 처음/마지막 페이지 이동 버튼에 쓰는 이중 화살표 SVG.
 * @updated 2026-02-27
 */
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

  /**
   * @description 페이지 변경 콜백 호출 전에 범위 보정을 적용한다.
   * 처리 규칙: nextPage를 clamp(1~pageCount)한 뒤 onChange를 호출한다.
   * @updated 2026-02-27
   */
  const safeChange = (nextPage) => onChange?.(clamp(nextPage, 1, pageCount));

  const tokenList = [];

  /**
   * @description 페이지 토큰(숫자 또는 ellipsis)을 렌더링 버퍼에 추가한다.
   * 부작용: tokenList 배열 길이가 증가한다.
   * @updated 2026-02-27
   */
  const addToken = (token) => tokenList.push(token);

  /**
   * @description startPage~endPage 구간의 연속 페이지 번호를 tokenList에 채운다.
   * 처리 규칙: for 루프로 모든 번호를 순회하며 addToken을 호출한다.
   * @updated 2026-02-27
   */
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
 * @description 접근성 라벨과 페이지 윈도우 계산을 포함한 Pagination 컴포넌트를 외부에 노출한다.
 * 반환값: Pagination 컴포넌트 export.
 */
export default Pagination;
