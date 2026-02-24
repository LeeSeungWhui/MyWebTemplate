/**
 * 파일명: lib/component/Loading.jsx
 * 설명: 풀스크린 로딩 오버레이
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { View, Text, ActivityIndicator } from "react-native";
import { cn } from "../../common/util/cn";

/**
 * @description 화면 전체를 덮는 로딩 스피너. children을 넣어 커스텀 메시지 표시 가능.
 */
const Loading = ({ message = "처리중...", className = "" }) => {
  return (
    <View
      className={cn(
        "absolute inset-0 z-50 items-center justify-center bg-black/30",
        className,
      )}
    >
      <View className="bg-white/80 px-6 py-5 rounded-lg items-center shadow-lg min-w-[140px]">
        <ActivityIndicator size="large" color="#2563EB" />
        {message ? (
          <Text className="mt-3 text-sm font-medium text-gray-700">
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default Loading;
