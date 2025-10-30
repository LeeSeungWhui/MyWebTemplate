/**
 * 파일명: EasyEditorExamples.jsx
 * 작성자: Codex
 * 설명: EasyEditor 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

const readContent = (value) =>
  value?.content?.length
    ? `${value.content[0]?.content?.[0]?.text ?? ''} ...`
    : '내용 없음';

export const EasyEditorExamples = () => {
  const dataObj = Lib.EasyObj({
    announcement: null,
    onboardingGuide: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '온보딩 가이드' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '새로운 팀원을 환영합니다. 아래 체크리스트를 확인하세요.' },
          ],
        },
      ],
    },
    htmlMemo:
      '<h3>HTML 메모</h3><p>컨트롤드 모드에서는 <strong>serialization="html"</strong>을 사용하십시오.</p>',
  });

  const examples = [
    {
      anchor: 'editor-basic',
      component: (
        <div className="space-y-3">
          <Lib.EasyEditor
            dataObj={dataObj}
            dataKey="announcement"
            placeholder="팀 공지를 작성하세요"
            label="공지 작성"
            helperText="저장 버튼 없이 EasyObj에 즉시 반영됩니다."
          />
          <div className="rounded border bg-gray-50 p-3 text-sm text-gray-600">
            <strong>현재 값 요약:</strong>{' '}
            {readContent(dataObj.announcement)}
          </div>
        </div>
      ),
      description: 'EasyObj 바인딩 기반 기본 사용',
      code: `<Lib.EasyEditor
  dataObj={dataObj}
  dataKey="announcement"
  placeholder="팀 공지를 작성하세요"
  label="공지 작성"
  helperText="저장 버튼 없이 EasyObj에 즉시 반영됩니다."
/>`,
    },
    {
      anchor: 'editor-bound',
      component: (
        <Lib.EasyEditor
          dataObj={dataObj}
          dataKey="onboardingGuide"
          placeholder="온보딩 가이드를 작성하세요"
          label="가이드 편집"
          status="success"
        />
      ),
      description: '스타터 콘텐츠가 있는 바인딩 케이스',
      code: `<Lib.EasyEditor
  dataObj={dataObj}
  dataKey="onboardingGuide"
  placeholder="온보딩 가이드를 작성하세요"
  label="가이드 편집"
  status="success"
/>`,
    },
    {
      anchor: 'editor-controlled',
      component: (
        <div className="space-y-3">
          <Lib.EasyEditor
            value={dataObj.htmlMemo}
            serialization="html"
            onChange={(next) => {
              dataObj.htmlMemo = next;
            }}
            placeholder="HTML 문자열을 직접 관리"
            label="컨트롤드 HTML 편집기"
            toolbar
          />
          <pre className="rounded bg-gray-900 p-3 text-xs text-gray-100 overflow-auto">
            {dataObj.htmlMemo}
          </pre>
        </div>
      ),
      description: '컨트롤드 모드 + HTML 직렬화',
      code: `const ControlledHtml = () => {
  const store = Lib.EasyObj({ value: '<p>초기 HTML</p>' });
  return (
    <>
      <Lib.EasyEditor
        value={store.value}
        serialization="html"
        onChange={(next) => { store.value = next; }}
        placeholder="HTML 문자열을 직접 관리"
        label="컨트롤드 HTML 편집기"
      />
      <pre>{store.value}</pre>
    </>
  );
};`,
    },
  ];

  return examples;
};
