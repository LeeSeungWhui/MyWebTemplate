/**
 * 파일명: CheckboxExamples.jsx
 * 설명: 앱용 Checkbox 컴포넌트 예제
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { useState } from 'react';
import { View, Text } from 'react-native';
import * as Lib from '../../lib';

export const CheckboxExamples = () => {
  const dataObj = Lib.EasyObj({
    basic: false,
    terms: false,
    marketing: true,
    primary: false,
    red: false,
    green: false,
  });

  const [controlled, setControlled] = useState(false);

  return [
    {
      component: (
        <Lib.Checkbox
          label="기본 체크박스"
          dataObj={dataObj}
          dataKey="basic"
        />
      ),
      description: 'dataObj/dataKey로 바인딩하는 기본 체크박스.',
      code: `const dataObj = EasyObj({ basic: false });

<Checkbox
  label="기본 체크박스"
  dataObj={dataObj}
  dataKey="basic"
/>`,
    },
    {
      component: (
        <View className="space-y-2">
          <Lib.Checkbox
            label="제어 모드"
            checked={controlled}
            onChange={(e) => setControlled(e.target.checked)}
          />
          <Text className="text-xs text-gray-600">
            현재 상태: {controlled ? '체크됨' : '체크 해제됨'}
          </Text>
        </View>
      ),
      description: 'checked/onChange로 외부 상태와 동기화하는 컨트롤드 패턴.',
      code: `const [checked, setChecked] = useState(false);

<Checkbox
  label="제어 모드"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>`,
    },
    {
      component: (
        <View className="space-y-2">
          <Lib.Checkbox
            label="비활성화"
            disabled
          />
          <Lib.Checkbox
            label="기본 색상 (primary)"
            dataObj={dataObj}
            dataKey="primary"
            color="primary"
          />
          <Lib.Checkbox
            label="커스텀 빨간색"
            dataObj={dataObj}
            dataKey="red"
            color="#EF4444"
          />
          <Lib.Checkbox
            label="커스텀 초록색"
            dataObj={dataObj}
            dataKey="green"
            color="#22C55E"
          />
        </View>
      ),
      description: '비활성화와 다양한 색상 변형 사례.',
      code: `const dataObj = EasyObj({ primary: false, red: false, green: false });

<Checkbox label="비활성화" disabled />
<Checkbox
  label="기본 색상 (primary)"
  dataObj={dataObj}
  dataKey="primary"
  color="primary"
/>
<Checkbox
  label="커스텀 빨간색"
  dataObj={dataObj}
  dataKey="red"
  color="#EF4444"
/>
<Checkbox
  label="커스텀 초록색"
  dataObj={dataObj}
  dataKey="green"
  color="#22C55E"
/>`,
    },
    {
      component: (
        <View className="space-y-2">
          <Text className="text-sm font-semibold text-gray-800">약관 동의</Text>
          <Lib.Checkbox
            name="terms"
            label="[필수] 서비스 이용약관 동의"
            dataObj={dataObj}
            dataKey="terms"
          />
          <Lib.Checkbox
            name="marketing"
            label="[선택] 마케팅 정보 수신 동의"
            dataObj={dataObj}
            dataKey="marketing"
          />
        </View>
      ),
      description: '실제 폼에서 사용하는 약관 동의 패턴.',
      code: `const dataObj = EasyObj({ terms: false, marketing: true });

<Checkbox
  name="terms"
  label="[필수] 서비스 이용약관 동의"
  dataObj={dataObj}
  dataKey="terms"
/>
<Checkbox
  name="marketing"
  label="[선택] 마케팅 정보 수신 동의"
  dataObj={dataObj}
  dataKey="marketing"
/>`,
    },
  ];
};
