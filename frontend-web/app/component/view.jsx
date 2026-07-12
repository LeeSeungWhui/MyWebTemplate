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

const mobileTocFocusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * @description 모바일 화면에서 모달형 목차를 렌더링하고 포커스·스크롤 잠금을 관리
 * @param {Object} props
 * @param {() => void} props.onClose
 * @param {React.RefObject<HTMLButtonElement | null>} props.triggerRef
 * @returns {JSX.Element}
 */
export const MobileTableOfContents = ({ onClose, triggerRef }) => {
  const panelRef = useRef(null);
  const focusTimerRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const restoreFocusTarget = triggerRef?.current || document.activeElement;
    document.body.style.overflow = "hidden";

    focusTimerRef.current = setTimeout(() => {
      if (!panelRef.current) return;
      const focusables = Array.from(panelRef.current.querySelectorAll(mobileTocFocusableSelector));
      const focusTarget = focusables[0] || panelRef.current;
      try { focusTarget.focus(); } catch {}
    }, 0);

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      clearTimeout(focusTimerRef.current);
      focusTimerRef.current = null;
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
      if (restoreFocusTarget && typeof restoreFocusTarget.focus === "function") {
        try { restoreFocusTarget.focus(); } catch {}
      }
    };
  }, [onClose, triggerRef]);

  const handlePanelKeyDown = (event) => {
    if (event.key !== "Tab" || !panelRef.current) return;

    const focusables = Array.from(panelRef.current.querySelectorAll(mobileTocFocusableSelector));
    if (!focusables.length) {
      event.preventDefault();
      try { panelRef.current.focus(); } catch {}
      return;
    }

    const firstFocusable = focusables[0];
    const lastFocusable = focusables[focusables.length - 1];
    if (event.shiftKey && (document.activeElement === firstFocusable || document.activeElement === panelRef.current)) {
      event.preventDefault();
      try { lastFocusable.focus(); } catch {}
      return;
    }
    if (!event.shiftKey && document.activeElement === lastFocusable) {
      event.preventDefault();
      try { firstFocusable.focus(); } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-30 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label={LANG_KO.view.closeTocAriaLabel}
        tabIndex={-1}
      />
      <aside
        ref={panelRef}
        className="relative z-10 h-full w-72 max-w-[80vw] overflow-auto border-r border-zinc-200/80 bg-white p-4 shadow-xl ring-1 ring-zinc-950/5"
        role="dialog"
        aria-modal="true"
        aria-label={LANG_KO.view.tocLabel}
        tabIndex={-1}
        onKeyDown={handlePanelKeyDown}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-950">{LANG_KO.view.tocLabel}</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
          >
            {LANG_KO.view.closeLabel}
          </button>
        </div>
        <TableOfContents />
      </aside>
    </div>
  );
};

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
  const mobileTocTriggerRef = useRef(null);
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
            ref={mobileTocTriggerRef}
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

      {isMobileTocOpen ? (
        <MobileTableOfContents
          triggerRef={mobileTocTriggerRef}
          onClose={() => {
            ui.mobileTocOpen = false;
          }}
        />
      ) : null}

      <TopButton />
    </div>
  );
};

export default ComponentsView;
