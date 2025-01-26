import * as Lib from '@/lib';

export const RadioButtonExamples = () => {
    const dataObj = Lib.EasyObj({
        selectedSize: '',
        selectedTheme: '',
        selectedLanguage: '',
    });

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
            description: "기본 라디오버튼",
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
        }
    ];

    return examples;
}; 