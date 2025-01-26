import * as Lib from '@/lib';

export const CheckButtonExamples = () => {
    const dataObj = Lib.EasyObj({
        basicCheckButton: false,
        redButton: false,
        greenButton: false,
        blueButton: false,
    });

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
        }
    ];

    return examples;
}; 