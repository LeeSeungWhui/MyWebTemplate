/**
 * ?뚯씪紐? ToastExamples.jsx
 * ?묒꽦?? LSH
 * 媛깆떊?? 2025-09-13
 * ?ㅻ챸: Toast 而댄룷?뚰듃 ?덉젣
 */
import * as Lib from '@/app/lib';
import { useSharedStore } from '@/app/common/store/SharedStore';

export const ToastExamples = () => {
    const showToast = useSharedStore(s => s.showToast);

    const examples = [
        {
            component: (
                <div className="space-y-4">
                    <Lib.Button onClick={() => {
                        showToast("湲곕낯 ?좎뒪??硫붿떆吏?낅땲??");
                    }}>
                        湲곕낯 ?좎뒪??                    </Lib.Button>
                </div>
            ),
            description: "湲곕낯 ?좎뒪??,
            code: `// useSharedStore ?ъ슜
const showToast = useSharedStore(s => s.showToast);

// 湲곕낯 ?좎뒪??showToast("湲곕낯 ?좎뒪??硫붿떆吏?낅땲??");`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        showToast("?뺣낫 ?좎뒪??硫붿떆吏?낅땲??", {
                            type: "info"
                        });
                    }}>
                        ?뺣낫 ?좎뒪??                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        showToast("?깃났 ?좎뒪??硫붿떆吏?낅땲??", {
                            type: "success"
                        });
                    }}>
                        ?깃났 ?좎뒪??                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        showToast("寃쎄퀬 ?좎뒪??硫붿떆吏?낅땲??", {
                            type: "warning"
                        });
                    }}>
                        寃쎄퀬 ?좎뒪??                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        showToast("?ㅻ쪟 ?좎뒪??硫붿떆吏?낅땲??", {
                            type: "error"
                        });
                    }}>
                        ?ㅻ쪟 ?좎뒪??                    </Lib.Button>
                </div>
            ),
            description: "?좎뒪???좏삎",
            code: `// ?뺣낫 ?좎뒪??showToast("?뺣낫 ?좎뒪??硫붿떆吏?낅땲??", {
    type: "info",
});

// ?깃났 ?좎뒪??showToast("?깃났 ?좎뒪??硫붿떆吏?낅땲??", {
    type: "success",
});

// 寃쎄퀬 ?좎뒪??showToast("寃쎄퀬 ?좎뒪??硫붿떆吏?낅땲??", {
    type: "warning",
});

// ?ㅻ쪟 ?좎뒪??showToast("?ㅻ쪟 ?좎뒪??硫붿떆吏?낅땲??", {
    type: "error",
});`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        showToast("?곷떒 ?쇱そ???쒖떆?⑸땲??", {
                            position: "top-left"
                        });
                    }}>
                        ?곷떒 ?쇱そ
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        showToast("?곷떒 以묒븰???쒖떆?⑸땲??", {
                            position: "top-center"
                        });
                    }}>
                        ?곷떒 以묒븰
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        showToast("?곷떒 ?ㅻⅨ履쎌뿉 ?쒖떆?⑸땲??", {
                            position: "top-right"
                        });
                    }}>
                        ?곷떒 ?ㅻⅨ履?                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        showToast("?섎떒 ?쇱そ???쒖떆?⑸땲??", {
                            position: "bottom-left"
                        });
                    }}>
                        ?섎떒 ?쇱そ
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        showToast("?섎떒 以묒븰???쒖떆?⑸땲??", {
                            position: "bottom-center"
                        });
                    }}>
                        ?섎떒 以묒븰
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        showToast("?섎떒 ?ㅻⅨ履쎌뿉 ?쒖떆?⑸땲??", {
                            position: "bottom-right"
                        });
                    }}>
                        ?섎떒 ?ㅻⅨ履?                    </Lib.Button>
                </div>
            ),
            description: "?좎뒪???꾩튂",
            code: `// ?곷떒 ?쇱そ
showToast("?곷떒 ?쇱そ???쒖떆?⑸땲??", {
    position: "top-left",
});

// ?곷떒 以묒븰
showToast("?곷떒 以묒븰???쒖떆?⑸땲??", {
    position: "top-center",
});

// ?곷떒 ?ㅻⅨ履?showToast("?곷떒 ?ㅻⅨ履쎌뿉 ?쒖떆?⑸땲??", {
    position: "top-right",
});

// ?섎떒 ?쇱そ
showToast("?섎떒 ?쇱そ???쒖떆?⑸땲??", {
    position: "bottom-left",
});

// ?섎떒 以묒븰
showToast("?섎떒 以묒븰???쒖떆?⑸땲??", {
    position: "bottom-center",
});

// ?섎떒 ?ㅻⅨ履?showToast("?섎떒 ?ㅻⅨ履쎌뿉 ?쒖떆?⑸땲??", {
    position: "bottom-right",
});`
        },
        {
            component: (
                <div className="flex flex-wrap gap-2">
                    <Lib.Button onClick={() => {
                        showToast("2珥덉뿉 ?щ씪吏묐땲??", {
                            duration: 2000
                        });
                    }}>
                        2珥??좎?
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        showToast("5珥덉뿉 ?щ씪吏묐땲??", {
                            duration: 5000
                        });
                    }}>
                        5珥??좎?
                    </Lib.Button>
                    <Lib.Button onClick={() => {
                        showToast("?먮룞?쇰줈 ?щ씪吏吏 ?딆뒿?덈떎.", {
                            duration: Infinity
                        });
                    }}>
                        ?섎룞 ?リ린
                    </Lib.Button>
                </div>
            ),
            description: "?좎뒪??吏???쒓컙",
            code: `// 2珥????ロ옒
showToast("2珥덉뿉 ?щ씪吏묐땲??", {
    duration: 2000,
});

// 5珥????ロ옒
showToast("5珥덉뿉 ?щ씪吏묐땲??", {
    duration: 5000,
});

// ?먮룞?쇰줈 ?ロ엳吏 ?딆쓬 (?섎룞 ?リ린 鍮꾪솢?깊솕)
showToast("?먮룞?쇰줈 ?щ씪吏吏 ?딆뒿?덈떎.", {
    duration: Infinity,
});`
        }
    ];

    return examples;
};


