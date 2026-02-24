"use client";
/**
 * 파일명: dashboard/tasks/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-23
 * 설명: 업무 관리 클라이언트 뷰(CSR API 연동 CRUD)
 */

import { useEffect, useMemo, useState } from "react";
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
import {
  buildTasksQueryString,
  DEFAULT_SORT,
  PAGE_MODE,
  SORT_FILTER_LIST,
  STATUS_FILTER_LIST,
} from "./initData";

const PAGE_SIZE = 10;

const STATUS_LABELS = {
  ready: "준비",
  pending: "대기",
  running: "진행중",
  done: "완료",
  failed: "실패",
};

const STATUS_BADGE_VARIANT = {
  ready: "neutral",
  pending: "warning",
  running: "primary",
  done: "success",
  failed: "danger",
};

const STATUS_FORM_LIST = STATUS_FILTER_LIST.filter((item) => item.value);

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
  if (Number.isNaN(amount)) return "0";
  return amount.toLocaleString("ko-KR");
};

const toDateText = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toISOString().slice(0, 10);
};

const toPathWithId = (templatePath, id) => String(templatePath || "").replace(":id", String(id));

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

const TasksView = ({ initialFilter = {} }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast, showConfirm } = useGlobalUi();
  const [keyword, setKeyword] = useState(() => String(initialFilter?.keyword || ""));
  const [status, setStatus] = useState(() => String(initialFilter?.status || ""));
  const [sort, setSort] = useState(() => String(initialFilter?.sort || DEFAULT_SORT));
  const [page, setPage] = useState(() =>
    Number.isFinite(initialFilter?.page) && initialFilter.page > 0
      ? Number(initialFilter.page)
      : 1
  );
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createDefaultForm());
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
    nextKeyword = keyword,
    nextStatus = status,
    nextSort = sort,
    nextPage = page,
    syncQuery = true,
  } = {}) => {
    if (!hasListEndpoint) {
      setError({ message: "업무 목록 API가 설정되지 않았습니다." });
      setRows([]);
      setTotalCount(0);
      setIsLoading(false);
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

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiJSON(url);
      const itemList = Array.isArray(response?.result?.items) ? response.result.items : [];
      const total = Number(response?.result?.total || 0);
      setRows(itemList);
      setTotalCount(Number.isNaN(total) ? itemList.length : total);
      setPage(nextPage);
      setSort(nextSort || DEFAULT_SORT);
      if (syncQuery) {
        syncBrowserQuery({
          nextKeyword,
          nextStatus,
          nextSort: nextSort || DEFAULT_SORT,
          nextPage,
        });
      }
    } catch (err) {
      console.error("업무 목록 조회 실패", err);
      setRows([]);
      setTotalCount(0);
      setError(toApiError(err, "업무 목록을 불러오지 못했습니다."));
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setEditingId(null);
    setForm(createDefaultForm());
    setIsDrawerOpen(true);
    setIsDrawerLoading(false);
  };

  const openEditDrawer = async (id) => {
    if (!id || !hasDetailEndpoint) {
      showToast("상세 API 경로가 설정되지 않았습니다.", { type: "error" });
      return;
    }
    setDrawerMode("edit");
    setEditingId(id);
    setIsDrawerOpen(true);
    setIsDrawerLoading(true);
    try {
      const detailPath = toPathWithId(endPoints.detail, id);
      const response = await apiJSON(detailPath);
      const detail = response?.result || {};
      setForm({
        title: detail?.title || "",
        status: detail?.status || "ready",
        amount: Number(detail?.amount || 0),
        tags: toTagText(detail?.tags),
        description: detail?.description || "",
      });
    } catch (err) {
      console.error("업무 상세 조회 실패", err);
      showToast(err?.message || "업무 상세를 불러오지 못했습니다.", { type: "error" });
      setIsDrawerOpen(false);
    } finally {
      setIsDrawerLoading(false);
    }
  };

  const closeDrawer = () => {
    if (isSaving) return;
    setIsDrawerOpen(false);
    setIsDrawerLoading(false);
  };

  const saveTask = async () => {
    const title = String(form.title || "").trim();
    if (!title) {
      showToast("제목은 필수입니다.", { type: "warning" });
      return;
    }
    if (!STATUS_LABELS[form.status]) {
      showToast("상태 값이 유효하지 않습니다.", { type: "warning" });
      return;
    }
    if (drawerMode === "create" && !hasCreateEndpoint) {
      showToast("생성 API 경로가 설정되지 않았습니다.", { type: "error" });
      return;
    }
    if (drawerMode === "edit" && (!editingId || !hasUpdateEndpoint)) {
      showToast("수정 API 경로가 설정되지 않았습니다.", { type: "error" });
      return;
    }

    const payload = {
      title,
      status: form.status,
      amount: Number(form.amount || 0),
      tags: toTagList(form.tags),
      description: String(form.description || "").trim(),
    };
    const isCreate = drawerMode === "create";
    const path = isCreate ? endPoints.create : toPathWithId(endPoints.update, editingId);
    const method = isCreate ? "POST" : "PUT";

    setIsSaving(true);
    try {
      await apiJSON(path, { method, body: payload });
      showToast(isCreate ? "업무가 등록되었습니다." : "업무가 수정되었습니다.", {
        type: "success",
      });
      setIsDrawerOpen(false);
      await loadTasks({
        nextKeyword: keyword,
        nextStatus: status,
        nextSort: sort,
        nextPage: isCreate ? 1 : page,
      });
    } catch (err) {
      console.error("업무 저장 실패", err);
      showToast(err?.message || "업무 저장에 실패했습니다.", { type: "error" });
      setError(toApiError(err, "업무 저장에 실패했습니다."));
    } finally {
      setIsSaving(false);
    }
  };

  const removeTask = async (row) => {
    if (!hasRemoveEndpoint) {
      showToast("삭제 API 경로가 설정되지 않았습니다.", { type: "error" });
      return;
    }
    const confirmed = await showConfirm("정말 삭제하시겠습니까?", {
      title: "업무 삭제",
      type: "warning",
      confirmText: "삭제",
      cancelText: "취소",
    });
    if (!confirmed) return;

    try {
      await apiJSON(toPathWithId(endPoints.remove, row?.id), { method: "DELETE" });
      showToast("업무가 삭제되었습니다.", { type: "success" });
      const nextPage = page > 1 && rows.length === 1 ? page - 1 : page;
      await loadTasks({
        nextKeyword: keyword,
        nextStatus: status,
        nextSort: sort,
        nextPage,
      });
    } catch (err) {
      console.error("업무 삭제 실패", err);
      showToast(err?.message || "업무 삭제에 실패했습니다.", { type: "error" });
      setError(toApiError(err, "업무 삭제에 실패했습니다."));
    }
  };

  useEffect(() => {
    loadTasks({
      nextKeyword: keyword,
      nextStatus: status,
      nextSort: sort,
      nextPage: page,
      syncQuery: false,
    });
  }, [hasListEndpoint]);

  const tableColumns = useMemo(
    () => [
      {
        key: "title",
        header: "제목",
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
        header: "상태",
        width: 140,
        render: (row) => (
          <Badge variant={STATUS_BADGE_VARIANT[row?.status] || "neutral"} pill>
            {STATUS_LABELS[row?.status] || row?.status || "미정"}
          </Badge>
        ),
      },
      {
        key: "amount",
        header: "금액",
        width: 140,
        align: "right",
        render: (row) => toCurrencyText(row?.amount),
      },
      {
        key: "tags",
        header: "태그",
        align: "left",
        width: "2fr",
        render: (row) => {
          const tagList = toTagList(row?.tags);
          if (!tagList.length) return <span className="text-gray-400">-</span>;
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
        header: "등록일",
        width: 140,
        render: (row) => toDateText(row?.createdAt),
      },
      {
        key: "actions",
        header: "관리",
        width: 180,
        render: (row) => (
          <div className="flex items-center justify-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => openEditDrawer(row?.id)}>
              수정
            </Button>
            <Button size="sm" variant="danger" onClick={() => removeTask(row)}>
              삭제
            </Button>
          </div>
        ),
      },
    ],
    [rows, keyword, status, page]
  );

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-3">
      {error?.message ? (
        <section aria-label="오류 안내">
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <div>{error.message}</div>
            {error.requestId ? (
              <div className="mt-1 text-xs text-red-700/80">requestId: {error.requestId}</div>
            ) : null}
          </div>
        </section>
      ) : null}

      <Card
        title="업무 관리"
        actions={
          <Button onClick={openCreateDrawer} variant="primary" className="w-full sm:w-auto">
            업무 등록
          </Button>
        }
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex-1">
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="제목/설명 검색"
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              dataList={STATUS_FILTER_LIST}
            />
          </div>
          <div className="w-full md:w-52">
            <Select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              dataList={SORT_FILTER_LIST}
            />
          </div>
          <Button
            onClick={() =>
              loadTasks({
                nextKeyword: keyword,
                nextStatus: status,
                nextSort: sort,
                nextPage: 1,
              })
            }
            loading={isLoading}
            className="w-full sm:w-auto"
          >
            검색
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setKeyword("");
              setStatus("");
              setSort(DEFAULT_SORT);
              loadTasks({
                nextKeyword: "",
                nextStatus: "",
                nextSort: DEFAULT_SORT,
                nextPage: 1,
              });
            }}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            초기화
          </Button>
        </div>
      </Card>

      <Card title="업무 목록">
        <EasyTable
          data={rows}
          loading={isLoading}
          columns={tableColumns}
          pageSize={PAGE_SIZE}
          empty="업무가 없습니다."
          rowKey={(row, idx) => row?.id ?? idx}
        />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-600">총 {totalCount.toLocaleString("ko-KR")}건</div>
          <Pagination
            page={page}
            pageCount={pageCount}
            onChange={(nextPage) =>
              loadTasks({
                nextKeyword: keyword,
                nextStatus: status,
                nextSort: sort,
                nextPage,
              })
            }
          />
        </div>
      </Card>

      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} side="right" size={460} collapseButton>
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {drawerMode === "create" ? "업무 등록" : "업무 수정"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {drawerMode === "create" ? "새 업무를 등록합니다." : `업무 번호 #${editingId || "-"}`}
            </p>
          </div>

          {isDrawerLoading ? (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
              상세 데이터를 불러오는 중...
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">제목</span>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="업무 제목을 입력해주세요"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">상태</span>
                <Select
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                  dataList={STATUS_FORM_LIST}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">금액</span>
                <NumberInput
                  value={form.amount}
                  min={0}
                  step={1000}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, amount: Number(event?.target?.value || 0) }))
                  }
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">태그 (콤마 구분)</span>
                <Input
                  value={form.tags}
                  onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                  placeholder="backend, admin, sample"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-medium text-gray-700">설명</span>
                <Textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="업무 설명을 입력해주세요"
                />
              </label>
            </div>
          )}

          <div className="pt-2 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="secondary" onClick={closeDrawer} disabled={isSaving} className="w-full sm:w-auto">
              취소
            </Button>
            <Button onClick={saveTask} loading={isSaving || isDrawerLoading} className="w-full sm:w-auto">
              저장
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default TasksView;
