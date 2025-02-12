interface PaginationProps {
    currentPage: number;
    totalImages: number;
    imagesPerPage: number;
    onPageChange: (page: number) => void;
}


const Pagination: React.FC<PaginationProps> = ({ currentPage, totalImages, imagesPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalImages / imagesPerPage);

    return (
        <div className="w-[451px] h-[835px] flex justify-center items-center mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50"
            >
                Previous
            </button>
            <span className="mx-2">{currentPage}</span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages} // Disable "Next" on the last page
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;