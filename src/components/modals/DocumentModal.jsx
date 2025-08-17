import { useState, useEffect } from "react";
import { filesService, subAgentFilesService } from "../../services/api-service";

const DocumentModal = ({ isOpen, onClose, tour }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (isOpen && tour) {
      fetchFiles();
    }
  }, [isOpen, tour]);

  const fetchFiles = async () => {
    try {
      setLoading(true);

      // Fetch both sub agent files and tour files
      const promises = [];

      // Tour files (existing)
      promises.push(filesService.getTourFiles(tour.id));

      // Sub agent files (new)
      if (tour.sub_agent_id) {
        promises.push(subAgentFilesService.getSubAgentFiles(tour.sub_agent_id));
      } else {
        promises.push(Promise.resolve([]));
      }

      const [tourFiles, subAgentFiles] = await Promise.all(promises);

      // Combine and mark file sources
      const allFiles = [
        ...subAgentFiles.map((file) => ({ ...file, source: "sub_agent" })),
        ...tourFiles.map((file) => ({ ...file, source: "tour" })),
      ];

      setFiles(allFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      alert("เกิดข้อผิดพลาดในการโหลดไฟล์");
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = (file) => {
    const fileUrl = filesService.getFileUrl(file);
    if (file.file_type === "image") {
      setSelectedImage(fileUrl);
    } else if (file.file_type === "pdf") {
      // Open PDF in new window/tab for better viewing
      window.open(fileUrl, "_blank");
    }
  };

  const handleDownloadFile = (file) => {
    const fileUrl = filesService.getFileUrl(file);
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = file.original_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !tour) return null;

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "image":
        return "🖼️";
      default:
        return "📎";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pdfFiles = files.filter((file) => file.file_type === "pdf");
  const imageFiles = files.filter((file) => file.file_type === "image");

  return (
    <div className="modal-backdrop">
      <div className="modal-overlay">
        <div className="modal-content document-modal-large bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="modal-header border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">เอกสารแนบ</h2>
              <p className="text-sm text-gray-600 mt-1">{tour.tour_name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div
            className="p-6 overflow-y-auto"
            style={{ maxHeight: "calc(80vh - 120px)" }}
          >
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">กำลังโหลดไฟล์...</p>
              </div>
            ) : files.length > 0 ? (
              <div className="space-y-6">
                {/* PDF Files Section */}
                {pdfFiles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">📄</span>
                      เอกสาร PDF ({pdfFiles.length} ไฟล์)
                    </h3>
                    <div className="space-y-3">
                      {pdfFiles.map((file) => (
                        <div
                          key={file.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">📄</span>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-gray-900">
                                    {file.label || file.original_name}
                                  </h4>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      file.source === "sub_agent"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    {file.source === "sub_agent"
                                      ? "Sub Agent"
                                      : "Tour"}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>{file.file_size_formatted}</span>
                                  <span>•</span>
                                  <span>
                                    อัพโหลดเมื่อ {formatDate(file.uploaded_at)}
                                  </span>
                                  <span>•</span>
                                  <span>โดย {file.uploaded_by}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewFile(file)}
                                className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm cursor-pointer"
                              >
                                👁️ ดู
                              </button>
                              <button
                                onClick={() => handleDownloadFile(file)}
                                className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm cursor-pointer"
                              >
                                📥 ดาวน์โหลด
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Files Section */}
                {imageFiles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">🖼️</span>
                      รูปภาพ ({imageFiles.length} ไฟล์)
                    </h3>
                    <div className="space-y-3">
                      {imageFiles.map((file) => (
                        <div
                          key={file.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">🖼️</span>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {file.original_name}
                                </h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>{file.file_size_formatted}</span>
                                  <span>•</span>
                                  <span>
                                    อัพโหลดเมื่อ {formatDate(file.uploaded_at)}
                                  </span>
                                  <span>•</span>
                                  <span>โดย {file.uploaded_by}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewFile(file)}
                                className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm cursor-pointer"
                              >
                                👁️ ดู
                              </button>
                              <button
                                onClick={() => handleDownloadFile(file)}
                                className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm cursor-pointer"
                              >
                                📥 ดาวน์โหลด
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-gray-400">📁</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ยังไม่มีเอกสารแนบ
                </h3>
                <p className="text-gray-500 mb-4">
                  ไปที่หน้าแก้ไขเพื่อเพิ่มเอกสารสำหรับทัวร์นี้
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-t border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {files.length > 0
                ? `มีเอกสาร ${files.length} ไฟล์`
                : "ไม่มีเอกสาร"}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal for Enlarged View */}
      {selectedImage && (
        <div
          className="modal-backdrop flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-auto h-auto">
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Close button - ปรับใหม่ให้เห็นง่าย */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer transition-all shadow-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentModal;
