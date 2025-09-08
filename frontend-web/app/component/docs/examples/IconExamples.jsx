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
            description: "Í∏∞Î≥∏ Material ?ÑÏù¥ÏΩòÍ≥º ?¨Í∏∞ Î≥Ä??,
            code: `// Í∏∞Î≥∏ ?ÑÏù¥ÏΩ?
<Lib.Icon icon="md:MdHome" size="24px" />

// ?§Ïñë???¨Í∏∞
<Lib.Icon icon="md:MdHome" size="16px" />  // ?ëÏ? ?¨Í∏∞
<Lib.Icon icon="md:MdHome" size="24px" />  // Í∏∞Î≥∏ ?¨Í∏∞
<Lib.Icon icon="md:MdHome" size="32px" />  // ???¨Í∏∞
<Lib.Icon icon="md:MdHome" size="48px" />  // ?????¨Í∏∞`
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
            description: "?âÏÉÅ???àÎäî Bootstrap ?ÑÏù¥ÏΩòÍ≥º ?¨Í∏∞ Î≥Ä??,
            code: `// ?âÏÉÅ???àÎäî ?ÑÏù¥ÏΩ?
<Lib.Icon icon="bs:BsCheckCircle" className="text-green-500" size="24px" />

// ?§Ïñë???¨Í∏∞
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
            description: "?åÏÖú ÎØ∏Îîî???ÑÏù¥ÏΩ?(Feather)Í≥??¨Í∏∞ Î≥Ä??,
            code: `// ?åÏÖú ÎØ∏Îîî???ÑÏù¥ÏΩ?
<Lib.Icon icon="fi:FiGithub" size="24px" />

// ?§Ïñë???¨Í∏∞
<Lib.Icon icon="fi:FiGithub" size="16px" />
<Lib.Icon icon="fi:FiGithub" size="24px" />
<Lib.Icon icon="fi:FiGithub" size="32px" />
<Lib.Icon icon="fi:FiGithub" size="48px" />`
        }
    ];

    return examples;
}; 