/**
 * ���ϸ�: EasyEditorExamples.jsx
 * �ۼ���: Codex
 * ����: EasyEditor ������Ʈ ����
 */
import * as Lib from '@/app/lib';

const summariseHtml = (value) => {
  const text = typeof value === 'string'
    ? value
    : '';
  const stripped = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!stripped) return '���� ����';
  return stripped.length > 40 ? `${stripped.slice(0, 40)} ...` : stripped;
};

export const EasyEditorExamples = () => {
  const dataObj = Lib.EasyObj({
    announcement: '<p></p>',
    onboardingGuide: '<h2>�º��� ���̵�</h2><p>���ο� ������ ȯ���մϴ�. �Ʒ� üũ����Ʈ�� Ȯ���ϼ���.</p>',
    htmlMemo:
      '<h3>HTML �޸�</h3><p>��Ʈ�ѵ� ��忡���� <strong>serialization="html"</strong>�� ����Ͻʽÿ�.</p>',
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
            placeholder="�� ������ �ۼ��ϼ���"
            label="���� �ۼ�"
            helperText="���� ��ư ���� EasyObj�� ��� �ݿ��˴ϴ�."
          />
          <div className="rounded border bg-gray-50 p-3 text-sm text-gray-600">
            <strong>���� �� ���:</strong>{' '}
            {summariseHtml(dataObj.announcement)}
          </div>
        </div>
      ),
      description: 'EasyObj ���ε� ��� �⺻ ���',
      code: `<Lib.EasyEditor
  dataObj={dataObj}
  dataKey="announcement"
  serialization="html"
  placeholder="�� ������ �ۼ��ϼ���"
  label="���� �ۼ�"
  helperText="���� ��ư ���� EasyObj�� ��� �ݿ��˴ϴ�."
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
            placeholder="�º��� ���̵带 �ۼ��ϼ���"
            label="���̵� ����"
            status="success"
          />
          <div className="rounded border bg-gray-50 p-3 text-sm text-gray-600">
            <strong>���� �� ���:</strong>{' '}
            {summariseHtml(dataObj.onboardingGuide)}
          </div>
        </div>
      ),
      description: '��Ÿ�� �������� �ִ� ���ε� ���̽�',
      code: `<Lib.EasyEditor
  dataObj={dataObj}
  dataKey="onboardingGuide"
  serialization="html"
  placeholder="�º��� ���̵带 �ۼ��ϼ���"
  label="���̵� ����"
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
            placeholder="HTML ���ڿ��� ���� ����"
            label="��Ʈ�ѵ� HTML ������"
            toolbar
          />
          <pre className="rounded bg-gray-900 p-3 text-xs text-gray-100 overflow-auto">
            {dataObj.htmlMemo}
          </pre>
        </div>
      ),
      description: '��Ʈ�ѵ� ��� + HTML ����ȭ',
      code: `const ControlledHtml = () => {
  const store = Lib.EasyObj({ value: '<p>�ʱ� HTML</p>' });
  return (
    <>
      <Lib.EasyEditor
        value={store.value}
        serialization="html"
        onChange={(next) => { store.value = next; }}
        placeholder="HTML ���ڿ��� ���� ����"
        label="��Ʈ�ѵ� HTML ������"
      />
      <pre>{store.value}</pre>
    </>
  );
};`,
    },
  ];

  return examples;
};
