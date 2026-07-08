/**
 * 파일명: IconExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Icon 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

/**
 * @description Icon 예제 계약을 정의. 입력/출력 계약을 함께 명시
 * @updated 2026-02-24
 * 처리 규칙: 예제 계약은 zero-arg provider 없이 모듈 export const로 직접 노출한다.
 */
export const iconExampleList = [{
  exampleId: 'material',
  component: <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/80">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                            <Lib.Icon icon="md:MdHome" size="22px" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-slate-900">홈 대시보드</div>
                            <div className="text-xs text-slate-500">md:MdHome</div>
                        </div>
                    </div>
                    <div className="flex items-end gap-4 text-slate-500">
                        <Lib.Icon icon="md:MdHome" size="16px" />
                        <Lib.Icon icon="md:MdHome" size="24px" />
                        <Lib.Icon icon="md:MdHome" size="32px" />
                        <Lib.Icon icon="md:MdHome" size="40px" />
                    </div>
                </div>,
  description: "Material 아이콘과 크기 변형",
  code: `// 기본 아이콘
<Lib.Icon icon="md:MdHome" size="24px" />

// 다양한 크기
<Lib.Icon icon="md:MdHome" size="16px" />  // 작은 크기
<Lib.Icon icon="md:MdHome" size="24px" />  // 기본 크기
<Lib.Icon icon="md:MdHome" size="32px" />  // 큰 크기
<Lib.Icon icon="md:MdHome" size="40px" />  // 더 큰 크기`
}, {
  exampleId: 'bootstrapColor',
  component: <div className="grid gap-2">
                    <div className="flex items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700 ring-1 ring-emerald-100">
                        <Lib.Icon icon="bs:BsCheckCircle" size="20px" />
                        <span className="text-sm font-medium">완료</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-amber-50 px-3 py-2 text-amber-800 ring-1 ring-amber-100">
                        <Lib.Icon icon="bs:BsExclamationCircle" size="20px" />
                        <span className="text-sm font-medium">주의</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-rose-50 px-3 py-2 text-rose-700 ring-1 ring-rose-100">
                        <Lib.Icon icon="bs:BsXCircle" size="20px" />
                        <span className="text-sm font-medium">실패</span>
                    </div>
                </div>,
  description: "상태 색상과 함께 쓰는 Bootstrap 아이콘",
  code: `// 색상이 있는 아이콘
<Lib.Icon icon="bs:BsCheckCircle" className="text-emerald-700" size="20px" />
<Lib.Icon icon="bs:BsExclamationCircle" className="text-amber-800" size="20px" />
<Lib.Icon icon="bs:BsXCircle" className="text-rose-700" size="20px" />`
}, {
  exampleId: 'social',
  component: <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-3 text-slate-100">
                        <Lib.Icon icon="fi:FiGithub" size="22px" ariaLabel="GitHub 저장소" decorative={false} />
                        <div>
                            <div className="text-sm font-semibold">GitHub 저장소</div>
                            <div className="text-xs text-slate-400">ariaLabel 제공</div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-white p-3 text-xs text-slate-500 ring-1 ring-slate-200/80">
                        의미 있는 아이콘은 <code>decorative={false}</code>와 <code>ariaLabel</code>을 함께 사용합니다.
                    </div>
                </div>,
  description: "접근성 라벨이 필요한 의미 있는 아이콘",
  code: `<Lib.Icon
  icon="fi:FiGithub"
  size="22px"
  ariaLabel="GitHub 저장소"
  decorative={false}
/>`
}];
