/**
 * ?뚯씪紐? ConfirmExamples.jsx
 * ?묒꽦?? LSH
 * 媛깆떊?? 2025-09-13
 * ?ㅻ챸: Confirm 而댄룷?뚰듃 ?덉젣
 */
import * as Lib from '@/app/lib';
import { useRef } from 'react';
import { useGlobalUi } from '@/app/common/store/SharedStore';

export const ConfirmExamples = () => {
    const { showConfirm, showAlert } = useGlobalUi();\n    
    const inputRef = useRef(null);

    const examples = [
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        showConfirm("?뺣쭚 ??젣?섏떆寃좎뒿?덇퉴?").then(result => {
                            if (result) {
                                showAlert("??젣?섏뿀?듬땲??");
                            }
                        });
                    }}>
                        湲곕낯 ?뺤씤
                    </Lib.Button>
                </div>
            ),
            description: "湲곕낯 ?뺤씤 ??붿긽??,
            code: `// useSharedStore ?ъ슜
const { showConfirm, showAlert } = useGlobalUi();\n    

// 湲곕낯 ?뺤씤
showConfirm("?뺣쭚 ??젣?섏떆寃좎뒿?덇퉴?").then(result => {
    if (result) {
        showAlert("??젣?섏뿀?듬땲??");
    }
});`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        showConfirm("???묒뾽? ?섎룎由????놁뒿?덈떎.\\n怨꾩냽?섏떆寃좎뒿?덇퉴?", {
                            title: "二쇱쓽",
                            type: "warning",
                            confirmText: "怨꾩냽",
                            cancelText: "以묐떒"
                        });
                    }}>
                        寃쎄퀬 ?뺤씤
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        showConfirm("紐⑤뱺 ?곗씠?곌? ??젣?⑸땲??\\n?뺣쭚 ??젣?섏떆寃좎뒿?덇퉴?", {
                            title: "??젣 ?뺤씤",
                            type: "danger",
                            confirmText: "??젣",
                            cancelText: "痍⑥냼"
                        });
                    }}>
                        ?꾪뿕 ?뺤씤
                    </Lib.Button>
                </div>
            ),
            description: "?뺤씤 ??붿긽???좏삎",
            code: `// 寃쎄퀬 ?뺤씤
showConfirm("???묒뾽? ?섎룎由????놁뒿?덈떎.\\\\n怨꾩냽?섏떆寃좎뒿?덇퉴?", {
    title: "二쇱쓽",
    type: "warning",
    confirmText: "怨꾩냽",
    cancelText: "以묐떒"
});

// ?꾪뿕 ?뺤씤
showConfirm("紐⑤뱺 ?곗씠?곌? ??젣?⑸땲??\\\\n?뺣쭚 ??젣?섏떆寃좎뒿?덇퉴?", {
    title: "??젣 ?뺤씤",
    type: "danger",
    confirmText: "??젣",
    cancelText: "痍⑥냼"
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        showConfirm("?곗씠?곕? ??젣?섏떆寃좎뒿?덇퉴?", {
                            title: "??젣 ?뺤씤",
                            type: "danger",
                            confirmText: "??젣",
                            cancelText: "痍⑥냼",
                            onConfirm: () => {
                                showAlert("??젣媛 ?꾨즺?섏뿀?듬땲??");
                            },
                            onCancel: () => {
                                showAlert("??젣媛 痍⑥냼?섏뿀?듬땲??");
                            }
                        });
                    }}>
                        肄쒕갚 ?⑥닔 ?덉떆
                    </Lib.Button>
                </div>
            ),
            description: "?뺤씤/痍⑥냼 肄쒕갚",
            code: `// ?뺤씤/痍⑥냼 ???ㅽ뻾??肄쒕갚 ?⑥닔
showConfirm("?곗씠?곕? ??젣?섏떆寃좎뒿?덇퉴?", {
    title: "??젣 ?뺤씤",
    type: "danger",
    confirmText: "??젣",
    cancelText: "痍⑥냼",
    onConfirm: () => {
        showAlert("??젣媛 ?꾨즺?섏뿀?듬땲??");
    },
    onCancel: () => {
        showAlert("??젣媛 痍⑥냼?섏뿀?듬땲??");
    }
});`
        },
        {
            component: (
                <div className="space-y-4">
                    <div className="flex gap-4 items-center">
                        <Lib.Button
                            onClick={() => {
                                showConfirm("?뺤씤 ??붿긽?먭? ?ロ엳硫??낅젰李쎌쑝濡??ъ빱?ㅺ? ?대룞?⑸땲??", {
                                    title: "?ъ빱???대룞",
                                    onFocus: () => inputRef.current?.focus()
                                });
                            }}
                        >
                            ?ъ빱???대룞 ?덉떆
                        </Lib.Button>
                        <Lib.Input
                            ref={inputRef}
                            placeholder="?ъ빱?ㅺ? ?ш린濡??대룞?⑸땲??
                        />
                    </div>
                </div>
            ),
            description: "?뺤씤 ??붿긽?먭? ?ロ옄 ??吏?뺣맂 ?붿냼濡??ъ빱?ㅺ? ?대룞?⑸땲??",
            code: `// useRef ?낆쑝濡??낅젰李?李몄“ ?앹꽦
const inputRef = useRef(null);

// ?뺤씤 ??붿긽?먭? ?ロ옄 ???낅젰李쎌쑝濡??ъ빱???대룞
<div className="flex gap-4 items-center">
    <Lib.Button
        onClick={() => {
            showConfirm("?뺤씤 ??붿긽?먭? ?ロ엳硫??낅젰李쎌쑝濡??ъ빱?ㅺ? ?대룞?⑸땲??", {
                title: "?ъ빱???대룞",
                onFocus: () => inputRef.current?.focus()
            });
        }}
    >
        ?ъ빱???대룞 ?덉떆
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



