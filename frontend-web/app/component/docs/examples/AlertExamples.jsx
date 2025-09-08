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
                        app.showAlert("ê¸°ë³¸ ?Œë¦¼ ë©”ì‹œì§€?…ë‹ˆ??");
                    }}>
                        ê¸°ë³¸ ?Œë¦¼
                    </Lib.Button>
                </div>
            ),
            description: "ê¸°ë³¸ ?Œë¦¼",
            code: `// Àü¿ª ½ºÅä¾î ?¬ìš©
const app = useSharedStore();

// ê¸°ë³¸ ?Œë¦¼
app.showAlert("ê¸°ë³¸ ?Œë¦¼ ë©”ì‹œì§€?…ë‹ˆ??");`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        app.showAlert("?•ë³´ ?Œë¦¼ ë©”ì‹œì§€?…ë‹ˆ??", {
                            title: "?•ë³´",
                            type: "info"
                        });
                    }}>
                        ?•ë³´ ?Œë¦¼
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showAlert("?±ê³µ ?Œë¦¼ ë©”ì‹œì§€?…ë‹ˆ??", {
                            title: "?±ê³µ",
                            type: "success"
                        });
                    }}>
                        ?±ê³µ ?Œë¦¼
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showAlert("ê²½ê³  ?Œë¦¼ ë©”ì‹œì§€?…ë‹ˆ??", {
                            title: "ê²½ê³ ",
                            type: "warning"
                        });
                    }}>
                        ê²½ê³  ?Œë¦¼
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showAlert("?ëŸ¬ ?Œë¦¼ ë©”ì‹œì§€?…ë‹ˆ??", {
                            title: "?ëŸ¬",
                            type: "error"
                        });
                    }}>
                        ?ëŸ¬ ?Œë¦¼
                    </Lib.Button>
                </div>
            ),
            description: "?Œë¦¼ ? í˜•",
            code: `// ?•ë³´ ?Œë¦¼
app.showAlert("?•ë³´ ?Œë¦¼ ë©”ì‹œì§€?…ë‹ˆ??", {
    title: "?•ë³´",
    type: "info"
});

// ?±ê³µ ?Œë¦¼
app.showAlert("?±ê³µ ?Œë¦¼ ë©”ì‹œì§€?…ë‹ˆ??", {
    title: "?±ê³µ",
    type: "success"
});

// ê²½ê³  ?Œë¦¼
app.showAlert("ê²½ê³  ?Œë¦¼ ë©”ì‹œì§€?…ë‹ˆ??", {
    title: "ê²½ê³ ",
    type: "warning"
});

// ?ëŸ¬ ?Œë¦¼
app.showAlert("?ëŸ¬ ?Œë¦¼ ë©”ì‹œì§€?…ë‹ˆ??", {
    title: "?ëŸ¬",
    type: "error"
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        app.showAlert("?‘ì—…???„ë£Œ?˜ì—ˆ?µë‹ˆ??", {
                            title: "?Œë¦¼",
                            onClick: function () {
                                alert("?Œë¦¼???«í˜”?µë‹ˆ??");
                            }
                        });
                    }}>
                        ì½œë°± ?¨ìˆ˜ ?ˆì‹œ
                    </Lib.Button>
                </div>
            ),
            description: "?Œë¦¼ ?«í˜ ì½œë°±",
            code: `// ?Œë¦¼???«í ???¤í–‰??ì½œë°± ?¨ìˆ˜
app.showAlert("?‘ì—…???„ë£Œ?˜ì—ˆ?µë‹ˆ??", {
    title: "?Œë¦¼",
    onClick: function() {
        alert("?Œë¦¼???«í˜”?µë‹ˆ??");
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
                                app.showAlert("?Œë¦¼???«íˆë©??…ë ¥ì°½ìœ¼ë¡??¬ì»¤?¤ê? ?´ë™?©ë‹ˆ??", {
                                    title: "?Œë¦¼",
                                    onFocus: () => inputRef.current?.focus()
                                });
                            }}
                        >
                            ?Œë¦¼ ?´ê¸°
                        </Lib.Button>
                        <Lib.Input
                            ref={inputRef}
                            placeholder="?¬ì»¤?¤ê? ?¬ê¸°ë¡??´ë™?©ë‹ˆ??
                        />
                    </div>
                </div>
            ),
            description: "?Œë¦¼ ?«í˜ ???¬ì»¤?¤ê? ì§€?•ëœ ?”ì†Œë¡??´ë™?©ë‹ˆ??",
            code: `// useRef ?…ìœ¼ë¡??…ë ¥ì°?ì°¸ì¡° ?ì„±
const inputRef = useRef(null);

// ?Œë¦¼???«í ???…ë ¥ì°½ìœ¼ë¡??¬ì»¤???´ë™
<div className="flex gap-4 items-center">
    <Lib.Button
        ref={buttonRef}
        onClick={() => {
            app.showAlert("?Œë¦¼???«íˆë©??…ë ¥ì°½ìœ¼ë¡??¬ì»¤?¤ê? ?´ë™?©ë‹ˆ??", {
                title: "?Œë¦¼",
                onFocus: () => inputRef.current?.focus()
            });
        }}
    >
        ?Œë¦¼ ?´ê¸°
    </Lib.Button>
    <Lib.Input
        ref={inputRef}
        placeholder="?¬ì»¤?¤ê? ?¬ê¸°ë¡??´ë™?©ë‹ˆ??
    />
</div>`
        }
    ];

    return examples;
}; 
