/**
 * 파일명: LoadingExamples.jsx
 * 설명: 앱용 Loading 컴포넌트 예제
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { View } from 'react-native';
import * as Lib from '../../lib';
import { useGlobalUi } from '../../common/store/SharedStore';

const ShowGlobalLoading = () => {
  const { setLoading } = useGlobalUi();
  return (
    <Lib.Button
      onPress={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
      }}
    >
      전체 화면 로딩 (2초)
    </Lib.Button>
  );
};

export const LoadingExamples = () => {
  return [
    {
      component: (
        <View className="space-y-4">
          <ShowGlobalLoading />
        </View>
      ),
      description: 'useGlobalUi의 setLoading으로 전체 화면 로딩 트리거.',
      code: `const { setLoading } = useGlobalUi();

<Button
  onPress={() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  }}
>
  전체 화면 로딩 (2초)
</Button>`,
    },
  ];
};
