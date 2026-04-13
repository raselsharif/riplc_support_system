import { useState, useEffect } from "react";

const ImagePreviewer = ({ images, initialIndex = 0, onClose }) => {
  const imagesArray = Array.isArray(images) ? images : [];
  
  if (imagesArray.length === 0) {
    return null;
  }

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
        onClick={onClose}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-center justify-center w-full h-full" onClick={e => e.stopPropagation()}>
        <img
          src={imagesArray[currentIndex].file_url}
          alt={imagesArray[currentIndex].file_name}
          className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        />
      </div>

      <div className="absolute bottom-4 text-center text-white">
        <p className="text-sm font-medium">{imagesArray[currentIndex].file_name}</p>
        <p className="text-xs opacity-70 mt-1">{currentIndex + 1} / {imagesArray.length}</p>
      </div>
    </div>
  );
};

export default ImagePreviewer;
