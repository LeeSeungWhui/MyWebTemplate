import { View, Text } from 'react-native';
import * as Lib from '../../lib';

export const InputExamples = () => {
  return [
    {
      title: '기본 입력 상태',
      component: (
        <View className="space-y-4">
          <Lib.Input placeholder="기본 입력" />
          <Lib.Input placeholder="에러 상태" error />
          <Lib.Input placeholder="비활성화" editable={false} />
        </View>
      ),
      description: '기본/에러/비활성화 상태를 보여주는 입력 필드 예시다.',
      code: `<Input placeholder="기본 입력" />
<Input placeholder="에러 상태" error />
<Input placeholder="비활성화" editable={false} />`,
    },
    {
      title: 'Prefix / Suffix / 비밀번호 토글',
      component: (
        <View className="space-y-4">
          <Lib.Input
            placeholder="검색어를 입력하세요"
            prefix={<Lib.Icon icon="md:search" size="md" color="#9CA3AF" />}
          />
          <Lib.Input
            placeholder="이메일"
            suffix={<Text className="text-gray-400">@gmail.com</Text>}
          />
          <Lib.Input placeholder="비밀번호" togglePassword />
        </View>
      ),
      description: '아이콘 prefix, 텍스트 suffix, 비밀번호 표시 토글까지 한 번에 보여준다.',
      code: `<Input
  placeholder="검색어를 입력하세요"
  prefix={<Icon icon="md:search" size="md" color="#9CA3AF" />}
/>
<Input
  placeholder="이메일"
  suffix={<Text className="text-gray-400">@gmail.com</Text>}
/>
<Input
  placeholder="비밀번호"
  togglePassword
/>`,
    },
    {
      title: '숫자/마스크/필터 입력',
      component: (
        <View className="space-y-4">
          <Lib.Input
            placeholder="숫자만 입력"
            type="number"
            maxDigits={5}
          />
          <Lib.Input
            placeholder="전화번호"
            mask="###-####-####"
            filter="0123456789"
          />
          <Lib.Input
            placeholder="영어만 입력"
            filter="a-zA-Z"
          />
        </View>
      ),
      description: '숫자 입력, 마스크, 알파벳 필터 등 제약 조건이 있는 입력 예시다.',
      code: `<Input
  placeholder="숫자만 입력"
  type="number"
  maxDigits={5}
/>
<Input
  placeholder="전화번호"
  mask="###-####-####"
  filter="0123456789"
/>
<Input
  placeholder="영어만 입력"
  filter="a-zA-Z"
/>`,
    },
  ];
};
