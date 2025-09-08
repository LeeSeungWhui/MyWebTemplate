import * as Lib from '@/lib';

export const SelectExamples = () => {
    const dataList = Lib.EasyList([
        { id: 1, name: '??�� 1' },
        { id: 2, name: '??�� 2' },
        { id: 3, name: '??�� 3' }
    ]);

    const examples = [
        {
            component: <Lib.Select
                dataList={dataList}
                valueKey="id"
                textKey="name"
            />,
            description: "기본 Select (EasyList ?�용)",
            code: `<Lib.Select
    dataList={dataList}  // EasyList([{ id: 1, name: '??�� 1' }, ...])
    valueKey="id"
    textKey="name"
/>`
        },
        {
            component: <Lib.Select
                dataList={[
                    { id: '', name: '직업???�택?�세??, placeholder: true },
                    { id: 'dev', name: '개발?? },
                    { id: 'designer', name: '?�자?�너' },
                    { id: 'pm', name: '기획?? }
                ]}
                valueKey="id"
                textKey="name"
            />,
            description: "?�레?�스?�???�용",
            code: `<Lib.Select
    dataList={[
        { id: '', name: '직업???�택?�세??, placeholder: true },
        { id: 'dev', name: '개발?? },
        { id: 'designer', name: '?�자?�너' },
        { id: 'pm', name: '기획?? }
    ]}
    valueKey="id"
    textKey="name"
/>`
        },
        {
            component: <Lib.Select
                dataList={[
                    { value: '', text: '?�택?�세??, placeholder: true },
                    { value: '1', text: '?�션 1' },
                    { value: '2', text: '?�션 2' },
                    { value: '3', text: '?�션 3' }
                ]}
                disabled
            />,
            description: "비활?�화 ?�태",
            code: `<Lib.Select
    dataList={[
        { value: '', text: '?�택?�세??, placeholder: true },
        { value: '1', text: '?�션 1' },
        { value: '2', text: '?�션 2' },
        { value: '3', text: '?�션 3' }
    ]}
    disabled
/>`
        },
        {
            component: <Lib.Select
                dataList={[
                    { value: '', text: '?�택?�세??, placeholder: true },
                    { value: '1', text: '?�션 1' },
                    { value: '2', text: '?�션 2' },
                    { value: '3', text: '?�션 3' }
                ]}
                error={true}
            />,
            description: "?�러 ?�태",
            code: `<Lib.Select
    dataList={[
        { value: '', text: '?�택?�세??, placeholder: true },
        { value: '1', text: '?�션 1' },
        { value: '2', text: '?�션 2' },
        { value: '3', text: '?�션 3' }
    ]}
    error={true}
/>`
        }
    ];

    return examples;
}; 