"use client";
/**
 * 파일명: sample/crud/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 CRUD 샘플 페이지 뷰(더미 데이터 기반, Drawer CRUD)
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
import { STATUS_FILTER_LIST } from "./initData";
import { useDemoSharedState } from "@/app/sample/demoSharedState";
import EasyObj from "@/app/lib/dataset/EasyObj";
import LANG_KO from "./lang.ko";

/**
 * @description 공개 CRUD 샘플 화면을 렌더링. 입력/출력 계약을 함께 명시
 * 처리 규칙: 필터/선택/드로어 상태는 EasyObj(ui)로 유지하고 목록 데이터는 shared state로 동기화한다.
 * @param {{ mode: Object, initRows: Array }} props
 */
const CrudDemoView = ({ initRows = [] }) => {
  const defaultForm = {
    title: "",
    status: LANG_KO.view.misc.defaultStatusCode,
    owner: "",
    amount: 0,
    description: "",
    attachmentName: "",
  };

  const ui = EasyObj({
    isLoading: true,
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
  const { value: rowList, setValue: setRowList } = useDemoSharedState({
    stateKey: "demoCrudRows",
    initialValue: initRows,
  });
  const { showToast, showConfirm } = useGlobalUi();

  useEffect(() => {
    const timer = setTimeout(() => {
      ui.isLoading = false;
    }, 180);
    return () => clearTimeout(timer);
  }, [ui]);

  const filteredRows = useMemo(() => {
    const normalizedKeyword = ui.appliedFilter.keyword.trim().toLowerCase();
    return rowList.filter((rowItem) => {
      if (ui.appliedFilter.status && rowItem.status !== ui.appliedFilter.status) {
        return false;
      }
      if (ui.appliedFilter.fromDate && rowItem.createdAt < ui.appliedFilter.fromDate) {
        return false;
      }
      if (ui.appliedFilter.toDate && rowItem.createdAt > ui.appliedFilter.toDate) {
        return false;
      }
      if (!normalizedKeyword) return true;
      const targetText = `${rowItem.title} ${rowItem.owner} ${rowItem.description || ""}`.toLowerCase();
      return targetText.includes(normalizedKeyword);
    });
  }, [rowList, ui.appliedFilter]);

  const selectedIdSet = useMemo(() => new Set(ui.selectedIdList), [ui.selectedIdList]);
  const allRowSelected =
    filteredRows.length > 0 &&
    filteredRows.every((rowItem) => selectedIdSet.has(rowItem.id));

  const tableColumns = [
    {
      key: "selected",
      header: (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={allRowSelected}
            onChange={(event) => {
              const checked = Boolean(event?.target?.checked);
              if (!checked) {
                ui.selectedIdList = [];
                return;
              }
              ui.selectedIdList = filteredRows.map((rowItem) => rowItem.id);
            }}
            aria-label={LANG_KO.view.table.selectAllAriaLabel}
          />
        </div>
      ),
      width: 70,
      render: (rowItem) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={selectedIdSet.has(rowItem.id)}
            onChange={(event) => {
              const checked = Boolean(event?.target?.checked);
              if (checked) {
                ui.selectedIdList = Array.from(new Set([...ui.selectedIdList, rowItem.id]));
                return;
              }
              ui.selectedIdList = ui.selectedIdList.filter(
                (previousId) => previousId !== rowItem.id,
              );
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
        <Badge
          variant={LANG_KO.view.statusBadgeVariantMap[rowItem?.status] || "neutral"}
          pill
        >
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
      render: (rowItem) =>
        Number(rowItem?.amount || 0).toLocaleString("ko-KR"),
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
            onClick={() => {
              ui.drawerState = {
                isOpen: true,
                mode: "edit",
                editingId: rowItem.id,
              };
              ui.form = {
                title: rowItem.title || "",
                status: rowItem.status || LANG_KO.view.misc.defaultStatusCode,
                owner: rowItem.owner || "",
                amount: Number(rowItem.amount || 0),
                description: rowItem.description || "",
                attachmentName: rowItem.attachmentName || "",
              };
              ui.formError = "";
            }}
          >
            {LANG_KO.view.action.edit}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={async () => {
              const confirmed = await showConfirm(
                LANG_KO.view.confirm.removeOne,
                {
                  title: LANG_KO.view.confirm.removeOneTitle,
                  type: "warning",
                  confirmText: LANG_KO.view.confirm.confirmText,
                  cancelText: LANG_KO.view.confirm.cancelText,
                },
              );
              if (!confirmed) return;
              setRowList((prevRows) =>
                prevRows.filter((prevRow) => prevRow.id !== rowItem.id),
              );
              ui.selectedIdList = ui.selectedIdList.filter(
                (selectedId) => selectedId !== rowItem.id,
              );
              showToast(LANG_KO.view.toast.removedRow, { type: "success" });
            }}
          >
            {LANG_KO.view.action.remove}
          </Button>
        </div>
      ),
    },
  ];

  /**
   * @description 현재 날짜 YYYY-MM-DD 문자열 생성
   * 반환값: 신규 행 createdAt 필드에 저장할 날짜 텍스트.
   * @updated 2026-02-27
   */
  const toTodayText = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  /**
   * @description 생성 모드로 드로어를 열고 폼/오류 상태를 초기화
   * 부작용: ui.drawerState, ui.form, ui.formError 값을 덮어쓴다.
   * @updated 2026-02-27
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
   * @description 드로어를 닫고 에러 문구를 정리
   * 부작용: ui.drawerState.isOpen=false 및 ui.formError 초기화가 반영된다.
   * @updated 2026-02-27
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
   * @description 검색 조건의 날짜 범위를 검증한 뒤 적용 필터를 확정
   * 실패 동작: fromDate > toDate인 경우 토스트만 표시하고 appliedFilter를 바꾸지 않는다.
   * @updated 2026-02-27
   */
  const validateAndSearch = () => {
    if (ui.fromDate && ui.toDate && ui.fromDate > ui.toDate) {
      showToast(LANG_KO.view.validation.dateRangeInvalid, { type: "error" });
      return;
    }
    ui.appliedFilter = {
      keyword: ui.keyword,
      status: ui.status,
      fromDate: ui.fromDate,
      toDate: ui.toDate,
    };
  };

  /**
   * @description 검색 입력값과 적용 필터, 선택 체크 상태를 모두 초기화
   * 부작용: ui.keyword/ui.status/ui.fromDate/ui.toDate/ui.appliedFilter/ui.selectedIdList가 리셋된다.
   * @updated 2026-02-27
   */
  const resetFilter = () => {
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
    ui.selectedIdList = [];
  };

  /**
   * @description 드로어 폼을 검증한 뒤 생성/수정 모드에 맞춰 목록 데이터를 저장
   * 실패 동작: 제목이 비어 있으면 저장을 중단하고 경고 토스트와 formError를 노출한다.
   * @updated 2026-02-27
   */
  const saveDrawer = () => {
    const title = String(ui.form.title || "").trim();
    if (!title) {
      ui.formError = LANG_KO.view.validation.titleRequired;
      showToast(LANG_KO.view.validation.titleRequiredToast, { type: "warning" });
      return;
    }
    const owner = String(ui.form.owner || "").trim();
    const nextRow = {
      title,
      status: ui.form.status || LANG_KO.view.misc.defaultStatusCode,
      owner: owner || LANG_KO.view.validation.ownerFallback,
      amount: Number(ui.form.amount || 0),
      description: String(ui.form.description || "").trim(),
      attachmentName: String(ui.form.attachmentName || ""),
    };
    if (ui.drawerState.mode === "create") {
      const nextId = Math.max(0, ...rowList.map((rowItem) => Number(rowItem.id || 0))) + 1;
      setRowList((prevRows) => [
        {
          id: nextId,
          ...nextRow,
          createdAt: toTodayText(),
        },
        ...prevRows,
      ]);
      showToast(LANG_KO.view.toast.createdRow, { type: "success" });
    } else {
      const editingId = ui.drawerState.editingId;
      setRowList((prevRows) =>
        prevRows.map((prevRow) =>
          prevRow.id === editingId
            ? {
                ...prevRow,
                ...nextRow,
              }
            : prevRow,
        ),
      );
      showToast(LANG_KO.view.toast.updatedRow, { type: "success" });
    }
    closeDrawer();
  };

  /**
   * @description 선택된 행들을 확인 팝업 승인 후 일괄 삭제
   * 처리 규칙: 선택이 없으면 안내 토스트만 표시하고, 승인된 경우에만 rowList를 필터링한다.
   * @updated 2026-02-27
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
    setRowList((prevRows) =>
      prevRows.filter((rowItem) => !selectedIdSet.has(rowItem.id)),
    );
    ui.selectedIdList = [];
    showToast(LANG_KO.view.toast.removedSelectedRows, { type: "success" });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{LANG_KO.view.section.title}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {LANG_KO.view.section.subtitle}
        </p>
      </section>

      <Card
        title={LANG_KO.view.card.filterTitle}
        actions={
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
        }
      >
        <div className="grid gap-2 md:grid-cols-[1fr_180px_160px_160px_auto_auto]">
          <div>
            <Input
              value={ui.keyword}
              onChange={(event) => {
                ui.keyword = event.target.value;
              }}
              placeholder={LANG_KO.view.input.searchPlaceholder}
            />
          </div>
          <div>
            <Select
              value={ui.status}
              onChange={(event) => {
                ui.status = event.target.value;
              }}
              dataList={STATUS_FILTER_LIST}
            />
          </div>
          <DateInput
            value={ui.fromDate}
            onChange={(event) => {
              ui.fromDate = event?.target?.value || "";
            }}
            placeholder={LANG_KO.view.input.fromDatePlaceholder}
          />
          <DateInput
            value={ui.toDate}
            onChange={(event) => {
              ui.toDate = event?.target?.value || "";
            }}
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
          loading={ui.isLoading}
          data={filteredRows}
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
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.titleLabel}</span>
            <Input
              value={ui.form.title}
              onChange={(event) => {
                ui.form.title = event.target.value;
              }}
              placeholder={LANG_KO.view.input.titlePlaceholder}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.statusLabel}</span>
            <Select
              value={ui.form.status}
              onChange={(event) => {
                ui.form.status = event.target.value;
              }}
              dataList={STATUS_FILTER_LIST.filter((statusItem) => statusItem.value)}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.ownerLabel}</span>
            <Input
              value={ui.form.owner}
              onChange={(event) => {
                ui.form.owner = event.target.value;
              }}
              placeholder={LANG_KO.view.input.ownerPlaceholder}
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
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.descriptionLabel}</span>
            <Textarea
              rows={4}
              value={ui.form.description}
              onChange={(event) => {
                ui.form.description = event.target.value;
              }}
              placeholder={LANG_KO.view.input.descriptionPlaceholder}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{LANG_KO.view.drawer.attachmentLabel}</span>
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
            <Button onClick={saveDrawer} className="w-full sm:w-auto">{LANG_KO.view.action.save}</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default CrudDemoView;
