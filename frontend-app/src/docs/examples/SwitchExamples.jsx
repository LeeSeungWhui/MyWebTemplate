/**
 * 파일명: SwitchExamples.jsx
 * 설명: 앱용 Switch 컴포넌트 예제
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { useState } from "react";
import { View, Text } from "react-native";
import * as Lib from "../../lib";

export const SwitchExamples = () => {
  const dataObj = Lib.EasyObj({
    enabled: false,
    notifications: true,
  });
  const [controlled, setControlled] = useState(false);

  return [
    {
      component: (
        <View className="space-y-2">
          <Lib.Switch
            dataObj={dataObj}
            dataKey="enabled"
            label={`바운드: ${dataObj.enabled ? "ON" : "OFF"}`}
          />
          <Text className="text-xs text-gray-600">
            dataObj.enabled = {String(dataObj.enabled)}
          </Text>
        </View>
      ),
      description: "dataObj/dataKey로 상태를 바인딩하는 기본 패턴.",
      code: `const dataObj = EasyObj({ enabled: false });

<Switch
  dataObj={dataObj}
  dataKey="enabled"
  label={\`바운드: \${dataObj.enabled ? 'ON' : 'OFF'}\`}
/>`,
    },
    {
      component: (
        <View className="space-y-2">
          <Lib.Switch
            checked={controlled}
            onValueChange={setControlled}
            label={`컨트롤드: ${controlled ? "ON" : "OFF"}`}
          />
          <Text className="text-xs text-gray-600">
            외부 상태와 동기화되는 컨트롤드 모드.
          </Text>
        </View>
      ),
      description: "checked/onValueChange 조합으로 외부 상태 제어.",
      code: `const [checked, setChecked] = useState(false);

<Switch
  checked={checked}
  onValueChange={setChecked}
  label={\`컨트롤드: \${checked ? 'ON' : 'OFF'}\`}
/>`,
    },
    {
      component: (
        <View className="space-y-2">
          <Lib.Switch label="비활성화" disabled />
          <Lib.Switch label="기본 ON" defaultChecked />
        </View>
      ),
      description: "disabled와 defaultChecked 조합 예시.",
      code: `<Switch label="비활성화" disabled />
<Switch label="기본 ON" defaultChecked />`,
    },
    {
      component: (
        <View className="space-y-1">
          <Lib.Switch
            dataObj={dataObj}
            dataKey="notifications"
            name="notify"
            label="알림 허용"
            onChange={(e) => {
              console.log("switch change", e.target.checked);
            }}
          />
          <Text className="text-xs text-gray-600">
            이벤트 핸들러는 checked 값을 전달하며 dataObj.checked 플래그도
            채워진다.
          </Text>
        </View>
      ),
      description: "onChange에서 checked 값을 함께 받는 패턴.",
      code: `const dataObj = EasyObj({ notifications: true });

<Switch
  dataObj={dataObj}
  dataKey="notifications"
  name="notify"
  label="알림 허용"
  onChange={(e) => console.log('switch change', e.target.checked)}
/>`,
    },
  ];
};
