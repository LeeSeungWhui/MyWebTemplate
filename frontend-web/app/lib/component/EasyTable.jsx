/**
 * 파일명: EasyTable.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-11
 * 설명: EasyTable UI 컴포넌트 (구 Table)
 * Lightweight, flexible data Table/Card component with controlled/uncontrolled pagination
 * - Decoupled from project-specific Checkbox/Icon
 * - Supports array or EasyList-like datasets
 */
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

const isListLike = (list) => !!list && (typeof list.size === 'function' || Array.isArray(list));
const listSize = (list) => (Array.isArray(list) ? list.length : (typeof list.size === 'function' ? list.size() : 0));
const listGet = (list, idx) => (Array.isArray(list) ? list[idx] : (typeof list.get === 'function' ? list.get(idx) : undefined));
const defaultRowKey = (row, idx) => {
  if (row && typeof row === 'object') {
    if (typeof row.get === 'function') {
      if (row.get('id') != null) return row.get('id');
      if (row.get('key') != null) return row.get('key');
    } else {
      if (row.id != null) return row.id;
      if (row.key != null) return row.key;
    }
  }
  return idx;
};

const clamp = (n, min, max) => Math.max(min, Math.min(n, max));

const Arrow = ({ dir, className = '' }) => {
  const rotate = dir === 'left' ? 'rotate-180' : dir === 'up' ? '-rotate-90' : dir === 'down' ? 'rotate-90' : '';
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

const Pagination = ({ page, pageCount, onChange, maxButtons = 7, className = '' }) => {
  // build range with edges + ellipsis
  const tokens = [];
  const add = (t) => tokens.push(t);
  const addPages = (s, e) => { for (let i = s; i <= e; i++) add(i); };

  if (pageCount <= maxButtons) {
    addPages(1, pageCount);
  } else {
    const windowSize = Math.max(3, maxButtons - 2); // reserve edges
    let start = Math.max(2, page - Math.floor((windowSize - 1) / 2));
    let end = Math.min(pageCount - 1, start + windowSize - 1);
    start = Math.max(2, Math.min(start, end - windowSize + 1));
    add(1);
    if (start > 2) add('…');
    addPages(start, end);
    if (end < pageCount - 1) add('…');
    add(pageCount);
  }

  const btnBase = 'rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors';
  const navBase = 'rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed';
  const selected = 'bg-blue-100 text-blue-700 font-semibold ring-1 ring-blue-300';
  const normal = 'text-gray-700 hover:bg-gray-100';

  return (
    <div className={`inline-flex items-center gap-1 ${className}`} role="navigation" aria-label="Pagination">
      <button className={navBase} onClick={() => onChange(1)} disabled={page === 1} aria-label="First page">
        <DoubleArrow dir="left" />
      </button>
      <button className={navBase} onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Previous page">
        <Arrow dir="left" />
      </button>
      {tokens.map((t, idx) => (
        typeof t === 'number' ? (
          <button
            key={t}
            className={`${btnBase} ${t === page ? selected : normal}`}
            aria-current={t === page ? 'page' : undefined}
            onClick={() => onChange(t)}
          >
            {t}
          </button>
        ) : (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 select-none">…</span>
        )
      ))}
      <button className={navBase} onClick={() => onChange(page + 1)} disabled={page === pageCount} aria-label="Next page">
        <Arrow dir="right" />
      </button>
      <button className={navBase} onClick={() => onChange(pageCount)} disabled={page === pageCount} aria-label="Last page">
        <DoubleArrow dir="right" />
      </button>
    </div>
  );
};

const EasyTable = forwardRef(function EasyTable(
  {
    // data & columns
    data = [],
    columns = [], // [{ key, header, width, align, headerClassName, cellClassName, render(row, idx) }]
    rowKey = defaultRowKey,
    // layout
    className = '',
    headerClassName = '',
    rowClassName = '',
    cellClassName = '',
    rowsClassName = '',
    // empty/loading
    empty = '데이터가 없습니다.',
    loading = false,
    // variant: table | card
    variant = 'table',
    renderCard = null,
    gridClassName = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3',
    // paging
    page: pageProp,
    defaultPage = 1,
    pageSize = 10,
    onPageChange,
    pageParam = null,
    persist = true,
    persistKey = 'easy-table-page',
    maxPageButtons = 7,
    // events
    onRowClick,
  },
  ref,
) {
  const mountedRef = useRef(false);
  const [page, setPage] = useState(() => pageProp ?? defaultPage);

  const total = useMemo(() => (isListLike(data) ? listSize(data) : (Array.isArray(data) ? data.length : 0)), [data]);
  const pageCount = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const currentPage = clamp(pageProp ?? page, 1, pageCount);

  // persist: url param
  useEffect(() => {
    if (!pageParam) return;
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set(pageParam, String(currentPage));
    window.history.replaceState({}, '', url.toString());
  }, [currentPage, pageParam]);

  // persist: storage
  useEffect(() => {
    if (!persist) return;
    if (typeof window === 'undefined') return;
    const key = `easy-table:${persistKey}`;
    try { window.sessionStorage.setItem(key, String(currentPage)); } catch {}
  }, [currentPage, persist, persistKey]);

  // restore from storage on mount when uncontrolled
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    if (pageProp != null) return;
    if (!persist) return;
    if (typeof window === 'undefined') return;
    const key = `easy-table:${persistKey}`;
    try {
      const saved = Number(window.sessionStorage.getItem(key));
      if (!Number.isNaN(saved) && saved >= 1) setPage(saved);
    } catch {}
  }, [pageProp, persist, persistKey]);

  const handlePageChange = (next) => {
    const nextPage = clamp(next, 1, pageCount);
    if (pageProp == null) setPage(nextPage);
    onPageChange?.(nextPage);
  };

  const rows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(total, start + pageSize);
    const out = [];
    for (let i = start; i < end; i += 1) out.push(listGet(data, i));
    return out;
  }, [data, total, currentPage, pageSize]);

  if (loading) {
    return (
      <div className={`w-full ${className}`} ref={ref}>
        <div className="p-6 text-center text-gray-500">불러오는 중…</div>
      </div>
    );
  }

  if (!total) {
    return (
      <div className={`w-full ${className}`} ref={ref}>
        <div className="p-6 text-center text-gray-500">{empty}</div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`w-full ${className}`} ref={ref}>
        <div className={gridClassName}>
          {rows.map((row, idx) => (
            <div key={defaultRowKey(row, idx)} onClick={() => onRowClick?.(row, idx)}>
              {renderCard ? renderCard(row, idx) : (
                <div className="border rounded p-3">
                  <pre className="text-xs overflow-auto">{JSON.stringify(row, null, 2)}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
        {pageCount > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination page={currentPage} pageCount={pageCount} onChange={handlePageChange} maxButtons={maxPageButtons} />
          </div>
        )}
      </div>
    );
  }

  // table variant
  return (
    <div className={`w-full ${className}`} ref={ref}>
      <div className={`grid items-center gap-2 ${headerClassName}`} style={{ gridTemplateColumns: columns.map(c => c.width || '1fr').join(' ') }}>
        {columns.map((col) => (
          <div key={String(col.key)} className={`text-sm font-medium text-gray-600 ${col.headerClassName || ''}`}>
            {col.header ?? col.key}
          </div>
        ))}
      </div>
      <div className={`mt-2 space-y-2 ${rowsClassName}`}>
        {rows.map((row, rIdx) => (
          <div
            key={defaultRowKey(row, rIdx)}
            className={`grid items-center gap-2 rounded-xl border border-gray-200 p-3 hover:shadow-sm ${rowClassName}`}
            style={{ gridTemplateColumns: columns.map(c => c.width || '1fr').join(' ') }}
            onClick={() => onRowClick?.(row, rIdx)}
          >
            {columns.map((col) => {
              const value = typeof row?.get === 'function' ? row.get(col.key) : row?.[col.key];
              return (
                <div key={String(col.key)} className={`${col.cellClassName || cellClassName}`} style={{ textAlign: col.align || 'left' }}>
                  {typeof col.render === 'function' ? col.render(row, rIdx) : (value ?? '')}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {pageCount > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination page={currentPage} pageCount={pageCount} onChange={handlePageChange} maxButtons={maxPageButtons} />
        </div>
      )}
    </div>
  );
});

EasyTable.displayName = 'EasyTable';

export default EasyTable;

