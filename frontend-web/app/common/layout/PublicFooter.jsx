/**
 * 파일명: common/layout/PublicFooter.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-24
 * 설명: 공개 페이지 공통 푸터
 */

import Link from "next/link";
import { COMMON_COMPONENT_LANG_KO } from "@/app/common/i18n/lang.ko";

const FOOTER_LINK_LIST = COMMON_COMPONENT_LANG_KO.publicLayout.footerLinkList;

/**
 * @description  공개 페이지 공통 푸터를 렌더링한다. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const PublicFooter = () => {
  return (
    <footer className="mt-16 border-t border-white/10 bg-gray-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-gray-300 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="font-medium text-gray-100">MyWebTemplate</p>
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} MyWebTemplate. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {FOOTER_LINK_LIST.map((menuItem) => {
            if (menuItem.external) {
              return (
                <a
                  key={menuItem.href}
                  href={menuItem.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-300 transition hover:text-white"
                >
                  {menuItem.label}
                </a>
              );
            }
            return (
              <Link
                key={menuItem.href}
                href={menuItem.href}
                className="text-gray-300 transition hover:text-white"
              >
                {menuItem.label}
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
