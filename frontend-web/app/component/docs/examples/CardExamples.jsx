import * as Lib from '@/lib';
import { useSharedStore } from '@/app/common/store/SharedStore';

export const CardExamples = () => {
  const app = useSharedStore();

  const examples = [
    {
      component: (
        <Lib.Card title="간단 카드" subtitle="보조 설명">
          카드 본문은 간결하게 구성합니다.
        </Lib.Card>
      ),
      description: '기본 Card: title + subtitle + 본문',
      code: `<Lib.Card title="간단 카드" subtitle="보조 설명">
  카드 본문은 간결하게 구성합니다.
</Lib.Card>`
    },
    {
      component: (
        <Lib.Card
          title="액션 카드"
          subtitle="버튼과 함께"
          actions={<Lib.Button onClick={() => app.showAlert("버튼 액션")}>Action</Lib.Button>}
          footer="푸터 텍스트"
        >
          <div className="space-y-2">
            <div>리스트 항목 1</div>
            <div>리스트 항목 2</div>
          </div>
        </Lib.Card>
      ),
      description: 'actions + footer 사용',
      code: `<Lib.Card
  title="액션 카드"
  subtitle="버튼과 함께"
  actions={<Lib.Button onClick={() => app.showAlert("버튼 액션")}>Action</Lib.Button>}
  footer="푸터 텍스트"
>
  <div className="space-y-2">
    <div>리스트 항목 1</div>
    <div>리스트 항목 2</div>
  </div>
</Lib.Card>`
    },
    {
      component: (
        <Lib.Card className="bg-slate-50" bodyClassName="p-6" headerClassName="p-3" footerClassName="p-2">
          헤더/푸터 없이 본문만 있는 카드입니다.
        </Lib.Card>
      ),
      description: '헤더 없이 본문만 (custom className*)',
      code: `<Lib.Card className="bg-slate-50" bodyClassName="p-6">
  헤더/푸터 없이 본문만 있는 카드입니다.
</Lib.Card>`
    },
    {
      component: (
        <Lib.Card
          title="조합 예시"
          actions={<Lib.Badge variant="primary">New</Lib.Badge>}
          footer={<div className="flex items-center gap-2 text-xs"><Lib.Icon icon="md:MdSchedule" /> 업데이트: 방금 전</div>}
        >
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded bg-blue-100 flex items-center justify-center text-blue-700">IMG</div>
            <div>
              <div className="font-medium">이미지/아이콘과 텍스트</div>
              <div className="text-sm text-gray-600">레이아웃을 자유롭게 구성</div>
            </div>
          </div>
        </Lib.Card>
      ),
      description: 'Badge, Icon 등과 조합',
      code: `<Lib.Card
  title="조합 예시"
  actions={<Lib.Badge variant="primary">New</Lib.Badge>}
  footer={<div className="flex items-center gap-2 text-xs"><Lib.Icon icon="md:MdSchedule" /> 업데이트: 방금 전</div>}
>
  <div className="flex items-start gap-3">
    <div className="h-12 w-12 rounded bg-blue-100 flex items-center justify-center text-blue-700">IMG</div>
    <div>
      <div className="font-medium">이미지/아이콘과 텍스트</div>
      <div className="text-sm text-gray-600">레이아웃을 자유롭게 구성</div>
    </div>
  </div>
</Lib.Card>`
    }
  ];

  return examples;
};

