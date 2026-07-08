/**
 * 파일명: DataClassExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: DataClass 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

/**
 * @description EasyObj 예제 컴포넌트를 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 * @updated 2026-02-27
 */
const EasyObjExample = () => {
  const dataObj = Lib.EasyObj({
    name: '김민준',
    role: 'Product Owner',
    score: 82,
    tags: ['온보딩', '우선순위'],
    address: {
      city: '서울',
      office: '강남 오피스'
    }
  });
  return <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">EasyObj state</span>
                <h4 className="text-base font-semibold text-slate-950">담당자 프로필</h4>
                <p className="text-sm text-slate-500">버튼을 눌러 중첩 객체와 배열 값을 직접 갱신합니다.</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <Lib.Button size="sm" onClick={() => {
        dataObj.score += 5;
      }}>
                    점수 +5
                </Lib.Button>
                <Lib.Button size="sm" variant="secondary" onClick={() => {
        dataObj.tags.push('리뷰 완료');
      }}>
                    태그 추가
                </Lib.Button>
                <Lib.Button size="sm" variant="outline" onClick={() => {
        dataObj.address.city = '부산';
      }}>
                    도시 변경
                </Lib.Button>
            </div>
            <pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 ring-1 ring-slate-800">
                {JSON.stringify(dataObj, null, 2)}
            </pre>
        </div>;
};

/**
 * @description EasyList 예제 컴포넌트를 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 * @updated 2026-02-27
 */
const EasyListExample = () => {
  const taskList = Lib.EasyList([{
    id: 1,
    text: '요구사항 정리',
    status: '진행중'
  }, {
    id: 2,
    text: 'QA 캡쳐 첨부',
    status: '대기'
  }]);
  return <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">EasyList state</span>
                <h4 className="text-base font-semibold text-slate-950">작업 큐</h4>
                <p className="text-sm text-slate-500">배열 메서드와 forAll로 항목을 조작합니다.</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <Lib.Button size="sm" onClick={() => taskList.push({
        id: taskList.length + 1,
        text: `추가 작업 ${taskList.length + 1}`,
        status: '신규'
      })}>
                    항목 추가
                </Lib.Button>
                <Lib.Button size="sm" variant="secondary" onClick={() => taskList.pop()}>
                    마지막 항목 제거
                </Lib.Button>
                <Lib.Button size="sm" variant="outline" onClick={() => taskList.forAll(taskItemObj => {
        taskItemObj.status = '완료';
      })}>
                    모든 항목 완료
                </Lib.Button>
            </div>
            <pre className="max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 ring-1 ring-slate-800">
                {JSON.stringify(taskList, null, 2)}
            </pre>
        </div>;
};

/**
 * @description DataClass 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 입력값과 상태를 검증해 UI/데이터 흐름을 안전하게 유지한다.
 */
export const easyObjExampleList = [{
  component: <EasyObjExample />,
  description: "EasyObj는 중첩 객체와 배열 값을 직접 수정해도 화면 상태가 함께 갱신됩니다.",
  code: `const dataObj = Lib.EasyObj({
    name: '김민준',
    score: 82,
    tags: ['온보딩', '우선순위'],
    address: {
        city: '서울',
        office: '강남 오피스'
    }
});

// 상태 변경 시 자동으로 리렌더링
dataObj.score += 5;
dataObj.tags.push('리뷰 완료');
dataObj.address.city = '부산';`
}];
export const easyListExampleList = [{
  component: <EasyListExample />,
  description: "EasyList는 배열 메서드와 forAll을 사용해 목록 항목을 한 번에 조작합니다.",
  code: `const taskList = Lib.EasyList([
    { id: 1, text: '요구사항 정리', status: '진행중' },
    { id: 2, text: 'QA 캡쳐 첨부', status: '대기' }
]);

// 배열 메서드 사용
taskList.push({ id: 3, text: '추가 작업 3', status: '신규' });
taskList.pop();

// forAll 메서드로 모든 항목 수정
taskList.forAll(item => {
    item.status = '완료';
});`
}];
