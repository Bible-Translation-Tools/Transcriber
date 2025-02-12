interface PaginationProps {
    image: any,
    currentPage: number;
    totalImages: number;
    onPageChange: (page: number) => void;
}


const Pagination: React.FC<PaginationProps> = ({ image, currentPage, totalImages, onPageChange }) => {

    return (

        <div className="w-[451px] h-screen flex flex-col justify-center items-center p-6">
            <div className="flex-auto">
                {image != undefined ? <img src={image.data} /> : <div />}
            </div><div className="flex">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="mx-2">{`${currentPage + 1} / ${totalImages}`}</span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalImages - 1} // Disable "Next" on the last page
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;