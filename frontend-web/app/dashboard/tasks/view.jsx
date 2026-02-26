"use client";
/**
 * 파일명: dashboard/tasks/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 업무 관리 클라이언트 뷰(CSR API 연동 CRUD)
 */

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useGlobalUi } from "@/app/common/store/SharedStore";
import Badge from "@/app/lib/component/Badge";
import Button from "@/app/lib/component/Button";
import Card from "@/app/lib/component/Card";
import Drawer from "@/app/lib/component/Drawer";
import EasyTable from "@/app/lib/component/EasyTable";
import Input from "@/app/lib/component/Input";
import NumberInput from "@/app/lib/component/NumberInput";
import Pagination from "@/app/lib/component/Pagination";
import Select from "@/app/lib/component/Select";
import Textarea from "@/app/lib/component/Textarea";
import { apiJSON } from "@/app/lib/runtime/api";
import { safeJsonParse } from "@/app/lib/runtime/json";
import EasyObj from "@/app/lib/dataset/EasyObj";
import {
  buildTasksQueryString,
  DEFAULT_SORT,
  PAGE_MODE,
  SORT_FILTER_LIST,
  STATUS_FILTER_LIST,
} from "./initData";
import LANG_KO from "./lang.ko";

const PAGE_SIZE = 10;

const STATUS_BADGE_VARIANT = {
  ready: "neutral",
  pending: "warning",
  running: "primary",
  done: "success",
  failed: "danger",
};

const STATUS_FORM_LIST = STATUS_FILTER_LIST.filter((item) => item.value);

/**
 * @description TasksView export를 노출한다.
 */
const TasksView = ({ initialFilter = {} }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast, showConfirm } = useGlobalUi();
  const toTagList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (typeof value !== "string" || !value.trim()) return [];
    const parsedValue = safeJsonParse(value, null);
    if (Array.isArray(parsedValue)) return parsedValue.filter(Boolean).map(String);
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  };
  const toTagText = (value) => toTagList(value).join(", ");
  const toCurrencyText = (value) => {
    const amount = Number(value || 0);
    if (Number.isNaN(amount)) return LANG_KO.view.misc.currencyZero;
    return amount.toLocaleString("ko-KR");
  };
  const toDateText = (value) => {
    if (!value) return LANG_KO.view.misc.dateUnknown;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return LANG_KO.view.misc.dateUnknown;
    return date.toISOString().slice(0, 10);
  };
  const toPathWithId = (templatePath, id) =>
    String(templatePath || "").replace(":id", String(id));
  const toApiError = (error, fallbackMessage) => ({
    message: error?.message || fallbackMessage,
    requestId: error?.requestId,
  });
  const createDefaultForm = () => ({
    title: "",
    status: "ready",
    amount: 0,
    tags: "",
    description: "",
  });
  const ui = EasyObj(
    useMemo(
      () => ({
        keyword: String(initialFilter?.keyword || ""),
        status: String(initialFilter?.status || ""),
        sort: String(initialFilter?.sort || DEFAULT_SORT),
        page:
          Number.isFinite(initialFilter?.page) && initialFilter.page > 0
            ? Number(initialFilter.page)
            : 1,
        totalCount: 0,
        rows: [],
        isLoading: true,
        isSaving: false,
        isDrawerLoading: false,
        error: null,
        isDrawerOpen: false,
        drawerMode: "create",
        editingId: null,
        form: createDefaultForm(),
      }),
      [],
    ),
  );
  const endPoints = PAGE_MODE.endPoints || {};
  const hasListEndpoint = Boolean(endPoints.list);
  const hasDetailEndpoint = Boolean(endPoints.detail);
  const hasCreateEndpoint = Boolean(endPoints.create);
  const hasUpdateEndpoint = Boolean(endPoints.update);
  const hasRemoveEndpoint = Boolean(endPoints.remove);

  const syncBrowserQuery = ({ nextKeyword, nextStatus, nextSort, nextPage }) => {
    if (!pathname) return;
    const queryString = buildTasksQueryString({
      keyword: nextKeyword,
      status: nextStatus,
      sort: nextSort,
      page: nextPage,
    });
    const href = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(href, { scroll: false });
  };

  const loadTasks = async ({
    nextKeyword = ui.keyword,
    nextStatus = ui.status,
    nextSort = ui.sort,
    nextPage = ui.page,
    syncQuery = true,
  } = {}) => {
    if (!hasListEndpoint) {
      ui.error = { message: LANG_KO.view.error.listEndpointMissing };
      ui.rows = [];
      ui.totalCount = 0;
      ui.isLoading = false;
      return;
    }
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("size", String(PAGE_SIZE));
    params.set("sort", nextSort || DEFAULT_SORT);
    if (nextKeyword?.trim()) params.set("q", nextKeyword.trim());
    if (nextStatus) params.set("status", nextStatus);
    const queryString = params.toString();
    const url = queryString ? `${endPoints.list}?${queryString}` : endPoints.list;

    ui.isLoading = true;
    ui.error = null;
    try {
      const response = await apiJSON(url);
      const listResult = response?.result;
      const itemList = Array.isArray(listResult)
        ? listResult
        : Array.isArray(listResult?.items)
          ? listResult.items
          : [];
      const totalFromWrapperCount = Number(response?.count);
      const totalFromLegacy = Number(listResult?.total);
      const total = !Number.isNaN(totalFromWrapperCount)
        ? totalFromWrapperCount
        : !Number.isNaN(totalFromLegacy)
          ? totalFromLegacy
          : itemList.length;
      ui.rows = itemList;
      ui.totalCount = total;
      ui.page = nextPage;
      ui.sort = nextSort || DEFAULT_SORT;
      if (syncQuery) {
        syncBrowserQuery({
          nextKeyword,
          nextStatus,
          nextSort: nextSort || DEFAULT_SORT,
          nextPage,
        });
      }
    } catch (err) {
      console.error(LANG_KO.view.error.listLoadFailed, err);
      ui.rows = [];
      ui.totalCount = 0;
      ui.error = toApiError(err, LANG_KO.view.error.listLoadFailed);
    } finally {
      ui.isLoading = false;
    }
  };

  const openCreateDrawer = () => {
    ui.drawerMode = "create";
    ui.editingId = null;
    ui.form = createDefaultForm();
    ui.isDrawerOpen = true;
    ui.isDrawerLoading = false;
  };

  const openEditDrawer = async (id) => {
    if (!id || !hasDetailEndpoint) {
      showToast(LANG_KO.view.error.detailEndpointMissing, { type: "error" });
      return;
    }
    ui.drawerMode = "edit";
    ui.editingId = id;
    ui.isDrawerOpen = true;
    ui.isDrawerLoading = true;
    try {
      const detailPath = toPathWithId(endPoints.detail, id);
      const response = await apiJSON(detailPath);
      const detail = response?.result || {};
      ui.form = {
        title: detail?.title || "",
        status: detail?.status || "ready",
        amount: Number(detail?.amount || 0),
        tags: toTagText(detail?.tags),
        description: detail?.description || "",
      };
    } catch (err) {
      console.error(LANG_KO.view.error.detailLoadFailed, err);
      showToast(err?.message || LANG_KO.view.error.detailLoadFailed, { type: "error" });
      ui.isDrawerOpen = false;
    } finally {
      ui.isDrawerLoading = false;
    }
  };

  const closeDrawer = () => {
    if (ui.isSaving) return;
    ui.isDrawerOpen = false;
    ui.isDrawerLoading = false;
  };

  const saveTask = async () => {
    const title = String(ui.form.title || "").trim();
    if (!title) {
      showToast(LANG_KO.view.validation.titleRequired, { type: "warning" });
      return;
    }
    if (!LANG_KO.view.statusLabelMap[ui.form.status]) {
      showToast(LANG_KO.view.validation.invalidStatus, { type: "warning" });
      return;
    }
    if (ui.drawerMode === "create" && !hasCreateEndpoint) {
      showToast(LANG_KO.view.error.createEndpointMissing, { type: "error" });
      return;
    }
    if (ui.drawerMode === "edit" && (!ui.editingId || !hasUpdateEndpoint)) {
      showToast(LANG_KO.view.error.updateEndpointMissing, { type: "error" });
      return;
    }

    const payload = {
      title,
      status: ui.form.status,
      amount: Number(ui.form.amount || 0),
      tags: toTagList(ui.form.tags),
      description: String(ui.form.description || "").trim(),
    };
    const isCreate = ui.drawerMode === "create";
    const path = isCreate
      ? endPoints.create
      : toPathWithId(endPoints.update, ui.editingId);
    const method = isCreate ? "POST" : "PUT";

    ui.isSaving = true;
    try {
      await apiJSON(path, { method, body: payload });
      showToast(isCreate ? LANG_KO.view.toast.savedCreated : LANG_KO.view.toast.savedUpdated, {
        type: "success",
      });
      ui.isDrawerOpen = false;
      await loadTasks({
        nextKeyword: ui.keyword,
        nextStatus: ui.status,
        nextSort: ui.sort,
        nextPage: isCreate ? 1 : ui.page,
      });
    } catch (err) {
      console.error(LANG_KO.view.error.saveFailed, err);
      showToast(err?.message || LANG_KO.view.error.saveFailed, { type: "error" });
      ui.error = toApiError(err, LANG_KO.view.error.saveFailed);
    } finally {
      ui.isSaving = false;
    }
  };

  const removeTask = async (row) => {
    if (!hasRemoveEndpoint) {
      showToast(LANG_KO.view.error.removeEndpointMissing, { type: "error" });
      return;
    }
    const confirmed = await showConfirm(LANG_KO.view.confirm.removeText, {
      title: LANG_KO.view.confirm.removeTitle,
      type: "warning",
      confirmText: LANG_KO.view.confirm.confirmText,
      cancelText: LANG_KO.view.confirm.cancelText,
    });
    if (!confirmed) return;

    try {
      await apiJSON(toPathWithId(endPoints.remove, row?.id), { method: "DELETE" });
      showToast(LANG_KO.view.toast.removed, { type: "success" });
      const nextPage = ui.page > 1 && ui.rows.length === 1 ? ui.page - 1 : ui.page;
      await loadTasks({
        nextKeyword: ui.keyword,
        nextStatus: ui.status,
        nextSort: ui.sort,
        nextPage,
      });
    } catch (err) {
      console.error(LANG_KO.view.error.removeFailed, err);
      showToast(err?.message || LANG_KO.view.error.removeFailed, { type: "error" });
      ui.error = toApiError(err, LANG_KO.view.error.removeFailed);
    }
  };

  useEffect(() => {
    loadTasks({
      nextKeyword: ui.keyword,
      nextStatus: ui.status,
      nextSort: ui.sort,
      nextPage: ui.page,
      syncQuery: false,
    });
  }, [hasListEndpoint]);

  const tableColumns = useMemo(
    () => [
      {
        key: "title",
        header: LANG_KO.view.table.titleHeader,
        align: "left",
        width: "2fr",
        render: (row) => (
          <button
            type="button"
            className="text-left text-blue-700 hover:underline"
            onClick={() => openEditDrawer(row?.id)}
          >
            {row?.title || "-"}
          </button>
        ),
      },
      {
        key: "status",
        header: LANG_KO.view.table.statusHeader,
        width: 140,
        render: (row) => (
          <Badge variant={STATUS_BADGE_VARIANT[row?.status] || "neutral"} pill>
            {LANG_KO.view.statusLabelMap[row?.status] || row?.status || LANG_KO.view.misc.noData}
          </Badge>
        ),
      },
      {
        key: "amount",
        header: LANG_KO.view.table.amountHeader,
        width: 140,
        align: "right",
        render: (row) => toCurrencyText(row?.amount),
      },
      {
        key: "tags",
        header: LANG_KO.view.table.tagsHeader,
        align: "left",
        width: "2fr",
        render: (row) => {
          const tagList = toTagList(row?.tags);
          if (!tagList.length) return <span className="text-gray-400">{LANG_KO.view.misc.dateUnknown}</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {tagList.map((tag) => (
                <Badge key={`${row?.id || "row"}-${tag}`} variant="outline" pill>
                  {tag}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        key: "createdAt",
        header: LANG_KO.view.table.createdAtHeader,
        width: 140,
        render: (row) => toDateText(row?.createdAt),
      },
      {
        key: "actions",
        header: LANG_KO.view.table.actionsHeader,
        width: 180,
        render: (row) => (
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => openEditDrawer(row?.id)}>
              {LANG_KO.view.action.editButton}
            </Button>
            <Button size="sm" variant="danger" onClick={() => removeTask(row)}>
              {LANG_KO.view.action.removeButton}
            </Button>
          </div>
        ),
      },
    ],
    [ui.rows, ui.keyword, ui.status, ui.page]
  );

  const pageCount = Math.max(1, Math.ceil(ui.totalCount / PAGE_SIZE));

  return (
    <div className="space-y-3">
      {ui.error?.message ? (
        <section aria-label={LANG_KO.view.error.listLoadFailed}>
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <div>{ui.error.message}</div>
            {ui.error.requestId ? (
              <div className="mt-1 text-xs text-red-700/80">requestId: {ui.error.requestId}</div>
            ) : null}
          </div>
        </section>
      ) : null}

      <Card
        title={LANG_KO.view.card.managementTitle}
        actions={
          <Button onClick={openCreateDrawer} variant="primary" className="w-full sm:w-auto">
            {LANG_KO.view.card.quickCreateButton}
          </Button>
        }
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex-1">
            <Input
              value={ui.keyword}
              onChange={(event) => {
                ui.keyword = event.target.value;
              }}
              placeholder={LANG_KO.view.search.keywordPlaceholder}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={ui.status}
              onChange={(event) => {
                ui.status = event.target.value;
              }}
              dataList={STATUS_FILTER_LIST}
            />
          </div>
          <div className="w-full md:w-52">
            <Select
              value={ui.sort}
              onChange={(event) => {
                ui.sort = event.target.value;
              }}
              dataList={SORT_FILTER_LIST}
            />
          </div>
          <Button
            onClick={() =>
              loadTasks({
                nextKeyword: ui.keyword,
                nextStatus: ui.status,
                nextSort: ui.sort,
                nextPage: 1,
              })
            }
            loading={ui.isLoading}
            className="w-full sm:w-auto"
          >
            {LANG_KO.view.search.searchButton}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              ui.keyword = "";
              ui.status = "";
              ui.sort = DEFAULT_SORT;
              loadTasks({
                nextKeyword: "",
                nextStatus: "",
                nextSort: DEFAULT_SORT,
                nextPage: 1,
              });
            }}
            disabled={ui.isLoading}
            className="w-full sm:w-auto"
          >
            {LANG_KO.view.search.resetButton}
          </Button>
        </div>
      </Card>

      <Card title={LANG_KO.view.card.tableTitle}>
        <EasyTable
          data={ui.rows}
          loading={ui.isLoading}
          columns={tableColumns}
          pageSize={PAGE_SIZE}
          empty={LANG_KO.view.table.emptyFallback}
          rowKey={(row, idx) => row?.id ?? idx}
        />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">
            {`총 ${ui.totalCount.toLocaleString("ko-KR")}${LANG_KO.view.action.totalCountSuffix}`}
          </div>
          <Pagination
            page={ui.page}
            pageCount={pageCount}
            onChange={(nextPage) =>
              loadTasks({
                nextKeyword: ui.keyword,
                nextStatus: ui.status,
                nextSort: ui.sort,
                nextPage,
              })
            }
          />
        </div>
      </Card>

      <Drawer isOpen={ui.isDrawerOpen} onClose={closeDrawer} side="right" size={460} collapseButton>
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {ui.drawerMode === "create" ? LANG_KO.view.drawer.createTitle : LANG_KO.view.drawer.editTitle}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {ui.drawerMode === "create"
                ? LANG_KO.view.drawer.createSubtitle
                : `${LANG_KO.view.drawer.editSubtitlePrefix}${ui.editingId || LANG_KO.view.misc.dateUnknown}`}
            </p>
          </div>

          {ui.isDrawerLoading ? (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
              {LANG_KO.view.misc.drawerLoading}
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.titleLabel}</span>
                <Input
                  value={ui.form.title}
                  onChange={(event) => {
                    ui.form.title = event.target.value;
                  }}
                  placeholder={LANG_KO.view.drawer.titlePlaceholder}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.statusLabel}</span>
                <Select
                  value={ui.form.status}
                  onChange={(event) => {
                    ui.form.status = event.target.value;
                  }}
                  dataList={STATUS_FORM_LIST}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.amountLabel}</span>
                <NumberInput
                  value={ui.form.amount}
                  min={0}
                  step={1000}
                  onChange={(event) => {
                    ui.form.amount = Number(event?.target?.value || 0);
                  }}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.tagsLabel}</span>
                <Input
                  value={ui.form.tags}
                  onChange={(event) => {
                    ui.form.tags = event.target.value;
                  }}
                  placeholder={LANG_KO.view.drawer.tagsPlaceholder}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.descriptionLabel}</span>
                <Textarea
                  rows={5}
                  value={ui.form.description}
                  onChange={(event) => {
                    ui.form.description = event.target.value;
                  }}
                  placeholder={LANG_KO.view.drawer.descriptionPlaceholder}
                />
              </label>
            </div>
          )}

          <div className="pt-2 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="secondary" onClick={closeDrawer} disabled={ui.isSaving} className="w-full sm:w-auto">
              {LANG_KO.view.drawer.cancelButton}
            </Button>
            <Button onClick={saveTask} loading={ui.isSaving || ui.isDrawerLoading} className="w-full sm:w-auto">
              {LANG_KO.view.drawer.saveButton}
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default TasksView;
