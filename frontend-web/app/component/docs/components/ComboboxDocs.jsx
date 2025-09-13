/**
 * 파일명: ComboboxDocs.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Combobox 컴포넌트 문서
 */
/**
 * 파일명: ComboboxDocs.jsx
 * 설명: Combobox 컴포넌트 문서
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { ComboboxExamples } from '../examples/ComboboxExamples';

const ComboboxDocs = () => {
  const ex = ComboboxExamples();
  return (
    <DocSection
      id="comboboxes"
      title="22. 콤보박스 (Combobox)" description={
        <div>
          <p>검색 가능한 단일·다중 선택 입력입니다. dataList(selected)를 기반으로 한 선택 모델을 사용하며 초성 검색을 지원합니다.</p>
          <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
            <li><code>dataList</code>: 선택 항목 배열(EasyList 가능)</li>
            <li><code>valueKey?/textKey?</code>: 값/라벨 키 (기본: 'value'/'text')</li>
            <li><code>value?</code>: 제어 값 (단일 또는 배열)</li>
            <li><code>defaultValue?</code>: 초기 선택 값</li>
            <li><code>multi?</code>: 다중 선택 모드</li>
            <li><code>multiSummary?</code>: 다중 선택 요약 배지 표시</li>
            <li><code>summaryText?</code>: 요약 배지 텍스트 템플릿</li>
            <li><code>filterable?</code>: 입력 검색 기능</li>
            <li><code>placeholder?</code>: 선택 전 표시 문구</li>
            <li><code>noResultsText?</code>: 검색 결과 없음 문구</li>
            <li><code>showSelectAll?</code>: 전체 선택/해제 버튼 표시</li>
            <li><code>selectAllText?/clearAllText?</code>: 전체 선택/해제 텍스트</li>
            <li><code>onChange?/onValueChange?</code>: 값 변경 콜백</li>
            <li><code>className?</code>: 추가 Tailwind 클래스</li>
            <li><code>id?</code>: input id 지정</li>
            <li><code>disabled?</code>: 비활성화 여부</li>
          </ul>
        </div>
      }
    >
      <div id="combobox-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본</h3>
        <div>
          {ex[0]?.component}
          <div className="mt-2 text-sm text-gray-600">{ex[0]?.description}</div>
          <CodeBlock code={ex[0]?.code || ''} />
        </div>
      </div>

      <div id="combobox-bound" className="mb-8">
        <h3 className="text-lg font-medium mb-4">바운드</h3>
        <div>
          {ex[1]?.component}
          <div className="mt-2 text-sm text-gray-600">{ex[1]?.description}</div>
          <CodeBlock code={ex[1]?.code || ''} />
        </div>
      </div>

      <div id="combobox-multi" className="mb-8">
        <h3 className="text-lg font-medium mb-4">다중 선택</h3>
        <div>
          {ex[2]?.component}
          <div className="mt-2 text-sm text-gray-600">{ex[2]?.description}</div>
          <CodeBlock code={ex[2]?.code || ''} />
        </div>
      </div>

      <div id="combobox-multi-advanced" className="mb-8">
        <h3 className="text-lg font-medium mb-4">요약/전체 선택</h3>
        <div>
          {ex[3]?.component}
          <div className="mt-2 text-sm text-gray-600">{ex[3]?.description}</div>
          <CodeBlock code={ex[3]?.code || ''} />
        </div>
      </div>
    </DocSection>
  );
};

export default ComboboxDocs;
