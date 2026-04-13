import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

const ImagePreviewer = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onClose]);

  const handleClose = () => {
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleClose}
    >
      <motion.button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
      >

      <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <motion.button
          onClick={goPrev}
          className="absolute left-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full text-white text-xl flex items-center justify-center transition-colors"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>

        <motion.div
          key={currentIndex}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="relative"
        >
          <img
            src={images[currentIndex].file_url}
            alt={images[currentIndex].file_name}
            className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
          />
        </motion.div>

        <motion.button
          onClick={goNext}
          className="absolute right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full text-white text-xl flex items-center justify-center transition-colors"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>

      <motion.div
        className="absolute bottom-4 text-center text-white"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-sm font-medium">{images[currentIndex].file_name}</p>
        <p className="text-xs opacity-70 mt-1">
          {currentIndex + 1} / {images.length}
        </p>
      </motion.div>

      {images.length > 1 && (
        <motion.div
          className="absolute bottom-16 flex gap-2 overflow-x-auto max-w-full px-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          {images.map((img, index) => (
            <motion.button
              key={img.id || index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-white scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={img.file_url}
                alt={img.file_name}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ImagePreviewer;
