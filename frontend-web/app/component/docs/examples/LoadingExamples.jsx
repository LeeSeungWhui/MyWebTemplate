"use client";
/**
 * 파일명: LoadingExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Loading 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useGlobalUi } from '@/app/common/store/SharedStore';

export const LoadingExamples = () => {
  const { setLoading } = useGlobalUi();

  const examples = [
    {
      component: (
        <div className="space-y-4">
          <Lib.Button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 2000);
            }}
          >
            전체 화면 로딩 (2초)
          </Lib.Button>
        </div>
      ),
      description: '전체 화면 로딩 표시',
      code: `// useSharedStore 사용
const { setLoading } = useGlobalUi();

// 로딩 표시/해제
<Lib.Button onClick={() => {
  setLoading(true);
  setTimeout(() => setLoading(false), 2000);
}}>
  전체 화면 로딩 (2초)
</Lib.Button>`
    }
  ];

  return examples;
};
