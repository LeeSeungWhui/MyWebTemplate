/**
 * 파일명: TableExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: EasyTable 컴포넌트 예제
 */
/**
 * 파일명: TableExamples.jsx
 * EasyTable 컴포넌트 사용 예제 모음
 */
import * as Lib from '@/app/lib';
import { useMemo, useState } from 'react';

/**
 * @description  인덱스 기준 권한 라벨을 반환한다. 입력/출력 계약을 함께 명시
 * @returns {"Admin"|"Editor"|"Viewer"}
 * @updated 2026-02-27
 */
const roleLabelByIndex = (index) => {
  if (index % 3 === 0) return 'Admin';
  if (index % 3 === 1) return 'Editor';
  return 'Viewer';
};

/**
 * @description  TableExamples 구성 데이터를 반환한다. 입력/출력 계약을 함께 명시
 * @returns {Array<{ component: JSX.Element, code: string }>}
 * @updated 2026-02-24
 */
export const TableExamples = () => {
  const data = useMemo(() => (
    Array.from({ length: 53 }, (unusedItem, itemIndex) => ({
      id: itemIndex + 1,
      name: `사용자 ${itemIndex + 1}`,
      email: `user${itemIndex + 1}@example.com`,
      role: roleLabelByIndex(itemIndex),
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
        <Lib.EasyTable
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
const data = Array.from({ length: 53 }, (unusedItem, itemIndex) => ({
  id: itemIndex + 1,
  name: '사용자 ' + (itemIndex + 1),
  email: 'user' + (itemIndex + 1) + '@example.com',
  role: roleLabelByIndex(itemIndex),
}));
const columns = [
  { key: 'id', header: 'ID', width: '80px', align: 'center' },
  { key: 'name', header: '이름', align: 'left' },
  { key: 'email', header: '이메일', align: 'left' },
  { key: 'role', header: '권한', width: '120px' },
];

// 사용
<Lib.EasyTable
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
        <Lib.EasyTable
          data={data}
          columns={columns}
          page={page}
          pageSize={5}
          maxPageButtons={7}
          onPageChange={(nextPage) => setPage(nextPage)}
        />
      ),
      description: '제어형 페이지: page/onPageChange로 바깥에서 관리 (pageSize=5)',
      code: `// 데이터와 컬럼 정의
const data = Array.from({ length: 53 }, (unusedItem, itemIndex) => ({
  id: itemIndex + 1,
  name: '사용자 ' + (itemIndex + 1),
  email: 'user' + (itemIndex + 1) + '@example.com',
  role: roleLabelByIndex(itemIndex),
}));
const columns = [
  { key: 'id', header: 'ID', width: '80px', align: 'center' },
  { key: 'name', header: '이름', align: 'left' },
  { key: 'email', header: '이메일', align: 'left' },
  { key: 'role', header: '권한', width: '120px' },
];

// 사용 (page 상태는 외부에서 관리)
<Lib.EasyTable
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
        <Lib.EasyTable
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
      code: `<Lib.EasyTable
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
        <Lib.EasyTable
          data={data}
          columns={styledColumns}
          headerClassName="bg-transparent gap-2"
          rowClassName="gap-2 !bg-transparent !border-0 hover:!bg-transparent"
          rowsClassName="mt-2 space-y-2"
          cellClassName="bg-white ring-1 ring-gray-200 rounded-2xl shadow-sm p-3"
          pageSize={6}
        />
      ),
      description: '커스텀 스타일: 셀 rounded-2xl + ring, 헤더/행 gap으로 물리적 분리된 모던 스타일',
      code: `// 데이터와 styledColumns 정의
const data = Array.from({ length: 53 }, (unusedItem, itemIndex) => ({
  id: itemIndex + 1,
  name: '사용자 ' + (itemIndex + 1),
  email: 'user' + (itemIndex + 1) + '@example.com',
  role: roleLabelByIndex(itemIndex),
}));
const styledColumns = [
  { key: 'id', header: 'ID', width: '80px', align: 'center', headerClassName: 'bg-gray-100 rounded-2xl ring-1 ring-gray-200 text-gray-700', cellClassName: 'text-gray-800' },
  { key: 'name', header: '이름', align: 'left', headerClassName: 'bg-gray-100 rounded-2xl ring-1 ring-gray-200 text-gray-700', cellClassName: 'text-gray-900' },
  { key: 'email', header: '이메일', align: 'left', headerClassName: 'bg-gray-100 rounded-2xl ring-1 ring-gray-200 text-gray-700', cellClassName: 'text-gray-700' },
  { key: 'role', header: '권한', width: '120px', headerClassName: 'bg-gray-100 rounded-2xl ring-1 ring-gray-200 text-gray-700' },
];

// 사용
<Lib.EasyTable
  data={data}
  columns={styledColumns}
  headerClassName="bg-transparent gap-2"
  rowClassName="gap-2 !bg-transparent !border-0 hover:!bg-transparent"
  rowsClassName="mt-2 space-y-2"
  cellClassName="bg-white ring-1 ring-gray-200 rounded-2xl shadow-sm p-3"
  pageSize={6}
/>`
    },
    {
      component: (
        <Lib.EasyTable
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

<Lib.EasyTable data={[]} columns={columns} empty="표시할 데이터가 없습니다." />`
    },
  ];

  return examples;
};
