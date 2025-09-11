/**
 * 파일명: TableExamples.jsx
 * 설명: Table 컴포넌트 사용 예제 모음
 */
import * as Lib from '@/lib';
import { useMemo, useState } from 'react';

export const TableExamples = () => {
  // 샘플 데이터 (배열 기반)
  const data = useMemo(() => (
    Array.from({ length: 53 }, (_, i) => ({
      id: i + 1,
      name: `사용자 ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 3 === 0 ? 'Admin' : i % 3 === 1 ? 'Editor' : 'Viewer',
    }))
  ), []);

  const columns = [
    { key: 'id', header: 'ID', width: '80px', align: 'center' },
    { key: 'name', header: '이름', align: 'left' },
    { key: 'email', header: '이메일', align: 'left' },
    { key: 'role', header: '권한', width: '120px' },
  ];

  // 제어형 페이지 예제
  const [page, setPage] = useState(2);

  const examples = [
    {
      component: (
        <Lib.Table
          data={data}
          columns={columns}
          pageParam="page"
          persistKey="table-basic"
          defaultPage={1}
          pageSize={10}
        />
      ),
      description: '기본 테이블: URL(page) 동기화 + 세션 보존, 페이지당 10개',
      code: `<Lib.Table data={data} columns={columns} pageParam="page" persistKey="table-basic" defaultPage={1} pageSize={10} />`
    },
    {
      component: (
        <Lib.Table
          data={data}
          columns={columns}
          page={page}
          pageSize={5}
          maxPageButtons={7}
          // onPageChange는 제어형에서 상위로 전달
          // @ts-ignore
          onPageChange={(p) => setPage(p)}
        />
      ),
      description: '제어형 페이지: page/onPageChange로 바깥에서 관리 (pageSize=5)',
      code: `<Lib.Table data={data} columns={columns} page={page} pageSize={5} maxPageButtons={7} onPageChange={setPage} />`
    },
    {
      component: (
        <Lib.Table
          variant="card"
          data={data}
          pageSize={8}
          renderCard={(row) => (
            <div className="border rounded p-4 bg-white hover:shadow">
              <div className="text-sm text-gray-500">#{row.id}</div>
              <div className="font-medium">{row.name}</div>
              <div className="text-gray-600">{row.email}</div>
              <div className="mt-1 text-xs text-gray-500">{row.role}</div>
            </div>
          )}
        />
      ),
      description: '카드 변형: variant="card" + renderCard로 카드 UI 구성',
      code: `<Lib.Table variant="card" data={data} pageSize={8} renderCard={(row) => (<div className="border rounded p-4">...</div>)} />`
    },
    {
      component: (
        <Lib.Table
          data={[]}
          columns={columns}
          empty="표시할 데이터가 없습니다."
        />
      ),
      description: '빈 상태/메시지 커스터마이즈',
      code: `<Lib.Table data={[]} columns={columns} empty="표시할 데이터가 없습니다." />`
    },
  ];

  return examples;
};

