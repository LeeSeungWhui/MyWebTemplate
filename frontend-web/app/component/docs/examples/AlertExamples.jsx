/**
 * ?뚯씪紐? AlertExamples.jsx
 * ?묒꽦?? LSH
 * 媛깆떊?? 2025-09-13
 * ?ㅻ챸: Alert 而댄룷?뚰듃 ?덉젣
 */
import * as Lib from '@/app/lib';
import { useRef } from 'react';
import { useSharedStore } from '@/app/common/store/SharedStore';

export const AlertExamples = () => {
    const showAlert = useSharedStore(s => s.showAlert);
    const buttonRef = useRef(null);
    const inputRef = useRef(null);

    const examples = [
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        showAlert("湲곕낯 ?뚮┝ 硫붿떆吏?낅땲??");
                    }}>
                        湲곕낯 ?뚮┝
                    </Lib.Button>
                </div>
            ),
            description: "湲곕낯 ?뚮┝",
            code: `// useSharedStore ?ъ슜
const showAlert = useSharedStore(s => s.showAlert);

// 湲곕낯 ?뚮┝
showAlert("湲곕낯 ?뚮┝ 硫붿떆吏?낅땲??");`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        showAlert("?뺣낫 ?뚮┝ 硫붿떆吏?낅땲??", {
                            title: "?뺣낫",
                            type: "info"
                        });
                    }}>
                        ?뺣낫 ?뚮┝
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        showAlert("?깃났 ?뚮┝ 硫붿떆吏?낅땲??", {
                            title: "?깃났",
                            type: "success"
                        });
                    }}>
                        ?깃났 ?뚮┝
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        showAlert("寃쎄퀬 ?뚮┝ 硫붿떆吏?낅땲??", {
                            title: "寃쎄퀬",
                            type: "warning"
                        });
                    }}>
                        寃쎄퀬 ?뚮┝
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        showAlert("?ㅻ쪟 ?뚮┝ 硫붿떆吏?낅땲??", {
                            title: "?ㅻ쪟",
                            type: "error"
                        });
                    }}>
                        ?ㅻ쪟 ?뚮┝
                    </Lib.Button>
                </div>
            ),
            description: "?뚮┝ ?좏삎",
            code: `// ?뺣낫 ?뚮┝
showAlert("?뺣낫 ?뚮┝ 硫붿떆吏?낅땲??", {
    title: "?뺣낫",
    type: "info"
});

// ?깃났 ?뚮┝
showAlert("?깃났 ?뚮┝ 硫붿떆吏?낅땲??", {
    title: "?깃났",
    type: "success"
});

// 寃쎄퀬 ?뚮┝
showAlert("寃쎄퀬 ?뚮┝ 硫붿떆吏?낅땲??", {
    title: "寃쎄퀬",
    type: "warning"
});

// ?ㅻ쪟 ?뚮┝
showAlert("?ㅻ쪟 ?뚮┝ 硫붿떆吏?낅땲??", {
    title: "?ㅻ쪟",
    type: "error"
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        showAlert("?묒뾽???꾨즺?섏뿀?듬땲??", {
                            title: "?뚮┝",
                            onClick: function () {
                                alert("?뚮┝???ロ삍?듬땲??");
                            }
                        });
                    }}>
                        肄쒕갚 ?⑥닔 ?덉떆
                    </Lib.Button>
                </div>
            ),
            description: "?뚮┝ ?ロ옒 肄쒕갚",
            code: `// ?뚮┝???ロ옄 ???ㅽ뻾??肄쒕갚 ?⑥닔
showAlert("?묒뾽???꾨즺?섏뿀?듬땲??", {
    title: "?뚮┝",
    onClick: function() {
        alert("?뚮┝???ロ삍?듬땲??");
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
                                showAlert("?뚮┝???ロ엳硫??낅젰李쎌쑝濡??ъ빱?ㅺ? ?대룞?⑸땲??", {
                                    title: "?뚮┝",
                                    onFocus: () => inputRef.current?.focus()
                                });
                            }}
                        >
                            ?뚮┝ ?닿린
                        </Lib.Button>
                        <Lib.Input
                            ref={inputRef}
                            placeholder="?ъ빱?ㅺ? ?ш린濡??대룞?⑸땲??
                        />
                    </div>
                </div>
            ),
            description: "?뚮┝ ?ロ옒 ??吏?뺣맂 ?붿냼濡??ъ빱???대룞",
            code: `// useRef ?낆쑝濡??낅젰李?李몄“ ?앹꽦
const inputRef = useRef(null);

// ?뚮┝???ロ옄 ???낅젰李쎌쑝濡??ъ빱???대룞
<div className="flex gap-4 items-center">
    <Lib.Button
        ref={buttonRef}
        onClick={() => {
            showAlert("?뚮┝???ロ엳硫??낅젰李쎌쑝濡??ъ빱?ㅺ? ?대룞?⑸땲??", {
                title: "?뚮┝",
                onFocus: () => inputRef.current?.focus()
            });
        }}
    >
        ?뚮┝ ?닿린
    </Lib.Button>
    <Lib.Input
        ref={inputRef}
        placeholder="?ъ빱?ㅺ? ?ш린濡??대룞?⑸땲??
    />
</div>`
        }
    ];

    return examples;
};


