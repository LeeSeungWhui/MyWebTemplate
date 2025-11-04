"use client";
/**
 * ���ϸ�: LoadingExamples.jsx
 * �ۼ���: LSH
 * ������: 2025-09-13
 * ����: Loading ������Ʈ ����
 */
import * as Lib from '@/app/lib';
import { useGlobalUi } from '@/app/common/store/SharedStore';

const ShowGlobalLoading = () => {
  const { setLoading } = useGlobalUi();
  return (
    <Lib.Button
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
      }}
    >
      ��ü ȭ�� �ε� (2��)
    </Lib.Button>
  );
};

export const LoadingExamples = () => {
  return [
    {
      component: (
        <div className="space-y-4">
          <ShowGlobalLoading />
        </div>
      ),
      description: '��ü ȭ�� �ε� ǥ��',
      code: `// useSharedStore ���
const { setLoading } = useGlobalUi();

// �ε� ǥ��/����
<Lib.Button onClick={() => {
  setLoading(true);
  setTimeout(() => setLoading(false), 2000);
}}>
  ��ü ȭ�� �ε� (2��)
</Lib.Button>`
    }
  ];
};
