import * as Lib from '@/app/lib';

export const SelectExamples = () => {
    const dataList = Lib.EasyList([
        { id: 1, name: '항목 1' },
        { id: 2, name: '항목 2' },
        { id: 3, name: '항목 3' }
    ]);

    const examples = [
        {
            component: <Lib.Select
                dataList={dataList}
                valueKey="id"
                textKey="name"
            />,
            description: "기본 Select (EasyList 사용)",
            code: `<Lib.Select
    dataList={dataList}  // EasyList([{ id: 1, name: '항목 1' }, ...])
    valueKey="id"
    textKey="name"
/>`
        },
        {
            component: <Lib.Select
                dataList={[
                    { id: '', name: '직업을 선택하세요', placeholder: true },
                    { id: 'dev', name: '개발자' },
                    { id: 'designer', name: '디자이너' },
                    { id: 'pm', name: '기획자' }
                ]}
                valueKey="id"
                textKey="name"
            />,
            description: "플레이스홀더 사용",
            code: `<Lib.Select
    dataList={[
        { id: '', name: '직업을 선택하세요', placeholder: true },
        { id: 'dev', name: '개발자' },
        { id: 'designer', name: '디자이너' },
        { id: 'pm', name: '기획자' }
    ]}
    valueKey="id"
    textKey="name"
/>`
        },
        {
            component: <Lib.Select
                dataList={[
                    { value: '', text: '선택하세요', placeholder: true },
                    { value: '1', text: '옵션 1' },
                    { value: '2', text: '옵션 2' },
                    { value: '3', text: '옵션 3' }
                ]}
                disabled
            />,
            description: "비활성화 상태",
            code: `<Lib.Select
    dataList={[
        { value: '', text: '선택하세요', placeholder: true },
        { value: '1', text: '옵션 1' },
        { value: '2', text: '옵션 2' },
        { value: '3', text: '옵션 3' }
    ]}
    disabled
/>`
        },
        {
            component: <Lib.Select
                dataList={[
                    { value: '', text: '선택하세요', placeholder: true },
                    { value: '1', text: '옵션 1' },
                    { value: '2', text: '옵션 2' },
                    { value: '3', text: '옵션 3' }
                ]}
                error={true}
            />,
            description: "에러 상태",
            code: `<Lib.Select
    dataList={[
        { value: '', text: '선택하세요', placeholder: true },
        { value: '1', text: '옵션 1' },
        { value: '2', text: '옵션 2' },
        { value: '3', text: '옵션 3' }
    ]}
    error={true}
/>`
        }
    ];

    return examples;
}; 