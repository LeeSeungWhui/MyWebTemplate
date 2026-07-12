"use client";

/**
 * 파일명: dashboard/tasks/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: 업무 관리 클라이언트 뷰(CSR API 연동 CRUD)
 */

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useGlobalUi } from "@/app/common/store/SharedStore";
import { normalizePageConfig } from "@/app/lib/runtime/pageData";
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
import { parseJsonText } from "@/app/lib/runtime/json";
import EasyObj from "@/app/lib/dataset/EasyObj";
import { useEasyList } from "@/app/lib/dataset/EasyList";
import { PAGE_CONFIG } from "./initData";
import LANG_KO from "./lang.ko";

/**
 * @description 업무 관리 페이지의 CSR 뷰를 렌더링. 입력/출력 계약을 함께 명시
 * 처리 규칙: 목록 조회/드로어 CRUD/브라우저 쿼리 동기화를 단일 컴포넌트에서 제어한다.
 */
const TasksView = () => {

  /* 1. 상수 ======================================================================================================================= */
  const pageSize = 10;
  const defaultSort = "reg_dt_desc";
  const statusFilterList = useMemo(() => LANG_KO.initData.statusFilterList, []);
  const sortFilterList = useMemo(() => LANG_KO.initData.sortFilterList, []);
  const allowedStatus = useMemo(
    () => new Set(statusFilterList.map((statusFilterObj) => statusFilterObj.value).filter(Boolean)),
    [statusFilterList],
  );
  const allowedSort = useMemo(
    () => new Set(sortFilterList.map((sortFilterObj) => sortFilterObj.value)),
    [sortFilterList],
  );
  const statusBadgeMapObj = {
    ready: "neutral",
    pending: "warning",
    running: "primary",
    done: "success",
    failed: "danger",
  };
  const statusFormList = statusFilterList.filter((statusFilterObj) => statusFilterObj.value);

  /* 2. 데이터 ======================================================================================================================= */
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const keywordValue = String(searchParams?.get("q") || "").trim();
  const statusCandidate = String(searchParams?.get("status") || "").trim().toLowerCase();
  const statusValue = allowedStatus.has(statusCandidate) ? statusCandidate : "";
  const sortCandidate = String(searchParams?.get("sort") || "").trim().toLowerCase();
  const sortValue = allowedSort.has(sortCandidate) ? sortCandidate : defaultSort;
  const pageCandidate = Number.parseInt(String(searchParams?.get("page") || ""), 10);
  const pageValue = Number.isFinite(pageCandidate) && pageCandidate > 0 ? pageCandidate : 1;
  const { showToast, showConfirm } = useGlobalUi();
  const taskFormSeedObj = {
    title: "",
    status: "ready",
    amount: 0,
    tags: "",
    description: "",
  };
  const ui = EasyObj({
    keyword: keywordValue,
    status: statusValue,
    sort: sortValue,
    page: pageValue,
    isLoading: true,
    isSaving: false,
    isDrawerLoading: false,
    error: null,
    isDrawerOpen: false,
    drawerMode: "create",
    editingId: null,
    form: { ...taskFormSeedObj },
  });
  const taskList = useEasyList([]);
  const taskMetaObj = EasyObj({ totalCount: 0 });
  const taskDetailObj = EasyObj({});
  const taskModelsRef = useRef({ ui, taskList, taskMetaObj });
  const initialLoadQueryRef = useRef(null);
  const taskTotalText = LANG_KO.view.action.totalCountTemplate.replace(
    "{total}",
    taskMetaObj.totalCount.toLocaleString("ko-KR"),
  );
  const pageMode = normalizePageConfig(PAGE_CONFIG).MODE;
  const pageApi = PAGE_CONFIG.API || {};
  const hasListEndpoint = Boolean(pageApi.list);
  const hasDetailEndpoint = Boolean(pageApi.detail);

  const tableColumnList = [
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
        <Badge variant={statusBadgeMapObj[row?.status] || "neutral"} pill>
          {LANG_KO.view.statusLabelMap[row?.status] || row?.status || LANG_KO.view.misc.noData}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: LANG_KO.view.table.amountHeader,
      width: 140,
      align: "right",
      render: (row) => {
        const amount = Number(row?.amount || 0);
        if (Number.isNaN(amount)) return LANG_KO.view.misc.currencyZero;
        return amount.toLocaleString("ko-KR");
      },
    },
    {
      key: "tags",
      header: LANG_KO.view.table.tagsHeader,
      align: "left",
      width: "2fr",
      render: (row) => {
        const tagList = toTagList?.(row?.tags) || [];
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
      render: (row) => {
        if (!row?.createdAt) return LANG_KO.view.misc.dateUnknown;
        const createdAtDate = new Date(row.createdAt);
        if (Number.isNaN(createdAtDate.getTime())) return LANG_KO.view.misc.dateUnknown;
        return createdAtDate.toISOString().slice(0, 10);
      },
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
  const pageCount = Math.max(1, Math.ceil(taskMetaObj.totalCount / pageSize));

  /* 3. UI ========================================================================================================================= */

  // 없음

  /* 4. 팝업 ======================================================================================================================= */

  // 없음

  /* 5. 기타 ======================================================================================================================= */

  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */

  // 없음

  /* 7. 함수 ======================================================================================================================= */

  /**
   * @description tags 입력값을 문자열 배열로 정규화. 입력/출력 계약을 함께 명시
   * 처리 규칙: 배열/JSON 문자열/쉼표 문자열 입력을 모두 `string[]` 포맷으로 통일한다.
   * @updated 2026-02-27
   */
  const toTagList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (typeof value !== "string" || !value.trim()) return [];
    const parsedValue = parseJsonText(value, null);
    if (Array.isArray(parsedValue)) return parsedValue.filter(Boolean).map(String);
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  };

  /**
   * @description 업무 목록 필터 모델을 URL query 문자열로 직렬화
   * 처리 규칙: 기본 sort/page는 query에서 생략해 URL 노이즈를 줄인다.
   * @updated 2026-02-28
   */
  const buildTasksQueryString = useCallback((options = {}) => {
    const {
      keyword = "",
      status = "",
      sort = defaultSort,
      page = 1,
    } = options;
    const taskQueryParams = new URLSearchParams();
    const keywordText = String(keyword || "").trim();
    const statusText = String(status || "").trim().toLowerCase();
    const sortText = String(sort || defaultSort).trim().toLowerCase();
    const pageValue = Number.parseInt(String(page || 1), 10);

    if (keywordText) taskQueryParams.set("q", keywordText);
    if (allowedStatus.has(statusText)) taskQueryParams.set("status", statusText);
    if (allowedSort.has(sortText) && sortText !== defaultSort) {
      taskQueryParams.set("sort", sortText);
    }
    if (Number.isFinite(pageValue) && pageValue > 1) {
      taskQueryParams.set("page", String(pageValue));
    }
    return taskQueryParams.toString();
  }, [allowedSort, allowedStatus, defaultSort]);

  /**
   * @description 현재 필터/페이지 상태를 브라우저 쿼리스트링과 동기화
   * 처리 규칙: pathname이 존재할 때만 queryString을 생성하고 `router.replace(..., { scroll: false })`를 호출한다.
   * @updated 2026-02-27
   */
  const syncBrowserQuery = useCallback(({ nextKeyword, nextStatus, nextSort, nextPage }) => {

    if (!pathname) return;
    const queryString = buildTasksQueryString({
      keyword: nextKeyword,
      status: nextStatus,
      sort: nextSort,
      page: nextPage,
    });
    const href = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(href, { scroll: false });
  }, [buildTasksQueryString, pathname, router]);

  /**
   * @description 업무 목록 엔드포인트를 호출해 taskList/taskMetaObj와 화면 상태를 동기화
   * 실패 동작: 엔드포인트 누락/요청 실패 시 ui.error를 설정하고 목록/totalCount를 안전값으로 초기화한다.
   * 부작용: ui.isLoading/ui.page/ui.sort 상태와 브라우저 query를 갱신할 수 있다.
   * @updated 2026-02-27
   */
  const loadTasks = useCallback(async (options = {}) => {

    const {
      ui: currentUi,
      taskList: currentTaskList,
      taskMetaObj: currentTaskMetaObj,
    } = taskModelsRef.current;
    const {
      nextKeyword = currentUi.keyword,
      nextStatus = currentUi.status,
      nextSort = currentUi.sort,
      nextPage = currentUi.page,
      syncQuery = true,
    } = options;
    if (!hasListEndpoint) {
      currentUi.error = { message: LANG_KO.view.error.listEndpointMissing };
      currentTaskList.copy([]);
      currentTaskMetaObj.totalCount = 0;
      currentUi.isLoading = false;
      return;
    }
    const taskQueryParams = new URLSearchParams();
    taskQueryParams.set("page", String(nextPage));
    taskQueryParams.set("size", String(pageSize));
    taskQueryParams.set("sort", nextSort || defaultSort);
    if (nextKeyword?.trim()) taskQueryParams.set("q", nextKeyword.trim());
    if (nextStatus) taskQueryParams.set("status", nextStatus);
    const queryString = taskQueryParams.toString();
    const listPath = typeof pageApi.list === "string" ? pageApi.list : String(pageApi.list?.path || "");
    const requestPath = queryString ? `${listPath}?${queryString}` : listPath;
    const requestSpec = typeof pageApi.list === "string" || !pageApi.list || typeof pageApi.list !== "object"
      ? requestPath
      : { ...pageApi.list, path: requestPath };

    currentUi.isLoading = true;
    currentUi.error = null;
    try {
      const taskListResponse = await apiJSON(requestSpec);
      currentTaskList.copy(taskListResponse?.result?.dataTemplateList || []);
      const totalSource = taskListResponse?.count ?? taskListResponse?.result?.listMetaObj?.totalCount ?? currentTaskList.size();
      const total = Number(totalSource || 0);
      currentTaskMetaObj.totalCount = total;
      currentUi.page = nextPage;
      currentUi.sort = nextSort || defaultSort;
      if (syncQuery) {
        syncBrowserQuery({
          nextKeyword,
          nextStatus,
          nextSort: nextSort || defaultSort,
          nextPage,
        });
      }
    } catch (err) {
      currentTaskList.copy([]);
      currentTaskMetaObj.totalCount = 0;
      currentUi.error = {
        message: LANG_KO.view.error.listLoadFailed,
        code: err?.code,
        requestId: err?.requestId,
      };
    } finally {
      currentUi.isLoading = false;
    }
  }, [hasListEndpoint, pageApi.list, syncBrowserQuery]);

  /**
   * @description 신규 생성 모드 드로어 열기
   * 처리 규칙: drawerMode/editingId/form/isDrawerLoading을 생성 상태로 초기화한다.
   * @updated 2026-02-27
   */
  const openCreateDrawer = () => {
    ui.drawerMode = "create";
    ui.editingId = null;
    ui.form = { ...taskFormSeedObj };
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
      const detailTemplatePath = typeof pageApi.detail === "string"
        ? pageApi.detail
        : String(pageApi.detail?.path || "");
      const detailPath = String(detailTemplatePath || "").replace(":id", String(id));
      const requestSpec = typeof pageApi.detail === "string" || !pageApi.detail || typeof pageApi.detail !== "object"
        ? detailPath
        : { ...pageApi.detail, path: detailPath };
      const taskDetailResponse = await apiJSON(requestSpec);
      taskDetailObj.copy(taskDetailResponse?.result ?? {});
      ui.form = {
        title: taskDetailObj.title || "",
        status: taskDetailObj.status || LANG_KO.view.misc.defaultStatusCode,
        amount: Number(taskDetailObj.amount || 0),
        tags: toTagList(taskDetailObj.tags).join(", "),
        description: taskDetailObj.description || "",
      };
    } catch (err) {
      showToast(LANG_KO.view.error.detailLoadFailed, { type: "error" });
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
    const isCreateApiMissing = ui.drawerMode === "create" && !hasListEndpoint;
    if (isCreateApiMissing) {
      showToast(LANG_KO.view.error.createEndpointMissing, { type: "error" });
      return;
    }
    const isMissingEditTarget = !ui.editingId || !hasDetailEndpoint;
    const isEditApiMissing = ui.drawerMode === "edit" && isMissingEditTarget;
    if (isEditApiMissing) {
      showToast(LANG_KO.view.error.updateEndpointMissing, { type: "error" });
      return;
    }

    const taskPayloadObj = {
      title,
      status: ui.form.status,
      amount: Number(ui.form.amount || 0),
      tags: toTagList(ui.form.tags),
      description: String(ui.form.description || "").trim(),
    };
    const isCreate = ui.drawerMode === "create";
    let requestSpec = pageApi.list;
    if (!isCreate) {
      const detailTemplatePath = typeof pageApi.detail === "string"
        ? pageApi.detail
        : String(pageApi.detail?.path || "");
      const detailPath = String(detailTemplatePath || "").replace(":id", String(ui.editingId));
      requestSpec = typeof pageApi.detail === "string" || !pageApi.detail || typeof pageApi.detail !== "object"
        ? detailPath
        : { ...pageApi.detail, path: detailPath };
    }
    const submitMethod = isCreate ? "POST" : "PUT";

    ui.isSaving = true;
    try {
      await apiJSON(requestSpec, { method: submitMethod, body: taskPayloadObj });
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
      showToast(LANG_KO.view.error.saveFailed, { type: "error" });
      ui.error = {
        message: LANG_KO.view.error.saveFailed,
        code: err?.code,
        requestId: err?.requestId,
      };
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
    if (!hasDetailEndpoint) {
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
      const detailTemplatePath = typeof pageApi.detail === "string"
        ? pageApi.detail
        : String(pageApi.detail?.path || "");
      const detailPath = String(detailTemplatePath || "").replace(":id", String(row?.id));
      const requestSpec = typeof pageApi.detail === "string" || !pageApi.detail || typeof pageApi.detail !== "object"
        ? detailPath
        : { ...pageApi.detail, path: detailPath };
      await apiJSON(requestSpec, { method: "DELETE" });
      showToast(LANG_KO.view.toast.removed, { type: "success" });
      const nextPage = ui.page > 1 && taskList.length === 1 ? ui.page - 1 : ui.page;
      await loadTasks({
        nextKeyword: ui.keyword,
        nextStatus: ui.status,
        nextSort: ui.sort,
        nextPage,
      });
    } catch (err) {
      showToast(LANG_KO.view.error.removeFailed, { type: "error" });
      ui.error = {
        message: LANG_KO.view.error.removeFailed,
        code: err?.code,
        requestId: err?.requestId,
      };
    }
  };

  /* 8. useEffect ================================================================================================================== */
  /**
   * @description 초기 필터 기준으로 목록 API를 호출해 테이블 데이터를 동기화
   * 처리 규칙: 첫 마운트에서는 브라우저 query 재기록 없이 초기 데이터만 조회한다.
   */
  useEffect(() => {
    const initialQueryKey = buildTasksQueryString({
      keyword: keywordValue,
      status: statusValue,
      sort: sortValue,
      page: pageValue,
    });
    if (initialLoadQueryRef.current === initialQueryKey) return;
    initialLoadQueryRef.current = initialQueryKey;
    const currentUi = taskModelsRef.current.ui;
    currentUi.keyword = keywordValue;
    currentUi.status = statusValue;
    currentUi.sort = sortValue;
    currentUi.page = pageValue;
    loadTasks({
      nextKeyword: keywordValue,
      nextStatus: statusValue,
      nextSort: sortValue,
      nextPage: pageValue,
      syncQuery: false,
    });
  }, [buildTasksQueryString, keywordValue, loadTasks, pageValue, sortValue, statusValue]);

  /* 9. 내부 컴포넌트 ============================================================================================================== */

  // 없음

  /* 10. 렌더링 ==================================================================================================================== */
  return (
    <div className="space-y-3" data-page-mode={pageMode}>
      {ui.error?.message && (
        <section aria-label={LANG_KO.view.error.listLoadFailed}>
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <div>{ui.error.message}</div>
            {ui.error.requestId && (
              <div className="mt-1 text-xs text-red-700/80">
                {LANG_KO.view.error.requestIdLabel}: {ui.error.requestId}
              </div>
            )}
            {ui.error.code && (
              <div className="mt-1 text-xs text-red-700/80">
                {LANG_KO.view.error.codeLabel}: {ui.error.code}
              </div>
            )}
          </div>
        </section>
      )}

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
              dataObj={ui}
              dataKey="keyword"
              placeholder={LANG_KO.view.search.keywordPlaceholder}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              dataObj={ui}
              dataKey="status"
              dataList={statusFilterList}
            />
          </div>
          <div className="w-full md:w-52">
            <Select
              dataObj={ui}
              dataKey="sort"
              dataList={sortFilterList}
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
              ui.sort = defaultSort;
              loadTasks({
                nextKeyword: "",
                nextStatus: "",
                nextSort: defaultSort,
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
          dataList={taskList}
          loading={ui.isLoading}
          columns={tableColumnList}
          pageSize={pageSize}
          empty={LANG_KO.view.table.emptyFallback}
          rowKey={(row, index) => row?.id ?? index}
        />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">
            {taskTotalText}
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

      <Drawer isOpen={ui.isDrawerOpen} onClose={closeDrawer} side="right" size="min-[1468px]:w-[460px]" collapseButton>
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {ui.drawerMode === "create" && LANG_KO.view.drawer.createTitle}
              {ui.drawerMode !== "create" && LANG_KO.view.drawer.editTitle}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {ui.drawerMode === "create" && LANG_KO.view.drawer.createSubtitle}
              {ui.drawerMode !== "create" && `${LANG_KO.view.drawer.editSubtitlePrefix}${ui.editingId || LANG_KO.view.misc.dateUnknown}`}
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
                  dataObj={ui}
                  dataKey="form.title"
                  placeholder={LANG_KO.view.drawer.titlePlaceholder}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.statusLabel}</span>
                <Select
                  dataObj={ui}
                  dataKey="form.status"
                  dataList={statusFormList}
            />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.amountLabel}</span>
                <NumberInput
                  dataObj={ui}
                  dataKey="form.amount"
                  min={0}
                  step={1000}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.tagsLabel}</span>
                <Input
                  dataObj={ui}
                  dataKey="form.tags"
                  placeholder={LANG_KO.view.drawer.tagsPlaceholder}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.descriptionLabel}</span>
                <Textarea
                  rows={5}
                  dataObj={ui}
                  dataKey="form.description"
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
