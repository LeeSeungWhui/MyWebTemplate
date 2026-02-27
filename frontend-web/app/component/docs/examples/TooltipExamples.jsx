/**
 * 파일명: TooltipExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 툴팁 컴포넌트 예시 모음
 */
import * as Lib from '@/app/lib';

/**
 * 툴팁 예시 목록을 반환
 * @date 2025-09-13
 */

/**
 * @description TooltipExamples 구성 데이터를 반환. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 입력값과 상태를 검증해 UI/데이터 흐름을 안전하게 유지한다.
 */
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
    },
    {
      component: (
        <div className="flex gap-4 items-center">
          <Lib.Tooltip content="클릭 트리거" trigger="click">
            <Lib.Button>Click</Lib.Button>
          </Lib.Tooltip>
        </div>
      ),
      description: 'trigger="click" 으로 클릭 시 표시',
      code: `<Lib.Tooltip content="클릭" trigger="click"><Lib.Button>Click</Lib.Button></Lib.Tooltip>`
    }
  ];
  return examples;
};
