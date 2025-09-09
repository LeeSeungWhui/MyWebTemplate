import * as Lib from '@/lib';

const BadgeExamples = () => {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Lib.Badge>Neutral</Lib.Badge>
      <Lib.Badge variant="primary">Primary</Lib.Badge>
      <Lib.Badge variant="success">Success</Lib.Badge>
      <Lib.Badge variant="warning">Warning</Lib.Badge>
      <Lib.Badge variant="danger">Danger</Lib.Badge>
      <Lib.Badge variant="outline">Outline</Lib.Badge>
      <Lib.Badge pill>Rounded</Lib.Badge>
      <Lib.Badge size="md">Medium</Lib.Badge>
    </div>
  );
};

export default BadgeExamples;

