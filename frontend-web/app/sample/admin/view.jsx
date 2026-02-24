"use client";
/**
 * 파일명: demo/admin/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 관리자 화면 샘플 페이지 뷰(탭/사용자 Drawer 포함)
 */

import { useEffect, useMemo, useState } from "react";
import { useGlobalUi } from "@/app/common/store/SharedStore";
import Badge from "@/app/lib/component/Badge";
import Button from "@/app/lib/component/Button";
import Card from "@/app/lib/component/Card";
import Checkbox from "@/app/lib/component/Checkbox";
import Drawer from "@/app/lib/component/Drawer";
import EasyTable from "@/app/lib/component/EasyTable";
import Input from "@/app/lib/component/Input";
import Select from "@/app/lib/component/Select";
import Switch from "@/app/lib/component/Switch";
import Tab from "@/app/lib/component/Tab";
import { useDemoSharedState } from "@/app/sample/demoSharedState";
import {
  ROLE_OPTION_LIST,
  STATUS_OPTION_LIST,
  TAB_LIST,
} from "./initData";

const ROLE_LABEL_MAP = {
  admin: "관리자",
  editor: "편집자",
  user: "일반사용자",
};

const ROLE_BADGE_VARIANT_MAP = {
  admin: "primary",
  editor: "warning",
  user: "neutral",
};

const STATUS_LABEL_MAP = {
  active: "활성",
  inactive: "비활성",
};

const STATUS_BADGE_VARIANT_MAP = {
  active: "success",
  inactive: "neutral",
};

const ROLE_PERMISSION_LIST = [
  { key: "manageUser", label: "사용자 관리" },
  { key: "editContent", label: "콘텐츠 편집" },
  { key: "changeSetting", label: "설정 변경" },
  { key: "viewLog", label: "로그 조회" },
  { key: "deleteData", label: "데이터 삭제" },
];

const ROLE_PERMISSION_MAP = {
  admin: {
    manageUser: true,
    editContent: true,
    changeSetting: true,
    viewLog: true,
    deleteData: true,
  },
  editor: {
    manageUser: false,
    editContent: true,
    changeSetting: false,
    viewLog: true,
    deleteData: false,
  },
  user: {
    manageUser: false,
    editContent: false,
    changeSetting: false,
    viewLog: false,
    deleteData: false,
  },
};

const SYSTEM_DEFAULT = {
  siteName: "MyWebTemplate",
  adminEmail: "admin@demo.demo",
  maintenanceMode: false,
  sessionTimeout: 60,
  maxUploadMb: 30,
};

const createDefaultUserForm = () => ({
  name: "",
  email: "",
  role: "user",
  status: "active",
  notifyEmail: false,
  notifySms: false,
  notifyPush: false,
  profileImageName: "",
});

const toTodayText = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * @description 공개 관리자 화면 샘플를 렌더링한다.
 * @param {{ mode: Object, initRows: Array }} props
 */
const AdminDemoView = (props) => {
  const { initRows = [] } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [keyword, setKeyword] = useState("");
  const { value: rows, setValue: setRows } = useDemoSharedState({
    stateKey: "demoAdminUsers",
    initialValue: initRows,
  });
  const { value: systemSetting, setValue: setSystemSetting } =
    useDemoSharedState({
      stateKey: "demoAdminSystemSetting",
      initialValue: SYSTEM_DEFAULT,
    });
  const [drawerState, setDrawerState] = useState({
    isOpen: false,
    mode: "create",
    editingId: null,
  });
  const [userForm, setUserForm] = useState(createDefaultUserForm());
  const [formError, setFormError] = useState("");
  const { showToast } = useGlobalUi();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 180);
    return () => clearTimeout(timer);
  }, []);

  const filteredRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return rows;
    return rows.filter((rowItem) => {
      const targetText = `${rowItem.name} ${rowItem.email} ${ROLE_LABEL_MAP[rowItem.role] || ""}`.toLowerCase();
      return targetText.includes(normalizedKeyword);
    });
  }, [keyword, rows]);

  const tableColumns = useMemo(
    () => [
      {
        key: "profile",
        header: "프로필",
        width: 90,
        render: (rowItem) => (
          <div className="flex items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
              {String(rowItem?.name || "?").slice(0, 1)}
            </div>
          </div>
        ),
      },
      { key: "name", header: "이름", width: 120 },
      { key: "email", header: "이메일", align: "left", width: "2fr" },
      {
        key: "role",
        header: "역할",
        width: 130,
        render: (rowItem) => (
          <Badge variant={ROLE_BADGE_VARIANT_MAP[rowItem?.role] || "neutral"} pill>
            {ROLE_LABEL_MAP[rowItem?.role] || rowItem?.role}
          </Badge>
        ),
      },
      {
        key: "status",
        header: "상태",
        width: 100,
        render: (rowItem) => (
          <Badge variant={STATUS_BADGE_VARIANT_MAP[rowItem?.status] || "neutral"} pill>
            {STATUS_LABEL_MAP[rowItem?.status] || rowItem?.status}
          </Badge>
        ),
      },
      { key: "createdAt", header: "가입일", width: 120 },
      {
        key: "actions",
        header: "관리",
        width: 120,
        render: (rowItem) => (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setDrawerState({
                isOpen: true,
                mode: "edit",
                editingId: rowItem.id,
              });
              setUserForm({
                name: rowItem.name || "",
                email: rowItem.email || "",
                role: rowItem.role || "user",
                status: rowItem.status || "active",
                notifyEmail: Boolean(rowItem.notifyEmail),
                notifySms: Boolean(rowItem.notifySms),
                notifyPush: Boolean(rowItem.notifyPush),
                profileImageName: "",
              });
              setFormError("");
            }}
          >
            수정
          </Button>
        ),
      },
    ],
    [],
  );

  const openCreateDrawer = () => {
    setDrawerState({
      isOpen: true,
      mode: "create",
      editingId: null,
    });
    setUserForm(createDefaultUserForm());
    setFormError("");
  };

  const closeDrawer = () => {
    setDrawerState({
      isOpen: false,
      mode: "create",
      editingId: null,
    });
    setFormError("");
  };

  const saveUser = () => {
    const name = String(userForm.name || "").trim();
    const email = String(userForm.email || "").trim();
    if (!name) {
      setFormError("이름을 입력해주세요.");
      return;
    }
    if (!email) {
      setFormError("이메일을 입력해주세요.");
      return;
    }
    if (drawerState.mode === "create") {
      const nextId = Math.max(0, ...rows.map((rowItem) => Number(rowItem.id || 0))) + 1;
      setRows((prevRows) => [
        {
          id: nextId,
          name,
          email,
          role: userForm.role,
          status: userForm.status,
          createdAt: toTodayText(),
          notifyEmail: Boolean(userForm.notifyEmail),
          notifySms: Boolean(userForm.notifySms),
          notifyPush: Boolean(userForm.notifyPush),
          profileImageUrl: "",
        },
        ...prevRows,
      ]);
      showToast("사용자가 등록되었습니다.", { type: "success" });
    } else {
      setRows((prevRows) =>
        prevRows.map((prevRow) =>
          prevRow.id === drawerState.editingId
            ? {
                ...prevRow,
                name,
                role: userForm.role,
                status: userForm.status,
                notifyEmail: Boolean(userForm.notifyEmail),
                notifySms: Boolean(userForm.notifySms),
                notifyPush: Boolean(userForm.notifyPush),
              }
            : prevRow,
        ),
      );
      showToast("사용자 정보가 저장되었습니다.", { type: "success" });
    }
    closeDrawer();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">관리자 화면 샘플</h1>
        <p className="mt-2 text-sm text-gray-600">
          사용자/권한/설정 페이지 구성을 공개 샘플 형태로 보여줍니다.
        </p>
      </section>

      {isLoading ? (
        <Card title="로딩 중">
          <p className="text-sm text-gray-600">관리자 화면 데이터를 준비하는 중입니다...</p>
        </Card>
      ) : null}

      <Card title="관리자 패널">
        <Tab
          tabIndex={tabIndex}
          onChange={(event) =>
            setTabIndex(Number(event?.target?.value || 0))
          }
        >
          <Tab.Item title={TAB_LIST[0].label}>
            <div className="space-y-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="flex-1">
                  <Input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="이름/이메일/역할 검색"
                  />
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setKeyword("")}
                  className="w-full sm:w-auto"
                >
                  초기화
                </Button>
                <Button
                  variant="primary"
                  onClick={openCreateDrawer}
                  className="w-full sm:w-auto"
                >
                  사용자 추가
                </Button>
              </div>
              <EasyTable
                data={filteredRows}
                columns={tableColumns}
                loading={isLoading}
                pageSize={5}
                empty="데이터가 없습니다."
                rowKey={(rowItem, rowIndex) => rowItem?.id ?? rowIndex}
              />
            </div>
          </Tab.Item>

          <Tab.Item title={TAB_LIST[1].label}>
            <div className="grid gap-3 md:grid-cols-3">
              {ROLE_OPTION_LIST.map((roleItem) => (
                <article
                  key={roleItem.value}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <h3 className="text-base font-semibold text-gray-900">
                    {roleItem.text}
                  </h3>
                  <div className="mt-3 space-y-2">
                    {ROLE_PERMISSION_LIST.map((permissionItem) => (
                      <div key={permissionItem.key} className="flex items-center">
                        <Checkbox
                          checked={Boolean(
                            ROLE_PERMISSION_MAP[roleItem.value]?.[permissionItem.key],
                          )}
                          disabled
                          label={permissionItem.label}
                        />
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </Tab.Item>

          <Tab.Item title={TAB_LIST[2].label}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">사이트명</span>
                <Input
                  value={systemSetting.siteName}
                  onChange={(event) =>
                    setSystemSetting((prevSetting) => ({
                      ...prevSetting,
                      siteName: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">관리자 이메일</span>
                <Input
                  value={systemSetting.adminEmail}
                  onChange={(event) =>
                    setSystemSetting((prevSetting) => ({
                      ...prevSetting,
                      adminEmail: event.target.value,
                    }))
                  }
                  type="email"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">세션 타임아웃(분)</span>
                <Input
                  value={String(systemSetting.sessionTimeout)}
                  onChange={(event) =>
                    setSystemSetting((prevSetting) => ({
                      ...prevSetting,
                      sessionTimeout: Number(event?.target?.value || 0),
                    }))
                  }
                  type="number"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">최대 업로드 크기(MB)</span>
                <Input
                  value={String(systemSetting.maxUploadMb)}
                  onChange={(event) =>
                    setSystemSetting((prevSetting) => ({
                      ...prevSetting,
                      maxUploadMb: Number(event?.target?.value || 0),
                    }))
                  }
                  type="number"
                />
              </label>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <Switch
                    checked={Boolean(systemSetting.maintenanceMode)}
                    onChange={(event) =>
                      setSystemSetting((prevSetting) => ({
                        ...prevSetting,
                        maintenanceMode: Boolean(event?.target?.checked),
                      }))
                    }
                  />
                  점검 모드
                </label>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="primary"
                className="w-full sm:w-auto"
                onClick={() =>
                  showToast("설정이 저장되었습니다", {
                    type: "success",
                  })
                }
              >
                저장
              </Button>
            </div>
          </Tab.Item>
        </Tab>
      </Card>

      <Drawer
        isOpen={drawerState.isOpen}
        onClose={closeDrawer}
        side="right"
        size={500}
        collapseButton
      >
        <div className="space-y-4 p-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {drawerState.mode === "create" ? "사용자 추가" : "사용자 수정"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {drawerState.mode === "create"
                ? "신규 사용자를 등록합니다."
                : `사용자 번호 #${drawerState.editingId || "-"}`}
            </p>
          </div>

          {formError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">프로필 이미지</span>
            <input
              type="file"
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              onChange={(event) => {
                const nextFile = event?.target?.files?.[0];
                setUserForm((prevForm) => ({
                  ...prevForm,
                  profileImageName: nextFile?.name || "",
                }));
              }}
            />
            {userForm.profileImageName ? (
              <p className="text-xs text-gray-500">{userForm.profileImageName}</p>
            ) : null}
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">이름</span>
            <Input
              value={userForm.name}
              onChange={(event) =>
                setUserForm((prevForm) => ({
                  ...prevForm,
                  name: event.target.value,
                }))
              }
              placeholder="이름을 입력해주세요"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">이메일</span>
            <Input
              value={userForm.email}
              readOnly={drawerState.mode === "edit"}
              onChange={(event) =>
                setUserForm((prevForm) => ({
                  ...prevForm,
                  email: event.target.value,
                }))
              }
              placeholder="이메일을 입력해주세요"
              type="email"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">역할</span>
            <Select
              value={userForm.role}
              onChange={(event) =>
                setUserForm((prevForm) => ({
                  ...prevForm,
                  role: event.target.value,
                }))
              }
              dataList={ROLE_OPTION_LIST}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">상태</span>
            <Select
              value={userForm.status}
              onChange={(event) =>
                setUserForm((prevForm) => ({
                  ...prevForm,
                  status: event.target.value,
                }))
              }
              dataList={STATUS_OPTION_LIST}
            />
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">알림 설정</span>
            <div className="flex flex-wrap gap-4">
              <Switch
                label="이메일 알림"
                checked={Boolean(userForm.notifyEmail)}
                onChange={(event) =>
                  setUserForm((prevForm) => ({
                    ...prevForm,
                    notifyEmail: Boolean(event?.target?.checked),
                  }))
                }
              />
              <Switch
                label="SMS 알림"
                checked={Boolean(userForm.notifySms)}
                onChange={(event) =>
                  setUserForm((prevForm) => ({
                    ...prevForm,
                    notifySms: Boolean(event?.target?.checked),
                  }))
                }
              />
              <Switch
                label="푸시 알림"
                checked={Boolean(userForm.notifyPush)}
                onChange={(event) =>
                  setUserForm((prevForm) => ({
                    ...prevForm,
                    notifyPush: Boolean(event?.target?.checked),
                  }))
                }
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="secondary" onClick={closeDrawer} className="w-full sm:w-auto">
              취소
            </Button>
            <Button onClick={saveUser} className="w-full sm:w-auto">저장</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default AdminDemoView;
