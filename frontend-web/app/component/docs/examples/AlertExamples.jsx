"use client";
/**
 * ���ϸ�: AlertExamples.jsx
 * �ۼ���: LSH
 * ������: 2025-09-13
 * ����: Alert ������Ʈ ����
 */
import * as Lib from '@/app/lib';
import { useRef } from 'react';
import { useGlobalUi } from '@/app/common/store/SharedStore';

const BasicAlert = () => {
  const { showAlert } = useGlobalUi();
  return <Lib.Button onClick={() => showAlert('�⺻ �˸� �޽����Դϴ�.')}>�⺻ �˸�</Lib.Button>;
};

const AlertVariants = () => {
  const { showAlert } = useGlobalUi();
  return (
    <div className="flex flex-wrap gap-2">
      <Lib.Button onClick={() => showAlert('���� �˸� �޽����Դϴ�.', { title: '����', type: 'info' })}>���� �˸�</Lib.Button>
      <Lib.Button onClick={() => showAlert('���� �˸� �޽����Դϴ�.', { title: '����', type: 'success' })}>���� �˸�</Lib.Button>
      <Lib.Button onClick={() => showAlert('��� �˸� �޽����Դϴ�.', { title: '���', type: 'warning' })}>��� �˸�</Lib.Button>
      <Lib.Button onClick={() => showAlert('���� �˸� �޽����Դϴ�.', { title: '����', type: 'error' })}>���� �˸�</Lib.Button>
    </div>
  );
};

const AlertCallback = () => {
  const { showAlert } = useGlobalUi();
  return (
    <Lib.Button
      onClick={() =>
        showAlert('�۾��� �Ϸ�Ǿ����ϴ�.', {
          title: '�˸�',
          onClick: function () {
            alert('�˸��� �ݾҽ��ϴ�.');
          },
        })
      }
    >
      �ݹ� �Լ� ǥ��
    </Lib.Button>
  );
};

const AlertFocusAfter = () => {
  const { showAlert } = useGlobalUi();
  const inputRef = useRef(null);
  const buttonRef = useRef(null);
  return (
    <div className="flex gap-4 items-center">
      <Lib.Button
        ref={buttonRef}
        onClick={() =>
          showAlert('�˸��� ������ �Է�â���� Ŀ���� �̵��մϴ�.', {
            title: '�˸�',
            onFocus: () => inputRef.current?.focus(),
          })
        }
      >
        �˸� ����
      </Lib.Button>
      <Lib.Input ref={inputRef} placeholder="Ŀ���� ����� �̵��մϴ�" />
    </div>
  );
};

export const AlertExamples = () => {
  return [
    {
      component: (
        <div className="space-y-4">
          <BasicAlert />
        </div>
      ),
      description: '�⺻ �˸�',
      code: `// useSharedStore ���
const { showAlert } = useGlobalUi();

// �⺻ �˸�
showAlert('�⺻ �˸� �޽����Դϴ�.');`
    },
    {
      component: <AlertVariants />,
      description: '�˸� ����',
      code: `// ����/����/���/���� �˸�
showAlert('���� �˸� �޽����Դϴ�.', { title: '����', type: 'info' });
showAlert('���� �˸� �޽����Դϴ�.', { title: '����', type: 'success' });
showAlert('��� �˸� �޽����Դϴ�.', { title: '���', type: 'warning' });
showAlert('���� �˸� �޽����Դϴ�.', { title: '����', type: 'error' });`
    },
    {
      component: (
        <div className="space-y-4">
          <AlertCallback />
        </div>
      ),
      description: '�˸� ���� �ݹ�',
      code: `// �˸� ���� �� ����� �ݹ�
showAlert('�۾��� �Ϸ�Ǿ����ϴ�.', {
  title: '�˸�',
  onClick: function() {
    alert('�˸��� �ݾҽ��ϴ�.');
  }
});`
    },
    {
      component: (
        <div className="space-y-4">
          <AlertFocusAfter />
        </div>
      ),
      description: '�˸� ���� �� ������ ��ҷ� ��Ŀ�� �̵�',
      code: `// useRef �� �Է�â ���� ����
const inputRef = useRef(null);

// �˸��� ������ �Է�â���� ��Ŀ�� �̵�
<div className="flex gap-4 items-center">
  <Lib.Button
    onClick={() => {
      showAlert('�˸��� ������ �Է�â���� Ŀ���� �̵��մϴ�.', {
        title: '�˸�',
        onFocus: () => inputRef.current?.focus(),
      });
    }}
  >
    �˸� ����
  </Lib.Button>
  <Lib.Input ref={inputRef} placeholder="Ŀ���� ����� �̵��մϴ�" />
</div>`
    }
  ];
};
