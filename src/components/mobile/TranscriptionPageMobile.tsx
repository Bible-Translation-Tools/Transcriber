import { useState } from "react";
import { useImageContext } from '../../context/useImageContext';
import { Button } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import TextEditor from "../TextEditor";
import ImagePreviewList from "../ImagePreviewList";

const TranscriptionPageMobile = () => {
  const { images, selectedImage, setSelectedImage, addImage } = useImageContext();

  const [selectedTab, setSelectedTab] = useState("images");
  const [textContent, setTextContent] = useState<string>("");

  const handleImageSelection = (index: number) => {
    setSelectedImage(images[index]);
  };

  return (
    <div className="flex flex-col items-center w-full h-screen max-w-md mx-auto p-4">
      {/* Tab Navigation */}
      <div className="flex w-full bg-gray-200 rounded-full p-1 mb-4">
        <button
          className={`flex-1 text-center py-2 rounded-full ${
            selectedTab === "images"
              ? "bg-white font-semibold shadow"
              : "text-gray-500"
          }`}
          onClick={() => setSelectedTab("images")}
        >
          Images
        </button>
        <button
          className={`flex-1 text-center py-2 rounded-full ${
            selectedTab === "text"
              ? "bg-white font-semibold shadow"
              : "text-gray-500"
          }`}
          onClick={() => setSelectedTab("text")}
        >
          Text
        </button>
      </div>

      {/* Content Area */}
      <div className="w-full h-full rounded-lg overflow-hidden shadow-md mb-4">
        {selectedTab === "images" ? (
          <img
            src={selectedImage?.data}
            alt="Selected"
            className="w-full h-full object-cover"
          />
        ) : (
          <TextEditor text={textContent} onChange={(e) => setTextContent(e.target.value) }/>
        )}
      </div>
      

      {/* Thumbnails */}
      <ImagePreviewList images={images} currentImage={0} isVerticalLayout={false} onImageSelected={handleImageSelection}/>

      {/* Buttons (Material UI) */}
      <div className="w-full flex flex-col gap-2 items-center mt-4 space-y-2">
        <Button
          variant="contained"
          color="primary"
          startIcon={<CameraAltIcon />}
          className="w-full py-3"
        >
          Take Photo
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<FolderOpenIcon />}
          className="w-full py-3"
        >
          Browse...
        </Button>
      </div>
    </div>
  );
};

export default TranscriptionPageMobile;
