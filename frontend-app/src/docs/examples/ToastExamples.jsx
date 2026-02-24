/**
 * 파일명: ToastExamples.jsx
 * 설명: 앱용 Toast(global UI) 예제
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { View } from "react-native";
import * as Lib from "../../lib";
import { useGlobalUi } from "../../common/store/SharedStore";

const ToastBasic = () => {
  const { showToast } = useGlobalUi();
  return (
    <Lib.Button onPress={() => showToast("기본 토스트 메시지입니다.")}>
      기본 토스트
    </Lib.Button>
  );
};

const ToastTypes = () => {
  const { showToast } = useGlobalUi();
  return (
    <View className="flex-row flex-wrap gap-2">
      <Lib.Button
        onPress={() => showToast("정보 토스트 메시지입니다.", { type: "info" })}
      >
        정보
      </Lib.Button>
      <Lib.Button
        onPress={() =>
          showToast("성공 토스트 메시지입니다.", { type: "success" })
        }
        variant="success"
      >
        성공
      </Lib.Button>
      <Lib.Button
        onPress={() =>
          showToast("경고 토스트 메시지입니다.", { type: "warning" })
        }
        variant="warning"
      >
        경고
      </Lib.Button>
      <Lib.Button
        onPress={() =>
          showToast("오류 토스트 메시지입니다.", { type: "danger" })
        }
        variant="danger"
      >
        오류
      </Lib.Button>
    </View>
  );
};

const ToastPositions = () => {
  const { showToast } = useGlobalUi();
  return (
    <View className="flex-row flex-wrap gap-2">
      <Lib.Button
        onPress={() =>
          showToast("상단 왼쪽에 표시합니다.", { position: "top-left" })
        }
      >
        상단 왼쪽
      </Lib.Button>
      <Lib.Button
        onPress={() =>
          showToast("상단 중앙에 표시합니다.", { position: "top-center" })
        }
      >
        상단 중앙
      </Lib.Button>
      <Lib.Button
        onPress={() =>
          showToast("하단 오른쪽에 표시합니다.", { position: "bottom-right" })
        }
      >
        하단 오른쪽
      </Lib.Button>
    </View>
  );
};

const ToastDurations = () => {
  const { showToast, hideToast } = useGlobalUi();
  return (
    <View className="flex-row flex-wrap items-center gap-2">
      <Lib.Button
        onPress={() => showToast("2초 뒤 사라집니다.", { duration: 2000 })}
      >
        2초 유지
      </Lib.Button>
      <Lib.Button
        onPress={() => showToast("5초 뒤 사라집니다.", { duration: 5000 })}
      >
        5초 유지
      </Lib.Button>
      <Lib.Button
        onPress={() =>
          showToast("수동으로 닫기 전까지 유지됩니다.", { duration: Infinity })
        }
        variant="secondary"
      >
        수동 닫기
      </Lib.Button>
      <Lib.Button onPress={hideToast} variant="ghost">
        토스트 닫기
      </Lib.Button>
    </View>
  );
};

export const ToastExamples = () => {
  return [
    {
      component: (
        <View className="space-y-4">
          <ToastBasic />
        </View>
      ),
      description:
        "전역 스토어(useGlobalUi)의 showToast로 기본 토스트를 띄운다.",
      code: `const { showToast } = useGlobalUi();

// 기본
showToast('기본 토스트 메시지입니다.');`,
    },
    {
      component: <ToastTypes />,
      description: "유형별 토스트: info | success | warning | danger(error).",
      code: `showToast('정보 토스트 메시지입니다.', { type: 'info' });
showToast('성공 토스트 메시지입니다.', { type: 'success' });
showToast('경고 토스트 메시지입니다.', { type: 'warning' });
showToast('오류 토스트 메시지입니다.', { type: 'danger' });`,
    },
    {
      component: <ToastPositions />,
      description: "위치 지정: top/bottom - left/center/right.",
      code: `showToast('상단 왼쪽에 표시합니다.', { position: 'top-left' });
showToast('상단 중앙에 표시합니다.', { position: 'top-center' });
showToast('하단 오른쪽에 표시합니다.', { position: 'bottom-right' });`,
    },
    {
      component: <ToastDurations />,
      description:
        "지속시간: ms 지정, Infinity로 자동 닫기 비활성화(필요 시 hideToast로 닫기).",
      code: `const { showToast, hideToast } = useGlobalUi();

showToast('2초 뒤 사라집니다.', { duration: 2000 });
showToast('5초 뒤 사라집니다.', { duration: 5000 });
showToast('수동으로 닫기 전까지 유지됩니다.', { duration: Infinity });
// 필요 시 hideToast();`,
    },
  ];
};
