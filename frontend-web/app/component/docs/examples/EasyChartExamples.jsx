/**
 * 파일명: EasyChartExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: EasyChart 사용 예시 모음
 */

import EasyChart from "@/app/lib/component/EasyChart";
import Button from "@/app/lib/component/Button";
const sampleDataList = [{
  label: "1월",
  signups: 120,
  active: 90,
  churn: 12
}, {
  label: "2월",
  signups: 150,
  active: 110,
  churn: 15
}, {
  label: "3월",
  signups: 180,
  active: 130,
  churn: 18
}, {
  label: "4월",
  signups: 220,
  active: 170,
  churn: 16
}, {
  label: "5월",
  signups: 240,
  active: 190,
  churn: 20
}];

/**
 * @description EasyChart 예제 계약
 * 처리 규칙: 정적 차트 계약을 모듈 export const로 직접 유지한다.
 */
export const easyChartExampleList = [{
  anchor: "easychart-line",
  description: "기본 라인 차트 예시",
  component: <EasyChart title="월별 가입 추이" subtitle="가입자와 활성 이용자 비교" dataList={sampleDataList} seriesList={[{
    seriesId: "signups",
    seriesNm: "가입자",
    dataKey: "signups",
    color: "#4f46e5"
  }, {
    seriesId: "active",
    seriesNm: "활성이용자",
    dataKey: "active",
    color: "#10b981"
  }]} xKey="label" type="line" hideLegend={false} height={260} actions={<Button size="sm">내보내기</Button>} />,
  code: `<EasyChart
  title="월별 가입 추이"
  subtitle="가입자와 활성 이용자 비교"
  dataList={sampleDataList}
  seriesList={[
    { seriesId: "signups", seriesNm: "가입자", dataKey: "signups", color: "#4f46e5" },
    { seriesId: "active", seriesNm: "활성이용자", dataKey: "active", color: "#10b981" },
  ]}
  xKey="label"
  type="line"
  hideLegend={false}
  height={260}
  actions={<Button size="sm">내보내기</Button>}
/>`
}, {
  anchor: "easychart-bar",
  description: "단일 바 차트",
  component: <EasyChart title="월별 유입 비교" subtitle="가입자/활성 이용자 막대 비교" dataList={sampleDataList} seriesList={[{
    seriesId: "signups",
    seriesNm: "가입자",
    dataKey: "signups",
    type: "bar",
    color: "#4f46e5"
  }, {
    seriesId: "active",
    seriesNm: "활성이용자",
    dataKey: "active",
    type: "bar",
    color: "#10b981"
  }]} xKey="label" type="bar" hideLegend height={260} />,
  code: `<EasyChart
  title="월별 유입 비교"
  subtitle="가입자/활성 이용자 막대 비교"
  dataList={sampleDataList}
  seriesList={[
    { seriesId: "signups", seriesNm: "가입자", dataKey: "signups", type: "bar", color: "#4f46e5" },
    { seriesId: "active", seriesNm: "활성이용자", dataKey: "active", type: "bar", color: "#10b981" },
  ]}
  xKey="label"
  type="bar"
  hideLegend
  height={260}
/>`
}, {
  anchor: "easychart-mixed",
  description: "바+라인 혼합 스택 차트",
  component: <EasyChart title="획득/이탈 믹스" subtitle="스택 막대와 이탈 라인 동시 확인" dataList={sampleDataList} seriesList={[{
    seriesId: "signups",
    seriesNm: "가입자",
    dataKey: "signups",
    type: "bar",
    color: "#4f46e5",
    stackId: "v"
  }, {
    seriesId: "active",
    seriesNm: "활성이용자",
    dataKey: "active",
    type: "bar",
    color: "#10b981",
    stackId: "v"
  }, {
    seriesId: "churn",
    seriesNm: "이탈",
    dataKey: "churn",
    type: "line",
    color: "#f43f5e"
  }]} xKey="label" type="bar" hideLegend={false} xLabelFormatter={label => `${label} /22`} yLabelFormatter={val => `${val}명`} height={260} />,
  code: `<EasyChart
  title="획득/이탈 믹스"
  subtitle="스택 막대와 이탈 라인 동시 확인"
  dataList={sampleDataList}
  seriesList={[
    { seriesId: "signups", seriesNm: "가입자", dataKey: "signups", type: "bar", color: "#4f46e5", stackId: "v" },
    { seriesId: "active", seriesNm: "활성이용자", dataKey: "active", type: "bar", color: "#10b981", stackId: "v" },
    { seriesId: "churn", seriesNm: "이탈", dataKey: "churn", type: "line", color: "#f43f5e" },
  ]}
  xKey="label"
  type="bar"
  hideLegend={false}
  xLabelFormatter={(label) => \`\${label} /22\`}
  yLabelFormatter={(val) => \`\${val}명\`}
  height={260}
/>`
}, {
  anchor: "easychart-pie",
  description: "파이 차트",
  component: <EasyChart title="가입 구성 비율" subtitle="월별 데이터의 구성 분포" dataList={sampleDataList} seriesList={[{
    seriesId: "signups",
    seriesNm: "가입자",
    dataKey: "signups",
    type: "pie",
    color: "#4f46e5"
  }, {
    seriesId: "active",
    seriesNm: "활성이용자",
    dataKey: "active",
    type: "pie",
    color: "#10b981"
  }, {
    seriesId: "churn",
    seriesNm: "이탈",
    dataKey: "churn",
    type: "pie",
    color: "#f43f5e"
  }]} xKey="label" type="pie" hideLegend={false} height={260} />,
  code: `<EasyChart
  title="가입 구성 비율"
  subtitle="월별 데이터의 구성 분포"
  dataList={sampleDataList}
  seriesList={[
    { seriesId: "signups", seriesNm: "가입자", dataKey: "signups", type: "pie", color: "#4f46e5" },
    { seriesId: "active", seriesNm: "활성이용자", dataKey: "active", type: "pie", color: "#10b981" },
    { seriesId: "churn", seriesNm: "이탈", dataKey: "churn", type: "pie", color: "#f43f5e" },
  ]}
  xKey="label"
  type="pie"
  hideLegend={false}
  height={260}
/>`
}, {
  anchor: "easychart-donut",
  description: "도넛 차트",
  component: <EasyChart title="활동 비중 도넛" subtitle="주요 지표의 상대 비중" dataList={sampleDataList} seriesList={[{
    seriesId: "signups",
    seriesNm: "가입자",
    dataKey: "signups",
    type: "donut",
    color: "#4f46e5"
  }, {
    seriesId: "active",
    seriesNm: "활성이용자",
    dataKey: "active",
    type: "donut",
    color: "#10b981"
  }, {
    seriesId: "churn",
    seriesNm: "이탈",
    dataKey: "churn",
    type: "donut",
    color: "#f43f5e"
  }]} xKey="label" type="donut" hideLegend height={260} />,
  code: `<EasyChart
  title="활동 비중 도넛"
  subtitle="주요 지표의 상대 비중"
  dataList={sampleDataList}
  seriesList={[
    { seriesId: "signups", seriesNm: "가입자", dataKey: "signups", type: "donut", color: "#4f46e5" },
    { seriesId: "active", seriesNm: "활성이용자", dataKey: "active", type: "donut", color: "#10b981" },
    { seriesId: "churn", seriesNm: "이탈", dataKey: "churn", type: "donut", color: "#f43f5e" },
  ]}
  xKey="label"
  type="donut"
  hideLegend
  height={260}
/>`
}, {
  anchor: "easychart-loading",
  description: "로딩 상태",
  component: <EasyChart title="차트 로딩" dataList={[]} seriesList={[]} xKey="label" loading hideLegend />,
  code: `<EasyChart title="차트 로딩" dataList={[]} seriesList={[]} xKey="label" loading hideLegend />`
}, {
  anchor: "easychart-empty",
  description: "빈 상태",
  component: <EasyChart title="빈 차트" dataList={[]} seriesList={[]} xKey="label" status="empty" empty="데이터 없음" />,
  code: `<EasyChart title="빈 차트" dataList={[]} seriesList={[]} xKey="label" status="empty" empty="데이터 없음" />`
}, {
  anchor: "easychart-error",
  description: "에러 상태 + 에러 메시지 표시",
  component: <EasyChart title="차트 오류" dataList={sampleDataList} seriesList={[]} xKey="label" status="error" errorText="API 에러가 발생했습니다." />,
  code: `<EasyChart title="차트 오류" dataList={sampleDataList} seriesList={[]} xKey="label" status="error" errorText="API 에러가 발생했습니다." />`
}];
