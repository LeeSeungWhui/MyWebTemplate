"use client";

/**
 * 파일명: DrawerExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Drawer 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

/**
 * @description DrawerDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const DrawerDemo = ({ buttonLabel, children, ...drawerProps }) => {
  const [isOpen, setIsOpen] = useState(false);

  return <div>
      <Lib.Button onClick={() => setIsOpen(true)}>{buttonLabel}</Lib.Button>
      <Lib.Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} {...drawerProps}>
        {children}
      </Lib.Drawer>
    </div>;
};

export const basicExampleObj = {
  exampleId: 'basic',
  render: () => <DrawerDemo buttonLabel="오른쪽 드로어 (기본)" side="right" resizable collapseButton>
      <div className="space-y-4 p-6">
        <div>
          <p className="text-sm font-semibold text-slate-900">드로어 패널</p>
          <p className="mt-1 text-sm text-slate-500">빠른 편집, 필터, 세부 정보를 담는 보조 작업 영역입니다.</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-900/5">
          오른쪽에서 슬라이드 인 되고, 외부 배경 또는 접기 버튼으로 닫을 수 있습니다.
        </div>
      </div>
    </DrawerDemo>,
  description: '오른쪽에서 열리는 기본 드로어 (리사이즈 가능, 핸들 포함)',
  code: '<Lib.Drawer isOpen={open} onClose={close} side="right" resizable collapseButton>패널 내용</Lib.Drawer>'
};

export const rightSizeExampleObj = {
  exampleId: 'rightSized',
  render: () => <DrawerDemo buttonLabel='오른쪽 드로어 (size="min-[1468px]:w-[360px]")' side="right" size="min-[1468px]:w-[360px]" collapseButton>
      <div className="p-6 text-sm text-slate-600">width 360px</div>
    </DrawerDemo>,
  description: '오른쪽 드로어 너비를 Tailwind px 클래스 문자열로 지정(size="min-[1468px]:w-[360px]")',
  code: '<Lib.Drawer isOpen={open} onClose={close} side="right" size="min-[1468px]:w-[360px]" collapseButton>width 360px</Lib.Drawer>'
};

export const leftSizeExampleObj = {
  exampleId: 'leftSized',
  render: () => <DrawerDemo buttonLabel='왼쪽 드로어 (size="min-[1468px]:w-[420px]")' side="left" size="min-[1468px]:w-[420px]" collapseButton>
      <div className="p-6 text-sm text-slate-600">width 420px</div>
    </DrawerDemo>,
  description: '왼쪽 드로어 너비를 Tailwind px 클래스 문자열로 지정(size="min-[1468px]:w-[420px]")',
  code: '<Lib.Drawer isOpen={open} onClose={close} side="left" size="min-[1468px]:w-[420px]" collapseButton>width 420px</Lib.Drawer>'
};

export const topExampleObj = {
  exampleId: 'top',
  render: () => <DrawerDemo buttonLabel='위쪽 드로어 (size="min-[1468px]:h-[220px]")' side="top" size="min-[1468px]:h-[220px]" collapseButton>
      <div className="p-6 text-sm text-slate-600">height 220px</div>
    </DrawerDemo>,
  description: '위쪽 드로어 높이를 Tailwind px 클래스 문자열로 지정(size="min-[1468px]:h-[220px]")',
  code: '<Lib.Drawer isOpen={open} onClose={close} side="top" size="min-[1468px]:h-[220px]" collapseButton>height 220px</Lib.Drawer>'
};

export const bottomExampleObj = {
  exampleId: 'bottom',
  render: () => <DrawerDemo buttonLabel='아래쪽 드로어 (size="min-[1468px]:h-[260px]")' side="bottom" size="min-[1468px]:h-[260px]" collapseButton>
      <div className="p-6 text-sm text-slate-600">height 260px</div>
    </DrawerDemo>,
  description: '아래쪽 드로어 높이를 Tailwind px 클래스 문자열로 지정(size="min-[1468px]:h-[260px]")',
  code: '<Lib.Drawer isOpen={open} onClose={close} side="bottom" size="min-[1468px]:h-[260px]" collapseButton>height 260px</Lib.Drawer>'
};

export const cardExampleObj = {
  exampleId: 'card',
  render: () => <DrawerDemo buttonLabel="카드 드로어" side="right" collapseButton>
      <Lib.Card title="카드 샘플">
        <p>드로어 안 카드</p>
      </Lib.Card>
    </DrawerDemo>,
  description: '카드 컴포넌트를 포함한 드로어',
  code: '<Lib.Drawer isOpen={open} onClose={close} side="right" collapseButton><Lib.Card title="카드 샘플">드로어 안 카드</Lib.Card></Lib.Drawer>'
};

export const menuExampleObj = {
  exampleId: 'menu',
  render: () => <DrawerDemo buttonLabel="메뉴 드로어" side="left" collapseButton>
      <ul className="space-y-2 p-6 text-sm">
        <li><button type="button" className="block rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-slate-50">메뉴 1</button></li>
        <li><button type="button" className="block rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-slate-50">메뉴 2</button></li>
        <li><button type="button" className="block rounded-lg px-3 py-2 text-left text-slate-700 hover:bg-slate-50">메뉴 3</button></li>
      </ul>
    </DrawerDemo>,
  description: '리스트 메뉴를 담은 드로어',
  code: '<Lib.Drawer isOpen={open} onClose={close} side="left" collapseButton><ul className="p-4 space-y-2"><li>...</li></ul></Lib.Drawer>'
};
