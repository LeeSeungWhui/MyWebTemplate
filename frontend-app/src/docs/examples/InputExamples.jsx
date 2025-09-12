import { View, Text } from 'react-native';
import * as Lib from '@/lib';

export const InputExamples = () => {
    return [
        {
            component: (
                <View className="space-y-4">
                    <Lib.Input
                        placeholder="기본 입력"
                    />
                    <Lib.Input
                        placeholder="에러 상태"
                        error={true}
                    />
                    <Lib.Input
                        placeholder="비활성화"
                        editable={false}
                    />
                </View>
            ),
            description: "기본적인 입력 필드 스타일입니다."
        },
        {
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
                    <Lib.Input
                        placeholder="비밀번호"
                        togglePassword
                    />
                </View>
            ),
            description: "prefix, suffix, 비밀번호 토글 등 다양한 옵션을 지원합니다."
        },
        {
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
            description: "숫자 입력, 마스크, 필터 기능을 제공합니다."
        }
    ];
}; 