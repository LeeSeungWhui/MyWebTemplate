/**
 * 파일명: ComboboxExamples.jsx
 * 설명: 앱용 Combobox 컴포넌트 예제
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { View, Text } from 'react-native';
import * as Lib from '../../lib';

export const ComboboxExamples = () => {
  const jobs = Lib.EasyList([
    { id: 'dev', label: '개발자' },
    { id: 'des', label: '디자이너' },
    { id: 'pm', label: 'PM' },
    { id: 'qa', label: 'QA' },
  ]);
  const skills = Lib.EasyList([
    { id: 'react', label: 'React' },
    { id: 'rn', label: 'React Native' },
    { id: 'next', label: 'Next.js' },
    { id: 'node', label: 'Node.js' },
  ]);

  return [
    {
      component: (
        <View className="space-y-2">
          <Lib.Combobox dataList={jobs} valueKey="id" textKey="label" placeholder="직무 선택" />
          <Text className="text-xs text-gray-600">
            selected: {String(jobs.find((item) => item.selected)?.id || '')}
          </Text>
        </View>
      ),
      description: '기본 단일 선택. EasyList.selected가 자동으로 동기화된다.',
      code: `const jobs = EasyList([
  { id: 'dev', label: '개발자' },
  { id: 'des', label: '디자이너' },
  { id: 'pm', label: 'PM' },
  { id: 'qa', label: 'QA' },
]);

<Combobox dataList={jobs} valueKey="id" textKey="label" placeholder="직무 선택" />`,
    },
    {
      component: (
        <View className="space-y-2">
          <Lib.Combobox
            dataList={jobs}
            valueKey="id"
            textKey="label"
            value="pm"
            onValueChange={(v) => console.log('controlled', v)}
          />
          <Text className="text-xs text-gray-600">value/onValueChange 컨트롤드 패턴.</Text>
        </View>
      ),
      description: '컨트롤드 모드.',
      code: `<Combobox
  dataList={jobs}
  valueKey="id"
  textKey="label"
  value="pm"
  onValueChange={(v) => console.log('controlled', v)}
/>`,
    },
    {
      component: (
        <View className="space-y-2">
          <Lib.Combobox
            dataList={skills}
            valueKey="id"
            textKey="label"
            multi
            placeholder="스킬 선택"
          />
          <Text className="text-xs text-gray-600">
            선택된 스킬: {skills.filter((s) => s.selected).map((s) => s.id).join(', ')}
          </Text>
        </View>
      ),
      description: 'multi=true로 여러 항목을 선택. 완료 버튼으로 닫는다.',
      code: `const skills = EasyList([
  { id: 'react', label: 'React' },
  { id: 'rn', label: 'React Native' },
  { id: 'next', label: 'Next.js' },
  { id: 'node', label: 'Node.js' },
]);

<Combobox
  dataList={skills}
  valueKey="id"
  textKey="label"
  multi
  placeholder="스킬 선택"
/>`,
    },
  ];
};
