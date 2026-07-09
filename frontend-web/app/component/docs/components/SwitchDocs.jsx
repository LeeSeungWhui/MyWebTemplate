/**
 * 파일명: SwitchDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Switch 컴포넌트 문서
 */
import { basicExampleList, stateExampleList } from '../examples/SwitchExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const switchPropList = [
    { name: 'dataObj/dataKey?', description: 'EasyObj boolean 또는 Y/1 계열 값을 스위치 상태에 바인딩' },
    { name: 'checked/defaultChecked?', description: 'controlled 상태 또는 초기 ON/OFF 값' },
    { name: 'onChange/onValueChange?', description: '토글 후 boolean 값과 binding context 전달' },
    { name: 'label?', description: '스위치 오른쪽에 표시되는 짧은 라벨' },
    { name: 'disabled?', description: '수정 불가 상태와 접근성 비활성 상태 표시' },
    { name: 'id/name?', description: '라벨 연결, 폼 전송, 테스트 셀렉터에 사용할 식별자' },
    { name: 'className?', description: '설정 행·카드 내부 배치에 맞춘 간격 보정' },
];

const switchExampleSectionList = [
    {
        id: 'switch-basic',
        eyebrow: 'EXAMPLE 1',
        title: '기본 사용법',
        summary: '설정 화면에서 ON/OFF 값을 즉시 바꾸는 업무형 토글 패턴입니다.',
        exampleList: basicExampleList,
    },
    {
        id: 'switch-states',
        eyebrow: 'EXAMPLE 2',
        title: '상태와 접근성',
        summary: '비활성·초기값·id 연결처럼 실제 운영 화면에서 필요한 상태를 확인합니다.',
        exampleList: stateExampleList,
    },
];

/**
 * @description Switch 문서 섹션을 구성하고 예제 목록을 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const SwitchDocs = () => {
  return (
    <DocSection
      id="switches"
      title="11. 스위치 (Switch)" description={
        <div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
          <p>Switch는 설정, 권한, 알림처럼 즉시 켜고 끄는 boolean 입력입니다. <code>role="switch"</code>와 <code>aria-checked</code>를 포함하며 EasyObj 바운드 모드와 controlled 모드를 모두 지원합니다.</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {switchPropList.map((propItem) => (
              <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
                <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
                <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">바운드 값은 <code>true</code>, <code>Y</code>, <code>1</code> 계열을 ON으로 해석해 서버/폼 데이터와 함께 쓰기 쉽습니다.</p>
        </div>
      }
    >
      <div className="space-y-8">
        {switchExampleSectionList.map((exampleSection) => (
          <div key={exampleSection.id} id={exampleSection.id} className="scroll-mt-24 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
            <div className="mb-4 flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{exampleSection.eyebrow}</span>
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">{exampleSection.title}</h3>
              <p className="text-sm text-slate-500">{exampleSection.summary}</p>
            </div>
            <div className="rounded-xl bg-slate-50/80 p-5 ring-1 ring-slate-200/80">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {exampleSection.exampleList.map((example) => (
                  <div key={example.exampleId} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
                    {example.component}
                    <p className="mt-3 text-sm text-slate-600">{example.description}</p>
                    <div className="mt-3">
                      <CodeBlock code={example.code} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DocSection>
  );
};

export default SwitchDocs;
