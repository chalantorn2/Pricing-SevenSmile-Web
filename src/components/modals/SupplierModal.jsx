import { useState, useEffect } from "react";
import { suppliersService } from "../../services/api-service";

const SupplierModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialName = "",
  supplier = null,
  isEdit = false,
}) => {
  const [loading, setLoading] = useState(false);
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
    onClose();
  };

  if (!isOpen) return null;

  return (
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
              disabled={loading}
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

            {/* Footer */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupplierModal;
