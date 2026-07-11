/**
 * 파일명: BadgeExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Badge 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

/**
 * @description Badge 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @returns { variantExampleList: Array, outlineExampleList: Array, sizeExampleList: Array, iconExampleList: Array }
 * @updated 2026-02-24
 */
export const variantExampleList = [{
  component: <div className="flex flex-wrap items-center gap-2">
          <Lib.Badge pill>검토 대기</Lib.Badge>
          <Lib.Badge variant="primary" pill>신규 요청</Lib.Badge>
          <Lib.Badge variant="success" pill>운영 정상</Lib.Badge>
          <Lib.Badge variant="warning" pill>확인 필요</Lib.Badge>
          <Lib.Badge variant="danger" pill>장애 발생</Lib.Badge>
        </div>,
  description: '상태별 색상 Variant를 pill 형태로 정리',
  code: `<Lib.Badge pill>검토 대기</Lib.Badge>
<Lib.Badge variant="primary" pill>신규 요청</Lib.Badge>
<Lib.Badge variant="success" pill>운영 정상</Lib.Badge>
<Lib.Badge variant="warning" pill>확인 필요</Lib.Badge>
<Lib.Badge variant="danger" pill>장애 발생</Lib.Badge>`
}];
export const outlineExampleList = [{
  component: <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-4 ring-1 ring-slate-200/80">
          <Lib.Badge variant="outline">읽기 전용</Lib.Badge>
          <Lib.Badge variant="outline" pill>보조 필터</Lib.Badge>
          <Lib.Badge variant="primary" pill>활성 조건</Lib.Badge>
        </div>,
  description: 'outline은 보조 라벨, pill은 필터/상태 칩에 적합',
  code: `<Lib.Badge variant="outline">읽기 전용</Lib.Badge>
<Lib.Badge variant="outline" pill>보조 필터</Lib.Badge>
<Lib.Badge variant="primary" pill>활성 조건</Lib.Badge>`
}];
export const sizeExampleList = [{
  component: <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
            <span className="text-xs font-medium text-slate-500">테이블 행</span>
            <Lib.Badge size="sm" variant="success" pill>완료</Lib.Badge>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
            <span className="text-sm font-medium text-slate-700">카드 헤더</span>
            <Lib.Badge size="md" variant="primary" pill>진행 중</Lib.Badge>
          </div>
        </div>,
  description: 'sm은 밀도 높은 행, md는 카드/헤더 라벨에 사용',
  code: `<Lib.Badge size="sm" variant="success" pill>완료</Lib.Badge>
<Lib.Badge size="md" variant="primary" pill>진행 중</Lib.Badge>`
}];
export const iconExampleList = [{
  component: <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/80">
            <Lib.Badge variant="success" pill><Lib.Icon icon="md:MdCheck" /> 배포 완료</Lib.Badge>
            <p className="mt-2 text-xs text-slate-500">모든 smoke가 통과한 상태</p>
          </div>
          <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/80">
            <Lib.Badge variant="warning" pill><Lib.Icon icon="md:MdSchedule" /> 검토중</Lib.Badge>
            <p className="mt-2 text-xs text-slate-500">리뷰 또는 QA 대기</p>
          </div>
          <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/80">
            <Lib.Badge variant="danger" pill><Lib.Icon icon="md:MdClose" /> 차단됨</Lib.Badge>
            <p className="mt-2 text-xs text-slate-500">즉시 원인 확인 필요</p>
          </div>
        </div>,
  description: '아이콘을 포함해 상태 의미를 빠르게 스캔',
  code: `<Lib.Badge variant="success" pill><Lib.Icon icon="md:MdCheck" /> 배포 완료</Lib.Badge>
<Lib.Badge variant="warning" pill><Lib.Icon icon="md:MdSchedule" /> 검토중</Lib.Badge>
<Lib.Badge variant="danger" pill><Lib.Icon icon="md:MdClose" /> 차단됨</Lib.Badge>`
}];
