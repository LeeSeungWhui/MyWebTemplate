import * as Lib from '@/lib';

export const CheckboxExamples = () => {
    const dataObj = Lib.EasyObj({
        basicCheckbox: false,
        termsAgreed: false,
        privacyAgreed: false,
        marketingAgreed: false,
    });

    const examples = [
        {
            component: <Lib.Checkbox
                label="기본 체크박스"
                dataObj={dataObj}
                dataKey="basicCheckbox"
            />,
            description: "기본 체크박스",
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
                        color="primary"
                    />
                    <Lib.Checkbox
                        label="커스텀 빨간색"
                        color="#FF0000"
                        checked={true}
                    />
                    <Lib.Checkbox
                        label="커스텀 초록색"
                        color="rgb(34, 197, 94)"
                        checked={true}
                    />
                </div>
            ),
            description: "다양한 색상",
            code: `<Lib.Checkbox label="기본 색상 (Primary)" color="primary" />
<Lib.Checkbox label="커스텀 빨간색" color="#FF0000" checked={true} />
<Lib.Checkbox label="커스텀 초록색" color="rgb(34, 197, 94)" checked={true} />`
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