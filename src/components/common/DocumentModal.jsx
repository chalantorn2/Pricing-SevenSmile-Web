import { useState, useEffect } from "react";
import { filesService, supplierFilesService } from "../../services/api-service";
import {
  getTourCategoryInfo,
  getSupplierCategoryInfo,
} from "../../utils/file-categories";

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

      const promises = [];
      promises.push(filesService.getTourFiles(tour.id));

      if (tour.supplier_id) {
        promises.push(supplierFilesService.getSupplierFiles(tour.supplier_id));
      } else {
        promises.push(Promise.resolve([]));
      }

      const [tourFiles, supplierFiles] = await Promise.all(promises);

      const allFiles = [
        ...supplierFiles.map((file) => ({ ...file, source: "supplier" })),
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
    let fileUrl;
    if (file.source === "supplier") {
      fileUrl = supplierFilesService.getSupplierFileUrl(file);
    } else {
      fileUrl = filesService.getFileUrl(file);
    }

    if (file.file_type === "image") {
      setSelectedImage(fileUrl);
    } else {
      window.open(fileUrl, "_blank");
    }
  };

  const handleDownloadFile = (file) => {
    let fileUrl;
    if (file.source === "supplier") {
      fileUrl = supplierFilesService.getSupplierFileUrl(file);
    } else {
      fileUrl = filesService.getFileUrl(file);
    }
    window.open(fileUrl, "_blank");
  };

  const getDisplayName = (file) => {
    if (file.source === "supplier" && file.label && file.label.trim()) {
      return file.label;
    }
    return file.original_name;
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

  // Group files by category and source
  const groupFilesByCategory = () => {
    const groups = {};

    files.forEach((file) => {
      const category = file.file_category || "general";
      const source = file.source;
      const key = `${source}_${category}`;

      if (!groups[key]) {
        groups[key] = {
          source,
          category,
          categoryInfo:
            source === "supplier"
              ? getSupplierCategoryInfo(category)
              : getTourCategoryInfo(category),
          files: [],
        };
      }
      groups[key].files.push(file);
    });

    return groups;
  };

  // เพิ่มฟังก์ชันช่วยเรียงลำดับ
  const getSortedFileGroups = () => {
    const fileGroups = groupFilesByCategory();
    const sortedEntries = Object.entries(fileGroups).sort(([keyA], [keyB]) => {
      // แยก source และ category
      const [sourceA, categoryA] = keyA.split("_");
      const [sourceB, categoryB] = keyB.split("_");

      // เรียง supplier ก่อน, tour หลัง
      if (sourceA !== sourceB) {
        return sourceA === "supplier" ? -1 : 1;
      }

      // เรียงตาม category: brochure, general, gallery
      const order = ["brochure", "general", "gallery"];
      return order.indexOf(categoryA) - order.indexOf(categoryB);
    });

    return Object.fromEntries(sortedEntries);
  };

  if (!isOpen || !tour) return null;

  const fileGroups = groupFilesByCategory();

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
              <div className="space-y-8">
                {Object.entries(fileGroups).map(([groupKey, group]) => (
                  <div key={groupKey}>
                    {/* Category Header */}
                    <div className="flex items-center mb-4">
                      <div
                        className={`inline-flex items-center px-3 py-2 rounded-lg ${group.categoryInfo.color} border`}
                      >
                        <span className="mr-2 text-lg">
                          {group.categoryInfo.icon}
                        </span>
                        <span className="font-medium">
                          {group.categoryInfo.label}
                        </span>
                        <span className="ml-2 text-xs opacity-75">
                          ({group.source === "supplier" ? "Supplier" : "Tour"})
                        </span>
                      </div>
                      <span className="ml-3 text-sm text-gray-500">
                        {group.files.length} ไฟล์
                      </span>
                    </div>

                    {group.source === "tour" &&
                    (group.category === "gallery" ||
                      group.files.some(
                        (file) => file.file_type === "image"
                      )) ? (
                      <div className="space-y-4">
                        {/* Gallery Header */}
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">
                            คลิกรูปเพื่อดูขนาดใหญ่
                          </p>
                          <span className="text-xs text-gray-500">
                            {/* ⭐ นับเฉพาะรูปภาพ */}
                            {
                              group.files.filter(
                                (file) => file.file_type === "image"
                              ).length
                            }{" "}
                            รูป
                          </span>
                        </div>

                        {/* Grid Layout แบบ TourDetails */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                          {group.files
                            .filter((file) => file.file_type === "image")
                            .map((file) => (
                              <div
                                key={file.id}
                                className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                                onClick={() =>
                                  setSelectedImage(
                                    file.source === "supplier"
                                      ? supplierFilesService.getSupplierFileUrl(
                                          file
                                        )
                                      : filesService.getFileUrl(file)
                                  )
                                }
                              >
                                <img
                                  src={
                                    file.source === "supplier"
                                      ? supplierFilesService.getSupplierFileUrl(
                                          file
                                        )
                                      : filesService.getFileUrl(file)
                                  }
                                  alt={getDisplayName(file)}
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                  loading="lazy"
                                />
                              </div>
                            ))}
                        </div>

                        {/* Gallery Footer */}
                        <div className="text-center pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            💡 เคล็บลับ: คลิกรูปเพื่อดูขนาดเต็ม
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Regular file list for other categories */
                      <div className="space-y-3">
                        {group.files.map((file) => (
                          <div
                            key={file.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">
                                  {file.file_type === "pdf" ? "📄" : "🖼️"}
                                </span>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-gray-900">
                                      {getDisplayName(file)}
                                    </h4>
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full ${
                                        file.source === "supplier"
                                          ? "bg-blue-100 text-blue-700"
                                          : "bg-green-100 text-green-700"
                                      }`}
                                    >
                                      {file.source === "supplier"
                                        ? "Supplier"
                                        : "Tour"}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>{file.file_size_formatted}</span>
                                    <span>•</span>
                                    <span>
                                      อัพโหลดเมื่อ{" "}
                                      {formatDate(file.uploaded_at)}
                                    </span>
                                    <span>•</span>
                                    <span>โดย {file.uploaded_by}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleViewFile(file)}
                                  className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                                >
                                  👁️ ดู
                                </button>
                                <button
                                  onClick={() => handleDownloadFile(file)}
                                  className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm"
                                >
                                  📥 ดาวน์โหลด
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-gray-400">📂</span>
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
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              ปิด
            </button>
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
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 rounded-full w-10 h-10 flex items-center justify-center transition-all shadow-lg"
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
