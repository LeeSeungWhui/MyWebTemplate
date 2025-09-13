/**
 * 파일명: StatExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Stat 컴포넌트 사용 예제 모음
 */
import * as Lib from '@/lib';

/**
 * Stat 예시 목록을 반환
 * @date 2025-09-13
 */
export const StatExamples = () => {
  const examples = [
    {
      component: (
        <Lib.Stat label="주간 활성 사용자" value="12,340" delta="+3.2%" deltaType="up" />
      ),
      description: '증가 지표(up) 예시',
      code: `<Lib.Stat label="주간 활성 사용자" value="12,340" delta="+3.2%" deltaType="up" />`
    },
    {
      component: (
        <Lib.Stat label="월간 이탈률" value="1,024" delta="-1.1%" deltaType="down" />
      ),
      description: '감소 지표(down) 예시',
      code: `<Lib.Stat label="월간 이탈률" value="1,024" delta="-1.1%" deltaType="down" />`
    },
    {
      component: (
        <Lib.Stat label="서버 상태" value="정상" deltaType="neutral" />
      ),
      description: '중립 지표(neutral) 예시',
      code: `<Lib.Stat label="서버 상태" value="정상" deltaType="neutral" />`
    },
  ];
  return examples;
};

