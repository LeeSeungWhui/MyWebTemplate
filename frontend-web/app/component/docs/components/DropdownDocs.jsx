/**
 * 파일명: DropdownDocs.jsx
 * 설명: Dropdown 문서 (EasyList 기반)
 */
import { useState } from 'react';
import * as Lib from '@/lib';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const DropdownDocs = () => {
  const items = Lib.EasyList([
    { label: '항목 1', value: 'one' },
    { label: '항목 2', value: 'two' },
    { label: '비활성 항목', value: 'disabled', disabled: true },
  ]);
  const [selected, setSelected] = useState(null);

  return (
    <DocSection id="dropdowns" title="29. 드롭다운 (Dropdown)" description={<p>EasyList로 항목을 관리하는 경량 Dropdown. 키보드(↑/↓/Enter/ESC)와 외부 클릭 닫힘을 지원합니다.</p>}>
      <div id="dropdown-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본</h3>
        <div className="flex flex-col gap-2 items-start">
          <Lib.Dropdown
            items={items}
            trigger={<span>메뉴 열기</span>}
            onSelect={(it) => setSelected(it?.get ? it.get('label') : it?.label)}
          />
          <div className="text-sm text-gray-600">선택: {selected ?? '없음'}</div>
          <CodeBlock code={`const items = EasyList([
  { label: '항목 1', value: 'one' },
  { label: '항목 2', value: 'two' },
  { label: '비활성 항목', value: 'disabled', disabled: true },
]);

<Dropdown items={items} trigger={<span>메뉴 열기</span>} onSelect={(it) => setSelected(it.label)} />`} />
        </div>
      </div>
    </DocSection>
  );
};

export default DropdownDocs;

