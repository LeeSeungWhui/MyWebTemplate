/**
 * 파일명: demo/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 데모 허브 페이지 뷰
 */

import Link from "next/link";
import Card from "@/app/lib/component/Card";
import Icon from "@/app/lib/component/Icon";
import {
  DEMO_HUB_CARD_LIST,
  DEMO_HUB_EXTRA_LINK_LIST,
  DEMO_HUB_HEADER,
} from "./initData";

/**
 * @description 공개 데모 허브 화면을 렌더링한다.
 */
const DemoHubView = () => {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-2xl bg-gradient-to-r from-[#1e3a5f] to-[#312e81] px-6 py-7 text-white shadow-lg">
        <p className="text-xs font-semibold tracking-wide text-blue-100">
          PUBLIC DEMO HUB
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
          {DEMO_HUB_HEADER.title}
        </h1>
        <p className="mt-3 text-sm text-blue-50 sm:text-base">
          {DEMO_HUB_HEADER.subtitle}
        </p>
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
                데모 열기
              </Link>
            </div>
          </Card>
        ))}
      </section>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-700 shadow-sm">
        <p className="font-semibold text-gray-900">추가 자료</p>
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
