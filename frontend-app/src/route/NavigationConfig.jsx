import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Fragment } from 'react';
import RouteIndex from './RouteIndex';
import BasicLayout from '../common/layout/BasicLayout';

const Stack = createStackNavigator();

const layouts = {
    BasicLayout
};

const NavigationConfig = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="main"
                screenOptions={{
                    headerShown: false  // 기본 헤더 숨기기
                }}
            >
                {Object.entries(RouteIndex).map(([key, route]) => {
                    const Layout = route.layout ? layouts[route.layout] : Fragment;
                    return (
                        <Stack.Screen
                            key={key}
                            name={key}
                            component={props => (
                                <Layout>
                                    <route.component {...props} />
                                </Layout>
                            )}
                        />
                    );
                })}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default NavigationConfig;