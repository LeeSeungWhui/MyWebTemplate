/**
 * 파일명: common/layout/Footer.jsx
 * 작성자: Codex
 * 갱신일: 2025-11-26
 * 설명: 대시보드 공용 푸터(EasyObj/EasyList 기반)
 */

import Link from "next/link";
import { useMemo } from "react";
import { getBoundValue } from "@/app/lib/binding";

const isListLike = (list) => !!list && (typeof list.size === "function" || Array.isArray(list));
const toArray = (list) => {
  if (Array.isArray(list)) return list;
  if (isListLike(list)) {
    const size = typeof list.size === "function" ? list.size() : 0;
    return Array.from({ length: size }, (_, idx) => (typeof list.get === "function" ? list.get(idx) : undefined));
  }
  return [];
};

/**
 * @description 레이아웃 하단 공용 푸터
 * @param {Object} props
 * @description 레이아웃 하단 공용 푸터(EasyObj/EasyList 전용)
 * @param {Object} props
 * @param {Object} [props.textObj] EasyObj에서 텍스트를 읽을 객체
 * @param {string} [props.textKey] EasyObj 텍스트 키
 * @param {Array|Object} [props.linkList] EasyList 또는 배열 { linkId, linkNm, href, active }
 * @param {React.ReactNode} [props.logo] 좌측 로고/텍스트 영역
 * @param {string} [props.className] 추가 클래스
 */
const Footer = ({
  textObj,
  textKey = "footerText",
  linkList,
  logo,
  className = "",
}) => {
  const resolvedText = (textObj && textKey ? getBoundValue(textObj, textKey) : null) ?? "© 2025 MyWebTemplate";

  const resolvedLinks = useMemo(() => {
    return toArray(linkList).map((item) => ({
      key: item.linkId ?? item.id ?? item.href ?? item.linkNm ?? item.label,
      label: item.linkNm ?? item.label ?? item.text ?? "링크",
      href: item.href,
      active: !!item.active,
    }));
  }, [linkList]);

  return (
    <footer
      className={`border-t border-gray-200 bg-white px-6 py-4 text-sm text-gray-600 ${className}`.trim()}
      role="contentinfo"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {logo ? <div className="shrink-0">{logo}</div> : null}
          <span>{resolvedText}</span>
        </div>
        {resolvedLinks.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {resolvedLinks.map((link) => {
              const key = link.key || link.href || link.label;
              if (link.href) {
                return (
                  <Link
                    key={key}
                    href={link.href}
                    className={`hover:text-gray-900 ${link.active ? "font-semibold text-gray-900" : ""}`.trim()}
                  >
                    {link.label}
                  </Link>
                );
              }
              return (
                <span key={key} className="text-gray-500">
                  {link.label}
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    </footer>
  );
};

export default Footer;
