/**
 * 파일명: DataClassExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: DataClass 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

/**
 * @description DataClassExamples 구성 데이터를 반환한다.
 * @updated 2026-02-24
 */
export const DataClassExamples = () => {
    const examples = [
        {
            component: (() => {
                const data = Lib.EasyObj({
                    name: '홍길동',
                    age: 20,
                    hobbies: ['독서', '운동'],
                    address: {
                        city: '서울',
                        street: '강남대로'
                    }
                });

                return (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Lib.Button onClick={() => data.age += 1}>
                                나이 증가
                            </Lib.Button>
                            <Lib.Button onClick={() => data.hobbies.push('여행')}>
                                취미 추가
                            </Lib.Button>
                            <Lib.Button onClick={() => data.address.city = '부산'}>
                                도시 변경
                            </Lib.Button>
                        </div>
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                );
            })(),
            description: "EasyObj는 객체의 중첩된 속성까지 자동으로 상태를 관리합니다.",
            code: `const data = Lib.EasyObj({
    name: '홍길동',
    age: 20,
    hobbies: ['독서', '운동'],
    address: {
        city: '서울',
        street: '강남대로'
    }
});

// 상태 변경 시 자동으로 리렌더링
data.age += 1;
data.hobbies.push('여행');
data.address.city = '부산';`
        },
        {
            component: (() => {
                const list = Lib.EasyList([
                    { id: 1, text: '할 일 1' },
                    { id: 2, text: '할 일 2' }
                ]);

                return (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Lib.Button onClick={() => list.push({
                                id: list.length + 1,
                                text: `할 일 ${list.length + 1}`
                            })}>
                                항목 추가
                            </Lib.Button>
                            <Lib.Button onClick={() => list.pop()}>
                                마지막 항목 제거
                            </Lib.Button>
                            <Lib.Button onClick={() => list.forAll(item => {
                                item.text += ' (완료)';
                            })}>
                                모든 항목 완료
                            </Lib.Button>
                        </div>
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
                            {JSON.stringify(list, null, 2)}
                        </pre>
                    </div>
                );
            })(),
            description: "EasyList는 배열 메서드를 지원하며 각 항목의 상태도 자동으로 관리합니다.",
            code: `const list = Lib.EasyList([
    { id: 1, text: '할 일 1' },
    { id: 2, text: '할 일 2' }
]);

// 배열 메서드 사용
list.push({ id: 3, text: '할 일 3' });
list.pop();

// forAll 메서드로 모든 항목 수정
list.forAll(item => {
    item.text += ' (완료)';
});`
        }
    ];

    return examples;
}; 
