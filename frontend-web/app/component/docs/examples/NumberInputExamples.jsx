/**
 * 파일명: NumberInputExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: NumberInput 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

/**
 * @description BoundNumberDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const BoundNumberDemo = () => {
  const numberDataObj = Lib.EasyObj({
    seatCount: 3
  });

  return <div className="space-y-2">
      <label htmlFor="number-seat-count" className="block text-sm font-semibold text-slate-900">초대 좌석 수</label>
      <Lib.NumberInput id="number-seat-count" dataObj={numberDataObj} dataKey="seatCount" min={1} max={20} step={1} className="max-w-xs" />
      <div className="text-xs text-slate-500">form.seatCount = {String(numberDataObj.seatCount)}명</div>
    </div>;
};

/**
 * @description RangeNumberDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const RangeNumberDemo = () => {
  const priceDataObj = Lib.EasyObj({
    discountRate: 7.5
  });

  return <div className="space-y-2">
      <label htmlFor="number-discount-rate" className="block text-sm font-semibold text-slate-900">할인율</label>
      <Lib.NumberInput id="number-discount-rate" dataObj={priceDataObj} dataKey="discountRate" min={0} max={50} step={0.5} className="max-w-xs" />
      <p className="text-xs text-slate-500">0.5% 단위로 0~50% 범위 안에서 조정합니다.</p>
    </div>;
};

/**
 * @description UnboundNumberDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const UnboundNumberDemo = () => {
  return <div className="space-y-2">
      <label htmlFor="number-report-cycle" className="block text-sm font-semibold text-slate-900">리포트 주기</label>
      <Lib.NumberInput id="number-report-cycle" defaultValue={10} min={5} step={5} className="max-w-xs" />
      <p className="text-xs text-slate-500">간단한 독립 입력으로 5일 단위 초기값을 제공합니다.</p>
    </div>;
};

/**
 * @description NumberInput 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 단건 섹션은 ExampleObj로 노출하고 상태는 demo 컴포넌트 안에만 둔다.
 */
export const basicExampleObj = {
  exampleId: 'bound',
  component: <BoundNumberDemo />,
  description: '좌석 수처럼 최소/최대 범위가 있는 기본 바운드 숫자 입력',
  code: `const numberDataObj = Lib.EasyObj({ seatCount: 3 });

<Lib.NumberInput
  id="number-seat-count"
  dataObj={numberDataObj}
  dataKey="seatCount"
  min={1}
  max={20}
  step={1}
/>`
};

export const rangeExampleObj = {
  exampleId: 'range',
  component: <RangeNumberDemo />,
  description: '소수 step을 쓰는 비율 입력과 min/max 보정',
  code: `<Lib.NumberInput
  id="number-discount-rate"
  dataObj={priceDataObj}
  dataKey="discountRate"
  min={0}
  max={50}
  step={0.5}
/>`
};

export const unboundExampleObj = {
  exampleId: 'unbound',
  component: <UnboundNumberDemo />,
  description: 'state 바인딩 없이 defaultValue로 시작하는 독립 숫자 입력',
  code: '<Lib.NumberInput id="number-report-cycle" defaultValue={10} min={5} step={5} />'
};
