import { useState, useContext } from 'react';
import Button from '@/common/component/Button';
import Input from '@/common/component/Input';
import EasyObj from '@/common/dataset/EasyObj';
import EasyList from '@/common/dataset/EasyList';
import Select from '@/common/component/Select';
import Checkbox from '@/common/component/Checkbox/Checkbox';
import CheckButton from '@/common/component/CheckButton';
import Radiobox from '@/common/component/Radiobox/Radiobox';
import RadioButton from '@/common/component/RadioButton';
import Icon from '@/common/component/Icon';
import { AppContext } from '@/common/share/AppContext';

const Component = () => {
    const [checked, setChecked] = useState(true);
    const [checkButtonState, setCheckButtonState] = useState(true);  // 제어 컴포넌트용
    const [radioValue, setRadioValue] = useState('option1');
    const app = useContext(AppContext);
    /* 1. 기본 데이터 구조 예시 ======================================== */
    const dataObj = EasyObj({
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

    const dataList = EasyList([
        { id: 1, name: '항목 1' },
        { id: 2, name: '항목 2' },
        { id: 3, name: '항목 3' }
    ]);
    /* 2. 컴포넌트 예시 데이터 ======================================== */
    const buttonExamples = [
        {
            component: <Button>기본 버튼</Button>,
            description: "기본 버튼 (Primary)",
            code: "<Button>기본 버튼</Button>"
        },
        {
            component: <Button variant="secondary">Secondary</Button>,
            description: "Secondary 버튼",
            code: '<Button variant="secondary">Secondary</Button>'
        },
        {
            component: <Button variant="outline">Outline</Button>,
            description: "Outline 버튼",
            code: '<Button variant="outline">Outline</Button>'
        },
        {
            component: <Button variant="ghost">Ghost</Button>,
            description: "Ghost 버튼",
            code: '<Button variant="ghost">Ghost</Button>'
        },
        {
            component: <Button variant="danger">Danger</Button>,
            description: "Danger 버튼",
            code: '<Button variant="danger">Danger</Button>'
        },
        {
            component: <Button variant="success">Success</Button>,
            description: "Success 버튼",
            code: '<Button variant="success">Success</Button>'
        },
        {
            component: <Button variant="warning">Warning</Button>,
            description: "Warning 버튼",
            code: '<Button variant="warning">Warning</Button>'
        },
        {
            component: <Button variant="link">Link Button</Button>,
            description: "Link 스타일 버튼",
            code: '<Button variant="link">Link Button</Button>'
        },
        {
            component: <Button variant="dark">Dark</Button>,
            description: "Dark 버튼",
            code: '<Button variant="dark">Dark</Button>'
        },
        {
            component: <Button size="sm">Small</Button>,
            description: "Small 버튼",
            code: '<Button size="sm">Small</Button>'
        },
        {
            component: <Button size="lg">Large</Button>,
            description: "Large 버튼",
            code: '<Button size="lg">Large</Button>'
        },
        {
            component: <Button disabled>Disabled</Button>,
            description: "비활성화 버튼",
            code: '<Button disabled>Disabled</Button>'
        },
        {
            component: <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                그라데이션 버튼
            </Button>,
            description: "커스텀 스타일링",
            code: `<Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
    그라데이션 버튼
</Button>`
        }
    ];

    const inputExamples = [
        {
            component: <Input
                dataObj={dataObj}
                dataKey="basicInput"
                placeholder="텍스트를 입력하세요"
            />,
            description: "기본 입력",
            code: '<Input dataObj={dataObj} dataKey="basicInput" placeholder="텍스트를 입력하세요" />'
        },
        {
            component: <Input
                dataObj={dataObj}
                dataKey="email"
                type="email"
                placeholder="이메일을 입력하세요"
            />,
            description: "이메일 입력",
            code: '<Input dataObj={dataObj} dataKey="email" type="email" placeholder="이메일을 입력하세요" />'
        },
        {
            component: <Input
                dataObj={dataObj}
                dataKey="phone"
                mask="###-####-####"
                placeholder="전화번호: 010-1234-5678"
            />,
            description: "전화번호 마스크",
            code: '<Input dataObj={dataObj} dataKey="phone" mask="###-####-####" placeholder="전화번호: 010-1234-5678" />'
        },
        {
            component: <Input
                dataObj={dataObj}
                dataKey="businessNo"
                mask="###-##-#####"
                placeholder="사업자번호: 123-45-67890"
            />,
            description: "사업자번호 마스크",
            code: '<Input dataObj={dataObj} dataKey="businessNo" mask="###-##-#####" placeholder="사업자번호: 123-45-67890" />'
        },
        {
            component: <Input
                dataObj={dataObj}
                dataKey="cardNo"
                mask="####-####-####-####"
                placeholder="카드번호: 1234-5678-1234-5678"
            />,
            description: "카드번호 마스크",
            code: '<Input dataObj={dataObj} dataKey="cardNo" mask="####-####-####-####" placeholder="카드번호: 1234-5678-1234-5678" />'
        },
        {
            component: <Input
                dataObj={dataObj}
                dataKey="amount"
                type="number"
                maxDigits={10}
                maxDecimals={2}
                placeholder="숫자만 입력 (최대 10자리, 소수점 2자리)"
            />,
            description: "숫자 입력 (자릿수 제한)",
            code: '<Input dataObj={dataObj} dataKey="amount" type="number" maxDigits={10} maxDecimals={2} placeholder="숫자만 입력" />'
        },
        {
            component: <Input
                dataObj={dataObj}
                dataKey="code"
                filter="A-Za-z0-9"
                placeholder="영문과 숫자만 입력"
            />,
            description: "영문/숫자 필터",
            code: '<Input dataObj={dataObj} dataKey="code" filter="A-Za-z0-9" placeholder="영문과 숫자만 입력" />'
        },
        {
            component: <Input
                dataObj={dataObj}
                dataKey="koreanName"
                filter="가-힣"
                placeholder="한글만 입력"
            />,
            description: "한글 필터",
            code: '<Input dataObj={dataObj} dataKey="koreanName" filter="가-힣" placeholder="한글만 입력" />'
        },
        {
            component: <Input
                dataObj={dataObj}
                dataKey="email"
                error="이메일 형식이 올바르지 않습니다"
                placeholder="에러 상태 표시"
            />,
            description: "에러 상태",
            code: '<Input dataObj={dataObj} dataKey="email" error="이메일 형식이 올바르지 않습니다" placeholder="에러 상태" />'
        }
    ];

    const selectExamples = [
        {
            component: <Select
                dataList={dataList}
                valueKey="id"
                textKey="name"
            />,
            description: "기본 Select (EasyList 사용)",
            code: `<Select
    dataList={dataList}  // EasyList([{ id: 1, name: '항목 1' }, ...])
    valueKey="id"
    textKey="name"
/>`
        },
        {
            component: <Select
                dataList={[
                    { id: '', name: '직업을 선택하세요', placeholder: true },
                    { id: 'dev', name: '개발자' },
                    { id: 'designer', name: '디자이너' },
                    { id: 'pm', name: '기획자' }
                ]}
                valueKey="id"
                textKey="name"
            />,
            description: "플레이스홀더 사용",
            code: `<Select
    dataList={[
        { id: '', name: '직업을 선택하세요', placeholder: true },
        { id: 'dev', name: '개발자' },
        { id: 'designer', name: '디자이너' },
        { id: 'pm', name: '기획자' }
    ]}
    valueKey="id"
    textKey="name"
/>`
        },
        {
            component: <Select
                dataList={[
                    { value: '', text: '선택하세요', placeholder: true },
                    { value: '1', text: '옵션 1' },
                    { value: '2', text: '옵션 2' },
                    { value: '3', text: '옵션 3' }
                ]}
                disabled
            />,
            description: "비활성화 상태",
            code: `<Select
    dataList={[
        { value: '', text: '선택하세요', placeholder: true },
        { value: '1', text: '옵션 1' },
        { value: '2', text: '옵션 2' },
        { value: '3', text: '옵션 3' }
    ]}
    disabled
/>`
        },
        {
            component: <Select
                dataList={[
                    { value: '', text: '선택하세요', placeholder: true },
                    { value: '1', text: '옵션 1' },
                    { value: '2', text: '옵션 2' },
                    { value: '3', text: '옵션 3' }
                ]}
                error={true}
            />,
            description: "에러 상태",
            code: `<Select
    dataList={[
        { value: '', text: '선택하세요', placeholder: true },
        { value: '1', text: '옵션 1' },
        { value: '2', text: '옵션 2' },
        { value: '3', text: '옵션 3' }
    ]}
    error={true}
/>`
        }
    ];

    const checkboxExamples = [
        {
            component: <Checkbox
                label="기본 체크박스"
                dataObj={dataObj}
                dataKey="basicCheckbox"
            />,
            description: "기본 체크박스",
            code: `<Checkbox
    label="기본 체크박스"
    dataObj={dataObj}
    dataKey="basicCheckbox"
/>`
        },
        {
            component: <Checkbox
                label="비활성화 체크박스"
                disabled
            />,
            description: "비활성화 상태",
            code: `<Checkbox
    label="비활성화 체크박스"
    disabled
/>`
        },
        {
            component: <Checkbox
                label="제어 컴포넌트"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
            />,
            description: "제어 컴포넌트",
            code: `<Checkbox
    label="제어 컴포넌트"
    checked={checked}
    onChange={(e) => setChecked(e.target.checked)}
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Checkbox
                        label="기본 색상 (Primary)"
                        color="primary"
                    />
                    <Checkbox
                        label="커스텀 빨간색"
                        color="#FF0000"
                        checked={true}
                    />
                    <Checkbox
                        label="커스텀 초록색"
                        color="rgb(34, 197, 94)"
                        checked={true}
                    />
                    <Checkbox
                        label="커스텀 파란색"
                        color="hsl(217, 91%, 60%)"
                        checked={true}
                    />
                </div>
            ),
            description: "다양한 색상",
            code: `// 기본 색상
<Checkbox label="기본 색상 (Primary)" color="primary" />

// 커스텀 색상
<Checkbox label="커스텀 빨간색" color="#FF0000" checked={true} />
<Checkbox label="커스텀 초록색" color="rgb(34, 197, 94)" checked={true} />
<Checkbox label="커스텀 파란색" color="hsl(217, 91%, 60%)" checked={true} />`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">약관 동의</h4>
                        <Checkbox
                            name="terms"
                            label="[필수] 서비스 이용약관 동의"
                            dataObj={dataObj}
                            dataKey="termsAgreed"
                        />
                        <Checkbox
                            name="privacy"
                            label="[필수] 개인정보 처리방침 동의"
                            dataObj={dataObj}
                            dataKey="privacyAgreed"
                        />
                        <Checkbox
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
<Checkbox
    name="terms"
    label="[필수] 서비스 이용약관 동의"
    dataObj={dataObj}
    dataKey="termsAgreed"
/>
<Checkbox
    name="privacy"
    label="[필수] 개인정보 처리방침 동의"
    dataObj={dataObj}
    dataKey="privacyAgreed"
/>
<Checkbox
    name="marketing"
    label="[선택] 마케팅 정보 수신 동의"
    dataObj={dataObj}
    dataKey="marketingAgreed"
/>`
        }
    ];

    const checkButtonExamples = [
        {
            component: <CheckButton
                dataObj={dataObj}
                dataKey="basicCheckButton"
            >
                기본 체크버튼
            </CheckButton>,
            description: "기본 체크버튼",
            code: `<CheckButton
    dataObj={dataObj}
    dataKey="basicCheckButton"
>
    기본 체크버튼
</CheckButton>`
        },
        {
            component: <CheckButton disabled>
                비활성화 체크버튼
            </CheckButton>,
            description: "비활성화 상태",
            code: `<CheckButton disabled>
    비활성화 체크버튼
</CheckButton>`
        },
        {
            component: <CheckButton
                checked={checkButtonState}
                onChange={(e) => setCheckButtonState(e.target.checked)}
            >
                제어 컴포넌트
            </CheckButton>,
            description: "제어 컴포넌트",
            code: `<CheckButton
    checked={checkButtonState}
    onChange={(e) => setCheckButtonState(e.target.checked)}
>
    제어 컴포넌트
</CheckButton>`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="space-x-2">
                        <CheckButton
                            color="#FF0000"
                            dataObj={dataObj}
                            dataKey="redButton"
                        >
                            빨간색
                        </CheckButton>
                        <CheckButton
                            color="#4CAF50"
                            dataObj={dataObj}
                            dataKey="greenButton"
                        >
                            초록색
                        </CheckButton>
                        <CheckButton
                            color="#2196F3"
                            dataObj={dataObj}
                            dataKey="blueButton"
                        >
                            파란색
                        </CheckButton>
                    </div>
                    <div className="space-x-2">
                        <CheckButton
                            color="rgb(156, 39, 176)"
                            dataObj={dataObj}
                            dataKey="purpleButton"
                        >
                            RGB 보라색
                        </CheckButton>
                        <CheckButton
                            color="hsl(291, 64%, 42%)"
                            dataObj={dataObj}
                            dataKey="violetButton"
                        >
                            HSL 보라색
                        </CheckButton>
                        <CheckButton
                            color="rgba(233, 30, 99, 0.9)"
                            dataObj={dataObj}
                            dataKey="pinkButton"
                        >
                            RGBA 핑크색
                        </CheckButton>
                    </div>
                </div>
            ),
            description: "다양한 색상",
            code: `// HEX 색상값
<CheckButton color="#FF0000" dataObj={dataObj} dataKey="redButton">
    빨간색
</CheckButton>
<CheckButton color="#4CAF50" dataObj={dataObj} dataKey="greenButton">
    초록색
</CheckButton>
<CheckButton color="#2196F3" dataObj={dataObj} dataKey="blueButton">
    파란색
</CheckButton>

// RGB/HSL/RGBA 색상값
<CheckButton color="rgb(156, 39, 176)" dataObj={dataObj} dataKey="purpleButton">
    RGB 보라색
</CheckButton>
<CheckButton color="hsl(291, 64%, 42%)" dataObj={dataObj} dataKey="violetButton">
    HSL 보라색
</CheckButton>
<CheckButton color="rgba(233, 30, 99, 0.9)" dataObj={dataObj} dataKey="pinkButton">
    RGBA 핑크색
</CheckButton>`
        }
    ];

    // checkButtonExamples 배열 다음에 추가
    const radioboxExamples = [
        {
            component: (
                <div className="space-y-2">
                    <Radiobox
                        name="basic"
                        label="옵션 1"
                        value="option1"
                        dataObj={dataObj}
                        dataKey="basicRadio"
                    />
                    <Radiobox
                        name="basic"
                        label="옵션 2"
                        value="option2"
                        dataObj={dataObj}
                        dataKey="basicRadio"
                    />
                </div>
            ),
            description: "기본 라디오박스",
            code: `<Radiobox
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
                    <Radiobox
                        name="disabled"
                        label="비활성화 옵션 1"
                        value="disabled1"
                        disabled
                    />
                    <Radiobox
                        name="disabled"
                        label="비활성화 옵션 2"
                        value="disabled2"
                        disabled
                        checked={true}
                    />
                </div>
            ),
            description: "비활성화 상태",
            code: `<Radiobox
    name="disabled"
    label="비활성화 옵션"
    value="disabled"
    disabled
/>`
        },
        {
            component: (
                <div className="space-y-2">
                    <Radiobox
                        name="controlled"
                        label="제어 옵션 1"
                        value="option1"
                        checked={radioValue === 'option1'}
                        onChange={(e) => setRadioValue(e.target.value)}
                    />
                    <Radiobox
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

<Radiobox
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
                        <Radiobox
                            name="job"
                            label="개발자"
                            value="developer"
                            dataObj={dataObj}
                            dataKey="selectedJob"
                        />
                        <Radiobox
                            name="job"
                            label="디자이너"
                            value="designer"
                            dataObj={dataObj}
                            dataKey="selectedJob"
                        />
                        <Radiobox
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
<Radiobox
    name="job"
    label="개발자"
    value="developer"
    dataObj={dataObj}
    dataKey="selectedJob"
/>
<Radiobox
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
                        <Radiobox
                            name="customColor"
                            label="빨간색"
                            value="red"
                            color="#FF0000"
                            dataObj={dataObj}
                            dataKey="customColorRadio"
                        />
                        <Radiobox
                            name="customColor"
                            label="초록색"
                            value="green"
                            color="rgb(34, 197, 94)"
                            dataObj={dataObj}
                            dataKey="customColorRadio"
                        />
                        <Radiobox
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
<Radiobox
    name="customColor"
    label="빨간색"
    value="red"
    color="#FF0000"
    dataObj={dataObj}
    dataKey="customColorRadio"
/>
<Radiobox
    name="customColor"
    label="초록색"
    value="green"
    color="rgb(34, 197, 94)"
    dataObj={dataObj}
    dataKey="customColorRadio"
/>
<Radiobox
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
                        <Radiobox
                            name="payment"
                            label="신용카드"
                            value="card"
                            dataObj={dataObj}
                            dataKey="paymentMethod"
                            color="#FF6B6B"
                        />
                        <Radiobox
                            name="payment"
                            label="계좌이체"
                            value="bank"
                            dataObj={dataObj}
                            dataKey="paymentMethod"
                            color="#4D96FF"
                        />
                        <Radiobox
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
<Radiobox
    name="payment"
    label="신용카드"
    value="card"
    dataObj={dataObj}
    dataKey="paymentMethod"
    color="#FF6B6B"
/>
<Radiobox
    name="payment"
    label="계좌이체"
    value="bank"
    dataObj={dataObj}
    dataKey="paymentMethod"
    color="#4D96FF"
/>
<Radiobox
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
                    <RadioButton
                        name="basic"
                        value="option1"
                        dataObj={dataObj}
                        dataKey="basicRadioButton"
                    >
                        옵션 1
                    </RadioButton>
                    <RadioButton
                        name="basic"
                        value="option2"
                        dataObj={dataObj}
                        dataKey="basicRadioButton"
                    >
                        옵션 2
                    </RadioButton>
                </div>
            ),
            description: "기본 라디오버튼",
            code: `<RadioButton
    name="basic"
    value="option1"
    dataObj={dataObj}
    dataKey="basicRadioButton"
>
    옵션 1
</RadioButton>

<RadioButton
    name="basic"
    value="option2"
    dataObj={dataObj}
    dataKey="basicRadioButton"
>
    옵션 2
</RadioButton>`
        },
        {
            component: (
                <div className="space-x-2">
                    <RadioButton
                        name="disabled"
                        value="disabled1"
                        disabled
                    >
                        비활성화 1
                    </RadioButton>
                    <RadioButton
                        name="disabled"
                        value="disabled2"
                        disabled
                        checked={true}
                    >
                        비활성화 2
                    </RadioButton>
                </div>
            ),
            description: "비활성화 상태",
            code: `<RadioButton
    name="disabled"
    value="disabled1"
    disabled
>
    비활성화 버튼
</RadioButton>

<RadioButton
    name="disabled"
    value="disabled2"
    disabled
    checked={true}
>
    비활성화 2
</RadioButton>`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="space-x-2">
                        <RadioButton
                            name="size"
                            value="small"
                            dataObj={dataObj}
                            dataKey="selectedSize"
                        >
                            Small
                        </RadioButton>
                        <RadioButton
                            name="size"
                            value="medium"
                            dataObj={dataObj}
                            dataKey="selectedSize"
                        >
                            Medium
                        </RadioButton>
                        <RadioButton
                            name="size"
                            value="large"
                            dataObj={dataObj}
                            dataKey="selectedSize"
                        >
                            Large
                        </RadioButton>
                    </div>
                    <div className="text-sm text-gray-600">
                        선택된 사이즈: {dataObj.selectedSize || '없음'}
                    </div>
                </div>
            ),
            description: "데이터 바인딩",
            code: `// 데이터 바인딩 예시
const obj = EasyObj({ selectedSize: '' });

<RadioButton
    name="size"
    value="small"
    dataObj={obj}
    dataKey="selectedSize"
>
    Small
</RadioButton>

<RadioButton
    name="size"
    value="medium"
    dataObj={dataObj}
    dataKey="selectedSize"
>
    Medium
</RadioButton>

<RadioButton
    name="size"
    value="large"
    dataObj={dataObj}
    dataKey="selectedSize"
>
    Large
</RadioButton>`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="space-x-2">
                        <RadioButton
                            name="theme"
                            value="light"
                            dataObj={dataObj}
                            dataKey="selectedTheme"
                            color="#FF6B6B"
                        >
                            라이트
                        </RadioButton>
                        <RadioButton
                            name="theme"
                            value="dark"
                            dataObj={dataObj}
                            dataKey="selectedTheme"
                            color="#4D96FF"
                        >
                            다크
                        </RadioButton>
                        <RadioButton
                            name="theme"
                            value="system"
                            dataObj={dataObj}
                            dataKey="selectedTheme"
                            color="#6BCB77"
                        >
                            시스템
                        </RadioButton>
                    </div>
                </div>
            ),
            description: "커스텀 색상",
            code: `// 커스텀 색상 라디오버튼 그룹
<RadioButton
    name="theme"
    value="light"
    dataObj={dataObj}
    dataKey="selectedTheme"
    color="#FF6B6B"
>
    라이트
</RadioButton>

<RadioButton
    name="theme"
    value="dark"
    dataObj={dataObj}
    dataKey="selectedTheme"
    color="#4D96FF"
>
    다크
</RadioButton>

<RadioButton
    name="theme"
    value="system"
    dataObj={dataObj}
    dataKey="selectedTheme"
    color="#6BCB77"
>
    시스템
</RadioButton>`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">언어 선택</h4>
                        <div className="space-x-2">
                            <RadioButton
                                name="language"
                                value="ko"
                                dataObj={dataObj}
                                dataKey="selectedLanguage"
                            >
                                한국어
                            </RadioButton>
                            <RadioButton
                                name="language"
                                value="en"
                                dataObj={dataObj}
                                dataKey="selectedLanguage"
                            >
                                English
                            </RadioButton>
                            <RadioButton
                                name="language"
                                value="ja"
                                dataObj={dataObj}
                                dataKey="selectedLanguage"
                            >
                                日本語
                            </RadioButton>
                        </div>
                    </div>
                </div>
            ),
            description: "실제 사용 예시 (언어 선택)",
            code: `// 언어 선택 라디오버튼 그룹
<RadioButton
    name="language"
    value="ko"
    dataObj={dataObj}
    dataKey="selectedLanguage"
>
    한국어
</RadioButton>

<RadioButton
    name="language"
    value="en"
    dataObj={dataObj}
    dataKey="selectedLanguage"
>
    English
</RadioButton>

<RadioButton
    name="language"
    value="ja"
    dataObj={dataObj}
    dataKey="selectedLanguage"
>
    日本語
</RadioButton>`
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
                        <Icon icon="md:MdHome" size="24px" />
                        <Icon icon="md:MdPerson" size="24px" />
                        <Icon icon="md:MdSettings" size="24px" />
                    </div>
                    <div className="space-x-4 text-gray-500 text-sm">
                        <Icon icon="md:MdHome" size="16px" />
                        <Icon icon="md:MdHome" size="24px" />
                        <Icon icon="md:MdHome" size="32px" />
                        <Icon icon="md:MdHome" size="48px" />
                    </div>
                </div>
            ),
            description: "기본 Material 아이콘과 크기 변형",
            code: `// 기본 아이콘
<Icon icon="md:MdHome" size="24px" />

// 다양한 크기
<Icon icon="md:MdHome" size="16px" />  // 작은 크기
<Icon icon="md:MdHome" size="24px" />  // 기본 크기
<Icon icon="md:MdHome" size="32px" />  // 큰 크기
<Icon icon="md:MdHome" size="48px" />  // 더 큰 크기`
        },
        {
            component: (
                <div>
                    <div className="space-x-4 mb-2">
                        <Icon icon="bs:BsCheckCircle" className="text-green-500" size="24px" />
                        <Icon icon="bs:BsExclamationCircle" className="text-yellow-500" size="24px" />
                        <Icon icon="bs:BsXCircle" className="text-red-500" size="24px" />
                    </div>
                    <div className="space-x-4">
                        <Icon icon="bs:BsCheckCircle" className="text-green-500" size="16px" />
                        <Icon icon="bs:BsCheckCircle" className="text-green-500" size="24px" />
                        <Icon icon="bs:BsCheckCircle" className="text-green-500" size="32px" />
                        <Icon icon="bs:BsCheckCircle" className="text-green-500" size="48px" />
                    </div>
                </div>
            ),
            description: "색상이 있는 Bootstrap 아이콘과 크기 변형",
            code: `// 색상이 있는 아이콘
<Icon icon="bs:BsCheckCircle" className="text-green-500" size="24px" />

// 다양한 크기
<Icon icon="bs:BsCheckCircle" className="text-green-500" size="16px" />
<Icon icon="bs:BsCheckCircle" className="text-green-500" size="24px" />
<Icon icon="bs:BsCheckCircle" className="text-green-500" size="32px" />
<Icon icon="bs:BsCheckCircle" className="text-green-500" size="48px" />`
        },
        {
            component: (
                <div>
                    <div className="space-x-4 mb-2">
                        <Icon icon="fi:FiGithub" size="24px" />
                        <Icon icon="fi:FiTwitter" size="24px" />
                        <Icon icon="fi:FiFacebook" size="24px" />
                    </div>
                    <div className="space-x-4">
                        <Icon icon="fi:FiGithub" size="16px" />
                        <Icon icon="fi:FiGithub" size="24px" />
                        <Icon icon="fi:FiGithub" size="32px" />
                        <Icon icon="fi:FiGithub" size="48px" />
                    </div>
                </div>
            ),
            description: "소셜 미디어 아이콘 (Feather)과 크기 변형",
            code: `// 소셜 미디어 아이콘
<Icon icon="fi:FiGithub" size="24px" />

// 다양한 크기
<Icon icon="fi:FiGithub" size="16px" />
<Icon icon="fi:FiGithub" size="24px" />
<Icon icon="fi:FiGithub" size="32px" />
<Icon icon="fi:FiGithub" size="48px" />`
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
                    <Button onClick={onLoadingTest}>
                        로딩 스피너 테스트 (5초)
                    </Button>
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

<Button onClick={onLoadingTest}>
    로딩 스피너 테스트 (5초)
</Button>`
        }
    ];

    // Alert 예시 추가
    const alertExamples = [
        {
            component: (
                <div className="space-y-4">
                    <Button onClick={() => app.showAlert("기본 알림 메시지입니다.")}>
                        기본 알림
                    </Button>
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
                        <Button
                            onClick={() => app.showAlert("성공적으로 처리되었습니다.", {
                                title: "성공",
                                type: "success"
                            })}
                        >
                            성공
                        </Button>
                        <Button
                            onClick={() => app.showAlert("주의가 필요합니다.", {
                                title: "주의",
                                type: "warning"
                            })}
                        >
                            경고
                        </Button>
                        <Button
                            onClick={() => app.showAlert("오류가 발생했습니다.", {
                                title: "오류",
                                type: "error"
                            })}
                        >
                            오류
                        </Button>
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
                    <Button
                        onClick={() => app.showAlert("작업이 완료되었습니다.", {
                            title: "완료",
                            type: "success",
                            onClick: () => alert("알림이 닫혔습니다!")
                        })}
                    >
                        콜백 함수 테스트
                    </Button>
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
                    <Button onClick={() => app.showConfirm(
                        "정말 계속하시겠습니까?",
                        {
                            onConfirm: () => app.showAlert("확인을 선택하셨습니다.", { type: "success" }),
                            onCancel: () => app.showAlert("취소하셨습니다.", { type: "info" })
                        }
                    )}>
                        기본 확인
                    </Button>
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
                        <Button
                            onClick={() => app.showConfirm("이 작업은 되돌릴 수 없습니다.\n계속하시겠습니까?", {
                                title: "주의",
                                type: "warning",
                                confirmText: "계속",
                                cancelText: "중단"
                            })}
                        >
                            경고
                        </Button>
                        <Button
                            onClick={() => app.showConfirm("모든 데이터가 삭제됩니다.\n정말 삭제하시겠습니까?", {
                                title: "삭제 확인",
                                type: "danger",
                                confirmText: "삭제",
                                cancelText: "취소"
                            })}
                        >
                            위험
                        </Button>
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
            <section className="mb-12 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">목차</h2>
                <ul className="space-y-2">
                    <li>
                        <a href="#data-structure" className="text-blue-600 hover:text-blue-800">
                            1. 기본 데이터 구조
                        </a>
                        <ul className="ml-4 mt-1 space-y-1">
                            <li>
                                <a href="#easy-obj" className="text-blue-600 hover:text-blue-800">
                                    - EasyObj
                                </a>
                            </li>
                            <li>
                                <a href="#easy-list" className="text-blue-600 hover:text-blue-800">
                                    - EasyList
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="#buttons" className="text-blue-600 hover:text-blue-800">
                            2. 버튼 (Button)
                        </a>
                        <ul className="ml-4 mt-1 space-y-1">
                            <li>
                                <a href="#button-variants" className="text-blue-600 hover:text-blue-800">
                                    - 버튼 종류
                                </a>
                            </li>
                            <li>
                                <a href="#button-sizes" className="text-blue-600 hover:text-blue-800">
                                    - 버튼 크기
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="#inputs" className="text-blue-600 hover:text-blue-800">
                            3. 입력 (Input)
                        </a>
                        <ul className="ml-4 mt-1 space-y-1">
                            <li>
                                <a href="#input-basic" className="text-blue-600 hover:text-blue-800">
                                    - 기본 입력
                                </a>
                            </li>
                            <li>
                                <a href="#input-mask" className="text-blue-600 hover:text-blue-800">
                                    - 마스크 입력
                                </a>
                            </li>
                            <li>
                                <a href="#input-filter" className="text-blue-600 hover:text-blue-800">
                                    - 필터 입력
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="#selects" className="text-blue-600 hover:text-blue-800">
                            4. 선택 (Select)
                        </a>
                        <ul className="ml-4 mt-1 space-y-1">
                            <li>
                                <a href="#select-basic" className="text-blue-600 hover:text-blue-800">
                                    - 기본 사용법
                                </a>
                            </li>
                            <li>
                                <a href="#select-states" className="text-blue-600 hover:text-blue-800">
                                    - 상태
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="#checkboxes" className="text-blue-600 hover:text-blue-800">
                            5. 체크박스 (Checkbox)
                        </a>
                        <ul className="ml-4 mt-1 space-y-1">
                            <li>
                                <a href="#checkbox-basic" className="text-blue-600 hover:text-blue-800">
                                    - 기본 사용법
                                </a>
                            </li>
                            <li>
                                <a href="#checkbox-states" className="text-blue-600 hover:text-blue-800">
                                    - 상태
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="#checkbuttons" className="text-blue-600 hover:text-blue-800">
                            6. 체크버튼 (CheckButton)
                        </a>
                        <ul className="ml-4 mt-1 space-y-1">
                            <li>
                                <a href="#checkbutton-basic" className="text-blue-600 hover:text-blue-800">
                                    - 기본 사용법
                                </a>
                            </li>
                            <li>
                                <a href="#checkbutton-states" className="text-blue-600 hover:text-blue-800">
                                    - 상태
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="#radioboxes" className="text-blue-600 hover:text-blue-800">
                            7. 라디오박스 (Radiobox)
                        </a>
                        <ul className="ml-4 mt-1 space-y-1">
                            <li>
                                <a href="#radiobox-basic" className="text-blue-600 hover:text-blue-800">
                                    - 기본 사용법
                                </a>
                            </li>
                            <li>
                                <a href="#radiobox-states" className="text-blue-600 hover:text-blue-800">
                                    - 상태와 그룹
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="#radiobuttons" className="text-blue-600 hover:text-blue-800">
                            8. 라디오버튼 (RadioButton)
                        </a>
                        <ul className="ml-4 mt-1 space-y-1">
                            <li>
                                <a href="#radiobutton-basic" className="text-blue-600 hover:text-blue-800">
                                    - 기본 사용법
                                </a>
                            </li>
                            <li>
                                <a href="#radiobutton-states" className="text-blue-600 hover:text-blue-800">
                                    - 상태와 스타일
                                </a>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <a href="#icons" className="text-blue-600 hover:text-blue-800">
                            9. 아이콘 (Icon)
                        </a>
                    </li>
                    <li>
                        <a href="#loading" className="text-blue-600 hover:text-blue-800">
                            10. 로딩 스피너 (Loading)
                        </a>
                    </li>
                    <li>
                        <a href="#alerts" className="text-blue-600 hover:text-blue-800">
                            11. 알림 (Alert)
                        </a>
                    </li>
                    <li>
                        <a href="#confirms" className="text-blue-600 hover:text-blue-800">
                            12. 확인 대화상자 (Confirm)
                        </a>
                    </li>
                </ul>
            </section>

            {/* 데이터 구조 섹션 */}
            <section id="data-structure" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">1. 기본 데이터 구조</h2>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">데이터 구조 설명</h4>
                    <div className="space-y-4">
                        <div>
                            <h5 className="font-medium text-sm mb-1">EasyObj</h5>
                            <p className="text-sm text-gray-600">
                                Object 기반의 반응형 데이터 구조입니다. 내부 값이 변경되면 자동으로 컴포넌트가 업데이트됩니다.<br />
                                주로 폼 데이터나 상태 관리에 사용됩니다.
                            </p>
                            <pre className="mt-2 bg-white p-2 rounded text-xs">
                                {`// 생성
const obj = EasyObj({ name: '', age: 0 });

// 값 변경
obj.name = '홍길동';  // 자동으로 컴포넌트 업데이트

// 중첩 객체도 지원
obj.user = { id: 1, role: 'admin' };
obj.user.role = 'user';  // 중첩된 값도 반응형`}
                            </pre>
                        </div>
                        <div>
                            <h5 className="font-medium text-sm mb-1">EasyList</h5>
                            <p className="text-sm text-gray-600">
                                Array 기반의 반응형 데이터 구조입니다. 배열 메서드(push, pop 등)를 사용해도 반응성이 유지됩니다.<br />
                                주로 목록 데이터나 반복되는 UI 요소의 데이터 관리에 사용됩니다.
                            </p>
                            <pre className="mt-2 bg-white p-2 rounded text-xs">
                                {`// 생성
const list = EasyList([{ id: 1, name: '항목 1' }]);

// 배열 메서드 사용
list.push({ id: 2, name: '항목 2' });  // 자동으로 컴포넌트 업데이트
list[0].name = '수정된 항목';  // 개별 항목 수정도 반응형

// 고급 기능
list.forAll(item => {  // 모든 항목 순회
    item.checked = false;
});`}
                            </pre>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div id="easy-obj">
                        <h3 className="text-lg font-medium mb-2">EasyObj</h3>
                        <pre className="bg-gray-50 p-4 rounded-md overflow-auto">
                            {JSON.stringify(dataObj, null, 2)}
                        </pre>
                    </div>
                    <div id="easy-list">
                        <h3 className="text-lg font-medium mb-2">EasyList</h3>
                        <pre className="bg-gray-50 p-4 rounded-md overflow-auto">
                            {JSON.stringify(dataList, null, 2)}
                        </pre>
                    </div>
                </div>
            </section>

            {/* 버튼 섹션 */}
            <section id="buttons" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">2. 버튼 (Button)</h2>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">커스텀 스타일링</h4>
                    <p className="text-sm text-gray-600">
                        Button 컴포넌트는 className prop을 통해 Tailwind CSS로 스타일을 커스터마이징할 수 있습니다.<br />
                        기본 스타일을 유지하면서 추가적인 스타일을 적용하거나, 완전히 새로운 스타일을 정의할 수 있습니다.
                    </p>
                    <pre className="mt-2 bg-white p-2 rounded text-xs">
                        {`// 기본 스타일에 추가
<Button className="shadow-lg transform hover:scale-105">
    그림자와 호버 효과
</Button>

// 완전히 새로운 스타일
<Button className="bg-gradient-to-r from-purple-500 to-pink-500">
    그라데이션 버튼
</Button>`}
                    </pre>
                </div>
                <div id="button-variants" className="mb-8">
                    <h3 className="text-lg font-medium mb-4">버튼 종류</h3>
                    <div className="grid grid-cols-4 gap-8">
                        {buttonExamples.slice(0, 9).map((example, index) => (
                            <div key={index}>
                                {example.component}
                                <div className="mt-2 text-sm text-gray-600">
                                    {example.description}
                                </div>
                                <div
                                    className="mt-1 bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleCodeClick(example.code)}
                                >
                                    {example.code}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div id="button-sizes" className="mb-8">
                    <h3 className="text-lg font-medium mb-4">버튼 크기</h3>
                    <div className="grid grid-cols-4 gap-8">
                        {buttonExamples.slice(9).map((example, index) => (
                            <div key={index}>
                                {example.component}
                                <div className="mt-2 text-sm text-gray-600">
                                    {example.description}
                                </div>
                                <div
                                    className="mt-1 bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleCodeClick(example.code)}
                                >
                                    {example.code}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 인풋 섹션 */}
            <section id="inputs" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">3. 입력 (Input)</h2>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">데이터 바인딩</h4>
                    <p className="text-sm text-gray-600">
                        Input 컴포넌트는 dataObj와 dataKey를 통해 양방향 바인딩을 지원합니다.<br />
                        예: dataObj.email이 변경되면 input 값이 변경되고, input 값이 변경되면 dataObj.email이 자동으로 업데이트됩니다.
                    </p>
                    <pre className="mt-2 bg-white p-2 rounded text-xs">
                        dataObj.email = "test@example.com"  // Input 값이 자동 변경됨
                    // Input에 값 입력 시 dataObj.email이 자동 업데이트됨
                    </pre>
                </div>
                <div id="input-basic" className="mb-8">
                    <h3 className="text-lg font-medium mb-4">기본 입력</h3>
                    <div className="grid grid-cols-3 gap-8">
                        {inputExamples.slice(0, 2).map((example, index) => (
                            <div key={index}>
                                {example.component}
                                <div className="mt-2 text-sm text-gray-600">
                                    {example.description}
                                </div>
                                <div
                                    className="mt-1 bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleCodeClick(example.code)}
                                >
                                    {example.code}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div id="input-mask" className="mb-8">
                    <h3 className="text-lg font-medium mb-4">마스크 입력</h3>
                    <div className="grid grid-cols-3 gap-8">
                        {inputExamples.slice(2, 5).map((example, index) => (
                            <div key={index}>
                                {example.component}
                                <div className="mt-2 text-sm text-gray-600">
                                    {example.description}
                                </div>
                                <div
                                    className="mt-1 bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleCodeClick(example.code)}
                                >
                                    {example.code}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div id="input-filter" className="mb-8">
                    <h3 className="text-lg font-medium mb-4">필터 입력</h3>
                    <div className="grid grid-cols-3 gap-8">
                        {inputExamples.slice(5).map((example, index) => (
                            <div key={index}>
                                {example.component}
                                <div className="mt-2 text-sm text-gray-600">
                                    {example.description}
                                </div>
                                <div
                                    className="mt-1 bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleCodeClick(example.code)}
                                >
                                    {example.code}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Select 섹션 */}
            <section id="selects" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">4. 선택 (Select)</h2>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">데이터 바인딩</h4>
                    <p className="text-sm text-gray-600">
                        Select 컴포넌트는 dataList의 selected 속성을 통해 선택 상태를 관리합니다.<br />
                        옵션 선택 시 해당 항목의 selected가 true로, 나머지는 false로 자동 변경됩니다.
                    </p>
                    <pre className="mt-2 bg-white p-2 rounded text-xs">
                        {`// 선택 시 dataList 내부 데이터가 다음과 같이 변경됨
[
    { id: 1, name: '항목 1', selected: false },
    { id: 2, name: '항목 2', selected: true },  // 선택된 항목
    { id: 3, name: '항목 3', selected: false }
]`}
                    </pre>
                </div>
                <div id="select-basic" className="mb-8">
                    <h3 className="text-lg font-medium mb-4">기본 사용법</h3>
                    <div className="grid grid-cols-2 gap-8">
                        {selectExamples.slice(0, 2).map((example, index) => (
                            <div key={index}>
                                {example.component}
                                <div className="mt-2 text-sm text-gray-600">
                                    {example.description}
                                </div>
                                <div
                                    className="mt-1 bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleCodeClick(example.code)}
                                >
                                    <pre className="whitespace-pre-wrap">{example.code}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div id="select-states" className="mb-8">
                    <h3 className="text-lg font-medium mb-4">상태</h3>
                    <div className="grid grid-cols-2 gap-8">
                        {selectExamples.slice(2).map((example, index) => (
                            <div key={index}>
                                {example.component}
                                <div className="mt-2 text-sm text-gray-600">
                                    {example.description}
                                </div>
                                <div
                                    className="mt-1 bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleCodeClick(example.code)}
                                >
                                    <pre className="whitespace-pre-wrap">{example.code}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Checkbox 섹션 */}
            <section id="checkboxes" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">5. 체크박스 (Checkbox)</h2>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">데이터 바인딩</h4>
                    <p className="text-sm text-gray-600">
                        Checkbox 컴포넌트는 dataObj와 dataKey를 통해 양방향 바인딩을 지원합니다.<br />
                        체크박스 상태가 변경되면 dataObj의 해당 값이 자동으로 업데이트됩니다.<br />
                        name prop이 없을 경우 dataKey 또는 label을 name으로 사용합니다.
                    </p>
                    <pre className="mt-2 bg-white p-2 rounded text-xs">
                        {`// 데이터 바인딩 예시
const obj = EasyObj({ agree: false });

<Checkbox
    name="agreement"  // form 제출 시 사용될 이름 (생략 시 dataKey 또는 label 사용)
    label="동의합니다"
    dataObj={obj}
    dataKey="agree"
/>

// 체크박스 선택 시 obj.agree가 true로 변경됨
// obj.agree = true로 설정하면 체크박스가 자동으로 체크됨`}
                    </pre>
                </div>
                <div id="checkbox-basic" className="mb-8">
                    <h3 className="text-lg font-medium mb-4">기본 사용법</h3>
                    <div className="grid grid-cols-2 gap-8">
                        {checkboxExamples.slice(0, 2).map((example, index) => (
                            <div key={index} className="space-y-4">
                                {example.component}
                                <div className="text-sm text-gray-600">
                                    {example.description}
                                </div>
                                <div
                                    className="bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleCodeClick(example.code)}
                                >
                                    <pre className="whitespace-pre-wrap">{example.code}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div id="checkbox-states" className="mb-8">
                    <h3 className="text-lg font-medium mb-4">상태</h3>
                    <div className="grid grid-cols-2 gap-8">
                        {checkboxExamples.slice(2).map((example, index) => (
                            <div key={index} className="space-y-4">
                                {example.component}
                                <div className="text-sm text-gray-600">
                                    {example.description}
                                </div>
                                <div
                                    className="bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleCodeClick(example.code)}
                                >
                                    <pre className="whitespace-pre-wrap">{example.code}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CheckButton 섹션 */}
            <section id="checkbuttons" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">6. 체크버튼 (CheckButton)</h2>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">데이터 바인딩</h4>
                    <p className="text-sm text-gray-600">
                        CheckButton 컴포넌트는 Checkbox와 동일한 방식으로 dataObj와 dataKey를 통해 양방향 바인딩을 지원합니다.<br />
                        버튼 형태로 체크박스 기능을 제공합니다.
                    </p>
                    <pre className="mt-2 bg-white p-2 rounded text-xs">
                        {`// 데이터 바인딩 예시
const obj = EasyObj({ option: false });

<CheckButton
    dataObj={obj}
    dataKey="option"
>
    옵션 선택
</CheckButton>

// 버튼 클릭 시 obj.option이 toggle됨
// obj.option = true로 설정하면 버튼이 자동으로 선택됨`}
                    </pre>
                </div>
                <div id="checkbutton-basic" className="mb-8">
                    <h3 className="text-lg font-medium mb-4">기본 사용법</h3>
                    <div className="grid grid-cols-2 gap-8">
                        {checkButtonExamples.slice(0, 2).map((example, index) => (
                            <div key={index} className="space-y-4">
                                {example.component}
                                <div className="text-sm text-gray-600">
                                    {example.description}
                                </div>
                                <div
                                    className="bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleCodeClick(example.code)}
                                >
                                    <pre className="whitespace-pre-wrap">{example.code}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div id="checkbutton-states" className="mb-8">
                    <h3 className="text-lg font-medium mb-4">상태</h3>
                    <div className="grid grid-cols-2 gap-8">
                        {checkButtonExamples.slice(2).map((example, index) => (
                            <div key={index} className="space-y-4">
                                {example.component}
                                <div className="text-sm text-gray-600">
                                    {example.description}
                                </div>
                                <div
                                    className="bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleCodeClick(example.code)}
                                >
                                    <pre className="whitespace-pre-wrap">{example.code}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Radiobox 섹션 */}
            <section id="radioboxes" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">7. 라디오박스 (Radiobox)</h2>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">데이터 바인딩</h4>
                    <p className="text-sm text-gray-600">
                        Radiobox 컴포넌트는 dataObj와 dataKey를 통해 양방향 바인딩을 지원합니다.<br />
                        같은 name을 가진 라디오박스 그룹에서 선택된 value가 dataObj에 저장됩니다.<br />
                        name prop이 없을 경우 dataKey 또는 label을 name으로 사용하며, 같은 그룹의 라디오박스들은 동일한 name을 가져야 합니다.
                    </p>
                    <pre className="mt-2 bg-white p-2 rounded text-xs">
                        {`// 데이터 바인딩 예시
const obj = EasyObj({ selectedJob: '' });

<Radiobox
    name="job"  // 같은 그룹의 라디오박스들은 동일한 name을 가져야 함 (생략 시 dataKey 또는 label 사용)
    label="개발자"
    value="developer"
    dataObj={obj}
    dataKey="selectedJob"
/>
<Radiobox
    name="job"  // 위와 동일한 name을 사용하여 같은 그룹으로 묶임
    label="디자이너"
    value="designer"
    dataObj={obj}
    dataKey="selectedJob"
/>

// 라디오박스 선택 시 obj.selectedJob이 선택된 value로 변경됨
// obj.selectedJob = "developer"로 설정하면 해당 라디오박스가 자동으로 선택됨`}
                    </pre>
                </div>
                <div id="radiobox-basic" className="mb-8">
                    <h3 className="text-lg font-medium mb-4">기본 사용법</h3>
                    <div className="grid grid-cols-2 gap-8">
                        {radioboxExamples.slice(0, 2).map((example, index) => (
                            <div key={index} className="space-y-4">
                                {example.component}
                                <div className="text-sm text-gray-600">
                                    {example.description}
                                </div>
                                <div
                                    className="bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleCodeClick(example.code)}
                                >
                                    <pre className="whitespace-pre-wrap">{example.code}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div id="radiobox-states" className="mb-8">
                    <h3 className="text-lg font-medium mb-4">상태와 그룹</h3>
                    <div className="grid grid-cols-2 gap-8">
                        {radioboxExamples.slice(2).map((example, index) => (
                            <div key={index} className="space-y-4">
                                {example.component}
                                <div className="text-sm text-gray-600">
                                    {example.description}
                                </div>
                                <div
                                    className="bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleCodeClick(example.code)}
                                >
                                    <pre className="whitespace-pre-wrap">{example.code}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* RadioButton 섹션 */}
            <section id="radiobuttons" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">8. 라디오버튼 (RadioButton)</h2>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">데이터 바인딩</h4>
                    <p className="text-sm text-gray-600">
                        RadioButton 컴포넌트는 Radiobox와 동일한 방식으로 dataObj와 dataKey를 통해 양방향 바인딩을 지원합니다.<br />
                        버튼 형태로 라디오박스 기능을 제공합니다.
                    </p>
                    <pre className="mt-2 bg-white p-2 rounded text-xs">
                        {`// 데이터 바인딩 예시
const obj = EasyObj({ selectedTheme: '' });

<RadioButton
    name="theme"
    value="light"
    dataObj={obj}
    dataKey="selectedTheme"
>
    라이트 모드
</RadioButton>

// 버튼 클릭 시 obj.selectedTheme이 "light"로 변경됨
// obj.selectedTheme = "light"로 설정하면 해당 버튼이 자동으로 선택됨`}
                    </pre>
                </div>
                <div id="radiobutton-basic" className="mb-8">
                    <h3 className="text-lg font-medium mb-4">기본 사용법</h3>
                    <div className="grid grid-cols-2 gap-8">
                        {radioButtonExamples.slice(0, 2).map((example, index) => (
                            <div key={index} className="space-y-4">
                                {example.component}
                                <div className="text-sm text-gray-600">
                                    {example.description}
                                </div>
                                <div
                                    className="bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleCodeClick(example.code)}
                                >
                                    <pre className="whitespace-pre-wrap">{example.code}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div id="radiobutton-states" className="mb-8">
                    <h3 className="text-lg font-medium mb-4">상태와 스타일</h3>
                    <div className="grid grid-cols-2 gap-8">
                        {radioButtonExamples.slice(2).map((example, index) => (
                            <div key={index} className="space-y-4">
                                {example.component}
                                <div className="text-sm text-gray-600">
                                    {example.description}
                                </div>
                                <div
                                    className="bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleCodeClick(example.code)}
                                >
                                    <pre className="whitespace-pre-wrap">{example.code}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 아이콘 섹션 */}
            <section id="icons" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">9. 아이콘 (Icon)</h2>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">사용 가능한 아이콘 세트</h4>
                    <ul className="list-disc list-inside text-sm space-y-2">
                        <li className="flex items-center gap-4">
                            <span>Material Design Icons (md:)</span>
                            <a href="https://react-icons.github.io/react-icons/icons/md/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 whitespace-nowrap">
                                아이콘 보기 →
                            </a>
                        </li>
                        <li className="flex items-center gap-4">
                            <span>Bootstrap Icons (bs:)</span>
                            <a href="https://react-icons.github.io/react-icons/icons/bs/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 whitespace-nowrap">
                                아이콘 보기 →
                            </a>
                        </li>
                        <li className="flex items-center gap-4">
                            <span>Feather Icons (fi:)</span>
                            <a href="https://react-icons.github.io/react-icons/icons/fi/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 whitespace-nowrap">
                                아이콘 보기 →
                            </a>
                        </li>
                        <li className="flex items-center gap-4">
                            <span>Ant Design Icons (ai:)</span>
                            <a href="https://react-icons.github.io/react-icons/icons/ai/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 whitespace-nowrap">
                                아이콘 보기 →
                            </a>
                        </li>
                        <li className="flex items-center gap-4">
                            <span>Remix Icons (ri:)</span>
                            <a href="https://react-icons.github.io/react-icons/icons/ri/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 whitespace-nowrap">
                                아이콘 보기 →
                            </a>
                        </li>
                        <li className="flex items-center gap-4">
                            <span>Heroicons (hi:)</span>
                            <a href="https://react-icons.github.io/react-icons/icons/hi/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 whitespace-nowrap">
                                아이콘 보기 →
                            </a>
                        </li>
                        <li className="flex items-center gap-4">
                            <span>Ionicons (io:)</span>
                            <a href="https://react-icons.github.io/react-icons/icons/io5/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 whitespace-nowrap">
                                아이콘 보기 →
                            </a>
                        </li>
                    </ul>
                    <div className="mt-4 text-sm text-gray-600">
                        * 각 아이콘 세트의 이름을 클릭하면 사용 가능한 모든 아이콘을 확인할 수 있습니다.
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-8">
                    {iconExamples.map((example, index) => (
                        <div key={index} className="space-y-4">
                            {example.component}
                            <div className="text-sm text-gray-600">
                                {example.description}
                            </div>
                            <div
                                className="bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                onClick={() => handleCodeClick(example.code)}
                            >
                                <pre className="whitespace-pre-wrap">{example.code}</pre>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 복사 알림 */}
            {copied && (
                <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded shadow">
                    클립보드에 복사되었습니다!
                </div>
            )}

            {/* 로딩 스피너 섹션 */}
            <section id="loading" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">10. 로딩 스피너 (Loading)</h2>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">전역 로딩 상태 관리</h4>
                    <p className="text-sm text-gray-600">
                        AppContext를 통해 전역적으로 로딩 상태를 관리할 수 있습니다.<br />
                        setLoading 함수를 사용하여 로딩 스피너를 표시하거나 숨길 수 있습니다.
                    </p>
                    <pre className="mt-2 bg-white p-2 rounded text-xs">
                        {`// AppContext 사용하기
import { useContext } from 'react';
import { AppContext } from '@/common/share/AppContext';

// 컴포넌트 내부
const app = useContext(AppContext);

// 로딩 시작
app.setLoading(true);

// 로딩 종료
app.setLoading(false);`}
                    </pre>
                </div>
                <div className="grid grid-cols-1 gap-8">
                    {loadingExamples.map((example, index) => (
                        <div key={index} className="space-y-4">
                            {example.component}
                            <div className="text-sm text-gray-600">
                                {example.description}
                            </div>
                            <div
                                className="bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                onClick={() => handleCodeClick(example.code)}
                            >
                                <pre className="whitespace-pre-wrap">{example.code}</pre>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Alert 섹션 */}
            <section id="alerts" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">11. 알림 (Alert)</h2>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">전역 알림 시스템</h4>
                    <p className="text-sm text-gray-600">
                        AppContext를 통해 전역적으로 알림을 표시할 수 있습니다.<br />
                        4가지 유형(info, success, warning, error)의 알림을 지원하며,<br />
                        제목, 메시지, 콜백 함수 등을 설정할 수 있습니다.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    {alertExamples.map((example, index) => (
                        <div key={index} className="space-y-4">
                            {example.component}
                            <div className="text-sm text-gray-600">
                                {example.description}
                            </div>
                            <div
                                className="bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                onClick={() => handleCodeClick(example.code)}
                            >
                                <pre className="whitespace-pre-wrap">{example.code}</pre>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Confirm 섹션 */}
            <section id="confirms" className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">12. 확인 대화상자 (Confirm)</h2>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">전역 확인 대화상자 시스템</h4>
                    <p className="text-sm text-gray-600">
                        AppContext를 통해 전역적으로 확인 대화상자를 표시할 수 있습니다.<br />
                        3가지 유형(info, warning, danger)의 스타일을 지원하며,<br />
                        제목, 메시지, 버튼 텍스트, 콜백 함수 등을 설정할 수 있습니다.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                    {confirmExamples.map((example, index) => (
                        <div key={index} className="space-y-4">
                            {example.component}
                            <div className="text-sm text-gray-600">
                                {example.description}
                            </div>
                            <div
                                className="bg-gray-50 p-2 rounded text-xs font-mono cursor-pointer hover:bg-gray-100"
                                onClick={() => handleCodeClick(example.code)}
                            >
                                <pre className="whitespace-pre-wrap">{example.code}</pre>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Component;