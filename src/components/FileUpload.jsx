import { useState, useRef } from "react";
import { authService } from "../services/api-service";

const FileUpload = ({ tourId, onFileUploaded, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
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

  const validateFile = (file) => {
    if (!allowedTypes[file.type]) {
      return "รองรับเฉพาะไฟล์ PDF และรูปภาพ (JPG, PNG, GIF, WebP)";
    }

    if (file.size > maxFileSize) {
      return "ขนาดไฟล์ใหญ่เกินไป (สูงสุด 10MB)";
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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tour_id", tourId);
      formData.append(
        "uploaded_by",
        authService.getCurrentUser()?.username || "Unknown"
      );

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/files.php`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Upload failed");
      }

      if (onFileUploaded) {
        onFileUploaded(result.data);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("เกิดข้อผิดพลาดในการอัพโหลด: " + error.message);
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

  const getFileIcon = (type) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("image")) return "🖼️";
    return "📎";
  };

  return (
    <div className="file-upload-container">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
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
            <p className="text-sm text-gray-600">กำลังอัพโหลด...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-400">📎</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
              </p>
              <p className="text-xs text-gray-500 mt-1">
                รองรับ PDF และรูปภาพ (สูงสุด 10MB)
              </p>
            </div>

            {/* Supported File Types */}
            <div className="flex justify-center space-x-4 text-xs text-gray-400">
              <span className="flex items-center space-x-1">
                <span>📄</span>
                <span>PDF</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>🖼️</span>
                <span>JPG, PNG, GIF, WebP</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-3 text-xs text-gray-500 space-y-1">
        <p>• สามารถอัพโหลดหลายไฟล์พร้อมกันได้</p>
        <p>• ไฟล์ PDF: เอกสารโปรแกรม, ใบจอง, เงื่อนไข</p>
        <p>• รูปภาพ: ภาพทัวร์, แผนที่, สถานที่ท่องเที่ยว</p>
      </div>
    </div>
  );
};

export default FileUpload;
