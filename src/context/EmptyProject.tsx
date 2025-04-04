import Introduction from "@components/Introduction.tsx";
import TranscriptionTips from "@components/TranscriptionTips.tsx";
import UploadImages from "@components/UploadImages.tsx";

function EmptyProject() {
    return (
        <div className="flex justify-center items-center grow">
            {/*<div className="w-[948px] h-screen p-10 bg-white flex flex-col items-center gap-10">*/}
            {/*    <Introduction />*/}
                <UploadImages />
            {/*</div>*/}
            <TranscriptionTips />
        </div>
    );
}

export default EmptyProject;
