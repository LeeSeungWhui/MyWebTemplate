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
                        app.showConfirm("?�말 ??��?�시겠습?�까?").then(result => {
                            if (result) {
                                app.showAlert("??��?�었?�니??");
                            }
                        });
                    }}>
                        기본 ?�인
                    </Lib.Button>
                </div>
            ),
            description: "기본 ?�인 ?�?�상??,
            code: `// ���� ����� ?�용
const app = useSharedStore();

// 기본 ?�인
app.showConfirm("?�말 ??��?�시겠습?�까?").then(result => {
    if (result) {
        app.showAlert("??��?�었?�니??");
    }
});`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        app.showConfirm("???�업?� ?�돌�????�습?�다.\n계속?�시겠습?�까?", {
                            title: "주의",
                            type: "warning",
                            confirmText: "계속",
                            cancelText: "중단"
                        });
                    }}>
                        경고 ?�인
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showConfirm("모든 ?�이?��? ??��?�니??\n?�말 ??��?�시겠습?�까?", {
                            title: "??�� ?�인",
                            type: "danger",
                            confirmText: "??��",
                            cancelText: "취소"
                        });
                    }}>
                        ?�험 ?�인
                    </Lib.Button>
                </div>
            ),
            description: "?�인 ?�?�상???�형",
            code: `// 경고 ?�인
app.showConfirm("???�업?� ?�돌�????�습?�다.\\n계속?�시겠습?�까?", {
    title: "주의",
    type: "warning",
    confirmText: "계속",
    cancelText: "중단"
});

// ?�험 ?�인
app.showConfirm("모든 ?�이?��? ??��?�니??\\n?�말 ??��?�시겠습?�까?", {
    title: "??�� ?�인",
    type: "danger",
    confirmText: "??��",
    cancelText: "취소"
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        app.showConfirm("?�이?��? ??��?�시겠습?�까?", {
                            title: "??�� ?�인",
                            type: "danger",
                            confirmText: "??��",
                            cancelText: "취소",
                            onConfirm: () => {
                                app.showAlert("??��가 ?�료?�었?�니??");
                            },
                            onCancel: () => {
                                app.showAlert("??��가 취소?�었?�니??");
                            }
                        });
                    }}>
                        콜백 ?�수 ?�시
                    </Lib.Button>
                </div>
            ),
            description: "?�인/취소 콜백",
            code: `// ?�인/취소 ???�행??콜백 ?�수
app.showConfirm("?�이?��? ??��?�시겠습?�까?", {
    title: "??�� ?�인",
    type: "danger",
    confirmText: "??��",
    cancelText: "취소",
    onConfirm: () => {
        app.showAlert("??��가 ?�료?�었?�니??");
    },
    onCancel: () => {
        app.showAlert("??��가 취소?�었?�니??");
    }
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                        <Lib.Button
                            onClick={() => {
                                app.showConfirm("?�인 ?�?�상?��? ?�히�??�력창으�??�커?��? ?�동?�니??", {
                                    title: "?�커???�동",
                                    onFocus: () => inputRef.current?.focus()
                                });
                            }}
                        >
                            ?�커???�동 ?�시
                        </Lib.Button>
                        <Lib.Input
                            ref={inputRef}
                            placeholder="?�커?��? ?�기�??�동?�니??
                        />
                    </div>
                </div>
            ),
            description: "?�인 ?�?�상?��? ?�힐 ??지?�된 ?�소�??�커?��? ?�동?�니??",
            code: `// useRef ?�으�??�력�?참조 ?�성
const inputRef = useRef(null);

// ?�인 ?�?�상?��? ?�힐 ???�력창으�??�커???�동
<div className="flex gap-4 items-center">
    <Lib.Button
        onClick={() => {
            app.showConfirm("?�인 ?�?�상?��? ?�히�??�력창으�??�커?��? ?�동?�니??", {
                title: "?�커???�동",
                onFocus: () => inputRef.current?.focus()
            });
        }}
    >
        ?�커???�동 ?�시
    </Lib.Button>
    <Lib.Input
        ref={inputRef}
        placeholder="?�커?��? ?�기�??�동?�니??
    />
</div>`
        }
    ];

    return examples;
}; 
