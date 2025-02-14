import { useState } from "react";
import { CameraAlt, FolderOpen } from "@mui/icons-material";

const PhotoUploadMobile = () => {
  const [tipIndex, setTipIndex] = useState(0);
  const tips = [
    {
      title: "Paper style and Layout",
      description:
        "Use lined paper using a verse-by-verse format, written on one side only. Ensure text is straight, with consistent margins on all sides.",
    },
    {
      title: "Edits",
      description:
        "Avoid crossing out mistakes. You can fix these once the document is done being transcribed.",
    },
    {
      title: "Text Style",
      description:
        "Write in block letters with even spacing between letters and words. Do not use superscripts or subscripts.",
    },
    // Add more tips if needed
  ];

  return (
    <div className="flex flex-col items-center p-6 text-center bg-white min-h-screen">
      <div className="flex flex-col flex-1 justify-center items-center">
        <div className="w-16 h-16 bg-blue-200 rounded-lg flex items-center justify-center mb-4">
          <img src="/image-placeholder.svg" alt="Placeholder" className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Add some photos to get started.</h2>
        <p className="text-gray-600 mb-6 px-4">
          This tool converts handwritten documents into a digital format. While it
          can be very reliable, we recommend you review your results.
        </p>
      </div>
      <div className="flex flex-col flex-1 justify-center">
        <h3 className="text-lg font-semibold text-gray-900">{tips[tipIndex].title}</h3>
        <p className="text-gray-500 mb-4 px-4">{tips[tipIndex].description}</p>
        <div className="flex items-center justify-center gap-4 text-gray-500 mb-6">
          <button onClick={() => setTipIndex(Math.max(0, tipIndex - 1))} className="p-2 rounded-full bg-gray-200">&lt;</button>
          <span className="text-gray-700">Tip {tipIndex + 1} of {tips.length}</span>
          <button onClick={() => setTipIndex(Math.min(tips.length - 1, tipIndex + 1))} className="p-2 rounded-full bg-gray-200">&gt;</button>
        </div>
      </div>
      <div className="w-full max-w-sm">
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 mb-2">
          <CameraAlt className="w-5 h-5" /> Take Photo
        </button>
        <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg flex items-center justify-center gap-2">
          <FolderOpen className="w-5 h-5" /> Browse...
        </button>
      </div>
    </div>
  );
};

export default PhotoUploadMobile;
