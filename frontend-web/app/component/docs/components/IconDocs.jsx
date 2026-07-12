/**
 * 파일명: IconDocs.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: Icon 컴포넌트 문서
 */
import { iconExampleList } from '../examples/IconExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const iconPropList = [
    { name: 'icon', description: '세트 prefix와 아이콘 이름. 예: md:MdHome' },
    { name: 'size?', description: '아이콘 크기. 기본값 1em' },
    { name: 'color?', description: '직접 색상 지정' },
    { name: 'ariaLabel?', description: '의미 있는 아이콘의 우선 접근성 라벨' },
    { name: 'decorative?', description: '기본 true는 스크린리더에서 숨김. false면 role=img와 라벨을 제공' },
    { name: 'className?', description: 'Tailwind 색상/크기 클래스' },
];

const iconSetLinks = [{
    prefix: 'ai:',
    name: 'Ant Design Icons',
    url: 'https://react-icons.github.io/react-icons/icons/ai/'
}, {
    prefix: 'bi:',
    name: 'Box Icons',
    url: 'https://react-icons.github.io/react-icons/icons/bi/'
}, {
    prefix: 'bs:',
    name: 'Bootstrap Icons',
    url: 'https://react-icons.github.io/react-icons/icons/bs/'
}, {
    prefix: 'fi:',
    name: 'Feather Icons',
    url: 'https://react-icons.github.io/react-icons/icons/fi/'
}, {
    prefix: 'hi:',
    name: 'Heroicons',
    url: 'https://react-icons.github.io/react-icons/icons/hi/'
}, {
    prefix: 'io:',
    name: 'Ionicons',
    url: 'https://react-icons.github.io/react-icons/icons/io/'
}, {
    prefix: 'md:',
    name: 'Material Design Icons',
    url: 'https://react-icons.github.io/react-icons/icons/md/'
}, {
    prefix: 'ri:',
    name: 'Remix Icons',
    url: 'https://react-icons.github.io/react-icons/icons/ri/'
}];

const iconExampleSectionList = [
    {
        id: 'icon-basic',
        eyebrow: 'EXAMPLE 1',
        title: '아이콘 사용 패턴',
        summary: '기본 아이콘, 상태 색상, 접근성 라벨을 한 번에 확인합니다.',
        exampleList: iconExampleList,
    },
];

/**
 * @description Icon 문서 섹션을 구성하고 예제/아이콘셋 링크를 렌더링. 입력/출력 계약을 함께 명시
 * @returns {JSX.Element}
 */
const IconDocs = () => {
    return <DocSection id="icons" title="3. 아이콘 (Icon)" description={<div className="space-y-4 rounded-xl bg-slate-50/80 p-5 text-sm text-slate-700 ring-1 ring-slate-900/5">
                    <p>Icon 컴포넌트는 react-icons 세트를 하나의 API로 연결합니다. 장식 아이콘은 <code>decorative=true</code> 기본값으로 스크린리더에서 숨깁니다. 의미 있는 아이콘은 <code>decorative=false</code>로 설정하면 <code>role="img"</code>가 적용되며, 라벨은 <code>ariaLabel</code>을 우선 사용하고 없으면 <code>icon</code> 문자열을 대체 라벨로 사용합니다.</p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {iconPropList.map((propItem) => (
                            <div key={propItem.name} className="rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200/80">
                                <code className="text-xs font-semibold text-indigo-700">{propItem.name}</code>
                                <p className="mt-1 text-xs text-slate-500">{propItem.description}</p>
                            </div>
                        ))}
                    </div>
                    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/80">
                        <h4 className="text-sm font-semibold text-slate-900">사용 가능한 아이콘 세트</h4>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {iconSetLinks.map((set) => (
                                <a key={set.prefix} href={set.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200/80 transition-colors hover:bg-white hover:text-slate-950">
                                    <span>{set.name}</span>
                                    <code className="text-xs font-semibold text-indigo-700">{set.prefix}</code>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>}>
            <div className="space-y-8">
                {iconExampleSectionList.map((exampleSection) => (
                    <div key={exampleSection.id} id={exampleSection.id} className="scroll-mt-24 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
                        <div className="mb-4 flex flex-col gap-1">
                            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{exampleSection.eyebrow}</span>
                            <h3 className="text-lg font-semibold tracking-tight text-slate-950">{exampleSection.title}</h3>
                            <p className="text-sm text-slate-500">{exampleSection.summary}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50/80 p-5 ring-1 ring-slate-200/80">
                            <div className="grid gap-4 md:grid-cols-3">
                                {exampleSection.exampleList.map((example) => (
                                    <div key={example.exampleId} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
                                        {example.component}
                                        <p className="mt-3 text-sm text-slate-600">{example.description}</p>
                                        <div className="mt-3">
                                            <CodeBlock code={example.code} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </DocSection>;
};

export default IconDocs;
