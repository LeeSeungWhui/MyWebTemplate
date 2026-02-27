"use client";
/**
 * 파일명: sample/form/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-22
 * 설명: 공개 복합 폼 샘플 페이지 뷰(스텝 검증/요약 기반)
 */

import { useEffect, useMemo } from "react";
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
import EasyObj from "@/app/lib/dataset/EasyObj";
import LANG_KO from "./lang.ko";

const STEP_LIST = LANG_KO.view.stepList.map((item) => ({ ...item }));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @description 공개 복합 폼 샘플 화면을 렌더링. 입력/출력 계약을 함께 명시
 * 처리 규칙: 단계별(step1~3) 입력/검증/요약 상태를 하나의 EasyObj(ui)에서 관리한다.
 */
const FormDemoView = () => {

  /**
   * @description 1단계 입력 검증 에러 모델의 기본값을 생성. 입력/출력 계약을 함께 명시
   * 반환값: 각 필드 에러 메시지를 빈 문자열로 초기화한 객체.
   * @updated 2026-02-27
   */
  const createStepOneErrorModel = () => ({
    name: "",
    email: "",
    phone: "",
    category: "",
    startDate: "",
    endDate: "",
    budgetRange: "",
  });

  const ui = EasyObj({
    isLoading: true,
    step: 1,
    form: createDefaultForm(),
    stepOneErrors: createStepOneErrorModel(),
  });
  const { showToast } = useGlobalUi();

  useEffect(() => {
    const timer = setTimeout(() => {
      ui.isLoading = false;
    }, 160);
    return () => clearTimeout(timer);
  }, [ui]);

  const summaryRows = useMemo(
    () => [
      { label: LANG_KO.view.summaryLabel.name, value: ui.form.name || "-" },
      { label: LANG_KO.view.summaryLabel.email, value: ui.form.email || "-" },
      { label: LANG_KO.view.summaryLabel.phone, value: ui.form.phone || "-" },
      {
        label: LANG_KO.view.summaryLabel.category,
        value:
          CATEGORY_OPTION_LIST.find(
            (categoryItem) => categoryItem.value === ui.form.category,
          )?.text || "-",
      },
      { label: LANG_KO.view.summaryLabel.period, value: `${ui.form.startDate || "-"} ~ ${ui.form.endDate || "-"}` },
      { label: LANG_KO.view.summaryLabel.budgetRange, value: ui.form.budgetRange || "-" },
      {
        label: LANG_KO.view.summaryLabel.features,
        value:
          ui.form.selectedFeatures.length > 0
            ? ui.form.selectedFeatures.join(", ")
            : "-",
      },
      { label: LANG_KO.view.summaryLabel.requirement, value: ui.form.requirement || "-" },
      { label: LANG_KO.view.summaryLabel.referenceUrl, value: ui.form.referenceUrl || "-" },
      { label: LANG_KO.view.summaryLabel.attachmentName, value: ui.form.attachmentName || "-" },
    ],
    [ui.form],
  );
  const stepOneErrorIds = {
    name: ui.stepOneErrors.name ? "demo-form-name-error" : undefined,
    email: ui.stepOneErrors.email ? "demo-form-email-error" : undefined,
    phone: ui.stepOneErrors.phone ? "demo-form-phone-error" : undefined,
    category: ui.stepOneErrors.category ? "demo-form-category-error" : undefined,
    startDate: ui.stepOneErrors.startDate ? "demo-form-start-date-error" : undefined,
    endDate: ui.stepOneErrors.endDate ? "demo-form-end-date-error" : undefined,
    budgetRange: ui.stepOneErrors.budgetRange ? "demo-form-budget-range-error" : undefined,
  };

  /**
   * @description 요청된 단계 번호를 허용 범위(1. 3)로 보정해 현재 단계를 변경
   * 처리 규칙: 범위를 벗어난 입력은 min/max 경계값으로 clamp 한다.
   * @updated 2026-02-27
   */
  const moveStep = (nextStep) => {
    ui.step = Math.min(3, Math.max(1, nextStep));
  };

  /**
   * @description 1단계 필드 에러 메시지를 모두 초기화
   * 부작용: ui.stepOneErrors를 새 기본 모델로 교체한다.
   * @updated 2026-02-27
   */
  const resetStepOneErrors = () => {
    ui.stepOneErrors = createStepOneErrorModel();
  };

  /**
   * @description 1단계 필수값/형식/기간 규칙을 검증하고 에러 상태를 반영
   * 실패 동작: 하나라도 실패하면 ui.stepOneErrors를 갱신하고 에러 토스트를 띄운 뒤 false를 반환한다.
   * @updated 2026-02-27
   */
  const validateStepOne = () => {
    const nextErrors = createStepOneErrorModel();
    const name = String(ui.form.name || "").trim();
    const email = String(ui.form.email || "").trim();
    const phone = String(ui.form.phone || "").trim();
    const category = String(ui.form.category || "").trim();
    const startDate = String(ui.form.startDate || "").trim();
    const endDate = String(ui.form.endDate || "").trim();
    const budgetRange = String(ui.form.budgetRange || "").trim();

    if (!name) nextErrors.name = LANG_KO.view.validation.nameRequired;
    if (!email || !EMAIL_RE.test(email)) {
      nextErrors.email = LANG_KO.view.validation.emailInvalid;
    }
    if (!phone) nextErrors.phone = LANG_KO.view.validation.phoneRequired;
    if (!category) nextErrors.category = LANG_KO.view.validation.categoryRequired;
    if (!startDate) nextErrors.startDate = LANG_KO.view.validation.startDateRequired;
    if (!endDate) nextErrors.endDate = LANG_KO.view.validation.endDateRequired;
    if (!budgetRange) nextErrors.budgetRange = LANG_KO.view.validation.budgetRangeRequired;
    if (startDate && endDate && startDate > endDate) {
      nextErrors.endDate = LANG_KO.view.validation.endDateAfterStartDate;
    }

    const hasError = Object.values(nextErrors).some(Boolean);
    ui.stepOneErrors = nextErrors;
    if (hasError) {
      showToast(LANG_KO.view.validation.requiredFieldToast, { type: "error" });
      return false;
    }
    return true;
  };

  /**
   * @description 기능 선택 체크 상태를 토글해 selectedFeatures 목록을 갱신
   * 처리 규칙: 이미 선택된 라벨은 제거하고, 미선택 라벨은 배열 끝에 추가한다.
   * @updated 2026-02-27
   */
  const toggleFeature = (label) => {
    const exists = ui.form.selectedFeatures.includes(label);
    if (exists) {
      ui.form.selectedFeatures = ui.form.selectedFeatures.filter(
        (selectedLabel) => selectedLabel !== label,
      );
      return;
    }
    ui.form.selectedFeatures = [...ui.form.selectedFeatures, label];
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{LANG_KO.view.page.title}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {LANG_KO.view.page.subtitle}
        </p>
      </section>

      <ol className="mb-5 grid gap-2 sm:grid-cols-3">
        {STEP_LIST.map((stepItem) => (
          <li
            key={stepItem.step}
            className={`rounded-lg border px-4 py-3 text-sm ${
              stepItem.step === ui.step
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-500"
            }`}
          >
            {stepItem.step}. {stepItem.label}
          </li>
        ))}
      </ol>

      {ui.isLoading ? (
        <Card title={LANG_KO.view.page.loadingCardTitle}>
          <p className="text-sm text-gray-600">{LANG_KO.view.page.loadingCardBody}</p>
        </Card>
      ) : null}

      {ui.step === 1 ? (
        <Card title={LANG_KO.view.card.step1Title}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">{LANG_KO.view.summaryLabel.name}</span>
              <Input
                value={ui.form.name}
                onChange={(event) => {
                  ui.form.name = event.target.value;
                }}
                placeholder={LANG_KO.view.input.namePlaceholder}
                error={ui.stepOneErrors.name}
                aria-describedby={stepOneErrorIds.name}
              />
              {ui.stepOneErrors.name ? (
                <p id={stepOneErrorIds.name} className="text-xs text-red-600">
                  {ui.stepOneErrors.name}
                </p>
              ) : null}
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">{LANG_KO.view.summaryLabel.email}</span>
              <Input
                value={ui.form.email}
                onChange={(event) => {
                  ui.form.email = event.target.value;
                }}
                placeholder={LANG_KO.view.input.emailPlaceholder}
                type="email"
                error={ui.stepOneErrors.email}
                aria-describedby={stepOneErrorIds.email}
              />
              {ui.stepOneErrors.email ? (
                <p id={stepOneErrorIds.email} className="text-xs text-red-600">
                  {ui.stepOneErrors.email}
                </p>
              ) : null}
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">{LANG_KO.view.summaryLabel.phone}</span>
              <Input
                value={ui.form.phone}
                onChange={(event) => {
                  ui.form.phone = event.target.value;
                }}
                placeholder={LANG_KO.view.input.phonePlaceholder}
                error={ui.stepOneErrors.phone}
                aria-describedby={stepOneErrorIds.phone}
              />
              {ui.stepOneErrors.phone ? (
                <p id={stepOneErrorIds.phone} className="text-xs text-red-600">
                  {ui.stepOneErrors.phone}
                </p>
              ) : null}
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">{LANG_KO.view.summaryLabel.category}</span>
              <Select
                value={ui.form.category}
                onChange={(event) => {
                  ui.form.category = event.target.value;
                }}
                dataList={CATEGORY_OPTION_LIST}
                error={ui.stepOneErrors.category}
                aria-describedby={stepOneErrorIds.category}
              />
              {ui.stepOneErrors.category ? (
                <p id={stepOneErrorIds.category} className="text-xs text-red-600">
                  {ui.stepOneErrors.category}
                </p>
              ) : null}
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">{LANG_KO.view.summaryLabel.startDate}</span>
              <Input
                value={ui.form.startDate}
                onChange={(event) => {
                  ui.form.startDate = event.target.value;
                }}
                type="date"
                error={ui.stepOneErrors.startDate}
                aria-describedby={stepOneErrorIds.startDate}
              />
              {ui.stepOneErrors.startDate ? (
                <p id={stepOneErrorIds.startDate} className="text-xs text-red-600">
                  {ui.stepOneErrors.startDate}
                </p>
              ) : null}
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">{LANG_KO.view.summaryLabel.endDate}</span>
              <Input
                value={ui.form.endDate}
                onChange={(event) => {
                  ui.form.endDate = event.target.value;
                }}
                type="date"
                error={ui.stepOneErrors.endDate}
                aria-describedby={stepOneErrorIds.endDate}
              />
              {ui.stepOneErrors.endDate ? (
                <p id={stepOneErrorIds.endDate} className="text-xs text-red-600">
                  {ui.stepOneErrors.endDate}
                </p>
              ) : null}
            </label>

            <label className="block space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-gray-700">{LANG_KO.view.summaryLabel.budgetRange}</span>
              <Input
                value={ui.form.budgetRange}
                onChange={(event) => {
                  ui.form.budgetRange = event.target.value;
                }}
                placeholder={LANG_KO.view.input.budgetRangePlaceholder}
                error={ui.stepOneErrors.budgetRange}
                aria-describedby={stepOneErrorIds.budgetRange}
              />
              {ui.stepOneErrors.budgetRange ? (
                <p id={stepOneErrorIds.budgetRange} className="text-xs text-red-600">
                  {ui.stepOneErrors.budgetRange}
                </p>
              ) : null}
            </label>
          </div>
        </Card>
      ) : null}

      {ui.step === 2 ? (
        <Card title={LANG_KO.view.card.step2Title}>
          <div className="space-y-3">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">{LANG_KO.view.summaryLabel.requirement}</span>
              <Textarea
                value={ui.form.requirement}
                onChange={(event) => {
                  ui.form.requirement = event.target.value;
                }}
                placeholder={LANG_KO.view.input.requirementPlaceholder}
                rows={5}
              />
            </label>

            <div className="space-y-1">
              <span className="text-sm font-medium text-gray-700">{LANG_KO.view.summaryLabel.features}</span>
              <div className="flex flex-wrap gap-2">
                {FEATURE_CHECK_LIST.map((featureItem) => {
                  const selected = ui.form.selectedFeatures.includes(featureItem.label);
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
              <span className="text-sm font-medium text-gray-700">{LANG_KO.view.summaryLabel.referenceUrl}</span>
              <Input
                value={ui.form.referenceUrl}
                onChange={(event) => {
                  ui.form.referenceUrl = event.target.value;
                }}
                placeholder={LANG_KO.view.input.referenceUrlPlaceholder}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-700">{LANG_KO.view.summaryLabel.attachmentName}</span>
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
          </div>
        </Card>
      ) : null}

      {ui.step === 3 ? (
        <Card title={LANG_KO.view.card.step3Title}>
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
          onClick={() => moveStep(ui.step - 1)}
          disabled={ui.step === 1}
          className="w-full sm:w-auto"
        >
          {LANG_KO.view.action.prev}
        </Button>
        {ui.step < 3 ? (
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => {
              if (ui.step === 1) {
                const valid = validateStepOne();
                if (!valid) return;
                resetStepOneErrors();
              }
              moveStep(ui.step + 1);
            }}
          >
            {LANG_KO.view.action.next}
          </Button>
        ) : (
          <Button
            variant="primary"
            className="w-full sm:w-auto"
            onClick={() => {
              showToast(LANG_KO.view.action.submitSuccessToast, { type: "success" });
              ui.form = createDefaultForm();
              resetStepOneErrors();
              ui.step = 1;
            }}
          >
            {LANG_KO.view.action.submit}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FormDemoView;
