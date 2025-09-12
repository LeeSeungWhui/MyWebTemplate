/**
 * 파일명: PaginationExamples.jsx
 * 설명: Pagination 컴포넌트 사용 예제 모음
 */
import * as Lib from '@/lib';
import { useState } from 'react';

export const PaginationExamples = () => {
  const [pageA, setPageA] = useState(2);
  const [pageB, setPageB] = useState(5);
  const examples = [
    {
      component: (
        <div className="flex flex-col gap-2 items-start">
          <Lib.Pagination page={pageA} pageCount={12} onChange={setPageA} />
          <div className="text-sm text-gray-600">현재 페이지: {pageA} / 12</div>
        </div>
      ),
      description: '기본 제어형 페이지네이션 (page/onChange)',
      code: `const [page, setPage] = useState(2);\n<Lib.Pagination page={page} pageCount={12} onChange={setPage} />`
    },
    {
      component: (
        <div className="flex flex-col gap-2 items-start">
          <Lib.Pagination page={pageB} pageCount={50} maxButtons={5} onChange={setPageB} />
          <div className="text-sm text-gray-600">현재 페이지: {pageB} / 50</div>
        </div>
      ),
      description: '버튼 수 제한(maxButtons=5) 대용량 페이지',
      code: `const [page, setPage] = useState(5);\n<Lib.Pagination page={page} pageCount={50} maxButtons={5} onChange={setPage} />`
    }
  ];
  return examples;
};

