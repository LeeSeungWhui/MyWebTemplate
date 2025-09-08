import * as Lib from '@/lib';
import { useRef } from 'react';
import { useSharedStore } from '@/app/common/store/Shared';

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
                        app.showConfirm("이 작업은 되돌릴 수 없습니다.\n계속하시겠습니까?", {
                        경고 확인
                        app.showConfirm("모든 데이터가 삭제됩니다.\n정말 삭제하시겠습니까?", {
                            title: "삭제 확인",
                            confirmText: "삭제",
                        });
                    }}>
                        위험 확인
                    </Lib.Button>
            description: "확인 대화상자 유형",
            code: `// 경고 확인
app.showConfirm("이 작업은 되돌릴 수 없습니다.\\n계속하시겠습니까?", {
// 위험 확인
app.showConfirm("모든 데이터가 삭제됩니다.\\n정말 삭제하시겠습니까?", {
    title: "삭제 확인",
    confirmText: "삭제",
                        app.showConfirm("데이터를 삭제하시겠습니까?", {
                            title: "삭제 확인",
                            confirmText: "삭제",
                                app.showAlert("삭제가 완료되었습니다.");
                                app.showAlert("삭제가 취소되었습니다.");
                        콜백 함수 예시
            description: "확인/취소 콜백",
            code: `// 확인/취소 시 실행될 콜백 함수
app.showConfirm("데이터를 삭제하시겠습니까?", {
    title: "삭제 확인",
    confirmText: "삭제",
        app.showAlert("삭제가 완료되었습니다.");
        app.showAlert("삭제가 취소되었습니다.");
                                app.showConfirm("확인 대화상자가 닫히면 입력창으로 포커스가 이동합니다.", {
                                    title: "포커스 이동",
                            포커스 이동 예시
                            placeholder="포커스가 여기로 이동합니다"
            description: "확인 대화상자가 닫힐 때 지정된 요소로 포커스가 이동합니다.",
            code: `// useRef 훅으로 입력창 참조 생성
// 확인 대화상자가 닫힐 때 입력창으로 포커스 이동
            app.showConfirm("확인 대화상자가 닫히면 입력창으로 포커스가 이동합니다.", {
                title: "포커스 이동",
        포커스 이동 예시
        placeholder="포커스가 여기로 이동합니다"
}; 
                    <Lib.Button onClick={() => {
                        app.showConfirm("?域?圉? ??�?�窶?�?", {
                            title: "??� ?",
                            type: "danger",
                            confirmText: "??�",
                            cancelText: "鼒到�",
                            onConfirm: () => {
                                app.showAlert("??�穈 ?�?�?蛟�??");
                            },
                            onCancel: () => {
                                app.showAlert("??�穈 鼒到�?�?蛟�??");
                            }
                        });
                    }}>
                        儠停 ?到� ?�
                    </Lib.Button>
                </div>
            ),
            description: "?/鼒到� 儠停",
            code: `// ?/鼒到� ???欠�??儠停 ?到�
app.showConfirm("?域?圉? ??�?�窶?�?", {
    title: "??� ?",
    type: "danger",
    confirmText: "??�",
    cancelText: "鼒到�",
    onConfirm: () => {
        app.showAlert("??�穈 ?�?�?蛟�??");
    },
    onCancel: () => {
        app.showAlert("??�穈 鼒到�?�?蛟�??");
    }
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                        <Lib.Button
                            onClick={() => {
                                app.showConfirm("? ??�?? ?恆�諰??麆趣諢??科誘?曰? ?渠�?拘�??", {
                                    title: "?科誘???渠�",
                                    onFocus: () => inputRef.current?.focus()
                                });
                            }}
                        >
                            ?科誘???渠� ?�
                        </Lib.Button>
                        <Lib.Input
                            ref={inputRef}
                            placeholder="?科誘?曰? ?禹萼諢??渠�?拘�??
                        />
                    </div>
                </div>
            ),
            description: "? ??�?? ?恆� ??鴔?� ?�諢??科誘?曰? ?渠�?拘�??",
            code: `// useRef ?諢??麆?麆賄※ ?
const inputRef = useRef(null);

// ? ??�?? ?恆� ???麆趣諢??科誘???渠�
<div className="flex gap-4 items-center">
    <Lib.Button
        onClick={() => {
            app.showConfirm("? ??�?? ?恆�諰??麆趣諢??科誘?曰? ?渠�?拘�??", {
                title: "?科誘???渠�",
                onFocus: () => inputRef.current?.focus()
            });
        }}
    >
        ?科誘???渠� ?�
    </Lib.Button>
    <Lib.Input
        ref={inputRef}
        placeholder="?科誘?曰? ?禹萼諢??渠�?拘�??
    />
</div>`
        }
    ];

    return examples;
}; 