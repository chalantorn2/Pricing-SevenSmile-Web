import { useState, useEffect } from "react";
import { suppliersService } from "../../services/api-service";

const SupplierModal = ({
  isOpen,
  onClose,
  onSuccess,
  onDelete, // ✨ เพิ่ม prop สำหรับลบ
  initialName = "",
  supplier = null,
  isEdit = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false); // ✨ เพิ่ม state สำหรับ delete loading
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // ✨ เพิ่ม state สำหรับ confirm
  const [formData, setFormData] = useState({
    name: initialName,
    address: "",
    phone: "",
    line: "",
    facebook: "",
    whatsapp: "",
  });

  // ✨ Update form data when supplier prop changes (for edit mode)
  useEffect(() => {
    if (isEdit && supplier) {
      setFormData({
        name: supplier.name || "",
        address: supplier.address || "",
        phone: supplier.phone || "",
        line: supplier.line || "",
        facebook: supplier.facebook || "",
        whatsapp: supplier.whatsapp || "",
      });
    } else {
      setFormData({
        name: initialName,
        address: "",
        phone: "",
        line: "",
        facebook: "",
        whatsapp: "",
      });
    }
  }, [isEdit, supplier, initialName]);

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

  // ✨ Function สำหรับจัดการการลบ
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await suppliersService.deleteSupplier(supplier.id);
      onDelete?.(supplier); // เรียก callback function
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

  const handleClose = () => {
    if (!isEdit) {
      setFormData({
        name: "",
        address: "",
        phone: "",
        line: "",
        facebook: "",
        whatsapp: "",
      });
    }
    setShowDeleteConfirm(false); // ✨ รีเซ็ต delete confirm state
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop">
        <div className="modal-overlay">
          <div className="modal-content bg-white rounded-lg shadow-xl w-full max-w-2xl">
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

            {/* Content - ✨ เพิ่ม overflow-y-auto เพื่อให้ scroll ได้ */}
            <div className="overflow-y-auto max-h-[60vh]">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      ข้อมูลพื้นฐาน
                    </h3>
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

                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      ช่องทางการติดต่อ
                    </h3>
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
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center space-x-3 border-t border-gray-200 px-6 py-4">
              {/* ✨ ปุ่มลบ - แสดงเฉพาะตอน Edit */}
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

              {/* ปุ่มด้านขวา */}
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
                  form="supplier-form"
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

      {/* ✨ Delete Confirmation Modal */}
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
