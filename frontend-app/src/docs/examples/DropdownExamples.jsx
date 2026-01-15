/**
 * 파일명: DropdownExamples.jsx
 * 설명: 앱용 Dropdown 컴포넌트 예제
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { View, Text } from 'react-native';
import * as Lib from '../../lib';

export const DropdownExamples = () => {
  const actions = Lib.EasyList([
    { label: '상세 보기', value: 'view' },
    { label: '수정', value: 'edit' },
    { label: '삭제', value: 'delete' },
  ]);
  const fruits = Lib.EasyList([
    { label: '사과', value: 'apple' },
    { label: '바나나', value: 'banana' },
    { label: '체리', value: 'cherry' },
  ]);
  const roles = Lib.EasyList([
    { label: '개발', value: 'dev', selected: true },
    { label: '디자인', value: 'design' },
    { label: '기획', value: 'pm' },
  ]);

  return [
    {
      component: (
        <View className="space-y-2">
          <Lib.Dropdown dataList={actions} placeholder="행 액션" />
          <Text className="text-xs text-gray-600">선택 시 dataList.selected가 갱신된다.</Text>
        </View>
      ),
      description: '기본 단일 선택. EasyList.selected 플래그와 동기화된다.',
      code: `const actions = EasyList([
  { label: '상세 보기', value: 'view' },
  { label: '수정', value: 'edit' },
  { label: '삭제', value: 'delete' },
]);

<Dropdown dataList={actions} placeholder="행 액션" />`,
    },
    {
      component: (
        <View className="space-y-2">
          <Lib.Dropdown
            dataList={fruits}
            value="banana"
            onValueChange={(v) => console.log('controlled', v)}
          />
          <Text className="text-xs text-gray-600">value/onValueChange로 컨트롤드.</Text>
        </View>
      ),
      description: '컨트롤드 패턴.',
      code: `<Dropdown
  dataList={fruits}
  value="banana"
  onValueChange={(v) => console.log('controlled', v)}
/>`,
    },
    {
      component: (
        <View className="space-y-2">
          <Lib.Dropdown
            dataList={roles}
            multi
            placeholder="역할 선택 (다중)"
            closeOnSelect={false}
          />
          <Text className="text-xs text-gray-600">
            multi=true이면 체크 토글만 하고 닫히지 않는다.
          </Text>
        </View>
      ),
      description: '다중 선택 모드.',
      code: `const roles = EasyList([
  { label: '개발', value: 'dev', selected: true },
  { label: '디자인', value: 'design' },
  { label: '기획', value: 'pm' },
]);

<Dropdown
  dataList={roles}
  multi
  placeholder="역할 선택 (다중)"
  closeOnSelect={false}
/>`,
    },
  ];
};
