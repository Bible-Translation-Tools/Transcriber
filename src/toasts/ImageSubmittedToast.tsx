import type {ToastContentProps} from "react-toastify";

export const ImageSubmittedToast = ({data}: ToastContentProps<string>) => {
    return (
        <div className="flex flex-col w-full">
            <div className="text-sm text-blue-900">
                {data}
            </div>
        </div>
    );
};