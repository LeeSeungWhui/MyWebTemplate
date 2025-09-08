/* eslint-disable react-hooks/rules-of-hooks */
import * as Lib from '@/lib';
import { useState } from 'react';

export const ModalExamples = () => {
    const examples = [
        {
            component: (() => {
                const [isOpen, setIsOpen] = useState(false);

                return (
                    <div className="space-y-4">
                        <Lib.Button onClick={() => setIsOpen(true)}>
                            ê¸°ë³¸ ëª¨ë‹¬ ?´ê¸°
                        </Lib.Button>

                        <Lib.Modal
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                        >
                            <Lib.Modal.Header onClose={() => setIsOpen(false)}>
                                <h2 className="text-xl font-semibold">ê¸°ë³¸ ëª¨ë‹¬</h2>
                            </Lib.Modal.Header>

                            <Lib.Modal.Body>
                                <p>ê¸°ë³¸?ì¸ ëª¨ë‹¬ ?ˆì‹œ?…ë‹ˆ??</p>
                            </Lib.Modal.Body>

                            <Lib.Modal.Footer>
                                <div className="flex justify-end">
                                    <Lib.Button onClick={() => setIsOpen(false)}>
                                        ?«ê¸°
                                    </Lib.Button>
                                </div>
                            </Lib.Modal.Footer>
                        </Lib.Modal>
                    </div>
                );
            })(),
            description: "ê¸°ë³¸ ëª¨ë‹¬",
            code: `const [isOpen, setIsOpen] = useState(false);

<Lib.Button onClick={() => setIsOpen(true)}>
    ê¸°ë³¸ ëª¨ë‹¬ ?´ê¸°
</Lib.Button>

<Lib.Modal 
    isOpen={isOpen} 
    onClose={() => setIsOpen(false)}
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold">ê¸°ë³¸ ëª¨ë‹¬</h2>
    </Lib.Modal.Header>
    
    <Lib.Modal.Body>
        <p>ê¸°ë³¸?ì¸ ëª¨ë‹¬ ?ˆì‹œ?…ë‹ˆ??</p>
    </Lib.Modal.Body>
    
    <Lib.Modal.Footer>
        <div className="flex justify-end">
            <Lib.Button onClick={() => setIsOpen(false)}>
                ?«ê¸°
            </Lib.Button>
        </div>
    </Lib.Modal.Footer>
</Lib.Modal>`
        },
        {
            component: (() => {
                const [isOpen, setIsOpen] = useState(false);
                const sizes = ['sm', 'md', 'lg', 'xl', 'full'];
                const [currentSize, setCurrentSize] = useState('md');

                return (
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {sizes.map(size => (
                                <Lib.Button
                                    key={size}
                                    onClick={() => {
                                        setCurrentSize(size);
                                        setIsOpen(true);
                                    }}
                                >
                                    {size.toUpperCase()} ?¬ê¸°
                                </Lib.Button>
                            ))}
                        </div>

                        <Lib.Modal
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                            size={currentSize}
                        >
                            <Lib.Modal.Header onClose={() => setIsOpen(false)}>
                                <h2 className="text-xl font-semibold">{currentSize.toUpperCase()} ?¬ê¸° ëª¨ë‹¬</h2>
                            </Lib.Modal.Header>

                            <Lib.Modal.Body>
                                <p>?¤ì–‘???¬ê¸°??ëª¨ë‹¬??ì§€?í•©?ˆë‹¤.</p>
                            </Lib.Modal.Body>
                        </Lib.Modal>
                    </div>
                );
            })(),
            description: "ëª¨ë‹¬ ?¬ê¸°",
            code: `const [isOpen, setIsOpen] = useState(false);
const sizes = ['sm', 'md', 'lg', 'xl', 'full'];
const [currentSize, setCurrentSize] = useState('md');

<div className="flex flex-wrap gap-2">
    {sizes.map(size => (
        <Lib.Button
            key={size}
            onClick={() => {
                setCurrentSize(size);
                setIsOpen(true);
            }}
        >
            {size.toUpperCase()} ?¬ê¸°
        </Lib.Button>
    ))}
</div>

<Lib.Modal 
    isOpen={isOpen} 
    onClose={() => setIsOpen(false)}
    size={currentSize}
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold">{currentSize.toUpperCase()} ?¬ê¸° ëª¨ë‹¬</h2>
    </Lib.Modal.Header>
    
    <Lib.Modal.Body>
        <p>?¤ì–‘???¬ê¸°??ëª¨ë‹¬??ì§€?í•©?ˆë‹¤.</p>
    </Lib.Modal.Body>
</Lib.Modal>`
        },
        {
            component: (() => {
                const [isOpen, setIsOpen] = useState(false);

                return (
                    <div className="space-y-4">
                        <Lib.Button onClick={() => setIsOpen(true)}>
                            ??ëª¨ë‹¬ ?´ê¸°
                        </Lib.Button>

                        <Lib.Modal
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                        >
                            <Lib.Modal.Header onClose={() => setIsOpen(false)}>
                                <h2 className="text-xl font-semibold">?¬ìš©???•ë³´</h2>
                            </Lib.Modal.Header>

                            <Lib.Modal.Body>
                                <form className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">?´ë¦„</label>
                                        <Lib.Input className="mt-1" placeholder="?´ë¦„???…ë ¥?˜ì„¸?? />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">?´ë©”??/label>
                                        <Lib.Input className="mt-1" type="email" placeholder="?´ë©”?¼ì„ ?…ë ¥?˜ì„¸?? />
                                    </div>
                                </form>
                            </Lib.Modal.Body>

                            <Lib.Modal.Footer>
                                <div className="flex justify-end gap-2">
                                    <Lib.Button onClick={() => setIsOpen(false)}>
                                        ?€??
                                    </Lib.Button>
                                    <Lib.Button
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        ì·¨ì†Œ
                                    </Lib.Button>
                                </div>
                            </Lib.Modal.Footer>
                        </Lib.Modal>
                    </div>
                );
            })(),
            description: "?¼ì´ ?¬í•¨??ëª¨ë‹¬",
            code: `const [isOpen, setIsOpen] = useState(false);

<Lib.Button onClick={() => setIsOpen(true)}>
    ??ëª¨ë‹¬ ?´ê¸°
</Lib.Button>

<Lib.Modal 
    isOpen={isOpen} 
    onClose={() => setIsOpen(false)}
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold">?¬ìš©???•ë³´</h2>
    </Lib.Modal.Header>
    
    <Lib.Modal.Body>
        <form className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">?´ë¦„</label>
                <Lib.Input className="mt-1" placeholder="?´ë¦„???…ë ¥?˜ì„¸?? />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">?´ë©”??/label>
                <Lib.Input className="mt-1" type="email" placeholder="?´ë©”?¼ì„ ?…ë ¥?˜ì„¸?? />
            </div>
        </form>
    </Lib.Modal.Body>
    
    <Lib.Modal.Footer>
        <div className="flex justify-end gap-2">
            <Lib.Button onClick={() => setIsOpen(false)}>
                ?€??
            </Lib.Button>
            <Lib.Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
            >
                ì·¨ì†Œ
            </Lib.Button>
        </div>
    </Lib.Modal.Footer>
</Lib.Modal>`
        },
        {
            component: (() => {
                const [isOpen, setIsOpen] = useState(false);

                return (
                    <div className="space-y-4">
                        <Lib.Button onClick={() => setIsOpen(true)}>
                            ?œë˜ê·?ê°€?¥í•œ ëª¨ë‹¬ ?´ê¸°
                        </Lib.Button>

                        <Lib.Modal
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                            draggable={true}
                        >
                            <Lib.Modal.Header onClose={() => setIsOpen(false)}>
                                <h2 className="text-xl font-semibold">?œë˜ê·?ê°€?¥í•œ ëª¨ë‹¬</h2>
                                <p className="text-sm text-gray-500">?¤ë”ë¥??œë˜ê·¸í•´???´ë™?????ˆìŠµ?ˆë‹¤</p>
                            </Lib.Modal.Header>

                            <Lib.Modal.Body>
                                <p>??ëª¨ë‹¬?€ ?¤ë” ?ì—­???œë˜ê·¸í•˜???´ë™?????ˆìŠµ?ˆë‹¤.</p>
                                <p className="mt-2">?”ë©´ ë°–ìœ¼ë¡??˜ê?ì§€ ?Šë„ë¡??œí•œ?˜ì–´ ?ˆìŠµ?ˆë‹¤.</p>
                            </Lib.Modal.Body>

                            <Lib.Modal.Footer>
                                <div className="flex justify-end">
                                    <Lib.Button onClick={() => setIsOpen(false)}>
                                        ?«ê¸°
                                    </Lib.Button>
                                </div>
                            </Lib.Modal.Footer>
                        </Lib.Modal>
                    </div>
                );
            })(),
            description: "draggable prop??trueë¡??¤ì •?˜ë©´ ëª¨ë‹¬???œë˜ê·¸í•  ???ˆìŠµ?ˆë‹¤. ?¤ë” ?ì—­???œë˜ê·¸í•˜???´ë™??ê°€?¥í•©?ˆë‹¤.",
            code: `const [isOpen, setIsOpen] = useState(false);

<Lib.Modal 
    isOpen={isOpen} 
    onClose={() => setIsOpen(false)}
    draggable={true}
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold">?œë˜ê·?ê°€?¥í•œ ëª¨ë‹¬</h2>
    </Lib.Modal.Header>
    
    <Lib.Modal.Body>
        <p>??ëª¨ë‹¬?€ ?¤ë” ?ì—­???œë˜ê·¸í•˜???´ë™?????ˆìŠµ?ˆë‹¤.</p>
    </Lib.Modal.Body>
    
    <Lib.Modal.Footer>
        <div className="flex justify-end">
            <Lib.Button onClick={() => setIsOpen(false)}>
                ?«ê¸°
            </Lib.Button>
        </div>
    </Lib.Modal.Footer>
</Lib.Modal>`
        },
        {
            component: (() => {
                const [isOpen, setIsOpen] = useState(false);

                return (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Lib.Button onClick={() => setIsOpen(true)}>
                                ?°ì¸¡ ?ë‹¨??ëª¨ë‹¬ ?´ê¸°
                            </Lib.Button>
                        </div>

                        <Lib.Modal
                            isOpen={isOpen}
                            onClose={() => setIsOpen(false)}
                            top="20px"
                            left="calc(100% - 20px - 32rem)"
                            draggable
                        >
                            <Lib.Modal.Header onClose={() => setIsOpen(false)}>
                                <h2 className="text-xl font-semibold">?„ì¹˜ ì§€??ëª¨ë‹¬</h2>
                            </Lib.Modal.Header>

                            <Lib.Modal.Body>
                                <p>top, left prop?¼ë¡œ ì´ˆê¸° ?„ì¹˜ë¥?ì§€?•í•  ???ˆìŠµ?ˆë‹¤.</p>
                                <p className="mt-2">?œë˜ê·¸í•˜???ìœ ë¡?²Œ ?´ë™?´ë³´?¸ìš”.</p>
                            </Lib.Modal.Body>
                        </Lib.Modal>
                    </div>
                );
            })(),
            description: "top, left prop?¼ë¡œ ëª¨ë‹¬??ì´ˆê¸° ?„ì¹˜ë¥?ì§€?•í•  ???ˆìŠµ?ˆë‹¤. ?œë˜ê·?ê¸°ëŠ¥ê³??¨ê»˜ ?¬ìš©?˜ë©´ ?”ìš± ? ìš©?©ë‹ˆ??",
            code: `const [isOpen, setIsOpen] = useState(false);

<Lib.Modal 
    isOpen={isOpen} 
    onClose={() => setIsOpen(false)}
    top="20px"
    left="calc(100% - 20px - 32rem)"
    draggable
>
    <Lib.Modal.Header onClose={() => setIsOpen(false)}>
        <h2 className="text-xl font-semibold">?„ì¹˜ ì§€??ëª¨ë‹¬</h2>
    </Lib.Modal.Header>
    
    <Lib.Modal.Body>
        <p>top, left prop?¼ë¡œ ì´ˆê¸° ?„ì¹˜ë¥?ì§€?•í•  ???ˆìŠµ?ˆë‹¤.</p>
    </Lib.Modal.Body>
</Lib.Modal>`
        }
    ];

    return examples;
}; 