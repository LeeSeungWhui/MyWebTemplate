/**
 * 파일명: BadgeExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Badge 컴포넌트 예제
 */
import * as Lib from '@/lib';

export const BadgeExamples = () => {
  const examples = [
    {
      component: (
        <div className="flex flex-wrap gap-2 items-center">
          <Lib.Badge>Neutral</Lib.Badge>
          <Lib.Badge variant="primary">Primary</Lib.Badge>
          <Lib.Badge variant="success">Success</Lib.Badge>
          <Lib.Badge variant="warning">Warning</Lib.Badge>
          <Lib.Badge variant="danger">Danger</Lib.Badge>
        </div>
      ),
      description: '기본/색상 Variant',
      code: `<Lib.Badge>Neutral</Lib.Badge>
<Lib.Badge variant="primary">Primary</Lib.Badge>
<Lib.Badge variant="success">Success</Lib.Badge>
<Lib.Badge variant="warning">Warning</Lib.Badge>
<Lib.Badge variant="danger">Danger</Lib.Badge>`
    },
    {
      component: (
        <div className="flex flex-wrap gap-2 items-center">
          <Lib.Badge variant="outline">Outline</Lib.Badge>
          <Lib.Badge pill>Rounded</Lib.Badge>
        </div>
      ),
      description: 'outline / pill',
      code: `<Lib.Badge variant="outline">Outline</Lib.Badge>
<Lib.Badge pill>Rounded</Lib.Badge>`
    },
    {
      component: (
        <div className="flex flex-wrap gap-2 items-center">
          <Lib.Badge size="sm">Small</Lib.Badge>
          <Lib.Badge size="md">Medium</Lib.Badge>
        </div>
      ),
      description: 'size: sm / md',
      code: `<Lib.Badge size="sm">Small</Lib.Badge>
<Lib.Badge size="md">Medium</Lib.Badge>`
    },
    {
      component: (
        <div className="flex flex-wrap gap-2 items-center">
          <Lib.Badge variant="success"><Lib.Icon icon="md:MdCheck" /> 완료</Lib.Badge>
          <Lib.Badge variant="warning"><Lib.Icon icon="md:MdSchedule" /> 진행중</Lib.Badge>
          <Lib.Badge variant="danger"><Lib.Icon icon="md:MdClose" /> 실패</Lib.Badge>
        </div>
      ),
      description: '아이콘을 포함한 Badge',
      code: `<Lib.Badge variant="success"><Lib.Icon icon="md:MdCheck" /> 완료</Lib.Badge>
<Lib.Badge variant="warning"><Lib.Icon icon="md:MdSchedule" /> 진행중</Lib.Badge>
<Lib.Badge variant="danger"><Lib.Icon icon="md:MdClose" /> 실패</Lib.Badge>`
    }
  ];

  return examples;
};

