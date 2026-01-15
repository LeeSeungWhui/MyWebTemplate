/**
 * 파일명: CheckButtonExamples.jsx
 * 설명: 앱용 CheckButton 컴포넌트 예제
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { useState } from 'react';
import { View, Text } from 'react-native';
import * as Lib from '../../lib';

export const CheckButtonExamples = () => {
  const dataObj = Lib.EasyObj({
    primary: false,
    alt: true,
  });
  const [controlled, setControlled] = useState(false);

  return [
    {
      component: (
        <View className="flex-row space-x-2">
          <Lib.CheckButton dataObj={dataObj} dataKey="primary">
            기본 체크버튼
          </Lib.CheckButton>
          <Lib.CheckButton disabled>비활성화</Lib.CheckButton>
        </View>
      ),
      description: 'dataObj/dataKey로 상태를 바인딩하는 기본 사용법.',
      code: `const dataObj = EasyObj({ primary: false });

<CheckButton dataObj={dataObj} dataKey="primary">기본 체크버튼</CheckButton>
<CheckButton disabled>비활성화</CheckButton>`,
    },
    {
      component: (
        <View className="space-y-2">
          <Lib.CheckButton
            color="#22C55E"
            dataObj={dataObj}
            dataKey="alt"
          >
            커스텀 색상
          </Lib.CheckButton>
          <Lib.CheckButton color="#EF4444">강조 버튼</Lib.CheckButton>
        </View>
      ),
      description: 'HEX 등 커스텀 색상 적용.',
      code: `const dataObj = EasyObj({ alt: true });

<CheckButton color="#22C55E" dataObj={dataObj} dataKey="alt">커스텀 색상</CheckButton>
<CheckButton color="#EF4444">강조 버튼</CheckButton>`,
    },
    {
      component: (
        <View className="space-y-2">
          <Lib.CheckButton
            checked={controlled}
            onValueChange={setControlled}
          >
            컨트롤드
          </Lib.CheckButton>
          <Text className="text-xs text-gray-600">
            현재 상태: {controlled ? '선택' : '해제'}
          </Text>
        </View>
      ),
      description: 'checked/onValueChange로 외부 상태와 동기화.',
      code: `const [checked, setChecked] = useState(false);
<CheckButton checked={checked} onValueChange={setChecked}>컨트롤드</CheckButton>`,
    },
  ];
};
