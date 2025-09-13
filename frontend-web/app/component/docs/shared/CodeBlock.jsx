/**
 * 파일명: CodeBlock.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: 코드 블록 렌더러
 */
import { useState } from 'react';

const CodeBlock = ({ code, language = 'jsx' }) => {
    const [copied, setCopied] = useState(false);

    const handleCodeClick = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative">
            <pre
                className="bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                onClick={handleCodeClick}
            >
                <code className={`language-${language}`}>
                    {code}
                </code>
            </pre>
            {copied && (
                <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    복사됨!
                </div>
            )}
        </div>
    );
};

export default CodeBlock; 