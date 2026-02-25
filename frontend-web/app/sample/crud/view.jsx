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

const { view: viewText } = LANG_KO;
const STATUS_LABEL_MAP = viewText.statusLabelMap;
const STATUS_BADGE_VARIANT_MAP = viewText.statusBadgeVariantMap;

const createDefaultForm = () => ({
  title: "",
  status: "ready",
  owner: "",
  amount: 0,
  description: "",
  attachmentName: "",
});

const toTodayText = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toAmountText = (amount) => {
  const numericAmount = Number(amount || 0);
  if (Number.isNaN(numericAmount)) return "0";
  return numericAmount.toLocaleString("ko-KR");
};

/**
 * @description 공개 CRUD 샘플 화면을 렌더링한다.
 * @param {{ mode: Object, initRows: Array }} props
 */
const CrudDemoView = (props) => {
  const { initRows = [] } = props;
  const ui = EasyObj(
    useMemo(
      () => ({
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
        form: createDefaultForm(),
        formError: "",
      }),
      [],
    ),
  );
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

  const tableColumns = useMemo(
    () => [
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
              aria-label={viewText.table.selectAllAriaLabel}
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
                const previousList = ui.selectedIdList;
                if (checked) {
                  ui.selectedIdList = Array.from(new Set([...previousList, rowItem.id]));
                  return;
                }
                ui.selectedIdList = previousList.filter(
                  (previousId) => previousId !== rowItem.id,
                );
              }}
              aria-label={`${viewText.table.rowSelectAriaLabelPrefix} ${rowItem.id}`}
            />
          </div>
        ),
      },
      {
        key: "id",
        header: viewText.table.idHeader,
        width: 80,
      },
      {
        key: "title",
        header: viewText.table.titleHeader,
        align: "left",
        width: "2fr",
      },
      {
        key: "status",
        header: viewText.table.statusHeader,
        width: 120,
        render: (rowItem) => (
          <Badge
            variant={STATUS_BADGE_VARIANT_MAP[rowItem?.status] || "neutral"}
            pill
          >
            {STATUS_LABEL_MAP[rowItem?.status] || rowItem?.status}
          </Badge>
        ),
      },
      {
        key: "owner",
        header: viewText.table.ownerHeader,
        width: 120,
      },
      {
        key: "amount",
        header: viewText.table.amountHeader,
        width: 140,
        render: (rowItem) =>
          Number(rowItem?.amount || 0).toLocaleString("ko-KR"),
      },
      {
        key: "createdAt",
        header: viewText.table.createdAtHeader,
        width: 120,
      },
      {
        key: "actions",
        header: viewText.table.actionsHeader,
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
                  status: rowItem.status || "ready",
                  owner: rowItem.owner || "",
                  amount: Number(rowItem.amount || 0),
                  description: rowItem.description || "",
                  attachmentName: rowItem.attachmentName || "",
                };
                ui.formError = "";
              }}
            >
              {viewText.action.edit}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={async () => {
                const confirmed = await showConfirm(
                  viewText.confirm.removeOne,
                  {
                    title: viewText.confirm.removeOneTitle,
                    type: "warning",
                    confirmText: viewText.confirm.confirmText,
                    cancelText: viewText.confirm.cancelText,
                  },
                );
                if (!confirmed) return;
                setRowList((prevRows) =>
                  prevRows.filter((prevRow) => prevRow.id !== rowItem.id),
                );
                ui.selectedIdList = ui.selectedIdList.filter(
                  (selectedId) => selectedId !== rowItem.id,
                );
                showToast(viewText.toast.removedRow, { type: "success" });
              }}
            >
              {viewText.action.remove}
            </Button>
          </div>
        ),
      },
    ],
    [allRowSelected, filteredRows, selectedIdSet, showConfirm, showToast],
  );

  const openCreateDrawer = () => {
    ui.drawerState = {
      isOpen: true,
      mode: "create",
      editingId: null,
    };
    ui.form = createDefaultForm();
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

  const validateAndSearch = () => {
    if (ui.fromDate && ui.toDate && ui.fromDate > ui.toDate) {
      showToast(viewText.validation.dateRangeInvalid, { type: "error" });
      return;
    }
    ui.appliedFilter = {
      keyword: ui.keyword,
      status: ui.status,
      fromDate: ui.fromDate,
      toDate: ui.toDate,
    };
  };

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

  const saveDrawer = () => {
    const title = String(ui.form.title || "").trim();
    if (!title) {
      ui.formError = viewText.validation.titleRequired;
      showToast(viewText.validation.titleRequiredToast, { type: "warning" });
      return;
    }
    const owner = String(ui.form.owner || "").trim();
    const nextRow = {
      title,
      status: ui.form.status || "ready",
      owner: owner || viewText.validation.ownerFallback,
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
      showToast(viewText.toast.createdRow, { type: "success" });
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
      showToast(viewText.toast.updatedRow, { type: "success" });
    }
    closeDrawer();
  };

  const removeSelectedRows = async () => {
    if (ui.selectedIdList.length === 0) {
      showToast(viewText.validation.noSelection, { type: "info" });
      return;
    }
    const confirmed = await showConfirm(
      `선택된 ${ui.selectedIdList.length}${viewText.confirm.removeManyTextSuffix}`,
      {
        title: viewText.confirm.removeManyTitle,
        type: "warning",
        confirmText: viewText.confirm.confirmText,
        cancelText: viewText.confirm.cancelText,
      },
    );
    if (!confirmed) return;
    setRowList((prevRows) =>
      prevRows.filter((rowItem) => !selectedIdSet.has(rowItem.id)),
    );
    ui.selectedIdList = [];
    showToast(viewText.toast.removedSelectedRows, { type: "success" });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{viewText.section.title}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {viewText.section.subtitle}
        </p>
      </section>

      <Card
        title={viewText.card.filterTitle}
        actions={
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button
              variant="secondary"
              onClick={removeSelectedRows}
              className="w-full sm:w-auto"
            >
              {viewText.action.removeSelected}
            </Button>
            <Button
              variant="primary"
              onClick={openCreateDrawer}
              className="w-full sm:w-auto"
            >
              {viewText.action.openCreate}
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
              placeholder={viewText.input.searchPlaceholder}
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
            placeholder={viewText.input.fromDatePlaceholder}
          />
          <DateInput
            value={ui.toDate}
            onChange={(event) => {
              ui.toDate = event?.target?.value || "";
            }}
            placeholder={viewText.input.toDatePlaceholder}
          />
          <Button
            variant="primary"
            onClick={validateAndSearch}
            className="w-full sm:w-auto"
          >
            {viewText.action.search}
          </Button>
          <Button
            variant="secondary"
            onClick={resetFilter}
            className="w-full sm:w-auto"
          >
            {viewText.action.reset}
          </Button>
        </div>
      </Card>

      <Card title={viewText.card.tableTitle} className="mt-4">
        <EasyTable
          loading={ui.isLoading}
          data={filteredRows}
          columns={tableColumns}
          pageSize={5}
          empty={viewText.table.empty}
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
              {ui.drawerState.mode === "create" ? viewText.drawer.createTitle : viewText.drawer.editTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {ui.drawerState.mode === "create"
                ? viewText.drawer.createDescription
                : `${viewText.drawer.editDescriptionPrefix}${ui.drawerState.editingId || "-"}`}
            </p>
          </div>

          {ui.formError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {ui.formError}
            </div>
          ) : null}

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{viewText.drawer.titleLabel}</span>
            <Input
              value={ui.form.title}
              onChange={(event) => {
                ui.form.title = event.target.value;
              }}
              placeholder={viewText.input.titlePlaceholder}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{viewText.drawer.statusLabel}</span>
            <Select
              value={ui.form.status}
              onChange={(event) => {
                ui.form.status = event.target.value;
              }}
              dataList={STATUS_FILTER_LIST.filter((statusItem) => statusItem.value)}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{viewText.drawer.ownerLabel}</span>
            <Input
              value={ui.form.owner}
              onChange={(event) => {
                ui.form.owner = event.target.value;
              }}
              placeholder={viewText.input.ownerPlaceholder}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{viewText.drawer.amountLabel}</span>
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
            <span className="text-sm font-medium text-gray-700">{viewText.drawer.descriptionLabel}</span>
            <Textarea
              rows={4}
              value={ui.form.description}
              onChange={(event) => {
                ui.form.description = event.target.value;
              }}
              placeholder={viewText.input.descriptionPlaceholder}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">{viewText.drawer.attachmentLabel}</span>
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
              {viewText.action.cancel}
            </Button>
            <Button onClick={saveDrawer} className="w-full sm:w-auto">{viewText.action.save}</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default CrudDemoView;
