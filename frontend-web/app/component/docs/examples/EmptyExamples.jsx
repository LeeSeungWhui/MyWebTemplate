/**
 * 파일명: EmptyExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Empty 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

/**
 * @description Empty 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @returns { basicExampleList: Array, actionExampleList: Array }
 * @updated 2026-02-24
 */
export const basicExampleList = [{
  component: <div className="mx-auto max-w-xl">
          <Lib.Empty
            icon="ri:RiInboxArchiveLine"
            title="아직 등록된 항목이 없습니다"
            description="새 프로젝트를 만들거나 필터 조건을 조정하면 이 영역에 결과가 표시됩니다."
            className="border-slate-200 bg-white shadow-sm ring-slate-900/5"
          />
        </div>,
  description: '기본 Empty에 업무 맥락의 제목과 설명을 부여',
  code: `<Lib.Empty
  icon="ri:RiInboxArchiveLine"
  title="아직 등록된 항목이 없습니다"
  description="새 프로젝트를 만들거나 필터 조건을 조정하면 이 영역에 결과가 표시됩니다."
/>`
}];
export const actionExampleList = [{
  component: <div className="mx-auto max-w-2xl rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
          <Lib.Empty
            icon="md:MdSearchOff"
            title="조건에 맞는 결과가 없습니다"
            description="검색어를 줄이거나 상태 필터를 전체로 바꿔 다시 확인해 보세요."
            action={<div className="flex flex-wrap justify-center gap-2">
              <Lib.Button variant="outline" size="sm">필터 초기화</Lib.Button>
              <Lib.Button size="sm">새 항목 만들기</Lib.Button>
            </div>}
            className="border-slate-200 bg-slate-50/60 ring-slate-900/5"
          >
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Lib.Badge variant="outline" pill>검색어: design</Lib.Badge>
              <Lib.Badge variant="outline" pill>상태: 대기</Lib.Badge>
            </div>
          </Lib.Empty>
        </div>,
  description: '필터 결과 없음 상태에서 보조 정보와 액션을 함께 제공',
  code: `<Lib.Empty
  icon="md:MdSearchOff"
  title="조건에 맞는 결과가 없습니다"
  description="검색어를 줄이거나 상태 필터를 전체로 바꿔 다시 확인해 보세요."
  action={<Lib.Button size="sm">새 항목 만들기</Lib.Button>}
>
  <Lib.Badge variant="outline" pill>검색어: design</Lib.Badge>
</Lib.Empty>`
}];
