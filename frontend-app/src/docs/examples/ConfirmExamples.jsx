/**
 * 파일명: ConfirmExamples.jsx
 * 설명: 앱용 Confirm(global UI) 예제
 * 작성자: LSH
 * 갱신일: 2025-02-19
 */
import { useRef } from "react";
import { View } from "react-native";
import * as Lib from "../../lib";
import { useGlobalUi } from "../../common/store/SharedStore";

const BasicConfirm = () => {
  const { showConfirm, showAlert } = useGlobalUi();
  return (
    <Lib.Button
      onPress={() => {
        showConfirm("정말 진행하시겠습니까?").then((result) => {
          if (result) showAlert("확인했습니다.");
        });
      }}
    >
      기본 확인
    </Lib.Button>
  );
};

const ConfirmVariants = () => {
  const { showConfirm } = useGlobalUi();
  return (
    <View className="flex flex-row flex-wrap gap-2">
      <Lib.Button
        onPress={() =>
          showConfirm("해당 작업은 되돌릴 수 없습니다.\n계속하시겠습니까?", {
            title: "주의",
            type: "warning",
            confirmText: "계속",
            cancelText: "중단",
          })
        }
      >
        경고 확인
      </Lib.Button>
      <Lib.Button
        variant="danger"
        onPress={() =>
          showConfirm("모든 데이터를 삭제합니다.\n정말 삭제하시겠습니까?", {
            title: "위험 확인",
            type: "danger",
            confirmText: "삭제",
            cancelText: "취소",
          })
        }
      >
        위험 확인
      </Lib.Button>
    </View>
  );
};

const ConfirmCallbacks = () => {
  const { showConfirm, showAlert } = useGlobalUi();
  return (
    <Lib.Button
      onPress={() =>
        showConfirm("삭제를 진행하시겠습니까?", {
          title: "위험 확인",
          type: "danger",
          confirmText: "삭제",
          cancelText: "취소",
          onConfirm: () => showAlert("삭제가 완료되었습니다."),
          onCancel: () => showAlert("삭제가 취소되었습니다."),
        })
      }
    >
      콜백 함수 표시
    </Lib.Button>
  );
};

const ConfirmFocus = () => {
  const { showConfirm } = useGlobalUi();
  const inputRef = useRef(null);
  return (
    <View className="flex-row items-center space-x-2">
      <Lib.Button
        onPress={() =>
          showConfirm("확인 모달이 닫히면 입력창으로 커서가 이동합니다.", {
            title: "포커스 이동",
            onFocus: () => inputRef.current?.focus(),
          })
        }
      >
        포커스 이동 표시
      </Lib.Button>
      <Lib.Input
        ref={inputRef}
        placeholder="커서가 여기로 이동합니다"
        className="flex-1"
      />
    </View>
  );
};

export const ConfirmExamples = () => {
  return [
    {
      component: (
        <View className="space-y-4">
          <BasicConfirm />
        </View>
      ),
      description: "기본 확인 모달",
      code: `const { showConfirm, showAlert } = useGlobalUi();

showConfirm('정말 진행하시겠습니까?').then((result) => {
  if (result) showAlert('확인했습니다.');
});`,
    },
    {
      component: <ConfirmVariants />,
      description: "확인 모달 유형",
      code: `// 경고 확인
showConfirm('해당 작업은 되돌릴 수 없습니다.\\n계속하시겠습니까?', {
  title: '주의',
  type: 'warning',
  confirmText: '계속',
  cancelText: '중단',
});

// 위험 확인
showConfirm('모든 데이터를 삭제합니다.\\n정말 삭제하시겠습니까?', {
  title: '위험 확인',
  type: 'danger',
  confirmText: '삭제',
  cancelText: '취소',
});`,
    },
    {
      component: (
        <View className="space-y-4">
          <ConfirmCallbacks />
        </View>
      ),
      description: "확인/취소 콜백",
      code: `showConfirm('삭제를 진행하시겠습니까?', {
  title: '위험 확인',
  type: 'danger',
  confirmText: '삭제',
  cancelText: '취소',
  onConfirm: () => showAlert('삭제가 완료되었습니다.'),
  onCancel: () => showAlert('삭제가 취소되었습니다.'),
});`,
    },
    {
      component: (
        <View className="space-y-4">
          <ConfirmFocus />
        </View>
      ),
      description: "모달 닫힘 후 포커스 이동",
      code: `const inputRef = useRef(null);

showConfirm('확인 모달이 닫히면 입력창으로 커서가 이동합니다.', {
  title: '포커스 이동',
  onFocus: () => inputRef.current?.focus(),
});`,
    },
  ];
};
