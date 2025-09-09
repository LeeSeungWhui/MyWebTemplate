import * as Lib from '@/lib';

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
      code: `<Lib.Skeleton className="h-24 w-full" />`
    }
  ];
  return examples;
};

