import * as Lib from '@/lib';
import { useState } from 'react';

export const SliderExamples = () => {
  const [rightOpen, setRightOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [topOpen, setTopOpen] = useState(false);
  const [bottomOpen, setBottomOpen] = useState(false);

  const examples = [
    {
      component: (
        <div>
          <Lib.Button onClick={() => setRightOpen(true)}>오른쪽 슬라이더</Lib.Button>
          <Lib.Slider isOpen={rightOpen} onClose={() => setRightOpen(false)} side="right">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b font-medium">제목</div>
              <div className="flex-1 p-4 overflow-auto">내용 영역</div>
              <div className="p-3 border-t text-right"><Lib.Button onClick={() => setRightOpen(false)}>닫기</Lib.Button></div>
            </div>
          </Lib.Slider>
        </div>
      ),
      description: '기본(right) 슬라이더',
      code: `<Lib.Slider isOpen={open} onClose={close} side="right">...</Lib.Slider>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setLeftOpen(true)}>왼쪽 슬라이더</Lib.Button>
          <Lib.Slider isOpen={leftOpen} onClose={() => setLeftOpen(false)} side="left">
            <div className="h-full p-4">왼쪽에서 열림</div>
          </Lib.Slider>
        </div>
      ),
      description: 'side = left',
      code: `<Lib.Slider isOpen={open} onClose={close} side="left">...</Lib.Slider>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setTopOpen(true)}>위쪽 슬라이더</Lib.Button>
          <Lib.Slider isOpen={topOpen} onClose={() => setTopOpen(false)} side="top">
            <div className="h-full p-4">위쪽에서 열림</div>
          </Lib.Slider>
        </div>
      ),
      description: 'side = top',
      code: `<Lib.Slider isOpen={open} onClose={close} side="top">...</Lib.Slider>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setBottomOpen(true)}>아래쪽 슬라이더</Lib.Button>
          <Lib.Slider isOpen={bottomOpen} onClose={() => setBottomOpen(false)} side="bottom">
            <div className="h-full p-4">아래쪽에서 열림</div>
          </Lib.Slider>
        </div>
      ),
      description: 'side = bottom',
      code: `<Lib.Slider isOpen={open} onClose={close} side="bottom">...</Lib.Slider>`
    }
  ];
  return examples;
};

