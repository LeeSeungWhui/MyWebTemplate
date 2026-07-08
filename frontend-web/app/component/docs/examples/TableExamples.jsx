/**
 * 파일명: TableExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-03
 * 설명: EasyTable 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

/**
 * @description 인덱스 기준 권한 라벨을 반환. 입력/출력 계약을 함께 명시
 * @returns {string}
 * @updated 2026-02-27
 */
const roleLabelByIndex = (itemIndex) => {
  if (itemIndex % 3 === 0) return 'Admin';
  if (itemIndex % 3 === 1) return 'Editor';
  return 'Viewer';
};

const tableRowList = [];
for (let itemIndex = 0; itemIndex < 53; itemIndex += 1) {
  tableRowList.push({
    id: itemIndex + 1,
    name: `사용자 ${itemIndex + 1}`,
    email: `user${itemIndex + 1}@example.com`,
    role: roleLabelByIndex(itemIndex)
  });
}

const roleVariantMap = {
  Admin: 'danger',
  Editor: 'primary',
  Viewer: 'neutral',
};

const tableColumnList = [{
  key: 'id',
  header: 'ID',
  width: '80px',
  align: 'center'
}, {
  key: 'name',
  header: '이름',
  align: 'left'
}, {
  key: 'email',
  header: '이메일',
  align: 'left'
}, {
  key: 'role',
  header: '권한',
  width: '120px',
  render: (rowObj) => <Lib.Badge variant={roleVariantMap[rowObj.role] || 'neutral'} pill>{rowObj.role}</Lib.Badge>
}];

const tableStyleColList = [{
  key: 'id',
  header: 'ID',
  width: '80px',
  align: 'center',
  headerClassName: 'rounded-lg bg-slate-100/70 text-slate-700 ring-1 ring-inset ring-slate-300/70',
  cellClassName: 'text-slate-700'
}, {
  key: 'name',
  header: '이름',
  align: 'left',
  headerClassName: 'rounded-lg bg-slate-100/70 text-slate-700 ring-1 ring-inset ring-slate-300/70',
  cellClassName: 'text-slate-900'
}, {
  key: 'email',
  header: '이메일',
  align: 'left',
  headerClassName: 'rounded-lg bg-slate-100/70 text-slate-700 ring-1 ring-inset ring-slate-300/70',
  cellClassName: 'text-slate-600'
}, {
  key: 'role',
  header: '권한',
  width: '120px',
  headerClassName: 'rounded-lg bg-slate-100/70 text-slate-700 ring-1 ring-inset ring-slate-300/70'
}];

/**
 * @description CtrlTableDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const CtrlTableDemo = () => {
  const [pageNo, setPageNo] = useState(2);

  return <Lib.EasyTable data={tableRowList} columns={tableColumnList} page={pageNo} pageSize={5} maxPageButtons={7} onPageChange={nextPage => setPageNo(nextPage)} />;
};

export const basicExampleObj = {
  exampleId: 'basic',
  component: <Lib.EasyTable data={tableRowList} columns={tableColumnList} pageParam="page" persistKey="table-basic" defaultPage={1} pageSize={10} className="shadow-sm" />,
  description: '기본 테이블: URL(page) 동기화 + 세션 보존, 권한 Badge 표시',
  code: `<Lib.EasyTable
  data={tableRowList}
  columns={tableColumnList}
  pageParam="page"
  persistKey="table-basic"
  defaultPage={1}
  pageSize={10}
  className="shadow-sm"
/>`
};

export const controlExampleObj = {
  exampleId: 'controlled',
  component: <CtrlTableDemo />,
  description: '제어형 페이지: page/onPageChange로 바깥에서 관리 (pageSize=5)',
  code: `const [pageNo, setPageNo] = useState(2);

<Lib.EasyTable
  data={tableRowList}
  columns={tableColumnList}
  page={pageNo}
  pageSize={5}
  maxPageButtons={7}
  onPageChange={setPageNo}
/>`
};

export const cardExampleObj = {
  exampleId: 'card',
  component: <Lib.EasyTable variant="card" data={tableRowList} pageSize={8} renderCard={row => <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 transition-shadow hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">#{row.id}</div>
                <div className="mt-1 font-semibold text-slate-900">{row.name}</div>
              </div>
              <Lib.Badge variant={roleVariantMap[row.role] || 'neutral'} pill>{row.role}</Lib.Badge>
            </div>
            <div className="mt-3 truncate text-sm text-slate-600">{row.email}</div>
          </div>} />,
  description: '카드 변형: variant="card" + renderCard로 카드 UI 구성',
  code: `<Lib.EasyTable
  variant="card"
  data={tableRowList}
  pageSize={8}
  renderCard={(row) => (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 transition-shadow hover:-translate-y-0.5 hover:shadow-md">...</div>
  )}
/>`
};

export const styleExampleObj = {
  exampleId: 'style',
  component: <Lib.EasyTable data={tableRowList} columns={tableStyleColList} headerClassName="bg-transparent gap-2" rowClassName="gap-2 !bg-transparent !border-0 hover:!bg-transparent" rowsClassName="mt-2 space-y-2" cellClassName="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200/80" pageSize={6} />,
  description: '커스텀 스타일: 셀 rounded-lg + subtle ring/shadow, 헤더/행 gap으로 물리적 분리된 refined 스타일',
  code: `<Lib.EasyTable
  data={tableRowList}
  columns={tableStyleColList}
  headerClassName="bg-transparent gap-2"
  rowClassName="gap-2 !bg-transparent !border-0 hover:!bg-transparent"
  rowsClassName="mt-2 space-y-2"
  cellClassName="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200/80"
  pageSize={6}
/>`
};

export const emptyExampleObj = {
  exampleId: 'empty',
  component: <Lib.EasyTable data={[]} columns={tableColumnList} empty="표시할 데이터가 없습니다." />,
  description: '빈 상태/메시지 커스터마이즈',
  code: '<Lib.EasyTable data={[]} columns={tableColumnList} empty="표시할 데이터가 없습니다." />'
};
