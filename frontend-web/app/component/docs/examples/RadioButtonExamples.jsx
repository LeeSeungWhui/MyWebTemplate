import * as Lib from '@/lib';
import { useState } from 'react';

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
            description: "기본 ?�디?�버??,
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
                        비활?�화 1
                    </Lib.RadioButton>
                    <Lib.RadioButton
                        name="disabled"
                        value="disabled2"
                        disabled
                        checked={true}
                    >
                        비활?�화 2
                    </Lib.RadioButton>
                </div>
            ),
            description: "비활?�화 ?�태",
            code: `<Lib.RadioButton
    name="disabled"
    value="disabled1"
    disabled
>
    비활?�화 1
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
                        ?�이??
                    </Lib.RadioButton>
                    <Lib.RadioButton
                        name="theme"
                        value="dark"
                        dataObj={dataObj}
                        dataKey="selectedTheme"
                        color="#4D96FF"
                    >
                        ?�크
                    </Lib.RadioButton>
                    <Lib.RadioButton
                        name="theme"
                        value="system"
                        dataObj={dataObj}
                        dataKey="selectedTheme"
                        color="#6BCB77"
                    >
                        ?�스??
                    </Lib.RadioButton>
                </div>
            ),
            description: "커스?� ?�상",
            code: `<Lib.RadioButton
    name="theme"
    value="light"
    dataObj={dataObj}
    dataKey="selectedTheme"
    color="#FF6B6B"
>
    ?�이??
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
                            onChange={(e) => setControlledValue(e.target.value)}
                        >
                            ?�국??
                        </Lib.RadioButton>
                        <Lib.RadioButton
                            name="controlled"
                            value="en"
                            checked={controlledValue === 'en'}
                            onChange={(e) => setControlledValue(e.target.value)}
                        >
                            English
                        </Lib.RadioButton>
                    </div>
                    <div className="text-sm text-gray-600">
                        ?�택???�어: {controlledValue || '?�음'}
                    </div>
                </div>
            ),
            description: "?�어 컴포?�트 방식",
            code: `const [value, setValue] = useState('');

<Lib.RadioButton
    name="controlled"
    value="kr"
    checked={value === 'kr'}
    onChange={(e) => setValue(e.target.value)}
>
    ?�국??
</Lib.RadioButton>
<Lib.RadioButton
    name="controlled"
    value="en"
    checked={value === 'en'}
    onChange={(e) => setValue(e.target.value)}
>
    English
</Lib.RadioButton>`
        }
    ];

    return examples;
}; 