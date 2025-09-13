/**
 * 파일명: Pagination.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Pagination UI 컴포넌트 구현
 */
/**
 * 파일명: Pagination.jsx
 * 설명: 페이지 이동 내비게이션 컴포넌트 (접근성 포함)
 */
import React from 'react';

const Arrow = ({ dir, className = '' }) => {
  const rotate = dir === 'left' ? 'rotate-180' : dir === 'up' ? '-rotate-90' : dir === 'down' ? 'rotate-90' : '';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${rotate} ${className}`} aria-hidden>
      <path d="M5.5 3L10 8L5.5 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const DoubleArrow = ({ dir = 'right', className = '' }) => {
  const rotate = dir === 'left' ? 'rotate-180' : '';
  return (
    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${rotate} ${className}`} aria-hidden>
      <path d="M3.5 3L8 8L3.5 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.5 3L14 8L9.5 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const clamp = (n, min, max) => Math.max(min, Math.min(n, max));

const Pagination = ({
  page,
  pageCount,
  onChange,
  maxButtons = 7,
  className = '',
  showEdges = true,
}) => {
  const safeChange = (p) => onChange?.(clamp(p, 1, pageCount));

  // build range with edges + ellipsis
  const tokens = [];
  const add = (t) => tokens.push(t);
  const addPages = (s, e) => { for (let i = s; i <= e; i++) add(i); };

  if (pageCount <= maxButtons) {
    addPages(1, pageCount);
  } else {
    const windowSize = Math.max(3, maxButtons - (showEdges ? 2 : 0));
    let start = Math.max(showEdges ? 2 : 1, page - Math.floor((windowSize - 1) / 2));
    let end = Math.min(showEdges ? pageCount - 1 : pageCount, start + windowSize - 1);
    start = Math.max(showEdges ? 2 : 1, Math.min(start, end - windowSize + 1));
    if (showEdges) add(1);
    if (showEdges && start > 2) add('…');
    addPages(start, end);
    if (showEdges && end < pageCount - 1) add('…');
    if (showEdges) add(pageCount);
  }

  const btnBase = 'rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors';
  const navBase = 'rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed';
  const selected = 'bg-blue-100 text-blue-700 font-semibold ring-1 ring-blue-300';
  const normal = 'text-gray-700 hover:bg-gray-100';

  return (
    <div className={`inline-flex items-center gap-1 ${className}`} role="navigation" aria-label="Pagination">
      <button className={navBase} onClick={() => safeChange(1)} disabled={page === 1} aria-label="First page">
        <DoubleArrow dir="left" />
      </button>
      <button className={navBase} onClick={() => safeChange(page - 1)} disabled={page === 1} aria-label="Previous page">
        <Arrow dir="left" />
      </button>
      {tokens.map((t, idx) => (
        typeof t === 'number' ? (
          <button
            key={t}
            className={`${btnBase} ${t === page ? selected : normal}`}
            aria-current={t === page ? 'page' : undefined}
            onClick={() => safeChange(t)}
          >
            {t}
          </button>
        ) : (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 select-none" aria-hidden>…</span>
        )
      ))}
      <button className={navBase} onClick={() => safeChange(page + 1)} disabled={page === pageCount} aria-label="Next page">
        <Arrow dir="right" />
      </button>
      <button className={navBase} onClick={() => safeChange(pageCount)} disabled={page === pageCount} aria-label="Last page">
        <DoubleArrow dir="right" />
      </button>
    </div>
  );
};

export default Pagination;

