/**
 * 파일명: CheckboxExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Checkbox 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

/**
 * @description CheckboxExamples 구성 데이터를 반환한다.
 * @updated 2026-02-24
 */
export const CheckboxExamples = () => {
    const dataObj = Lib.EasyObj({
        basicCheckbox: false,
        termsAgreed: false,
        privacyAgreed: false,
        marketingAgreed: false,
    });

    // 제어 컴포넌트 예시를 위한 상태
    const [controlledCheck, setControlledCheck] = useState(false);

    const examples = [
        {
            component: <Lib.Checkbox
                label="기본 체크박스"
                dataObj={dataObj}
                dataKey="basicCheckbox"
            />,
            description: "기본 체크박스 (dataObj/dataKey 바인딩).",
            code: `<Lib.Checkbox
    label="기본 체크박스"
    dataObj={dataObj}
    dataKey="basicCheckbox"
/>`
        },
        {
            component: <Lib.Checkbox
                label="비활성화 체크박스"
                disabled
            />,
            description: "비활성화 상태",
            code: `<Lib.Checkbox
    label="비활성화 체크박스"
    disabled
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Lib.Checkbox
                        label="기본 색상 (Primary)"
                        dataObj={dataObj}
                        dataKey="primary"
                        color="primary"
                    />
                    <Lib.Checkbox
                        label="커스텀 빨간색"
                        dataObj={dataObj}
                        dataKey="red"
                        color="#FF0000"
                    />
                    <Lib.Checkbox
                        label="커스텀 초록색"
                        dataObj={dataObj}
                        dataKey="green"
                        color="rgb(34, 197, 94)"
                    />
                </div>
            ),
            description: "다양한 색상",
            code: `<Lib.Checkbox
    label="기본 색상 (Primary)"
    dataObj={dataObj}
    dataKey="primary"
    color="primary"
/>
<Lib.Checkbox
    label="커스텀 빨간색"
    dataObj={dataObj}
    dataKey="red"
    color="#FF0000"
/>
<Lib.Checkbox
    label="커스텀 초록색"
    dataObj={dataObj}
    dataKey="green"
    color="rgb(34, 197, 94)"
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Lib.Checkbox
                        label="제어 컴포넌트"
                        checked={controlledCheck}
                        onChange={(event) => setControlledCheck(event.target.checked)}
                    />
                    <div className="text-sm text-gray-600">
                        현재 상태: {controlledCheck ? '체크됨' : '체크 해제됨'}
                    </div>
                </div>
            ),
            description: "제어 컴포넌트 방식",
            code: `const [checked, setChecked] = useState(false);

<Lib.Checkbox
    label="제어 컴포넌트"
    checked={checked}
    onChange={(event) => setChecked(event.target.checked)}
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">약관 동의</h4>
                    <Lib.Checkbox
                        name="terms"
                        label="[필수] 서비스 이용약관 동의"
                        dataObj={dataObj}
                        dataKey="termsAgreed"
                    />
                    <Lib.Checkbox
                        name="privacy"
                        label="[필수] 개인정보 처리방침 동의"
                        dataObj={dataObj}
                        dataKey="privacyAgreed"
                    />
                    <Lib.Checkbox
                        name="marketing"
                        label="[선택] 마케팅 정보 수신 동의"
                        dataObj={dataObj}
                        dataKey="marketingAgreed"
                    />
                </div>
            ),
            description: "실제 사용 예시 (약관 동의)",
            code: `<Lib.Checkbox
    name="terms"
    label="[필수] 서비스 이용약관 동의"
    dataObj={dataObj}
    dataKey="termsAgreed"
/>
<Lib.Checkbox
    name="privacy"
    label="[필수] 개인정보 처리방침 동의"
    dataObj={dataObj}
    dataKey="privacyAgreed"
/>
<Lib.Checkbox
    name="marketing"
    label="[선택] 마케팅 정보 수신 동의"
    dataObj={dataObj}
    dataKey="marketingAgreed"
/>`
        }
    ];

    return examples;
}; 
