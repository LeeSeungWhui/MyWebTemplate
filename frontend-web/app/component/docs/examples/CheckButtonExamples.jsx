import * as Lib from '@/lib';
import { useState } from 'react';

export const CheckButtonExamples = () => {
    const dataObj = Lib.EasyObj({
        basicCheckButton: false,
        redButton: false,
        greenButton: false,
        blueButton: false,
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
            description: "기본 체크버튼",
            code: `<Lib.CheckButton
    dataObj={dataObj}
    dataKey="basicCheckButton"
>
    기본 체크버튼
</Lib.CheckButton>`
        },
        {
            component: <Lib.CheckButton disabled>
                비활?�화 체크버튼
            </Lib.CheckButton>,
            description: "비활?�화 ?�태",
            code: `<Lib.CheckButton disabled>
    비활?�화 체크버튼
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
                        빨간??
                    </Lib.CheckButton>
                    <Lib.CheckButton
                        color="#4CAF50"
                        dataObj={dataObj}
                        dataKey="greenButton"
                    >
                        초록??
                    </Lib.CheckButton>
                    <Lib.CheckButton
                        color="#2196F3"
                        dataObj={dataObj}
                        dataKey="blueButton"
                    >
                        ?��???
                    </Lib.CheckButton>
                </div>
            ),
            description: "?�양???�상",
            code: `<Lib.CheckButton color="#FF0000" dataObj={dataObj} dataKey="redButton">
    빨간??
</Lib.CheckButton>
<Lib.CheckButton color="#4CAF50" dataObj={dataObj} dataKey="greenButton">
    초록??
</Lib.CheckButton>
<Lib.CheckButton color="#2196F3" dataObj={dataObj} dataKey="blueButton">
    ?��???
</Lib.CheckButton>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Lib.CheckButton
                        checked={controlledCheck}
                        onChange={() => setControlledCheck(!controlledCheck)}
                    >
                        ?�어 컴포?�트
                    </Lib.CheckButton>
                    <div className="text-sm text-gray-600">
                        ?�재 ?�태: {controlledCheck ? '?�성?? : '비활?�화'}
                    </div>
                </div>
            ),
            description: "?�어 컴포?�트 방식",
            code: `const [checked, setChecked] = useState(false);

<Lib.CheckButton
    checked={checked}
    onChange={() => setChecked(!checked)}
>
    ?�어 컴포?�트
</Lib.CheckButton>`
        }
    ];

    return examples;
}; 