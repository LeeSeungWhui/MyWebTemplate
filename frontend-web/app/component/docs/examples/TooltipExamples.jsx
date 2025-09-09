import * as Lib from '@/lib';

export const TooltipExamples = () => {
  const examples = [
    {
      component: (
        <div className="flex gap-4 items-center">
          <Lib.Tooltip content="기본 툴팁">
            <Lib.Button>Hover</Lib.Button>
          </Lib.Tooltip>
          <Lib.Tooltip content="포커스 가능">
            <a href="#" className="underline">링크</a>
          </Lib.Tooltip>
        </div>
      ),
      description: '기본 사용 (hover/focus)',
      code: `<Lib.Tooltip content="기본 툴팁">
  <Lib.Button>Hover</Lib.Button>
</Lib.Tooltip>`
    },
    {
      component: (
        <div className="flex gap-4 items-center">
          <Lib.Tooltip content="위" placement="top"><Lib.Button>top</Lib.Button></Lib.Tooltip>
          <Lib.Tooltip content="아래" placement="bottom"><Lib.Button>bottom</Lib.Button></Lib.Tooltip>
          <Lib.Tooltip content="왼쪽" placement="left"><Lib.Button>left</Lib.Button></Lib.Tooltip>
          <Lib.Tooltip content="오른쪽" placement="right"><Lib.Button>right</Lib.Button></Lib.Tooltip>
        </div>
      ),
      description: 'placement: top/bottom/left/right',
      code: `<Lib.Tooltip content="오른쪽" placement="right"><Lib.Button>right</Lib.Button></Lib.Tooltip>`
    }
  ];
  return examples;
};

