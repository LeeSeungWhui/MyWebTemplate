import * as Lib from '@/lib';
import { useState } from 'react';

export const CheckboxExamples = () => {
    const dataObj = Lib.EasyObj({
        basicCheckbox: false,
        termsAgreed: false,
        privacyAgreed: false,
        marketingAgreed: false,
    });

    // ?�어 컴포?�트 ?�시�??�한 ?�태
    const [controlledCheck, setControlledCheck] = useState(false);

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
                label="비활?�화 체크박스"
                disabled
            />,
            description: "비활?�화 ?�태",
            code: `<Lib.Checkbox
    label="비활?�화 체크박스"
    disabled
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Lib.Checkbox
                        label="기본 ?�상 (Primary)"
                        dataObj={dataObj}
                        dataKey="primary"
                        color="primary"
                    />
                    <Lib.Checkbox
                        label="커스?� 빨간??
                        dataObj={dataObj}
                        dataKey="red"
                        color="#FF0000"
                    />
                    <Lib.Checkbox
                        label="커스?� 초록??
                        dataObj={dataObj}
                        dataKey="green"
                        color="rgb(34, 197, 94)"
                    />
                </div>
            ),
            description: "?�양???�상",
            code: `<Lib.Checkbox
    label="기본 ?�상 (Primary)"
    dataObj={dataObj}
    dataKey="primary"
    color="primary"
/>
<Lib.Checkbox
    label="커스?� 빨간??
    dataObj={dataObj}
    dataKey="red"
    color="#FF0000"
/>
<Lib.Checkbox
    label="커스?� 초록??
    dataObj={dataObj}
    dataKey="green"
    color="rgb(34, 197, 94)"
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Lib.Checkbox
                        label="?�어 컴포?�트"
                        checked={controlledCheck}
                        onChange={(e) => setControlledCheck(e.target.checked)}
                    />
                    <div className="text-sm text-gray-600">
                        ?�재 ?�태: {controlledCheck ? '체크?? : '체크 ?�제??}
                    </div>
                </div>
            ),
            description: "?�어 컴포?�트 방식",
            code: `const [checked, setChecked] = useState(false);

<Lib.Checkbox
    label="?�어 컴포?�트"
    checked={checked}
    onChange={(e) => setChecked(e.target.checked)}
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">?��? ?�의</h4>
                    <Lib.Checkbox
                        name="terms"
                        label="[?�수] ?�비???�용?��? ?�의"
                        dataObj={dataObj}
                        dataKey="termsAgreed"
                    />
                    <Lib.Checkbox
                        name="privacy"
                        label="[?�수] 개인?�보 처리방침 ?�의"
                        dataObj={dataObj}
                        dataKey="privacyAgreed"
                    />
                    <Lib.Checkbox
                        name="marketing"
                        label="[?�택] 마�????�보 ?�신 ?�의"
                        dataObj={dataObj}
                        dataKey="marketingAgreed"
                    />
                </div>
            ),
            description: "?�제 ?�용 ?�시 (?��? ?�의)",
            code: `<Lib.Checkbox
    name="terms"
    label="[?�수] ?�비???�용?��? ?�의"
    dataObj={dataObj}
    dataKey="termsAgreed"
/>
<Lib.Checkbox
    name="privacy"
    label="[?�수] 개인?�보 처리방침 ?�의"
    dataObj={dataObj}
    dataKey="privacyAgreed"
/>
<Lib.Checkbox
    name="marketing"
    label="[?�택] 마�????�보 ?�신 ?�의"
    dataObj={dataObj}
    dataKey="marketingAgreed"
/>`
        }
    ];

    return examples;
}; 