/**
 * TableExamples.jsx
 * Table 컴포넌트 사용 예제 모음
 */
import * as Lib from '@/lib';
import { useMemo, useState } from 'react';

export const TableExamples = () => {
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

  const styledColumns = [
    { key: 'id', header: 'ID', width: '80px', align: 'center', headerClassName: 'bg-gray-100 rounded-2xl ring-1 ring-gray-200 text-gray-700', cellClassName: 'text-gray-800' },
    { key: 'name', header: '이름', align: 'left', headerClassName: 'bg-gray-100 rounded-2xl ring-1 ring-gray-200 text-gray-700', cellClassName: 'text-gray-900' },
    { key: 'email', header: '이메일', align: 'left', headerClassName: 'bg-gray-100 rounded-2xl ring-1 ring-gray-200 text-gray-700', cellClassName: 'text-gray-700' },
    { key: 'role', header: '권한', width: '120px', headerClassName: 'bg-gray-100 rounded-2xl ring-1 ring-gray-200 text-gray-700' },
  ];

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
      code: `// 데이터와 컬럼 정의
const data = Array.from({ length: 53 }, (_, i) => ({
  id: i + 1,
  name: '사용자 ' + (i + 1),
  email: 'user' + (i + 1) + '@example.com',
  role: i % 3 === 0 ? 'Admin' : i % 3 === 1 ? 'Editor' : 'Viewer',
}));
const columns = [
  { key: 'id', header: 'ID', width: '80px', align: 'center' },
  { key: 'name', header: '이름', align: 'left' },
  { key: 'email', header: '이메일', align: 'left' },
  { key: 'role', header: '권한', width: '120px' },
];

// 사용
<Lib.Table
  data={data}
  columns={columns}
  pageParam="page"
  persistKey="table-basic"
  defaultPage={1}
  pageSize={10}
/>`
    },
    {
      component: (
        <Lib.Table
          data={data}
          columns={columns}
          page={page}
          pageSize={5}
          maxPageButtons={7}
          onPageChange={(p) => setPage(p)}
        />
      ),
      description: '제어형 페이지: page/onPageChange로 바깥에서 관리 (pageSize=5)',
      code: `// 데이터와 컬럼 정의
const data = Array.from({ length: 53 }, (_, i) => ({
  id: i + 1,
  name: '사용자 ' + (i + 1),
  email: 'user' + (i + 1) + '@example.com',
  role: i % 3 === 0 ? 'Admin' : i % 3 === 1 ? 'Editor' : 'Viewer',
}));
const columns = [
  { key: 'id', header: 'ID', width: '80px', align: 'center' },
  { key: 'name', header: '이름', align: 'left' },
  { key: 'email', header: '이메일', align: 'left' },
  { key: 'role', header: '권한', width: '120px' },
];

// 사용 (page 상태는 외부에서 관리)
<Lib.Table
  data={data}
  columns={columns}
  page={page}
  pageSize={5}
  maxPageButtons={7}
  onPageChange={setPage}
/>`
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
      code: `<Lib.Table
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
/>`
    },
    {
      component: (
        <Lib.Table
          data={data}
          columns={styledColumns}
          headerClassName="bg-transparent gap-2"
          rowClassName="gap-2 !bg-transparent !border-0 hover:!bg-transparent"
          rowsClassName="space-y-2"
          cellClassName="bg-white ring-1 ring-gray-200 rounded-2xl shadow-sm p-3"
          pageSize={6}
        />
      ),
      description: '커스텀 스타일: 셀 rounded-2xl + ring, 헤더/행 gap으로 물리적 분리된 모던 스타일',
      code: `// 데이터와 styledColumns 정의
const data = Array.from({ length: 53 }, (_, i) => ({
  id: i + 1,
  name: '사용자 ' + (i + 1),
  email: 'user' + (i + 1) + '@example.com',
  role: i % 3 === 0 ? 'Admin' : i % 3 === 1 ? 'Editor' : 'Viewer',
}));
const styledColumns = [
  { key: 'id', header: 'ID', width: '80px', align: 'center', headerClassName: 'bg-gray-100 rounded-2xl ring-1 ring-gray-200 text-gray-700', cellClassName: 'text-gray-800' },
  { key: 'name', header: '이름', align: 'left', headerClassName: 'bg-gray-100 rounded-2xl ring-1 ring-gray-200 text-gray-700', cellClassName: 'text-gray-900' },
  { key: 'email', header: '이메일', align: 'left', headerClassName: 'bg-gray-100 rounded-2xl ring-1 ring-gray-200 text-gray-700', cellClassName: 'text-gray-700' },
  { key: 'role', header: '권한', width: '120px', headerClassName: 'bg-gray-100 rounded-2xl ring-1 ring-gray-200 text-gray-700' },
];

// 사용
<Lib.Table
  data={data}
  columns={styledColumns}
  headerClassName="bg-transparent gap-2"
  rowClassName="gap-2 !bg-transparent !border-0 hover:!bg-transparent"
  rowsClassName="space-y-2"
  cellClassName="bg-white ring-1 ring-gray-200 rounded-2xl shadow-sm p-3"
  pageSize={6}
/>`
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
      code: `// 컬럼 정의는 동일
const columns = [
  { key: 'id', header: 'ID', width: '80px', align: 'center' },
  { key: 'name', header: '이름', align: 'left' },
  { key: 'email', header: '이메일', align: 'left' },
  { key: 'role', header: '권한', width: '120px' },
];

<Lib.Table data={[]} columns={columns} empty="표시할 데이터가 없습니다." />`
    },
  ];

  return examples;
};
