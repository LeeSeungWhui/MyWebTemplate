import { useState, useEffect } from 'react';
import * as Lib from '@/lib';

const TopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div
            className={`
                fixed bottom-8 right-8
                transition-opacity duration-200
                ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}
        >
            <Lib.Button
                onClick={scrollToTop}
                className="rounded-full w-12 h-12 shadow-lg"
                aria-label="맨 위로 이동"
            >
                <Lib.Icon icon="ri:RiArrowUpLine" size="1.5em" />
            </Lib.Button>
        </div>
    );
};

export default TopButton; 