/**
 * 파일명: DropdownExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Dropdown 컴포넌트 사용 예제 모음 (EasyList 기반, 내부 선택 상태 관리)
 */
import { useState } from 'react';
import * as Lib from '@/app/lib';

/**
 * Dropdown 예시 목록을 반환
 * @date 2025-09-13
 */
export const DropdownExamples = () => {
  const [lastAction, setLastAction] = useState('없음');
  const [sortLabel, setSortLabel] = useState('최신순');

  const dataList = Lib.EasyList([
    { label: '항목 1', value: 'one' },
    { label: '항목 2', value: 'two' },
    { label: '비활성 항목', value: 'disabled', disabled: true },
  ]);
  const dataListFilled = Lib.EasyList([
    { label: '사과', value: 'apple' },
    { label: '바나나', value: 'banana' },
    { label: '체리', value: 'cherry' },
  ]);
  const dataListCustom = Lib.EasyList([
    { label: '개발', value: 'dev' },
    { label: '디자인', value: 'design' },
    { label: '기획', value: 'pm' },
  ]);
  const dataListPlacement = Lib.EasyList([
    { label: 'Top', value: 'top' },
    { label: 'Middle', value: 'mid' },
    { label: 'Bottom', value: 'bot' },
  ]);
  const dataListPreselected = Lib.EasyList([
    { label: '선택 A', value: 'A', selected: true },
    { label: '선택 B', value: 'B' },
    { label: '선택 C', value: 'C' },
  ]);
  const dataListMulti = Lib.EasyList([
    { label: '개발', value: 'dev', selected: true },
    { label: '디자인', value: 'design' },
    { label: '기획', value: 'pm' },
  ]);
  const sortOptions = Lib.EasyList([
    { label: '최신순', value: 'latest', selected: true },
    { label: '오래된순', value: 'oldest' },
    { label: '제목순', value: 'title' },
  ]);

  const examples = [
    {
      component: (
        <div className="flex flex-col gap-2 items-start">
          <Lib.Dropdown
            dataList={dataList}
            trigger={<span>행 액션</span>}
            onSelect={(item) => {
              const label = item?.get ? item.get('label') : item?.label;
              setLastAction(label || '없음');
            }}
          />
          <div className="text-sm text-gray-600">
            마지막 액션: {lastAction}
          </div>
        </div>
      ),
      description: '테이블 행 우측 ⋯ 같은 액션 메뉴 — 선택 시 onSelect로 액션 처리하고 닫힌다.',
      code: `const actions = EasyList([\n  { label: '상세 보기', value: 'view' },\n  { label: '수정', value: 'edit' },\n  { label: '삭제', value: 'delete' },\n]);\n\nconst [lastAction, setLastAction] = useState('없음');\n\n<Dropdown\n  dataList={actions}\n  trigger={<span>행 액션</span>}\n  onSelect={(item) => {\n    const label = item?.label;\n    setLastAction(label || '없음');\n  }}\n/>`
    },
    {
      component: (
        <div className="flex flex-col gap-2 items-start">
          <Lib.Dropdown dataList={dataListFilled} variant="filled" size="lg" elevation="shadow-lg" />
        </div>
      ),
      description: '스타일 변형: filled + lg + shadow-lg',
      code: `const dataList = EasyList([\n  { label: '사과', value: 'apple' },\n  { label: '바나나', value: 'banana' },\n  { label: '체리', value: 'cherry' },\n]);\n<Dropdown dataList={dataList} variant=\"filled\" size=\"lg\" elevation=\"shadow-lg\" />`
    },
    {
      component: (
        <div className="flex flex-col gap-2 items-start">
          <Lib.Dropdown
            dataList={sortOptions}
            placeholder="정렬 기준 선택"
            variant="text"
            trigger={({ selectedLabel }) => (
              <span className="inline-flex items-center gap-2 text-blue-700">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="text-blue-700"><circle cx="8" cy="8" r="7" stroke="currentColor" fill="none" /></svg>
                {selectedLabel ?? '정렬 기준'}
              </span>
            )}
            onSelect={(item) => {
              const label = item?.get ? item.get('label') : item?.label;
              setSortLabel(label || '');
            }}
          />
          <div className="text-sm text-gray-600">
            현재 정렬 기준: {sortLabel}
          </div>
        </div>
      ),
      description: '정렬 기준 선택 드롭다운 — 선택 시 정렬 기준 상태만 바꾸는 필터/정렬 메뉴.',
      code: `const sortOptions = EasyList([\n  { label: '최신순', value: 'latest', selected: true },\n  { label: '오래된순', value: 'oldest' },\n  { label: '제목순', value: 'title' },\n]);\n\nconst [sortLabel, setSortLabel] = useState('최신순');\n\n<Dropdown\n  dataList={sortOptions}\n  variant=\"text\"\n  placeholder=\"정렬 기준 선택\"\n  trigger={({ selectedLabel }) => (\n    <span>{selectedLabel ?? '정렬 기준'}</span>\n  )}\n  onSelect={(item) => {\n    const label = item?.label;\n    setSortLabel(label || '');\n  }}\n/>`
    },
    {
      component: (
        <div className="flex flex-col gap-2 items-start">
          <Lib.Dropdown dataList={dataListPlacement} side="top" align="end" />
        </div>
      ),
      description: '메뉴 위치/정렬: side="top" align="end"',
      code: `const dataList = EasyList([\n  { label: 'Top', value: 'top' },\n  { label: 'Middle', value: 'mid' },\n  { label: 'Bottom', value: 'bot' },\n]);\n<Dropdown dataList={dataList} side=\"top\" align=\"end\" />`
    },
    {
      component: (
        <div className="flex flex-col gap-2 items-start">
          <Lib.Dropdown dataList={dataListPreselected} />
        </div>
      ),
      description: '사전 선택(selected: true) 값 표시',
      code: `const dataList = EasyList([\n  { label: '선택 A', value: 'A', selected: true },\n  { label: '선택 B', value: 'B' },\n  { label: '선택 C', value: 'C' },\n]);\n<Dropdown dataList={dataList} />`
    },
    {
      component: (
        <div className="flex flex-col gap-2 items-start">
          <Lib.Dropdown
            dataList={dataListMulti}
            multiSelect
            placeholder="역할 선택 (다중 선택)"
          />
          <div className="text-sm text-gray-600">
            선택된 항목은 dataListMulti 내부의 <code>selected</code> 플래그로만 관리되고,
            드롭다운은 바깥을 클릭하거나 트리거를 다시 눌러야 닫힌다.
          </div>
        </div>
      ),
      description: 'multiSelect 모드 — 여러 항목을 체크해도 닫히지 않고, selected 플래그만 토글',
      code: `const roles = EasyList([\n  { label: '개발', value: 'dev', selected: true },\n  { label: '디자인', value: 'design' },\n  { label: '기획', value: 'pm' },\n]);\n\n<Dropdown dataList={roles} multiSelect placeholder="역할 선택 (다중 선택)" />`
    },
    {
      component: (
        <div className="flex flex-col gap-2 items-start">
          <Lib.Dropdown
            dataList={dataListCustom}
            variant="outlined"
            rounded="rounded-xl"
            elevation="shadow-lg"
            buttonClassName="!bg-blue-600 !text-white !border-blue-600 hover:!bg-blue-700"
            iconClassName="!text-white"
            menuClassName="ring-1 ring-blue-100 border-blue-100"
            itemClassName="hover:bg-blue-50"
            activeClassName="bg-blue-50"
            selectedItemClassName="text-blue-700 font-semibold"
          />
        </div>
      ),
      description: '커스텀 스타일: 파란 톤 버튼/메뉴 + rounded-xl, 선택 강조',
      code: `<Dropdown dataList={dataList} rounded=\"rounded-xl\" elevation=\"shadow-lg\"
  buttonClassName=\"!bg-blue-600 !text-white !border-blue-600 hover:!bg-blue-700\"
  iconClassName=\"!text-white\"
  menuClassName=\"ring-1 ring-blue-100 border-blue-100\"
  itemClassName=\"hover:bg-blue-50\"
  activeClassName=\"bg-blue-50\"
  selectedItemClassName=\"text-blue-700 font-semibold\" />`
    },
  ];

  return examples;
};
