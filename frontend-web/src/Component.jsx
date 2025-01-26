import * as Lib from '@/lib';
import { AppContext } from '@/common/share/AppContext';
import { useState, useContext } from 'react';
import ButtonDocs from './docs/components/ButtonDocs';
import TableOfContents from './docs/shared/TableOfContents';
import InputDocs from './docs/components/InputDocs';
import SelectDocs from './docs/components/SelectDocs';
// ... 다른 문서화 컴포넌트들 import

const Component = () => {
    const [checked, setChecked] = useState(true);
    const [checkButtonState, setCheckButtonState] = useState(true);  // 제어 컴포넌트용
    const [radioValue, setRadioValue] = useState('option1');
    const app = useContext(AppContext);

    /* 1. 기본 데이터 구조 예시 ======================================== */
    const dataObj = Lib.EasyObj({
        basicInput: '',
        email: '',
        phone: '',
        businessNo: '',
        amount: '',
        code: '',
        errors: {
            email: '',
        },
        redButton: false,
        greenButton: false,
        blueButton: false,
        selectedJob: '',  // 직업 선택용
        selectedPlan: '', // 요금제 선택용
        customColorRadio: '',  // 커스텀 색상 라디오 그룹용
        termsAgreed: false,
        privacyAgreed: false,
        marketingAgreed: false,
        paymentMethod: '',
        deliveryType: '',
        safePacking: false,
        selectedSize: '',        // 사이즈 선택용
        selectedTheme: '',      // 테마 선택용
        selectedLanguage: '',   // 언어 선택용
    });

    const dataList = Lib.EasyList([
        { id: 1, name: '항목 1' },
        { id: 2, name: '항목 2' },
        { id: 3, name: '항목 3' }
    ]);

    /* 2. 컴포넌트 예시 데이터 ======================================== */

    const checkboxExamples = [
        {
            component: <Lib.Checkbox
                label="기본 체크박스"
                dataObj={dataObj}
                dataKey="basicCheckbox"
            />,
            description: "기본 체크박스",
            code: `<Lib.Checkbox
    label="기본 체크박스"
    dataObj={dataObj}
    dataKey="basicCheckbox"
/>`
        },
        {
            component: <Lib.Checkbox
                label="비활성화 체크박스"
                disabled
            />,
            description: "비활성화 상태",
            code: `<Lib.Checkbox
    label="비활성화 체크박스"
    disabled
/>`
        },
        {
            component: <Lib.Checkbox
                label="제어 컴포넌트"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
            />,
            description: "제어 컴포넌트",
            code: `<Lib.Checkbox
    label="제어 컴포넌트"
    checked={checked}
    onChange={(e) => setChecked(e.target.checked)}
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Lib.Checkbox
                        label="기본 색상 (Primary)"
                        color="primary"
                    />
                    <Lib.Checkbox
                        label="커스텀 빨간색"
                        color="#FF0000"
                        checked={true}
                    />
                    <Lib.Checkbox
                        label="커스텀 초록색"
                        color="rgb(34, 197, 94)"
                        checked={true}
                    />
                    <Lib.Checkbox
                        label="커스텀 파란색"
                        color="hsl(217, 91%, 60%)"
                        checked={true}
                    />
                </div>
            ),
            description: "다양한 색상",
            code: `// 기본 색상
<Lib.Checkbox label="기본 색상 (Primary)" color="primary" />

// 커스텀 색상
<Lib.Checkbox label="커스텀 빨간색" color="#FF0000" checked={true} />
<Lib.Checkbox label="커스텀 초록색" color="rgb(34, 197, 94)" checked={true} />
<Lib.Checkbox label="커스텀 파란색" color="hsl(217, 91%, 60%)" checked={true} />`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">약관 동의</h4>
                        <Lib.Checkbox
                            name="terms"
                            label="[필수] 서비스 이용약관 동의"
                            dataObj={dataObj}
                            dataKey="termsAgreed"
                        />
                        <Lib.Checkbox
                            name="privacy"
                            label="[필수] 개인정보 처리방침 동의"
                            dataObj={dataObj}
                            dataKey="privacyAgreed"
                        />
                        <Lib.Checkbox
                            name="marketing"
                            label="[선택] 마케팅 정보 수신 동의"
                            dataObj={dataObj}
                            dataKey="marketingAgreed"
                        />
                    </div>
                </div>
            ),
            description: "실제 사용 예시 (약관 동의)",
            code: `// 약관 동의 체크박스 그룹
<Lib.Checkbox
    name="terms"
    label="[필수] 서비스 이용약관 동의"
    dataObj={dataObj}
    dataKey="termsAgreed"
/>
<Lib.Checkbox
    name="privacy"
    label="[필수] 개인정보 처리방침 동의"
    dataObj={dataObj}
    dataKey="privacyAgreed"
/>
<Lib.Checkbox
    name="marketing"
    label="[선택] 마케팅 정보 수신 동의"
    dataObj={dataObj}
    dataKey="marketingAgreed"
/>`
        }
    ];

    const checkButtonExamples = [
        {
            component: <Lib.CheckButton
                dataObj={dataObj}
                dataKey="basicCheckButton"
            >
                기본 체크버튼
            </Lib.CheckButton>,
            description: "기본 체크버튼",
            code: `<Lib.CheckButton
    dataObj={dataObj}
    dataKey="basicCheckButton"
>
    기본 체크버튼
</Lib.CheckButton>`
        },
        {
            component: <Lib.CheckButton disabled>
                비활성화 체크버튼
            </Lib.CheckButton>,
            description: "비활성화 상태",
            code: `<Lib.CheckButton disabled>
    비활성화 체크버튼
</Lib.CheckButton>`
        },
        {
            component: <Lib.CheckButton
                checked={checkButtonState}
                onChange={(e) => setCheckButtonState(e.target.checked)}
            >
                제어 컴포넌트
            </Lib.CheckButton>,
            description: "제어 컴포넌트",
            code: `<Lib.CheckButton
    checked={checkButtonState}
    onChange={(e) => setCheckButtonState(e.target.checked)}
>
    제어 컴포넌트
</Lib.CheckButton>`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="space-x-2">
                        <Lib.CheckButton
                            color="#FF0000"
                            dataObj={dataObj}
                            dataKey="redButton"
                        >
                            빨간색
                        </Lib.CheckButton>
                        <Lib.CheckButton
                            color="#4CAF50"
                            dataObj={dataObj}
                            dataKey="greenButton"
                        >
                            초록색
                        </Lib.CheckButton>
                        <Lib.CheckButton
                            color="#2196F3"
                            dataObj={dataObj}
                            dataKey="blueButton"
                        >
                            파란색
                        </Lib.CheckButton>
                    </div>
                    <div className="space-x-2">
                        <Lib.CheckButton
                            color="rgb(156, 39, 176)"
                            dataObj={dataObj}
                            dataKey="purpleButton"
                        >
                            RGB 보라색
                        </Lib.CheckButton>
                        <Lib.CheckButton
                            color="hsl(291, 64%, 42%)"
                            dataObj={dataObj}
                            dataKey="violetButton"
                        >
                            HSL 보라색
                        </Lib.CheckButton>
                        <Lib.CheckButton
                            color="rgba(233, 30, 99, 0.9)"
                            dataObj={dataObj}
                            dataKey="pinkButton"
                        >
                            RGBA 핑크색
                        </Lib.CheckButton>
                    </div>
                </div>
            ),
            description: "다양한 색상",
            code: `// HEX 색상값
<Lib.CheckButton color="#FF0000" dataObj={dataObj} dataKey="redButton">
    빨간색
</Lib.CheckButton>
<Lib.CheckButton color="#4CAF50" dataObj={dataObj} dataKey="greenButton">
    초록색
</Lib.CheckButton>
<Lib.CheckButton color="#2196F3" dataObj={dataObj} dataKey="blueButton">
    파란색
</Lib.CheckButton>

// RGB/HSL/RGBA 색상값
<Lib.CheckButton color="rgb(156, 39, 176)" dataObj={dataObj} dataKey="purpleButton">
    RGB 보라색
</Lib.CheckButton>
<Lib.CheckButton color="hsl(291, 64%, 42%)" dataObj={dataObj} dataKey="violetButton">
    HSL 보라색
</Lib.CheckButton>
<Lib.CheckButton color="rgba(233, 30, 99, 0.9)" dataObj={dataObj} dataKey="pinkButton">
    RGBA 핑크색
</Lib.CheckButton>`
        }
    ];

    // checkButtonExamples 배열 다음에 추가
    const radioboxExamples = [
        {
            component: (
                <div className="space-y-2">
                    <Lib.Radiobox
                        name="basic"
                        label="옵션 1"
                        value="option1"
                        dataObj={dataObj}
                        dataKey="basicRadio"
                    />
                    <Lib.Radiobox
                        name="basic"
                        label="옵션 2"
                        value="option2"
                        dataObj={dataObj}
                        dataKey="basicRadio"
                    />
                </div>
            ),
            description: "기본 라디오박스",
            code: `<Lib.Radiobox
    name="basic"
    label="옵션 1"
    value="option1"
    dataObj={dataObj}
    dataKey="basicRadio"
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Lib.Radiobox
                        name="disabled"
                        label="비활성화 옵션 1"
                        value="disabled1"
                        disabled
                    />
                    <Lib.Radiobox
                        name="disabled"
                        label="비활성화 옵션 2"
                        value="disabled2"
                        disabled
                        checked={true}
                    />
                </div>
            ),
            description: "비활성화 상태",
            code: `<Lib.Radiobox
    name="disabled"
    label="비활성화 옵션"
    value="disabled"
    disabled
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Lib.Radiobox
                        name="controlled"
                        label="제어 옵션 1"
                        value="option1"
                        checked={radioValue === 'option1'}
                        onChange={(e) => setRadioValue(e.target.value)}
                    />
                    <Lib.Radiobox
                        name="controlled"
                        label="제어 옵션 2"
                        value="option2"
                        checked={radioValue === 'option2'}
                        onChange={(e) => setRadioValue(e.target.value)}
                    />
                </div>
            ),
            description: "제어 컴포넌트",
            code: `const [radioValue, setRadioValue] = useState('option1');

<Lib.Radiobox
    name="controlled"
    label="제어 옵션 1"
    value="option1"
    checked={radioValue === 'option1'}
    onChange={(e) => setRadioValue(e.target.value)}
/>`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">직업 선택</h4>
                        <Lib.Radiobox
                            name="job"
                            label="개발자"
                            value="developer"
                            dataObj={dataObj}
                            dataKey="selectedJob"
                        />
                        <Lib.Radiobox
                            name="job"
                            label="디자이너"
                            value="designer"
                            dataObj={dataObj}
                            dataKey="selectedJob"
                        />
                        <Lib.Radiobox
                            name="job"
                            label="기획자"
                            value="planner"
                            dataObj={dataObj}
                            dataKey="selectedJob"
                        />
                    </div>
                </div>
            ),
            description: "그룹 예시",
            code: `// 직업 선택 그룹
<Lib.Radiobox
    name="job"
    label="개발자"
    value="developer"
    dataObj={dataObj}
    dataKey="selectedJob"
/>
<Lib.Radiobox
    name="job"
    label="디자이너"
    value="designer"
    dataObj={dataObj}
    dataKey="selectedJob"
/>`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">커스텀 색상</h4>
                        <Lib.Radiobox
                            name="customColor"
                            label="빨간색"
                            value="red"
                            color="#FF0000"
                            dataObj={dataObj}
                            dataKey="customColorRadio"
                        />
                        <Lib.Radiobox
                            name="customColor"
                            label="초록색"
                            value="green"
                            color="rgb(34, 197, 94)"
                            dataObj={dataObj}
                            dataKey="customColorRadio"
                        />
                        <Lib.Radiobox
                            name="customColor"
                            label="파란색"
                            value="blue"
                            color="hsl(217, 91%, 60%)"
                            dataObj={dataObj}
                            dataKey="customColorRadio"
                        />
                    </div>
                </div>
            ),
            description: "커스텀 색상",
            code: `// 커스텀 색상 라디오 그룹
<Lib.Radiobox
    name="customColor"
    label="빨간색"
    value="red"
    color="#FF0000"
    dataObj={dataObj}
    dataKey="customColorRadio"
/>
<Lib.Radiobox
    name="customColor"
    label="초록색"
    value="green"
    color="rgb(34, 197, 94)"
    dataObj={dataObj}
    dataKey="customColorRadio"
/>
<Lib.Radiobox
    name="customColor"
    label="파란색"
    value="blue"
    color="hsl(217, 91%, 60%)"
    dataObj={dataObj}
    dataKey="customColorRadio"
/>`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">결제 수단 선택</h4>
                        <Lib.Radiobox
                            name="payment"
                            label="신용카드"
                            value="card"
                            dataObj={dataObj}
                            dataKey="paymentMethod"
                            color="#FF6B6B"
                        />
                        <Lib.Radiobox
                            name="payment"
                            label="계좌이체"
                            value="bank"
                            dataObj={dataObj}
                            dataKey="paymentMethod"
                            color="#4D96FF"
                        />
                        <Lib.Radiobox
                            name="payment"
                            label="휴대폰 결제"
                            value="mobile"
                            dataObj={dataObj}
                            dataKey="paymentMethod"
                            color="#6BCB77"
                        />
                    </div>
                </div>
            ),
            description: "실제 사용 예시 (결제 수단)",
            code: `// 결제 수단 선택 라디오 그룹
<Lib.Radiobox
    name="payment"
    label="신용카드"
    value="card"
    dataObj={dataObj}
    dataKey="paymentMethod"
    color="#FF6B6B"
/>
<Lib.Radiobox
    name="payment"
    label="계좌이체"
    value="bank"
    dataObj={dataObj}
    dataKey="paymentMethod"
    color="#4D96FF"
/>
<Lib.Radiobox
    name="payment"
    label="휴대폰 결제"
    value="mobile"
    dataObj={dataObj}
    dataKey="paymentMethod"
    color="#6BCB77"
/>`
        }
    ];

    // radioButtonExamples 배열 추가
    const radioButtonExamples = [
        {
            component: (
                <div className="space-x-2">
                    <Lib.RadioButton
                        name="basic"
                        value="option1"
                        dataObj={dataObj}
                        dataKey="basicRadioButton"
                    >
                        옵션 1
                    </Lib.RadioButton>
                    <Lib.RadioButton
                        name="basic"
                        value="option2"
                        dataObj={dataObj}
                        dataKey="basicRadioButton"
                    >
                        옵션 2
                    </Lib.RadioButton>
                </div>
            ),
            description: "기본 라디오버튼",
            code: `<Lib.RadioButton
    name="basic"
    value="option1"
    dataObj={dataObj}
    dataKey="basicRadioButton"
>
    옵션 1
</Lib.RadioButton>

<Lib.RadioButton
    name="basic"
    value="option2"
    dataObj={dataObj}
    dataKey="basicRadioButton"
>
    옵션 2
</Lib.RadioButton>`
        },
        {
            component: (
                <div className="space-x-2">
                    <Lib.RadioButton
                        name="disabled"
                        value="disabled1"
                        disabled
                    >
                        비활성화 1
                    </Lib.RadioButton>
                    <Lib.RadioButton
                        name="disabled"
                        value="disabled2"
                        disabled
                        checked={true}
                    >
                        비활성화 2
                    </Lib.RadioButton>
                </div>
            ),
            description: "비활성화 상태",
            code: `<Lib.RadioButton
    name="disabled"
    value="disabled1"
    disabled
>
    비활성화 버튼
</Lib.RadioButton>

<Lib.RadioButton
    name="disabled"
    value="disabled2"
    disabled
    checked={true}
>
    비활성화 2
</Lib.RadioButton>`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="space-x-2">
                        <Lib.RadioButton
                            name="size"
                            value="small"
                            dataObj={dataObj}
                            dataKey="selectedSize"
                        >
                            Small
                        </Lib.RadioButton>
                        <Lib.RadioButton
                            name="size"
                            value="medium"
                            dataObj={dataObj}
                            dataKey="selectedSize"
                        >
                            Medium
                        </Lib.RadioButton>
                        <Lib.RadioButton
                            name="size"
                            value="large"
                            dataObj={dataObj}
                            dataKey="selectedSize"
                        >
                            Large
                        </Lib.RadioButton>
                    </div>
                    <div className="text-sm text-gray-600">
                        선택된 사이즈: {dataObj.selectedSize || '없음'}
                    </div>
                </div>
            ),
            description: "데이터 바인딩",
            code: `// 데이터 바인딩 예시
const obj = Lib.EasyObj({ selectedSize: '' });

<Lib.RadioButton
    name="size"
    value="small"
    dataObj={obj}
    dataKey="selectedSize"
>
    Small
</Lib.RadioButton>

<Lib.RadioButton
    name="size"
    value="medium"
    dataObj={dataObj}
    dataKey="selectedSize"
>
    Medium
</Lib.RadioButton>

<Lib.RadioButton
    name="size"
    value="large"
    dataObj={dataObj}
    dataKey="selectedSize"
>
    Large
</Lib.RadioButton>`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="space-x-2">
                        <Lib.RadioButton
                            name="theme"
                            value="light"
                            dataObj={dataObj}
                            dataKey="selectedTheme"
                            color="#FF6B6B"
                        >
                            라이트
                        </Lib.RadioButton>
                        <Lib.RadioButton
                            name="theme"
                            value="dark"
                            dataObj={dataObj}
                            dataKey="selectedTheme"
                            color="#4D96FF"
                        >
                            다크
                        </Lib.RadioButton>
                        <Lib.RadioButton
                            name="theme"
                            value="system"
                            dataObj={dataObj}
                            dataKey="selectedTheme"
                            color="#6BCB77"
                        >
                            시스템
                        </Lib.RadioButton>
                    </div>
                </div>
            ),
            description: "커스텀 색상",
            code: `// 커스텀 색상 라디오버튼 그룹
<Lib.RadioButton
    name="theme"
    value="light"
    dataObj={dataObj}
    dataKey="selectedTheme"
    color="#FF6B6B"
>
    라이트
</Lib.RadioButton>

<Lib.RadioButton
    name="theme"
    value="dark"
    dataObj={dataObj}
    dataKey="selectedTheme"
    color="#4D96FF"
>
    다크
</Lib.RadioButton>

<Lib.RadioButton
    name="theme"
    value="system"
    dataObj={dataObj}
    dataKey="selectedTheme"
    color="#6BCB77"
>
    시스템
</Lib.RadioButton>`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">언어 선택</h4>
                        <div className="space-x-2">
                            <Lib.RadioButton
                                name="language"
                                value="ko"
                                dataObj={dataObj}
                                dataKey="selectedLanguage"
                            >
                                한국어
                            </Lib.RadioButton>
                            <Lib.RadioButton
                                name="language"
                                value="en"
                                dataObj={dataObj}
                                dataKey="selectedLanguage"
                            >
                                English
                            </Lib.RadioButton>
                            <Lib.RadioButton
                                name="language"
                                value="ja"
                                dataObj={dataObj}
                                dataKey="selectedLanguage"
                            >
                                日本語
                            </Lib.RadioButton>
                        </div>
                    </div>
                </div>
            ),
            description: "실제 사용 예시 (언어 선택)",
            code: `// 언어 선택 라디오버튼 그룹
<Lib.RadioButton
    name="language"
    value="ko"
    dataObj={dataObj}
    dataKey="selectedLanguage"
>
    한국어
</Lib.RadioButton>

<Lib.RadioButton
    name="language"
    value="en"
    dataObj={dataObj}
    dataKey="selectedLanguage"
>
    English
</Lib.RadioButton>

<Lib.RadioButton
    name="language"
    value="ja"
    dataObj={dataObj}
    dataKey="selectedLanguage"
>
    日本語
</Lib.RadioButton>`
        }
    ];

    /* 3. 상태 관리 ================================================== */
    const [copied, setCopied] = useState(false);

    /* 4. 이벤트 핸들러 ============================================== */

    const handleCodeClick = (code) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const iconExamples = [
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

    const onLoadingTest = () => {
        app.setLoading(true);
        setTimeout(() => {
            app.setLoading(false);
        }, 5000);
    };

    // iconExamples 배열 뒤에 추가
    const loadingExamples = [
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={onLoadingTest}>
                        로딩 스피너 테스트 (5초)
                    </Lib.Button>
                    <div className="text-sm text-gray-600">
                        버튼 클릭 시 5초 동안 전체 화면 로딩 스피너가 표시됩니다.
                    </div>
                </div>
            ),
            description: "전체 화면 로딩 스피너",
            code: `// AppContext 사용
const app = useContext(AppContext);

// 로딩 스피너 표시
const onLoadingTest = () => {
    app.setLoading(true);
    setTimeout(() => {
        app.setLoading(false);
    }, 5000);
};

<Lib.Button onClick={onLoadingTest}>
    로딩 스피너 테스트 (5초)
</Lib.Button>`
        }
    ];

    // Alert 예시 추가
    const alertExamples = [
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => app.showAlert("기본 알림 메시지입니다.")}>
                        기본 알림
                    </Lib.Button>
                    <div className="text-sm text-gray-600">
                        기본 정보 알림입니다.
                    </div>
                </div>
            ),
            description: "기본 알림",
            code: `const { showAlert } = useContext(AppContext);

// 기본 알림 표시
showAlert("기본 알림 메시지입니다.");`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="space-x-2">
                        <Lib.Button
                            onClick={() => app.showAlert("성공적으로 처리되었습니다.", {
                                title: "성공",
                                type: "success"
                            })}
                        >
                            성공
                        </Lib.Button>
                        <Lib.Button
                            onClick={() => app.showAlert("주의가 필요합니다.", {
                                title: "주의",
                                type: "warning"
                            })}
                        >
                            경고
                        </Lib.Button>
                        <Lib.Button
                            onClick={() => app.showAlert("오류가 발생했습니다.", {
                                title: "오류",
                                type: "error"
                            })}
                        >
                            오류
                        </Lib.Button>
                    </div>
                    <div className="text-sm text-gray-600">
                        다양한 유형의 알림을 표시할 수 있습니다.
                    </div>
                </div>
            ),
            description: "알림 유형",
            code: `// 성공 알림
showAlert("성공적으로 처리되었습니다.", {
    title: "성공",
    type: "success"
});

// 경고 알림
showAlert("주의가 필요합니다.", {
    title: "주의",
    type: "warning"
});

// 오류 알림
showAlert("오류가 발생했습니다.", {
    title: "오류",
    type: "error"
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button
                        onClick={() => app.showAlert("작업이 완료되었습니다.", {
                            title: "완료",
                            type: "success",
                            onClick: () => alert("알림이 닫혔습니다!")
                        })}
                    >
                        콜백 함수 테스트
                    </Lib.Button>
                    <div className="text-sm text-gray-600">
                        알림이 닫힐 때 콜백 함수를 실행할 수 있습니다.
                    </div>
                </div>
            ),
            description: "콜백 함수",
            code: `// 콜백 함수와 함께 알림 표시
showAlert("작업이 완료되었습니다.", {
    title: "완료",
    type: "success",
    onClick: () => {
        // 알림이 닫힐 때 실행될 코드
        alert("알림이 닫혔습니다!");
    }
});`
        }
    ];

    const confirmExamples = [
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => app.showConfirm(
                        "정말 계속하시겠습니까?",
                        {
                            onConfirm: () => app.showAlert("확인을 선택하셨습니다.", { type: "success" }),
                            onCancel: () => app.showAlert("취소하셨습니다.", { type: "info" })
                        }
                    )}>
                        기본 확인
                    </Lib.Button>
                    <div className="text-sm text-gray-600">
                        기본적인 확인 대화상자입니다.
                    </div>
                </div>
            ),
            description: "기본 확인 대화상자",
            code: `const { showConfirm, showAlert } = useContext(AppContext);

showConfirm("정말 계속하시겠습니까?", {
    onConfirm: () => showAlert("확인을 선택하셨습니다.", { type: "success" }),
    onCancel: () => showAlert("취소하셨습니다.", { type: "info" })
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="space-x-2">
                        <Lib.Button
                            onClick={() => app.showConfirm("이 작업은 되돌릴 수 없습니다.\n계속하시겠습니까?", {
                                title: "주의",
                                type: "warning",
                                confirmText: "계속",
                                cancelText: "중단"
                            })}
                        >
                            경고
                        </Lib.Button>
                        <Lib.Button
                            onClick={() => app.showConfirm("모든 데이터가 삭제됩니다.\n정말 삭제하시겠습니까?", {
                                title: "삭제 확인",
                                type: "danger",
                                confirmText: "삭제",
                                cancelText: "취소"
                            })}
                        >
                            위험
                        </Lib.Button>
                    </div>
                    <div className="text-sm text-gray-600">
                        경고 및 위험 작업 확인에 적합한 스타일을 제공합니다.
                    </div>
                </div>
            ),
            description: "다양한 유형",
            code: `// 경고 확인
showConfirm("이 작업은 되돌릴 수 없습니다.\n계속하시겠습니까?", {
    title: "주의",
    type: "warning",
    confirmText: "계속",
    cancelText: "중단"
});

// 위험 확인
showConfirm("모든 데이터가 삭제됩니다.\n정말 삭제하시겠습니까?", {
    title: "삭제 확인",
    type: "danger",
    confirmText: "삭제",
    cancelText: "취소"
});`
        }
    ];

    /* 5. 렌더링 ==================================================== */
    return (
        <div className="p-8 bg-white">
            <h1 className="text-3xl font-bold mb-8">컴포넌트</h1>

            {/* 목차 섹션 */}
            <TableOfContents />

            {/* 각 컴포넌트 문서화 섹션 */}
            <ButtonDocs />
            <InputDocs />
            <SelectDocs />
            {/* ... 다른 문서화 컴포넌트들 */}
        </div>
    );
};

export default Component;