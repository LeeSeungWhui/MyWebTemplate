"use client";
/**
 * 파일명: demo/portfolio/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 공개 포트폴리오 페이지 뷰(시각 중심 리뉴얼)
 */

import Link from "next/link";
import PublicPageShell from "@/app/common/layout/PublicPageShell";

const flowItemClassName =
  "relative rounded-xl border border-blue-100 bg-white px-4 py-4 text-center shadow-sm";

const PortfolioView = ({ content }) => {
  return (
    <PublicPageShell contentClassName="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e3a5f] to-[#312e81] px-6 py-10 text-white shadow-xl sm:px-10">
        <p className="text-xs font-semibold tracking-wide text-blue-100">
          PUBLIC PORTFOLIO
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
          {content.hero.title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-blue-50 sm:text-base">
          {content.hero.subtitle}
        </p>
        <ul className="mt-5 space-y-2 text-sm text-blue-50">
          {content.hero.summary.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-200" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          {content.hero.cta.map((ctaItem) => (
            <Link
              key={ctaItem.href}
              href={ctaItem.href}
              className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold transition ${
                ctaItem.variant === "outline"
                  ? "border border-blue-200 text-blue-50 hover:bg-white/10"
                  : "bg-blue-500 text-white hover:bg-blue-400"
              }`}
            >
              {ctaItem.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900">프로젝트 개요</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {content.overview.map((item) => (
            <article
              key={item.label}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="mt-2 text-sm font-semibold text-gray-900">{item.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900">핵심 구현</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {content.features.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">아키텍처</h2>
        <p className="mt-2 text-sm text-gray-600">
          Browser → Nginx → FastAPI + Next.js 흐름으로 공개/보호 경로와 API를 분리 운영합니다.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1.4fr]">
          <div className={flowItemClassName}>{content.architectureFlow[0]}</div>
          <div className="flex items-center justify-center text-xl text-gray-400">→</div>
          <div className={flowItemClassName}>{content.architectureFlow[1]}</div>
          <div className="flex items-center justify-center text-xl text-gray-400">→</div>
          <div className={flowItemClassName}>{content.architectureFlow[2]}</div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900">데모 동선</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {content.demoFlow.map((item) => (
            <article
              key={item.path}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div
                role="img"
                aria-label={`${item.name} 스크린샷 자리`}
                className="flex h-40 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-xs font-medium text-gray-500"
              >
                Screenshot Placeholder
              </div>
              <div className="space-y-2 p-4">
                <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.note}</p>
                <Link
                  href={item.path}
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  데모 이동
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900">스택 뱃지</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {content.stack.map((item) => (
            <span
              key={item}
              className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <details className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm" open={false}>
          <summary className="cursor-pointer list-none text-base font-semibold text-gray-900">
            기술 상세 노트 (필요할 때만 열기)
          </summary>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {content.technicalNotes.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </details>
      </section>
    </PublicPageShell>
  );
};

export default PortfolioView;
