/**
 * 파일명: demo/admin/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 관리자 화면 데모 페이지 정적 데이터
 */

export const PAGE_MODE = {
  MODE: "CSR",
  PUBLIC_PATH: "/demo/admin",
};

export const TAB_LIST = [
  { key: "users", label: "사용자 목록" },
  { key: "roles", label: "역할 관리" },
  { key: "settings", label: "시스템 설정" },
];

export const ROLE_OPTION_LIST = [
  { value: "admin", text: "관리자" },
  { value: "editor", text: "편집자" },
  { value: "user", text: "일반사용자" },
];

export const STATUS_OPTION_LIST = [
  { value: "active", text: "활성" },
  { value: "inactive", text: "비활성" },
];

export const USER_ROW_LIST = [
  {
    id: 1,
    name: "김관리",
    email: "admin@demo.demo",
    role: "admin",
    status: "active",
    createdAt: "2026-01-15",
    notifyEmail: true,
    notifySms: false,
    notifyPush: true,
    profileImageUrl: "",
  },
  {
    id: 2,
    name: "박에디터",
    email: "editor@demo.demo",
    role: "editor",
    status: "active",
    createdAt: "2026-01-20",
    notifyEmail: true,
    notifySms: true,
    notifyPush: false,
    profileImageUrl: "",
  },
  {
    id: 3,
    name: "이사용자",
    email: "user@demo.demo",
    role: "user",
    status: "inactive",
    createdAt: "2026-02-03",
    notifyEmail: false,
    notifySms: false,
    notifyPush: false,
    profileImageUrl: "",
  },
];
