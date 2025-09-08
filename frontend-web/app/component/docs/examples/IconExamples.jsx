import * as Lib from '@/lib';

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
            description: "기본 Material ?�이콘과 ?�기 변??,
            code: `// 기본 ?�이�?
<Lib.Icon icon="md:MdHome" size="24px" />

// ?�양???�기
<Lib.Icon icon="md:MdHome" size="16px" />  // ?��? ?�기
<Lib.Icon icon="md:MdHome" size="24px" />  // 기본 ?�기
<Lib.Icon icon="md:MdHome" size="32px" />  // ???�기
<Lib.Icon icon="md:MdHome" size="48px" />  // ?????�기`
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
            description: "?�상???�는 Bootstrap ?�이콘과 ?�기 변??,
            code: `// ?�상???�는 ?�이�?
<Lib.Icon icon="bs:BsCheckCircle" className="text-green-500" size="24px" />

// ?�양???�기
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
            description: "?�셜 미디???�이�?(Feather)�??�기 변??,
            code: `// ?�셜 미디???�이�?
<Lib.Icon icon="fi:FiGithub" size="24px" />

// ?�양???�기
<Lib.Icon icon="fi:FiGithub" size="16px" />
<Lib.Icon icon="fi:FiGithub" size="24px" />
<Lib.Icon icon="fi:FiGithub" size="32px" />
<Lib.Icon icon="fi:FiGithub" size="48px" />`
        }
    ];

    return examples;
}; 