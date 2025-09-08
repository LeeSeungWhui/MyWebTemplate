import * as Lib from '@/lib';

export const InputExamples = () => {
    const dataObj = Lib.EasyObj({
        searchKeyword: '',
        password: ''
    });

    const examples = [
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="basicInput"
                placeholder="?�스?��? ?�력?�세??
            />,
            description: "기본 ?�력",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="basicInput"
    placeholder="?�스?��? ?�력?�세??
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="email"
                type="email"
                placeholder="?�메?�을 ?�력?�세??
            />,
            description: "?�메???�력",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="email"
    type="email"
    placeholder="?�메?�을 ?�력?�세??
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="phone"
                mask="###-####-####"
                placeholder="?�화번호: 010-1234-5678"
            />,
            description: "?�화번호 마스??,
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="phone"
    mask="###-####-####"
    placeholder="?�화번호: 010-1234-5678"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="businessNo"
                mask="###-##-#####"
                placeholder="?�업?�번?? 123-45-67890"
            />,
            description: "?�업?�번??마스??,
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="businessNo"
    mask="###-##-#####"
    placeholder="?�업?�번?? 123-45-67890"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="amount"
                type="number"
                maxDigits={10}
                maxDecimals={2}
                placeholder="?�자�??�력 (최�? 10?�리, ?�수??2?�리)"
            />,
            description: "?�자 ?�력 (?�릿???�한)",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="amount"
    type="number"
    maxDigits={10}
    maxDecimals={2}
    placeholder="?�자�??�력 (최�? 10?�리, ?�수??2?�리)"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="code"
                filter="A-Za-z0-9"
                placeholder="?�문�??�자�??�력"
            />,
            description: "?�문/?�자 ?�터",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="code"
    filter="A-Za-z0-9"
    placeholder="?�문�??�자�??�력"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="koreanName"
                filter="가-??
                placeholder="?��?�??�력"
            />,
            description: "?��? ?�터",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="koreanName"
    filter="가-??
    placeholder="?��?�??�력"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="email"
                error="?�메???�식???�바르�? ?�습?�다"
                placeholder="?�러 ?�태 ?�시"
            />,
            description: "?�러 ?�태",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="email"
    error="?�메???�식???�바르�? ?�습?�다"
    placeholder="?�러 ?�태 ?�시"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="price"
                type="number"
                maxDigits={10}
                className="text-right"
                placeholder="금액 ?�력"
                suffix="??
            />,
            description: "금액 ?�력 (?�측 ?�렬, ?�위 ?�시)",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="price"
    type="number"
    maxDigits={10}
    className="text-right"
    placeholder="금액 ?�력"
    suffix="??
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="searchKeyword"
                prefix={<Lib.Icon icon="ri:RiSearchLine" className="w-5 h-5 text-gray-400" />}
                placeholder="검?�어�??�력?�세??
            />,
            description: "?�이콘이 ?�는 검???�력",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="searchKeyword"
    prefix={<Lib.Icon icon="ri:RiSearchLine" className="w-5 h-5 text-gray-400" />}
    placeholder="검?�어�??�력?�세??
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="password"
                type="password"
                placeholder="비�?번호 ?�력"
                togglePassword={true}
            />,
            description: "비�?번호 ?��? 기능",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="password"
    type="password"
    placeholder="비�?번호 ?�력"
    togglePassword={true}
/>`
        }
    ];

    return examples;
}; 