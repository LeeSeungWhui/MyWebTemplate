/**
 * 파일명: TabExamples.jsx
 * 작성자: LSH
 * 갱신일: 2026-07-07
 * 설명: Tab 컴포넌트 예제
 */
import * as Lib from '@/app/lib';
import { useState } from 'react';

/**
 * @description BasicTabDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const BasicTabDemo = () => {
  const tabDataObj = Lib.EasyObj({
    selectedTab: 0
  });

  return <Lib.Tab dataObj={tabDataObj} dataKey="selectedTab">
      <Lib.Tab.Item title="개요">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-indigo-50 px-3 py-2 ring-1 ring-indigo-100">
            <div className="text-xs font-semibold tracking-wide text-indigo-600">전체 업무</div>
            <div className="mt-1 text-lg font-semibold text-indigo-700">24</div>
          </div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100">
            <div className="text-xs font-semibold tracking-wide text-emerald-600">완료</div>
            <div className="mt-1 text-lg font-semibold text-emerald-700">18</div>
          </div>
          <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
            <div className="text-xs font-semibold tracking-wide text-slate-500">검토 중</div>
            <div className="mt-1 text-lg font-semibold text-slate-950">6</div>
          </div>
        </div>
      </Lib.Tab.Item>
      <Lib.Tab.Item title="활동">
        <div className="space-y-2">
          {['고객 문의 접수', '상담 일정 안내', '견적서 발송 완료'].map((textItem) => (
            <div key={textItem} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200/80">
              <span className="h-2 w-2 rounded-full bg-indigo-500" aria-hidden="true" />
              {textItem}
            </div>
          ))}
        </div>
      </Lib.Tab.Item>
      <Lib.Tab.Item title="메모">
        <div className="rounded-lg bg-slate-950 p-4 text-sm text-slate-200">
          탭 상태는 EasyObj에 저장되며, 같은 dataKey를 바라보는 다른 UI와도 상태를 맞출 수 있습니다.
        </div>
      </Lib.Tab.Item>
    </Lib.Tab>;
};

/**
 * @description CtrlTabDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const CtrlTabDemo = () => {
  const [activeTab, setActiveTab] = useState(0);

  return <div className="space-y-3">
      <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100" aria-live="polite">
        activeTab: {activeTab}
      </div>
      <Lib.Tab tabIndex={activeTab} onChange={setActiveTab}>
        <Lib.Tab.Item title="프로필">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900">사용자 프로필</h3>
            <p className="text-slate-600">tabIndex와 onChange를 직접 연결한 제어 탭 예시입니다.</p>
          </div>
        </Lib.Tab.Item>
        <Lib.Tab.Item title="설정">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900">알림 설정</h3>
            <p className="text-slate-600">외부 상태가 바뀌면 활성 탭과 보조 표시가 함께 동기화됩니다.</p>
          </div>
        </Lib.Tab.Item>
      </Lib.Tab>
    </div>;
};

/**
 * @description StyleTabDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const StyleTabDemo = () => {
  const tabDataObj = Lib.EasyObj({
    customTab: 0
  });

  return <Lib.Tab className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80" dataObj={tabDataObj} dataKey="customTab">
      <Lib.Tab.Item title="서비스">
        <div className="flex flex-wrap gap-2">
          <Lib.Badge variant="success" pill>서비스 정상</Lib.Badge>
          <Lib.Badge variant="primary" pill>응답 132ms</Lib.Badge>
          <Lib.Badge variant="neutral" pill>업데이트 09:16</Lib.Badge>
        </div>
      </Lib.Tab.Item>
      <Lib.Tab.Item title="고객 현황">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200/80">신규 문의 12건</div>
          <div className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200/80">상담 예정 5건</div>
        </div>
      </Lib.Tab.Item>
    </Lib.Tab>;
};

/**
 * @description UnderlineTabDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const UnderlineTabDemo = () => {
  const tabDataObj = Lib.EasyObj({
    underlineTab: 0
  });

  return <Lib.Tab variant="underline" dataObj={tabDataObj} dataKey="underlineTab">
      <Lib.Tab.Item title="요약">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
          밑줄형 탭은 밀도 높은 화면에서 콘텐츠 패널을 과하게 감싸지 않고 사용할 수 있습니다.
        </div>
      </Lib.Tab.Item>
      <Lib.Tab.Item title="상세">
        <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
          선택된 탭은 indigo 밑줄로 표시하고, 선택되지 않은 탭은 slate 계열의 마우스 반응으로 구분합니다.
        </div>
      </Lib.Tab.Item>
    </Lib.Tab>;
};

/**
 * @description IconTabDemo 렌더링용 demo 컴포넌트. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const IconTabDemo = () => {
  const tabDataObj = Lib.EasyObj({
    iconTab: 0
  });

  return <Lib.Tab dataObj={tabDataObj} dataKey="iconTab">
      <Lib.Tab.Item title={<div className="flex items-center gap-2">
            <Lib.Icon icon="md:MdHome" className="h-5 w-5" />
            <span>홈</span>
          </div>}>
        <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200/80">
          탭 제목에 아이콘과 텍스트를 함께 사용할 수 있습니다.
        </div>
      </Lib.Tab.Item>
      <Lib.Tab.Item title={<div className="flex items-center gap-2">
            <Lib.Icon icon="md:MdSettings" className="h-5 w-5" />
            <span>설정</span>
          </div>}>
        <div className="rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200/80">
          <code>title</code> prop에 JSX를 전달해 아이콘과 텍스트를 자유롭게 조합할 수 있습니다.
        </div>
      </Lib.Tab.Item>
    </Lib.Tab>;
};

export const basicExampleObj = {
  exampleId: 'basic',
  component: <BasicTabDemo />,
  description: 'EasyObj를 사용한 기본 분할형 탭',
  code: `const tabDataObj = Lib.EasyObj({
    selectedTab: 0
});

<Lib.Tab dataObj={tabDataObj} dataKey="selectedTab">...</Lib.Tab>`
};

export const controlExampleObj = {
  exampleId: 'controlled',
  component: <CtrlTabDemo />,
  description: 'tabIndex와 onChange를 외부 상태에 연결한 제어 예시',
  code: `const [activeTab, setActiveTab] = useState(0);

<Lib.Tab tabIndex={activeTab} onChange={setActiveTab}>...</Lib.Tab>`
};

export const underlineExampleObj = {
  exampleId: 'underline',
  component: <UnderlineTabDemo />,
  description: 'variant="underline" 밑줄 스타일을 prop으로 유지',
  code: `<Lib.Tab variant="underline" dataObj={tabDataObj} dataKey="underlineTab">...</Lib.Tab>`
};

export const styleExampleObj = {
  exampleId: 'style',
  component: <StyleTabDemo />,
  description: 'className으로 주변 배경을 조정한 사용자 정의 스타일',
  code: `<Lib.Tab
    className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80"
    dataObj={tabDataObj}
    dataKey="customTab"
>...</Lib.Tab>`
};

export const iconExampleObj = {
  exampleId: 'icon',
  component: <IconTabDemo />,
  description: '아이콘이 있는 탭',
  code: `<Lib.Tab dataObj={tabDataObj} dataKey="iconTab">...</Lib.Tab>`
};
