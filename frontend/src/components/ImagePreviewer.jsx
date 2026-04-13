import { useState, useCallback, useEffect, useRef } from "react";

const ImagePreviewer = ({ images, initialIndex = 0, onClose }) => {
  const imagesArray = Array.isArray(images) ? images : [];
  const hasImages = imagesArray.length > 0;
  
  if (!hasImages) {
    return null;
  }

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
      onClick={onClose}
    >
      <button
        onClick={onClose}
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
        }}
      >
        X
      </button>
    </div>
  );
};

export default ImagePreviewer;
