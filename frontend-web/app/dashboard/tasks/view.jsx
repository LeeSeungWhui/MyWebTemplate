"use client";
/**
 * 파일명: dashboard/tasks/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 업무 관리 클라이언트 뷰(CSR API 연동 CRUD)
 */

import { useEffect } from "react";
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
import { useEasyList } from "@/app/lib/dataset/EasyList";
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
 * @description 업무 관리 페이지의 CSR 뷰를 렌더링. 입력/출력 계약을 함께 명시
 * 처리 규칙: 목록 조회/드로어 CRUD/브라우저 쿼리 동기화를 단일 컴포넌트에서 제어한다.
 */
const TasksView = ({ initialFilter = {} }) => {

  const router = useRouter();
  const pathname = usePathname();
  const { showToast, showConfirm } = useGlobalUi();
  const defaultTaskForm = {
    title: "",
    status: "ready",
    amount: 0,
    tags: "",
    description: "",
  };
  const ui = EasyObj({
    keyword: String(initialFilter?.keyword || ""),
    status: String(initialFilter?.status || ""),
    sort: String(initialFilter?.sort || DEFAULT_SORT),
    page:
      Number.isFinite(initialFilter?.page) && initialFilter.page > 0
        ? Number(initialFilter.page)
        : 1,
    isLoading: true,
    isSaving: false,
    isDrawerLoading: false,
    error: null,
    isDrawerOpen: false,
    drawerMode: "create",
    editingId: null,
    form: { ...defaultTaskForm },
  });
  const taskList = useEasyList([]);
  const taskMetaObj = EasyObj({ totalCount: 0 });
  const taskDetailObj = EasyObj({});
  const endPoints = PAGE_MODE.endPoints || {};
  const hasListEndpoint = Boolean(endPoints.list);
  const hasDetailEndpoint = Boolean(endPoints.detail);
  const hasCreateEndpoint = Boolean(endPoints.create);
  const hasUpdateEndpoint = Boolean(endPoints.update);
  const hasRemoveEndpoint = Boolean(endPoints.remove);
  const tableColumns = [
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
  ];
  const pageCount = Math.max(1, Math.ceil(taskMetaObj.totalCount / PAGE_SIZE));

  /**
   * @description tags 입력값을 문자열 배열로 정규화. 입력/출력 계약을 함께 명시
   * 처리 규칙: 배열/JSON 문자열/쉼표 문자열 입력을 모두 `string[]` 포맷으로 통일한다.
   * @updated 2026-02-27
   */
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

  /**
   * @description tags 값을 화면 표시용 문자열로 변환. 입력/출력 계약을 함께 명시
   * 처리 규칙: 내부적으로 toTagList를 호출한 뒤 `, ` 구분자로 join한다.
   * @updated 2026-02-27
   */
  const toTagText = (value) => toTagList(value).join(", ");

  /**
   * @description 금액 값을 로케일 통화 문자열로 변환. 입력/출력 계약을 함께 명시
   * 처리 규칙: 숫자 변환 실패 시 0원 문구를 반환하고, 정상 값은 `ko-KR` 포맷으로 반환한다.
   * @updated 2026-02-27
   */
  const toCurrencyText = (value) => {
    const amount = Number(value || 0);
    if (Number.isNaN(amount)) return LANG_KO.view.misc.currencyZero;
    return amount.toLocaleString("ko-KR");
  };

  /**
   * @description 날짜 값을 `YYYY-MM-DD` 문자열로 변환
   * 처리 규칙: 값이 없거나 Date 파싱 실패면 `dateUnknown` 문구를 반환한다.
   * @updated 2026-02-27
   */
  const toDateText = (value) => {
    if (!value) return LANG_KO.view.misc.dateUnknown;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return LANG_KO.view.misc.dateUnknown;
    return date.toISOString().slice(0, 10);
  };

  /**
   * @description 템플릿 경로의 `:id` 플레이스홀더를 실제 ID로 치환
   * 처리 규칙: path/id를 문자열로 변환한 뒤 첫 `:id` 토큰을 치환해 반환한다.
   * @updated 2026-02-27
   */
  const toPathWithId = (templatePath, id) =>
    String(templatePath || "").replace(":id", String(id));

  /**
   * @description API 예외를 UI 표시용 에러 객체로 정규화. 입력/출력 계약을 함께 명시
   * 처리 규칙: 에러 message/requestId를 우선 사용하고 없으면 fallbackMessage를 message로 사용한다.
   * @updated 2026-02-27
   */
  const toApiError = (error, fallbackMessage) => ({
    message: error?.message || fallbackMessage,
    requestId: error?.requestId,
  });

  /**
   * @description 현재 필터/페이지 상태를 브라우저 쿼리스트링과 동기화
   * 처리 규칙: pathname이 존재할 때만 queryString을 생성하고 `router.replace(..., { scroll: false })`를 호출한다.
   * @updated 2026-02-27
   */
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

  /**
   * @description 업무 목록 엔드포인트를 호출해 taskList/taskMetaObj와 화면 상태를 동기화
   * 실패 동작: 엔드포인트 누락/요청 실패 시 ui.error를 설정하고 목록/totalCount를 안전값으로 초기화한다.
   * 부작용: ui.isLoading/ui.page/ui.sort 상태와 브라우저 query를 갱신할 수 있다.
   * @updated 2026-02-27
   */
  const loadTasks = async (options = {}) => {

    const {
      nextKeyword = ui.keyword,
      nextStatus = ui.status,
      nextSort = ui.sort,
      nextPage = ui.page,
      syncQuery = true,
    } = options;
    if (!hasListEndpoint) {
      ui.error = { message: LANG_KO.view.error.listEndpointMissing };
      taskList.copy([]);
      taskMetaObj.totalCount = 0;
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
      taskList.copy(itemList);
      taskMetaObj.totalCount = total;
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
      taskList.copy([]);
      taskMetaObj.totalCount = 0;
      ui.error = toApiError(err, LANG_KO.view.error.listLoadFailed);
    } finally {
      ui.isLoading = false;
    }
  };

  /**
   * @description 신규 생성 모드 드로어 열기
   * 처리 규칙: drawerMode/editingId/form/isDrawerLoading을 생성 상태로 초기화한다.
   * @updated 2026-02-27
   */
  const openCreateDrawer = () => {
    ui.drawerMode = "create";
    ui.editingId = null;
    ui.form = { ...defaultTaskForm };
    ui.isDrawerOpen = true;
    ui.isDrawerLoading = false;
  };

  /**
   * @description 수정 모드로 드로어를 열고 상세 데이터를 로드
   * 처리 규칙: 엔드포인트/ID 검증 후 상세 API를 호출해 form 값을 기존 데이터로 채운다.
   * @updated 2026-02-27
   */
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
      taskDetailObj.copy(detail);
      ui.form = {
        title: taskDetailObj.title || "",
        status: taskDetailObj.status || LANG_KO.view.misc.defaultStatusCode,
        amount: Number(taskDetailObj.amount || 0),
        tags: toTagText(taskDetailObj.tags),
        description: taskDetailObj.description || "",
      };
    } catch (err) {
      console.error(LANG_KO.view.error.detailLoadFailed, err);
      showToast(err?.message || LANG_KO.view.error.detailLoadFailed, { type: "error" });
      ui.isDrawerOpen = false;
    } finally {
      ui.isDrawerLoading = false;
    }
  };

  /**
   * @description 드로어 닫기
   * 처리 규칙: 저장 중(isSaving=true)에는 닫기를 막고, 그 외에는 드로어 상태를 초기화한다.
   * @updated 2026-02-27
   */
  const closeDrawer = () => {
    if (ui.isSaving) return;
    ui.isDrawerOpen = false;
    ui.isDrawerLoading = false;
  };

  /**
   * @description 생성/수정 폼 검증 후 저장 API 요청 전송
   * 처리 규칙: 필수값 검증 실패 시 즉시 중단하고, 성공 시 toast/목록 재조회/드로어 닫기를 수행한다.
   * @updated 2026-02-27
   */
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

  /**
   * @description 삭제 확인 후 업무 항목을 제거
   * 처리 규칙: confirm=true일 때만 삭제 API를 호출하고, 삭제 후 페이지 보정 규칙으로 목록을 재조회한다.
   * @updated 2026-02-27
   */
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
      const nextPage = ui.page > 1 && taskList.length === 1 ? ui.page - 1 : ui.page;
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

  return (
    <div className="space-y-3">
      {ui.error?.message ? (
        <section aria-label={LANG_KO.view.error.listLoadFailed}>
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <div>{ui.error.message}</div>
            {ui.error.requestId ? (
              <div className="mt-1 text-xs text-red-700/80">
                {LANG_KO.view.error.requestIdLabel}: {ui.error.requestId}
              </div>
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
          data={taskList}
          loading={ui.isLoading}
          columns={tableColumns}
          pageSize={PAGE_SIZE}
          empty={LANG_KO.view.table.emptyFallback}
          rowKey={(row, idx) => row?.id ?? idx}
        />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">
            {`총 ${taskMetaObj.totalCount.toLocaleString("ko-KR")}${LANG_KO.view.action.totalCountSuffix}`}
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
