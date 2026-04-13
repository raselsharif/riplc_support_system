import { useState, useCallback, useEffect, useRef } from "react";

const ImagePreviewer = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const onCloseRef = useRef(onClose);
  
  console.log("ImagePreviewer RENDERING", { images, initialIndex, previewOpen: !!images?.length });
  
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  if (!images || images.length === 0) {
    console.log("ImagePreviewer: no images, returning null");
    return null;
  }

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
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  const handleClose = () => {
    onCloseRef.current();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={handleClose}
    >
      <button
        onClick={handleClose}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "#ef4444",
          border: "none",
          color: "white",
          cursor: "pointer",
          fontSize: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        X
      </button>

      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={e => e.stopPropagation()}>
        <button
          onClick={goPrev}
          style={{
            position: "absolute",
            left: 16,
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.2)",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: 24,
          }}
        >
          &lt;
        </button>

        <img
          src={images[currentIndex].file_url}
          alt={images[currentIndex].file_name}
          style={{ maxHeight: "80vh", maxWidth: "90%", objectFit: "contain", borderRadius: 8 }}
        />

        <button
          onClick={goNext}
          style={{
            position: "absolute",
            right: 16,
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.2)",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: 24,
          }}
        >
          &gt;
        </button>
      </div>

      <div style={{ position: "absolute", bottom: 16, textAlign: "center", color: "white" }}>
        <p style={{ fontSize: 14, fontWeight: 500 }}>{images[currentIndex].file_name}</p>
        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
          {currentIndex + 1} / {images.length}
        </p>
      </div>

      {images.length > 1 && (
        <div style={{ position: "absolute", bottom: 64, display: "flex", gap: 8, overflowX: "auto", padding: "0 16px" }}>
          {images.map((img, index) => (
            <button
              key={img.id || index}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: 64,
                height: 64,
                borderRadius: 8,
                overflow: "hidden",
                border: index === currentIndex ? "2px solid white" : "2px solid transparent",
                opacity: index === currentIndex ? 1 : 0.6,
                cursor: "pointer",
                padding: 0,
              }}
            >
              <img
                src={img.file_url}
                alt={img.file_name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImagePreviewer;
