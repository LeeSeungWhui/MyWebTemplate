import { createContext } from 'react';
import EasyObj from '@/app/lib/dataset/EasyObj';
// import useSendAxios from '../hook/useSendAxios';
import Loading from '@/app/lib/component/Loading';
import Alert from '@/app/lib/component/Alert';
import Confirm from '@/app/lib/component/Confirm';
import Toast from '@/app/lib/component/Toast/Toast';

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
            onFocus: undefined,
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
            onFocus: undefined,
            confirmText: '확인',
            cancelText: '취소'
        }),
        toast: EasyObj({
            show: false,
            message: '',
            type: 'info',
            position: 'bottom-center',
            duration: 3000
        })
    };

    const showAlert = (msg, options = {}) => {
        const {
            title = '알림',
            type = 'info',
            onClick,
            onFocus,
            lastFocusRef = null
        } = options;

        state.alert.show = true;
        state.alert.title = title;
        state.alert.msg = msg;
        state.alert.type = type;
        state.alert.onClick = onClick;
        state.alert.onFocus = onFocus;
        state.alert.lastFocusRef = lastFocusRef;
    };

    const hideAlert = () => {
        const currentOnClick = state.alert.onClick;
        const currentOnFocus = state.alert.onFocus;

        // 상태 초기화
        state.alert.show = false;
        state.alert.title = '';
        state.alert.msg = '';
        state.alert.type = 'info';
        state.alert.onClick = undefined;
        state.alert.onFocus = undefined;
        state.alert.lastFocusRef = null;

        // 콜백 실행       
        if (currentOnClick) {
            currentOnClick();
        }
        if (currentOnFocus) {
            currentOnFocus();
        }
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
            onFocus,
            confirmText = '확인',
            cancelText = '취소'
        } = options;

        state.confirm.show = true;
        state.confirm.title = title;
        state.confirm.msg = msg;
        state.confirm.type = type;
        state.confirm.onConfirm = onConfirm;
        state.confirm.onCancel = onCancel;
        state.confirm.onFocus = onFocus;
        state.confirm.confirmText = confirmText;
        state.confirm.cancelText = cancelText;
    };

    const hideConfirm = (confirmed = false) => {
        const currentOnConfirm = state.confirm.onConfirm;
        const currentOnCancel = state.confirm.onCancel;
        const currentOnFocus = state.confirm.onFocus;

        state.confirm.show = false;
        state.confirm.title = '';
        state.confirm.msg = '';
        state.confirm.type = 'info';
        state.confirm.onConfirm = undefined;
        state.confirm.onCancel = undefined;
        state.confirm.onFocus = undefined;
        state.confirm.confirmText = '확인';
        state.confirm.cancelText = '취소';

        if (confirmed && currentOnConfirm) {
            currentOnConfirm();
        } else if (!confirmed && currentOnCancel) {
            currentOnCancel();
        }

        if (currentOnFocus) {
            currentOnFocus();
        }
    };

    const hideToast = () => {
        // 토스트가 표시중일 때만 처리
        if (state.toast.show) {
            // 먼저 토스트의 상태만 변경 (애니메이션을 위해)
            state.toast.isExiting = true;

            // 애니메이션이 끝난 후에 실제로 토스트를 제거
            setTimeout(() => {
                state.toast.show = false;
                state.toast.message = '';
                state.toast.type = 'info';
                state.toast.position = 'bottom-center';
                state.toast.duration = 3000;
                state.toast.isExiting = false;
            }, 300);
        }
    };

    const showToast = (message, options = {}) => {
        const {
            type = 'info',
            position = 'bottom-center',
            duration = 3000
        } = options;

        // 이전 토스트가 있다면 즉시 제거
        if (state.toast.show) {
            hideToast();
        }

        // 새 토스트 표시
        state.toast.show = true;
        state.toast.message = message;
        state.toast.type = type;
        state.toast.position = position;
        state.toast.duration = duration;
        state.toast.isExiting = false;

        // duration이 지나면 자동으로 닫기
        if (duration !== Infinity) {
            setTimeout(() => {
                hideToast();
            }, duration);
        }
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
            hideConfirm,
            showToast,
            hideToast
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
            {state.toast.show && (
                <Toast
                    message={state.toast.message}
                    type={state.toast.type}
                    position={state.toast.position}
                    isExiting={state.toast.isExiting}
                    onClose={hideToast}
                />
            )}
        </AppContext.Provider>
    );
};
