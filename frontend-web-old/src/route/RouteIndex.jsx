import Login from '../page/login/Login';
import Component from '../Component';

const RouteIndex = {
    login: {
        name: '로그인',
        component: Login,
        layout: 'BasicLayout',
    },
    component: {
        name: '컴포넌트',
        component: Component,
    },

};

export default RouteIndex;