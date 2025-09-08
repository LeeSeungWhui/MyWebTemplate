import * as Lib from '@/lib';

export const InputExamples = () => {
    const dataObj = Lib.EasyObj({
        searchKeyword: '',
        password: ''
    });

    const examples = [
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="basicInput"
                placeholder="?ìŠ¤?¸ë? ?…ë ¥?˜ì„¸??
            />,
            description: "ê¸°ë³¸ ?…ë ¥",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="basicInput"
    placeholder="?ìŠ¤?¸ë? ?…ë ¥?˜ì„¸??
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="email"
                type="email"
                placeholder="?´ë©”?¼ì„ ?…ë ¥?˜ì„¸??
            />,
            description: "?´ë©”???…ë ¥",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="email"
    type="email"
    placeholder="?´ë©”?¼ì„ ?…ë ¥?˜ì„¸??
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="phone"
                mask="###-####-####"
                placeholder="?„í™”ë²ˆí˜¸: 010-1234-5678"
            />,
            description: "?„í™”ë²ˆí˜¸ ë§ˆìŠ¤??,
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="phone"
    mask="###-####-####"
    placeholder="?„í™”ë²ˆí˜¸: 010-1234-5678"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="businessNo"
                mask="###-##-#####"
                placeholder="?¬ì—…?ë²ˆ?? 123-45-67890"
            />,
            description: "?¬ì—…?ë²ˆ??ë§ˆìŠ¤??,
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="businessNo"
    mask="###-##-#####"
    placeholder="?¬ì—…?ë²ˆ?? 123-45-67890"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="amount"
                type="number"
                maxDigits={10}
                maxDecimals={2}
                placeholder="?«ìë§??…ë ¥ (ìµœë? 10?ë¦¬, ?Œìˆ˜??2?ë¦¬)"
            />,
            description: "?«ì ?…ë ¥ (?ë¦¿???œí•œ)",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="amount"
    type="number"
    maxDigits={10}
    maxDecimals={2}
    placeholder="?«ìë§??…ë ¥ (ìµœë? 10?ë¦¬, ?Œìˆ˜??2?ë¦¬)"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="code"
                filter="A-Za-z0-9"
                placeholder="?ë¬¸ê³??«ìë§??…ë ¥"
            />,
            description: "?ë¬¸/?«ì ?„í„°",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="code"
    filter="A-Za-z0-9"
    placeholder="?ë¬¸ê³??«ìë§??…ë ¥"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="koreanName"
                filter="ê°€-??
                placeholder="?œê?ë§??…ë ¥"
            />,
            description: "?œê? ?„í„°",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="koreanName"
    filter="ê°€-??
    placeholder="?œê?ë§??…ë ¥"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="email"
                error="?´ë©”???•ì‹???¬ë°”ë¥´ì? ?ŠìŠµ?ˆë‹¤"
                placeholder="?ëŸ¬ ?íƒœ ?œì‹œ"
            />,
            description: "?ëŸ¬ ?íƒœ",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="email"
    error="?´ë©”???•ì‹???¬ë°”ë¥´ì? ?ŠìŠµ?ˆë‹¤"
    placeholder="?ëŸ¬ ?íƒœ ?œì‹œ"
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="price"
                type="number"
                maxDigits={10}
                className="text-right"
                placeholder="ê¸ˆì•¡ ?…ë ¥"
                suffix="??
            />,
            description: "ê¸ˆì•¡ ?…ë ¥ (?°ì¸¡ ?•ë ¬, ?¨ìœ„ ?œì‹œ)",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="price"
    type="number"
    maxDigits={10}
    className="text-right"
    placeholder="ê¸ˆì•¡ ?…ë ¥"
    suffix="??
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="searchKeyword"
                prefix={<Lib.Icon icon="ri:RiSearchLine" className="w-5 h-5 text-gray-400" />}
                placeholder="ê²€?‰ì–´ë¥??…ë ¥?˜ì„¸??
            />,
            description: "?„ì´ì½˜ì´ ?ˆëŠ” ê²€???…ë ¥",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="searchKeyword"
    prefix={<Lib.Icon icon="ri:RiSearchLine" className="w-5 h-5 text-gray-400" />}
    placeholder="ê²€?‰ì–´ë¥??…ë ¥?˜ì„¸??
/>`
        },
        {
            component: <Lib.Input
                dataObj={dataObj}
                dataKey="password"
                type="password"
                placeholder="ë¹„ë?ë²ˆí˜¸ ?…ë ¥"
                togglePassword={true}
            />,
            description: "ë¹„ë?ë²ˆí˜¸ ? ê? ê¸°ëŠ¥",
            code: `<Lib.Input
    dataObj={dataObj}
    dataKey="password"
    type="password"
    placeholder="ë¹„ë?ë²ˆí˜¸ ?…ë ¥"
    togglePassword={true}
/>`
        }
    ];

    return examples;
}; 