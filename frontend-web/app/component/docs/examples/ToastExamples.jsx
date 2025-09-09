import * as Lib from '@/lib';
import { useSharedStore } from '@/app/common/store/SharedStore';

export const ToastExamples = () => {
    const app = useSharedStore();

    const examples = [
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        app.showToast("ê¸°ë³¸ ? ìŠ¤??ë©”ì‹œì§€?…ë‹ˆ??");
                    }}>
                        ê¸°ë³¸ ? ìŠ¤??
                    </Lib.Button>
                </div>
            ),
            description: "ê¸°ë³¸ ? ìŠ¤??,
            code: `// useSharedStore ?¬ìš©
const app = useSharedStore();

// ê¸°ë³¸ ? ìŠ¤??
app.showToast("ê¸°ë³¸ ? ìŠ¤??ë©”ì‹œì§€?…ë‹ˆ??");`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        app.showToast("?•ë³´ ? ìŠ¤??ë©”ì‹œì§€?…ë‹ˆ??", {
                            type: "info"
                        });
                    }}>
                        ?•ë³´ ? ìŠ¤??
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("?±ê³µ ? ìŠ¤??ë©”ì‹œì§€?…ë‹ˆ??", {
                            type: "success"
                        });
                    }}>
                        ?±ê³µ ? ìŠ¤??
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("ê²½ê³  ? ìŠ¤??ë©”ì‹œì§€?…ë‹ˆ??", {
                            type: "warning"
                        });
                    }}>
                        ê²½ê³  ? ìŠ¤??
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("?ëŸ¬ ? ìŠ¤??ë©”ì‹œì§€?…ë‹ˆ??", {
                            type: "error"
                        });
                    }}>
                        ?ëŸ¬ ? ìŠ¤??
                    </Lib.Button>
                </div>
            ),
            description: "? ìŠ¤??? í˜•",
            code: `// ?•ë³´ ? ìŠ¤??
app.showToast("?•ë³´ ? ìŠ¤??ë©”ì‹œì§€?…ë‹ˆ??", {
    type: "info"
});

// ?±ê³µ ? ìŠ¤??
app.showToast("?±ê³µ ? ìŠ¤??ë©”ì‹œì§€?…ë‹ˆ??", {
    type: "success"
});

// ê²½ê³  ? ìŠ¤??
app.showToast("ê²½ê³  ? ìŠ¤??ë©”ì‹œì§€?…ë‹ˆ??", {
    type: "warning"
});

// ?ëŸ¬ ? ìŠ¤??
app.showToast("?ëŸ¬ ? ìŠ¤??ë©”ì‹œì§€?…ë‹ˆ??", {
    type: "error"
});`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        app.showToast("?ë‹¨ ?¼ìª½???œì‹œ?©ë‹ˆ??", {
                            position: "top-left"
                        });
                    }}>
                        ?ë‹¨ ?¼ìª½
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("?ë‹¨ ì¤‘ì•™???œì‹œ?©ë‹ˆ??", {
                            position: "top-center"
                        });
                    }}>
                        ?ë‹¨ ì¤‘ì•™
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("?ë‹¨ ?¤ë¥¸ìª½ì— ?œì‹œ?©ë‹ˆ??", {
                            position: "top-right"
                        });
                    }}>
                        ?ë‹¨ ?¤ë¥¸ìª?
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("?˜ë‹¨ ?¼ìª½???œì‹œ?©ë‹ˆ??", {
                            position: "bottom-left"
                        });
                    }}>
                        ?˜ë‹¨ ?¼ìª½
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("?˜ë‹¨ ì¤‘ì•™???œì‹œ?©ë‹ˆ??", {
                            position: "bottom-center"
                        });
                    }}>
                        ?˜ë‹¨ ì¤‘ì•™
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("?˜ë‹¨ ?¤ë¥¸ìª½ì— ?œì‹œ?©ë‹ˆ??", {
                            position: "bottom-right"
                        });
                    }}>
                        ?˜ë‹¨ ?¤ë¥¸ìª?
                    </Lib.Button>
                </div>
            ),
            description: "? ìŠ¤???„ì¹˜",
            code: `// ?ë‹¨ ?¼ìª½
app.showToast("?ë‹¨ ?¼ìª½???œì‹œ?©ë‹ˆ??", {
    position: "top-left"
});

// ?ë‹¨ ì¤‘ì•™
app.showToast("?ë‹¨ ì¤‘ì•™???œì‹œ?©ë‹ˆ??", {
    position: "top-center"
});

// ?ë‹¨ ?¤ë¥¸ìª?
app.showToast("?ë‹¨ ?¤ë¥¸ìª½ì— ?œì‹œ?©ë‹ˆ??", {
    position: "top-right"
});

// ?˜ë‹¨ ?¼ìª½
app.showToast("?˜ë‹¨ ?¼ìª½???œì‹œ?©ë‹ˆ??", {
    position: "bottom-left"
});

// ?˜ë‹¨ ì¤‘ì•™
app.showToast("?˜ë‹¨ ì¤‘ì•™???œì‹œ?©ë‹ˆ??", {
    position: "bottom-center"
});

// ?˜ë‹¨ ?¤ë¥¸ìª?
app.showToast("?˜ë‹¨ ?¤ë¥¸ìª½ì— ?œì‹œ?©ë‹ˆ??", {
    position: "bottom-right"
});`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        app.showToast("2ì´??„ì— ?¬ë¼ì§‘ë‹ˆ??", {
                            duration: 2000
                        });
                    }}>
                        2ì´?ì§€??
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("5ì´??„ì— ?¬ë¼ì§‘ë‹ˆ??", {
                            duration: 5000
                        });
                    }}>
                        5ì´?ì§€??
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showToast("?˜ë™?¼ë¡œ ?«ì•„???©ë‹ˆ??", {
                            duration: Infinity
                        });
                    }}>
                        ?˜ë™ ?«ê¸°
                    </Lib.Button>
                </div>
            ),
            description: "? ìŠ¤??ì§€???œê°„",
            code: `// 2ì´????ë™ ?«ê¸°
app.showToast("2ì´??„ì— ?¬ë¼ì§‘ë‹ˆ??", {
    duration: 2000
});

// 5ì´????ë™ ?«ê¸°
app.showToast("5ì´??„ì— ?¬ë¼ì§‘ë‹ˆ??", {
    duration: 5000
});

// ?˜ë™?¼ë¡œë§??«ê¸° (?ë™ ?«ê¸° ë¹„í™œ?±í™”)
app.showToast("?˜ë™?¼ë¡œ ?«ì•„???©ë‹ˆ??", {
    duration: Infinity
});`
        }
    ];

    return examples;
}; 
