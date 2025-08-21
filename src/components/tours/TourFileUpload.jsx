import { useState, useRef } from "react";
import { authService } from "../../services/api-service";
import {
  TOUR_FILE_CATEGORIES,
  getCategoryHints,
} from "../../utils/file-categories";

const TourFileUpload = ({ tourId, onFileUploaded, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const fileInputRef = useRef(null);

  const allowedTypes = {
    "application/pdf": "pdf",
    "image/jpeg": "image",
    "image/jpg": "image",
    "image/png": "image",
    "image/gif": "image",
    "image/webp": "image",
  };

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Get current category info
  const categoryInfo = TOUR_FILE_CATEGORIES[selectedCategory];
  const categoryHints = getCategoryHints(selectedCategory, false);

  const validateFile = (file) => {
    if (!allowedTypes[file.type]) {
      return "รองรับเฉพาะไฟล์ PDF และรูปภาพ (JPG, PNG, GIF, WebP)";
    }

    if (file.size > maxFileSize) {
      return "ขนาดไฟล์ใหญ่เกินไป (สูงสุด 10MB)";
    }

    // Validate against category restrictions
    const fileType = file.type.includes("image") ? "image" : "pdf";
    if (!categoryInfo.allowedTypes.includes(fileType)) {
      return `หมวดหมู่ "${categoryInfo.label}" รองรับเฉพาะ ${categoryHints.allowedTypesText}`;
    }

    return null;
  };

  const uploadFile = async (file) => {
    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    setUploading(true);

    try {
      const currentUser = authService.getCurrentUser();
      const uploadedFile = await filesService.uploadTourFile(
        tourId,
        file,
        selectedCategory,
        currentUser?.username || "Unknown"
      );

      if (onFileUploaded) {
        onFileUploaded(uploadedFile);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert(`อัพโหลดไฟล์ "${file.name}" ในหมวด "${categoryInfo.label}" สำเร็จ`);
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(uploadFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    files.forEach(uploadFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getAcceptString = () => {
    if (
      categoryInfo.allowedTypes.includes("image") &&
      categoryInfo.allowedTypes.includes("pdf")
    ) {
      return ".pdf,.jpg,.jpeg,.png,.gif,.webp";
    } else if (categoryInfo.allowedTypes.includes("pdf")) {
      return ".pdf";
    } else {
      return ".jpg,.jpeg,.png,.gif,.webp";
    }
  };

  return (
    <div className="tour-file-upload-container">
      {/* Category Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          หมวดหมู่ไฟล์ <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          disabled={disabled || uploading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          {Object.values(TOUR_FILE_CATEGORIES).map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>

        {/* Category Description */}
        <div className={`mt-2 p-3 rounded-lg ${categoryInfo.color} border`}>
          <p className="text-sm font-medium mb-1">{categoryInfo.description}</p>
          <p className="text-xs">
            รองรับ: {categoryHints.allowedTypesText} | ตัวอย่าง:{" "}
            {categoryHints.examples.slice(0, 2).join(", ")}
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={getAcceptString()}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      <div
        className={`file-upload-area border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          dragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-gray-50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        {uploading ? (
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">
              กำลังอัพโหลดไปยัง "{categoryInfo.label}"...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Category Icon */}
            <div
              className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${categoryInfo.color}`}
            >
              <span className="text-3xl">{categoryInfo.icon}</span>
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                อัพโหลดไฟล์ไปยัง "{categoryInfo.label}"
              </p>
              <p className="text-sm text-gray-600 mb-2">
                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
              </p>
              <p className="text-xs text-gray-500">
                รองรับ {categoryHints.allowedTypesText} (สูงสุด 10MB)
              </p>
            </div>

            {/* Supported File Types for Current Category */}
            <div className="flex justify-center space-x-4 text-xs text-gray-400">
              {categoryInfo.allowedTypes.includes("pdf") && (
                <span className="flex items-center space-x-1">
                  <span>📄</span>
                  <span>PDF</span>
                </span>
              )}
              {categoryInfo.allowedTypes.includes("image") && (
                <span className="flex items-center space-x-1">
                  <span>🖼️</span>
                  <span>JPG, PNG, GIF, WebP</span>
                </span>
              )}
            </div>

            {/* Examples for Current Category */}
            <div className="bg-gray-50 rounded-lg p-3 text-left">
              <p className="text-xs font-medium text-gray-700 mb-1">
                ตัวอย่างไฟล์ในหมวด "{categoryInfo.label}":
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                {categoryHints.examples.map((example, index) => (
                  <li key={index}>• {example}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-3 text-xs text-gray-500 space-y-1">
        <p>• สามารถอัพโหลดหลายไฟล์พร้อมกันได้</p>
        <p>• ไฟล์จะถูกจัดเก็บในหมวด "{categoryInfo.label}"</p>
        <p>• เปลี่ยนหมวดหมู่ก่อนอัพโหลดหากต้องการจัดหมวดอื่น</p>
      </div>
    </div>
  );
};

export default TourFileUpload;
