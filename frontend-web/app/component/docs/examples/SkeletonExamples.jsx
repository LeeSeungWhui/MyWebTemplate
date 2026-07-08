/**
 * 파일명: SkeletonExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Skeleton 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

/**
 * @description Skeleton 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 입력값과 상태를 검증해 UI/데이터 흐름을 안전하게 유지한다.
 */
export const textExampleList = [{
  component: <div className="max-w-2xl rounded-2xl bg-white p-5 ring-1 ring-slate-200/80">
          <div className="mb-4 flex items-center justify-between">
            <Lib.Skeleton className="h-4 w-32 rounded-full" />
            <Lib.Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="space-y-3">
            <Lib.Skeleton variant="text" lines={3} />
            <Lib.Skeleton className="h-3 w-2/3 rounded-full" />
          </div>
        </div>,
  description: '문단과 보조 메타가 함께 로딩되는 텍스트 스켈레톤',
  code: `<div className="space-y-3">
  <Lib.Skeleton variant="text" lines={3} />
  <Lib.Skeleton className="h-3 w-2/3 rounded-full" />
</div>`
}];
export const avatarExampleList = [{
  component: <div className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200/80">
          {[0, 1, 2].map((rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-3 rounded-xl bg-slate-50/80 p-3 ring-1 ring-slate-200/80">
              <Lib.Skeleton variant="circle" circleSize={48} />
              <div className="flex-1 space-y-2">
                <Lib.Skeleton className="h-3 w-36 rounded-full" />
                <Lib.Skeleton className="h-3 w-2/3 rounded-full" />
              </div>
              <Lib.Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>,
  description: '활동 로그나 담당자 목록처럼 반복되는 행 로딩 상태',
  code: `<div className="flex items-center gap-3">
  <Lib.Skeleton variant="circle" circleSize={48} />
  <div className="flex-1 space-y-2">
    <Lib.Skeleton className="h-3 w-36 rounded-full" />
    <Lib.Skeleton className="h-3 w-2/3 rounded-full" />
  </div>
  <Lib.Skeleton className="h-6 w-16 rounded-full" />
</div>`
}];
export const cardExampleList = [{
  component: <div className="grid gap-3 lg:grid-cols-2">
          <Lib.Card className="bg-white ring-slate-200/80">
            <div className="flex items-center gap-3">
              <Lib.Skeleton variant="circle" circleSize={40} />
              <div className="flex-1 space-y-2">
                <Lib.Skeleton className="h-3 w-32 rounded-full" />
                <Lib.Skeleton className="h-3 w-24 rounded-full" />
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Lib.Skeleton className="h-16 w-full rounded-xl" />
              <Lib.Skeleton className="h-16 w-full rounded-xl" />
              <Lib.Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </Lib.Card>
          <Lib.Card className="bg-white ring-slate-200/80">
            <Lib.Skeleton className="h-4 w-40 rounded-full" />
            <div className="mt-4 space-y-3">
              <Lib.Skeleton className="h-24 w-full rounded-xl" />
              <Lib.Skeleton className="h-3 w-3/4 rounded-full" />
              <Lib.Skeleton className="h-3 w-1/2 rounded-full" />
            </div>
          </Lib.Card>
        </div>,
  description: '카드 내부 구조를 유지하는 대시보드 로딩 조합',
  code: `<Lib.Card className="bg-white">
  <div className="flex items-center gap-3">
    <Lib.Skeleton variant="circle" circleSize={40} />
    <div className="flex-1 space-y-2">
      <Lib.Skeleton className="h-3 w-32 rounded-full" />
      <Lib.Skeleton className="h-3 w-24 rounded-full" />
    </div>
  </div>
  <div className="mt-5 grid gap-3 sm:grid-cols-3">
    <Lib.Skeleton className="h-16 w-full rounded-xl" />
    <Lib.Skeleton className="h-16 w-full rounded-xl" />
    <Lib.Skeleton className="h-16 w-full rounded-xl" />
  </div>
</Lib.Card>`
}];
