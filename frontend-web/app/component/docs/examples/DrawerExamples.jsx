import * as Lib from '@/lib';
import { useState } from 'react';

export const DrawerExamples = () => {
  const [rightOpen, setRightOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);

  const examples = [
    {
      component: (
        <div>
          <Lib.Button onClick={() => setRightOpen(true)}>오른쪽 드로워</Lib.Button>
          <Lib.Drawer isOpen={rightOpen} onClose={() => setRightOpen(false)} side="right">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b font-medium">제목</div>
              <div className="flex-1 p-4 overflow-auto">내용 영역</div>
              <div className="p-3 border-t text-right"><Lib.Button onClick={() => setRightOpen(false)}>닫기</Lib.Button></div>
            </div>
          </Lib.Drawer>
        </div>
      ),
      description: '기본(right) 드로워',
      code: `<Lib.Drawer isOpen={open} onClose={close} side="right">...</Lib.Drawer>`
    },
    {
      component: (
        <div>
          <Lib.Button onClick={() => setLeftOpen(true)}>왼쪽 드로워</Lib.Button>
          <Lib.Drawer isOpen={leftOpen} onClose={() => setLeftOpen(false)} side="left">
            <div className="h-full p-4">왼쪽에서 열림</div>
          </Lib.Drawer>
        </div>
      ),
      description: 'side = left',
      code: `<Lib.Drawer isOpen={open} onClose={close} side="left">...</Lib.Drawer>`
    }
  ];
  return examples;
};

