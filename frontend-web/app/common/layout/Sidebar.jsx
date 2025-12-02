"use client";
/**
 * 파일명: common/layout/Sidebar.jsx
 * 작성자: Codex
 * 갱신일: 2025-11-27
 * 설명: 햄버거/화살표 토글이 가능한 공용 사이드바(EasyList 기반)
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/app/lib/component/Icon";
import { getBoundValue, setBoundValue } from "@/app/lib/binding";

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
 * @description 햄버거/접힘/하위 메뉴 토글을 지원하는 공용 사이드바
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
  const [collapsed, setCollapsed] = useState(() => {
    if (dataObj && collapsedKey) return !!getBoundValue(dataObj, collapsedKey);
    return false;
  });
  const [renderWidth, setRenderWidth] = useState(() => {
    if (!isOpen) return 0;
    return collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  });
  const [translateX, setTranslateX] = useState(() => {
    if (!isOpen) return -EXPANDED_WIDTH;
    return 0;
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const isFirstRenderRef = useRef(true);
  const [expanded, setExpanded] = useState({});
  const pathname = usePathname();

  const resolvedItems = useMemo(() => {
    return toArray(menuList).map((item) => ({
      key: item.menuId ?? item.key ?? item.id ?? item.menuNm,
      label: item.menuNm ?? item.label ?? "메뉴",
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
        label: cur.subMenuNm ?? cur.label ?? "하위메뉴",
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

  useEffect(() => {
    if (!dataObj || !collapsedKey) return;
    setCollapsed(!!getBoundValue(dataObj, collapsedKey));
  }, [dataObj, collapsedKey]);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (dataObj && collapsedKey) setBoundValue(dataObj, collapsedKey, next);
  };

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    setIsAnimating(true);
    let timer = null;

    // 닫기: 왼쪽으로 밀어낸 뒤 폭 제거
    if (!isOpen) {
      setTranslateX(-renderWidth || -EXPANDED_WIDTH);
      timer = setTimeout(() => {
        setRenderWidth(0);
        setTranslateX(-EXPANDED_WIDTH);
        setIsAnimating(false);
      }, TRANSITION_MS);
      return () => {
        if (timer) clearTimeout(timer);
      };
    }

    const targetWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

    // 열기: 오른쪽으로 먼저 밀어 넣고, 이동 후 폭을 복원
    if (renderWidth === 0) {
      setTranslateX(0);
      timer = setTimeout(() => {
        setRenderWidth(targetWidth);
        setTranslateX(0);
        setIsAnimating(false);
      }, TRANSITION_MS);
      return () => {
        if (timer) clearTimeout(timer);
      };
    }

    // 축소/확대 전환: 이동 → 폭 변경 순서
    if (collapsed) {
      setTranslateX(-(EXPANDED_WIDTH - COLLAPSED_WIDTH));
      timer = setTimeout(() => {
        setRenderWidth(COLLAPSED_WIDTH);
        setTranslateX(0);
        setIsAnimating(false);
      }, TRANSITION_MS);
      return () => {
        if (timer) clearTimeout(timer);
      };
    }

    // 확대(축소 → 확장)
    setTranslateX(EXPANDED_WIDTH - COLLAPSED_WIDTH);
    timer = setTimeout(() => {
      setRenderWidth(EXPANDED_WIDTH);
      setTranslateX(0);
      setIsAnimating(false);
    }, TRANSITION_MS);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, collapsed, renderWidth, COLLAPSED_WIDTH, EXPANDED_WIDTH, TRANSITION_MS]);

  const transitionStyle = {
    width: `${renderWidth}px`,
    transform: `translateX(${translateX}px)`,
    transition: isAnimating ? `transform ${TRANSITION_MS}ms ease, width ${TRANSITION_MS}ms ease` : undefined,
  };
  const toggleGroup = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (item, children = []) => {
    if (item.active) return true;
    if (children.some((child) => child.active)) return true;
    if (item.href && pathname) {
      if (pathname === item.href) return true;
      if (pathname.startsWith(`${item.href}/`)) return true;
    }
    return false;
  };

  useEffect(() => {
    setExpanded((prev) => {
      let changed = false;
      const next = { ...prev };
      resolvedItems.forEach((item) => {
        const key = item.key || item.label || item.href;
        const children = subMenuMap.get(item.key) || [];
        if (children.some((child) => isActive(child))) {
          if (!next[key]) {
            next[key] = true;
            changed = true;
          }
        }
      });
      return changed ? next : prev;
    });
  }, [resolvedItems, pathname, subMenuMap]);

  const navItemClass = (active) =>
    [
      "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
      active ? "bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-100" : "text-gray-700 hover:bg-gray-50",
    ].join(" ");

  return (
    <>
      <div className={`fixed inset-0 z-30 bg-gray-900/30 lg:hidden ${isOpen ? "" : "hidden"}`} onClick={onClose} aria-hidden="true" />
      <aside
        className={`relative z-40 flex min-h-full flex-col border-r border-gray-200 bg-white shadow-sm lg:static ${isOpen ? "" : "pointer-events-none"} ${className}`.trim()}
        aria-label="사이드바 내비게이션"
        style={transitionStyle}
      >
        {logo ? (
          <div className="px-4 py-3">
            <div className={`${collapsed ? "sr-only" : ""} text-sm font-semibold text-gray-900`}>{logo}</div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
          className="absolute -right-3 top-1/2 -translate-y-1/2 hidden h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 lg:flex"
        >
          <Icon icon={collapsed ? "ri:RiArrowRightSLine" : "ri:RiArrowLeftSLine"} size="1.2em" />
        </button>

        <button
          type="button"
          onClick={onClose}
          aria-label="사이드바 닫기"
          className="absolute right-2 top-2 rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <Icon icon="ri:RiCloseLine" size="1.1em" />
        </button>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="사이드바 메뉴">
          <ul className="space-y-1">
            {resolvedItems.map((item) => {
              const key = item.key || item.label || item.href;
              const children = subMenuMap.get(item.key) || [];
              const active = isActive(item, children);
              const hasChildren = children.length > 0;
              const isOpenGroup = expanded[key] || false;

              const content = (
                <div className="flex w-full items-center gap-3">
                  {item.icon ? <Icon icon={item.icon} size="1.1em" ariaLabel={item.label} /> : null}
                  <span className={`${collapsed ? "sr-only" : "truncate"}`}>{item.label}</span>
                  {item.badge && !collapsed ? (
                    <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{item.badge}</span>
                  ) : null}
                  {hasChildren ? (
                    <Icon
                      icon={isOpenGroup ? "ri:RiArrowUpSLine" : "ri:RiArrowDownSLine"}
                      size="1em"
                      className={`ml-auto text-gray-500 ${collapsed ? "hidden" : ""}`}
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
                        aria-controls={`${key}-children`}
                        title={item.label}
                      >
                        {content}
                      </button>
                      <ul
                        id={`${key}-children`}
                        className={`${isOpenGroup ? "mt-1 space-y-1" : "hidden"} ${collapsed ? "" : "pl-3"}`}
                        aria-label={`${item.label} 하위 메뉴`}
                      >
                        {children.map((child) => {
                          const childKey = child.key || child.label || child.href;
                          const childActive = isActive(child);
                          const childClass = navItemClass(childActive);
                          const childContent = (
                            <div className="flex w-full items-center gap-3 pl-2">
                              {child.icon ? (
                                <Icon icon={child.icon} size="1.05em" ariaLabel={child.label} />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-300" aria-hidden />
                              )}
                              <span className={`${collapsed ? "sr-only" : "truncate"}`}>{child.label}</span>
                              {child.badge && !collapsed ? (
                                <span className="ml-auto rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                                  {child.badge}
                                </span>
                              ) : null}
                            </div>
                          );
                          if (child.href) {
                            return (
                              <li key={childKey}>
                                <Link href={child.href} className={childClass} aria-current={childActive ? "page" : undefined} title={child.label}>
                                  {childContent}
                                </Link>
                              </li>
                            );
                          }
                          return (
                            <li key={childKey}>
                              <button type="button" className={childClass} onClick={child.onClick} title={child.label}>
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
                    <button type="button" onClick={item.onClick} className={navItemClass(active)} title={item.label}>
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        {footerSlot ? <div className="border-t border-gray-100 p-3 text-xs text-gray-500">{footerSlot}</div> : null}
      </aside>
    </>
  );
};

export default Sidebar;
