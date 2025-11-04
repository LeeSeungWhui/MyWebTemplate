/**
 * ?뚯씪紐? CardExamples.jsx
 * ?묒꽦?? LSH
 * 媛깆떊?? 2025-09-13
 * ?ㅻ챸: Card 而댄룷?뚰듃 ?덉젣
 */
import * as Lib from '@/app/lib';
import { useGlobalUi } from '@/app/common/store/SharedStore';

export const CardExamples = () => {
  const showAlert = useSharedStore(s => s.showAlert);

  const examples = [
    {
      component: (
        <Lib.Card title="媛꾨떒 移대뱶" subtitle="蹂댁“ ?ㅻ챸">
          移대뱶 蹂몃Ц? 媛꾧껐?섍쾶 援ъ꽦?⑸땲??
        </Lib.Card>
      ),
      description: '湲곕낯 Card: title + subtitle + 蹂몃Ц',
      code: `<Lib.Card title="媛꾨떒 移대뱶" subtitle="蹂댁“ ?ㅻ챸">
  移대뱶 蹂몃Ц? 媛꾧껐?섍쾶 援ъ꽦?⑸땲??
</Lib.Card>`
    },
    {
      component: (
        <Lib.Card
          title="?≪뀡 移대뱶"
          subtitle="踰꾪듉怨??④퍡"
          actions={<Lib.Button onClick={() => showAlert("踰꾪듉 ?≪뀡")}>Action</Lib.Button>}
          footer="?명꽣 ?띿뒪??
        >
          <div className="space-y-2">
            <div>由ъ뒪????ぉ 1</div>
            <div>由ъ뒪????ぉ 2</div>
          </div>
        </Lib.Card>
      ),
      description: 'actions + footer ?ъ슜',
      code: `<Lib.Card
  title="?≪뀡 移대뱶"
  subtitle="踰꾪듉怨??④퍡"
  actions={<Lib.Button onClick={() => showAlert("踰꾪듉 ?≪뀡")}>Action</Lib.Button>}
  footer="?명꽣 ?띿뒪??
>
  <div className="space-y-2">
    <div>由ъ뒪????ぉ 1</div>
    <div>由ъ뒪????ぉ 2</div>
  </div>
</Lib.Card>`
    },
    {
      component: (
        <Lib.Card className="bg-slate-50" bodyClassName="p-6" headerClassName="p-3" footerClassName="p-2">
          ?ㅻ뜑/?명꽣 ?놁씠 蹂몃Ц留??덈뒗 移대뱶?낅땲??
        </Lib.Card>
      ),
      description: '?ㅻ뜑 ?놁씠 蹂몃Ц留?(custom className*)',
      code: `<Lib.Card className="bg-slate-50" bodyClassName="p-6">
  ?ㅻ뜑/?명꽣 ?놁씠 蹂몃Ц留??덈뒗 移대뱶?낅땲??
</Lib.Card>`
    },
    {
      component: (
        <Lib.Card
          title="議고빀 ?덉떆"
          actions={<Lib.Badge variant="primary">New</Lib.Badge>}
          footer={<div className="flex items-center gap-2 text-xs"><Lib.Icon icon="md:MdSchedule" /> ?낅뜲?댄듃: 諛⑷툑 ??/div>}
        >
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded bg-blue-100 flex items-center justify-center text-blue-700">IMG</div>
            <div>
              <div className="font-medium">?대?吏/?꾩씠肄섍낵 ?띿뒪??/div>
              <div className="text-sm text-gray-600">?덉씠?꾩썐???먯쑀濡?쾶 援ъ꽦</div>
            </div>
          </div>
        </Lib.Card>
      ),
      description: 'Badge, Icon ?깃낵 議고빀',
      code: `<Lib.Card
  title="議고빀 ?덉떆"
  actions={<Lib.Badge variant="primary">New</Lib.Badge>}
  footer={<div className="flex items-center gap-2 text-xs"><Lib.Icon icon="md:MdSchedule" /> ?낅뜲?댄듃: 諛⑷툑 ??/div>}
>
  <div className="flex items-start gap-3">
    <div className="h-12 w-12 rounded bg-blue-100 flex items-center justify-center text-blue-700">IMG</div>
    <div>
      <div className="font-medium">?대?吏/?꾩씠肄섍낵 ?띿뒪??/div>
      <div className="text-sm text-gray-600">?덉씠?꾩썐???먯쑀濡?쾶 援ъ꽦</div>
    </div>
  </div>
</Lib.Card>`
    }
  ];

  return examples;
};



