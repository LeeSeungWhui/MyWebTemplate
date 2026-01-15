/**
 * 파일명: page.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 컴포넌트 문서 페이지
 */
"use client"

import TableOfContents from './docs/shared/TableOfContents'
import TopButton from './docs/shared/TopButton'
import DataClassDocs from './docs/components/DataClassDocs'
import ButtonDocs from './docs/components/ButtonDocs'
import IconDocs from './docs/components/IconDocs'
import InputDocs from './docs/components/InputDocs'
import TextareaDocs from './docs/components/TextareaDocs'
import SelectDocs from './docs/components/SelectDocs'
import CheckboxDocs from './docs/components/CheckboxDocs'
import CheckButtonDocs from './docs/components/CheckButtonDocs'
import RadioboxDocs from './docs/components/RadioboxDocs'
import RadioButtonDocs from './docs/components/RadioButtonDocs'
import SwitchDocs from './docs/components/SwitchDocs'
import NumberInputDocs from './docs/components/NumberInputDocs'
import DateTimeDocs from './docs/components/DateTimeDocs'
import ComboboxDocs from './docs/components/ComboboxDocs'
import DropdownDocs from './docs/components/DropdownDocs'
import LoadingDocs from './docs/components/LoadingDocs'
import AlertDocs from './docs/components/AlertDocs'
import ConfirmDocs from './docs/components/ConfirmDocs'
import ToastDocs from './docs/components/ToastDocs'
import TooltipDocs from './docs/components/TooltipDocs'
import BadgeDocs from './docs/components/BadgeDocs'
import StatDocs from './docs/components/StatDocs'
import SkeletonDocs from './docs/components/SkeletonDocs'
import EmptyDocs from './docs/components/EmptyDocs'
import CardDocs from './docs/components/CardDocs'
import TableDocs from './docs/components/TableDocs'
import PaginationDocs from './docs/components/PaginationDocs'
import TabDocs from './docs/components/TabDocs'
import DrawerDocs from './docs/components/DrawerDocs'
import ModalDocs from './docs/components/ModalDocs'
import EasyEditorDocs from './docs/components/EasyEditorDocs'
import EasyChartDocs from './docs/components/EasyChartDocs'
import PdfViewerDocs from './docs/components/PdfViewerDocs'

/**
 * 컴포넌트 문서 페이지
 * @date 2025-09-13
 */
const ComponentsPage = () => {
  return (
    <div className="flex">
      {/* Left sidebar (TOC) */}
      <div className="fixed top-0 left-0 w-64 h-screen overflow-auto border-r border-gray-200 bg-white">
        <div className="p-4">
          <TableOfContents />
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64 flex-1">
        <div className="container mx-auto px-8 py-8 space-y-16">
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
          <IconDocs />
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

      <TopButton />
    </div>
  )
}

export default ComponentsPage
