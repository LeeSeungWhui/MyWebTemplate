/**
 * 파일명: EasyTable.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-26
 * 설명: 테이블/카드형 데이터 뷰 컴포넌트 구현
 */
import { forwardRef, useEffect, useMemo, useState } from 'react';
import Pagination from './Pagination';
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko';

const isListLike = (list) => !!list && (typeof list.size === 'function' || Array.isArray(list));
const listSize = (list) => {
  if (Array.isArray(list)) return list.length;
  if (typeof list?.size === 'function') return list.size();
  return 0;
};
const listGet = (list, idx) => {
  if (Array.isArray(list)) return list[idx];
  if (typeof list?.get === 'function') return list.get(idx);
  return undefined;
};
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

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

/**
 * @description 테이블/카드 UI와 페이지네이션을 제공하는 데이터 컴포넌트.
 * @param {Object} props
 * @param {React.Ref<HTMLDivElement>} ref
 * @returns {JSX.Element}
 */
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
    rowsClassName = '', // container for rows (e.g., 'space-y-2')
    preserveRowSpace = true,
    empty = COMMON_COMPONENT_LANG_KO.easyTable.empty,
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
    // status & error
    status,
    errorText,
  },
  ref
) {
  // derive initial page
  const initPage = (typeof pageProp === 'number') ? pageProp : defaultPage;

  const [pageState, setPageState] = useState(initPage);
  const page = typeof pageProp === 'number' ? pageProp : pageState;

  const size = useMemo(() => {
    if (totalProp != null) return totalProp;
    if (isListLike(data)) return listSize(data);
    return 0;
  }, [data, totalProp]);
  const effectivePageSize = Math.max(1, pageSize);
  const pageCount = Math.max(1, Math.ceil(size / effectivePageSize));

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
      const paramValue = sp.get(pageParam);
      const parsedPageFromParam = parseInt(paramValue || '', 10);
      if (!isNaN(parsedPageFromParam) && parsedPageFromParam > 0) {
        fromParam = parsedPageFromParam;
      }
    }
    if (fromParam != null) next = fromParam;
    else if (persistKey) {
      const store = persist === 'local' ? window.localStorage : window.sessionStorage;
      const raw = store.getItem(persistKey);
      if (raw) {
        const parsedPersistedPage = parseInt(raw, 10);
        if (!isNaN(parsedPersistedPage) && parsedPersistedPage > 0) {
          next = parsedPersistedPage;
        }
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
    const start = (page - 1) * effectivePageSize;
    const end = Math.min(start + effectivePageSize, size);
    return { start, end };
  }, [page, effectivePageSize, size]);

  const rows = useMemo(() => {
    const { start, end } = sliceRange;
    if (!isListLike(data)) return [];
    const out = [];
    for (let i = start; i < end; i++) out.push(listGet(data, i));
    return out;
  }, [data, sliceRange]);

  const fillerCount = preserveRowSpace && variant === 'table'
    ? Math.max(0, effectivePageSize - rows.length)
    : 0;

  const normalizeWidth = (width) => {
    if (width == null || width === '') return null;
    if (typeof width === 'number' && Number.isFinite(width)) return `${width}px`;
    if (typeof width === 'string') return width;
    return null;
  };

  const gridTemplateColumns = useMemo(
    () =>
      columns
        .map((col) => normalizeWidth(col.width) || 'minmax(0, 1fr)')
        .join(' '),
    [columns],
  );

  const header = (
    <div role="row" className={`grid w-full bg-[#667586] text-white text-sm font-semibold items-center ${headerClassName}`.trim()} style={{ gridTemplateColumns }}>
      {columns.map((col, i) => (
        <div
          key={col.key ?? i}
          role="columnheader"
          className={`min-w-0 px-3 py-3 ${col.headerClassName || ''}`.trim()}
          style={{ width: col.width || 'auto', textAlign: col.align || 'center' }}
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

  const resolveRowKey = (row, globalIdx) => {
    if (typeof rowKey === 'function') return rowKey(row, globalIdx);
    if (typeof rowKey === 'string') {
      if (row?.get) return row.get(rowKey);
      return row?.[rowKey];
    }
    return defaultRowKey(row, globalIdx);
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
        const globalIdx = (page - 1) * effectivePageSize + i;
        const keyVal = resolveRowKey(row, globalIdx);
        return (
          <div
            key={keyVal}
            role="row"
            className={`grid w-full bg-white text-sm text-center items-center border-b hover:bg-gray-50 ${rowClassName}`.trim()}
            style={{ gridTemplateColumns }}
            onClick={onRowClick ? () => onRowClick(row, globalIdx) : undefined}
          >
            {columns.map((col, ci) => (
              <div
                key={col.key ?? ci}
                role="cell"
                className={`min-w-0 px-3 py-3 ${cellClassName} ${col.cellClassName || ''}`.trim()}
                style={{ width: col.width || 'auto', textAlign: col.align || 'center' }}
              >
                {renderCell(col, row, globalIdx)}
              </div>
            ))}
          </div>
        );
      })}
      {Array.from({ length: fillerCount }).map((unusedItem, fillerIdx) => (
        <div
          key={`filler-${fillerIdx}`}
          role="presentation"
          aria-hidden="true"
          className={`grid w-full text-sm border-b opacity-0 pointer-events-none select-none ${rowClassName}`.trim()}
          style={{ gridTemplateColumns }}
        >
          {columns.map((col, ci) => (
            <div
              key={`filler-cell-${ci}`}
              aria-hidden="true"
              className={`min-w-0 px-3 py-3 ${cellClassName} ${col.cellClassName || ''}`.trim()}
              style={{ width: col.width || 'auto', textAlign: col.align || 'center' }}
            >
              Dummy
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const bodyCards = (
    <div className={gridClassName}>
      {rows.map((row, i) => {
        const globalIdx = (page - 1) * effectivePageSize + i;
        const keyVal = resolveRowKey(row, globalIdx);
        return (
          <div key={keyVal} className="w-full">
            {typeof renderCard === 'function' ? renderCard(row, globalIdx) : (
              <div className="border rounded p-4">{COMMON_COMPONENT_LANG_KO.easyTable.noRenderCardProvided}</div>
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

  const resolveStatus = () => {
    if (status != null) return status;
    if (loading) return 'loading';
    if (rows.length === 0) return 'empty';
    return 'idle';
  };

  const effStatus = resolveStatus();
  const isBusy = effStatus === 'loading';
  const isError = effStatus === 'error';
  const isEmpty = effStatus === 'empty' && !isError && !isBusy;
  const renderStatusPanel = () => {
    if (isBusy) {
      return (
        <div className="p-6 text-center text-gray-500" role="status" aria-live="polite">
          Loading...
        </div>
      );
    }
    if (isError) {
      return (
        <div className="p-6 text-center text-red-600" role="alert">
          {errorText || 'Error'}
        </div>
      );
    }
    if (isEmpty) {
      return <div className="p-6 text-center text-gray-500">{empty}</div>;
    }
    return null;
  };
  const statusPanel = renderStatusPanel();

  return (
    <div ref={ref} className={`w-full border border-gray-200 rounded ${className}`.trim()} role="table" aria-busy={isBusy ? 'true' : undefined}>
      {variant === 'table' ? (
        <div className="w-full overflow-x-auto">
          <div className="min-w-max">
            {header}
            {statusPanel || bodyTable}
          </div>
        </div>
      ) : (
        statusPanel || bodyCards
      )}
      {pageCount > 1 && !isBusy && !isError && pager}
    </div>
  );
});

EasyTable.displayName = 'EasyTable';

/**
 * @description EasyTable 컴포넌트 엔트리를 export 한다.
 */
export default EasyTable;
