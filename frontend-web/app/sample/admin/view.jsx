"use client";
/**
 * 파일명: sample/admin/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 관리자 화면 샘플 페이지 뷰(탭/사용자 Drawer 포함)
 */

import { useEffect, useMemo } from "react";
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
import EasyObj from "@/app/lib/dataset/EasyObj";
import {
  ROLE_OPTION_LIST,
  STATUS_OPTION_LIST,
  TAB_LIST,
} from "./initData";
import LANG_KO from "./lang.ko";

const ROLE_BADGE_VARIANT_MAP = {
  admin: "primary",
  editor: "warning",
  user: "neutral",
};

const STATUS_BADGE_VARIANT_MAP = {
  active: "success",
  inactive: "neutral",
};

const ROLE_PERMISSION_LIST = LANG_KO.view.rolePermissionList.map((item) => ({ ...item }));

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

const SYSTEM_DEFAULT = { ...LANG_KO.view.systemDefault };

/**
 * @description 공개 관리자 화면 샘플를 렌더링한다.
 * @param {{ mode: Object, initRows: Array }} props
 */
const AdminDemoView = (props) => {
  const { initRows = [] } = props;
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
  const ui = EasyObj(
    useMemo(
      () => ({
        isLoading: true,
        tabIndex: 0,
        keyword: "",
        drawerState: {
          isOpen: false,
          mode: "create",
          editingId: null,
        },
        userForm: createDefaultUserForm(),
        formError: "",
      }),
      [],
    ),
  );
  const { value: rows, setValue: setRows } = useDemoSharedState({
    stateKey: "demoAdminUsers",
    initialValue: initRows,
  });
  const { value: systemSetting, setValue: setSystemSetting } =
    useDemoSharedState({
      stateKey: "demoAdminSystemSetting",
      initialValue: SYSTEM_DEFAULT,
    });
  const { showToast } = useGlobalUi();

  useEffect(() => {
    const timer = setTimeout(() => {
      ui.isLoading = false;
    }, 180);
    return () => clearTimeout(timer);
  }, [ui]);

  const filteredRows = useMemo(() => {
    const normalizedKeyword = ui.keyword.trim().toLowerCase();
    if (!normalizedKeyword) return rows;
    return rows.filter((rowItem) => {
      const targetText = `${rowItem.name} ${rowItem.email} ${LANG_KO.view.roleLabelMap[rowItem.role] || ""}`.toLowerCase();
      return targetText.includes(normalizedKeyword);
    });
  }, [ui.keyword, rows]);

  const tableColumns = useMemo(
    () => [
      {
        key: "profile",
        header: LANG_KO.view.table.profileHeader,
        width: 90,
        render: (rowItem) => (
          <div className="flex items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
              {String(rowItem?.name || "?").slice(0, 1)}
            </div>
          </div>
        ),
      },
      { key: "name", header: LANG_KO.view.table.nameHeader, width: 120 },
      { key: "email", header: LANG_KO.view.table.emailHeader, align: "left", width: "2fr" },
      {
        key: "role",
        header: LANG_KO.view.table.roleHeader,
        width: 130,
        render: (rowItem) => (
          <Badge variant={ROLE_BADGE_VARIANT_MAP[rowItem?.role] || "neutral"} pill>
            {LANG_KO.view.roleLabelMap[rowItem?.role] || rowItem?.role}
          </Badge>
        ),
      },
      {
        key: "status",
        header: LANG_KO.view.table.statusHeader,
        width: 100,
        render: (rowItem) => (
          <Badge variant={STATUS_BADGE_VARIANT_MAP[rowItem?.status] || "neutral"} pill>
            {LANG_KO.view.statusLabelMap[rowItem?.status] || rowItem?.status}
          </Badge>
        ),
      },
      { key: "createdAt", header: LANG_KO.view.table.createdAtHeader, width: 120 },
      {
        key: "actions",
        header: LANG_KO.view.table.actionsHeader,
        width: 120,
        render: (rowItem) => (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              ui.drawerState = {
                isOpen: true,
                mode: "edit",
                editingId: rowItem.id,
              };
              ui.userForm = {
                name: rowItem.name || "",
                email: rowItem.email || "",
                role: rowItem.role || "user",
                status: rowItem.status || "active",
                notifyEmail: Boolean(rowItem.notifyEmail),
                notifySms: Boolean(rowItem.notifySms),
                notifyPush: Boolean(rowItem.notifyPush),
                profileImageName: "",
              };
              ui.formError = "";
            }}
          >
            {LANG_KO.view.users.editButton}
          </Button>
        ),
      },
    ],
    [],
  );

  const openCreateDrawer = () => {
    ui.drawerState = {
      isOpen: true,
      mode: "create",
      editingId: null,
    };
    ui.userForm = createDefaultUserForm();
    ui.formError = "";
  };

  const closeDrawer = () => {
    ui.drawerState = {
      isOpen: false,
      mode: "create",
      editingId: null,
    };
    ui.formError = "";
  };

  const saveUser = () => {
    const name = String(ui.userForm.name || "").trim();
    const email = String(ui.userForm.email || "").trim();
    if (!name) {
      ui.formError = LANG_KO.view.users.nameRequired;
      return;
    }
    if (!email) {
      ui.formError = LANG_KO.view.users.emailRequired;
      return;
    }
    if (ui.drawerState.mode === "create") {
      const nextId = Math.max(0, ...rows.map((rowItem) => Number(rowItem.id || 0))) + 1;
      setRows((prevRows) => [
        {
          id: nextId,
          name,
          email,
          role: ui.userForm.role,
          status: ui.userForm.status,
          createdAt: toTodayText(),
          notifyEmail: Boolean(ui.userForm.notifyEmail),
          notifySms: Boolean(ui.userForm.notifySms),
          notifyPush: Boolean(ui.userForm.notifyPush),
          profileImageUrl: "",
        },
        ...prevRows,
      ]);
      showToast(LANG_KO.view.users.saveCreatedToast, { type: "success" });
    } else {
      setRows((prevRows) =>
        prevRows.map((prevRow) =>
          prevRow.id === ui.drawerState.editingId
            ? {
                ...prevRow,
                name,
                role: ui.userForm.role,
                status: ui.userForm.status,
                notifyEmail: Boolean(ui.userForm.notifyEmail),
                notifySms: Boolean(ui.userForm.notifySms),
                notifyPush: Boolean(ui.userForm.notifyPush),
              }
            : prevRow,
        ),
      );
      showToast(LANG_KO.view.users.saveUpdatedToast, { type: "success" });
    }
    closeDrawer();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{LANG_KO.view.section.title}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {LANG_KO.view.section.subtitle}
        </p>
      </section>

      {ui.isLoading ? (
        <Card title={LANG_KO.view.card.loadingTitle}>
          <p className="text-sm text-gray-600">{LANG_KO.view.card.loadingBody}</p>
        </Card>
      ) : null}

      <Card title={LANG_KO.view.card.panelTitle}>
        <Tab
          tabIndex={ui.tabIndex}
          onChange={(event) => {
            ui.tabIndex = Number(event?.target?.value || 0);
          }}
        >
          <Tab.Item title={TAB_LIST[0].label}>
            <div className="space-y-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="flex-1">
                  <Input
                    value={ui.keyword}
                    onChange={(event) => {
                      ui.keyword = event.target.value;
                    }}
                    placeholder={LANG_KO.view.users.searchPlaceholder}
                  />
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    ui.keyword = "";
                  }}
                  className="w-full sm:w-auto"
                >
                  {LANG_KO.view.users.resetButton}
                </Button>
                <Button
                  variant="primary"
                  onClick={openCreateDrawer}
                  className="w-full sm:w-auto"
                >
                  {LANG_KO.view.users.addButton}
                </Button>
              </div>
              <EasyTable
                data={filteredRows}
                columns={tableColumns}
                loading={ui.isLoading}
                pageSize={5}
                empty={LANG_KO.view.table.empty}
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
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.settings.siteNameLabel}</span>
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
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.settings.adminEmailLabel}</span>
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
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.settings.sessionTimeoutLabel}</span>
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
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.settings.maxUploadLabel}</span>
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
                  {LANG_KO.view.settings.maintenanceModeLabel}
                </label>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="primary"
                className="w-full sm:w-auto"
                onClick={() =>
                  showToast(LANG_KO.view.settings.saveToast, {
                    type: "success",
                  })
                }
              >
                {LANG_KO.view.settings.saveButton}
              </Button>
            </div>
          </Tab.Item>
        </Tab>
      </Card>

      <Drawer
        isOpen={ui.drawerState.isOpen}
        onClose={closeDrawer}
        side="right"
        size={500}
        collapseButton
      >
        <div className="space-y-4 p-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {ui.drawerState.mode === "create" ? LANG_KO.view.drawer.createTitle : LANG_KO.view.drawer.editTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {ui.drawerState.mode === "create"
                ? LANG_KO.view.drawer.createSubtitle
                : `${LANG_KO.view.drawer.editSubtitlePrefix}${ui.drawerState.editingId || "-"}`}
            </p>
          </div>

          {ui.formError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {ui.formError}
            </div>
          ) : null}

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.profileImageLabel}</span>
            <input
              type="file"
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              onChange={(event) => {
                const nextFile = event?.target?.files?.[0];
                ui.userForm.profileImageName = nextFile?.name || "";
              }}
            />
            {ui.userForm.profileImageName ? (
              <p className="text-xs text-gray-500">{ui.userForm.profileImageName}</p>
            ) : null}
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.nameLabel}</span>
            <Input
              value={ui.userForm.name}
              onChange={(event) => {
                ui.userForm.name = event.target.value;
              }}
              placeholder={LANG_KO.view.drawer.namePlaceholder}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.emailLabel}</span>
            <Input
              value={ui.userForm.email}
              readOnly={ui.drawerState.mode === "edit"}
              onChange={(event) => {
                ui.userForm.email = event.target.value;
              }}
              placeholder={LANG_KO.view.drawer.emailPlaceholder}
              type="email"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.roleLabel}</span>
            <Select
              value={ui.userForm.role}
              onChange={(event) => {
                ui.userForm.role = event.target.value;
              }}
              dataList={ROLE_OPTION_LIST}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.statusLabel}</span>
            <Select
              value={ui.userForm.status}
              onChange={(event) => {
                ui.userForm.status = event.target.value;
              }}
              dataList={STATUS_OPTION_LIST}
            />
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.notifyLabel}</span>
            <div className="flex flex-wrap gap-4">
              <Switch
                label={LANG_KO.view.drawer.notifyEmailLabel}
                checked={Boolean(ui.userForm.notifyEmail)}
                onChange={(event) => {
                  ui.userForm.notifyEmail = Boolean(event?.target?.checked);
                }}
              />
              <Switch
                label={LANG_KO.view.drawer.notifySmsLabel}
                checked={Boolean(ui.userForm.notifySms)}
                onChange={(event) => {
                  ui.userForm.notifySms = Boolean(event?.target?.checked);
                }}
              />
              <Switch
                label={LANG_KO.view.drawer.notifyPushLabel}
                checked={Boolean(ui.userForm.notifyPush)}
                onChange={(event) => {
                  ui.userForm.notifyPush = Boolean(event?.target?.checked);
                }}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="secondary" onClick={closeDrawer} className="w-full sm:w-auto">
              {LANG_KO.view.drawer.cancelButton}
            </Button>
            <Button onClick={saveUser} className="w-full sm:w-auto">{LANG_KO.view.drawer.saveButton}</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default AdminDemoView;
