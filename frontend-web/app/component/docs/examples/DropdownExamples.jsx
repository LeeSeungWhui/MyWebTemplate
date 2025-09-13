/**
 * 파일명: DropdownExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Dropdown 컴포넌트 사용 예제 모음 (EasyList 기반, 내부 선택 상태 관리)
 */
import * as Lib from '@/app/lib';

/**
 * Dropdown 예시 목록을 반환
 * @date 2025-09-13
 */
export const DropdownExamples = () => {
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
  const selectedLabel = () => {
    let label = null;
    if (dataList?.forAll) {
      dataList.forAll((it) => { if (it.selected) label = it.label; });
    } else if (Array.isArray(dataList)) {
      const f = dataList.find((it) => it.selected);
      if (f) label = f.label;
    }
    return label;
  };

  const examples = [
    {
      component: (
        <div className="flex flex-col gap-2 items-start">
          <Lib.Dropdown dataList={dataList} trigger={<span>메뉴 열기</span>} />
          <div className="text-sm text-gray-600">선택: {selectedLabel() ?? '없음'}</div>
        </div>
      ),
      description: 'EasyList 항목으로 구성된 기본 드롭다운',
      code: `const dataList = EasyList([\n  { label: '항목 1', value: 'one' },\n  { label: '항목 2', value: 'two' },\n  { label: '비활성 항목', value: 'disabled', disabled: true },\n]);\n\n// 선택 상태는 dataList.selected에 반영되므로 별도 상태 불필요\n<Dropdown dataList={dataList} trigger={<span>메뉴 열기</span>} />`
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
            dataList={dataListCustom}
            variant="text"
            trigger={({ selectedLabel }) => (
              <span className="inline-flex items-center gap-2 text-blue-700">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="text-blue-700"><circle cx="8" cy="8" r="7" stroke="currentColor" fill="none" /></svg>
                {selectedLabel ?? '카테고리'}
              </span>
            )}
          />
        </div>
      ),
      description: '커스텀 트리거(render-prop) + text variant',
      code: `const dataList = EasyList([\n  { label: '개발', value: 'dev' },\n  { label: '디자인', value: 'design' },\n  { label: '기획', value: 'pm' },\n]);\n<Dropdown dataList={dataList} variant=\"text\"\n  trigger={({ selectedLabel }) => <span>{selectedLabel ?? '카테고리'}</span>} />`
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
