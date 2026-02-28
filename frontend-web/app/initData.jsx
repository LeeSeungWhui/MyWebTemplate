/**
 * 파일명: app/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 루트 랜딩 페이지 정적 데이터
 */

import LANG_KO from "./lang.ko";

const { initData } = LANG_KO;

export const LANDING_HERO = {
  title: initData.hero.title,
  subtitle: initData.hero.subtitle,
  primaryCta: { href: "/sample", label: initData.hero.primaryCtaLabel },
  secondaryCta: { href: "/component", label: initData.hero.secondaryCtaLabel },
  previewImage: {
    src: "/images/landing/demo-dashboard.png",
    alt: initData.hero.previewImageAlt,
  },
};

export const LANDING_SERVICE_LIST = initData.services.map((item) => ({ ...item }));

export const LANDING_GALLERY_LIST = initData.gallery.map((item) => ({ ...item }));

export const LANDING_STACK_LIST = [...initData.stackList];

export const LANDING_BOTTOM_CTA = {
  title: initData.bottomCta.title,
  subtitle: initData.bottomCta.subtitle,
  demo: { href: "/sample", label: initData.bottomCta.label },
};

export const PAGE_CONFIG = {
  MODE: "SSR",
  API: {},
};
