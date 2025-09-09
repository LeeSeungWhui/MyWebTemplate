import * as Lib from '@/lib';
import { useState } from 'react';

export const SliderExamples = () => {
  const [rightOpen, setRightOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [topOpen, setTopOpen] = useState(false);
  const [bottomOpen, setBottomOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const examples = [
    {
      component: (
        <div>
          <Lib.Button onClick={() => setRightOpen(true)}>오른쪽 빈 슬라이더</Lib.Button>
          <Lib.Slider isOpen={rightOpen} onClose={() => setRightOpen(false)} side="right">
            <div className="p-3 text-right">
              <Lib.Button onClick={() => setRightOpen(false)}>닫기</Lib.Button>
            </div>
          </Lib.Slider>
        </div>
      ),
      description: '오른쪽에서 열리는 빈 슬라이더',
      code: `<Lib.Slider isOpen={open} onClose={close} side="right"><div className="p-3 text-right"><Lib.Button onClick={close}>닫기</Lib.Button></div></Lib.Slider>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setLeftOpen(true)}>왼쪽 빈 슬라이더</Lib.Button>
          <Lib.Slider isOpen={leftOpen} onClose={() => setLeftOpen(false)} side="left">
            <div className="p-3 text-right">
              <Lib.Button onClick={() => setLeftOpen(false)}>닫기</Lib.Button>
            </div>
          </Lib.Slider>
        </div>
      ),
      description: '왼쪽에서 열리는 빈 슬라이더',
      code: `<Lib.Slider isOpen={open} onClose={close} side="left"><div className="p-3 text-right"><Lib.Button onClick={close}>닫기</Lib.Button></div></Lib.Slider>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setTopOpen(true)}>위쪽 빈 슬라이더</Lib.Button>
          <Lib.Slider isOpen={topOpen} onClose={() => setTopOpen(false)} side="top">
            <div className="p-3 text-right">
              <Lib.Button onClick={() => setTopOpen(false)}>닫기</Lib.Button>
            </div>
          </Lib.Slider>
        </div>
      ),
      description: '위쪽에서 열리는 빈 슬라이더',
      code: `<Lib.Slider isOpen={open} onClose={close} side="top"><div className="p-3 text-right"><Lib.Button onClick={close}>닫기</Lib.Button></div></Lib.Slider>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setBottomOpen(true)}>아래쪽 빈 슬라이더</Lib.Button>
          <Lib.Slider isOpen={bottomOpen} onClose={() => setBottomOpen(false)} side="bottom">
            <div className="p-3 text-right">
              <Lib.Button onClick={() => setBottomOpen(false)}>닫기</Lib.Button>
            </div>
          </Lib.Slider>
        </div>
      ),
      description: '아래쪽에서 열리는 빈 슬라이더',
      code: `<Lib.Slider isOpen={open} onClose={close} side="bottom"><div className="p-3 text-right"><Lib.Button onClick={close}>닫기</Lib.Button></div></Lib.Slider>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setCardOpen(true)}>카드 슬라이더</Lib.Button>
          <Lib.Slider isOpen={cardOpen} onClose={() => setCardOpen(false)} side="right">
            <Lib.Card
              title="카드 샘플"
              footer={<Lib.Button onClick={() => setCardOpen(false)}>닫기</Lib.Button>}
            >
              <p>슬라이더 안 카드</p>
            </Lib.Card>
          </Lib.Slider>
        </div>
      ),
      description: '카드 컴포넌트를 포함한 슬라이더',
      code: `<Lib.Slider isOpen={open} onClose={close} side="right"><Lib.Card title="카드 샘플" footer={<Lib.Button onClick={close}>닫기</Lib.Button>}>슬라이더 안 카드</Lib.Card></Lib.Slider>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setMenuOpen(true)}>메뉴 슬라이더</Lib.Button>
          <Lib.Slider isOpen={menuOpen} onClose={() => setMenuOpen(false)} side="left">
            <ul className="p-4 space-y-2">
              <li><a href="#" className="block">메뉴 1</a></li>
              <li><a href="#" className="block">메뉴 2</a></li>
              <li><a href="#" className="block">메뉴 3</a></li>
            </ul>
            <div className="p-3 text-right">
              <Lib.Button onClick={() => setMenuOpen(false)}>닫기</Lib.Button>
            </div>
          </Lib.Slider>
        </div>
      ),
      description: '리스트 메뉴를 담은 슬라이더',
      code: `<Lib.Slider isOpen={open} onClose={close} side="left"><ul className="p-4 space-y-2"><li>...</li></ul><div className="p-3 text-right"><Lib.Button onClick={close}>닫기</Lib.Button></div></Lib.Slider>`
    }
  ];
  return examples;
};

