import * as Lib from '@/lib';
import { useState } from 'react';

export const RadioboxExamples = () => {
    const dataObj = Lib.EasyObj({
        selectedJob: '',
        paymentMethod: '',
        customColorRadio: '',
    });

    const [controlledValue, setControlledValue] = useState('');

    const examples = [
        {
            component: (
                <div className="space-y-2">
                    <Lib.Radiobox
                        name="job"
                        label="ê°œë°œ??
                        value="developer"
                        dataObj={dataObj}
                        dataKey="selectedJob"
                    />
                    <Lib.Radiobox
                        name="job"
                        label="?”ì?´ë„ˆ"
                        value="designer"
                        dataObj={dataObj}
                        dataKey="selectedJob"
                    />
                </div>
            ),
            description: "ê¸°ë³¸ ?¼ë””?¤ë°•??,
            code: `<Lib.Radiobox
    name="job"
    label="ê°œë°œ??
    value="developer"
    dataObj={dataObj}
    dataKey="selectedJob"
/>
<Lib.Radiobox
    name="job"
    label="?”ì?´ë„ˆ"
    value="designer"
    dataObj={dataObj}
    dataKey="selectedJob"
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Lib.Radiobox
                        name="disabled"
                        label="ë¹„í™œ?±í™” 1"
                        value="disabled1"
                        disabled
                    />
                    <Lib.Radiobox
                        name="disabled"
                        label="ë¹„í™œ?±í™” 2"
                        value="disabled2"
                        disabled
                        checked={true}
                    />
                </div>
            ),
            description: "ë¹„í™œ?±í™” ?íƒœ",
            code: `<Lib.Radiobox
    name="disabled"
    label="ë¹„í™œ?±í™” 1"
    value="disabled1"
    disabled
/>
<Lib.Radiobox
    name="disabled"
    label="ë¹„í™œ?±í™” 2"
    value="disabled2"
    disabled
    checked={true}
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">ê²°ì œ ?˜ë‹¨ ? íƒ</h4>
                    <Lib.Radiobox
                        name="payment"
                        label="? ìš©ì¹´ë“œ"
                        value="card"
                        dataObj={dataObj}
                        dataKey="paymentMethod"
                        color="#FF6B6B"
                    />
                    <Lib.Radiobox
                        name="payment"
                        label="ê³„ì¢Œ?´ì²´"
                        value="bank"
                        dataObj={dataObj}
                        dataKey="paymentMethod"
                        color="#4D96FF"
                    />
                    <Lib.Radiobox
                        name="payment"
                        label="?´ë???ê²°ì œ"
                        value="mobile"
                        dataObj={dataObj}
                        dataKey="paymentMethod"
                        color="#6BCB77"
                    />
                </div>
            ),
            description: "ì»¤ìŠ¤?€ ?‰ìƒ",
            code: `<Lib.Radiobox
    name="payment"
    label="? ìš©ì¹´ë“œ"
    value="card"
    dataObj={dataObj}
    dataKey="paymentMethod"
    color="#FF6B6B"
/>
<Lib.Radiobox
    name="payment"
    label="ê³„ì¢Œ?´ì²´"
    value="bank"
    dataObj={dataObj}
    dataKey="paymentMethod"
    color="#4D96FF"
/>
<Lib.Radiobox
    name="payment"
    label="?´ë???ê²°ì œ"
    value="mobile"
    dataObj={dataObj}
    dataKey="paymentMethod"
    color="#6BCB77"
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Lib.Radiobox
                        name="controlled"
                        label="?µì…˜ 1"
                        value="option1"
                        checked={controlledValue === 'option1'}
                        onChange={(e) => setControlledValue(e.target.value)}
                    />
                    <Lib.Radiobox
                        name="controlled"
                        label="?µì…˜ 2"
                        value="option2"
                        checked={controlledValue === 'option2'}
                        onChange={(e) => setControlledValue(e.target.value)}
                    />
                    <div className="text-sm text-gray-600">
                        ? íƒ??ê°? {controlledValue || '?†ìŒ'}
                    </div>
                </div>
            ),
            description: "?œì–´ ì»´í¬?ŒíŠ¸ ë°©ì‹",
            code: `const [value, setValue] = useState('');

<Lib.Radiobox
    name="controlled"
    label="?µì…˜ 1"
    value="option1"
    checked={value === 'option1'}
    onChange={(e) => setValue(e.target.value)}
/>
<Lib.Radiobox
    name="controlled"
    label="?µì…˜ 2"
    value="option2"
    checked={value === 'option2'}
    onChange={(e) => setValue(e.target.value)}
/>`
        }
    ];

    return examples;
}; 