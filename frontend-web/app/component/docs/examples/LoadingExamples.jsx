"use client";
/**
 * 파일명: LoadingExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Loading 컴포넌트 예제
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
      전체 화면 로딩 (2초)
    </Lib.Button>
  );
};

/**
 * @description LoadingExamples 구성 데이터를 반환한다.
 * @updated 2026-02-24
 */
export const LoadingExamples = () => {
  return [
    {
      component: (
        <div className="space-y-4">
          <ShowGlobalLoading />
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
};

