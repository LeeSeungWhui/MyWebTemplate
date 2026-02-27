/**
 * 파일명: SkeletonExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Skeleton 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

/**
 * @description  SkeletonExamples 구성 데이터를 반환한다. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 입력값과 상태를 검증해 UI/데이터 흐름을 안전하게 유지한다.
 */
export const SkeletonExamples = () => {
  const examples = [
    {
      component: (
        <div className="space-y-2">
          <Lib.Skeleton variant="text" lines={3} />
        </div>
      ),
      description: '텍스트 라인 스켈레톤',
      code: `<Lib.Skeleton variant="text" lines={3} />`
    },
    {
      component: (
        <div className="flex items-center gap-3">
          <Lib.Skeleton variant="circle" circleSize={48} />
          <div className="flex-1">
            <Lib.Skeleton variant="text" lines={2} />
          </div>
        </div>
      ),
      description: '아바타 + 텍스트',
      code: `<Lib.Skeleton variant="circle" circleSize={48} />
<Lib.Skeleton variant="text" lines={2} />`
    },
    {
      component: (
        <Lib.Card className="bg-white">
          <div className="flex items-center gap-3">
            <Lib.Skeleton variant="circle" circleSize={40} />
            <div className="flex-1">
              <Lib.Skeleton variant="text" lines={2} />
            </div>
          </div>
          <div className="mt-4">
            <Lib.Skeleton className="h-24 w-full" />
          </div>
        </Lib.Card>
      ),
      description: '카드 스켈레톤 조합',
      code: `<Lib.Card className="bg-white">
  <div className="flex items-center gap-3">
    <Lib.Skeleton variant="circle" circleSize={40} />
    <div className="flex-1">
      <Lib.Skeleton variant="text" lines={2} />
    </div>
  </div>
  <div className="mt-4">
    <Lib.Skeleton className="h-24 w-full" />
  </div>
</Lib.Card>`
    }
  ];
  return examples;
};

