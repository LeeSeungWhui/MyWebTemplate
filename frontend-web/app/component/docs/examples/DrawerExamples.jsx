/**
 * 파일명: DrawerExamples.jsx (표시명은 Drawer로 전환)
 * 작성자: ChatGPT
 * 설명: 드로어 컴포넌트 사용 예제 모음
 */
import * as Lib from '@/lib';
import { useState } from 'react';

export const DrawerExamples = () => {
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
          <Lib.Button onClick={() => setRightOpen(true)}>오른쪽 빈 드로어</Lib.Button>
          <Lib.Drawer isOpen={rightOpen} onClose={() => setRightOpen(false)} side="right" resizable collapseButton>
            <div className="p-3">내용 없음</div>
          </Lib.Drawer>
        </div>
      ),
      description: '오른쪽에서 열리는 빈 드로어 (리사이즈 가능, 외부 버튼)',
      code: `<Lib.Drawer isOpen={open} onClose={close} side="right" resizable collapseButton>내용 없음</Lib.Drawer>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setLeftOpen(true)}>왼쪽 빈 드로어</Lib.Button>
          <Lib.Drawer isOpen={leftOpen} onClose={() => setLeftOpen(false)} side="left" collapseButton>
            <div className="p-3">내용 없음</div>
          </Lib.Drawer>
        </div>
      ),
      description: '왼쪽에서 열리는 빈 드로어 (외부 버튼)',
      code: `<Lib.Drawer isOpen={open} onClose={close} side="left" collapseButton>내용 없음</Lib.Drawer>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setTopOpen(true)}>위쪽 빈 드로어</Lib.Button>
          <Lib.Drawer isOpen={topOpen} onClose={() => setTopOpen(false)} side="top" collapseButton>
            <div className="p-3">내용 없음</div>
          </Lib.Drawer>
        </div>
      ),
      description: '위쪽에서 열리는 빈 드로어 (외부 버튼)',
      code: `<Lib.Drawer isOpen={open} onClose={close} side="top" collapseButton>내용 없음</Lib.Drawer>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setBottomOpen(true)}>아래쪽 빈 드로어</Lib.Button>
          <Lib.Drawer isOpen={bottomOpen} onClose={() => setBottomOpen(false)} side="bottom" collapseButton>
            <div className="p-3">내용 없음</div>
          </Lib.Drawer>
        </div>
      ),
      description: '아래쪽에서 열리는 빈 드로어 (외부 버튼)',
      code: `<Lib.Drawer isOpen={open} onClose={close} side="bottom" collapseButton>내용 없음</Lib.Drawer>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setCardOpen(true)}>카드 드로어</Lib.Button>
          <Lib.Drawer isOpen={cardOpen} onClose={() => setCardOpen(false)} side="right" collapseButton>
            <Lib.Card title="카드 샘플">
              <p>드로어 안 카드</p>
            </Lib.Card>
          </Lib.Drawer>
        </div>
      ),
      description: '카드 컴포넌트를 포함한 드로어',
      code: `<Lib.Drawer isOpen={open} onClose={close} side="right" collapseButton><Lib.Card title="카드 샘플">드로어 안 카드</Lib.Card></Lib.Drawer>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setMenuOpen(true)}>메뉴 드로어</Lib.Button>
          <Lib.Drawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} side="left" collapseButton>
            <ul className="p-4 space-y-2">
              <li><a href="#" className="block">메뉴 1</a></li>
              <li><a href="#" className="block">메뉴 2</a></li>
              <li><a href="#" className="block">메뉴 3</a></li>
            </ul>
          </Lib.Drawer>
        </div>
      ),
      description: '리스트 메뉴를 담은 드로어',
      code: `<Lib.Drawer isOpen={open} onClose={close} side="left" collapseButton><ul className="p-4 space-y-2"><li>...</li></ul></Lib.Drawer>`
    }
  ];
  return examples;
};

