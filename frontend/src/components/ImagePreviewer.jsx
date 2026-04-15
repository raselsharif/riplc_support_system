import { useState, useEffect } from "react";

const ImagePreviewer = ({ images, initialIndex = 0, onClose }) => {
  const imagesArray = Array.isArray(images) ? images : [];
  
  if (imagesArray.length === 0) {
    return null;
  }

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % imagesArray.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + imagesArray.length) % imagesArray.length);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrev();
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

      {imagesArray.length > 1 && (
        <>
          <button
            className="absolute left-4 z-10 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-4 z-10 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

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
