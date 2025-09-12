/**
 * 파일명: InputDocs.jsx
 * 설명: Input 컴포넌트 문서
 */
import { InputExamples } from '../examples/InputExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const InputDocs = () => {
    const examples = InputExamples();  // 컴포넌트 실행

    return (
        <DocSection
            id="inputs"
            title="3. 입력 (Input)" description={
                <div>
                    <p>Input 컴포넌트는 dataObj와 dataKey를 통해 양방향 바인딩을 지원합니다.</p>
                    <p>주요 기능:</p>
                    <ul className="list-disc pl-5 mt-2">
                        <li>마스크 입력 지원 (전화번호, 사업자번호 등)</li>
                        <li>문자 필터링 (한글만, 영문/숫자만 등)</li>
                        <li>숫자 입력 시 자릿수 제한 (정수부, 소수부)</li>
                        <li>에러 상태 표시</li>
                        <li>IME 입력 지원 (한글, 일본어 등)</li>
                    </ul>
                    <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
                        <li><code>dataObj?/dataKey?</code>: 바운드 상태 객체와 키</li>
                        <li><code>value?/defaultValue?</code>: 제어/초기 값</li>
                        <li><code>type?</code>: HTML input 타입 (기본: 'text')</li>
                        <li><code>placeholder?</code>: 안내 문구</li>
                        <li><code>filter?</code>: 허용 문자 필터</li>
                        <li><code>mask?</code>: 입력 마스크 패턴</li>
                        <li><code>maxDigits?/maxDecimals?</code>: 숫자 자릿수 제한</li>
                        <li><code>prefix?/suffix?</code>: 입력 앞/뒤 표시 문자열</li>
                        <li><code>togglePassword?</code>: 비밀번호 토글 버튼</li>
                        <li><code>error?</code>: 에러 메시지</li>
                        <li><code>onChange?/onValueChange?</code>: 값 변경 콜백</li>
                        <li><code>className?</code>: 추가 Tailwind 클래스</li>
                    </ul>
                </div>
            }
        >
            <div id="input-basic" className="mb-8">
                <h3 className="text-lg font-medium mb-4">기본 입력</h3>
                <div className="mb-2 text-sm text-gray-600">
                    가장 기본적인 텍스트 입력과 이메일 입력 예시입니다.
                </div>
                <div className="grid grid-cols-3 gap-8">
                    {examples.slice(0, 2).map((example, index) => (
                        <div key={index}>
                            {example.component}
                            <div className="mt-2 text-sm text-gray-600">
                                {example.description}
                            </div>
                            <CodeBlock code={example.code} />
                        </div>
                    ))}
                </div>
            </div>

            <div id="input-mask" className="mb-8">
                <h3 className="text-lg font-medium mb-4">마스크 입력</h3>
                <div className="mb-2 text-sm text-gray-600">
                    전화번호, 사업자번호 등 형식이 정해진 입력에 사용됩니다.
                    마스크 패턴: # (숫자), A (대문자), a (소문자), ? (대소문자), * (모든문자)
                </div>
                <div className="grid grid-cols-3 gap-8">
                    {examples.slice(2, 4).map((example, index) => (
                        <div key={index}>
                            {example.component}
                            <div className="mt-2 text-sm text-gray-600">
                                {example.description}
                            </div>
                            <CodeBlock code={example.code} />
                        </div>
                    ))}
                </div>
            </div>

            <div id="input-filter" className="mb-8">
                <h3 className="text-lg font-medium mb-4">필터 입력</h3>
                <div className="mb-2 text-sm text-gray-600">
                    특정 문자만 입력 가능하도록 필터링합니다.
                    한글, 영문, 숫자 등 원하는 문자셋을 지정할 수 있습니다.
                </div>
                <div className="grid grid-cols-3 gap-8">
                    {examples.slice(4).map((example, index) => (
                        <div key={index}>
                            {example.component}
                            <div className="mt-2 text-sm text-gray-600">
                                {example.description}
                            </div>
                            <CodeBlock code={example.code} />
                        </div>
                    ))}
                </div>
            </div>

            <div id="input-advanced" className="mb-8">
                <h3 className="text-lg font-medium mb-4">고급 기능</h3>
                <div className="mb-2 text-sm text-gray-600">
                    접두어/접미어, 아이콘, 비밀번호 토글 등 고급 기능을 제공합니다.
                </div>
                {/* 고급 기능 예시들 */}
            </div>
        </DocSection>
    );
};

export default InputDocs; 
