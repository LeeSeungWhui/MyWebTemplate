"use client";
/**
 * 파일명: demo/crud/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 CRUD 데모 페이지 뷰(더미 데이터 기반, Drawer CRUD)
 */

import { useEffect, useMemo, useState } from "react";
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
import { useDemoSharedState } from "@/app/demo/demoSharedState";

const STATUS_LABEL_MAP = {
  ready: "준비",
  pending: "대기",
  running: "진행중",
  done: "완료",
  failed: "실패",
};

const STATUS_BADGE_VARIANT_MAP = {
  ready: "neutral",
  pending: "warning",
  running: "primary",
  done: "success",
  failed: "danger",
};

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
 * @description 공개 CRUD 데모 화면을 렌더링한다.
 * @param {{ mode: Object, initRows: Array }} props
 */
const CrudDemoView = (props) => {
  const { initRows = [] } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFilter, setAppliedFilter] = useState({
    keyword: "",
    status: "",
    fromDate: "",
    toDate: "",
  });
  const { value: rowList, setValue: setRowList } = useDemoSharedState({
    stateKey: "demoCrudRows",
    initialValue: initRows,
  });
  const [selectedIdList, setSelectedIdList] = useState([]);
  const [drawerState, setDrawerState] = useState({
    isOpen: false,
    mode: "create",
    editingId: null,
  });
  const [form, setForm] = useState(createDefaultForm());
  const [formError, setFormError] = useState("");
  const { showToast, showConfirm } = useGlobalUi();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 180);
    return () => clearTimeout(timer);
  }, []);

  const filteredRows = useMemo(() => {
    const normalizedKeyword = appliedFilter.keyword.trim().toLowerCase();
    return rowList.filter((rowItem) => {
      if (appliedFilter.status && rowItem.status !== appliedFilter.status) {
        return false;
      }
      if (appliedFilter.fromDate && rowItem.createdAt < appliedFilter.fromDate) {
        return false;
      }
      if (appliedFilter.toDate && rowItem.createdAt > appliedFilter.toDate) {
        return false;
      }
      if (!normalizedKeyword) return true;
      const targetText = `${rowItem.title} ${rowItem.owner} ${rowItem.description || ""}`.toLowerCase();
      return targetText.includes(normalizedKeyword);
    });
  }, [rowList, appliedFilter]);

  const selectedIdSet = useMemo(() => new Set(selectedIdList), [selectedIdList]);
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
                  setSelectedIdList([]);
                  return;
                }
                setSelectedIdList(filteredRows.map((rowItem) => rowItem.id));
              }}
              aria-label="전체 선택"
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
                setSelectedIdList((previousList) => {
                  if (checked) return Array.from(new Set([...previousList, rowItem.id]));
                  return previousList.filter((previousId) => previousId !== rowItem.id);
                });
              }}
              aria-label={`행 선택 ${rowItem.id}`}
            />
          </div>
        ),
      },
      {
        key: "id",
        header: "번호",
        width: 80,
      },
      {
        key: "title",
        header: "제목",
        align: "left",
        width: "2fr",
      },
      {
        key: "status",
        header: "상태",
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
        header: "담당자",
        width: 120,
      },
      {
        key: "amount",
        header: "금액",
        width: 140,
        render: (rowItem) =>
          Number(rowItem?.amount || 0).toLocaleString("ko-KR"),
      },
      {
        key: "createdAt",
        header: "등록일",
        width: 120,
      },
      {
        key: "actions",
        header: "관리",
        width: 180,
        render: (rowItem) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setDrawerState({
                  isOpen: true,
                  mode: "edit",
                  editingId: rowItem.id,
                });
                setForm({
                  title: rowItem.title || "",
                  status: rowItem.status || "ready",
                  owner: rowItem.owner || "",
                  amount: Number(rowItem.amount || 0),
                  description: rowItem.description || "",
                  attachmentName: rowItem.attachmentName || "",
                });
                setFormError("");
              }}
            >
              수정
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={async () => {
                const confirmed = await showConfirm(
                  "정말 삭제하시겠습니까?",
                  {
                    title: "데모 삭제",
                    type: "warning",
                    confirmText: "삭제",
                    cancelText: "취소",
                  },
                );
                if (!confirmed) return;
                setRowList((prevRows) =>
                  prevRows.filter((prevRow) => prevRow.id !== rowItem.id),
                );
                setSelectedIdList((prevList) =>
                  prevList.filter((selectedId) => selectedId !== rowItem.id),
                );
                showToast("행이 삭제되었습니다.", { type: "success" });
              }}
            >
              삭제
            </Button>
          </div>
        ),
      },
    ],
    [allRowSelected, filteredRows, selectedIdSet, showConfirm, showToast],
  );

  const openCreateDrawer = () => {
    setDrawerState({
      isOpen: true,
      mode: "create",
      editingId: null,
    });
    setForm(createDefaultForm());
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

  const validateAndSearch = () => {
    if (fromDate && toDate && fromDate > toDate) {
      showToast("기간 범위를 확인해주세요.", { type: "error" });
      return;
    }
    setAppliedFilter({
      keyword,
      status,
      fromDate,
      toDate,
    });
  };

  const resetFilter = () => {
    setKeyword("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setAppliedFilter({
      keyword: "",
      status: "",
      fromDate: "",
      toDate: "",
    });
    setSelectedIdList([]);
  };

  const saveDrawer = () => {
    const title = String(form.title || "").trim();
    if (!title) {
      setFormError("제목은 필수입니다.");
      showToast("제목을 입력해주세요.", { type: "warning" });
      return;
    }
    const owner = String(form.owner || "").trim();
    const nextRow = {
      title,
      status: form.status || "ready",
      owner: owner || "담당자 미지정",
      amount: Number(form.amount || 0),
      description: String(form.description || "").trim(),
      attachmentName: String(form.attachmentName || ""),
    };
    if (drawerState.mode === "create") {
      const nextId = Math.max(0, ...rowList.map((rowItem) => Number(rowItem.id || 0))) + 1;
      setRowList((prevRows) => [
        {
          id: nextId,
          ...nextRow,
          createdAt: toTodayText(),
        },
        ...prevRows,
      ]);
      showToast("신규 업무가 등록되었습니다.", { type: "success" });
    } else {
      const editingId = drawerState.editingId;
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
      showToast("업무가 수정되었습니다.", { type: "success" });
    }
    closeDrawer();
  };

  const removeSelectedRows = async () => {
    if (selectedIdList.length === 0) {
      showToast("선택된 항목이 없습니다.", { type: "info" });
      return;
    }
    const confirmed = await showConfirm(
      `선택된 ${selectedIdList.length}건을 삭제하시겠습니까?`,
      {
        title: "일괄 삭제",
        type: "warning",
        confirmText: "삭제",
        cancelText: "취소",
      },
    );
    if (!confirmed) return;
    setRowList((prevRows) =>
      prevRows.filter((rowItem) => !selectedIdSet.has(rowItem.id)),
    );
    setSelectedIdList([]);
    showToast("선택 항목이 삭제되었습니다.", { type: "success" });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">CRUD 관리 데모</h1>
        <p className="mt-2 text-sm text-gray-600">
          공개 페이지에서 관리형 데이터 화면 구성을 체험할 수 있는 더미 데모입니다.
        </p>
      </section>

      <Card
        title="검색/필터"
        actions={
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button
              variant="secondary"
              onClick={removeSelectedRows}
              className="w-full sm:w-auto"
            >
              선택 삭제
            </Button>
            <Button
              variant="primary"
              onClick={openCreateDrawer}
              className="w-full sm:w-auto"
            >
              신규 등록
            </Button>
          </div>
        }
      >
        <div className="grid gap-2 md:grid-cols-[1fr_180px_160px_160px_auto_auto]">
          <div>
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="검색어를 입력하세요"
            />
          </div>
          <div>
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              dataList={STATUS_FILTER_LIST}
            />
          </div>
          <DateInput
            value={fromDate}
            onChange={(event) => setFromDate(event?.target?.value || "")}
            placeholder="시작일"
          />
          <DateInput
            value={toDate}
            onChange={(event) => setToDate(event?.target?.value || "")}
            placeholder="종료일"
          />
          <Button
            variant="primary"
            onClick={validateAndSearch}
            className="w-full sm:w-auto"
          >
            검색
          </Button>
          <Button
            variant="secondary"
            onClick={resetFilter}
            className="w-full sm:w-auto"
          >
            초기화
          </Button>
        </div>
      </Card>

      <Card title="업무 목록" className="mt-4">
        <EasyTable
          loading={isLoading}
          data={filteredRows}
          columns={tableColumns}
          pageSize={5}
          empty="데이터가 없습니다."
          rowKey={(rowItem, rowIndex) => rowItem?.id ?? rowIndex}
        />
      </Card>

      <Drawer
        isOpen={drawerState.isOpen}
        onClose={closeDrawer}
        side="right"
        size={520}
        collapseButton
      >
        <div className="space-y-4 p-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {drawerState.mode === "create" ? "업무 등록" : "업무 수정"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {drawerState.mode === "create"
                ? "필수 항목을 입력한 뒤 저장해주세요."
                : `업무 번호 #${drawerState.editingId || "-"}`}
            </p>
          </div>

          {formError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">제목</span>
            <Input
              value={form.title}
              onChange={(event) =>
                setForm((prevForm) => ({
                  ...prevForm,
                  title: event.target.value,
                }))
              }
              placeholder="제목을 입력해주세요"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">상태</span>
            <Select
              value={form.status}
              onChange={(event) =>
                setForm((prevForm) => ({
                  ...prevForm,
                  status: event.target.value,
                }))
              }
              dataList={STATUS_FILTER_LIST.filter((statusItem) => statusItem.value)}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">담당자</span>
            <Input
              value={form.owner}
              onChange={(event) =>
                setForm((prevForm) => ({
                  ...prevForm,
                  owner: event.target.value,
                }))
              }
              placeholder="담당자를 입력해주세요"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">금액</span>
            <NumberInput
              value={form.amount}
              min={0}
              step={1000}
              onChange={(event) =>
                setForm((prevForm) => ({
                  ...prevForm,
                  amount: Number(event?.target?.value || 0),
                }))
              }
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">설명</span>
            <Textarea
              rows={4}
              value={form.description}
              onChange={(event) =>
                setForm((prevForm) => ({
                  ...prevForm,
                  description: event.target.value,
                }))
              }
              placeholder="업무 설명을 입력해주세요"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-medium text-gray-700">첨부파일</span>
            <input
              type="file"
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              onChange={(event) => {
                const nextFile = event?.target?.files?.[0];
                setForm((prevForm) => ({
                  ...prevForm,
                  attachmentName: nextFile?.name || "",
                }));
              }}
            />
            {form.attachmentName ? (
              <p className="text-xs text-gray-500">{form.attachmentName}</p>
            ) : null}
          </label>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="secondary" onClick={closeDrawer} className="w-full sm:w-auto">
              취소
            </Button>
            <Button onClick={saveDrawer} className="w-full sm:w-auto">저장</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default CrudDemoView;
