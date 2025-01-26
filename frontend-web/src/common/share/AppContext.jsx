import { createContext } from 'react';
import EasyObj from '../../lib/dataset/EasyObj';
// import useSendAxios from '../hook/useSendAxios';
import Loading from '../../lib/component/Loading';
import Alert from '../../lib/component/Alert';
import Confirm from '../../lib/component/Confirm';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const APP_ENV = 'DEV';
    // const APP_ENV = 'PUB';
    // const APP_ENV = 'PROD';

    // 모든 상태 객체를 한 곳에서 초기화
    const state = {
        userInfo: EasyObj(),
        sharedData: EasyObj(),
        alert: EasyObj({
            show: false,
            title: '',
            msg: '',
            type: 'info',
            onClick: undefined,
            lastFocusRef: null
        }),
        loading: EasyObj({
            isLoading: false,
            loadingCounter: 0
        }),
        confirm: EasyObj({
            show: false,
            title: '',
            msg: '',
            type: 'info',
            onConfirm: undefined,
            onCancel: undefined,
            confirmText: '확인',
            cancelText: '취소'
        })
    };

    const showAlert = (msg, options = {}) => {
        const {
            title = '알림',
            type = 'info',
            onClick,
            lastFocusRef = null
        } = options;

        state.alert.show = true;
        state.alert.title = title;
        state.alert.msg = msg;
        state.alert.type = type;
        state.alert.onClick = onClick;
        state.alert.lastFocusRef = lastFocusRef;
    };

    const hideAlert = () => {
        if (state.alert.lastFocusRef?.current) {
            state.alert.lastFocusRef.current.focus();
        }
        state.alert.onClick?.();

        state.alert.show = false;
        state.alert.title = '';
        state.alert.msg = '';
        state.alert.type = 'info';
        state.alert.onClick = undefined;
        state.alert.lastFocusRef = null;
    };

    const updateLoading = (increment) => {
        state.loading.loadingCounter += increment;
        state.loading.isLoading = state.loading.loadingCounter > 0;
    };

    const setLoading = (value) => {
        state.loading.isLoading = value;
        state.loading.loadingCounter = value ? 1 : 0;
    };

    const showConfirm = (msg, options = {}) => {
        const {
            title = '확인',
            type = 'info',
            onConfirm,
            onCancel,
            confirmText = '확인',
            cancelText = '취소'
        } = options;

        state.confirm.show = true;
        state.confirm.title = title;
        state.confirm.msg = msg;
        state.confirm.type = type;
        state.confirm.onConfirm = onConfirm;
        state.confirm.onCancel = onCancel;
        state.confirm.confirmText = confirmText;
        state.confirm.cancelText = cancelText;
    };

    const hideConfirm = (confirmed = false) => {
        if (confirmed && state.confirm.onConfirm) {
            state.confirm.onConfirm();
        } else if (!confirmed && state.confirm.onCancel) {
            state.confirm.onCancel();
        }

        state.confirm.show = false;
        state.confirm.title = '';
        state.confirm.msg = '';
        state.confirm.type = 'info';
        state.confirm.onConfirm = undefined;
        state.confirm.onCancel = undefined;
        state.confirm.confirmText = '확인';
        state.confirm.cancelText = '취소';
    };

    // const sendAxios = useSendAxios(updateLoading);

    // const axios = async (reqObj) => {
    //     if (APP_ENV === 'PUB') {
    //         // URL에서 경로와 쿼리 문자열 분리
    //         const [path, queryString] = reqObj.url.split('?');

    //         let params = {};

    //         if (queryString) {
    //             const queryParams = new URLSearchParams(queryString);
    //             for (const [key, value] of queryParams) {
    //                 params[key] = value;
    //             }
    //         }

    //         if (reqObj.method === 'POST' && reqObj.data instanceof URLSearchParams) {
    //             for (const [key, value] of reqObj.data) {
    //                 params[key] = value;
    //             }
    //         } else if (reqObj.data) {
    //             params = { ...params, ...reqObj.data };
    //         }

    //         if (typeof PubData[path] === 'function') {
    //             // 함수인 경우 요청 데이터와 쿼리 파라미터를 전달하여 호출
    //             return PubData[path](params);
    //         } else {
    //             const response = PubData[path];
    //             if (response) {
    //                 return response;
    //             } else {
    //                 console.warn(`No mock data found for URL: ${path}`);
    //                 return { data: {} };
    //             }
    //         }
    //     }
    //     else {
    //         if (!reqObj.onError) {
    //             reqObj.onError = (error) => {
    //                 console.error('Default error handling:', error);
    //                 showAlert(error.message);
    //             };
    //         }

    //         const result = await sendAxios(reqObj);
    //         return result;
    //     }
    // };

    return (
        <AppContext.Provider value={{
            sharedData: state.sharedData,
            APP_ENV,
            userInfo: state.userInfo,
            alert: state.alert,
            showAlert,
            hideAlert,
            setLoading,
            updateLoading,
            showConfirm,
            hideConfirm
        }}>
            {state.loading.isLoading && <Loading />}
            {children}
            {state.alert.show && (
                <Alert
                    title={state.alert.title}
                    text={state.alert.msg}
                    type={state.alert.type}
                    onClick={hideAlert}
                />
            )}
            {state.confirm.show && (
                <Confirm
                    title={state.confirm.title}
                    text={state.confirm.msg}
                    type={state.confirm.type}
                    onConfirm={() => hideConfirm(true)}
                    onCancel={() => hideConfirm(false)}
                    confirmText={state.confirm.confirmText}
                    cancelText={state.confirm.cancelText}
                />
            )}
        </AppContext.Provider>
    );
};
