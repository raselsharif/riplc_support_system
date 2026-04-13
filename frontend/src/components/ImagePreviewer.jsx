import { useState, useCallback, useEffect } from "react";

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
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 w-10 h-10 bg-red-500 text-white rounded-full text-lg font-bold"
        onClick={onClose}
      >
        X
      </button>

      <div className="flex items-center justify-center w-full h-full" onClick={e => e.stopPropagation()}>
        <img
          src={imagesArray[currentIndex].file_url}
          alt={imagesArray[currentIndex].file_name}
          className="max-h-[80vh] max-w-[90vw] object-contain"
        />
      </div>

      <div className="absolute bottom-4 text-center text-white">
        {currentIndex + 1} / {imagesArray.length}
      </div>
    </div>
  );
};

export default ImagePreviewer;
