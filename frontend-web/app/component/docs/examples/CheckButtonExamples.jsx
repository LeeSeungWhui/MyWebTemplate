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
                비활성화 체크버튼
            </Lib.CheckButton>,
            description: "비활성화 상태",
    비활성화 체크버튼
                        빨간색
                        초록색
                        파란색
            description: "다양한 색상",
    빨간색
    초록색
    파란색
                        제어 컴포넌트
                        현재 상태: {controlledCheck ? '활성화' : '비활성화'}
            description: "제어 컴포넌트 방식",
    제어 컴포넌트
            code: `<Lib.CheckButton disabled>
    ë¹„í™œ?±í™” ì²´í¬ë²„íŠ¼
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
                        ë¹¨ê°„??
                    </Lib.CheckButton>
                    <Lib.CheckButton
                        color="#4CAF50"
                        dataObj={dataObj}
                        dataKey="greenButton"
                    >
                        ì´ˆë¡??
                    </Lib.CheckButton>
                    <Lib.CheckButton
                        color="#2196F3"
                        dataObj={dataObj}
                        dataKey="blueButton"
                    >
                        ?Œë???
                    </Lib.CheckButton>
                </div>
            ),
            description: "?¤ì–‘???‰ìƒ",
            code: `<Lib.CheckButton color="#FF0000" dataObj={dataObj} dataKey="redButton">
    ë¹¨ê°„??
</Lib.CheckButton>
<Lib.CheckButton color="#4CAF50" dataObj={dataObj} dataKey="greenButton">
    ì´ˆë¡??
</Lib.CheckButton>
<Lib.CheckButton color="#2196F3" dataObj={dataObj} dataKey="blueButton">
    ?Œë???
</Lib.CheckButton>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Lib.CheckButton
                        checked={controlledCheck}
                        onChange={() => setControlledCheck(!controlledCheck)}
                    >
                        ?œì–´ ì»´í¬?ŒíŠ¸
                    </Lib.CheckButton>
                    <div className="text-sm text-gray-600">
                        ?„ìž¬ ?íƒœ: {controlledCheck ? '?œì„±?? : 'ë¹„í™œ?±í™”'}
                    </div>
                </div>
            ),
            description: "?œì–´ ì»´í¬?ŒíŠ¸ ë°©ì‹",
            code: `const [checked, setChecked] = useState(false);

<Lib.CheckButton
    checked={checked}
    onChange={() => setChecked(!checked)}
>
    ?œì–´ ì»´í¬?ŒíŠ¸
</Lib.CheckButton>`
        }
    ];

    return examples;
}; 