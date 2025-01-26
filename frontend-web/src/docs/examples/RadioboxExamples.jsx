import * as Lib from '@/lib';

export const RadioboxExamples = () => {
    const dataObj = Lib.EasyObj({
        selectedJob: '',
        paymentMethod: '',
        customColorRadio: '',
    });

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
            description: "기본 라디오박스",
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
        }
    ];

    return examples;
}; 