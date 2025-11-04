"use client";
/**
 * ���ϸ�: CardExamples.jsx
 * �ۼ���: LSH
 * ������: 2025-09-13
 * ����: Card ������Ʈ ����
 */
import * as Lib from '@/app/lib';
import { useGlobalUi } from '@/app/common/store/SharedStore';

const ActionCard = () => {
  const { showAlert } = useGlobalUi();
  return (
    <Lib.Card
      title="�׼� ī��"
      subtitle="��ư�� �Բ�"
      actions={<Lib.Button onClick={() => showAlert('��ư �׼�')}>Action</Lib.Button>}
      footer="Ǫ�� �ؽ�Ʈ"
    >
      <div className="space-y-2">
        <div>����Ʈ �׸� 1</div>
        <div>����Ʈ �׸� 2</div>
      </div>
    </Lib.Card>
  );
};

export const CardExamples = () => {
  return [
    {
      component: (
        <Lib.Card title="���� ī��" subtitle="���� ����">
          ī�� ������ �����ϰ� �����մϴ�.
        </Lib.Card>
      ),
      description: '�⺻ Card: title + subtitle + ����',
      code: <Lib.Card title="���� ī��" subtitle="���� ����">
  ī�� ������ �����ϰ� �����մϴ�.
</Lib.Card>
    },
    {
      component: <ActionCard />,
      description: 'actions + footer ���',
      code: <Lib.Card
  title="�׼� ī��"
  subtitle="��ư�� �Բ�"
  actions={<Lib.Button onClick={() => showAlert('��ư �׼�')}>Action</Lib.Button>}
  footer="Ǫ�� �ؽ�Ʈ"
>
  <div className="space-y-2">
    <div>����Ʈ �׸� 1</div>
    <div>����Ʈ �׸� 2</div>
  </div>
</Lib.Card>
    },
    {
      component: (
        <Lib.Card className="bg-slate-50" bodyClassName="p-6" headerClassName="p-3" footerClassName="p-2">
          ���/Ǫ�� �е��� �ִ� ī���Դϴ�.
        </Lib.Card>
      ),
      description: '���/Ǫ�� �е�(custom className*)',
      code: <Lib.Card className="bg-slate-50" bodyClassName="p-6">
  ���/Ǫ�� �е��� �ִ� ī���Դϴ�.
</Lib.Card>
    },
    {
      component: (
        <Lib.Card
          title="���� ����"
          actions={<Lib.Badge variant="primary">New</Lib.Badge>}
          footer={<div className="flex items-center gap-2 text-xs"><Lib.Icon icon="md:MdSchedule" /> ������Ʈ: ��� ��</div>}
        >
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded bg-blue-100 flex items-center justify-center text-blue-700">IMG</div>
            <div>
              <div className="font-medium">�̹���/�����ܰ� �ؽ�Ʈ</div>
              <div className="text-sm text-gray-600">���̾ƿ�� ���� ����</div>
            </div>
          </div>
        </Lib.Card>
      ),
      description: 'Badge, Icon ����',
      code: <Lib.Card
  title="���� ����"
  actions={<Lib.Badge variant="primary">New</Lib.Badge>}
  footer={<div className="flex items-center gap-2 text-xs"><Lib.Icon icon="md:MdSchedule" /> ������Ʈ: ��� ��</div>}
>
  <div className="flex items-start gap-3">
    <div className="h-12 w-12 rounded bg-blue-100 flex items-center justify-center text-blue-700">IMG</div>
    <div>
      <div className="font-medium">�̹���/�����ܰ� �ؽ�Ʈ</div>
      <div className="text-sm text-gray-600">���̾ƿ�� ���� ����</div>
    </div>
  </div>
</Lib.Card>
    }
  ];
};