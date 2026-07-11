"use client";

/**
 * 파일명: component/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: 컴포넌트 문서 페이지 클라이언트 뷰
 */

import { useEffect, useRef } from "react";
import EasyObj from "@/app/lib/dataset/EasyObj";
import { usePageData } from "@/app/lib/hooks/usePageData";
import TableOfContents from "./docs/shared/TableOfContents";
import TopButton from "./docs/shared/TopButton";
import DataClassDocs from "./docs/components/DataClassDocs";
import ButtonDocs from "./docs/components/ButtonDocs";
import IconDocs from "./docs/components/IconDocs";
import InputDocs from "./docs/components/InputDocs";
import TextareaDocs from "./docs/components/TextareaDocs";
import SelectDocs from "./docs/components/SelectDocs";
import CheckboxDocs from "./docs/components/CheckboxDocs";
import CheckButtonDocs from "./docs/components/CheckButtonDocs";
import RadioboxDocs from "./docs/components/RadioboxDocs";
import RadioButtonDocs from "./docs/components/RadioButtonDocs";
import SwitchDocs from "./docs/components/SwitchDocs";
import NumberInputDocs from "./docs/components/NumberInputDocs";
import DateTimeDocs from "./docs/components/DateTimeDocs";
import ComboboxDocs from "./docs/components/ComboboxDocs";
import DropdownDocs from "./docs/components/DropdownDocs";
import LoadingDocs from "./docs/components/LoadingDocs";
import AlertDocs from "./docs/components/AlertDocs";
import ConfirmDocs from "./docs/components/ConfirmDocs";
import ToastDocs from "./docs/components/ToastDocs";
import TooltipDocs from "./docs/components/TooltipDocs";
import BadgeDocs from "./docs/components/BadgeDocs";
import StatDocs from "./docs/components/StatDocs";
import SkeletonDocs from "./docs/components/SkeletonDocs";
import EmptyDocs from "./docs/components/EmptyDocs";
import CardDocs from "./docs/components/CardDocs";
import TableDocs from "./docs/components/TableDocs";
import PaginationDocs from "./docs/components/PaginationDocs";
import TabDocs from "./docs/components/TabDocs";
import DrawerDocs from "./docs/components/DrawerDocs";
import ModalDocs from "./docs/components/ModalDocs";
import EasyEditorDocs from "./docs/components/EasyEditorDocs";
import EasyChartDocs from "./docs/components/EasyChartDocs";
import PdfViewerDocs from "./docs/components/PdfViewerDocs";
import { PAGE_CONFIG } from "./initData";
import LANG_KO from "./lang.ko";

/**
 * @description 컴포넌트 문서 허브를 렌더링하고 모바일 TOC 열림 상태를 제어
 * @param {Object} props
 * @param {Object} [props.initialDataObj]
 * @param {Object} [props.initialErrorObj]
 * @returns {JSX.Element} 문서 허브 화면
 */
const ComponentsView = ({
  initialDataObj = {},
  initialErrorObj = {},
}) => {

  /* 1. 상수 ======================================================================================================================= */

  // 없음

  /* 2. 데이터 ======================================================================================================================= */
  const ui = EasyObj({ mobileTocOpen: false });
  const uiRef = useRef(ui);
  uiRef.current = ui;
  const { mode: pageMode } = usePageData({
    pageConfig: PAGE_CONFIG,
    initialDataObj,
    initialErrorObj,
  });

  /* 3. UI ========================================================================================================================= */

  // 없음

  /* 4. 팝업 ======================================================================================================================= */

  // 없음

  /* 5. 기타 ======================================================================================================================= */

  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */

  // 없음

  /* 7. 함수 ======================================================================================================================= */

  // 없음

  /* 8. useEffect ================================================================================================================== */
  const isMobileTocOpen = Boolean(ui.mobileTocOpen);

  /**
   * @description 문서 화면 전역 ESC 키를 구독해 모바일 TOC 닫힘 동작 동기화
   * 처리 규칙: effect cleanup에서 keydown 리스너를 반드시 해제한다.
   */
  useEffect(() => {

    /**
     * @description ESC 키 입력 시 모바일 TOC를 닫아 오버레이를 해제
     * @param {KeyboardEvent} event
     * @returns {void}
     * @updated 2026-02-27
     */
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        uiRef.current.mobileTocOpen = false;
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  /**
   * @description 모바일 TOC 열림 상태에 맞춰 body 스크롤 잠금 동기화
   * 처리 규칙: 닫힘/언마운트 시 이전 overflow 값을 복원한다.
   */
  useEffect(() => {
    if (!isMobileTocOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileTocOpen]);

  /* 9. 내부 컴포넌트 ============================================================================================================== */

  // 없음

  /* 10. 렌더링 ==================================================================================================================== */
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-zinc-50/30" data-page-mode={pageMode}>
      <div className="fixed top-0 left-0 hidden h-screen w-64 overflow-auto border-r border-zinc-200/80 bg-white md:block">
        <div className="p-4">
          <TableOfContents />
        </div>
      </div>

      <div className="min-w-0 flex-1 md:ml-64">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200/80 bg-white/95 px-4 py-3 backdrop-blur-sm md:hidden">
          <span className="text-base font-semibold tracking-tight text-zinc-950">{LANG_KO.view.mobileTitle}</span>
          <button
            type="button"
            onClick={() => {
              ui.mobileTocOpen = true;
            }}
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            aria-label={LANG_KO.view.openTocAriaLabel}
          >
            {LANG_KO.view.openTocLabel}
          </button>
        </div>

        <div className="container mx-auto space-y-16 overflow-x-hidden px-4 py-6 md:px-8 md:py-8 [&_.grid>*]:min-w-0 [&_.grid]:min-w-0">
          <section className="overflow-hidden rounded-2xl bg-slate-950 px-5 py-7 text-white shadow-sm ring-1 ring-slate-900/10 md:px-8 md:py-9">
            <p className="text-xs font-semibold tracking-[0.18em] text-indigo-300">{LANG_KO.view.introEyebrow}</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{LANG_KO.view.introTitle}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base md:leading-7">{LANG_KO.view.introDescription}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-200">
              {[LANG_KO.view.introLiveLabel, LANG_KO.view.introCodeLabel, LANG_KO.view.introReviewLabel].map((label) => (
                <span key={label} className="rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">{label}</span>
              ))}
            </div>
          </section>
          <DataClassDocs />
          <ButtonDocs />
          <IconDocs />
          <InputDocs />
          <TextareaDocs />
          <SelectDocs />
          <CheckboxDocs />
          <CheckButtonDocs />
          <RadioboxDocs />
          <RadioButtonDocs />
          <SwitchDocs />
          <NumberInputDocs />
          <DateTimeDocs />
          <ComboboxDocs />
          <DropdownDocs />
          <LoadingDocs />
          <AlertDocs />
          <ConfirmDocs />
          <ToastDocs />
          <TooltipDocs />
          <BadgeDocs />
          <StatDocs />
          <SkeletonDocs />
          <EmptyDocs />
          <CardDocs />
          <TableDocs />
          <PaginationDocs />
          <TabDocs />
          <DrawerDocs />
          <ModalDocs />
          <EasyEditorDocs />
          <EasyChartDocs />
          <PdfViewerDocs />
        </div>
      </div>

      {ui.mobileTocOpen ? (
        <div className="fixed inset-0 z-30 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              ui.mobileTocOpen = false;
            }}
            aria-label={LANG_KO.view.closeTocAriaLabel}
          />
          <aside className="relative z-10 h-full w-72 max-w-[80vw] overflow-auto border-r border-zinc-200/80 bg-white p-4 shadow-xl ring-1 ring-zinc-950/5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-950">{LANG_KO.view.tocLabel}</span>
              <button
                type="button"
                onClick={() => {
                  ui.mobileTocOpen = false;
                }}
                className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
              >
                {LANG_KO.view.closeLabel}
              </button>
            </div>
            <TableOfContents />
          </aside>
        </div>
      ) : null}

      <TopButton />
    </div>
  );
};

export default ComponentsView;
