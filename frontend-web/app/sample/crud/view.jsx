"use client";
/**
 * 파일명: sample/crud/view.jsx
 * 작성자: Codex
 * 갱신일: 2026-03-06
 * 설명: 공개 CRUD 샘플 페이지 뷰(DB CRUD 연동)
 */

import { useEffect, useMemo } from "react";
import { useGlobalUi } from "@/app/common/store/SharedStore";
import Badge from "@/app/lib/component/Badge";
import Button from "@/app/lib/component/Button";
import Card from "@/app/lib/component/Card";
import Checkbox from "@/app/lib/component/Checkbox";
import DateInput from "@/app/lib/component/DateInput";
import Drawer from "@/app/lib/component/Drawer";
import EasyTable from "@/app/lib/component/EasyTable";
import Input from "@/app/lib/component/Input";
import NumberInput from "@/app/lib/component/NumberInput";
import Select from "@/app/lib/component/Select";
import Textarea from "@/app/lib/component/Textarea";
import EasyObj from "@/app/lib/dataset/EasyObj";
import { useEasyList } from "@/app/lib/dataset/EasyList";
import { PAGE_CONFIG } from "./initData";
import { usePageData } from "@/app/lib/hooks/usePageData";
import { apiJSON } from "@/app/lib/runtime/api";
import syncApiResult from "@/app/lib/runtime/apiResult";
import LANG_KO from "./lang.ko";

const SAMPLE_TASK_LIST_API_PATH = "/api/v1/sample/tasks";
const STATUS_FILTER_LIST = LANG_KO.initData.statusFilterList.map((item) => ({ ...item }));

/**
 * @description 공개 CRUD 샘플 화면을 렌더링. 입력/출력 계약을 함께 명시
 * 처리 규칙: 목록 검색/등록/수정/삭제는 전부 sample 공개 API를 통해 DB 상태를 반영한다.
 * @param {{ initialDataObj?: Object, initialErrorObj?: Object }} props
 */
const CrudDemoView = ({ initialDataObj, initialErrorObj }) => {
  /* 1. 상수 ======================================================================================================================= */
  const defaultForm = {
    title: "",
    status: LANG_KO.view.misc.defaultStatusCode,
    owner: "",
    amount: 0,
    description: "",
    attachmentName: "",
  };

  /* 2. 데이터 ======================================================================================================================= */
  const { showToast, showConfirm } = useGlobalUi();
  const { mode: pageMode, dataObj, isLoading: pageLoading } = usePageData({
    pageConfig: PAGE_CONFIG,
    initialDataObj,
    initialErrorObj,
  });
  const ui = EasyObj({
    isLoading: false,
    isSaving: false,
    keyword: "",
    status: "",
    fromDate: "",
    toDate: "",
    appliedFilter: {
      keyword: "",
      status: "",
      fromDate: "",
      toDate: "",
    },
    selectedIdList: [],
    drawerState: {
      isOpen: false,
      mode: "create",
      editingId: null,
    },
    form: { ...defaultForm },
    formError: "",
  });
  const taskList = useEasyList(dataObj?.list?.result || []);
  const taskMetaObj = EasyObj({
    totalCount: Number(dataObj?.list?.count || 0),
  });
  const selectedIdSet = useMemo(() => new Set(ui.selectedIdList), [ui.selectedIdList]);
  let allRowSelected = false;
  if (taskList.length > 0) {
    allRowSelected = taskList.every((rowItem) => selectedIdSet.has(rowItem.id));
  }

  /* 3. UI ========================================================================================================================= */
  const tableColumns = [
    {
      key: "selected",
      header: (
        <div className="flex items-center justify-center">
          {/* rule-gate: allow-controlled-binding - 목록 전체 선택은 selectedIdList 집합 계산이 필요해 checked/onChange 제어 유지 */}
          <Checkbox
            checked={allRowSelected}
            onChange={(event) => {
              const checked = Boolean(event?.target?.checked);
              ui.selectedIdList = checked ? taskList.map((rowItem) => rowItem.id) : [];
            }}
            aria-label={LANG_KO.view.table.selectAllAriaLabel}
          />
        </div>
      ),
      width: 70,
      render: (rowItem) => (
        <div className="flex items-center justify-center">
          {/* rule-gate: allow-controlled-binding - 행 선택 여부를 selectedIdList 포함/제거로 직접 제어 */}
          <Checkbox
            checked={selectedIdSet.has(rowItem.id)}
            onChange={(event) => {
              const checked = Boolean(event?.target?.checked);
              if (checked) {
                ui.selectedIdList = Array.from(new Set([...ui.selectedIdList, rowItem.id]));
                return;
              }
              ui.selectedIdList = ui.selectedIdList.filter((selectedId) => selectedId !== rowItem.id);
            }}
            aria-label={`${LANG_KO.view.table.rowSelectAriaLabelPrefix} ${rowItem.id}`}
          />
        </div>
      ),
    },
    {
      key: "id",
      header: LANG_KO.view.table.idHeader,
      width: 80,
    },
    {
      key: "title",
      header: LANG_KO.view.table.titleHeader,
      align: "left",
      width: "2fr",
    },
    {
      key: "status",
      header: LANG_KO.view.table.statusHeader,
      width: 120,
      render: (rowItem) => (
        <Badge variant={LANG_KO.view.statusBadgeVariantMap[rowItem?.status] || "neutral"} pill>
          {LANG_KO.view.statusLabelMap[rowItem?.status] || rowItem?.status}
        </Badge>
      ),
    },
    {
      key: "owner",
      header: LANG_KO.view.table.ownerHeader,
      width: 120,
    },
    {
      key: "amount",
      header: LANG_KO.view.table.amountHeader,
      width: 140,
      render: (rowItem) => Number(rowItem?.amount || 0).toLocaleString("ko-KR"),
    },
    {
      key: "createdAt",
      header: LANG_KO.view.table.createdAtHeader,
      width: 120,
    },
    {
      key: "actions",
      header: LANG_KO.view.table.actionsHeader,
      width: 180,
      render: (rowItem) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openEditDrawer(rowItem)}
          >
            {LANG_KO.view.action.edit}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => removeSingleRow(rowItem)}
          >
            {LANG_KO.view.action.remove}
          </Button>
        </div>
      ),
    },
  ];

  /* 4. 팝업 ======================================================================================================================= */
  // 없음

  /* 5. 기타 ======================================================================================================================= */
  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */
  // 없음

  /* 7. 함수 ======================================================================================================================= */

  /**
   * @description 현재 필터 상태를 query string으로 직렬화
   * 처리 규칙: 빈 필드는 생략하고 DB 목록 API는 항상 page=1,size=50으로 고정 조회한다.
   * @param {{ keyword?: string, status?: string, fromDate?: string, toDate?: string }} filterValue
   * @returns {string}
   */
  const buildListPath = (filterValue = {}) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("size", "50");
    const keyword = String(filterValue?.keyword || "").trim();
    const status = String(filterValue?.status || "").trim();
    const fromDate = String(filterValue?.fromDate || "").trim();
    const toDate = String(filterValue?.toDate || "").trim();
    if (keyword) params.set("q", keyword);
    if (status) params.set("status", status);
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    return `${SAMPLE_TASK_LIST_API_PATH}?${params.toString()}`;
  };

  /**
   * @description 현재 필터 기준으로 DB 목록을 재조회
   * 처리 규칙: 성공 시 rowList/totalCount/selectedIdList를 최신 DB 결과로 덮어쓴다.
   * @param {{ keyword?: string, status?: string, fromDate?: string, toDate?: string }} filterValue
   * @returns {Promise<void>}
   */
  const loadTaskList = async (filterValue = ui.appliedFilter) => {
    ui.isLoading = true;
    try {
      const payload = await apiJSON(
        buildListPath(filterValue),
        { method: "GET" },
        { authless: true },
      );
      syncApiResult({
        payload,
        apiList: taskList,
      });
      taskMetaObj.totalCount = Number(payload?.count || 0);
      ui.selectedIdList = [];
    } catch (err) {
      showToast(err?.message || LANG_KO.view.error.listLoadFailed, { type: "error" });
    } finally {
      ui.isLoading = false;
    }
  };

  /**
   * @description 생성 모드 드로어를 열고 폼 상태를 초기화
   * 부작용: drawer/form/formError 상태를 신규 등록용으로 덮어쓴다.
   */
  const openCreateDrawer = () => {
    ui.drawerState = {
      isOpen: true,
      mode: "create",
      editingId: null,
    };
    ui.form = { ...defaultForm };
    ui.formError = "";
  };

  /**
   * @description 수정 모드 드로어를 열고 행 데이터를 폼에 채운다.
   * 부작용: drawer/form/formError 상태가 선택한 행 기준으로 갱신된다.
   * @param {Object} rowItem
   */
  const openEditDrawer = (rowItem) => {
    ui.drawerState = {
      isOpen: true,
      mode: "edit",
      editingId: rowItem?.id || null,
    };
    ui.form = {
      title: rowItem?.title || "",
      status: rowItem?.status || LANG_KO.view.misc.defaultStatusCode,
      owner: rowItem?.owner || "",
      amount: Number(rowItem?.amount || 0),
      description: rowItem?.description || "",
      attachmentName: rowItem?.attachmentName || "",
    };
    ui.formError = "";
  };

  /**
   * @description 드로어를 닫고 오류 상태를 지운다.
   * 부작용: drawer/formError 상태를 초기화한다.
   */
  const closeDrawer = () => {
    ui.drawerState = {
      isOpen: false,
      mode: "create",
      editingId: null,
    };
    ui.formError = "";
  };

  /**
   * @description 검색 입력의 날짜 범위를 검증하고 DB 조회를 실행
   * 실패 동작: 기간 역전이면 토스트만 노출하고 조회를 실행하지 않는다.
   */
  const validateAndSearch = async () => {
    if (ui.fromDate && ui.toDate && ui.fromDate > ui.toDate) {
      showToast(LANG_KO.view.validation.dateRangeInvalid, { type: "error" });
      return;
    }
    const nextFilter = {
      keyword: ui.keyword,
      status: ui.status,
      fromDate: ui.fromDate,
      toDate: ui.toDate,
    };
    ui.appliedFilter = { ...nextFilter };
    await loadTaskList(nextFilter);
  };

  /**
   * @description 검색 입력과 적용 필터를 초기화한 뒤 기본 목록을 재조회
   * 부작용: 검색 관련 필드와 선택 상태를 모두 기본값으로 덮어쓴다.
   */
  const resetFilter = async () => {
    ui.keyword = "";
    ui.status = "";
    ui.fromDate = "";
    ui.toDate = "";
    ui.appliedFilter = {
      keyword: "",
      status: "",
      fromDate: "",
      toDate: "",
    };
    await loadTaskList(ui.appliedFilter);
  };

  /**
   * @description 드로어 폼을 DB에 저장하고 목록을 재조회
   * 실패 동작: 제목 누락 또는 API 실패 시 formError/토스트를 갱신한다.
   */
  const saveDrawer = async () => {
    const title = String(ui.form.title || "").trim();
    if (!title) {
      ui.formError = LANG_KO.view.validation.titleRequired;
      showToast(LANG_KO.view.validation.titleRequiredToast, { type: "warning" });
      return;
    }
    ui.isSaving = true;
    ui.formError = "";
    try {
      const body = {
        title,
        status: ui.form.status || LANG_KO.view.misc.defaultStatusCode,
        owner: String(ui.form.owner || "").trim() || LANG_KO.view.validation.ownerFallback,
        amount: Number(ui.form.amount || 0),
        description: String(ui.form.description || "").trim(),
        attachmentName: String(ui.form.attachmentName || "").trim(),
      };
      const isCreate = ui.drawerState.mode === "create";
      const requestPath = isCreate
        ? SAMPLE_TASK_LIST_API_PATH
        : `${SAMPLE_TASK_LIST_API_PATH}/${ui.drawerState.editingId}`;
      await apiJSON(
        requestPath,
        {
          method: isCreate ? "POST" : "PUT",
          body,
        },
        { authless: true },
      );
      showToast(
        isCreate ? LANG_KO.view.toast.createdRow : LANG_KO.view.toast.updatedRow,
        { type: "success" },
      );
      closeDrawer();
      await loadTaskList(ui.appliedFilter);
    } catch (err) {
      ui.formError = err?.message || LANG_KO.view.error.saveFailed;
      showToast(ui.formError, { type: "error" });
    } finally {
      ui.isSaving = false;
    }
  };

  /**
   * @description 단건 삭제 확인 후 DB에서 행을 삭제하고 목록을 재조회
   * @param {Object} rowItem
   */
  const removeSingleRow = async (rowItem) => {
    const confirmed = await showConfirm(LANG_KO.view.confirm.removeOne, {
      title: LANG_KO.view.confirm.removeOneTitle,
      type: "warning",
      confirmText: LANG_KO.view.confirm.confirmText,
      cancelText: LANG_KO.view.confirm.cancelText,
    });
    if (!confirmed) return;
    ui.isLoading = true;
    try {
      await apiJSON(
        `${SAMPLE_TASK_LIST_API_PATH}/${rowItem?.id}`,
        { method: "DELETE" },
        { authless: true },
      );
      showToast(LANG_KO.view.toast.removedRow, { type: "success" });
      await loadTaskList(ui.appliedFilter);
    } catch (err) {
      showToast(err?.message || LANG_KO.view.error.removeFailed, { type: "error" });
    } finally {
      ui.isLoading = false;
    }
  };

  /**
   * @description 선택된 행들을 DB에서 일괄 삭제하고 목록을 재조회
   * 실패 동작: 선택이 없으면 안내 토스트만 표시한다.
   */
  const removeSelectedRows = async () => {
    if (ui.selectedIdList.length === 0) {
      showToast(LANG_KO.view.validation.noSelection, { type: "info" });
      return;
    }
    const confirmed = await showConfirm(
      `선택된 ${ui.selectedIdList.length}${LANG_KO.view.confirm.removeManyTextSuffix}`,
      {
        title: LANG_KO.view.confirm.removeManyTitle,
        type: "warning",
        confirmText: LANG_KO.view.confirm.confirmText,
        cancelText: LANG_KO.view.confirm.cancelText,
      },
    );
    if (!confirmed) return;
    ui.isLoading = true;
    try {
      await Promise.all(
        ui.selectedIdList.map((rowId) => apiJSON(
          `${SAMPLE_TASK_LIST_API_PATH}/${rowId}`,
          { method: "DELETE" },
          { authless: true },
        )),
      );
      showToast(LANG_KO.view.toast.removedSelectedRows, { type: "success" });
      await loadTaskList(ui.appliedFilter);
    } catch (err) {
      showToast(err?.message || LANG_KO.view.error.removeManyFailed, { type: "error" });
    } finally {
      ui.isLoading = false;
    }
  };

  /* 8. useEffect ================================================================================================================== */
  /**
   * @description SSR 초기 적재 스냅샷이 바뀌면 목록/건수를 EasyList/EasyObj에 반영한다.
   * 처리 규칙: dataObj.list 스냅샷을 그대로 copy하고 count만 별도 숫자 필드로 동기화한다.
   */
  useEffect(() => {
    taskList.copy(dataObj?.list?.result || []);
    taskMetaObj.totalCount = Number(dataObj?.list?.count || 0);
  }, [dataObj?.list?.result, dataObj?.list?.count, taskList, taskMetaObj]);

  /* 9. 내부 컴포넌트 ============================================================================================================== */
  // 없음

  /* 10. 렌더링 ==================================================================================================================== */
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8" data-page-mode={pageMode}>
      <section className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{LANG_KO.view.section.title}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {LANG_KO.view.section.subtitle}
        </p>
      </section>

      <Card
        title={`${LANG_KO.view.card.filterTitle} · ${Number(taskMetaObj.totalCount || 0).toLocaleString("ko-KR")}${LANG_KO.view.card.countSuffix}`}
        actions={(
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button
              variant="secondary"
              onClick={removeSelectedRows}
              className="w-full sm:w-auto"
            >
              {LANG_KO.view.action.removeSelected}
            </Button>
            <Button
              variant="primary"
              onClick={openCreateDrawer}
              className="w-full sm:w-auto"
            >
              {LANG_KO.view.action.openCreate}
            </Button>
          </div>
        )}
      >
        <div className="grid gap-2 md:grid-cols-[1fr_180px_160px_160px_auto_auto]">
          <div>
            <Input
              dataObj={ui}
              dataKey="keyword"
              placeholder={LANG_KO.view.input.searchPlaceholder}
            />
          </div>
          <div>
            <Select
              dataObj={ui}
              dataKey="status"
              dataList={STATUS_FILTER_LIST}
            />
          </div>
          <DateInput
            dataObj={ui}
            dataKey="fromDate"
            placeholder={LANG_KO.view.input.fromDatePlaceholder}
          />
          <DateInput
            dataObj={ui}
            dataKey="toDate"
            placeholder={LANG_KO.view.input.toDatePlaceholder}
          />
          <Button
            variant="primary"
            onClick={validateAndSearch}
            className="w-full sm:w-auto"
          >
            {LANG_KO.view.action.search}
          </Button>
          <Button
            variant="secondary"
            onClick={resetFilter}
            className="w-full sm:w-auto"
          >
            {LANG_KO.view.action.reset}
          </Button>
        </div>
      </Card>

      <Card title={LANG_KO.view.card.tableTitle} className="mt-4">
        <EasyTable
          loading={Boolean(pageLoading || ui.isLoading)}
          data={taskList}
          columns={tableColumns}
          pageSize={5}
          empty={LANG_KO.view.table.empty}
          rowKey={(rowItem, rowIndex) => rowItem?.id ?? rowIndex}
        />
      </Card>

      <Drawer
        isOpen={ui.drawerState.isOpen}
        onClose={closeDrawer}
        side="right"
        size={520}
        collapseButton
      >
        <div className="space-y-4 p-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {ui.drawerState.mode === "create" ? LANG_KO.view.drawer.createTitle : LANG_KO.view.drawer.editTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {ui.drawerState.mode === "create"
                ? LANG_KO.view.drawer.createDescription
                : `${LANG_KO.view.drawer.editDescriptionPrefix}${ui.drawerState.editingId || "-"}`}
            </p>
          </div>

          {ui.formError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {ui.formError}
            </div>
          ) : null}

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.statusLabel}</span>
            <Select
              dataObj={ui}
              dataKey="form.status"
              dataList={STATUS_FILTER_LIST.filter((item) => item.value)}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.titleLabel}</span>
            <Input
              dataObj={ui}
              dataKey="form.title"
              placeholder={LANG_KO.view.input.titlePlaceholder}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.ownerLabel}</span>
            <Input
              dataObj={ui}
              dataKey="form.owner"
              placeholder={LANG_KO.view.input.ownerPlaceholder}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.amountLabel}</span>
            <NumberInput dataObj={ui} dataKey="form.amount" />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.descriptionLabel}</span>
            <Textarea
              dataObj={ui}
              dataKey="form.description"
              placeholder={LANG_KO.view.input.descriptionPlaceholder}
              rows={5}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.attachmentLabel}</span>
            {/* raw file input 예외 사유: 공용 lib/component에 파일 선택 전용 컴포넌트가 없어 브라우저 기본 picker 사용 */}
            <input
              type="file"
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              onChange={(event) => {
                const nextFile = event?.target?.files?.[0];
                ui.form.attachmentName = nextFile?.name || "";
              }}
            />
            {ui.form.attachmentName ? (
              <p className="text-xs text-gray-500">{ui.form.attachmentName}</p>
            ) : null}
          </label>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="secondary" onClick={closeDrawer} className="w-full sm:w-auto">
              {LANG_KO.view.action.cancel}
            </Button>
            <Button
              onClick={saveDrawer}
              className="w-full sm:w-auto"
              disabled={Boolean(ui.isSaving)}
            >
              {LANG_KO.view.action.save}
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default CrudDemoView;
