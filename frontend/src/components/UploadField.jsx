import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const MAX_FILES = 1;
const MAX_SIZE_MB = 2;

const UploadField = ({ onUpload, uploading = false }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      return;
    }

    const oversized = imageFiles.filter(f => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversized.length > 0) {
      return;
    }

    if (imageFiles.length > MAX_FILES) {
      return;
    }

    setSelectedFiles(imageFiles);
    onUpload(imageFiles);
  };

  const removeFile = (index) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onUpload(updated);
  };

  return (
    <motion.div 
      className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 ${
        dragOver ? 'scale-[1.02]' : ''
      }`}
      style={{ 
        borderColor: dragOver ? "var(--primary)" : "var(--border-default)",
        backgroundColor: dragOver ? "var(--primary-light)" : "var(--bg-muted)"
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer transition-all duration-200"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-3" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Uploading...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>
              Drag & drop your image here
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              or <span className="font-medium cursor-pointer hover:underline" style={{ color: "var(--primary)" }}>browse</span> to upload
            </p>
            <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>Supports: JPG, PNG, GIF, WEBP • Max {MAX_FILES} file • Max {MAX_SIZE_MB}MB</p>
          </>
        )}
      </motion.div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {selectedFiles.map((file, index) => (
            <motion.div 
              key={index} 
              className="relative group"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="w-20 h-20 object-cover rounded-xl border-2 shadow-md"
                style={{ borderColor: "var(--border-default)" }}
              />
              <motion.button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default UploadField;
