import { View, Text } from 'react-native';
import * as Lib from '../../lib';

export const TextareaExamples = () => {
  const bound = Lib.EasyObj({ memo: '초기 메모' });

  return [
    {
      title: '바운드 모드',
      component: (
        <View className="space-y-2">
          <Lib.Textarea
            dataObj={bound}
            dataKey="memo"
            rows={4}
            placeholder="메모를 입력하세요"
          />
          <Text className="text-xs text-gray-500">
            memo 값: {String(bound.memo ?? '')}
          </Text>
        </View>
      ),
      description: 'dataObj + dataKey로 EasyObj와 바로 동기화하는 텍스트 영역이다.',
      code: `const obj = EasyObj({ memo: '초기 메모' });

<Textarea
  dataObj={obj}
  dataKey="memo"
  rows={4}
  placeholder="메모를 입력하세요"
/>`,
    },
    {
      title: '컨트롤드 모드',
      component: (
        <View className="space-y-2">
          <Lib.Textarea
            value="로컬 상태 예시"
            onValueChange={() => {}}
            rows={3}
          />
          <Text className="text-xs text-gray-500">
            value/onValueChange 조합으로 컨트롤드 상태를 만들 수 있다.
          </Text>
        </View>
      ),
      description: 'value + onValueChange로 로컬 상태와 동기화하는 컨트롤드 패턴 예시다.',
      code: `const [val, setVal] = useState('로컬 상태 예시');

<Textarea
  value={val}
  onValueChange={setVal}
  rows={3}
/>`,
    },
    {
      title: '검증/에러 상태',
      component: (
        <View className="space-y-2">
          <Lib.Textarea
            dataObj={bound}
            dataKey="memo"
            rows={4}
            error={(bound.memo ?? '').length < 10}
            placeholder="10자 이상 입력"
          />
          <Text className="text-xs text-red-600">
            {(bound.memo ?? '').length < 10
              ? '10자 이상 입력해줘'
              : '정상'}
          </Text>
        </View>
      ),
      description: 'error prop으로 border 색을 바꾸고, 별도 에러 텍스트를 함께 보여주는 패턴.',
      code: `<Textarea
  dataObj={obj}
  dataKey="memo"
  rows={4}
  error={(obj.memo ?? '').length < 10}
  placeholder="10자 이상 입력"
/>
<Text className="text-xs text-red-600">
  {(obj.memo ?? '').length < 10 ? '10자 이상 입력해줘' : '정상'}
</Text>`,
    },
    {
      title: '읽기 전용 / 비활성화',
      component: (
        <View className="space-y-3">
          <Lib.Textarea
            placeholder="읽기 전용"
            value="내용 편집 불가"
            readOnly
          />
          <Lib.Textarea
            placeholder="비활성화"
            disabled
          />
        </View>
      ),
      description: 'readOnly와 disabled 상태를 구분해서 보여준다.',
      code: `<Textarea
  placeholder="읽기 전용"
  value="내용 편집 불가"
  readOnly
/>
<Textarea
  placeholder="비활성화"
  disabled
/>`,
    },
  ];
};

