/**
 * 파일명: NumberInputExamples.jsx
 * 설명: 앱용 NumberInput 컴포넌트 예제
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { View, Text } from "react-native";
import * as Lib from "../../lib";

export const NumberInputExamples = () => {
  const dataObj = Lib.EasyObj({ qty: 1, price: 0 });

  return [
    {
      component: (
        <View className="space-y-2">
          <Lib.NumberInput dataObj={dataObj} dataKey="qty" min={0} step={1} />
          <Text className="text-xs text-gray-600">
            dataObj.qty = {String(dataObj.qty)}
          </Text>
        </View>
      ),
      description: "기본: 바운드 + step 1",
      code: `const dataObj = EasyObj({ qty: 1 });

<NumberInput dataObj={dataObj} dataKey="qty" min={0} step={1} />`,
    },
    {
      component: (
        <Lib.NumberInput
          dataObj={dataObj}
          dataKey="price"
          min={0}
          max={100}
          step={0.5}
        />
      ),
      description: "min/max/step 조합",
      code: `const dataObj = EasyObj({ price: 0 });

<NumberInput dataObj={dataObj} dataKey="price" min={0} max={100} step={0.5} />`,
    },
    {
      component: <Lib.NumberInput defaultValue={10} step={5} />,
      description: "언바운드 + defaultValue",
      code: `<NumberInput defaultValue={10} step={5} />`,
    },
  ];
};
