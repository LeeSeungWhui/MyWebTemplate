/**
 * 파일명: ConfirmExamples.jsx
 * 작성자: LSH
 * 갱신일: 2025-09-13
 * 설명: Confirm 컴포넌트 예제
 */
import * as Lib from '@/lib';
import { useRef } from 'react';
import { useSharedStore } from '@/app/common/store/SharedStore';

export const ConfirmExamples = () => {
    const app = useSharedStore();
    const inputRef = useRef(null);

    const examples = [
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        app.showConfirm("정말 삭제하시겠습니까?").then(result => {
                            if (result) {
                                app.showAlert("삭제되었습니다.");
                            }
                        });
                    }}>
                        기본 확인
                    </Lib.Button>
                </div>
            ),
            description: "기본 확인 대화상자",
            code: `// useSharedStore 사용
const app = useSharedStore();

// 기본 확인
app.showConfirm("정말 삭제하시겠습니까?").then(result => {
    if (result) {
        app.showAlert("삭제되었습니다.");
    }
});`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        app.showConfirm("이 작업은 되돌릴 수 없습니다.\\n계속하시겠습니까?", {
                            title: "주의",
                            type: "warning",
                            confirmText: "계속",
                            cancelText: "중단"
                        });
                    }}>
                        경고 확인
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showConfirm("모든 데이터가 삭제됩니다.\\n정말 삭제하시겠습니까?", {
                            title: "삭제 확인",
                            type: "danger",
                            confirmText: "삭제",
                            cancelText: "취소"
                        });
                    }}>
                        위험 확인
                    </Lib.Button>
                </div>
            ),
            description: "확인 대화상자 유형",
            code: `// 경고 확인
app.showConfirm("이 작업은 되돌릴 수 없습니다.\\\\n계속하시겠습니까?", {
    title: "주의",
    type: "warning",
    confirmText: "계속",
    cancelText: "중단"
});

// 위험 확인
app.showConfirm("모든 데이터가 삭제됩니다.\\\\n정말 삭제하시겠습니까?", {
    title: "삭제 확인",
    type: "danger",
    confirmText: "삭제",
    cancelText: "취소"
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        app.showConfirm("데이터를 삭제하시겠습니까?", {
                            title: "삭제 확인",
                            type: "danger",
                            confirmText: "삭제",
                            cancelText: "취소",
                            onConfirm: () => {
                                app.showAlert("삭제가 완료되었습니다.");
                            },
                            onCancel: () => {
                                app.showAlert("삭제가 취소되었습니다.");
                            }
                        });
                    }}>
                        콜백 함수 예시
                    </Lib.Button>
                </div>
            ),
            description: "확인/취소 콜백",
            code: `// 확인/취소 시 실행될 콜백 함수
app.showConfirm("데이터를 삭제하시겠습니까?", {
    title: "삭제 확인",
    type: "danger",
    confirmText: "삭제",
    cancelText: "취소",
    onConfirm: () => {
        app.showAlert("삭제가 완료되었습니다.");
    },
    onCancel: () => {
        app.showAlert("삭제가 취소되었습니다.");
    }
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                        <Lib.Button
                            onClick={() => {
                                app.showConfirm("확인 대화상자가 닫히면 입력창으로 포커스가 이동합니다.", {
                                    title: "포커스 이동",
                                    onFocus: () => inputRef.current?.focus()
                                });
                            }}
                        >
                            포커스 이동 예시
                        </Lib.Button>
                        <Lib.Input
                            ref={inputRef}
                            placeholder="포커스가 여기로 이동합니다"
                        />
                    </div>
                </div>
            ),
            description: "확인 대화상자가 닫힐 때 지정된 요소로 포커스가 이동합니다.",
            code: `// useRef 훅으로 입력창 참조 생성
const inputRef = useRef(null);

// 확인 대화상자가 닫힐 때 입력창으로 포커스 이동
<div className="flex gap-4 items-center">
    <Lib.Button
        onClick={() => {
            app.showConfirm("확인 대화상자가 닫히면 입력창으로 포커스가 이동합니다.", {
                title: "포커스 이동",
                onFocus: () => inputRef.current?.focus()
            });
        }}
    >
        포커스 이동 예시
    </Lib.Button>
    <Lib.Input
        ref={inputRef}
        placeholder="포커스가 여기로 이동합니다"
    />
</div>`
        }
    ];

    return examples;
};

