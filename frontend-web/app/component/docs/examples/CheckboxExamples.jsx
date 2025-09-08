import * as Lib from '@/lib';
import { useState } from 'react';

export const CheckboxExamples = () => {
    const dataObj = Lib.EasyObj({
        basicCheckbox: false,
        termsAgreed: false,
        privacyAgreed: false,
        marketingAgreed: false,
    });

    // 제어 컴포넌트 예시에 사용한 상태
    const [controlledCheck, setControlledCheck] = useState(false);

    const examples = [
        {
            component: <Lib.Checkbox
                label="비활성화 체크박스"
            description: "비활성화 상태",
    label="비활성화 체크박스"
                        label="기본 색상 (Primary)"
                        label="커스텀 빨간색"
                        label="커스텀 초록색"
            description: "다양한 색상",
    label="기본 색상 (Primary)"
    label="커스텀 빨간색"
    label="커스텀 초록색"
        },
        {
                        label="제어 컴포넌트"
                        현재 상태: {controlledCheck ? '체크됨' : '체크 해제됨'}
            description: "제어 컴포넌트 방식",
    label="제어 컴포넌트"
                    <h4 className="text-sm font-medium text-gray-700">약관 동의</h4>
                        label="[필수] 서비스 이용약관 동의"
                        label="[필수] 개인정보 처리방침 동의"
                        label="[선택] 마케팅 정보 수신 동의"
            description: "실제 적용 예시 (약관 동의)",
    label="[필수] 서비스 이용약관 동의"
    label="[필수] 개인정보 처리방침 동의"
    label="[선택] 마케팅 정보 수신 동의"
};
                    <Lib.Checkbox
                        label="ê¸°ë³¸ ?‰ìƒ (Primary)"
                        dataObj={dataObj}
                        dataKey="primary"
                        color="primary"
                    />
                    <Lib.Checkbox
                        label="ì»¤ìŠ¤?€ ë¹¨ê°„??
                        dataObj={dataObj}
                        dataKey="red"
                        color="#FF0000"
                    />
                    <Lib.Checkbox
                        label="ì»¤ìŠ¤?€ ì´ˆë¡??
                        dataObj={dataObj}
                        dataKey="green"
                        color="rgb(34, 197, 94)"
                    />
                </div>
            ),
            description: "?¤ì–‘???‰ìƒ",
            code: `<Lib.Checkbox
    label="ê¸°ë³¸ ?‰ìƒ (Primary)"
    dataObj={dataObj}
    dataKey="primary"
    color="primary"
/>
<Lib.Checkbox
    label="ì»¤ìŠ¤?€ ë¹¨ê°„??
    dataObj={dataObj}
    dataKey="red"
    color="#FF0000"
/>
<Lib.Checkbox
    label="ì»¤ìŠ¤?€ ì´ˆë¡??
    dataObj={dataObj}
    dataKey="green"
    color="rgb(34, 197, 94)"
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Lib.Checkbox
                        label="?œì–´ ì»´í¬?ŒíŠ¸"
                        checked={controlledCheck}
                        onChange={(e) => setControlledCheck(e.target.checked)}
                    />
                    <div className="text-sm text-gray-600">
                        ?„ìž¬ ?íƒœ: {controlledCheck ? 'ì²´í¬?? : 'ì²´í¬ ?´ì œ??}
                    </div>
                </div>
            ),
            description: "?œì–´ ì»´í¬?ŒíŠ¸ ë°©ì‹",
            code: `const [checked, setChecked] = useState(false);

<Lib.Checkbox
    label="?œì–´ ì»´í¬?ŒíŠ¸"
    checked={checked}
    onChange={(e) => setChecked(e.target.checked)}
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">?½ê? ?™ì˜</h4>
                    <Lib.Checkbox
                        name="terms"
                        label="[?„ìˆ˜] ?œë¹„???´ìš©?½ê? ?™ì˜"
                        dataObj={dataObj}
                        dataKey="termsAgreed"
                    />
                    <Lib.Checkbox
                        name="privacy"
                        label="[?„ìˆ˜] ê°œì¸?•ë³´ ì²˜ë¦¬ë°©ì¹¨ ?™ì˜"
                        dataObj={dataObj}
                        dataKey="privacyAgreed"
                    />
                    <Lib.Checkbox
                        name="marketing"
                        label="[? íƒ] ë§ˆì????•ë³´ ?˜ì‹  ?™ì˜"
                        dataObj={dataObj}
                        dataKey="marketingAgreed"
                    />
                </div>
            ),
            description: "?¤ì œ ?¬ìš© ?ˆì‹œ (?½ê? ?™ì˜)",
            code: `<Lib.Checkbox
    name="terms"
    label="[?„ìˆ˜] ?œë¹„???´ìš©?½ê? ?™ì˜"
    dataObj={dataObj}
    dataKey="termsAgreed"
/>
<Lib.Checkbox
    name="privacy"
    label="[?„ìˆ˜] ê°œì¸?•ë³´ ì²˜ë¦¬ë°©ì¹¨ ?™ì˜"
    dataObj={dataObj}
    dataKey="privacyAgreed"
/>
<Lib.Checkbox
    name="marketing"
    label="[? íƒ] ë§ˆì????•ë³´ ?˜ì‹  ?™ì˜"
    dataObj={dataObj}
    dataKey="marketingAgreed"
/>`
        }
    ];

    return examples;
}; 