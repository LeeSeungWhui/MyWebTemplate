/**
 * 파일명: Table.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Table UI 컴포넌트 구현
 */
/**
 * Table.jsx
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

const Table = forwardRef(function Table(
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
    rowsClassName = '', // container for rows (e.g., 'space-y-2')
    empty = '데이터가 없습니다.',
    loading = false,
    // interactions
    onRowClick,
    // pagination
    page: pageProp,
    defaultPage = 1,
    pageSize = 10,
    maxPageButtons = 10,
    total: totalProp, // for server paging
    pageParam, // e.g. 'page' to sync with URL
    persistKey, // sessionStorage key
    persist = 'session', // 'session' | 'local'
    onPageChange,
    // variant
    variant = 'table', // 'table' | 'card'
    // card-only
    renderCard,
    cardsPerRow = 4,
    gridClassName = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  },
  ref
){
  // derive initial page
  const initPage = (typeof pageProp === 'number') ? pageProp : defaultPage;

  const [pageState, setPageState] = useState(initPage);
  const page = typeof pageProp === 'number' ? pageProp : pageState;

  const size = useMemo(() => (totalProp != null ? totalProp : (isListLike(data) ? listSize(data) : 0)), [data, totalProp]);
  const pageCount = Math.max(1, Math.ceil(size / Math.max(1, pageSize)));

  // clamp when data size changes (uncontrolled only)
  useEffect(() => {
    if (typeof pageProp === 'number') return;
    if (page > pageCount) setPageState(pageCount);
  }, [pageCount]);

  // initialize from URL/persist AFTER hydration to avoid SSR mismatch (uncontrolled)
  useEffect(() => {
    if (typeof pageProp === 'number') return;
    if (typeof window === 'undefined') return;
    let next = defaultPage;
    let fromParam = null;
    if (pageParam) {
      const sp = new URLSearchParams(window.location.search);
      const v = sp.get(pageParam);
      const p = parseInt(v || '');
      if (!isNaN(p) && p > 0) fromParam = p;
    }
    if (fromParam != null) next = fromParam;
    else if (persistKey) {
      const store = persist === 'local' ? window.localStorage : window.sessionStorage;
      const raw = store.getItem(persistKey);
      if (raw) {
        const p = parseInt(raw);
        if (!isNaN(p) && p > 0) next = p;
      }
    }
    if (next !== pageState) setPageState(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageProp, pageParam, persistKey, persist, defaultPage]);

  // persist + URL sync (uncontrolled)
  useEffect(() => {
    if (typeof pageProp === 'number') return;
    if (persistKey && typeof window !== 'undefined') {
      const store = persist === 'local' ? window.localStorage : window.sessionStorage;
      store.setItem(persistKey, String(page));
    }
    if (pageParam && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set(pageParam, String(page));
      window.history.replaceState(null, '', url.toString());
    }
  }, [page, pageProp, persistKey, persist, pageParam]);

  const sliceRange = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, size);
    return { start, end };
  }, [page, pageSize, size]);

  const rows = useMemo(() => {
    const { start, end } = sliceRange;
    if (!isListLike(data)) return [];
    const out = [];
    for (let i = start; i < end; i++) out.push(listGet(data, i));
    return out;
  }, [data, sliceRange]);

  const header = (
    <div role="row" className={`grid w-full bg-[#667586] text-white text-sm font-semibold items-center ${headerClassName}`.trim()} style={{ gridTemplateColumns: columns.map(c => c.width ? 'auto' : '1fr').join(' ') }}>
      {columns.map((col, i) => (
        <div
          key={col.key ?? i}
          role="columnheader"
          className={`px-3 py-3 text-center ${col.headerClassName || ''}`}
          style={{ width: col.width || 'auto' }}
        >
          {typeof col.header === 'function' ? col.header() : col.header}
        </div>
      ))}
    </div>
  );

  const renderCell = (col, row, rowIdx) => {
    if (typeof col.render === 'function') return col.render(row, rowIdx);
    if (col.key == null) return null;
    if (row && typeof row.get === 'function') return row.get(col.key);
    return row?.[col.key];
  };

  const onChangePage = (next) => {
    const target = clamp(next, 1, pageCount);
    if (typeof pageProp === 'number') {
      // controlled
      onPageChange?.(target);
    } else {
      setPageState(target);
    }
  };

  const bodyTable = (
    <div role="rowgroup" className={`w-full ${rowsClassName}`.trim()}>
      {rows.map((row, i) => {
        const globalIdx = (page - 1) * pageSize + i;
        const keyVal = typeof rowKey === 'function' ? rowKey(row, globalIdx) : (typeof rowKey === 'string' ? (row?.get ? row.get(rowKey) : row?.[rowKey]) : defaultRowKey(row, globalIdx));
        return (
          <div
            key={keyVal}
            role="row"
            className={`grid w-full bg-white text-sm text-center items-center border-b hover:bg-gray-50 ${rowClassName}`.trim()}
            style={{ gridTemplateColumns: columns.map(c => c.width ? 'auto' : '1fr').join(' ') }}
            onClick={onRowClick ? () => onRowClick(row, globalIdx) : undefined}
          >
            {columns.map((col, ci) => (
              <div
                key={col.key ?? ci}
                role="cell"
                className={`px-3 py-3 ${cellClassName} ${col.cellClassName || ''}`.trim()}
                style={{ width: col.width || 'auto', textAlign: col.align || 'center' }}
              >
                {renderCell(col, row, globalIdx)}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );

  const bodyCards = (
    <div className={gridClassName}>
      {rows.map((row, i) => {
        const globalIdx = (page - 1) * pageSize + i;
        const keyVal = typeof rowKey === 'function' ? rowKey(row, globalIdx) : (typeof rowKey === 'string' ? (row?.get ? row.get(rowKey) : row?.[rowKey]) : defaultRowKey(row, globalIdx));
        return (
          <div key={keyVal} className="w-full">
            {typeof renderCard === 'function' ? renderCard(row, globalIdx) : (
              <div className="border rounded p-4">No renderCard provided</div>
            )}
          </div>
        );
      })}
    </div>
  );

  const pager = (
    <div className="flex justify-center items-center py-4">
      <Pagination page={page} pageCount={pageCount} onChange={onChangePage} maxButtons={maxPageButtons} />
    </div>
  );

  return (
    <div ref={ref} className={`w-full border border-gray-200 rounded ${className}`.trim()} role="table" aria-busy={loading ? 'true' : 'false'}>
      {variant === 'table' && header}
      {loading ? (
        <div className="p-6 text-center text-gray-500">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="p-6 text-center text-gray-500">{empty}</div>
      ) : (
        variant === 'table' ? bodyTable : bodyCards
      )}
      {pageCount > 1 && pager}
    </div>
  );
});

Table.displayName = 'Table';

export default Table;
