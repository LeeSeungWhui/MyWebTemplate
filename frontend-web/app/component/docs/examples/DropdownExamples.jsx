/**
 * 파일명: DropdownExamples.jsx
 * 설명: Dropdown 컴포넌트 사용 예제 모음 (EasyList 기반, 내부 선택 상태 관리)
 */
import * as Lib from '@/lib';

export const DropdownExamples = () => {
  const dataList = Lib.EasyList([
    { label: '항목 1', value: 'one' },
    { label: '항목 2', value: 'two' },
    { label: '비활성 항목', value: 'disabled', disabled: true },
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
  ];

  return examples;
};
