//import '../App.css'

import { useNavigate } from 'react-router-dom';
import { useApiKey } from '../hooks/useApiKey';
import APIKeyInput from "../components/APIKeyInput";
import Introduction from "../components/Introduction";
import PhotoUploadMobile from "../components/PhotoUploadMobile";
import TranscriptionTips from "../components/TranscriptionTips";
import UploadImages from "../components/UploadImages";
import { useMediaQuery } from "react-responsive";
import { useImageContext } from '../context/useImageContext';
import { useEffect } from 'react';
import { ApiKeyStatus } from '../domain/ApiKeyStatus';
import { useModelContext } from '../context/useModelContext';

function Home() {
    const { apiKey, storeApiKey } = useApiKey();
    const { model, apiKeyStatus } = useModelContext();
    const { images, selectedImage, setSelectedImage } = useImageContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (images.length > 0 && selectedImage == null) {
            setSelectedImage(images[0]);
        }
        if (images.length > 0 && model != null) {
            console.log("Images exist, navigating to Transcriber");
            navigate('/transcriber'); // Redirect if images exist
        }
    }, [images, model, navigate]); // Add navigate to dependency array

    const PhotoUploadDesktop = () => (
        <div className="flex justify-center items-center gap-10 h-screen"> {/* Added height for vertical centering */}
            <div className="w-[948px] h-screen p-10 bg-white flex flex-col items-center gap-10">
                <Introduction />
                {apiKey && apiKeyStatus == ApiKeyStatus.Valid? ( // Conditionally render based on apiKey
                    <UploadImages />
                ) : (
                    <APIKeyInput onApiKeyStored={storeApiKey} apiKeyStatus={apiKeyStatus} /> // Use storeApiKey from the hook
                )}
            </div>
            <TranscriptionTips />
        </div>
    )

    const isMobile = useMediaQuery({ maxWidth: 768 });
    return isMobile ? <PhotoUploadMobile /> : <PhotoUploadDesktop />;
}

export default Home;