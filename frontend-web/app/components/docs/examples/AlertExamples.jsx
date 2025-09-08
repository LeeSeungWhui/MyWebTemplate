import * as Lib from '@/lib';
import { useContext, useRef } from 'react';
import { AppContext } from '@/common/share/AppContext';

export const AlertExamples = () => {
    const app = useContext(AppContext);
    const buttonRef = useRef(null);
    const inputRef = useRef(null);

    const examples = [
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        app.showAlert("기본 알림 메시지입니다.");
                    }}>
                        기본 알림
                    </Lib.Button>
                </div>
            ),
            description: "기본 알림",
            code: `// AppContext 사용
const app = useContext(AppContext);

// 기본 알림
app.showAlert("기본 알림 메시지입니다.");`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        app.showAlert("정보 알림 메시지입니다.", {
                            title: "정보",
                            type: "info"
                        });
                    }}>
                        정보 알림
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showAlert("성공 알림 메시지입니다.", {
                            title: "성공",
                            type: "success"
                        });
                    }}>
                        성공 알림
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showAlert("경고 알림 메시지입니다.", {
                            title: "경고",
                            type: "warning"
                        });
                    }}>
                        경고 알림
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showAlert("에러 알림 메시지입니다.", {
                            title: "에러",
                            type: "error"
                        });
                    }}>
                        에러 알림
                    </Lib.Button>
                </div>
            ),
            description: "알림 유형",
            code: `// 정보 알림
app.showAlert("정보 알림 메시지입니다.", {
    title: "정보",
    type: "info"
});

// 성공 알림
app.showAlert("성공 알림 메시지입니다.", {
    title: "성공",
    type: "success"
});

// 경고 알림
app.showAlert("경고 알림 메시지입니다.", {
    title: "경고",
    type: "warning"
});

// 에러 알림
app.showAlert("에러 알림 메시지입니다.", {
    title: "에러",
    type: "error"
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        app.showAlert("작업이 완료되었습니다.", {
                            title: "알림",
                            onClick: function () {
                                alert("알림이 닫혔습니다.");
                            }
                        });
                    }}>
                        콜백 함수 예시
                    </Lib.Button>
                </div>
            ),
            description: "알림 닫힘 콜백",
            code: `// 알림이 닫힐 때 실행될 콜백 함수
app.showAlert("작업이 완료되었습니다.", {
    title: "알림",
    onClick: function() {
        alert("알림이 닫혔습니다.");
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
                                app.showAlert("알림이 닫히면 입력창으로 포커스가 이동합니다.", {
                                    title: "알림",
                                    onFocus: () => inputRef.current?.focus()
                                });
                            }}
                        >
                            알림 열기
                        </Lib.Button>
                        <Lib.Input
                            ref={inputRef}
                            placeholder="포커스가 여기로 이동합니다"
                        />
                    </div>
                </div>
            ),
            description: "알림 닫힘 후 포커스가 지정된 요소로 이동합니다.",
            code: `// useRef 훅으로 입력창 참조 생성
const inputRef = useRef(null);

// 알림이 닫힐 때 입력창으로 포커스 이동
<div className="flex gap-4 items-center">
    <Lib.Button
        ref={buttonRef}
        onClick={() => {
            app.showAlert("알림이 닫히면 입력창으로 포커스가 이동합니다.", {
                title: "알림",
                onFocus: () => inputRef.current?.focus()
            });
        }}
    >
        알림 열기
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