/**
 * 파일명: EasyTable.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-26
 * 설명: 테이블/카드형 데이터 뷰 컴포넌트 구현
 */
import { forwardRef, useEffect, useMemo, useState } from 'react';
import Pagination from './Pagination';
import { COMMON_COMPONENT_LANG_KO } from '@/app/common/i18n/lang.ko';

/**
 * @description 입력 데이터가 배열 또는 EasyList 형태인지 판별
 * 처리 규칙: `Array.isArray` 또는 `size()` 메서드 보유 여부로 list-like 타입을 판정한다.
 * @updated 2026-02-27
 */
const isListLike = (list) => !!list && (typeof list.size === 'function' || Array.isArray(list));

/**
 * @description list-like 데이터에서 전체 길이를 구하는 크기 조회 유틸.
 * 처리 규칙: 배열은 length, EasyList는 size() 결과를 사용하고 그 외 값은 0으로 처리한다.
 * @updated 2026-02-27
 */
const listSize = (list) => {
  if (Array.isArray(list)) return list.length;
  if (typeof list?.size === 'function') return list.size();
  return 0;
};

/**
 * @description list-like 데이터에서 인덱스 항목을 읽어오는 접근 유틸.
 * 처리 규칙: 배열은 인덱스 접근, EasyList는 get(idx)를 호출하고 미지원 타입은 undefined를 반환한다.
 * @updated 2026-02-27
 */
const listGet = (list, idx) => {
  if (Array.isArray(list)) return list[idx];
  if (typeof list?.get === 'function') return list.get(idx);
  return undefined;
};

/**
 * @description 기본 행 키(rowKey) 우선순위 규칙을 적용하는 키 해석 유틸.
 * 처리 규칙: row.id/row.key 우선, 없으면 행 인덱스를 fallback key로 사용한다.
 * @updated 2026-02-27
 */
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

/**
 * @description 숫자 값을 지정 범위로 제한
 * 처리 규칙: value를 min/max 경계 안으로 잘라낸 값을 반환한다.
 * @updated 2026-02-27
 */
const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

/**
 * @description 테이블/카드 UI와 페이지네이션을 제공하는 데이터 렌더링 컴포넌트다.
 * 처리 규칙: variant/status/page 관련 props 조합으로 table/card/status 패널/페이지네이션 노출을 제어한다.
 * @param {Object} props
 * @param {React.Ref<HTMLDivElement>} ref
 * @returns {JSX.Element}
 */
const EasyTable = forwardRef(function EasyTable(
  {
    // 데이터/컬럼 설정
    data = [],
    columns = [], // 컬럼 스펙 목록
    rowKey = defaultRowKey,
    // 레이아웃 설정
    className = '',
    headerClassName = '',
    rowClassName = '',
    cellClassName = '',
    rowsClassName = '', // 행 래퍼 클래스(예: 'space-y-2')
    preserveRowSpace = true,
    empty = COMMON_COMPONENT_LANG_KO.easyTable.empty,
    loading = false,
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
    gridClassName = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
    // 상태/오류 처리
    status,
    errorText,
  },

  ref
) {
  // 초기 페이지 계산
  const initPage = (typeof pageProp === 'number') ? pageProp : defaultPage;

  const [pageState, setPageState] = useState(initPage);
  const page = typeof pageProp === 'number' ? pageProp : pageState;

  const size = totalProp != null
    ? totalProp
    : isListLike(data)
      ? listSize(data)
      : 0;
  const effectivePageSize = Math.max(1, pageSize);
  const pageCount = Math.max(1, Math.ceil(size / effectivePageSize));

  // 데이터 길이 변경 시 페이지 범위 보정(uncontrolled 모드)
  useEffect(() => {
    if (typeof pageProp === 'number') return;
    if (page > pageCount) setPageState(pageCount);
  }, [pageCount]);

  // hydration 이후 URL/스토리지 값으로 초기화해 SSR 불일치 방지(uncontrolled 모드)
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

  // 페이지 상태를 저장소/URL에 동기화(uncontrolled 모드)
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

  const rows = [];
  if (isListLike(data)) {
    const { start, end } = sliceRange;
    for (let i = start; i < end; i += 1) {
      rows.push(listGet(data, i));
    }
  }

  const fillerCount = preserveRowSpace && variant === 'table'
    ? Math.max(0, effectivePageSize - rows.length)
    : 0;

  /**
   * @description 컬럼 width 입력을 CSS width 문자열로 정규화하는 보정 유틸.
   * 처리 규칙: number는 px 문자열로 변환하고, null/빈값은 null을 반환한다.
   * @updated 2026-02-27
   */
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

  /**
   * @description 표 헤더 row JSX를 렌더링하는 내부 함수.
   * 처리 규칙: columns 정의를 순회해 columnheader 셀과 gridTemplateColumns를 일관되게 적용한다.
   * @updated 2026-02-28
   */
  function renderHeader() {
    return (
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
  }

  /**
   * @description 단일 셀에 표시할 값을 결정하는 셀 해석 유틸.
   * 처리 규칙: col.render 우선, 없으면 col.key 기반으로 row/get 조회를 수행한다.
   * @updated 2026-02-27
   */
  const renderCell = (col, row, rowIdx) => {
    if (typeof col.render === 'function') return col.render(row, rowIdx);
    if (col.key == null) return null;
    if (row && typeof row.get === 'function') return row.get(col.key);
    return row?.[col.key];
  };

  /**
   * @description 최종 row key 값을 결정
   * 처리 규칙: 함수형 rowKey > 문자열 rowKey > defaultRowKey 순서로 우선순위를 적용한다.
   * @updated 2026-02-27
   */
  const resolveRowKey = (row, globalIdx) => {
    if (typeof rowKey === 'function') return rowKey(row, globalIdx);
    if (typeof rowKey === 'string') {
      if (row?.get) return row.get(rowKey);
      return row?.[rowKey];
    }
    return defaultRowKey(row, globalIdx);
  };

  /**
   * @description 페이지 변경 이벤트를 다룬다.
   * 처리 규칙: 목표 페이지를 clamp한 뒤 controlled 모드는 onPageChange 위임, uncontrolled 모드는 내부 state를 갱신한다.
   * @updated 2026-02-27
   */
  const onChangePage = (next) => {
    const target = clamp(next, 1, pageCount);
    if (typeof pageProp === 'number') {
      // controlled 모드: 상위 onPageChange에 위임
      onPageChange?.(target);
    } else {
      setPageState(target);
    }
  };

  /**
   * @description 테이블 행 목록(rowgroup) JSX를 렌더링하는 내부 함수.
   * 처리 규칙: 현재 페이지 rows와 fillerCount를 기반으로 행/더미행을 같은 grid 스키마로 렌더링한다.
   * @updated 2026-02-28
   */
  function renderBodyTable() {
    return (
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
  }

  /**
   * @description 카드 변형(variant=card)용 row 목록 JSX를 렌더링하는 내부 함수.
   * 처리 규칙: renderCard 제공 시 해당 렌더러를 사용하고, 없으면 기본 안내 카드를 표시한다.
   * @updated 2026-02-28
   */
  function renderBodyCards() {
    return (
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
  }

  const pager = (
    <div className="flex justify-center items-center py-4">
      <Pagination page={page} pageCount={pageCount} onChange={onChangePage} maxButtons={maxPageButtons} />
    </div>
  );

  /**
   * @description 현재 화면 표시 상태(loading/error/empty/idle) 판정 로직.
   * 처리 규칙: status prop이 있으면 우선 사용하고, 없으면 loading/rows 길이 기준으로 상태를 추론한다.
   * @updated 2026-02-27
   */
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

  /**
   * @description 상태별 안내 패널(loading/error/empty) 렌더러.
   * 처리 규칙: 상태에 맞는 접근성 role과 메시지를 반환하고, idle 상태에서는 null을 반환한다.
   * @updated 2026-02-27
   */
  const renderStatusPanel = () => {
    if (isBusy) {
      return (
        <div className="p-6 text-center text-gray-500" role="status" aria-live="polite">
          {COMMON_COMPONENT_LANG_KO.easyTable.loading}
        </div>
      );
    }
    if (isError) {
      return (
        <div className="p-6 text-center text-red-600" role="alert">
          {errorText || COMMON_COMPONENT_LANG_KO.easyTable.error}
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
            {renderHeader()}
            {statusPanel || renderBodyTable()}
          </div>
        </div>
      ) : (
        statusPanel || renderBodyCards()
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
