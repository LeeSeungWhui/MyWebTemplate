import { useEffect, useState } from 'react';
import EasyVO from '../../dataset/EasyVO';
import { EasyListClass } from '../../dataset/EasyListClass';
import Checkbox from '../check/Checkbox';
import Icon from '../icon/Icon';

const EasyTable = ({
    columnList = new EasyListClass(),
    rowList = new EasyListClass(),
    headerStyle = '',
    rowStyle = '',
    onRowSelect,
    multiSelect = false,
    checkboxColumn = false,
    rowClickable = true,
    rowClickableStyle = '',
    maxRow = 10,
    maxPage = 10,
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const checkData = EasyVO();
    const totalPages = Math.ceil(rowList.size() / maxRow);

    const handleRowSelect = (rowIndex) => {
        const nextVal = !rowList.get(rowIndex).get('selected');
        rowList.get(rowIndex).set('selected', nextVal);
        if (multiSelect) {
            if (!nextVal) {
                checkData.set('ALL', false);
            }
        }
        onRowSelect && onRowSelect(rowList.get(rowIndex));
    };

    const renderCell = (column, row) => {
        const render = column.get('render');
        if (typeof render === 'function') {
            return render(row, rowList);
        }
        return row.get(column.get('key'));
    };

    const getCurrentPageRows = () => {
        const start = (currentPage - 1) * maxRow;
        const end = Math.min(start + maxRow, rowList.size());
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

    useEffect(() => {
        if (!rowList.find(row => !row.get('selected'))) {
            checkData.set('ALL', true);
        } else {
            checkData.set('ALL', false);
        }
    }, [rowList]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [rowList.size()]);

    const onCheckAll = (handler) => {
        if (handler === 'div') {
            checkData.set('ALL', !checkData.get('ALL'));
        }

        rowList.map((row) => {
            row.set('selected', checkData.get('ALL'))
        })
    };

    const defaultHeaderStyle = 'bg-[#667586] h-[50px] rounded-lg text-sm text-white font-semibold flex items-center justify-center text-center';
    const defaultRowStyle = 'mt-3 h-[60px] bg-white rounded-lg hover:bg-gray-50 text-sm text-center flex items-center justify-center';
    const defaultRowClickableStyle = 'cursor-pointer';

    return (
        <div className="w-full border border-gray-200">
            <div className={`flex w-full ${defaultHeaderStyle} ${headerStyle}`}>
                {checkboxColumn &&
                    <div className='px-4 h-full flex itmes-center' onClick={() => onCheckAll('div')}>
                        <Checkbox dataSet={checkData} dataKey='ALL' onChange={() => onCheckAll('check')} />
                    </div>
                }
                <div className={`flex w-full`}>
                    {columnList.map((column, index) => (
                        <div
                            key={index}
                            className={`p-2 ${column.get('headerStyle') || ''}`}
                            style={{ width: column.get('width') || 'auto', flexGrow: column.get('width') ? 0 : 1, flexShrink: column.get('width') ? 0 : 1, flexBasis: column.get('width') || 0 }}
                        >
                            {typeof column.get('header') === 'function'
                                ? column.get('header')()
                                : column.get('header')}
                        </div>
                    ))}
                </div>
            </div>
            {getCurrentPageRows().map((row, index) => {
                const rowIndex = (currentPage - 1) * maxRow + index;
                return (
                    <div
                        key={rowIndex}
                        className={`flex w-full ${defaultRowStyle} ${rowStyle} ${rowClickable ? `${defaultRowClickableStyle} ${rowClickableStyle}` : ''}`}
                        onClick={() => rowClickable && handleRowSelect(rowIndex.toString())}
                    >
                        {checkboxColumn && <Checkbox tailwind='px-4' dataSet={row} dataKey='selected' />}
                        <div className={`flex w-full items-center`}>
                            {columnList.map((column, colIndex) => (
                                <div
                                    key={colIndex}
                                    className={`p-2 ${column.get('cellStyle') || ''}`}
                                    style={{ width: column.get('width') || 'auto', flexGrow: column.get('width') ? 0 : 1, flexShrink: column.get('width') ? 0 : 1, flexBasis: column.get('width') || 0 }}
                                >
                                    {renderCell(column, row)}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
            {rowList.size() > 0 ? (
                <div className="flex flex-col justify-center items-center m-6">
                    <div className="inline-flex mb-2 ">
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
                                className={`mx-1 rounded-full w-8 h-8 text-xl pt-[2px] ${currentPage === page ? 'text-blue-600 font-bold bg-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
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
                    {/*
                    <div className="text-sm text-gray-500">
                        총 {totalPages} 페이지 중 {currentPage} 페이지
                    </div>
                    */}
                </div>
            ) :
                <div className='flex-1 flex justify-center mt-8'>
                    <span className='font-semibold'>조회된 내역이 없습니다.</span>
                </div>
            }
        </div>
    );
};

export default EasyTable;
