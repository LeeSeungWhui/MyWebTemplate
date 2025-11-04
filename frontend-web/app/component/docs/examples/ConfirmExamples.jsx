"use client";
/**
 * ���ϸ�: ConfirmExamples.jsx
 * �ۼ���: LSH
 * ������: 2025-09-13
 * ����: Confirm ������Ʈ ����
 */
import * as Lib from '@/app/lib';
import { useRef } from 'react';
import { useGlobalUi } from '@/app/common/store/SharedStore';

const BasicConfirm = () => {
  const { showConfirm, showAlert } = useGlobalUi();
  return (
    <Lib.Button
      onClick={() => {
        showConfirm('���� �����Ͻðڽ��ϱ�?').then((result) => {
          if (result) showAlert('Ȯ���߽��ϴ�.');
        });
      }}
    >
      �⺻ Ȯ��
    </Lib.Button>
  );
};

const ConfirmVariants = () => {
  const { showConfirm } = useGlobalUi();
  return (
    <div className="flex flex-wrap gap-2">
      <Lib.Button
        onClick={() =>
          showConfirm('�ش� �۾��� �ǵ��� �� �����ϴ�.\n����Ͻðڽ��ϱ�?', {
            title: '����',
            type: 'warning',
            confirmText: '���',
            cancelText: '�ߴ�',
          })
        }
      >
        ��� Ȯ��
      </Lib.Button>
      <Lib.Button
        onClick={() =>
          showConfirm('��� �����͸� �����մϴ�.\n���� �����Ͻðڽ��ϱ�?', {
            title: '���� Ȯ��',
            type: 'danger',
            confirmText: '����',
            cancelText: '���',
          })
        }
      >
        ���� Ȯ��
      </Lib.Button>
    </div>
  );
};

const ConfirmCallbacks = () => {
  const { showConfirm, showAlert } = useGlobalUi();
  return (
    <Lib.Button
      onClick={() =>
        showConfirm('������ �����Ͻðڽ��ϱ�?', {
          title: '���� Ȯ��',
          type: 'danger',
          confirmText: '����',
          cancelText: '���',
          onConfirm: () => showAlert('������ �Ϸ�Ǿ����ϴ�.'),
          onCancel: () => showAlert('������ ��ҵǾ����ϴ�.'),
        })
      }
    >
      �ݹ� �Լ� ǥ��
    </Lib.Button>
  );
};

const ConfirmFocus = () => {
  const { showConfirm } = useGlobalUi();
  const inputRef = useRef(null);
  return (
    <div className="flex gap-4 items-center">
      <Lib.Button
        onClick={() =>
          showConfirm('Ȯ�� ����� ������ �Է�â���� Ŀ���� �̵��մϴ�.', {
            title: '��Ŀ�� �̵�',
            onFocus: () => inputRef.current?.focus(),
          })
        }
      >
        ��Ŀ�� �̵� ǥ��
      </Lib.Button>
      <Lib.Input ref={inputRef} placeholder="Ŀ���� ����� �̵��մϴ�" />
    </div>
  );
};

export const ConfirmExamples = () => {
  return [
    {
      component: (
        <div className="space-y-4">
          <BasicConfirm />
        </div>
      ),
      description: '�⺻ Ȯ�� ���',
      code: `// useSharedStore ���
const { showConfirm, showAlert } = useGlobalUi();

// �⺻ Ȯ��
showConfirm('���� �����Ͻðڽ��ϱ�?').then((result) => {
  if (result) showAlert('Ȯ���߽��ϴ�.');
});`
    },
    {
      component: <ConfirmVariants />,
      description: 'Ȯ�� ��� ����',
      code: `// ��� Ȯ��
showConfirm('�ش� �۾��� �ǵ��� �� �����ϴ�.\\n����Ͻðڽ��ϱ�?', {
  title: '����',
  type: 'warning',
  confirmText: '���',
  cancelText: '�ߴ�',
});

// ���� Ȯ��
showConfirm('��� �����͸� �����մϴ�.\\n���� �����Ͻðڽ��ϱ�?', {
  title: '���� Ȯ��',
  type: 'danger',
  confirmText: '����',
  cancelText: '���',
});`
    },
    {
      component: (
        <div className="space-y-4">
          <ConfirmCallbacks />
        </div>
      ),
      description: 'Ȯ��/��� �ݹ�',
      code: `// Ȯ��/��� �� ����� �ݹ�
showConfirm('������ �����Ͻðڽ��ϱ�?', {
  title: '���� Ȯ��',
  type: 'danger',
  confirmText: '����',
  cancelText: '���',
  onConfirm: () => showAlert('������ �Ϸ�Ǿ����ϴ�.'),
  onCancel: () => showAlert('������ ��ҵǾ����ϴ�.'),
});`
    },
    {
      component: (
        <div className="space-y-4">
          <ConfirmFocus />
        </div>
      ),
      description: 'Ȯ�� ��� ���� �� ��Ŀ�� �̵�',
      code: `// useRef �� �Է�â ���� ����
const inputRef = useRef(null);

// ��� ���� �� �Է�â���� ��Ŀ�� �̵�
<div className="flex gap-4 items-center">
  <Lib.Button
    onClick={() => {
      showConfirm('Ȯ�� ����� ������ �Է�â���� Ŀ���� �̵��մϴ�.', {
        title: '��Ŀ�� �̵�',
        onFocus: () => inputRef.current?.focus(),
      });
    }}
  >
    ��Ŀ�� �̵� ǥ��
  </Lib.Button>
  <Lib.Input ref={inputRef} placeholder="Ŀ���� ����� �̵��մϴ�" />
</div>`
    }
  ];
};
