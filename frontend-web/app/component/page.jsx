"use client"

import TableOfContents from './docs/shared/TableOfContents'
import TopButton from './docs/shared/TopButton'
import DataClassDocs from './docs/components/DataClassDocs'
import ButtonDocs from './docs/components/ButtonDocs'
import InputDocs from './docs/components/InputDocs'
import SelectDocs from './docs/components/SelectDocs'
import CheckboxDocs from './docs/components/CheckboxDocs'
import CheckButtonDocs from './docs/components/CheckButtonDocs'
import RadioboxDocs from './docs/components/RadioboxDocs'
import RadioButtonDocs from './docs/components/RadioButtonDocs'
import IconDocs from './docs/components/IconDocs'
import LoadingDocs from './docs/components/LoadingDocs'
import AlertDocs from './docs/components/AlertDocs'
import ConfirmDocs from './docs/components/ConfirmDocs'
import ToastDocs from './docs/components/ToastDocs'
import ModalDocs from './docs/components/ModalDocs'
import TabDocs from './docs/components/TabDocs'

export default function ComponentsPage() {
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
          <InputDocs />
          <SelectDocs />
          <CheckboxDocs />
          <CheckButtonDocs />
          <RadioboxDocs />
          <RadioButtonDocs />
          <IconDocs />
          <LoadingDocs />
          <AlertDocs />
          <ConfirmDocs />
          <ToastDocs />
          <ModalDocs />
          <TabDocs />
        </div>
      </div>

      <TopButton />
    </div>
  )
}

