/**
 * 파일명: SliderExamples.jsx
 * 작성자: ChatGPT
 * 갱신일: 2025-02-14
 * 설명: 슬라이더 컴포넌트 예시 모음
 */
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
          <Lib.Slider isOpen={rightOpen} onClose={() => setRightOpen(false)} side="right" resizable collapseButton>
            <div className="p-3">내용 없음</div>
          </Lib.Slider>
        </div>
      ),
      description: '오른쪽에서 열리는 빈 슬라이더 (리사이즈 가능, 외부 버튼)',
      code: `<Lib.Slider isOpen={open} onClose={close} side="right" resizable collapseButton>내용 없음</Lib.Slider>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setLeftOpen(true)}>왼쪽 빈 슬라이더</Lib.Button>
          <Lib.Slider isOpen={leftOpen} onClose={() => setLeftOpen(false)} side="left" collapseButton>
            <div className="p-3">내용 없음</div>
          </Lib.Slider>
        </div>
      ),
      description: '왼쪽에서 열리는 빈 슬라이더 (외부 버튼)',
      code: `<Lib.Slider isOpen={open} onClose={close} side="left" collapseButton>내용 없음</Lib.Slider>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setTopOpen(true)}>위쪽 빈 슬라이더</Lib.Button>
          <Lib.Slider isOpen={topOpen} onClose={() => setTopOpen(false)} side="top" collapseButton>
            <div className="p-3">내용 없음</div>
          </Lib.Slider>
        </div>
      ),
      description: '위쪽에서 열리는 빈 슬라이더 (외부 버튼)',
      code: `<Lib.Slider isOpen={open} onClose={close} side="top" collapseButton>내용 없음</Lib.Slider>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setBottomOpen(true)}>아래쪽 빈 슬라이더</Lib.Button>
          <Lib.Slider isOpen={bottomOpen} onClose={() => setBottomOpen(false)} side="bottom" collapseButton>
            <div className="p-3">내용 없음</div>
          </Lib.Slider>
        </div>
      ),
      description: '아래쪽에서 열리는 빈 슬라이더 (외부 버튼)',
      code: `<Lib.Slider isOpen={open} onClose={close} side="bottom" collapseButton>내용 없음</Lib.Slider>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setCardOpen(true)}>카드 슬라이더</Lib.Button>
          <Lib.Slider isOpen={cardOpen} onClose={() => setCardOpen(false)} side="right" collapseButton>
            <Lib.Card title="프로필" className="w-60">
              <img src="https://via.placeholder.com/240x120" alt="placeholder" className="w-full mb-2 rounded" />
              <p className="text-sm mb-2">간단한 설명 텍스트</p>
              <Lib.Button size="sm" className="w-full">확인</Lib.Button>
            </Lib.Card>
          </Lib.Slider>
        </div>
      ),
      description: '이미지와 버튼을 포함한 카드 슬라이더',
      code: `<Lib.Slider isOpen={open} onClose={close} side="right" collapseButton>\n  <Lib.Card title="프로필" className="w-60">\n    <img src="https://via.placeholder.com/240x120" alt="placeholder" className="w-full mb-2 rounded" />\n    <p className="text-sm mb-2">간단한 설명 텍스트</p>\n    <Lib.Button size="sm" className="w-full">확인</Lib.Button>\n  </Lib.Card>\n</Lib.Slider>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setMenuOpen(true)}>메뉴 슬라이더</Lib.Button>
          <Lib.Slider isOpen={menuOpen} onClose={() => setMenuOpen(false)} side="left" collapseButton>
            <ul className="p-4 space-y-1 bg-gray-50 w-40">
              <li><a href="#" className="block px-2 py-1 rounded hover:bg-gray-100">메뉴 1</a></li>
              <li><a href="#" className="block px-2 py-1 rounded hover:bg-gray-100">메뉴 2</a></li>
              <li><a href="#" className="block px-2 py-1 rounded hover:bg-gray-100">메뉴 3</a></li>
            </ul>
          </Lib.Slider>
        </div>
      ),
      description: '배경과 hover 효과가 있는 메뉴 슬라이더',
      code: `<Lib.Slider isOpen={open} onClose={close} side="left" collapseButton>\n  <ul className="p-4 space-y-1 bg-gray-50 w-40">\n    <li><a href="#" className="block px-2 py-1 rounded hover:bg-gray-100">메뉴 1</a></li>\n    <li><a href="#" className="block px-2 py-1 rounded hover:bg-gray-100">메뉴 2</a></li>\n    <li><a href="#" className="block px-2 py-1 rounded hover:bg-gray-100">메뉴 3</a></li>\n  </ul>\n</Lib.Slider>`
    }
  ];
  return examples;
};

