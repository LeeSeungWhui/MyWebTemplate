/**
 * 파일명: RadioButtonExamples.jsx
 * 설명: 앱용 RadioButton 컴포넌트 예제
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { useState } from "react";
import { View, Text } from "react-native";
import * as Lib from "../../lib";

export const RadioButtonExamples = () => {
  const dataObj = Lib.EasyObj({
    size: "medium",
    theme: "",
  });
  const [lang, setLang] = useState("kr");

  return [
    {
      component: (
        <View className="flex-row space-x-2">
          <Lib.RadioButton
            name="size"
            value="small"
            dataObj={dataObj}
            dataKey="size"
          >
            Small
          </Lib.RadioButton>
          <Lib.RadioButton
            name="size"
            value="medium"
            dataObj={dataObj}
            dataKey="size"
          >
            Medium
          </Lib.RadioButton>
          <Lib.RadioButton
            name="size"
            value="large"
            dataObj={dataObj}
            dataKey="size"
          >
            Large
          </Lib.RadioButton>
        </View>
      ),
      description: "dataObj/dataKey로 하나만 선택되는 기본 라디오버튼.",
      code: `const dataObj = EasyObj({ size: 'medium' });

<View className="flex-row space-x-2">
  <RadioButton name="size" value="small" dataObj={dataObj} dataKey="size">Small</RadioButton>
  <RadioButton name="size" value="medium" dataObj={dataObj} dataKey="size">Medium</RadioButton>
  <RadioButton name="size" value="large" dataObj={dataObj} dataKey="size">Large</RadioButton>
</View>`,
    },
    {
      component: (
        <View className="space-x-2">
          <Lib.RadioButton name="disabled" value="d1" disabled>
            비활성화 1
          </Lib.RadioButton>
          <Lib.RadioButton name="disabled" value="d2" disabled checked>
            비활성화 2
          </Lib.RadioButton>
        </View>
      ),
      description: "비활성화 상태.",
      code: `<RadioButton name="disabled" value="d1" disabled>비활성화 1</RadioButton>
<RadioButton name="disabled" value="d2" disabled checked>비활성화 2</RadioButton>`,
    },
    {
      component: (
        <View className="space-y-2">
          <Lib.RadioButton
            name="theme"
            value="light"
            dataObj={dataObj}
            dataKey="theme"
            color="#FF6B6B"
            className="w-full"
          >
            라이트
          </Lib.RadioButton>
          <Lib.RadioButton
            name="theme"
            value="dark"
            dataObj={dataObj}
            dataKey="theme"
            color="#4D96FF"
            className="w-full"
          >
            다크
          </Lib.RadioButton>
          <Lib.RadioButton
            name="theme"
            value="system"
            dataObj={dataObj}
            dataKey="theme"
            color="#6BCB77"
            className="w-full"
          >
            시스템
          </Lib.RadioButton>
        </View>
      ),
      description: "커스텀 색상 적용.",
      code: `const dataObj = EasyObj({ theme: '' });

<View className="space-y-2">
  <RadioButton
    name="theme"
    value="light"
    dataObj={dataObj}
    dataKey="theme"
    color="#FF6B6B"
    className="w-full"
  >
    라이트
  </RadioButton>
  <RadioButton
    name="theme"
    value="dark"
    dataObj={dataObj}
    dataKey="theme"
    color="#4D96FF"
    className="w-full"
  >
    다크
  </RadioButton>
  <RadioButton
    name="theme"
    value="system"
    dataObj={dataObj}
    dataKey="theme"
    color="#6BCB77"
    className="w-full"
  >
    시스템
  </RadioButton>
</View>`,
    },
    {
      component: (
        <View className="space-y-2">
          <View className="flex-row space-x-2">
            <Lib.RadioButton
              name="lang"
              value="kr"
              checked={lang === "kr"}
              onValueChange={setLang}
            >
              한국어
            </Lib.RadioButton>
            <Lib.RadioButton
              name="lang"
              value="en"
              checked={lang === "en"}
              onValueChange={setLang}
            >
              English
            </Lib.RadioButton>
          </View>
          <Text className="text-xs text-gray-600">선택된 언어: {lang}</Text>
        </View>
      ),
      description: "checked/onValueChange 컨트롤드 패턴.",
      code: `const [lang, setLang] = useState('kr');

<View className="flex-row space-x-2">
  <RadioButton name="lang" value="kr" checked={lang === 'kr'} onValueChange={setLang}>한국어</RadioButton>
  <RadioButton name="lang" value="en" checked={lang === 'en'} onValueChange={setLang}>English</RadioButton>
</View>`,
    },
  ];
};
