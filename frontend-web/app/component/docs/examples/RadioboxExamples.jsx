/**
 * 파일명: RadioboxExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Radiobox 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

export const RadioboxExamples = () => {
    const dataObj = Lib.EasyObj({
        selectedJob: '',
        paymentMethod: '',
        customColorRadio: '',
        checked: false,
    });

    const [controlledValue, setControlledValue] = useState('');

    const examples = [
        {
            component: (
                <div className="space-y-2">
                    <Lib.Radiobox
                        name="job"
                        label="개발자"
                        value="developer"
                        dataObj={dataObj}
                        dataKey="selectedJob"
                    />
                    <Lib.Radiobox
                        name="job"
                        label="디자이너"
                        value="designer"
                        dataObj={dataObj}
                        dataKey="selectedJob"
                    />
                </div>
            ),
            description: "기본 라디오박스 (선택 시 dataObj.checked 플래그 기록).",
            code: `<Lib.Radiobox
    name="job"
    label="개발자"
    value="developer"
    dataObj={dataObj}
    dataKey="selectedJob"
/>
<Lib.Radiobox
    name="job"
    label="디자이너"
    value="designer"
    dataObj={dataObj}
    dataKey="selectedJob"
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Lib.Radiobox
                        name="disabled"
                        label="비활성화 1"
                        value="disabled1"
                        disabled
                    />
                    <Lib.Radiobox
                        name="disabled"
                        label="비활성화 2"
                        value="disabled2"
                        disabled
                        checked={true}
                    />
                </div>
            ),
            description: "비활성화 상태",
            code: `<Lib.Radiobox
    name="disabled"
    label="비활성화 1"
    value="disabled1"
    disabled
/>
<Lib.Radiobox
    name="disabled"
    label="비활성화 2"
    value="disabled2"
    disabled
    checked={true}
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">결제 수단 선택</h4>
                    <Lib.Radiobox
                        name="payment"
                        label="신용카드"
                        value="card"
                        dataObj={dataObj}
                        dataKey="paymentMethod"
                        color="#FF6B6B"
                    />
                    <Lib.Radiobox
                        name="payment"
                        label="계좌이체"
                        value="bank"
                        dataObj={dataObj}
                        dataKey="paymentMethod"
                        color="#4D96FF"
                    />
                    <Lib.Radiobox
                        name="payment"
                        label="휴대폰 결제"
                        value="mobile"
                        dataObj={dataObj}
                        dataKey="paymentMethod"
                        color="#6BCB77"
                    />
                </div>
            ),
            description: "커스텀 색상",
            code: `<Lib.Radiobox
    name="payment"
    label="신용카드"
    value="card"
    dataObj={dataObj}
    dataKey="paymentMethod"
    color="#FF6B6B"
/>
<Lib.Radiobox
    name="payment"
    label="계좌이체"
    value="bank"
    dataObj={dataObj}
    dataKey="paymentMethod"
    color="#4D96FF"
/>
<Lib.Radiobox
    name="payment"
    label="휴대폰 결제"
    value="mobile"
    dataObj={dataObj}
    dataKey="paymentMethod"
    color="#6BCB77"
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Lib.Radiobox
                        name="controlled"
                        label="옵션 1"
                        value="option1"
                        checked={controlledValue === 'option1'}
                        onChange={(e) => setControlledValue(e.target.value)}
                    />
                    <Lib.Radiobox
                        name="controlled"
                        label="옵션 2"
                        value="option2"
                        checked={controlledValue === 'option2'}
                        onChange={(e) => setControlledValue(e.target.value)}
                    />
                    <div className="text-sm text-gray-600">
                        선택된 값: {controlledValue || '없음'}
                    </div>
                </div>
            ),
            description: "제어 컴포넌트 방식",
            code: `const [value, setValue] = useState('');

<Lib.Radiobox
    name="controlled"
    label="옵션 1"
    value="option1"
    checked={value === 'option1'}
    onChange={(e) => setValue(e.target.value)}
/>
<Lib.Radiobox
    name="controlled"
    label="옵션 2"
    value="option2"
    checked={value === 'option2'}
    onChange={(e) => setValue(e.target.value)}
/>`
        }
    ];

    return examples;
}; 
