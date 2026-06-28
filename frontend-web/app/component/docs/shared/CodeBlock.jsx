/**
 * 파일명: CodeBlock.jsx
 * 작성자: LSH
 * 갱신일: 2026-05-31
 * 설명: 코드 블록 렌더러
 */
import { useEffect, useRef, useState } from 'react';
import Icon from '../../../lib/component/Icon';
import LANG_KO from "../../lang.ko";

/**
 * @description 예시 코드 문자열을 하이라이트 블록으로 보여주고 복사 버튼을 제공
 * @param {{ code: string, language?: string }} props
 * @returns {JSX.Element} 코드 블록 UI
 */
const CodeBlock = ({ code, language = 'jsx' }) => {

    const [copied, setCopied] = useState(false);
    const copyResetTimerRef = useRef(null);

    /**
     * @description 현재 코드 문자열을 클립보드에 복사하고 2초간 복사 완료 배지를 표시
     * @returns {void}
     * @updated 2026-02-27
     */
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        clearTimeout(copyResetTimerRef.current);
        copyResetTimerRef.current = setTimeout(() => setCopied(false), 2000);
    };

    /**
     * @description 코드 블록 해제 시 복사 배지 reset 타이머를 정리
     * 처리 규칙: unmount 뒤 copied 상태 업데이트를 방지한다.
     */
    useEffect(() => () => clearTimeout(copyResetTimerRef.current), []);

    return (
        <div className="group w-full min-w-0 overflow-hidden rounded-lg bg-zinc-950 ring-1 ring-zinc-800/80">
            <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/50 px-3 py-2">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {language}
                </span>
                <div className="flex items-center gap-2">
                    {copied && (
                        <div
                            role="status"
                            aria-live="polite"
                            className="rounded-md border border-emerald-800/60 bg-emerald-950/90 px-2 py-1 text-xs font-medium text-emerald-300 shadow-sm"
                        >
                            {LANG_KO.view.copyDoneLabel}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={handleCopy}
                        aria-label="코드 복사"
                        className="inline-flex items-center gap-1 rounded-md border border-zinc-700/80 bg-zinc-900/90 px-2 py-1 text-xs font-medium text-zinc-300 shadow-sm transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                    >
                        <Icon icon="ri:RiFileCopyLine" size="0.875em" aria-hidden="true" />
                    </button>
                </div>
            </div>
            <pre className="max-w-full overflow-x-auto p-4 text-xs font-mono leading-relaxed text-zinc-100">
                <code className={`language-${language}`}>
                    {code}
                </code>
            </pre>
        </div>
    );
};

export default CodeBlock;
