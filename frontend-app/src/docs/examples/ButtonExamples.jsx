import { View, Text } from 'react-native';
import * as Lib from '../../lib';

export const ButtonExamples = () => {
  return [
    {
      component: (
        <Lib.Button>
          기본 버튼
        </Lib.Button>
      ),
      description: '기본 버튼 (primary)',
      code: '<Button>기본 버튼</Button>',
    },
    {
      component: (
        <Lib.Button variant="secondary">
          Secondary
        </Lib.Button>
      ),
      description: 'secondary 버튼',
      code: '<Button variant="secondary">Secondary</Button>',
    },
    {
      component: (
        <Lib.Button variant="outline">
          Outline
        </Lib.Button>
      ),
      description: 'outline 버튼',
      code: '<Button variant="outline">Outline</Button>',
    },
    {
      component: (
        <Lib.Button variant="ghost">
          Ghost
        </Lib.Button>
      ),
      description: 'ghost 버튼',
      code: '<Button variant="ghost">Ghost</Button>',
    },
    {
      component: (
        <Lib.Button variant="danger">
          Danger
        </Lib.Button>
      ),
      description: 'danger 버튼',
      code: '<Button variant="danger">Danger</Button>',
    },
    {
      component: (
        <Lib.Button variant="success">
          Success
        </Lib.Button>
      ),
      description: 'success 버튼',
      code: '<Button variant="success">Success</Button>',
    },
    {
      component: (
        <Lib.Button variant="warning">
          Warning
        </Lib.Button>
      ),
      description: 'warning 버튼',
      code: '<Button variant="warning">Warning</Button>',
    },
    {
      component: (
        <Lib.Button variant="link">
          Link Button
        </Lib.Button>
      ),
      description: '링크 스타일 버튼',
      code: '<Button variant="link">Link Button</Button>',
    },
    {
      component: (
        <Lib.Button variant="dark">
          Dark
        </Lib.Button>
      ),
      description: 'dark 버튼',
      code: '<Button variant="dark">Dark</Button>',
    },
    {
      component: (
        <Lib.Button className="bg-gradient-to-r from-purple-500 to-pink-500">
          그라데이션
        </Lib.Button>
      ),
      description: 'nativewind 클래스를 이용한 커스텀 버튼',
      code: `<Button className="bg-gradient-to-r from-purple-500 to-pink-500">
  그라데이션
</Button>`,
    },
    {
      component: (
        <Lib.Button icon="md:search">
          아이콘 버튼
        </Lib.Button>
      ),
      description: 'Icon 컴포넌트와 함께 사용하는 아이콘 버튼',
      code: '<Button icon="md:search">아이콘 버튼</Button>',
    },
    {
      component: (
        <View className="flex-row gap-2">
          <Lib.Button disabled>
            Disabled
          </Lib.Button>
          <Lib.Button loading>
            Loading
          </Lib.Button>
        </View>
      ),
      description: '비활성화 및 로딩 상태',
      code: `<Button disabled>Disabled</Button>
<Button loading>Loading</Button>`,
    },
    {
      component: (
        <View className="flex-row gap-2 items-center">
          <Lib.Button size="sm">
            Small
          </Lib.Button>
          <Lib.Button size="md">
            Medium
          </Lib.Button>
          <Lib.Button size="lg">
            Large
          </Lib.Button>
        </View>
      ),
      description: 'sm, md, lg 세 가지 크기',
      code: `<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`,
    },
  ];
};
