/**
 * 파일명: RadioButtonExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: RadioButton 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

/**
 * @description RadioButtonExamples 구성 데이터를 반환. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 입력값과 상태를 검증해 UI/데이터 흐름을 안전하게 유지한다.
 */
export const RadioButtonExamples = () => {
    const dataObj = Lib.EasyObj({
        selectedSize: '',
        selectedTheme: '',
        selectedLanguage: '',
    });

    const [controlledValue, setControlledValue] = useState('');

    const examples = [
        {
            component: (
                <div className="space-x-2">
                    <Lib.RadioButton
                        name="size"
                        value="small"
                        dataObj={dataObj}
                        dataKey="selectedSize"
                    >
                        Small
                    </Lib.RadioButton>
                    <Lib.RadioButton
                        name="size"
                        value="medium"
                        dataObj={dataObj}
                        dataKey="selectedSize"
                    >
                        Medium
                    </Lib.RadioButton>
                    <Lib.RadioButton
                        name="size"
                        value="large"
                        dataObj={dataObj}
                        dataKey="selectedSize"
                    >
                        Large
                    </Lib.RadioButton>
                </div>
            ),
            description: "기본 라디오버튼 (dataObj/dataKey 바인딩).",
            code: `<Lib.RadioButton
    name="size"
    value="small"
    dataObj={dataObj}
    dataKey="selectedSize"
>
    Small
</Lib.RadioButton>`
        },
        {
            component: (
                <div className="space-x-2">
                    <Lib.RadioButton
                        name="disabled"
                        value="disabled1"
                        disabled
                    >
                        비활성화 1
                    </Lib.RadioButton>
                    <Lib.RadioButton
                        name="disabled"
                        value="disabled2"
                        disabled
                        checked={true}
                    >
                        비활성화 2
                    </Lib.RadioButton>
                </div>
            ),
            description: "비활성화 상태",
            code: `<Lib.RadioButton
    name="disabled"
    value="disabled1"
    disabled
>
    비활성화 1
</Lib.RadioButton>`
        },
        {
            component: (
                <div className="space-x-2">
                    <Lib.RadioButton
                        name="theme"
                        value="light"
                        dataObj={dataObj}
                        dataKey="selectedTheme"
                        color="#FF6B6B"
                    >
                        라이트
                    </Lib.RadioButton>
                    <Lib.RadioButton
                        name="theme"
                        value="dark"
                        dataObj={dataObj}
                        dataKey="selectedTheme"
                        color="#4D96FF"
                    >
                        다크
                    </Lib.RadioButton>
                    <Lib.RadioButton
                        name="theme"
                        value="system"
                        dataObj={dataObj}
                        dataKey="selectedTheme"
                        color="#6BCB77"
                    >
                        시스템
                    </Lib.RadioButton>
                </div>
            ),
            description: "커스텀 색상",
            code: `<Lib.RadioButton
    name="theme"
    value="light"
    dataObj={dataObj}
    dataKey="selectedTheme"
    color="#FF6B6B"
>
    라이트
</Lib.RadioButton>`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="space-x-2">
                        <Lib.RadioButton
                            name="controlled"
                            value="kr"
                            checked={controlledValue === 'kr'}
                            onChange={(event) => setControlledValue(event.target.value)}
                        >
                            한국어
                        </Lib.RadioButton>
                        <Lib.RadioButton
                            name="controlled"
                            value="en"
                            checked={controlledValue === 'en'}
                            onChange={(event) => setControlledValue(event.target.value)}
                        >
                            English
                        </Lib.RadioButton>
                    </div>
                    <div className="text-sm text-gray-600">
                        선택된 언어: {controlledValue || '없음'}
                    </div>
                </div>
            ),
            description: "제어 컴포넌트 방식",
            code: `const [value, setValue] = useState('');

<Lib.RadioButton
    name="controlled"
    value="kr"
    checked={value === 'kr'}
    onChange={(event) => setValue(event.target.value)}
>
    한국어
</Lib.RadioButton>
<Lib.RadioButton
    name="controlled"
    value="en"
    checked={value === 'en'}
    onChange={(event) => setValue(event.target.value)}
>
    English
</Lib.RadioButton>`
        }
    ];

    return examples;
};
