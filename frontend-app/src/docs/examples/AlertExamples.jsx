/**
 * 파일명: AlertExamples.jsx
 * 설명: 앱용 Alert(global UI) 예제
 * 작성자: Codex
 * 갱신일: 2025-02-19
 */
import { View } from 'react-native';
import { useRef } from 'react';
import * as Lib from '../../lib';
import { useGlobalUi } from '../../common/store/SharedStore';

const AlertButton = ({ label, message, opts, variant }) => {
  const { showAlert } = useGlobalUi();
  return (
    <Lib.Button
      variant={variant}
      onPress={() => {
        showAlert(message, opts);
      }}
    >
      {label}
    </Lib.Button>
  );
};

export const AlertExamples = () => {
  const focusRef = useRef(null);

  return [
    {
      component: (
        <View className="space-y-3">
          <AlertButton
            label="기본 알림"
            message="처리되었습니다."
            opts={{ title: '알림', type: 'info' }}
          />
          <AlertButton
            label="에러 알림"
            message="다시 시도해주세요."
            opts={{ title: '에러', type: 'danger' }}
            variant="danger"
          />
          <AlertButton
            label="성공 알림"
            message="성공적으로 완료되었습니다."
            opts={{ title: '성공', type: 'success' }}
            variant="success"
          />
          <AlertButton
            label="주의 알림"
            message="확인 후 진행해주세요."
            opts={{ title: '주의', type: 'warning' }}
            variant="warning"
          />
        </View>
      ),
      description: 'useGlobalUi.showAlert로 전역 알림 표시. type에 따라 색상/아이콘이 달라진다.',
      code: `const { showAlert } = useGlobalUi();

// 기본
showAlert('처리되었습니다.', { title: '알림' });

// 에러
showAlert('다시 시도해주세요.', { title: '에러', type: 'danger' });

// 성공/주의
showAlert('성공적으로 완료되었습니다.', { title: '성공', type: 'success' });
showAlert('확인 후 진행해주세요.', { title: '주의', type: 'warning' });`,
    },
    {
      component: (
        <View className="space-y-2">
          <AlertButton
            label="콜백 실행"
            message="onClick 콜백이 실행됩니다."
            opts={{
              title: '콜백',
              onClick: () => console.log('clicked'),
            }}
          />
        </View>
      ),
      description: 'onClick 콜백만 사용하는 알림 예제.',
      code: `showAlert('onClick 콜백이 실행됩니다.', {
  title: '콜백',
  onClick: () => console.log('clicked'),
});`,
    },
    {
      component: (
        <View className="space-y-2">
          <AlertButton
            label="포커스 이동"
            message="닫으면 입력창으로 포커스 이동"
            opts={{
              title: '포커스',
              onFocus: () => focusRef.current?.focus(),
            }}
          />
          <Lib.Input ref={focusRef} placeholder="알림 닫히면 여기로 포커스" />
        </View>
      ),
      description: 'onFocus로 닫힌 뒤 포커스를 특정 입력으로 이동.',
      code: `const focusRef = useRef(null);

showAlert('닫으면 입력창으로 포커스 이동', {
  title: '포커스',
  onFocus: () => focusRef.current?.focus(),
});`,
    },
  ];
};
