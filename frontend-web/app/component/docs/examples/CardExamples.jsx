"use client";

/**
 * 파일명: CardExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-02
 * 설명: Card 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useGlobalUi } from '@/app/common/store/SharedStore';

/**
 * @description 액션 버튼이 포함된 카드 예시를 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 * @updated 2026-02-27
 */
const ActionCard = () => {
  const {
    showAlert
  } = useGlobalUi();
  return <Lib.Card
      title="배포 체크리스트"
      subtitle="릴리즈 전 필수 확인"
      actions={<Lib.Button size="sm" onClick={() => showAlert('체크리스트 액션')}>검토 시작</Lib.Button>}
      footer={<span>마지막 업데이트: 방금 전</span>}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200/80">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">완료</div>
          <div className="mt-1 text-lg font-semibold text-slate-950">12건</div>
        </div>
        <div className="rounded-lg bg-indigo-50 px-3 py-2 ring-1 ring-indigo-100">
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">진행 중</div>
          <div className="mt-1 text-lg font-semibold text-indigo-700">3건</div>
        </div>
      </div>
    </Lib.Card>;
};

/**
 * @description Card 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @returns { basicExampleList: Array, actionExampleList: Array, plainExampleList: Array, composedExampleList: Array }
 * @updated 2026-02-24
 */
export const basicExampleList = [{
  component: <Lib.Card title="프로젝트 요약" subtitle="이번 스프린트 핵심 지표">
          <div className="flex flex-wrap gap-2 text-sm">
            <Lib.Badge variant="success" pill>운영 정상</Lib.Badge>
            <Lib.Badge variant="primary" pill>12개 작업 완료</Lib.Badge>
            <Lib.Badge variant="neutral" pill>리뷰 2건 대기</Lib.Badge>
          </div>
        </Lib.Card>,
  description: '기본 Card: title + subtitle + 본문 조합',
  code: `<Lib.Card title="프로젝트 요약" subtitle="이번 스프린트 핵심 지표">
  <div className="flex flex-wrap gap-2 text-sm">
    <Lib.Badge variant="success" pill>운영 정상</Lib.Badge>
    <Lib.Badge variant="primary" pill>12개 작업 완료</Lib.Badge>
    <Lib.Badge variant="neutral" pill>리뷰 2건 대기</Lib.Badge>
  </div>
</Lib.Card>`
}];
export const actionExampleList = [{
  component: <ActionCard />,
  description: 'actions + footer 사용',
  code: `<Lib.Card
  title="배포 체크리스트"
  subtitle="릴리즈 전 필수 확인"
  actions={<Lib.Button size="sm" onClick={() => showAlert('체크리스트 액션')}>검토 시작</Lib.Button>}
  footer={<span>마지막 업데이트: 방금 전</span>}
>
  <div className="grid gap-3 sm:grid-cols-2">
    <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200/80">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">완료</div>
      <div className="mt-1 text-lg font-semibold text-slate-950">12건</div>
    </div>
    <div className="rounded-lg bg-indigo-50 px-3 py-2 ring-1 ring-indigo-100">
      <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600">진행 중</div>
      <div className="mt-1 text-lg font-semibold text-indigo-700">3건</div>
    </div>
  </div>
</Lib.Card>`
}];
export const plainExampleList = [{
  component: <Lib.Card className="bg-slate-950 text-white ring-slate-800" bodyClassName="p-5 text-slate-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">System note</div>
          <div className="mt-2 text-base font-semibold text-white">본문만으로도 강조되는 패널</div>
          <p className="mt-1 text-sm text-slate-300">간단한 안내, 공지, 상태 메모를 헤더 없이 표시할 때 사용합니다.</p>
        </Lib.Card>,
  description: '본문 전용 Card: className/bodyClassName으로 강조 패널 구성',
  code: `<Lib.Card className="bg-slate-950 text-white ring-slate-800" bodyClassName="p-5 text-slate-200">
  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">System note</div>
  <div className="mt-2 text-base font-semibold text-white">본문만으로도 강조되는 패널</div>
  <p className="mt-1 text-sm text-slate-300">간단한 안내, 공지, 상태 메모를 헤더 없이 표시할 때 사용합니다.</p>
</Lib.Card>`
}];
export const composedExampleList = [{
  component: <Lib.Card title="고객 세그먼트" subtitle="활성 사용자 그룹" actions={<Lib.Badge variant="primary" pill>New</Lib.Badge>} footer={<div className="flex items-center gap-2 text-xs text-slate-500"><Lib.Icon icon="md:MdSchedule" /> 업데이트: 방금 전</div>}>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100">
              <Lib.Icon icon="ri:RiUserSmileLine" size="22px" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">프리미엄 전환 후보</div>
              <div className="text-sm text-slate-500">최근 30일 활동량이 높은 계정 128개</div>
            </div>
          </div>
        </Lib.Card>,
  description: 'Badge, Icon 조합',
  code: `<Lib.Card
  title="고객 세그먼트"
  subtitle="활성 사용자 그룹"
  actions={<Lib.Badge variant="primary" pill>New</Lib.Badge>}
  footer={<div className="flex items-center gap-2 text-xs text-slate-500"><Lib.Icon icon="md:MdSchedule" /> 업데이트: 방금 전</div>}
>
  <div className="flex items-start gap-3">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100">
      <Lib.Icon icon="ri:RiUserSmileLine" size="22px" />
    </div>
    <div>
      <div className="font-semibold text-slate-900">프리미엄 전환 후보</div>
      <div className="text-sm text-slate-500">최근 30일 활동량이 높은 계정 128개</div>
    </div>
  </div>
</Lib.Card>`
}];
