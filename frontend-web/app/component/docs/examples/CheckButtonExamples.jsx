/**
 * 파일명: CheckButtonExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: CheckButton 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

export const CheckButtonExamples = () => {
    const dataObj = Lib.EasyObj({
        basicCheckButton: false,
        redButton: false,
        greenButton: false,
        blueButton: false,
        checked: false,
    });

    const [controlledCheck, setControlledCheck] = useState(false);

    const examples = [
        {
            component: <Lib.CheckButton
                dataObj={dataObj}
                dataKey="basicCheckButton"
            >
                기본 체크버튼
            </Lib.CheckButton>,
            description: "기본 체크버튼 (토글 시 dataObj.checked 플래그도 기록).",
            code: `<Lib.CheckButton
    dataObj={dataObj}
    dataKey="basicCheckButton"
>
    기본 체크버튼
</Lib.CheckButton>`
        },
        {
            component: <Lib.CheckButton disabled>
                비활성화 체크버튼
            </Lib.CheckButton>,
            description: "비활성화 상태",
            code: `<Lib.CheckButton disabled>
    비활성화 체크버튼
</Lib.CheckButton>`
        },
        {
            component: (
                <div className="space-x-2">
                    <Lib.CheckButton
                        color="#FF0000"
                        dataObj={dataObj}
                        dataKey="redButton"
                    >
                        빨간색
                    </Lib.CheckButton>
                    <Lib.CheckButton
                        color="#4CAF50"
                        dataObj={dataObj}
                        dataKey="greenButton"
                    >
                        초록색
                    </Lib.CheckButton>
                    <Lib.CheckButton
                        color="#2196F3"
                        dataObj={dataObj}
                        dataKey="blueButton"
                    >
                        파란색
                    </Lib.CheckButton>
                </div>
            ),
            description: "다양한 색상",
            code: `<Lib.CheckButton color="#FF0000" dataObj={dataObj} dataKey="redButton">
    빨간색
</Lib.CheckButton>
<Lib.CheckButton color="#4CAF50" dataObj={dataObj} dataKey="greenButton">
    초록색
</Lib.CheckButton>
<Lib.CheckButton color="#2196F3" dataObj={dataObj} dataKey="blueButton">
    파란색
</Lib.CheckButton>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Lib.CheckButton
                        checked={controlledCheck}
                        onChange={() => setControlledCheck(!controlledCheck)}
                    >
                        제어 컴포넌트
                    </Lib.CheckButton>
                    <div className="text-sm text-gray-600">
                        현재 상태: {controlledCheck ? '활성화' : '비활성화'}
                    </div>
                </div>
            ),
            description: "제어 컴포넌트 방식",
            code: `const [checked, setChecked] = useState(false);

<Lib.CheckButton
    checked={checked}
    onChange={() => setChecked(!checked)}
>
    제어 컴포넌트
</Lib.CheckButton>`
        }
    ];

    return examples;
};
