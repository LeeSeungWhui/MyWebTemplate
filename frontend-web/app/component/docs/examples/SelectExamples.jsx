import * as Lib from '@/lib';

export const SelectExamples = () => {
    const dataList = Lib.EasyList([
        { id: 1, name: '??ª© 1' },
        { id: 2, name: '??ª© 2' },
        { id: 3, name: '??ª© 3' }
    ]);

    const examples = [
        {
            component: <Lib.Select
                dataList={dataList}
                valueKey="id"
                textKey="name"
            />,
            description: "ê¸°ë³¸ Select (EasyList ?¬ìš©)",
            code: `<Lib.Select
    dataList={dataList}  // EasyList([{ id: 1, name: '??ª© 1' }, ...])
    valueKey="id"
    textKey="name"
/>`
        },
        {
            component: <Lib.Select
                dataList={[
                    { id: '', name: 'ì§ì—…??? íƒ?˜ì„¸??, placeholder: true },
                    { id: 'dev', name: 'ê°œë°œ?? },
                    { id: 'designer', name: '?”ì?´ë„ˆ' },
                    { id: 'pm', name: 'ê¸°íš?? }
                ]}
                valueKey="id"
                textKey="name"
            />,
            description: "?Œë ˆ?´ìŠ¤?€???¬ìš©",
            code: `<Lib.Select
    dataList={[
        { id: '', name: 'ì§ì—…??? íƒ?˜ì„¸??, placeholder: true },
        { id: 'dev', name: 'ê°œë°œ?? },
        { id: 'designer', name: '?”ì?´ë„ˆ' },
        { id: 'pm', name: 'ê¸°íš?? }
    ]}
    valueKey="id"
    textKey="name"
/>`
        },
        {
            component: <Lib.Select
                dataList={[
                    { value: '', text: '? íƒ?˜ì„¸??, placeholder: true },
                    { value: '1', text: '?µì…˜ 1' },
                    { value: '2', text: '?µì…˜ 2' },
                    { value: '3', text: '?µì…˜ 3' }
                ]}
                disabled
            />,
            description: "ë¹„í™œ?±í™” ?íƒœ",
            code: `<Lib.Select
    dataList={[
        { value: '', text: '? íƒ?˜ì„¸??, placeholder: true },
        { value: '1', text: '?µì…˜ 1' },
        { value: '2', text: '?µì…˜ 2' },
        { value: '3', text: '?µì…˜ 3' }
    ]}
    disabled
/>`
        },
        {
            component: <Lib.Select
                dataList={[
                    { value: '', text: '? íƒ?˜ì„¸??, placeholder: true },
                    { value: '1', text: '?µì…˜ 1' },
                    { value: '2', text: '?µì…˜ 2' },
                    { value: '3', text: '?µì…˜ 3' }
                ]}
                error={true}
            />,
            description: "?ëŸ¬ ?íƒœ",
            code: `<Lib.Select
    dataList={[
        { value: '', text: '? íƒ?˜ì„¸??, placeholder: true },
        { value: '1', text: '?µì…˜ 1' },
        { value: '2', text: '?µì…˜ 2' },
        { value: '3', text: '?µì…˜ 3' }
    ]}
    error={true}
/>`
        }
    ];

    return examples;
}; 