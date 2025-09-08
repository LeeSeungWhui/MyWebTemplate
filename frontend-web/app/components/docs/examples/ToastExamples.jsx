import * as Lib from '@/lib';
import { useContext } from 'react';
import { AppContext } from '@/common/share/AppContext';

export const ToastExamples = () => {
    const app = useContext(AppContext);

    const examples = [
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        app.showToast("기본 토스트 메시지입니다.");
                    }}>
                        기본 토스트
                    </Lib.Button>
                </div>
            ),
            description: "기본 토스트",
            code: `// AppContext 사용
const app = useContext(AppContext);

// 기본 토스트
app.showToast("기본 토스트 메시지입니다.");`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        app.showToast("정보 토스트 메시지입니다.", {
                            type: "info"
                        });
                    }}>
                        정보 토스트
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("성공 토스트 메시지입니다.", {
                            type: "success"
                        });
                    }}>
                        성공 토스트
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("경고 토스트 메시지입니다.", {
                            type: "warning"
                        });
                    }}>
                        경고 토스트
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("에러 토스트 메시지입니다.", {
                            type: "error"
                        });
                    }}>
                        에러 토스트
                    </Lib.Button>
                </div>
            ),
            description: "토스트 유형",
            code: `// 정보 토스트
app.showToast("정보 토스트 메시지입니다.", {
    type: "info"
});

// 성공 토스트
app.showToast("성공 토스트 메시지입니다.", {
    type: "success"
});

// 경고 토스트
app.showToast("경고 토스트 메시지입니다.", {
    type: "warning"
});

// 에러 토스트
app.showToast("에러 토스트 메시지입니다.", {
    type: "error"
});`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        app.showToast("상단 왼쪽에 표시됩니다.", {
                            position: "top-left"
                        });
                    }}>
                        상단 왼쪽
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("상단 중앙에 표시됩니다.", {
                            position: "top-center"
                        });
                    }}>
                        상단 중앙
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("상단 오른쪽에 표시됩니다.", {
                            position: "top-right"
                        });
                    }}>
                        상단 오른쪽
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("하단 왼쪽에 표시됩니다.", {
                            position: "bottom-left"
                        });
                    }}>
                        하단 왼쪽
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("하단 중앙에 표시됩니다.", {
                            position: "bottom-center"
                        });
                    }}>
                        하단 중앙
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("하단 오른쪽에 표시됩니다.", {
                            position: "bottom-right"
                        });
                    }}>
                        하단 오른쪽
                    </Lib.Button>
                </div>
            ),
            description: "토스트 위치",
            code: `// 상단 왼쪽
app.showToast("상단 왼쪽에 표시됩니다.", {
    position: "top-left"
});

// 상단 중앙
app.showToast("상단 중앙에 표시됩니다.", {
    position: "top-center"
});

// 상단 오른쪽
app.showToast("상단 오른쪽에 표시됩니다.", {
    position: "top-right"
});

// 하단 왼쪽
app.showToast("하단 왼쪽에 표시됩니다.", {
    position: "bottom-left"
});

// 하단 중앙
app.showToast("하단 중앙에 표시됩니다.", {
    position: "bottom-center"
});

// 하단 오른쪽
app.showToast("하단 오른쪽에 표시됩니다.", {
    position: "bottom-right"
});`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        app.showToast("2초 후에 사라집니다.", {
                            duration: 2000
                        });
                    }}>
                        2초 지속
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("5초 후에 사라집니다.", {
                            duration: 5000
                        });
                    }}>
                        5초 지속
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("수동으로 닫아야 합니다.", {
                            duration: Infinity
                        });
                    }}>
                        수동 닫기
                    </Lib.Button>
                </div>
            ),
            description: "토스트 지속 시간",
            code: `// 2초 후 자동 닫기
app.showToast("2초 후에 사라집니다.", {
    duration: 2000
});

// 5초 후 자동 닫기
app.showToast("5초 후에 사라집니다.", {
    duration: 5000
});

// 수동으로만 닫기 (자동 닫기 비활성화)
app.showToast("수동으로 닫아야 합니다.", {
    duration: Infinity
});`
        }
    ];

    return examples;
}; 