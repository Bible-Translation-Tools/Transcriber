//import '../App.css'

import {useNavigate} from "react-router-dom";
import Introduction from "../components/Introduction";
import PhotoUploadMobile from "../components/PhotoUploadMobile";
import TranscriptionTips from "../components/TranscriptionTips";
import UploadImages from "../components/UploadImages";
import {useMediaQuery} from "react-responsive";
import {useImageContext} from "../context/useImageContext";
import {useEffect} from "react";

function Home() {
  const {images, selectedImage, setSelectedImage} = useImageContext();
  const navigate = useNavigate();
  // Are you logged in or not?

  useEffect(() => {
    if (images.length > 0 && selectedImage == null) {
      setSelectedImage(images[0]);
    }
    //if (images.length  0) {
    // console.log("Images exist, navigating to Transcriber");
    // navigate('/transcriber'); // Redirect if images exist
    //}
  }, [images, navigate]);

  const PhotoUploadDesktop = () => (
    <div className="flex justify-center items-center gap-10 h-screen">
      <div className="w-[948px] h-screen p-10 bg-white flex flex-col items-center gap-10">
        <Introduction />
        <UploadImages />
      </div>
      <TranscriptionTips />
    </div>
  );

  const isMobile = useMediaQuery({maxWidth: 768});
  return isMobile ? <PhotoUploadMobile /> : <PhotoUploadDesktop />;
}

export default Home;
