/**
 * 파일명: DrawerExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Drawer 컴포넌트 예제
 */
/**
* 파일명: DrawerExamples.jsx
* 설명: Drawer 컴포넌트 사용 예제 모음 (size 숫자 px 지원 포함)
*/
import * as Lib from '@/app/lib';
import { useState } from 'react';

/**
 * @description  DrawerExamples 구성 데이터를 반환한다. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 입력값과 상태를 검증해 UI/데이터 흐름을 안전하게 유지한다.
 */
export const DrawerExamples = () => {
  const [rightOpen, setRightOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [topOpen, setTopOpen] = useState(false);
  const [bottomOpen, setBottomOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [rightSizedOpen, setRightSizedOpen] = useState(false);
  const [topSizedOpen, setTopSizedOpen] = useState(false);

  const examples = [
    {
      component: (
        <div>
          <Lib.Button onClick={() => setRightOpen(true)}>오른쪽 드로어 (기본)</Lib.Button>
          <Lib.Drawer isOpen={rightOpen} onClose={() => setRightOpen(false)} side="right" resizable collapseButton>
            <div className="p-3">내용 없음</div>
          </Lib.Drawer>
        </div>
      ),
      description: '오른쪽에서 열리는 기본 드로어 (리사이즈 가능, 핸들 포함)',
      code: `<Lib.Drawer isOpen={open} onClose={close} side="right" resizable collapseButton>내용 없음</Lib.Drawer>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setRightSizedOpen(true)}>오른쪽 드로어 (size=360px)</Lib.Button>
          <Lib.Drawer isOpen={rightSizedOpen} onClose={() => setRightSizedOpen(false)} side="right" size={360} collapseButton>
            <div className="p-3">width 360px</div>
          </Lib.Drawer>
        </div>
      ),
      description: '오른쪽 드로어 너비를 숫자(px)로 지정(size=360)',
      code: `<Lib.Drawer isOpen={open} onClose={close} side="right" size={360} collapseButton>width 360px</Lib.Drawer>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setLeftOpen(true)}>왼쪽 드로어 (size="420px")</Lib.Button>
          <Lib.Drawer isOpen={leftOpen} onClose={() => setLeftOpen(false)} side="left" size="420px" collapseButton>
            <div className="p-3">width 420px</div>
          </Lib.Drawer>
        </div>
      ),
      description: '왼쪽 드로어 너비를 문자열(px)로 지정(size="420px")',
      code: `<Lib.Drawer isOpen={open} onClose={close} side="left" size="420px" collapseButton>width 420px</Lib.Drawer>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setTopSizedOpen(true)}>위쪽 드로어 (size=220px)</Lib.Button>
          <Lib.Drawer isOpen={topSizedOpen} onClose={() => setTopSizedOpen(false)} side="top" size={220} collapseButton>
            <div className="p-3">height 220px</div>
          </Lib.Drawer>
        </div>
      ),
      description: '위쪽 드로어 높이를 숫자(px)로 지정(size=220)',
      code: `<Lib.Drawer isOpen={open} onClose={close} side="top" size={220} collapseButton>height 220px</Lib.Drawer>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setBottomOpen(true)}>아래쪽 드로어 (size="260")</Lib.Button>
          <Lib.Drawer isOpen={bottomOpen} onClose={() => setBottomOpen(false)} side="bottom" size="260" collapseButton>
            <div className="p-3">height 260px</div>
          </Lib.Drawer>
        </div>
      ),
      description: '아래쪽 드로어 높이를 숫자 문자열로 지정(size="260")',
      code: `<Lib.Drawer isOpen={open} onClose={close} side="bottom" size="260" collapseButton>height 260px</Lib.Drawer>`
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
