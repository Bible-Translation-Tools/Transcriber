//import '../App.css'

import { useNavigate } from 'react-router-dom';
import { useApiKey } from '../hooks/useApiKey';
import APIKeyInput from "../components/APIKeyInput";
import Introduction from "../components/Introduction";
import TranscriptionTips from "../components/TranscriptionTips";
import UploadImages from "../components/UploadImages";
import { useImageContext } from '../context/useImageContext';
import { useEffect } from 'react';

function Home() {
    const { apiKey, storeApiKey } = useApiKey();
    const { images } = useImageContext();
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Home use effect hit");
        if (images.length > 0 && apiKey != null) {
            console.log("Images exist, navigating to Transcriber");
          navigate('/transcriber'); // Redirect if images exist
        }
      }, [images, apiKey, navigate]); // Add navigate to dependency array

    console.log("Api key is " + apiKey);

    return (
        <div className="flex justify-center items-center gap-10 h-screen"> {/* Added height for vertical centering */}
            <div className="w-[948px] h-screen p-10 bg-white flex flex-col items-center gap-10">
                <Introduction />
                { apiKey ? ( // Conditionally render based on apiKey
                    <UploadImages />
                ) : (
                    <APIKeyInput apiKey={apiKey} onApiKeyStored={storeApiKey} /> // Use storeApiKey from the hook
                )}
            </div>
            <TranscriptionTips />
        </div>
    );
}

export default Home;