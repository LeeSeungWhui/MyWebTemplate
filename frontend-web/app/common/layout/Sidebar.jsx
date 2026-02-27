"use client";
/**
 * 파일명: common/layout/Sidebar.jsx
 * 작성자: LSH
 * 갱신일: 2025-11-27
 * 설명: 햄버거/화살표 토글이 가능한 공용 사이드바(EasyList 기반)
 */

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/app/lib/component/Icon";
import { getBoundValue, setBoundValue } from "@/app/lib/binding";
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
 * @description 햄버거/접힘/하위 메뉴 토글을 지원하는 공용 사이드바 컴포넌트.
 * 처리 규칙: 메뉴 활성 상태, 접힘 상태, 그룹 펼침 상태를 통합 관리해 데스크톱/모바일 UI를 동기화한다.
 * @param {Object} props
 * @param {Array|Object} [props.menuList] EasyList 또는 배열 { menuId, menuNm, href?, active?, icon?, badge? }
 * @param {Array|Object} [props.subMenuList] EasyList 또는 배열 { menuId, subMenuId, subMenuNm, href?, active?, icon?, badge? }
 * @param {boolean} [props.isOpen=true] 모바일/데스크톱 전체 표시 여부
 * @param {Function} [props.onClose] 사이드바 닫기 핸들러
 * @param {React.ReactNode} [props.logo] 로고 슬롯
 * @param {React.ReactNode} [props.footerSlot] 하단 푸터 슬롯
 * @param {string} [props.className] 추가 클래스
 * @param {Object} [props.dataObj] EasyObj 바인딩 객체(접힘 상태 저장용)
 * @param {string} [props.collapsedKey=sidebarCollapsed] EasyObj에 저장할 필드명
 */
const Sidebar = ({
  menuList,
  subMenuList,
  isOpen = true,
  onClose,
  logo,
  footerSlot,
  className = "",
  dataObj,
  collapsedKey = "sidebarCollapsed",
}) => {

  const COLLAPSED_WIDTH = 64;
  const EXPANDED_WIDTH = 256;
  const TRANSITION_MS = 180;
  const initialCollapsed =
    dataObj && collapsedKey ? !!getBoundValue(dataObj, collapsedKey) : false;
  const ui = EasyObj({
    collapsed: initialCollapsed,
    renderWidth: isOpen
      ? initialCollapsed
        ? COLLAPSED_WIDTH
        : EXPANDED_WIDTH
      : 0,
    translateX: isOpen ? 0 : -EXPANDED_WIDTH,
    expanded: {},
  });
  const isFirstRenderRef = useRef(true);
  const pathname = usePathname();

  const resolvedItems = useMemo(() => {
    return toArray(menuList).map((item) => ({
      key: item.menuId ?? item.key ?? item.id ?? item.menuNm,
      label: item.menuNm ?? item.label ?? COMMON_COMPONENT_LANG_KO.sidebar.defaultMenuLabel,
      href: item.href,
      active: !!item.active,
      icon: item.icon,
      badge: item.badge ?? item.count,
      description: item.description,
    }));
  }, [menuList]);

  const subMenuMap = useMemo(() => {
    return toArray(subMenuList).reduce((acc, cur) => {
      const menuId = cur.menuId ?? cur.parentMenuId;
      if (!menuId) return acc;
      const list = acc.get(menuId) || [];
      list.push({
        key: cur.subMenuId ?? cur.subMenuNm ?? cur.menuId,
        label: cur.subMenuNm ?? cur.label ?? COMMON_COMPONENT_LANG_KO.sidebar.defaultSubMenuLabel,
        href: cur.href,
        active: !!cur.active,
        icon: cur.icon,
        badge: cur.badge ?? cur.count,
        description: cur.description,
      });
      acc.set(menuId, list);
      return acc;
    }, new Map());
  }, [subMenuList]);

  const hasExplicitActive = useMemo(() => {
    const menuActiveExists = resolvedItems.some((item) => !!item.active);
    if (menuActiveExists) {
      return true;
    }
    return Array.from(subMenuMap.values()).some((children) =>
      children.some((child) => !!child.active),
    );
  }, [resolvedItems, subMenuMap]);

  useEffect(() => {
    if (!dataObj || !collapsedKey) return;
    ui.collapsed = !!getBoundValue(dataObj, collapsedKey);
  }, [dataObj, collapsedKey, ui]);

  /**
   * @description 사이드바 접힘 상태를 토글
   * 처리 규칙: ui.collapsed를 반전하고 dataObj 바인딩이 있으면 동일 값을 저장한다.
   * @updated 2026-02-27
   */
  const toggleCollapsed = () => {
    const next = !ui.collapsed;
    ui.collapsed = next;
    if (dataObj && collapsedKey) setBoundValue(dataObj, collapsedKey, next);
  };

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      let initialWidth = 0;
      if (isOpen) {
        initialWidth = ui.collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
      }
      ui.renderWidth = initialWidth;
      ui.translateX = isOpen ? 0 : -EXPANDED_WIDTH;
      return;
    }
    let timer = null;
    const targetWidth = ui.collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

    // 닫기: 현재 폭만큼 왼쪽으로 밀고, 애니메이션 뒤 폭 0
    if (!isOpen) {
      ui.translateX = -ui.renderWidth || -targetWidth;
      timer = setTimeout(() => {
        ui.renderWidth = 0;
      }, TRANSITION_MS);
      return () => {
        if (timer) clearTimeout(timer);
      };
    }

    // 열기: 폭을 먼저 복원하고 화면 밖에서 슬라이드 인
    if (ui.renderWidth === 0) {
      ui.renderWidth = targetWidth;
      ui.translateX = -targetWidth;
      requestAnimationFrame(() => {
        ui.translateX = 0;
      });
      return;
    }

    // 축소/확대: 폭만 바꾸고 위치는 고정
    ui.renderWidth = targetWidth;
    ui.translateX = 0;
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [
    ui,
    ui.collapsed,
    isOpen,
    COLLAPSED_WIDTH,
    EXPANDED_WIDTH,
    TRANSITION_MS,
    ui.renderWidth,
  ]);

  const drawerStyle = {
    width: `${ui.renderWidth}px`,
    transform: `translateX(${ui.translateX}px)`,
    transition: `transform ${TRANSITION_MS}ms ease`,
  };

  /**
   * @description 하위 메뉴 그룹의 펼침 상태를 토글
   * 처리 규칙: `ui.expanded[key]` 값을 반전해 그룹별 open/close를 제어한다.
   * @updated 2026-02-27
   */
  const toggleGroup = (key) => {
    ui.expanded = { ...ui.expanded, [key]: !ui.expanded[key] };
  };

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

  useEffect(() => {
    const next = { ...ui.expanded };
    let changed = false;
    resolvedItems.forEach((item) => {
      const key = item.key || item.label || item.href;
      const children = subMenuMap.get(item.key) || [];
      if (children.some((child) => isChildActive(child))) {
        if (!next[key]) {
          next[key] = true;
          changed = true;
        }
      }
    });
    if (changed) {
      ui.expanded = next;
    }
  }, [resolvedItems, pathname, subMenuMap, ui]);

  /**
   * @description 메뉴 항목 상태별 className 문자열 생성 유틸.
   * 처리 규칙: active=true면 강조 스타일, false면 hover 중심 기본 스타일을 반환한다.
   * @updated 2026-02-27
   */
  const navItemClass = (active) =>
    [
      "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
      active
        ? "bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-100"
        : "text-gray-700 hover:bg-gray-50",
    ].join(" ");

  /**
   * @description 사이드바 본문 UI를 미니/확장 모드별로 구성하는 렌더러.
   * 처리 규칙: logo/토글 버튼/메뉴 목록/하위 메뉴를 isMini 상태에 따라 조건부로 구성한다.
   * @updated 2026-02-27
   */
  const renderContent = (isMini) => (
    <>
      {logo ? (
        <div className="px-4 py-3">
          <div
            className={`${isMini ? "sr-only" : ""} text-sm font-semibold text-gray-900`}
          >
            {logo}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={
          isMini
            ? COMMON_COMPONENT_LANG_KO.sidebar.expandAriaLabel
            : COMMON_COMPONENT_LANG_KO.sidebar.collapseAriaLabel
        }
        className="absolute -right-3 top-1/2 -translate-y-1/2 hidden h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 lg:flex"
      >
        <Icon
          icon={isMini ? "ri:RiArrowRightSLine" : "ri:RiArrowLeftSLine"}
          size="1.2em"
        />
      </button>

      <button
        type="button"
        onClick={onClose}
        aria-label={COMMON_COMPONENT_LANG_KO.sidebar.closeAriaLabel}
        className="absolute right-2 top-2 rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
      >
        <Icon icon="ri:RiCloseLine" size="1.1em" />
      </button>

      <nav
        className="flex-1 overflow-y-auto px-3 py-4"
        aria-label={COMMON_COMPONENT_LANG_KO.sidebar.menuAriaLabel}
      >
        <ul className="space-y-1">
          {resolvedItems.map((item) => {
            const key = item.key || item.label || item.href;
            const children = subMenuMap.get(item.key) || [];
            const active = isItemActive(item, children);
            const hasChildren = children.length > 0;
            const isOpenGroup = ui.expanded[key] || false;
            const childListClassName = isOpenGroup ? "mt-1 space-y-1" : "hidden";
            const childListPaddingClassName = isMini ? "" : "pl-3";

            const content = (
              <div className="flex w-full items-center gap-3">
                {item.icon ? (
                  <Icon icon={item.icon} size="1.1em" ariaLabel={item.label} />
                ) : null}
                <span className={`${isMini ? "sr-only" : "truncate"}`}>
                  {item.label}
                </span>
                {item.badge && !isMini ? (
                  <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    {item.badge}
                  </span>
                ) : null}
                {hasChildren ? (
                  <Icon
                    icon={
                      isOpenGroup ? "ri:RiArrowUpSLine" : "ri:RiArrowDownSLine"
                    }
                    size="1em"
                    className={`ml-auto text-gray-500 ${isMini ? "hidden" : ""}`}
                  />
                ) : null}
              </div>
            );

            return (
              <li key={key}>
                {hasChildren ? (
                  <>
                    <button
                      type="button"
                      className={navItemClass(active)}
                      onClick={() => toggleGroup(key)}
                      aria-expanded={isOpenGroup ? "true" : "false"}
                      aria-controls={`${key}-children-${isMini ? "mini" : "full"}`}
                      title={item.label}
                    >
                      {content}
                    </button>
                    <ul
                      id={`${key}-children-${isMini ? "mini" : "full"}`}
                      className={`${childListClassName} ${childListPaddingClassName}`}
                      aria-label={`${item.label} ${COMMON_COMPONENT_LANG_KO.sidebar.subMenuAriaSuffix}`}
                    >
                      {children.map((child) => {
                        const childKey = child.key || child.label || child.href;
                        const childActive = isChildActive(child);
                        const childClass = navItemClass(childActive);
                        const childContent = (
                          <div className="flex w-full items-center gap-3 pl-2">
                            {child.icon ? (
                              <Icon
                                icon={child.icon}
                                size="1.05em"
                                ariaLabel={child.label}
                              />
                            ) : (
                              <span
                                className="h-1.5 w-1.5 rounded-full bg-gray-300"
                                aria-hidden
                              />
                            )}
                            <span
                              className={`${isMini ? "sr-only" : "truncate"}`}
                            >
                              {child.label}
                            </span>
                            {child.badge && !isMini ? (
                              <span className="ml-auto rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                                {child.badge}
                              </span>
                            ) : null}
                          </div>
                        );
                        if (child.href) {
                          return (
                            <li key={childKey}>
                              <Link
                                href={child.href}
                                className={childClass}
                                aria-current={childActive ? "page" : undefined}
                                title={child.label}
                              >
                                {childContent}
                              </Link>
                            </li>
                          );
                        }
                        return (
                          <li key={childKey}>
                            <button
                              type="button"
                              className={childClass}
                              onClick={child.onClick}
                              title={child.label}
                            >
                              {childContent}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className={navItemClass(active)}
                    aria-current={active ? "page" : undefined}
                    title={item.label}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className={navItemClass(active)}
                    title={item.label}
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      {footerSlot ? (
        <div className="border-t border-gray-100 p-3 text-xs text-gray-500">
          {footerSlot}
        </div>
      ) : null}
    </>
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-gray-900/30 lg:hidden ${isOpen ? "" : "hidden"}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed bottom-0 left-0 top-16 z-40 flex h-auto flex-none flex-col overflow-visible border-r border-gray-200 bg-white shadow-sm lg:static lg:top-auto lg:bottom-auto lg:left-auto lg:min-h-full ${isOpen ? "" : "pointer-events-none"} ${className}`.trim()}
        aria-label={COMMON_COMPONENT_LANG_KO.sidebar.navigationAriaLabel}
        style={drawerStyle}
      >
        {renderContent(ui.collapsed)}
      </aside>
    </>
  );
};

/**
 * @description Sidebar 컴포넌트 엔트리를 외부에 노출
 * 처리 규칙: 상태 로직이 연결된 Sidebar 컴포넌트를 default export 한다.
 */
export default Sidebar;
