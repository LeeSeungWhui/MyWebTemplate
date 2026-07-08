/**
 * 파일명: StatExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Stat 컴포넌트 사용 예제 모음
 */
import * as Lib from '@/app/lib';

/**
 * Stat 예시 목록을 반환
 * @date 2025-09-13
 */

/**
 * @description Stat 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @returns { basicExampleList: Array, extraExampleList: Array }
 * @updated 2026-02-24
 */
export const basicExampleList = [{
  component: <div className="max-w-sm">
          <Lib.Stat
            label="이번 주 활성 사용자"
            value="12,340"
            delta="+3.2%"
            deltaType="up"
            helpText="지난 7일 기준, 전주 대비"
            icon={<Lib.Icon icon="ri:RiUserHeartLine" className="h-5 w-5 text-indigo-600" />}
            className="border-slate-200/80 shadow-sm ring-1 ring-slate-900/5"
          />
        </div>,
  description: '증가 지표를 아이콘과 도움말로 보강',
  code: `<Lib.Stat
  label="이번 주 활성 사용자"
  value="12,340"
  delta="+3.2%"
  deltaType="up"
  helpText="지난 7일 기준, 전주 대비"
  icon={<Lib.Icon icon="ri:RiUserHeartLine" className="h-5 w-5 text-indigo-600" />}
/>`
}];
export const extraExampleList = [{
  component: <div className="grid gap-3 md:grid-cols-3">
          <Lib.Stat
            label="완료된 요청"
            value="1,024"
            delta="+84"
            deltaType="up"
            helpText="오늘 처리량"
            icon={<Lib.Icon icon="md:MdCheckCircle" className="h-5 w-5 text-emerald-600" />}
            className="border-slate-200/80 shadow-sm ring-1 ring-slate-900/5"
          />
          <Lib.Stat
            label="대기 시간"
            value="132ms"
            delta="-18ms"
            deltaType="down"
            helpText="평균 응답 시간"
            icon={<Lib.Icon icon="md:MdSpeed" className="h-5 w-5 text-indigo-600" />}
            className="border-slate-200/80 shadow-sm ring-1 ring-slate-900/5"
          />
          <Lib.Stat
            label="리뷰 대기"
            value="6건"
            delta="동일"
            deltaType="neutral"
            helpText="전일 대비 변화 없음"
            icon={<Lib.Icon icon="md:MdRateReview" className="h-5 w-5 text-slate-500" />}
            className="border-slate-200/80 shadow-sm ring-1 ring-slate-900/5"
          />
        </div>,
  description: '여러 KPI를 같은 grid 밀도로 배치',
  code: `<div className="grid gap-3 md:grid-cols-3">
  <Lib.Stat label="완료된 요청" value="1,024" delta="+84" deltaType="up" />
  <Lib.Stat label="대기 시간" value="132ms" delta="-18ms" deltaType="down" />
  <Lib.Stat label="리뷰 대기" value="6건" delta="동일" deltaType="neutral" />
</div>`
}, {
  component: <div className="max-w-sm rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
          <Lib.Stat
            label="서비스 상태"
            value="정상"
            delta="99.99%"
            deltaType="neutral"
            helpText="최근 30일 가용성"
            icon={<Lib.Icon icon="md:MdCloudDone" className="h-5 w-5 text-emerald-600" />}
            className="border-slate-200/80 shadow-sm ring-1 ring-slate-900/5"
          />
        </div>,
  description: '상태형 값과 가용성 보조 텍스트 조합',
  code: `<Lib.Stat
  label="서비스 상태"
  value="정상"
  delta="99.99%"
  deltaType="neutral"
  helpText="최근 30일 가용성"
  icon={<Lib.Icon icon="md:MdCloudDone" className="h-5 w-5 text-emerald-600" />}
/>`
}];
