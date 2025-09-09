import * as Lib from '@/lib';
import { useSharedStore } from '@/app/common/store/SharedStore';

export const ToastExamples = () => {
    const app = useSharedStore();

    const examples = [
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        app.showToast("기본 ?�스??메시지?�니??");
                    }}>
                        기본 ?�스??
                    </Lib.Button>
                </div>
            ),
            description: "기본 ?�스??,
            code: `// useSharedStore ?�용
const app = useSharedStore();

// 기본 ?�스??
app.showToast("기본 ?�스??메시지?�니??");`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        app.showToast("?�보 ?�스??메시지?�니??", {
                            type: "info"
                        });
                    }}>
                        ?�보 ?�스??
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("?�공 ?�스??메시지?�니??", {
                            type: "success"
                        });
                    }}>
                        ?�공 ?�스??
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("경고 ?�스??메시지?�니??", {
                            type: "warning"
                        });
                    }}>
                        경고 ?�스??
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("?�러 ?�스??메시지?�니??", {
                            type: "error"
                        });
                    }}>
                        ?�러 ?�스??
                    </Lib.Button>
                </div>
            ),
            description: "?�스???�형",
            code: `// ?�보 ?�스??
app.showToast("?�보 ?�스??메시지?�니??", {
    type: "info"
});

// ?�공 ?�스??
app.showToast("?�공 ?�스??메시지?�니??", {
    type: "success"
});

// 경고 ?�스??
app.showToast("경고 ?�스??메시지?�니??", {
    type: "warning"
});

// ?�러 ?�스??
app.showToast("?�러 ?�스??메시지?�니??", {
    type: "error"
});`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        app.showToast("?�단 ?�쪽???�시?�니??", {
                            position: "top-left"
                        });
                    }}>
                        ?�단 ?�쪽
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("?�단 중앙???�시?�니??", {
                            position: "top-center"
                        });
                    }}>
                        ?�단 중앙
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("?�단 ?�른쪽에 ?�시?�니??", {
                            position: "top-right"
                        });
                    }}>
                        ?�단 ?�른�?
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("?�단 ?�쪽???�시?�니??", {
                            position: "bottom-left"
                        });
                    }}>
                        ?�단 ?�쪽
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("?�단 중앙???�시?�니??", {
                            position: "bottom-center"
                        });
                    }}>
                        ?�단 중앙
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("?�단 ?�른쪽에 ?�시?�니??", {
                            position: "bottom-right"
                        });
                    }}>
                        ?�단 ?�른�?
                    </Lib.Button>
                </div>
            ),
            description: "?�스???�치",
            code: `// ?�단 ?�쪽
app.showToast("?�단 ?�쪽???�시?�니??", {
    position: "top-left"
});

// ?�단 중앙
app.showToast("?�단 중앙???�시?�니??", {
    position: "top-center"
});

// ?�단 ?�른�?
app.showToast("?�단 ?�른쪽에 ?�시?�니??", {
    position: "top-right"
});

// ?�단 ?�쪽
app.showToast("?�단 ?�쪽???�시?�니??", {
    position: "bottom-left"
});

// ?�단 중앙
app.showToast("?�단 중앙???�시?�니??", {
    position: "bottom-center"
});

// ?�단 ?�른�?
app.showToast("?�단 ?�른쪽에 ?�시?�니??", {
    position: "bottom-right"
});`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        app.showToast("2�??�에 ?�라집니??", {
                            duration: 2000
                        });
                    }}>
                        2�?지??
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("5�??�에 ?�라집니??", {
                            duration: 5000
                        });
                    }}>
                        5�?지??
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("?�동?�로 ?�아???�니??", {
                            duration: Infinity
                        });
                    }}>
                        ?�동 ?�기
                    </Lib.Button>
                </div>
            ),
            description: "?�스??지???�간",
            code: `// 2�????�동 ?�기
app.showToast("2�??�에 ?�라집니??", {
    duration: 2000
});

// 5�????�동 ?�기
app.showToast("5�??�에 ?�라집니??", {
    duration: 5000
});

// ?�동?�로�??�기 (?�동 ?�기 비활?�화)
app.showToast("?�동?�로 ?�아???�니??", {
    duration: Infinity
});`
        }
    ];

    return examples;
}; 
