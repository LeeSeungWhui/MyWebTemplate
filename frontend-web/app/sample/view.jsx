"use client";
/**
 * 파일명: sample/view.jsx
 * 작성자: Codex
 * 갱신일: 2026-03-06
 * 설명: 공개 샘플 허브 페이지 뷰(DB overview 연동)
 */

import Link from "next/link";
import Card from "@/app/lib/component/Card";
import Icon from "@/app/lib/component/Icon";
import Stat from "@/app/lib/component/Stat";
import { PAGE_CONFIG } from "./initData";
import { usePageData } from "@/app/lib/hooks/usePageData";
import LANG_KO from "./lang.ko";

const { initData } = LANG_KO;

const DEMO_HUB_HEADER = {
  title: initData.header.title,
  subtitle: initData.header.subtitle,
};
const DEMO_HUB_CARD_LIST = initData.cardList.map((item) => ({ ...item }));
const DEMO_HUB_EXTRA_LINK_LIST = initData.extraLinkList.map((item) => ({ ...item }));

/**
 * @description 공개 샘플 허브 화면을 렌더링. 입력/출력 계약을 함께 명시
 * 처리 규칙: 허브 카드/링크는 정적 리소스를 유지하고, overview 숫자만 DB 응답을 사용한다.
 * @returns {JSX.Element}
 */
const DemoHubView = ({ initialDataObj, initialErrorObj }) => {
  /* 1. 상수 ======================================================================================================================= */
  // 없음

  /* 2. 데이터 ======================================================================================================================= */
  const { mode: pageMode, dataObj, isLoading } = usePageData({
    pageConfig: PAGE_CONFIG,
    initialDataObj,
    initialErrorObj,
  });
  const overview = dataObj?.overview?.result || {};
  const taskCount = Number(overview?.taskCount || 0);
  const adminUserCount = Number(overview?.adminUserCount || 0);
  const formSubmissionCount = Number(overview?.formSubmissionCount || 0);
  const statCardList = [
    {
      label: LANG_KO.view.statLabel.taskCount,
      value: taskCount.toLocaleString("ko-KR"),
      deltaType: "neutral",
    },
    {
      label: LANG_KO.view.statLabel.adminUserCount,
      value: adminUserCount.toLocaleString("ko-KR"),
      deltaType: "neutral",
    },
    {
      label: LANG_KO.view.statLabel.formSubmissionCount,
      value: formSubmissionCount.toLocaleString("ko-KR"),
      deltaType: "neutral",
    },
  ];

  /* 3. UI ========================================================================================================================= */
  // 없음

  /* 4. 팝업 ======================================================================================================================= */
  // 없음

  /* 5. 기타 ======================================================================================================================= */
  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */
  // 없음

  /* 7. 함수 ======================================================================================================================= */
  // 없음

  /* 8. useEffect ================================================================================================================== */
  // 없음

  /* 9. 내부 컴포넌트 ============================================================================================================== */
  // 없음

  /* 10. 렌더링 ==================================================================================================================== */
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8" data-page-mode={pageMode}>
      <section className="mb-6 rounded-2xl bg-gradient-to-r from-[#1e3a5f] to-[#312e81] px-6 py-7 text-white shadow-lg">
        <p className="text-xs font-semibold tracking-wide text-blue-100">
          {LANG_KO.view.heroBadge}
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
          {DEMO_HUB_HEADER.title}
        </h1>
        <p className="mt-3 text-sm text-blue-50 sm:text-base">
          {DEMO_HUB_HEADER.subtitle}
        </p>
      </section>

      <section className="mb-6 grid gap-3 md:grid-cols-3">
        {statCardList.map((item) => (
          <Stat
            key={item.label}
            {...item}
            className="p-1"
            value={isLoading ? "..." : item.value}
          />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {DEMO_HUB_CARD_LIST.map((cardItem) => (
          <Card key={cardItem.href} className="overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <Icon icon={cardItem.icon} />
                </span>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                  {cardItem.badge}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{cardItem.title}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {cardItem.description}
                </p>
              </div>
              <Link
                href={cardItem.href}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {LANG_KO.view.openSampleButton}
              </Link>
            </div>
          </Card>
        ))}
      </section>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-700 shadow-sm">
        <p className="font-semibold text-gray-900">{LANG_KO.view.extraSectionTitle}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DEMO_HUB_EXTRA_LINK_LIST.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DemoHubView;
