/**
 * 파일명: PaginationExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Pagination 컴포넌트 사용 예제 모음
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

/**
 * @description BasicPageDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const BasicPageDemo = () => {
  const [pageNo, setPageNo] = useState(2);

  return <div className="w-full rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">사용자 목록</div>
          <div className="text-sm text-slate-500">총 120건 중 현재 페이지를 제어합니다.</div>
        </div>
        <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100" aria-live="polite">Page {pageNo} / 12</div>
      </div>
      <Lib.Pagination page={pageNo} pageCount={12} onChange={setPageNo} className="rounded-full bg-slate-50 px-2 py-1 ring-1 ring-slate-200/80" />
    </div>;
};

/**
 * @description LimitPageDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const LimitPageDemo = () => {
  const [pageNo, setPageNo] = useState(5);

  return <div className="w-full rounded-xl bg-slate-950 p-4 text-white shadow-sm ring-1 ring-slate-800">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-white">대용량 로그</div>
          <div className="text-sm text-slate-400">번호 버튼을 5개로 제한하고 처음/끝 이동을 유지합니다.</div>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100 ring-1 ring-white/10" aria-live="polite">Page {pageNo} / 50</div>
      </div>
      <Lib.Pagination page={pageNo} pageCount={50} maxButtons={5} onChange={setPageNo} className="rounded-full bg-white px-2 py-1 shadow-sm" />
    </div>;
};

/**
 * @description Pagination 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 단건 섹션은 ExampleObj로 노출하고 상태는 demo 컴포넌트 안에만 둔다.
 */
export const basicExampleObj = {
  exampleId: 'basic',
  component: <BasicPageDemo />,
  description: '기본 제어형 페이지네이션: page/onChange + 현재 페이지 상태 표시',
  code: `const [pageNo, setPageNo] = useState(2);

<Lib.Pagination
  page={pageNo}
  pageCount={12}
  onChange={setPageNo}
  className="rounded-full bg-slate-50 px-2 py-1 ring-1 ring-slate-200/80"
/>`
};

export const limitExampleObj = {
  exampleId: 'limit',
  component: <LimitPageDemo />,
  description: '버튼 수 제한(maxButtons=5) 대용량 페이지 + edge 이동 유지',
  code: `const [pageNo, setPageNo] = useState(5);

<Lib.Pagination
  page={pageNo}
  pageCount={50}
  maxButtons={5}
  onChange={setPageNo}
  className="rounded-full bg-white px-2 py-1 shadow-sm"
/>`
};
