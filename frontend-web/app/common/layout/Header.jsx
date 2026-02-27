"use client";
/**
 * 파일명: common/layout/Header.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-27
 * 설명: 대시보드용 상단 헤더 내비게이션 (EasyObj/EasyList 기반)
 */

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/app/lib/component/Button";
import Icon from "@/app/lib/component/Icon";
import EasyObj from "@/app/lib/dataset/EasyObj";
import { COMMON_COMPONENT_LANG_KO } from "@/app/common/i18n/lang.ko";

/**
 * @description 값이 배열 또는 EasyList 형태인지 판별
 * 처리 규칙: 배열이거나 `size()` 메서드를 보유한 경우 list-like로 간주한다.
 * @updated 2026-02-27
 */
const isListLike = (list) =>
  !!list && (typeof list.size === "function" || Array.isArray(list));

/**
 * @description menu/subMenu 입력을 순회 가능한 배열로 맞추는 데이터 정규화 유틸.
 * 처리 규칙: 배열은 그대로 사용하고 EasyList는 size/get으로 풀어 배열로 변환한다.
 * @updated 2026-02-27
 */
const toArray = (list) => {
  if (Array.isArray(list)) return list;
  if (isListLike(list)) {
    const size = typeof list.size === "function" ? list.size() : 0;
    return Array.from({ length: size }, (unusedItem, idx) =>
      typeof list.get === "function" ? list.get(idx) : undefined,
    );
  }
  return [];
};

/**
 * @description 햄버거/메뉴/텍스트 영역을 포함한 대시보드 상단 헤더 컴포넌트(EasyList 기반).
 * 처리 규칙: 메뉴 활성/서브메뉴 펼침/외부 클릭 닫기 상태를 통합 관리한다.
 * @param {Object} props
 * @param {string} props.title 헤더 타이틀
 * @param {string} [props.subtitle] 타이틀 보조 설명
 * @param {Array|Object} [props.menuList] EasyList 또는 배열 { menuId, menuNm, href?, active?, icon? }
 * @param {Array|Object} [props.subMenuList] EasyList 또는 배열 { menuId, subMenuId, subMenuNm, href?, active? }
 * @param {Function} [props.onToggleSidebar] 사이드바 토글 핸들러(있으면 햄버거 표시)
 * @param {React.ReactNode} [props.logo] 로고 슬롯(img, span 등)
 * @param {React.ReactNode} [props.actions] 우측 액션 영역
 * @param {React.ReactNode} [props.text] 우측 표시 텍스트/커스텀 슬롯 영역(사용자명 등)
 * @param {string} [props.className] 추가 클래스
 */
const Header = ({
  title = COMMON_COMPONENT_LANG_KO.header.defaultTitle,
  subtitle,
  menuList,
  subMenuList,
  onToggleSidebar,
  actions,
  logo,
  text,
  children,
  className = "",
}) => {

  const ui = EasyObj({ openMenu: null });
  const navRef = useRef(null);
  const pathname = usePathname();
  const resolvedMenus = useMemo(() => {
    return toArray(menuList).map((item) => ({
      key: item.menuId ?? item.key ?? item.id ?? item.menuNm,
      label:
        item.menuNm ??
        item.label ??
        item.title ??
        COMMON_COMPONENT_LANG_KO.header.defaultMenuLabel,
      href: item.href,
      active: !!item.active,
      icon: item.icon,
    }));
  }, [menuList]);

  const subMenuMap = useMemo(() => {
    return toArray(subMenuList).reduce((acc, cur) => {
      const menuId = cur.menuId ?? cur.parentMenuId;
      if (!menuId) return acc;
      const list = acc.get(menuId) || [];
      list.push({
        key: cur.subMenuId ?? cur.subMenuNm ?? cur.subMenuCode ?? cur.menuId,
        label:
          cur.subMenuNm ??
          cur.label ??
          cur.title ??
          COMMON_COMPONENT_LANG_KO.header.defaultSubMenuLabel,
        href: cur.href,
        active: !!cur.active,
        icon: cur.icon,
      });
      acc.set(menuId, list);
      return acc;
    }, new Map());
  }, [subMenuList]);

  const hasExplicitActive = useMemo(() => {
    const menuActiveExists = resolvedMenus.some((item) => !!item.active);
    if (menuActiveExists) {
      return true;
    }
    return Array.from(subMenuMap.values()).some((children) =>
      children.some((child) => !!child.active),
    );
  }, [resolvedMenus, subMenuMap]);

  useEffect(() => {

    /**
     * @description 네비게이션 바깥 영역 클릭 시 열린 메뉴 닫기.
     * 처리 규칙: pointerdown 이벤트 target이 navRef 외부면 `ui.openMenu`를 null로 초기화한다.
     * @updated 2026-02-27
     */
    const handleOutside = (evt) => {
      if (navRef.current && !navRef.current.contains(evt.target)) {
        ui.openMenu = null;
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [ui]);

  /**
   * @description href가 현재 pathname과 활성 매칭되는지 판정
   * 처리 규칙: 완전 일치 또는 하위 경로(prefix/) 일치를 활성으로 처리한다.
   * @updated 2026-02-27
   */
  const isPathActive = (href) => {
    if (!href || !pathname) {
      return false;
    }
    if (pathname === href) {
      return true;
    }
    if (pathname.startsWith(`${href}/`)) {
      return true;
    }
    return false;
  };

  /**
   * @description 하위 메뉴 항목 활성 여부를 판정하는 내부 규칙 함수.
   * 처리 규칙: child.active 우선, 명시 active가 없을 때만 pathname 매칭으로 활성 여부를 추론한다.
   * @updated 2026-02-27
   */
  const isChildActive = (child) => {
    if (child.active) {
      return true;
    }
    if (hasExplicitActive) {
      return false;
    }
    return isPathActive(child.href);
  };

  /**
   * @description 상위 메뉴 항목 활성 여부를 계산하는 내부 규칙 함수.
   * 처리 규칙: item.active 우선, child 활성 여부를 반영하고 명시 active가 없을 때만 경로 매칭을 사용한다.
   * @updated 2026-02-27
   */
  const isItemActive = (item, children = []) => {
    if (item.active) {
      return true;
    }
    if (children.some((child) => isChildActive(child))) {
      return true;
    }
    if (hasExplicitActive) {
      return false;
    }
    return isPathActive(item.href);
  };

  /**
   * @description 서브메뉴 선택 이벤트를 반영
   * 처리 규칙: item.onClick이 있으면 호출하고 선택 후 openMenu를 닫는다.
   * @updated 2026-02-27
   */
  const handleMenuSelect = (item) => {
    if (typeof item.onClick === "function") item.onClick();
    ui.openMenu = null;
  };

  /**
   * @description 메뉴 버튼 상태별 className 문자열 생성 유틸.
   * 처리 규칙: active=true면 강조 스타일, false면 hover 중심 기본 스타일을 반환한다.
   * @updated 2026-02-27
   */
  const menuButtonClass = (isActive) =>
    [
      "inline-flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
        : "text-gray-700 hover:bg-gray-100",
    ].join(" ");

  return (
    <header
      className={`border-b border-gray-200 bg-white shadow-sm ${className}`.trim()}

    >
      <div className="flex min-h-16 items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {typeof onToggleSidebar === "function" ? (
            <Button
              variant="ghost"
              size="sm"
              aria-label={COMMON_COMPONENT_LANG_KO.header.toggleSidebarAriaLabel}
              onClick={onToggleSidebar}
              className="px-2 py-1 text-gray-700"
            >
              <Icon icon="ri:RiMenuLine" size="1.25em" />
            </Button>
          ) : null}
          {logo ? <div className="flex shrink-0 items-center">{logo}</div> : null}
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold text-gray-900 sm:text-base">
              {title}
            </div>
            {subtitle && (
              <div className="hidden truncate text-xs text-gray-500 sm:block">
                {subtitle}
              </div>
            )}
          </div>
        </div>
        <nav
          ref={navRef}
          className="hidden items-center gap-2 md:flex"
          aria-label={COMMON_COMPONENT_LANG_KO.header.primaryMenuAriaLabel}
        >
          {resolvedMenus.map((item) => {
            const children = subMenuMap.get(item.key) || [];
            const key = item.key || item.label || item.href;
            const isActive = isItemActive(item, children);
            const hasChildren = children.length > 0;
            if (hasChildren) {
              const isOpen = ui.openMenu === key;
              return (
                <div key={key} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-haspopup="menu"
                    aria-expanded={isOpen ? "true" : "false"}
                    onClick={() => {
                      ui.openMenu = isOpen ? null : key;
                    }}
                    className={menuButtonClass(isActive)}
                  >
                    <span>{item.label}</span>
                    <Icon icon="ri:RiArrowDownSLine" size="1.1em" />
                  </Button>
                  <div
                    className={`absolute right-0 top-full mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-md ${
                      isOpen ? "block" : "hidden"
                    }`}
                    role="menu"
                    aria-label={`${item.label} ${COMMON_COMPONENT_LANG_KO.header.subMenuAriaSuffix}`}
                  >
                    <ul className="py-1">
                      {children.map((child) => {
                        const childKey = child.key || child.label || child.href;
                        const childActive = isChildActive(child);
                        const linkClass = [
                          "flex w-full items-start gap-2 px-3 py-2 text-sm transition-colors",
                          childActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50",
                        ].join(" ");
                        return (
                          <li key={childKey}>
                            {child.href ? (
                              <Link
                                href={child.href}
                                onClick={() => handleMenuSelect(child)}
                                className={linkClass}
                                role="menuitem"
                                aria-current={childActive ? "page" : undefined}
                              >
                                <span
                                  className={`font-medium ${childActive ? "text-blue-700" : "text-gray-900"}`}
                                >
                                  {child.label}
                                </span>
                                {child.description && (
                                  <span
                                    className={`text-xs ${childActive ? "text-blue-700" : "text-gray-500"}`}
                                  >
                                    {child.description}
                                  </span>
                                )}
                              </Link>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleMenuSelect(child)}
                                className={linkClass}
                                role="menuitem"
                                aria-current={childActive ? "page" : undefined}
                              >
                                <span
                                  className={`font-medium ${childActive ? "text-blue-700" : "text-gray-900"}`}
                                >
                                  {child.label}
                                </span>
                                {child.description && (
                                  <span
                                    className={`text-xs ${childActive ? "text-blue-700" : "text-gray-500"}`}
                                  >
                                    {child.description}
                                  </span>
                                )}
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            }
            if (item.href) {
              return (
                <Link
                  key={key}
                  href={item.href}
                  className={menuButtonClass(isActive)}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleMenuSelect(item)}
                className={menuButtonClass(isActive)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {actions}
          {text ? (
            <div className="hidden max-w-[256px] items-center gap-2 truncate text-sm text-gray-700 sm:flex">
              {text}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </header>
  );
};

/**
 * @description Header 컴포넌트 엔트리를 외부에 노출
 * 처리 규칙: 상태 로직이 결합된 Header 컴포넌트를 default export 한다.
 */
export default Header;
