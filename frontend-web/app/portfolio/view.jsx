"use client"
/**
 * 파일명: portfolio/view.jsx
 * 작성자: Codex
 * 갱신일: 2026-02-22
 * 설명: 공개 포트폴리오 페이지 뷰
 */

import Link from 'next/link'

const PortfolioView = ({ mode, content }) => {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold tracking-wide text-blue-600">PUBLIC PORTFOLIO</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{content.hero.title}</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">{content.hero.subtitle}</p>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          {content.hero.summary.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="rounded-full bg-gray-100 px-3 py-1">Mode: {mode.MODE}</span>
          <span className="rounded-full bg-gray-100 px-3 py-1">Path: {mode.PUBLIC_PATH}</span>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        {content.overview.map((item) => (
          <article key={item.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">{item.label}</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">핵심 구현 내용</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {content.features.map((item) => (
            <article key={item.title} className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">내 역할</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {content.role.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gray-400" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">신뢰 포인트</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {content.reliability.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-semibold text-gray-900">데모 동선</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {content.demoFlow.map((item) => (
            <article key={item.path} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
              <p className="mt-2 text-xs text-gray-500">{item.note}</p>
              <Link
                href={item.path}
                className="mt-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                {item.path}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-semibold text-gray-900">사용 스택</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {content.stack.map((item) => (
            <span key={item} className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs text-gray-700">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <details className="rounded-xl border border-gray-200 bg-white p-5" open={false}>
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
    </main>
  )
}

export default PortfolioView
