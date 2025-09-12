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
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${rotate} ${className}`} aria-hidden>
      <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

const Pagination = ({ page, pageCount, onChange, maxButtons = 10, className = '' }) => {
  const half = Math.floor(maxButtons / 2);
  let start = Math.max(page - half, 1);
  let end = Math.min(start + maxButtons - 1, pageCount);
  if (end - start + 1 < maxButtons) start = Math.max(end - maxButtons + 1, 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return (
    <div className={`inline-flex items-center ${className}`} role="navigation" aria-label="Pagination">
      <button className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-40" onClick={() => onChange(1)} disabled={page === 1} aria-label="First page">
        <Arrow dir="left" /><Arrow dir="left" className="-ml-1" />
      </button>
      <button className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-40" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Previous page">
        <Arrow dir="left" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`mx-1 rounded-full w-8 h-8 text-sm flex items-center justify-center ${p === page ? 'text-blue-600 font-bold bg-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
      <button className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-40" onClick={() => onChange(page + 1)} disabled={page === pageCount} aria-label="Next page">
        <Arrow dir="right" />
      </button>
      <button className="px-2 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-40" onClick={() => onChange(pageCount)} disabled={page === pageCount} aria-label="Last page">
        <Arrow dir="right" /><Arrow dir="right" className="-ml-1" />
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
    <div role="rowgroup" className="w-full">
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
