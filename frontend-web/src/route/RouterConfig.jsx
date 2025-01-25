import { Fragment } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RouteIndex from './RouteIndex';
import BasicLayout from '@/common/layout/BasicLayout';

const layouts = {
    BasicLayout
};

function PrivateRoute({ element, role }) {
    const isAuthenticated = true; // 실제 인증 상태 확인 로직 필요
    const userRole = 'ADMIN'; // 실제 사용자 역할 확인 로직 필요

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role && role !== userRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return element;
}

function createRoutes(routes, parentPath = '') {
    return Object.entries(routes).flatMap(([sectionKey, section]) => {
        // section이 component 속성을 가지고 있다면 그 자체가 route
        if (section.component) {
            const path = `${parentPath}/${sectionKey}`.replace(/\/+/g, '/');
            const Layout = section.layout ? layouts[section.layout] : Fragment;

            const element = (
                <Layout>
                    <section.component />
                </Layout>
            );

            return [
                <Route
                    key={path}
                    path={path}
                    element={
                        section.isPrivate ? (
                            <PrivateRoute element={element} role={section.role} />
                        ) : (
                            element
                        )
                    }
                />
            ];
        }

        // 하위 route들을 재귀적으로 처리
        return createRoutes(section, `${parentPath}/${sectionKey}`);
    }).filter(Boolean);
}

function RouterConfig() {
    return (
        <Routes>
            {createRoutes(RouteIndex)}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
                path="*"
                element={
                    <BasicLayout>
                        <div className="flex items-center justify-center h-full">
                            <h1 className="text-2xl text-gray-600">페이지를 찾을 수 없습니다</h1>
                        </div>
                    </BasicLayout>
                }
            />
        </Routes>
    );
}

export default RouterConfig;