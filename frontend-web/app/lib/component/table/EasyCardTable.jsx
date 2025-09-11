import { useState } from 'react';
import { EasyListClass } from '../../dataset/EasyListClass';
import Icon from '../icon/Icon';

const EasyCardTable = ({
    columnList = new EasyListClass(),
    rowList = new EasyListClass(),
    cardsPerRow = 4, // 한 줄에 보여줄 카드 개수
    maxRow = 2, // 한 페이지에 보여줄 최대 행 수
    maxPage = 10,
    renderCard, // 카드 렌더링 함수
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = cardsPerRow * maxRow;
    const totalPages = Math.ceil(rowList.size() / cardsPerPage);

    const getCurrentPageCards = () => {
        const start = (currentPage - 1) * cardsPerPage;
        const end = Math.min(start + cardsPerPage, rowList.size());
        return rowList.filter((_, index) => index >= start && index < end);
    };

    const getPageNumbers = () => {
        const halfMaxPage = Math.floor(maxPage / 2);
        let startPage = Math.max(currentPage - halfMaxPage, 1);
        let endPage = Math.min(startPage + maxPage - 1, totalPages);
        if (endPage - startPage + 1 < maxPage) {
            startPage = Math.max(endPage - maxPage + 1, 1);
        }
        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    };

    const chunks = () => {
        const cards = getCurrentPageCards();
        const rows = [];
        for (let i = 0; i < cards.length; i += cardsPerRow) {
            rows.push(cards.slice(i, i + cardsPerRow));
        }
        return rows.slice(0, maxRow);
    };

    return (
        <div className="w-full min-w-[1200px]">
            <div className="grid grid-cols-4 gap-4">
                {getCurrentPageCards().slice(0, cardsPerRow * maxRow).map((card, index) => (
                    <div key={index} className="w-full">
                        {renderCard(card)}
                    </div>
                ))}
            </div>

            {rowList.size() > 0 && (
                <div className="flex justify-center items-center mt-6">
                    <div className="inline-flex">
                        <button
                            className="px-1 text-gray-500 hover:text-gray-700"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                        >
                            <Icon icon='arrowBackDouble' />
                        </button>
                        <button
                            className="px-1 text-gray-500 hover:text-gray-700"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <Icon icon='arrowBack' />
                        </button>
                        {getPageNumbers().map((page) => (
                            <button
                                key={page}
                                className={`mx-1 rounded-full w-8 h-8 text-xl pt-[2px] ${currentPage === page ? 'text-blue-600 font-bold bg-gray-300' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            className="px-2 py-1 text-gray-500 hover:text-gray-700"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            <Icon className='rotate-180' icon='arrowBack' />
                        </button>
                        <button
                            className="px-2 py-1 text-gray-500 hover:text-gray-700"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            <Icon className='rotate-180' icon='arrowBackDouble' />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EasyCardTable;