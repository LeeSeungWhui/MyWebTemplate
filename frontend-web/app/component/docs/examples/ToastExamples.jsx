"use client";
/**
 * ���ϸ�: ToastExamples.jsx
 * �ۼ���: LSH
 * ������: 2025-09-13
 * ����: Toast ������Ʈ ����
 */
import * as Lib from '@/app/lib';
import { useGlobalUi } from '@/app/common/store/SharedStore';

const ToastBasic = () => {
  const { showToast } = useGlobalUi();
  return <Lib.Button onClick={() => showToast('�⺻ �佺Ʈ �޽����Դϴ�.')}>�⺻ �佺Ʈ</Lib.Button>;
};

const ToastTypes = () => {
  const { showToast } = useGlobalUi();
  return (
    <div className="flex flex-wrap gap-2">
      <Lib.Button onClick={() => showToast('���� �佺Ʈ �޽����Դϴ�.', { type: 'info' })}>���� �佺Ʈ</Lib.Button>
      <Lib.Button onClick={() => showToast('���� �佺Ʈ �޽����Դϴ�.', { type: 'success' })}>���� �佺Ʈ</Lib.Button>
      <Lib.Button onClick={() => showToast('��� �佺Ʈ �޽����Դϴ�.', { type: 'warning' })}>��� �佺Ʈ</Lib.Button>
      <Lib.Button onClick={() => showToast('���� �佺Ʈ �޽����Դϴ�.', { type: 'error' })}>���� �佺Ʈ</Lib.Button>
    </div>
  );
};

const ToastPositions = () => {
  const { showToast } = useGlobalUi();
  return (
    <div className="flex flex-wrap gap-2">
      <Lib.Button onClick={() => showToast('��� ���ʿ� ǥ���մϴ�.', { position: 'top-left' })}>��� ����</Lib.Button>
      <Lib.Button onClick={() => showToast('��� �߾ӿ� ǥ���մϴ�.', { position: 'top-center' })}>��� �߾�</Lib.Button>
      <Lib.Button onClick={() => showToast('��� �����ʿ� ǥ���մϴ�.', { position: 'top-right' })}>��� ������</Lib.Button>
      <Lib.Button onClick={() => showToast('�ϴ� ���ʿ� ǥ���մϴ�.', { position: 'bottom-left' })}>�ϴ� ����</Lib.Button>
      <Lib.Button onClick={() => showToast('�ϴ� �߾ӿ� ǥ���մϴ�.', { position: 'bottom-center' })}>�ϴ� �߾�</Lib.Button>
      <Lib.Button onClick={() => showToast('�ϴ� �����ʿ� ǥ���մϴ�.', { position: 'bottom-right' })}>�ϴ� ������</Lib.Button>
    </div>
  );
};

const ToastDurations = () => {
  const { showToast } = useGlobalUi();
  return (
    <div className="flex flex-wrap gap-2">
      <Lib.Button onClick={() => showToast('2�ʿ� ������ϴ�.', { duration: 2000 })}>2�� ����</Lib.Button>
      <Lib.Button onClick={() => showToast('5�ʿ� ������ϴ�.', { duration: 5000 })}>5�� ����</Lib.Button>
      <Lib.Button onClick={() => showToast('�ڵ����� ������� �ʽ��ϴ�.', { duration: Infinity })}>�ڵ� �ݱ� ��Ȱ��ȭ</Lib.Button>
    </div>
  );
};

export const ToastExamples = () => {
  return [
    {
      component: (
        <div className="space-y-4">
          <ToastBasic />
        </div>
      ),
      description: '�⺻ �佺Ʈ',
      code: `// useSharedStore ���
const { showToast } = useGlobalUi();

// �⺻ �佺Ʈ
showToast('�⺻ �佺Ʈ �޽����Դϴ�.');`
    },
    {
      component: <ToastTypes />,
      description: '�佺Ʈ ����',
      code: `showToast('���� �佺Ʈ �޽����Դϴ�.', { type: 'info' });
showToast('���� �佺Ʈ �޽����Դϴ�.', { type: 'success' });
showToast('��� �佺Ʈ �޽����Դϴ�.', { type: 'warning' });
showToast('���� �佺Ʈ �޽����Դϴ�.', { type: 'error' });`
    },
    {
      component: <ToastPositions />,
      description: '�佺Ʈ ��ġ',
      code: `showToast('��� ���ʿ� ǥ���մϴ�.', { position: 'top-left' });
showToast('��� �߾ӿ� ǥ���մϴ�.', { position: 'top-center' });
showToast('��� �����ʿ� ǥ���մϴ�.', { position: 'top-right' });
showToast('�ϴ� ���ʿ� ǥ���մϴ�.', { position: 'bottom-left' });
showToast('�ϴ� �߾ӿ� ǥ���մϴ�.', { position: 'bottom-center' });
showToast('�ϴ� �����ʿ� ǥ���մϴ�.', { position: 'bottom-right' });`
    },
    {
      component: <ToastDurations />,
      description: '�佺Ʈ ���� �ð�',
      code: `showToast('2�ʿ� ������ϴ�.', { duration: 2000 });
showToast('5�ʿ� ������ϴ�.', { duration: 5000 });
showToast('�ڵ����� ������� �ʽ��ϴ�.', { duration: Infinity });`
    }
  ];
};
