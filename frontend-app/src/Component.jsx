import { View, ScrollView } from 'react-native';
import DataClassDocs from './docs/components/DataClassDocs';
import ButtonDocs from './docs/components/ButtonDocs';
import IconDocs from './docs/components/IconDocs';
import InputDocs from './docs/components/InputDocs';
// import InputDocs from './docs/components/InputDocs';
// ... 나중에 다른 컴포넌트들도 추가

const Component = () => {
    return (
        <View className="flex-1">
            <ScrollView className="flex-1">
                <View className="p-4 space-y-8">
                    <DataClassDocs />
                    <ButtonDocs />
                    <IconDocs />
                    <InputDocs />
                    {/* <InputDocs /> */}
                    {/* 나중에 다른 컴포넌트 문서들도 여기에 추가 */}
                </View>
            </ScrollView>
        </View>
    );
};

export default Component; 