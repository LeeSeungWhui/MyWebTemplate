/**
 * 파일명: EmptyExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Empty 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

/**
 * @description EmptyExamples 구성 데이터를 반환한다.
 * @returns {Array<{ component: JSX.Element, code: string }>}
 * @updated 2026-02-24
 */
export const EmptyExamples = () => {
  const examples = [
    {
      component: (
        <Lib.Empty />
      ),
      description: '기본 Empty',
      code: `<Lib.Empty />`
    },
    {
      component: (
        <Lib.Empty title="검색 결과 없음" description="다른 키워드로 다시 시도해 보세요" action={<Lib.Button>새로 만들기</Lib.Button>} />
      ),
      description: '설명/액션 포함',
      code: `<Lib.Empty title="검색 결과 없음" description="다른 키워드로 다시 시도해 보세요" action={<Lib.Button>새로 만들기</Lib.Button>} />`
    }
  ];
  return examples;
};
