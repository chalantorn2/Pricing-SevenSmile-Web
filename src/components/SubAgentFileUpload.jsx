import { useState, useRef } from "react";
import { authService } from "../services/api-service";

const SubAgentFileUpload = ({
  subAgentId,
  onFileUploaded,
  disabled = false,
  allowedTypes = ["pdf", "image"],
  maxFileSize = 10, // MB
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const allowedMimeTypes = {
    pdf: ["application/pdf"],
    image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  };

  const maxFileSizeBytes = maxFileSize * 1024 * 1024;

  const validateFile = (file) => {
    // Check file type
    const isValidType = allowedTypes.some((type) =>
      allowedMimeTypes[type]?.includes(file.type)
    );

    if (!isValidType) {
      return `รองรับเฉพาะไฟล์ PDF และรูปภาพ (JPG, PNG, GIF, WebP)`;
    }

    // Check file size
    if (file.size > maxFileSizeBytes) {
      return `ขนาดไฟล์ใหญ่เกินไป (สูงสุด ${maxFileSize}MB)`;
    }

    return null;
  };

  const uploadFile = async (file, label = "") => {
    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sub_agent_id", subAgentId);
      formData.append("label", label || "");
      formData.append(
        "uploaded_by",
        authService.getCurrentUser()?.username || "Unknown"
      );

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/sub-agent-files.php`,
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

      // Success message
      alert(`อัพโหลดไฟล์ "${file.name}" สำเร็จ`);
    } catch (error) {
      console.error("Upload error:", error);
      alert("เกิดข้อผิดพลาดในการอัพโหลด: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 1) {
      // Single file - ask for label
      const file = files[0];
      const label = prompt(
        `ป้ายชื่อไฟล์ "${file.name}":\n(เช่น "Contact Rate Jan 2025", "Price List Update")`,
        ""
      );

      if (label !== null) {
        // User didn't cancel
        uploadFile(file, label);
      }
    } else {
      // Multiple files - upload without labels
      files.forEach((file) => uploadFile(file));
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);

    const files = Array.from(event.dataTransfer.files);
    if (files.length === 1) {
      const file = files[0];
      const label = prompt(
        `ป้ายชื่อไฟล์ "${file.name}":\n(เช่น "Contact Rate Jan 2025")`,
        ""
      );

      if (label !== null) {
        uploadFile(file, label);
      }
    } else {
      files.forEach((file) => uploadFile(file));
    }
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

  const getAcceptedTypes = () => {
    const types = [];
    if (allowedTypes.includes("pdf")) types.push(".pdf");
    if (allowedTypes.includes("image"))
      types.push(".jpg,.jpeg,.png,.gif,.webp");
    return types.join(",");
  };

  if (!subAgentId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-600">⚠️</span>
          <p className="text-yellow-800 text-sm">
            กรุณาเลือก Sub Agent ก่อนอัพโหลดไฟล์
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="sub-agent-file-upload">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={getAcceptedTypes()}
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
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <span className="text-3xl text-blue-400">📎</span>
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                อัพโหลด Contact Rate Files
              </p>
              <p className="text-sm text-gray-600 mb-2">
                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
              </p>
              <p className="text-xs text-gray-500">
                รองรับ PDF และรูปภาพ (สูงสุด {maxFileSize}MB)
              </p>
            </div>

            {/* Supported File Types */}
            <div className="flex justify-center space-x-6 text-xs text-gray-400">
              {allowedTypes.includes("pdf") && (
                <span className="flex items-center space-x-1">
                  <span className="text-lg">📄</span>
                  <span>PDF</span>
                </span>
              )}
              {allowedTypes.includes("image") && (
                <span className="flex items-center space-x-1">
                  <span className="text-lg">🖼️</span>
                  <span>JPG, PNG, GIF, WebP</span>
                </span>
              )}
            </div>

            {/* Usage Examples */}
            <div className="bg-gray-50 rounded-lg p-3 text-left">
              <p className="text-xs font-medium text-gray-700 mb-1">
                ตัวอย่างไฟล์ที่ควรอัพโหลด:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 📄 Contact Rate PDF (ใบราคาจาก Sub Agent)</li>
                <li>• 📄 Terms & Conditions</li>
                <li>• 🖼️ รูปภาพแผนที่ พื้นที่ท่องเที่ยว</li>
                <li>• 📄 เอกสารข้อตกลง/สัญญา</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>
          <strong>💡 Tips:</strong>
        </p>
        <p>• ไฟล์เหล่านี้จะใช้ร่วมกันสำหรับทุกทัวร์ของ Sub Agent นี้</p>
        <p>• ระบบจะถามป้ายชื่อไฟล์เมื่ออัพโหลดไฟล์เดี่ยว</p>
        <p>• สามารถอัพโหลดหลายไฟล์พร้อมกันได้</p>
      </div>
    </div>
  );
};

export default SubAgentFileUpload;
