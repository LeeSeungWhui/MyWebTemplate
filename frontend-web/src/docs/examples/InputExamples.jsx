import * as Lib from '@/lib';
import { useCallback } from 'react';

export const InputExamples = () => {
    const dataObj = Lib.EasyObj({
        basicInput: '',
        email: '',
        phone: '',
        businessNo: '',
        amount: '',
        code: '',
        koreanName: '',
        errors: {
            email: '',
        }
    });

    const examples = [
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="basicInput"
                placeholder="텍스트를 입력하세요"
            />,
            description: "기본 입력",
            code: '<Lib.Input dataObj={dataObj} dataKey="basicInput" placeholder="텍스트를 입력하세요" />'
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="email"
                type="email"
                placeholder="이메일을 입력하세요"
            />,
            description: "이메일 입력",
            code: '<Lib.Input dataObj={dataObj} dataKey="email" type="email" placeholder="이메일을 입력하세요" />'
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="phone"
                mask="###-####-####"
                placeholder="전화번호: 010-1234-5678"
            />,
            description: "전화번호 마스크",
            code: '<Lib.Input dataObj={dataObj} dataKey="phone" mask="###-####-####" placeholder="전화번호: 010-1234-5678" />'
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="businessNo"
                mask="###-##-#####"
                placeholder="사업자번호: 123-45-67890"
            />,
            description: "사업자번호 마스크",
            code: '<Lib.Input dataObj={dataObj} dataKey="businessNo" mask="###-##-#####" placeholder="사업자번호: 123-45-67890" />'
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="amount"
                type="number"
                maxDigits={10}
                maxDecimals={2}
                placeholder="숫자만 입력 (최대 10자리, 소수점 2자리)"
            />,
            description: "숫자 입력 (자릿수 제한)",
            code: '<Lib.Input dataObj={dataObj} dataKey="amount" type="number" maxDigits={10} maxDecimals={2} placeholder="숫자만 입력" />'
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="code"
                filter="A-Za-z0-9"
                placeholder="영문과 숫자만 입력"
            />,
            description: "영문/숫자 필터",
            code: '<Lib.Input dataObj={dataObj} dataKey="code" filter="A-Za-z0-9" placeholder="영문과 숫자만 입력" />'
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="koreanName"
                filter="가-힣"
                placeholder="한글만 입력"
            />,
            description: "한글 필터",
            code: '<Lib.Input dataObj={dataObj} dataKey="koreanName" filter="가-힣" placeholder="한글만 입력" />'
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="email"
                error="이메일 형식이 올바르지 않습니다"
                placeholder="에러 상태 표시"
            />,
            description: "에러 상태",
            code: '<Lib.Input dataObj={dataObj} dataKey="email" error="이메일 형식이 올바르지 않습니다" placeholder="에러 상태" />'
        }
    ];

    return examples;
}; 