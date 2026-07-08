/**
 * 파일명: TextareaDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Textarea 컴포넌트 문서
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';
import { boundExampleObj, controlExampleObj, errorExampleObj, readonlyExampleObj } from '../examples/TextareaExamples';

const textareaPropList = [
  { name: 'rows?', description: '기본 노출 줄 수. 기본값 4' },
  { name: 'dataObj/dataKey?', description: 'EasyObj 필드와 textarea 값을 바인딩' },
  { name: 'value/defaultValue?', description: 'controlled 또는 초기값 기반 입력' },
  { name: 'error?', description: 'aria-invalid와 오류 테두리 상태' },
  { name: 'onChange/onValueChange?', description: '변경 이벤트와 값 전용 콜백' },
  { name: 'placeholder?', description: '비어 있을 때 보여주는 안내 문구' },
  { name: 'disabled?', description: '입력 불가 상태' },
  { name: 'readOnly?', description: '값은 노출하지만 편집을 막는 상태' },
];

const textareaExampleSectionList = [
  {
    id: 'textarea-basic',
    eyebrow: 'EXAMPLE 1',
    title: '바운드 모드',
    summary: 'EasyObj 필드와 긴 메모 값을 연결해 입력 즉시 상태를 확인합니다.',
    example: boundExampleObj,
  },
  {
    id: 'textarea-controlled',
    eyebrow: 'EXAMPLE 2',
    title: '컨트롤드 모드',
    summary: 'value/onValueChange를 사용해 외부 React 상태와 동기화합니다.',
    example: controlExampleObj,
  },
  {
    id: 'textarea-error',
    eyebrow: 'EXAMPLE 3',
    title: '검증/에러 상태',
    summary: '최소 글자 수처럼 사용자가 바로 복구할 수 있는 검증 메시지를 보여줍니다.',
    example: errorExampleObj,
  },
  {
    id: 'textarea-states',
    eyebrow: 'EXAMPLE 4',
    title: '읽기 전용/비활성',
    summary: '편집 불가 상태와 disabled 상태를 같은 표면에서 비교합니다.',
    example: readonlyExampleObj,
  },
];

/**
 * @description Textarea 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const TextareaDocs = () => {
  return (
    <DocSection
      id="textareas"
      title="5. 멀티라인 입력 (Textarea)" description={
        <div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
          <p>Textarea는 긴 메모, 설명, 고객 응답처럼 줄바꿈을 보존해야 하는 텍스트 입력에 씁니다. 바운드/컨트롤드 모드와 IME 입력, 에러 상태, 읽기 전용 상태를 같은 API로 처리합니다.</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {textareaPropList.map((propItem) => (
              <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
                <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
                <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        {textareaExampleSectionList.map((exampleSection) => (
          <div key={exampleSection.id} id={exampleSection.id} className="scroll-mt-24 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
            <div className="mb-4 flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{exampleSection.eyebrow}</span>
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">{exampleSection.title}</h3>
              <p className="text-sm text-slate-500">{exampleSection.summary}</p>
            </div>
            <div className="rounded-xl bg-slate-50/80 p-5 ring-1 ring-slate-200/80">
              <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
                {exampleSection.example.component}
                <p className="mt-3 text-sm text-slate-600">{exampleSection.example.description}</p>
                <div className="mt-3">
                  <CodeBlock code={exampleSection.example.code} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DocSection>
  );
};

export default TextareaDocs;
