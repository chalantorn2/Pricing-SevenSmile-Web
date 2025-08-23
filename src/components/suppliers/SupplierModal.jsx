import { useState, useEffect } from "react";
import {
  suppliersService,
  supplierFilesService,
} from "../../services/api-service";
import SupplierFileUpload from "./SupplierFileUpload";
import { FileDownloads } from "../common";

const SupplierModal = ({
  isOpen,
  onClose,
  onSuccess,
  onDelete,
  initialName = "",
  supplier = null,
  isEdit = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    name: initialName,
    address: "",
    phone: "",
    line: "",
    facebook: "",
    whatsapp: "",
    website: "",
  });

  // File management states
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesSectionOpen, setFilesSectionOpen] = useState(false);

  // Update form data when supplier prop changes
  useEffect(() => {
    if (isEdit && supplier) {
      setFormData({
        name: supplier.name || "",
        address: supplier.address || "",
        phone: supplier.phone || "",
        line: supplier.line || "",
        facebook: supplier.facebook || "",
        whatsapp: supplier.whatsapp || "",
        website: supplier.website || "",
      });

      // Load files for existing supplier
      if (supplier.id) {
        loadSupplierFiles(supplier.id);
      }
    } else {
      setFormData({
        name: initialName,
        address: "",
        phone: "",
        line: "",
        facebook: "",
        whatsapp: "",
        website: "",
      });
      setFiles([]);
    }
  }, [isEdit, supplier, initialName]);

  // Load supplier files
  const loadSupplierFiles = async (supplierId) => {
    if (!supplierId) return;

    try {
      setFilesLoading(true);
      const supplierFiles = await supplierFilesService.getSupplierFiles(
        supplierId
      );
      setFiles(supplierFiles);
    } catch (error) {
      console.error("Error loading supplier files:", error);
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("กรุณากรอกชื่อ Supplier");
      }

      let result;
      if (isEdit && supplier) {
        // Update existing supplier
        result = await suppliersService.updateSupplier(supplier.id, formData);
      } else {
        // Create new supplier
        result = await suppliersService.addSupplier(formData);
      }

      onSuccess(result);
      handleClose();
    } catch (error) {
      console.error("Error saving supplier:", error);
      alert(
        error.message ||
          `เกิดข้อผิดพลาดในการ${isEdit ? "อัพเดท" : "สร้าง"} Supplier`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await suppliersService.deleteSupplier(supplier.id);
      onDelete?.(supplier);
      handleClose();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      alert(error.message || "เกิดข้อผิดพลาดในการลบ Supplier");
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  // Handle file upload success
  const handleFileUploaded = (newFile) => {
    setFiles((prev) => [newFile, ...prev]);
  };

  // Handle file deletion
  const handleFileDelete = async (fileId) => {
    if (!confirm("ต้องการลบไฟล์นี้หรือไม่?")) return;

    try {
      await supplierFilesService.deleteSupplierFile(fileId);
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("เกิดข้อผิดพลาดในการลบไฟล์");
    }
  };

  const handleClose = () => {
    if (!isEdit) {
      setFormData({
        name: "",
        address: "",
        phone: "",
        line: "",
        facebook: "",
        whatsapp: "",
        website: "",
      });
    }
    setShowDeleteConfirm(false);
    setFilesSectionOpen(false);
    setFiles([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal-overlay">
          <div className="modal-content bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh]">
            {/* Header */}
            <div className="modal-header border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEdit ? "แก้ไขข้อมูล Supplier" : "เพิ่ม Supplier ใหม่"}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading || deleteLoading}
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
            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="p-6">
                {/* Section 1: Basic Info */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📝</span>
                    ข้อมูลพื้นฐาน
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ชื่อ Supplier <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="กรอกชื่อ Supplier"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ที่อยู่
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="กรอกที่อยู่"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact Info */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📞</span>
                    ช่องทางการติดต่อ
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          เบอร์โทร
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0xx-xxx-xxxx"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Line ID
                        </label>
                        <input
                          type="text"
                          name="line"
                          value={formData.line}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Line ID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Facebook
                        </label>
                        <input
                          type="text"
                          name="facebook"
                          value={formData.facebook}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Facebook URL หรือ Username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          WhatsApp
                        </label>
                        <input
                          type="tel"
                          name="whatsapp"
                          value={formData.whatsapp}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="เบอร์ WhatsApp"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          🌐 เว็บไซต์
                        </label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: File Management (เฉพาะตอน Edit) */}
                {isEdit && supplier && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <span className="mr-2">📁</span>
                        จัดการไฟล์เอกสาร ({files.length} ไฟล์)
                      </h3>
                      <button
                        type="button"
                        onClick={() => setFilesSectionOpen(!filesSectionOpen)}
                        className="flex items-center space-x-2 px-3 py-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <span>{filesSectionOpen ? "ซ่อน" : "แสดง"}</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            filesSectionOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>

                    {filesSectionOpen && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        {/* File Upload */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            อัพโหลดไฟล์ใหม่
                          </h4>
                          <SupplierFileUpload
                            supplierId={supplier.id}
                            onFileUploaded={handleFileUploaded}
                            disabled={loading}
                          />
                        </div>

                        {/* File List */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            ไฟล์ที่มีอยู่
                          </h4>
                          {filesLoading ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                              <p className="text-sm text-gray-600">
                                กำลังโหลดไฟล์...
                              </p>
                            </div>
                          ) : (
                            <FileDownloads
                              files={files}
                              getFileUrl={
                                supplierFilesService.getSupplierFileUrl
                              }
                              title="เอกสาร Supplier"
                              isSupplier={true}
                              showCategory={true}
                              onDelete={handleFileDelete}
                              allowDelete={true}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center space-x-3 border-t border-gray-200 px-6 py-4">
              {/* Delete Button - แสดงเฉพาะตอน Edit */}
              <div>
                {isEdit && supplier && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={loading || deleteLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <span>🗑️</span>
                    <span>ลบ Supplier</span>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading || deleteLoading}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading || deleteLoading || !formData.name.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>กำลัง{isEdit ? "อัพเดท" : "สร้าง"}...</span>
                    </div>
                  ) : (
                    `${isEdit ? "อัพเดท" : "สร้าง"} Supplier`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    ยืนยันการลบ Supplier
                  </h3>
                  <p className="text-sm text-gray-600">
                    การดำเนินการนี้ไม่สามารถยกเลิกได้
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  คุณกำลังจะลบ <strong>"{supplier?.name}"</strong>
                </p>
                <p className="text-sm text-red-700 mt-1">
                  • ข้อมูล Supplier จะถูกลบถาวร
                </p>
                <p className="text-sm text-red-700">
                  • ไฟล์เอกสารที่เกี่ยวข้องจะถูกลบ
                </p>
                <p className="text-sm text-red-700">
                  • ทัวร์ที่เชื่อมโยงกับ Supplier นี้จะไม่สามารถลบได้
                  (ต้องลบทัวร์ก่อน)
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>กำลังลบ...</span>
                    </>
                  ) : (
                    <>
                      <span>🗑️</span>
                      <span>ลบ Supplier</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupplierModal;
