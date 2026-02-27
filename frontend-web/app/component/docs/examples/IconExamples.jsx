/**
 * 파일명: IconExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Icon 컴포넌트 예제
 */
import * as Lib from '@/app/lib';

/**
 * @description IconExamples 구성 데이터를 반환한다.
 * @returns {Array<{ component: JSX.Element, code: string }>}
 * @updated 2026-02-24
 */
export const IconExamples = () => {
    const examples = [
        {
            component: (
                <div>
                    <div className="space-x-4 mb-2">
                        <Lib.Icon icon="md:MdHome" size="24px" />
                        <Lib.Icon icon="md:MdPerson" size="24px" />
                        <Lib.Icon icon="md:MdSettings" size="24px" />
                    </div>
                    <div className="space-x-4 text-gray-500 text-sm">
                        <Lib.Icon icon="md:MdHome" size="16px" />
                        <Lib.Icon icon="md:MdHome" size="24px" />
                        <Lib.Icon icon="md:MdHome" size="32px" />
                        <Lib.Icon icon="md:MdHome" size="48px" />
                    </div>
                </div>
            ),
            description: "기본 Material 아이콘과 크기 변형",
            code: `// 기본 아이콘
<Lib.Icon icon="md:MdHome" size="24px" />

// 다양한 크기
<Lib.Icon icon="md:MdHome" size="16px" />  // 작은 크기
<Lib.Icon icon="md:MdHome" size="24px" />  // 기본 크기
<Lib.Icon icon="md:MdHome" size="32px" />  // 큰 크기
<Lib.Icon icon="md:MdHome" size="48px" />  // 더 큰 크기`
        },
        {
            component: (
                <div>
                    <div className="space-x-4 mb-2">
                        <Lib.Icon icon="bs:BsCheckCircle" className="text-green-500" size="24px" />
                        <Lib.Icon icon="bs:BsExclamationCircle" className="text-yellow-500" size="24px" />
                        <Lib.Icon icon="bs:BsXCircle" className="text-red-500" size="24px" />
                    </div>
                    <div className="space-x-4">
                        <Lib.Icon icon="bs:BsCheckCircle" className="text-green-500" size="16px" />
                        <Lib.Icon icon="bs:BsCheckCircle" className="text-green-500" size="24px" />
                        <Lib.Icon icon="bs:BsCheckCircle" className="text-green-500" size="32px" />
                        <Lib.Icon icon="bs:BsCheckCircle" className="text-green-500" size="48px" />
                    </div>
                </div>
            ),
            description: "색상이 있는 Bootstrap 아이콘과 크기 변형",
            code: `// 색상이 있는 아이콘
<Lib.Icon icon="bs:BsCheckCircle" className="text-green-500" size="24px" />

// 다양한 크기
<Lib.Icon icon="bs:BsCheckCircle" className="text-green-500" size="16px" />
<Lib.Icon icon="bs:BsCheckCircle" className="text-green-500" size="24px" />
<Lib.Icon icon="bs:BsCheckCircle" className="text-green-500" size="32px" />
<Lib.Icon icon="bs:BsCheckCircle" className="text-green-500" size="48px" />`
        },
        {
            component: (
                <div>
                    <div className="space-x-4 mb-2">
                        <Lib.Icon icon="fi:FiGithub" size="24px" />
                        <Lib.Icon icon="fi:FiTwitter" size="24px" />
                        <Lib.Icon icon="fi:FiFacebook" size="24px" />
                    </div>
                    <div className="space-x-4">
                        <Lib.Icon icon="fi:FiGithub" size="16px" />
                        <Lib.Icon icon="fi:FiGithub" size="24px" />
                        <Lib.Icon icon="fi:FiGithub" size="32px" />
                        <Lib.Icon icon="fi:FiGithub" size="48px" />
                    </div>
                </div>
            ),
            description: "소셜 미디어 아이콘 (Feather)과 크기 변형",
            code: `// 소셜 미디어 아이콘
<Lib.Icon icon="fi:FiGithub" size="24px" />

// 다양한 크기
<Lib.Icon icon="fi:FiGithub" size="16px" />
<Lib.Icon icon="fi:FiGithub" size="24px" />
<Lib.Icon icon="fi:FiGithub" size="32px" />
<Lib.Icon icon="fi:FiGithub" size="48px" />`
        }
    ];

    return examples;
}; 
