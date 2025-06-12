import Main from '../page/main/Main';
import Component from '../Component';

const RouteIndex = {
    main: {
        name: '메인',
        component: Main,
        layout: 'BasicLayout',
    },
    component: {
        name: '컴포넌트',
        component: Component,
        layout: 'BasicLayout',
    },
    // 웹이랑 똑같은 방식으로 route 정의하면 돼!
};

export default RouteIndex; 