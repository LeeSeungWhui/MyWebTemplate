import * as Lib from '@/lib';

const CardExamples = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Lib.Card title="간단 카드" subtitle="보조 설명">
        내용 본문입니다. 간결하게.
      </Lib.Card>
      <Lib.Card title="액션 카드" actions={<button className="px-2 py-1 text-sm rounded bg-blue-600 text-white">Action</button>} footer="푸터 텍스트">
        <div className="space-y-2">
          <div>행 1</div>
          <div>행 2</div>
        </div>
      </Lib.Card>
    </div>
  );
};

export default CardExamples;

