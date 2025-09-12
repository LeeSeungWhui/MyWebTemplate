/**
 * 파일명: PasswordDocs.jsx
 * 설명: Password 입력 문서 (Input 변형 가이드)
 */
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const PasswordDocs = () => {
  return (
    <DocSection id="passwords" title="31. 비밀번호 입력 (Password)" description={<p>Input 컴포넌트에 type="password"와 보이기/숨기기 토글 버튼(aria-pressed)을 더해 구현합니다.</p>}>
      <div id="password-basic" className="mb-8">
        <h3 className="text-lg font-medium mb-4">기본</h3>
        <div>
          <CodeBlock code={`<div className="relative">
  <input type="password" aria-label="비밀번호" className="input" />
  <button type="button" aria-pressed={show} aria-label="비밀번호 표시" className="absolute right-2 top-1/2 -translate-y-1/2">👁️</button>
</div>`} />
        </div>
      </div>
    </DocSection>
  );
};

export default PasswordDocs;

