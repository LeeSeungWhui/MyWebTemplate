"use client";
/**
 * 파일명: demo/form/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 복합 폼 샘플 페이지 뷰(스텝 검증/요약 기반)
 */

import { useEffect, useMemo, useState } from "react";
import { useGlobalUi } from "@/app/common/store/SharedStore";
import Button from "@/app/lib/component/Button";
import Card from "@/app/lib/component/Card";
import CheckButton from "@/app/lib/component/CheckButton";
import Input from "@/app/lib/component/Input";
import Select from "@/app/lib/component/Select";
import Textarea from "@/app/lib/component/Textarea";
import {
  CATEGORY_OPTION_LIST,
  FEATURE_CHECK_LIST,
  createDefaultForm,
} from "./initData";

const STEP_LIST = [
  { step: 1, label: "기본 정보" },
  { step: 2, label: "상세 정보" },
  { step: 3, label: "확인/제출" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createStepOneErrorModel = () => ({
  name: "",
  email: "",
  phone: "",
  category: "",
  startDate: "",
  endDate: "",
  budgetRange: "",
});

/**
 * @description 공개 복합 폼 샘플 화면을 렌더링한다.
 */
const FormDemoView = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(createDefaultForm());
  const [stepOneErrors, setStepOneErrors] = useState(createStepOneErrorModel());
  const { showToast } = useGlobalUi();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 160);
    return () => clearTimeout(timer);
  }, []);

  const summaryRows = useMemo(
    () => [
      { label: "이름", value: form.name || "-" },
      { label: "이메일", value: form.email || "-" },
      { label: "연락처", value: form.phone || "-" },
      {
        label: "분류",
        value:
          CATEGORY_OPTION_LIST.find(
            (categoryItem) => categoryItem.value === form.category,
          )?.text || "-",
      },
      { label: "기간", value: `${form.startDate || "-"} ~ ${form.endDate || "-"}` },
      { label: "예산 범위", value: form.budgetRange || "-" },
      {
        label: "우선 기능",
        value:
          form.selectedFeatures.length > 0
            ? form.selectedFeatures.join(", ")
            : "-",
      },
      { label: "요청사항", value: form.requirement || "-" },
      { label: "참고 URL", value: form.referenceUrl || "-" },
      { label: "첨부파일", value: form.attachmentName || "-" },
    ],
    [form],
  );
  const stepOneErrorIds = {
    name: stepOneErrors.name ? "demo-form-name-error" : undefined,
    email: stepOneErrors.email ? "demo-form-email-error" : undefined,
    phone: stepOneErrors.phone ? "demo-form-phone-error" : undefined,
    category: stepOneErrors.category ? "demo-form-category-error" : undefined,
    startDate: stepOneErrors.startDate ? "demo-form-start-date-error" : undefined,
    endDate: stepOneErrors.endDate ? "demo-form-end-date-error" : undefined,
    budgetRange: stepOneErrors.budgetRange ? "demo-form-budget-range-error" : undefined,
  };

  const moveStep = (nextStep) => {
    setStep(Math.min(3, Math.max(1, nextStep)));
  };

  const resetStepOneErrors = () => {
    setStepOneErrors(createStepOneErrorModel());
  };

  const validateStepOne = () => {
    const nextErrors = createStepOneErrorModel();
    const name = String(form.name || "").trim();
    const email = String(form.email || "").trim();
    const phone = String(form.phone || "").trim();
    const category = String(form.category || "").trim();
    const startDate = String(form.startDate || "").trim();
    const endDate = String(form.endDate || "").trim();
    const budgetRange = String(form.budgetRange || "").trim();

    if (!name) nextErrors.name = "이름을 입력해주세요.";
    if (!email || !EMAIL_RE.test(email)) {
      nextErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }
    if (!phone) nextErrors.phone = "연락처를 입력해주세요.";
    if (!category) nextErrors.category = "분류를 선택해주세요.";
    if (!startDate) nextErrors.startDate = "시작일을 입력해주세요.";
    if (!endDate) nextErrors.endDate = "종료일을 입력해주세요.";
    if (!budgetRange) nextErrors.budgetRange = "예산 범위를 입력해주세요.";
    if (startDate && endDate && startDate > endDate) {
      nextErrors.endDate = "종료일은 시작일 이후여야 합니다.";
    }

    const hasError = Object.values(nextErrors).some(Boolean);
    setStepOneErrors(nextErrors);
    if (hasError) {
      showToast("필수 입력값을 확인해주세요.", { type: "error" });
      return false;
    }
    return true;
  };

  const toggleFeature = (label) => {
    setForm((prevForm) => {
      const exists = prevForm.selectedFeatures.includes(label);
      if (exists) {
        return {
          ...prevForm,
          selectedFeatures: prevForm.selectedFeatures.filter(
            (selectedLabel) => selectedLabel !== label,
          ),
        };
      }
      return {
        ...prevForm,
        selectedFeatures: [...prevForm.selectedFeatures, label],
      };
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">복합 폼 샘플</h1>
        <p className="mt-2 text-sm text-gray-600">
          스텝 전환/유효성 안내/제출 요약 흐름을 공개 페이지에서 체험할 수 있습니다.
        </p>
      </section>

      <ol className="mb-5 grid gap-2 sm:grid-cols-3">
        {STEP_LIST.map((stepItem) => (
          <li
            key={stepItem.step}
            className={`rounded-lg border px-4 py-3 text-sm ${
              stepItem.step === step
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-500"
            }`}
          >
            {stepItem.step}. {stepItem.label}
          </li>
        ))}
      </ol>

      {isLoading ? (
        <Card title="로딩 중">
          <p className="text-sm text-gray-600">데이터를 준비하는 중입니다...</p>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card title="기본 정보">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">이름</span>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((prevForm) => ({ ...prevForm, name: event.target.value }))
                }
                placeholder="이름"
                error={stepOneErrors.name}
                aria-describedby={stepOneErrorIds.name}
              />
              {stepOneErrors.name ? (
                <p id={stepOneErrorIds.name} className="text-xs text-red-600">
                  {stepOneErrors.name}
                </p>
              ) : null}
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">이메일</span>
              <Input
                value={form.email}
                onChange={(event) =>
                  setForm((prevForm) => ({ ...prevForm, email: event.target.value }))
                }
                placeholder="이메일"
                type="email"
                error={stepOneErrors.email}
                aria-describedby={stepOneErrorIds.email}
              />
              {stepOneErrors.email ? (
                <p id={stepOneErrorIds.email} className="text-xs text-red-600">
                  {stepOneErrors.email}
                </p>
              ) : null}
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">연락처</span>
              <Input
                value={form.phone}
                onChange={(event) =>
                  setForm((prevForm) => ({ ...prevForm, phone: event.target.value }))
                }
                placeholder="연락처"
                error={stepOneErrors.phone}
                aria-describedby={stepOneErrorIds.phone}
              />
              {stepOneErrors.phone ? (
                <p id={stepOneErrorIds.phone} className="text-xs text-red-600">
                  {stepOneErrors.phone}
                </p>
              ) : null}
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">분류</span>
              <Select
                value={form.category}
                onChange={(event) =>
                  setForm((prevForm) => ({
                    ...prevForm,
                    category: event.target.value,
                  }))
                }
                dataList={CATEGORY_OPTION_LIST}
                error={stepOneErrors.category}
                aria-describedby={stepOneErrorIds.category}
              />
              {stepOneErrors.category ? (
                <p id={stepOneErrorIds.category} className="text-xs text-red-600">
                  {stepOneErrors.category}
                </p>
              ) : null}
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">시작일</span>
              <Input
                value={form.startDate}
                onChange={(event) =>
                  setForm((prevForm) => ({
                    ...prevForm,
                    startDate: event.target.value,
                  }))
                }
                type="date"
                error={stepOneErrors.startDate}
                aria-describedby={stepOneErrorIds.startDate}
              />
              {stepOneErrors.startDate ? (
                <p id={stepOneErrorIds.startDate} className="text-xs text-red-600">
                  {stepOneErrors.startDate}
                </p>
              ) : null}
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">종료일</span>
              <Input
                value={form.endDate}
                onChange={(event) =>
                  setForm((prevForm) => ({
                    ...prevForm,
                    endDate: event.target.value,
                  }))
                }
                type="date"
                error={stepOneErrors.endDate}
                aria-describedby={stepOneErrorIds.endDate}
              />
              {stepOneErrors.endDate ? (
                <p id={stepOneErrorIds.endDate} className="text-xs text-red-600">
                  {stepOneErrors.endDate}
                </p>
              ) : null}
            </label>

            <label className="block space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-gray-700">예산 범위</span>
              <Input
                value={form.budgetRange}
                onChange={(event) =>
                  setForm((prevForm) => ({
                    ...prevForm,
                    budgetRange: event.target.value,
                  }))
                }
                placeholder="예) 300만 ~ 500만"
                error={stepOneErrors.budgetRange}
                aria-describedby={stepOneErrorIds.budgetRange}
              />
              {stepOneErrors.budgetRange ? (
                <p id={stepOneErrorIds.budgetRange} className="text-xs text-red-600">
                  {stepOneErrors.budgetRange}
                </p>
              ) : null}
            </label>
          </div>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card title="상세 정보">
          <div className="space-y-3">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">요청사항</span>
              <Textarea
                value={form.requirement}
                onChange={(event) =>
                  setForm((prevForm) => ({
                    ...prevForm,
                    requirement: event.target.value,
                  }))
                }
                placeholder="요청사항"
                rows={5}
              />
            </label>

            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-700">우선 기능</span>
              <div className="flex flex-wrap gap-2">
                {FEATURE_CHECK_LIST.map((featureItem) => {
                  const selected = form.selectedFeatures.includes(featureItem.label);
                  return (
                    <CheckButton
                      key={featureItem.key}
                      checked={selected}
                      onChange={() => toggleFeature(featureItem.label)}
                    >
                      {featureItem.label}
                    </CheckButton>
                  );
                })}
              </div>
            </div>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">참고 URL</span>
              <Input
                value={form.referenceUrl}
                onChange={(event) =>
                  setForm((prevForm) => ({
                    ...prevForm,
                    referenceUrl: event.target.value,
                  }))
                }
                placeholder="참고 URL"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">파일 첨부</span>
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
          </div>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card title="확인/제출">
          <ul className="space-y-2 text-sm text-gray-700">
            {summaryRows.map((summaryItem) => (
              <li
                key={summaryItem.label}
                className="grid grid-cols-[96px_1fr] gap-2 sm:grid-cols-[120px_1fr]"
              >
                <span className="font-medium text-gray-500">{summaryItem.label}</span>
                <span>{summaryItem.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="secondary"
          onClick={() => moveStep(step - 1)}
          disabled={step === 1}
          className="w-full sm:w-auto"
        >
          이전
        </Button>
        {step < 3 ? (
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => {
              if (step === 1) {
                const valid = validateStepOne();
                if (!valid) return;
                resetStepOneErrors();
              }
              moveStep(step + 1);
            }}
          >
            다음
          </Button>
        ) : (
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => {
              showToast("신청이 완료되었습니다", { type: "success" });
              setForm(createDefaultForm());
              resetStepOneErrors();
              setStep(1);
            }}
          >
            제출하기
          </Button>
        )}
      </div>
    </div>
  );
};

export default FormDemoView;
