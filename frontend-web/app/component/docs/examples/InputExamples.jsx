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
                placeholder="텍스트 입력하세요"
            />,
            description: "기본 입력",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="basicInput"
    placeholder="텍스트 입력하세요"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="email"
                type="email"
                placeholder="이메일을 입력하세요"
            />,
            description: "이메일 입력",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="email"
    type="email"
    placeholder="이메일을 입력하세요"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="phone"
                mask="###-####-####"
                placeholder="전화번호: 010-1234-5678"
            />,
            description: "전화번호 마스킹",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="phone"
    mask="###-####-####"
    placeholder="전화번호: 010-1234-5678"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="businessNo"
                mask="###-##-#####"
                placeholder="사업자번호 123-45-67890"
            />,
            description: "사업자번호 마스킹",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="businessNo"
    mask="###-##-#####"
    placeholder="사업자번호 123-45-67890"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="amount"
                type="number"
                maxDigits={10}
                maxDecimals={2}
                placeholder="숫자 입력 (최대 10자리, 소수점2자리)"
            />,
            description: "숫자 입력 (자리수 제한)",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="amount"
    type="number"
    maxDigits={10}
    maxDecimals={2}
    placeholder="숫자 입력 (최대 10자리, 소수점2자리)"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="code"
                filter="A-Za-z0-9"
                placeholder="영문/숫자 입력"
            />,
            description: "영문/숫자 필터",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="code"
    filter="A-Za-z0-9"
    placeholder="영문/숫자 입력"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="koreanName"
                filter="가-힣"
                placeholder="한글 입력"
            />,
            description: "한글 필터",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="koreanName"
    filter="가-힣"
    placeholder="한글 입력"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="email"
                error="이메일 형식이 올바르지 않습니다"
                placeholder="에러 상태 표시"
            />,
            description: "에러 상태",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="email"
    error="이메일 형식이 올바르지 않습니다"
    placeholder="에러 상태 표시"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="price"
                type="number"
                maxDigits={10}
                className="text-right"
                placeholder="금액 입력"
                suffix="원"
            />,
            description: "금액 입력 (우측 정렬, 접미사 표시)",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="price"
    type="number"
    maxDigits={10}
    className="text-right"
    placeholder="금액 입력"
    suffix="원"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="searchKeyword"
                prefix={<Lib.Icon icon="ri:RiSearchLine" className="w-5 h-5 text-gray-400" />}
                placeholder="검색어를 입력하세요"
            />,
            description: "아이콘이 있는 검색 입력",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="searchKeyword"
    prefix={<Lib.Icon icon="ri:RiSearchLine" className="w-5 h-5 text-gray-400" />}
    placeholder="검색어를 입력하세요"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="password"
                type="password"
                placeholder="비밀번호 입력"
                togglePassword={true}
            />,
            description: "비밀번호 토글 기능",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="password"
    type="password"
    placeholder="비밀번호 입력"
    togglePassword={true}
/>`
        }
    ];

    return examples;
};

