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
                        app.showConfirm("?•ë§ ?? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?").then(result => {
                            if (result) {
                                app.showAlert("?? œ?˜ì—ˆ?µë‹ˆ??");
                            }
                        });
                    }}>
                        ê¸°ë³¸ ?•ì¸
                    </Lib.Button>
                </div>
            ),
            description: "ê¸°ë³¸ ?•ì¸ ?€?”ìƒ??,
            code: `// Àü¿ª ½ºÅä¾î ?¬ìš©
const app = useSharedStore();

// ê¸°ë³¸ ?•ì¸
app.showConfirm("?•ë§ ?? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?").then(result => {
    if (result) {
        app.showAlert("?? œ?˜ì—ˆ?µë‹ˆ??");
    }
});`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        app.showConfirm("???‘ì—…?€ ?˜ëŒë¦????†ìŠµ?ˆë‹¤.\nê³„ì†?˜ì‹œê² ìŠµ?ˆê¹Œ?", {
                            title: "ì£¼ì˜",
                            type: "warning",
                            confirmText: "ê³„ì†",
                            cancelText: "ì¤‘ë‹¨"
                        });
                    }}>
                        ê²½ê³  ?•ì¸
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        app.showConfirm("ëª¨ë“  ?°ì´?°ê? ?? œ?©ë‹ˆ??\n?•ë§ ?? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?", {
                            title: "?? œ ?•ì¸",
                            type: "danger",
                            confirmText: "?? œ",
                            cancelText: "ì·¨ì†Œ"
                        });
                    }}>
                        ?„í—˜ ?•ì¸
                    </Lib.Button>
                </div>
            ),
            description: "?•ì¸ ?€?”ìƒ??? í˜•",
            code: `// ê²½ê³  ?•ì¸
app.showConfirm("???‘ì—…?€ ?˜ëŒë¦????†ìŠµ?ˆë‹¤.\\nê³„ì†?˜ì‹œê² ìŠµ?ˆê¹Œ?", {
    title: "ì£¼ì˜",
    type: "warning",
    confirmText: "ê³„ì†",
    cancelText: "ì¤‘ë‹¨"
});

// ?„í—˜ ?•ì¸
app.showConfirm("ëª¨ë“  ?°ì´?°ê? ?? œ?©ë‹ˆ??\\n?•ë§ ?? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?", {
    title: "?? œ ?•ì¸",
    type: "danger",
    confirmText: "?? œ",
    cancelText: "ì·¨ì†Œ"
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        app.showConfirm("?°ì´?°ë? ?? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?", {
                            title: "?? œ ?•ì¸",
                            type: "danger",
                            confirmText: "?? œ",
                            cancelText: "ì·¨ì†Œ",
                            onConfirm: () => {
                                app.showAlert("?? œê°€ ?„ë£Œ?˜ì—ˆ?µë‹ˆ??");
                            },
                            onCancel: () => {
                                app.showAlert("?? œê°€ ì·¨ì†Œ?˜ì—ˆ?µë‹ˆ??");
                            }
                        });
                    }}>
                        ì½œë°± ?¨ìˆ˜ ?ˆì‹œ
                    </Lib.Button>
                </div>
            ),
            description: "?•ì¸/ì·¨ì†Œ ì½œë°±",
            code: `// ?•ì¸/ì·¨ì†Œ ???¤í–‰??ì½œë°± ?¨ìˆ˜
app.showConfirm("?°ì´?°ë? ?? œ?˜ì‹œê² ìŠµ?ˆê¹Œ?", {
    title: "?? œ ?•ì¸",
    type: "danger",
    confirmText: "?? œ",
    cancelText: "ì·¨ì†Œ",
    onConfirm: () => {
        app.showAlert("?? œê°€ ?„ë£Œ?˜ì—ˆ?µë‹ˆ??");
    },
    onCancel: () => {
        app.showAlert("?? œê°€ ì·¨ì†Œ?˜ì—ˆ?µë‹ˆ??");
    }
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                        <Lib.Button
                            onClick={() => {
                                app.showConfirm("?•ì¸ ?€?”ìƒ?ê? ?«íˆë©??…ë ¥ì°½ìœ¼ë¡??¬ì»¤?¤ê? ?´ë™?©ë‹ˆ??", {
                                    title: "?¬ì»¤???´ë™",
                                    onFocus: () => inputRef.current?.focus()
                                });
                            }}
                        >
                            ?¬ì»¤???´ë™ ?ˆì‹œ
                        </Lib.Button>
                        <Lib.Input
                            ref={inputRef}
                            placeholder="?¬ì»¤?¤ê? ?¬ê¸°ë¡??´ë™?©ë‹ˆ??
                        />
                    </div>
                </div>
            ),
            description: "?•ì¸ ?€?”ìƒ?ê? ?«í ??ì§€?•ëœ ?”ì†Œë¡??¬ì»¤?¤ê? ?´ë™?©ë‹ˆ??",
            code: `// useRef ?…ìœ¼ë¡??…ë ¥ì°?ì°¸ì¡° ?ì„±
const inputRef = useRef(null);

// ?•ì¸ ?€?”ìƒ?ê? ?«í ???…ë ¥ì°½ìœ¼ë¡??¬ì»¤???´ë™
<div className="flex gap-4 items-center">
    <Lib.Button
        onClick={() => {
            app.showConfirm("?•ì¸ ?€?”ìƒ?ê? ?«íˆë©??…ë ¥ì°½ìœ¼ë¡??¬ì»¤?¤ê? ?´ë™?©ë‹ˆ??", {
                title: "?¬ì»¤???´ë™",
                onFocus: () => inputRef.current?.focus()
            });
        }}
    >
        ?¬ì»¤???´ë™ ?ˆì‹œ
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
