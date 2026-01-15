import { View, Text } from 'react-native';
import { ButtonExamples } from '../examples/ButtonExamples';
import DocSection from '../shared/DocSection';
import CodeBlock from '../shared/CodeBlock';

const ButtonDocs = () => {
  const examples = ButtonExamples();
  const variantExamples = examples.slice(0, 11);
  const sizeExample = examples[examples.length - 1];
  const stateExample = examples.find((item, index) => index >= 11 && index < examples.length - 1);

  return (
    <DocSection
      title="2. 버튼 (Button)"
      description={(
        <View>
          <Text className="text-gray-600 mb-2">
            Button 컴포넌트는 다양한 스타일과 상태를 지원하는 기본 버튼이다.
          </Text>
          <Text className="text-gray-600 mb-2">
            variant, size, disabled, loading, icon 등의 속성을 통해 일관된 액션 버튼을 만들 수 있다.
          </Text>
          <View className="mt-2">
            <Text className="text-sm text-gray-700">• children: 버튼 안에 표시할 내용</Text>
            <Text className="text-sm text-gray-700">• variant?: 버튼 색상/스타일 (primary, secondary, outline, ghost, danger, success 등)</Text>
            <Text className="text-sm text-gray-700">• size?: 버튼 크기 (sm, md, lg)</Text>
            <Text className="text-sm text-gray-700">• icon?: prefix:name 형식의 아이콘 이름</Text>
            <Text className="text-sm text-gray-700">• iconPosition?: 아이콘 위치 (left | right)</Text>
            <Text className="text-sm text-gray-700">• disabled?: 비활성화 여부</Text>
            <Text className="text-sm text-gray-700">• loading?/status?: 로딩 상태 표시</Text>
            <Text className="text-sm text-gray-700">• onPress?: 탭/클릭 핸들러</Text>
            <Text className="text-sm text-gray-700">• className?: nativewind Tailwind 클래스</Text>
          </View>
        </View>
      )}
    >
      <View className="mb-8">
        <Text className="text-lg font-medium mb-2">
          버튼 종류
        </Text>
        <Text className="text-sm text-gray-600 mb-4">
          기본 variant, 링크 스타일, 커스텀 스타일까지 한 번에 본다.
        </Text>
        <View className="gap-6">
          {variantExamples.map((example, index) => (
            <View key={index} className="mb-4">
              <View className="mb-3 bg-white p-4 rounded-md border border-gray-200">
                {example.component}
              </View>
              <Text className="text-sm text-gray-600 mb-2">
                {example.description}
              </Text>
              <CodeBlock code={example.code} />
            </View>
          ))}
        </View>
      </View>

      {stateExample ? (
        <View className="mb-8">
          <Text className="text-lg font-medium mb-2">
            버튼 상태
          </Text>
          <Text className="text-sm text-gray-600 mb-4">
            Disabled, loading 등 상태에 따라 버튼 동작과 스타일이 어떻게 달라지는지 확인한다.
          </Text>
          <View className="mb-4 bg-white p-4 rounded-md border border-gray-200">
            {stateExample.component}
          </View>
          <CodeBlock code={stateExample.code} />
        </View>
      ) : null}

      {sizeExample ? (
        <View className="mb-8">
          <Text className="text-lg font-medium mb-2">
            버튼 크기
          </Text>
          <Text className="text-sm text-gray-600 mb-4">
            sm, md, lg 세 가지 크기를 비교해서 쓰면 된다.
          </Text>
          <View className="mb-4 bg-white p-4 rounded-md border border-gray-200">
            {sizeExample.component}
          </View>
          <CodeBlock code={sizeExample.code} />
        </View>
      ) : null}
    </DocSection>
  );
};

export default ButtonDocs;
