import * as Lib from '@/lib';
import { AppContext } from '@/common/share/AppContext';
import { useState, useContext } from 'react';
import ButtonDocs from './docs/components/ButtonDocs';
import TableOfContents from './docs/shared/TableOfContents';
import InputDocs from './docs/components/InputDocs';
import SelectDocs from './docs/components/SelectDocs';
import CheckboxDocs from './docs/components/CheckboxDocs';
import CheckButtonDocs from './docs/components/CheckButtonDocs';
import RadioboxDocs from './docs/components/RadioboxDocs';
import RadioButtonDocs from './docs/components/RadioButtonDocs';
import IconDocs from './docs/components/IconDocs';
import LoadingDocs from './docs/components/LoadingDocs';
import AlertDocs from './docs/components/AlertDocs';
import ConfirmDocs from './docs/components/ConfirmDocs';
import ToastDocs from './docs/components/ToastDocs';
import ModalDocs from './docs/components/ModalDocs';
import TopButton from './docs/shared/TopButton';
import DataClassDocs from './docs/components/DataClassDocs';
// ... 다른 문서화 컴포넌트들 import

const Component = () => {

    return (
        <div className="flex">
            {/* 왼쪽 사이드바 (목차) - 고정 */}
            <div className="fixed top-0 left-0 w-70 h-screen overflow-auto border-r border-gray-200 bg-white">
                <div className="p-4">
                    <TableOfContents />
                </div>
            </div>

            {/* 오른쪽 메인 컨텐츠 */}
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
                </div>
            </div>

            <TopButton />
        </div>
    );
};

export default Component;