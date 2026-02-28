/**
 * 파일명: common/layout/Footer.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-26
 * 설명: 대시보드 공용 푸터(EasyObj/EasyList 기반)
 */

import Link from "next/link";
import { useMemo } from "react";
import { getBoundValue } from "@/app/lib/binding";
import { COMMON_COMPONENT_LANG_KO } from "@/app/common/i18n/lang.ko";

/**
 * @description EasyList 호환 객체인지 판별해 링크 목록 변환 분기에 사용
 * @param {unknown} list
 * @returns {boolean} size/get 인터페이스를 가진 목록 객체면 true
 * @updated 2026-02-27
 */
const isListLike = (list) =>
  !!list && (typeof list.size === "function" || Array.isArray(list));

/**
 * @description EasyList/배열 입력을 안전한 배열 형태로 정규화. 입력/출력 계약을 함께 명시
 * @param {unknown} list
 * @returns {Array<unknown>} 렌더링 가능한 배열
 * @updated 2026-02-27
 */
const toArray = (list) => {
  if (Array.isArray(list)) return list;
  if (isListLike(list)) {
    const size = typeof list.size === "function" ? list.size() : 0;
    return Array.from({ length: size }, (_item, idx) =>
      typeof list.get === "function" ? list.get(idx) : undefined,
    );
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
 * 처리 규칙: 입력값과 상태를 검증해 UI/데이터 흐름을 안전하게 유지한다.
 */
const Footer = ({
  textObj,
  textKey = "footerText",
  linkList,
  logo,
  className = "",
}) => {

  const currentYear = new Date().getFullYear();
  const defaultText = COMMON_COMPONENT_LANG_KO.footer.defaultTextTemplate.replace(
    "{year}",
    String(currentYear),
  );
  const resolvedText =
    (textObj && textKey ? getBoundValue(textObj, textKey) : null) ??
    defaultText;

  const resolvedLinks = useMemo(() => {
    return toArray(linkList).map((item) => ({
      key: item.linkId ?? item.id ?? item.href ?? item.linkNm ?? item.label,
      label:
        item.linkNm ??
        item.label ??
        item.text ??
        COMMON_COMPONENT_LANG_KO.footer.defaultLinkLabel,
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
