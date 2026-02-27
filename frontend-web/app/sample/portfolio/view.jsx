"use client";
/**
 * 파일명: sample/portfolio/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: 공개 포트폴리오 페이지 뷰(시각 중심 리뉴얼)
 */

import Image from "next/image";
import Link from "next/link";
import LANG_KO from "./lang.ko";

const flowItemClassName =
  "relative rounded-xl border border-blue-100 bg-white px-4 py-4 text-center shadow-sm";

/**
 * @description 공개 포트폴리오 콘텐츠를 시각 섹션으로 구성해 렌더링. 입력/출력 계약을 함께 명시
 * @param {{ content: any }} props
 * @returns {JSX.Element}
 */
const PortfolioView = ({ content }) => {

  return (
    <>
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e3a5f] to-[#312e81] px-6 py-10 text-white shadow-xl sm:px-10">
        <p className="text-xs font-semibold tracking-wide text-blue-100">
          {LANG_KO.view.heroBadge}
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
        <h2 className="text-2xl font-bold text-gray-900">{LANG_KO.view.sectionTitle.overview}</h2>
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

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <details open={false}>
          <summary className="cursor-pointer list-none text-2xl font-bold text-gray-900">
            {LANG_KO.view.sectionTitle.profile}
          </summary>
          <p className="mt-2 text-sm text-gray-600">{content.profile.tagline}</p>
          <div className="mt-4">
            <p className="text-sm text-gray-500">{LANG_KO.view.label.developer}</p>
            <p className="text-lg font-semibold text-gray-900">
              {content.profile.name} · {content.profile.role}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(content.profile.quickFacts || []).map((fact) => (
              <span
                key={fact}
                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
              >
                {fact}
              </span>
            ))}
          </div>

          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            {(content.profile.strengths || []).map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <h3 className="text-base font-semibold text-gray-900">{LANG_KO.view.sectionTitle.featuredProjects}</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {(content.profile.featuredProjects || []).map((projectItem) => (
                <article
                  key={projectItem.title}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <p className="text-sm font-semibold text-gray-900">{projectItem.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{projectItem.period}</p>
                  <p className="mt-2 text-sm text-gray-700">{projectItem.summary}</p>
                  <p className="mt-2 text-xs text-gray-600">{projectItem.stack}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-base font-semibold text-gray-900">{LANG_KO.view.sectionTitle.careerTimeline}</h3>
            <div className="mt-3 space-y-2">
              {(content.profile.careerTimeline || []).map((companyItem) => (
                <details
                  key={companyItem.company}
                  className="rounded-lg border border-gray-200 bg-white p-3"
                >
                  <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900">
                    {companyItem.company} · {companyItem.period}
                  </summary>
                  <p className="mt-2 text-xs text-gray-500">
                    {companyItem.position} · {companyItem.summary}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    {(companyItem.highlights || []).map((line) => (
                      <li key={line} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-400" aria-hidden />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-base font-semibold text-gray-900">{LANG_KO.view.sectionTitle.education}</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {(content.profile.education || []).map((educationItem) => (
                <article
                  key={educationItem.school}
                  className="rounded-lg border border-gray-200 bg-white p-3"
                >
                  <p className="text-sm font-semibold text-gray-900">{educationItem.school}</p>
                  {educationItem.period ? (
                    <p className="mt-1 text-xs text-gray-500">{educationItem.period}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-gray-600">{educationItem.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-base font-semibold text-gray-900">{LANG_KO.view.sectionTitle.research}</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {(content.profile.research || []).map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </details>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900">{LANG_KO.view.sectionTitle.strengths}</h2>
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
        <h2 className="text-2xl font-bold text-gray-900">{LANG_KO.view.sectionTitle.architecture}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {LANG_KO.view.label.architectureDescription}
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {content.architectureFlow.map((stepItem, index) => (
            <div key={stepItem.title} className="contents">
              <div className={`${flowItemClassName} min-h-[116px]`}>
                <p className="text-2xl" aria-hidden>
                  {stepItem.icon}
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-900">{stepItem.title}</p>
                <p className="mt-1 text-xs text-gray-600">{stepItem.description}</p>
              </div>
              {index < content.architectureFlow.length - 1 ? (
                <div className="hidden items-center justify-center text-xl text-gray-400 md:flex">
                  →
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900">{LANG_KO.view.sectionTitle.demoFlow}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {content.demoFlow.map((item) => (
            <article
              key={item.path}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="relative h-40 w-full bg-gray-100">
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="space-y-2 p-4">
                <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.note}</p>
                <Link
                  href={item.path}
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  {LANG_KO.view.label.moveSample}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <details className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm" open={false}>
          <summary className="cursor-pointer list-none text-base font-semibold text-gray-900">
            {LANG_KO.view.sectionTitle.technicalNotes}
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
    </>
  );
};

export default PortfolioView;
