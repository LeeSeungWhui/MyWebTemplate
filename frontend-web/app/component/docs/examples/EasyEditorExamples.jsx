/**
 * EasyEditorExamples.jsx
 * 작성자: Codex
 * 설명: EasyEditor 컴포넌트 예제
*/
import * as Lib from '@/app/lib';

const summariseHtml = (value) => {
  const text = typeof value === 'string'
    ? value
    : '';
  const stripped = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!stripped) return '내용 없음';
  return stripped.length > 40 ? `${stripped.slice(0, 40)} ...` : stripped;
};

export const EasyEditorExamples = () => {
  const dataObj = Lib.EasyObj({
    announcement: '<p></p>',
    onboardingGuide: '<h2>온보딩 가이드</h2><p>새로운 팀원을 환영합니다. 아래 체크리스트를 확인하세요.</p>',
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
            serialization="html"
            placeholder="팀 공지를 작성하세요"
            label="공지 작성"
            helperText="저장 버튼 없이 EasyObj에 즉시 반영됩니다."
          />
          <div className="rounded border bg-gray-50 p-3 text-sm text-gray-600">
            <strong>현재 값 요약:</strong>{' '}
            {summariseHtml(dataObj.announcement)}
          </div>
        </div>
      ),
      description: 'EasyObj 바인딩 기반 기본 사용',
      code: `<Lib.EasyEditor
  dataObj={dataObj}
  dataKey="announcement"
  serialization="html"
  placeholder="팀 공지를 작성하세요"
  label="공지 작성"
  helperText="저장 버튼 없이 EasyObj에 즉시 반영됩니다."
/>`,
    },
    {
      anchor: 'editor-bound',
      component: (
        <div className="space-y-3">
          <Lib.EasyEditor
            dataObj={dataObj}
            dataKey="onboardingGuide"
            serialization="html"
            placeholder="온보딩 가이드를 작성하세요"
            label="가이드 편집"
            status="success"
          />
          <div className="rounded border bg-gray-50 p-3 text-sm text-gray-600">
            <strong>현재 값 요약:</strong>{' '}
            {summariseHtml(dataObj.onboardingGuide)}
          </div>
        </div>
      ),
      description: '스타터 콘텐츠가 있는 바인딩 케이스',
      code: `<Lib.EasyEditor
  dataObj={dataObj}
  dataKey="onboardingGuide"
  serialization="html"
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
