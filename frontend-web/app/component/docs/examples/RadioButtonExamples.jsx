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
            description: "Í∏∞Î≥∏ ?ºÎîî?§Î≤Ñ??,
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
                        ÎπÑÌôú?±Ìôî 1
                    </Lib.RadioButton>
                    <Lib.RadioButton
                        name="disabled"
                        value="disabled2"
                        disabled
                        checked={true}
                    >
                        ÎπÑÌôú?±Ìôî 2
                    </Lib.RadioButton>
                </div>
            ),
            description: "ÎπÑÌôú?±Ìôî ?ÅÌÉú",
            code: `<Lib.RadioButton
    name="disabled"
    value="disabled1"
    disabled
>
    ÎπÑÌôú?±Ìôî 1
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
                        ?ºÏù¥??
                    </Lib.RadioButton>
                    <Lib.RadioButton
                        name="theme"
                        value="dark"
                        dataObj={dataObj}
                        dataKey="selectedTheme"
                        color="#4D96FF"
                    >
                        ?§ÌÅ¨
                    </Lib.RadioButton>
                    <Lib.RadioButton
                        name="theme"
                        value="system"
                        dataObj={dataObj}
                        dataKey="selectedTheme"
                        color="#6BCB77"
                    >
                        ?úÏä§??
                    </Lib.RadioButton>
                </div>
            ),
            description: "Ïª§Ïä§?Ä ?âÏÉÅ",
            code: `<Lib.RadioButton
    name="theme"
    value="light"
    dataObj={dataObj}
    dataKey="selectedTheme"
    color="#FF6B6B"
>
    ?ºÏù¥??
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
                            ?úÍµ≠??
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
                        ?†ÌÉù???∏Ïñ¥: {controlledValue || '?ÜÏùå'}
                    </div>
                </div>
            ),
            description: "?úÏñ¥ Ïª¥Ìè¨?åÌä∏ Î∞©Ïãù",
            code: `const [value, setValue] = useState('');

<Lib.RadioButton
    name="controlled"
    value="kr"
    checked={value === 'kr'}
    onChange={(e) => setValue(e.target.value)}
>
    ?úÍµ≠??
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