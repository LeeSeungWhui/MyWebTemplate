import * as Lib from '@/lib';
import { useRef } from 'react';
import { useSharedStore } from '@/app/common/store/Shared';

export const AlertExamples = () => {
    const app = useSharedStore();
    const buttonRef = useRef(null);
    const inputRef = useRef(null);

    const examples = [
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        app.showAlert("기본 ?�림 메시지?�니??");
                    }}>
                        기본 ?�림
                    </Lib.Button>
                </div>
            ),
            description: "기본 ?�림",
            code: `// ���� ����� ?�용
const app = useSharedStore();

// 기본 ?�림
app.showAlert("기본 ?�림 메시지?�니??");`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        app.showAlert("?�보 ?�림 메시지?�니??", {
                            title: "?�보",
                            type: "info"
                        });
                    }}>
                        ?�보 ?�림
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showAlert("?�공 ?�림 메시지?�니??", {
                            title: "?�공",
                            type: "success"
                        });
                    }}>
                        ?�공 ?�림
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showAlert("경고 ?�림 메시지?�니??", {
                            title: "경고",
                            type: "warning"
                        });
                    }}>
                        경고 ?�림
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showAlert("?�러 ?�림 메시지?�니??", {
                            title: "?�러",
                            type: "error"
                        });
                    }}>
                        ?�러 ?�림
                    </Lib.Button>
                </div>
            ),
            description: "?�림 ?�형",
            code: `// ?�보 ?�림
app.showAlert("?�보 ?�림 메시지?�니??", {
    title: "?�보",
    type: "info"
});

// ?�공 ?�림
app.showAlert("?�공 ?�림 메시지?�니??", {
    title: "?�공",
    type: "success"
});

// 경고 ?�림
app.showAlert("경고 ?�림 메시지?�니??", {
    title: "경고",
    type: "warning"
});

// ?�러 ?�림
app.showAlert("?�러 ?�림 메시지?�니??", {
    title: "?�러",
    type: "error"
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        app.showAlert("?�업???�료?�었?�니??", {
                            title: "?�림",
                            onClick: function () {
                                alert("?�림???�혔?�니??");
                            }
                        });
                    }}>
                        콜백 ?�수 ?�시
                    </Lib.Button>
                </div>
            ),
            description: "?�림 ?�힘 콜백",
            code: `// ?�림???�힐 ???�행??콜백 ?�수
app.showAlert("?�업???�료?�었?�니??", {
    title: "?�림",
    onClick: function() {
        alert("?�림???�혔?�니??");
    }
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                        <Lib.Button
                            ref={buttonRef}
                            onClick={() => {
                                app.showAlert("?�림???�히�??�력창으�??�커?��? ?�동?�니??", {
                                    title: "?�림",
                                    onFocus: () => inputRef.current?.focus()
                                });
                            }}
                        >
                            ?�림 ?�기
                        </Lib.Button>
                        <Lib.Input
                            ref={inputRef}
                            placeholder="?�커?��? ?�기�??�동?�니??
                        />
                    </div>
                </div>
            ),
            description: "?�림 ?�힘 ???�커?��? 지?�된 ?�소�??�동?�니??",
            code: `// useRef ?�으�??�력�?참조 ?�성
const inputRef = useRef(null);

// ?�림???�힐 ???�력창으�??�커???�동
<div className="flex gap-4 items-center">
    <Lib.Button
        ref={buttonRef}
        onClick={() => {
            app.showAlert("?�림???�히�??�력창으�??�커?��? ?�동?�니??", {
                title: "?�림",
                onFocus: () => inputRef.current?.focus()
            });
        }}
    >
        ?�림 ?�기
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
