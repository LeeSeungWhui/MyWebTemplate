/**
 * 파일명: TooltipExamples.jsx
 * 설명: 앱용 Tooltip 예제
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { View } from 'react-native';
import * as Lib from '../../lib';

export const TooltipExamples = () => {
  return [
    {
      component: (
        <View className="flex-row items-center gap-4">
          <Lib.Tooltip content="기본 툴팁">
            <Lib.Button size="sm">Hover</Lib.Button>
          </Lib.Tooltip>
          <Lib.Tooltip content="포커스 가능">
            <Lib.Input placeholder="포커스하면 보임" className="w-36" />
          </Lib.Tooltip>
        </View>
      ),
      description: '기본 사용 (hover/focus).',
      code: `<Lib.Tooltip content="기본 툴팁">
  <Lib.Button size="sm">Hover</Lib.Button>
</Lib.Tooltip>`,
    },
    {
      component: (
        <View className="flex-row items-center gap-3 flex-wrap">
          <Lib.Tooltip content="위" placement="top"><Lib.Button size="sm">top</Lib.Button></Lib.Tooltip>
          <Lib.Tooltip content="아래" placement="bottom"><Lib.Button size="sm">bottom</Lib.Button></Lib.Tooltip>
          <Lib.Tooltip content="왼쪽" placement="left"><Lib.Button size="sm">left</Lib.Button></Lib.Tooltip>
          <Lib.Tooltip content="오른쪽" placement="right"><Lib.Button size="sm">right</Lib.Button></Lib.Tooltip>
        </View>
      ),
      description: 'placement: top/bottom/left/right.',
      code: `<Lib.Tooltip content="오른쪽" placement="right">
  <Lib.Button size="sm">right</Lib.Button>
</Lib.Tooltip>`,
    },
    {
      component: (
        <View className="flex-row items-center gap-4">
          <Lib.Tooltip content="클릭 트리거" trigger="click">
            <Lib.Button size="sm">Click</Lib.Button>
          </Lib.Tooltip>
        </View>
      ),
      description: 'trigger="click" 으로 클릭 시 표시.',
      code: `<Lib.Tooltip content="클릭" trigger="click">
  <Lib.Button size="sm">Click</Lib.Button>
</Lib.Tooltip>`,
    },
  ];
};
