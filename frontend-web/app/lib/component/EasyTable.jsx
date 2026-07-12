/**
 * 파일명: EasyTable.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-11
 * 설명: 테이블/카드형 데이터 뷰 컴포넌트 구현
 */
import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import Pagination from './Pagination';
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko';

const columnWidthClassMap = {
  '70px': 'w-[70px] flex-none',
  '80px': 'w-[80px] flex-none',
  '90px': 'w-[90px] flex-none',
  '100px': 'w-[100px] flex-none',
  '120px': 'w-[120px] flex-none',
  '130px': 'w-[130px] flex-none',
  '140px': 'w-[140px] flex-none',
  '180px': 'w-[180px] flex-none',
  '2fr': 'flex-[2_2_0%] min-w-0',
  auto: 'flex-1 min-w-0',
};
const alignTextObj = {
  center: 'text-center',
  left: 'text-left',
  right: 'text-right',
};
const cardGridClassMap = {
  1: 'grid grid-cols-1 gap-4',
  2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
  5: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4',
  6: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4',
};

const normalizePaginationQuantity = (paginationQuantity, defaultPaginationQuantity = 1) => {
  const numericPaginationQuantity = Number(paginationQuantity);
  if (!Number.isFinite(numericPaginationQuantity)) return defaultPaginationQuantity;
  return Math.max(1, Math.trunc(numericPaginationQuantity));
};

/**
 * @description 테이블/카드 UI와 페이지네이션을 제공하는 데이터 렌더링 컴포넌트.
 * 처리 규칙: variant/status/page 관련 props 조합으로 table/card/status 패널/페이지네이션 노출을 제어한다.
 * @param {Object} props
 * @param {React.Ref<HTMLDivElement>} ref
 * @returns {JSX.Element}
 */
const EasyTable = forwardRef(function EasyTable(
  {

    // 데이터/컬럼 설정
    dataList,
    data = [],
    columns = [], // 컬럼 스펙 목록
    rowKey = null,

    // 레이아웃 설정
    className = '',
    headerClassName = '',
    rowClassName = '',
    cellClassName = '',
    rowsClassName = '', // 행 래퍼 클래스(예: 'space-y-2')
    preserveRowSpace = true,
    empty = COMMON_COMPONENT_LANG_KO.easyTable.empty,
    loading = false,
    mobileScrollHint = '',

    // 상호작용 핸들러
    onRowClick,

    // 페이지네이션 옵션
    page: pageProp,
    defaultPage = 1,
    pageSize = 10,
    maxPageButtons = 10,
    total: totalProp, // 서버 페이지네이션 총 개수
    pageParam, // URL 동기화용 파라미터명(예: 'page')
    persistKey, // 스토리지 키(session/local)
    persist = 'session', // 저장소 타입: 'session' | 'local'
    onPageChange,

    // 렌더링 변형
    variant = 'table', // 지원 타입: 'table' | 'card'

    // 카드 모드 전용 옵션
    renderCard,
    cardsPerRow = 4,
    gridClassName,

    // 상태/오류 처리
    status,
    errorText,
  },

  ref
) {

  const mobileScrollHintId = useId();
  const hasMobileScrollHint = variant === 'table' && Boolean(String(mobileScrollHint || '').trim());
  const parsedCardsPerRow = Math.trunc(Number(cardsPerRow));
  const normalizedCardsPerRow = parsedCardsPerRow >= 1 && parsedCardsPerRow <= 6
    ? parsedCardsPerRow
    : 4;
  const resolvedGridClassName = typeof gridClassName === 'string'
    ? gridClassName
    : cardGridClassMap[normalizedCardsPerRow];

  // 초기 페이지 계산
  const normalizedDefaultPage = normalizePaginationQuantity(defaultPage);
  const initialPage = normalizePaginationQuantity(
    (typeof pageProp === 'number') ? pageProp : normalizedDefaultPage,
    normalizedDefaultPage,
  );

  const [pageState, setPageState] = useState(initialPage);
  const pageSource = typeof pageProp === 'number' ? pageProp : pageState;
  const hasCompletedInitialPageSyncRef = useRef(false);
  const lastSynchronizedPageRef = useRef(initialPage);

  const resolvedListSource = dataList ?? data;
  const hasDataListShape = Boolean(resolvedListSource) && (Array.isArray(resolvedListSource) || typeof resolvedListSource.size === 'function');
  let sourceRowCount = 0;
  if (Array.isArray(resolvedListSource)) sourceRowCount = resolvedListSource.length;
  else if (typeof resolvedListSource?.size === 'function') sourceRowCount = resolvedListSource.size();
  const hasServerTotal = totalProp != null;
  let totalRowCount = 0;
  if (hasServerTotal) {
    const parsedTotalRowCount = Number(totalProp);
    totalRowCount = Number.isFinite(parsedTotalRowCount)
      ? Math.max(0, Math.trunc(parsedTotalRowCount))
      : 0;
  }
  else totalRowCount = sourceRowCount;
  const effectivePageSize = normalizePaginationQuantity(pageSize, 10);
  const pageCount = Math.max(1, Math.ceil(totalRowCount / effectivePageSize));
  const page = Math.min(normalizePaginationQuantity(pageSource), pageCount);

  /**
   * @description 비제어 모드에서 pageCount 축소 시 현재 page 상한 보정
   * 처리 규칙: pageProp이 없고 page>pageCount이면 setPageState(pageCount)를 호출한다.
   */
  useEffect(() => {
    if (typeof pageProp === 'number') return;
    if (pageState !== page) setPageState(page);
  }, [page, pageState, pageProp]);

  /**
   * @description hydration 후 URL query·persistKey에서 초기 page 복원
   * 처리 규칙: 비제어 모드에서만 pageParam/persistKey 우선순위로 setPageState한다.
   */
  useEffect(() => {
    if (typeof pageProp === 'number') return;
    if (typeof window === 'undefined') return;
    let nextPage = normalizedDefaultPage;
    let pageFromParam = null;
    if (pageParam) {
      const pageSearchParams = new URLSearchParams(window.location.search);
      const paramValue = pageSearchParams.get(pageParam);
      const parsedPageFromParam = parseInt(paramValue || '', 10);
      if (!isNaN(parsedPageFromParam) && parsedPageFromParam > 0) {
        pageFromParam = parsedPageFromParam;
      }
    }
    if (pageFromParam != null) nextPage = pageFromParam;
    else if (persistKey) {
      const persistStorageObj = persist === 'local' ? window.localStorage : window.sessionStorage;
      const persistedPageText = persistStorageObj.getItem(persistKey);
      if (persistedPageText) {
        const parsedPersistedPage = parseInt(persistedPageText, 10);
        if (!isNaN(parsedPersistedPage) && parsedPersistedPage > 0) {
          nextPage = parsedPersistedPage;
        }
      }
    }
    const normalizedNextPage = normalizePaginationQuantity(nextPage, normalizedDefaultPage);
    setPageState((prevPage) => (prevPage === normalizedNextPage ? prevPage : normalizedNextPage));
  }, [pageProp, pageParam, persistKey, persist, normalizedDefaultPage]);

  /**
   * @description 비제어 page 변경을 persistKey·pageParam URL에 동기화
   * 처리 규칙: pageProp이 없을 때 storage setItem과 history.replaceState를 수행한다.
   */
  useEffect(() => {
    if (typeof pageProp === 'number') return;
    if (!hasCompletedInitialPageSyncRef.current) {
      hasCompletedInitialPageSyncRef.current = true;
      lastSynchronizedPageRef.current = page;
      return;
    }
    if (lastSynchronizedPageRef.current === page) return;
    lastSynchronizedPageRef.current = page;
    if (persistKey && typeof window !== 'undefined') {
      const persistStorageObj = persist === 'local' ? window.localStorage : window.sessionStorage;
      persistStorageObj.setItem(persistKey, String(page));
    }
    if (pageParam && typeof window !== 'undefined') {
      const pageUrlObj = new URL(window.location.href);
      if (page === normalizedDefaultPage) pageUrlObj.searchParams.delete(pageParam);
      else pageUrlObj.searchParams.set(pageParam, String(page));
      window.history.replaceState(null, '', pageUrlObj.toString());
    }
  }, [page, pageProp, persistKey, persist, pageParam, normalizedDefaultPage]);

  const sliceStart = hasServerTotal ? 0 : (page - 1) * effectivePageSize;
  const sliceEnd = Math.min(sliceStart + effectivePageSize, sourceRowCount);

  const rowList = [];
  if (hasDataListShape) {
    for (let sourceRowIndex = sliceStart; sourceRowIndex < sliceEnd; sourceRowIndex += 1) {
      let sourceRowObj;
      if (Array.isArray(resolvedListSource)) sourceRowObj = resolvedListSource[sourceRowIndex];
      else if (typeof resolvedListSource?.get === 'function') sourceRowObj = resolvedListSource.get(sourceRowIndex);
      rowList.push(sourceRowObj);
    }
  }

  const fillerCount = preserveRowSpace && variant === 'table'
    ? Math.max(0, effectivePageSize - rowList.length)
    : 0;
  const fillerIndexList = [];
  for (let fillerIndex = 0; fillerIndex < fillerCount; fillerIndex += 1) {
    fillerIndexList.push(fillerIndex);
  }
  const tableColumnList = columns.map((columnObj, columnIndex) => {
    const columnWidthKey = typeof columnObj.width === 'number'
      ? `${Math.floor(columnObj.width)}px`
      : String(columnObj.width || '').trim().toLowerCase();
    const columnClassName = columnWidthClassMap[columnWidthKey] || columnWidthClassMap.auto;
    const columnAlignKey = typeof columnObj.align === 'string' ? columnObj.align.toLowerCase() : 'center';
    const alignClassName = alignTextObj[columnAlignKey] || alignTextObj.center;
    return {
      alignClassName,
      columnClassName,
      columnIndex,
      columnObj,
    };
  });

  /**
   * @description 단일 셀에 표시할 값을 결정하는 셀 해석 유틸.
   * 처리 규칙: columnObj.render 우선, 없으면 columnObj.key 기반으로 rowObj/get 조회를 수행한다.
   * @updated 2026-02-27
   */
  const renderCell = (columnObj, rowObj, rowIndex) => {
    if (typeof columnObj.render === 'function') return columnObj.render(rowObj, rowIndex);
    if (columnObj.key == null) return null;
    if (rowObj && typeof rowObj.get === 'function') return rowObj.get(columnObj.key);
    return rowObj?.[columnObj.key];
  };

  /**
   * @description 최종 row key 값을 결정
   * 처리 규칙: 함수형 rowKey > 문자열 rowKey > row.id/key fallback 순서로 우선순위를 적용한다.
   * @updated 2026-02-27
   */
  const resolveRowKey = (rowObj, globalIndex) => {
    if (typeof rowKey === 'function') return rowKey(rowObj, globalIndex);
    if (typeof rowKey === 'string') {
      if (rowObj?.get) return rowObj.get(rowKey);
      return rowObj?.[rowKey];
    }
    if (rowObj && typeof rowObj === 'object') {
      if (typeof rowObj.get === 'function') {
        if (rowObj.get('id') != null) return rowObj.get('id');
        if (rowObj.get('key') != null) return rowObj.get('key');
      } else {
        if (rowObj.id != null) return rowObj.id;
        if (rowObj.key != null) return rowObj.key;
      }
    }
    return globalIndex;
  };

  /**
   * @description 페이지 변경 이벤트 처리.
   * 처리 규칙: 목표 페이지를 min/max로 보정한 뒤 controlled 모드는 onPageChange 위임, uncontrolled 모드는 내부 state를 갱신한다.
   * @updated 2026-02-27
   */
  const onChangePage = (nextPage) => {
    const parsedNextPage = Number(nextPage);
    const finiteNextPage = Number.isFinite(parsedNextPage) ? Math.trunc(parsedNextPage) : page;
    const targetPage = Math.max(1, Math.min(finiteNextPage, pageCount));
    if (typeof pageProp === 'number') {

      // controlled 모드: 상위 onPageChange에 위임
      onPageChange?.(targetPage);
    } else {
      setPageState(targetPage);
    }
  };

  /**
   * @description 테이블 행 목록(rowgroup) JSX 블록 구성
   * 처리 규칙: 현재 페이지 rows와 fillerCount를 기반으로 행/더미행을 같은 grid 스키마로 렌더링한다.
   * @updated 2026-05-01
   */
  const bodyTable = (
    <div role="rowgroup" className={`w-full ${rowsClassName}`.trim()}>
      {rowList.map((rowObj, rowIndex) => {
        const globalIndex = (page - 1) * effectivePageSize + rowIndex;
        const rowKeyValue = resolveRowKey(rowObj, globalIndex);
        return (
          <div
            key={rowKeyValue}
            role="row"
            tabIndex={onRowClick ? 0 : undefined}
            className={`flex w-full items-center border-b border-slate-200/70 bg-white text-sm text-slate-700 transition-colors hover:bg-slate-100/50 ${rowClassName}`.trim()}
            onClick={onRowClick ? () => onRowClick(rowObj, globalIndex) : undefined}
            onKeyDown={onRowClick ? (event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              onRowClick(rowObj, globalIndex);
            } : undefined}
          >
            {tableColumnList.map((columnMetaObj) => (
              <div
                key={columnMetaObj.columnObj.key ?? columnMetaObj.columnIndex}
                role="cell"
                className={`min-w-0 px-3 py-3 ${columnMetaObj.columnClassName} ${columnMetaObj.alignClassName} ${cellClassName} ${columnMetaObj.columnObj.cellClassName || ''}`.trim()}
              >
                {renderCell(columnMetaObj.columnObj, rowObj, globalIndex)}
              </div>
            ))}
          </div>
        );
      })}

      {fillerIndexList.map((fillerIndex) => (
        <div
          key={`filler-${fillerIndex}`}
          role="presentation"
          aria-hidden="true"
          className={`flex w-full border-b border-slate-200/70 text-sm opacity-0 pointer-events-none select-none ${rowClassName}`.trim()}
        >
          {tableColumnList.map((columnMetaObj) => (
            <div
              key={`filler-cell-${columnMetaObj.columnIndex}`}
              aria-hidden="true"
              className={`min-w-0 px-3 py-3 ${columnMetaObj.columnClassName} ${columnMetaObj.alignClassName} ${cellClassName} ${columnMetaObj.columnObj.cellClassName || ''}`.trim()}
            >
              Dummy
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const pager = (
    <div className="flex items-center justify-center border-t border-slate-200/70 bg-white py-4">
      <Pagination page={page} pageCount={pageCount} onChange={onChangePage} maxButtons={maxPageButtons} />
    </div>
  );

  let effectiveStatus = status;
  if (effectiveStatus == null) {
    if (loading) effectiveStatus = 'loading';
    else if (rowList.length === 0) effectiveStatus = 'empty';
    else effectiveStatus = 'idle';
  }
  const isBusy = effectiveStatus === 'loading';
  const isError = effectiveStatus === 'error';
  const isEmpty = effectiveStatus === 'empty' && !isError && !isBusy;

  /**
   * @description loading/error/empty 상태별 안내 패널 JSX 블록 구성
   * 반환값: 현재 상태에 맞는 안내 패널 JSX 또는 null.
   * @updated 2026-04-22
   */
  let statusPanel = null;
  if (isBusy) {
    statusPanel = (
      <div className="p-6 text-center text-slate-600" role="status" aria-live="polite">
        {COMMON_COMPONENT_LANG_KO.easyTable.loading}
      </div>
    );
  } else if (isError) {
    statusPanel = (
      <div className="p-6 text-center text-rose-600" role="alert">
        {errorText || COMMON_COMPONENT_LANG_KO.easyTable.error}
      </div>
    );
  } else if (isEmpty) {
    statusPanel = <div className="p-6 text-center text-slate-600">{empty}</div>;
  }

  return (
    <div ref={ref} className={`w-full overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80 ${className}`.trim()} role={variant === 'table' ? 'table' : undefined} aria-busy={isBusy ? 'true' : undefined}>
      {variant === 'table' ? (
        <>
          {hasMobileScrollHint ? (
            <p id={mobileScrollHintId} className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 sm:hidden">
              {mobileScrollHint}
            </p>
          ) : null}
          <div
            className="w-full overflow-x-auto"
            tabIndex={hasMobileScrollHint ? 0 : undefined}
            aria-describedby={hasMobileScrollHint ? mobileScrollHintId : undefined}
            aria-label={hasMobileScrollHint ? mobileScrollHint : undefined}
          >
            <div className="min-w-max">
              <div role="row" className={`flex w-full items-center border-b border-slate-200 bg-slate-100/70 text-xs font-semibold uppercase tracking-wider text-slate-600 ${headerClassName}`.trim()}>
                {tableColumnList.map((columnMetaObj) => (
                  <div
                    key={columnMetaObj.columnObj.key ?? columnMetaObj.columnIndex}
                    role="columnheader"
                    className={`min-w-0 px-3 py-3 ${columnMetaObj.columnClassName} ${columnMetaObj.alignClassName} ${columnMetaObj.columnObj.headerClassName || ''}`.trim()}
                  >
                    {typeof columnMetaObj.columnObj.header === 'function' ? columnMetaObj.columnObj.header() : columnMetaObj.columnObj.header}
                  </div>
                ))}
              </div>
              {statusPanel || bodyTable}
            </div>
          </div>
        </>
      ) : (
        statusPanel || (
          <div className={resolvedGridClassName} role="list">
            {rowList.map((rowObj, rowIndex) => (
              <div key={resolveRowKey(rowObj, (page - 1) * effectivePageSize + rowIndex)} className="w-full" role="listitem">
                {typeof renderCard === 'function'
                  ? renderCard(rowObj, (page - 1) * effectivePageSize + rowIndex)
                  : <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200/80">{COMMON_COMPONENT_LANG_KO.easyTable.noRenderCardProvided}</div>}
              </div>
            ))}
          </div>
        )
      )}
      {pageCount > 1 && !isBusy && !isError && pager}
    </div>
  );
});

EasyTable.displayName = 'EasyTable';

/**
 * @description EasyTable 컴포넌트 엔트리를 외부에 노출
 * 처리 규칙: forwardRef로 생성된 EasyTable 인스턴스를 default export 한다.
 */
export default EasyTable;
