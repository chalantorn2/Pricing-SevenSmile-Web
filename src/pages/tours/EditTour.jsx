import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SupplierAutocomplete } from "../../components/suppliers";
import { SupplierModal } from "../../components/suppliers";
import { TourFileUpload } from "../../components/tours";
import { AutocompleteInput } from "../../components/common";
import SupplierFileUpload from "../../components/suppliers/SupplierFileUpload";
import {
  toursService,
  suppliersService,
  filesService,
  supplierFilesService,
} from "../../services/api-service";

const EditTour = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data states
  const [tour, setTour] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierFiles, setSupplierFiles] = useState([]);
  const [tourFiles, setTourFiles] = useState([]);

  // Modal states
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [modalInitialName, setModalInitialName] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    tour_name: "",
    departure_from: "",
    pier: "",
    adult_price: "",
    child_price: "",
    start_date: "",
    end_date: "",
    no_end_date: false,
    notes: "",
    park_fee_included: false,
    map_url: "",
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchTourData();
  }, [id]);

  useEffect(() => {
    if (selectedSupplier) {
      loadSupplierFiles();
    }
  }, [selectedSupplier]);

  const fetchTourData = async () => {
    try {
      setLoading(true);

      // Fetch tour data
      const tours = await toursService.getAllTours();
      const tourData = tours.find((t) => t.id === id);

      if (tourData) {
        setTour(tourData);

        // Check if tour has no end date
        const hasNoEndDate =
          !tourData.end_date || tourData.end_date === "0000-00-00";

        setFormData({
          tour_name: tourData.tour_name || "",
          departure_from: tourData.departure_from || "",
          pier: tourData.pier || "",
          adult_price: tourData.adult_price
            ? parseFloat(tourData.adult_price).toString()
            : "",
          child_price: tourData.child_price
            ? parseFloat(tourData.child_price).toString()
            : "",
          start_date: tourData.start_date || "",
          end_date: hasNoEndDate ? "" : tourData.end_date || "",
          no_end_date: hasNoEndDate,
          notes: tourData.notes || "",
          park_fee_included: tourData.park_fee_included || false,
          map_url: tourData.map_url || "",
        });

        // Set supplier if exists
        if (tourData.supplier_id && tourData.supplier_name) {
          setSelectedSupplier({
            id: tourData.supplier_id,
            name: tourData.supplier_name,
            address: tourData.address,
            phone: tourData.phone,
            line: tourData.line,
            facebook: tourData.facebook,
            whatsapp: tourData.whatsapp,
          });
        }

        // Fetch tour files
        try {
          const files = await filesService.getTourFiles(id);
          setTourFiles(files);
        } catch (error) {
          console.error("Error fetching tour files:", error);
        }
      } else {
        alert("ไม่พบข้อมูลทัวร์");
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching tour:", error);
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const loadSupplierFiles = async () => {
    if (!selectedSupplier) return;

    try {
      const files = await supplierFilesService.getSupplierFiles(
        selectedSupplier.id
      );
      setSupplierFiles(files);
    } catch (error) {
      console.error("Error loading supplier files:", error);
    }
  };

  const handleSupplierSelect = async (supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleCreateNewSupplier = (name) => {
    setModalInitialName(name);
    setShowSupplierModal(true);
  };

  const handleSupplierCreated = (newSupplier) => {
    setSelectedSupplier(newSupplier);
  };

  const handleSupplierFileUploaded = (newFile) => {
    setSupplierFiles((prev) => [newFile, ...prev]);
  };

  const handleTourFileUploaded = (newFile) => {
    setTourFiles((prev) => [newFile, ...prev]);
  };

  const handleDeleteTourFile = async (fileId) => {
    if (window.confirm("คุณต้องการลบไฟล์นี้หรือไม่?")) {
      try {
        await filesService.deleteFile(fileId);
        setTourFiles((prev) => prev.filter((file) => file.id !== fileId));
      } catch (error) {
        console.error("Error deleting file:", error);
        alert("เกิดข้อผิดพลาดในการลบไฟล์");
      }
    }
  };

  const handleDeleteSupplierFile = async (fileId) => {
    if (window.confirm("คุณต้องการลบไฟล์นี้หรือไม่?")) {
      try {
        await supplierFilesService.deleteSupplierFile(fileId);
        setSupplierFiles((prev) => prev.filter((file) => file.id !== fileId));
      } catch (error) {
        console.error("Error deleting supplier file:", error);
        alert("เกิดข้อผิดพลาดในการลบไฟล์");
      }
    }
  };

  const handleViewFile = (file, isSupplierFile = false) => {
    const fileUrl = isSupplierFile
      ? supplierFilesService.getSupplierFileUrl(file)
      : filesService.getFileUrl(file);
    window.open(fileUrl, "_blank");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleAutocompleteChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleNoEndDateToggle = (checked) => {
    setFormData((prev) => {
      const updatedData = { ...prev, no_end_date: checked };

      if (checked) {
        // If enabling no_end_date, clear the end_date value
        updatedData.end_date = "";
      } else {
        // If disabling, set default end date (1 year from start date or today)
        const startDate = prev.start_date
          ? new Date(prev.start_date)
          : new Date();
        const defaultEndDate = new Date(startDate);
        defaultEndDate.setFullYear(startDate.getFullYear() + 1);
        updatedData.end_date = defaultEndDate.toISOString().split("T")[0];
      }

      return updatedData;
    });

    // Clear end_date error
    if (errors.end_date) {
      setErrors((prev) => ({
        ...prev,
        end_date: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.tour_name.trim()) {
      newErrors.tour_name = "กรุณากรอกชื่อทัวร์";
    }

    // Date validation
    if (!formData.no_end_date && formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      if (endDate <= startDate) {
        newErrors.end_date = "วันสิ้นสุดต้องมากกว่าวันเริ่มต้น";
      }
    }

    // Number validation
    if (formData.adult_price && isNaN(parseFloat(formData.adult_price))) {
      newErrors.adult_price = "กรุณากรอกตัวเลขที่ถูกต้อง";
    }

    if (formData.child_price && isNaN(parseFloat(formData.child_price))) {
      newErrors.child_price = "กรุณากรอกตัวเลขที่ถูกต้อง";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("กรุณาตรวจสอบข้อมูลให้ครบถ้วนและถูกต้อง");
      return;
    }

    setSaving(true);

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        supplier_id: selectedSupplier?.id || null,
        adult_price: parseFloat(formData.adult_price) || 0,
        child_price: parseFloat(formData.child_price) || 0,
        end_date: formData.no_end_date ? null : formData.end_date,
      };

      await toursService.updateTour(id, submitData);
      alert("อัปเดตข้อมูลเรียบร้อยแล้ว");
      navigate("/");
    } catch (error) {
      console.error("Error saving tour:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `คุณต้องการลบทัวร์ "${formData.tour_name}" หรือไม่?\n\nการลบนี้ไม่สามารถกู้คืนได้!`
      )
    ) {
      try {
        setSaving(true);
        await toursService.deleteTour(id);
        alert("ลบข้อมูลเรียบร้อยแล้ว");
        navigate("/");
      } catch (error) {
        console.error("Error deleting tour:", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขทัวร์</h1>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← กลับ
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🏢 Supplier
          </h2>
          <SupplierAutocomplete
            onSelect={handleSupplierSelect}
            onCreateNew={handleCreateNewSupplier}
            value={selectedSupplier}
            placeholder="เลือกหรือเปลี่ยน Supplier..."
          />
        </div>

        {/* Tour Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🏝️ ข้อมูลทัวร์
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tour Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อทัวร์ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tour_name"
                value={formData.tour_name}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.tour_name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="กรอกชื่อทัวร์"
              />
              {errors.tour_name && (
                <p className="text-red-500 text-xs mt-1">{errors.tour_name}</p>
              )}
            </div>

            {/* Departure From - with Autocomplete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ออกจาก
              </label>
              <AutocompleteInput
                type="departure_from"
                value={formData.departure_from}
                onChange={(value) =>
                  handleAutocompleteChange("departure_from", value)
                }
                placeholder="จังหวัด/สถานที่ออกเดินทาง"
                className={errors.departure_from ? "border-red-500" : ""}
              />
              {errors.departure_from && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.departure_from}
                </p>
              )}
            </div>

            {/* Pier - with Autocomplete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ท่าเรือ
              </label>
              <AutocompleteInput
                type="pier"
                value={formData.pier}
                onChange={(value) => handleAutocompleteChange("pier", value)}
                placeholder="ชื่อท่าเรือ"
                className={errors.pier ? "border-red-500" : ""}
              />
              {errors.pier && (
                <p className="text-red-500 text-xs mt-1">{errors.pier}</p>
              )}
            </div>

            {/* Adult Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ราคาผู้ใหญ่ (บาท)
              </label>
              <input
                type="number"
                name="adult_price"
                value={formData.adult_price}
                onChange={handleChange}
                min="0"
                step="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.adult_price ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.adult_price && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.adult_price}
                </p>
              )}
            </div>

            {/* Child Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ราคาเด็ก (บาท)
              </label>
              <input
                type="number"
                name="child_price"
                value={formData.child_price}
                onChange={handleChange}
                min="0"
                step="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.child_price ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.child_price && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.child_price}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* End Date - with Optional Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่สิ้นสุด
              </label>

              {/* End Date Input - conditionally shown */}
              {!formData.no_end_date && (
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.end_date ? "border-red-500" : "border-gray-300"
                  }`}
                />
              )}

              {/* End Date in Disabled State */}
              {formData.no_end_date && (
                <input
                  type="text"
                  value="ไม่กำหนด"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-orange-50 text-orange-700 cursor-not-allowed"
                />
              )}

              {/* No End Date Checkbox */}
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.no_end_date}
                    onChange={(e) => handleNoEndDateToggle(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-orange-700">
                    ไม่กำหนดวันสิ้นสุด (ใช้ไปจนกว่าจะมีการเปลี่ยนแปลง)
                  </span>
                </label>
              </div>

              {errors.end_date && (
                <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>
              )}
            </div>

            {/* Map URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🗺️ Google Maps URL
              </label>
              <input
                type="url"
                name="map_url"
                value={formData.map_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://maps.google.com/... หรือ https://goo.gl/maps/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                คัดลอก URL จาก Google Maps แล้ววางที่นี่ (ไม่บังคับ)
              </p>
            </div>

            {/* Park Fee Included */}
            <div className="md:col-span-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="park_fee_included"
                  checked={formData.park_fee_included}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  ราคา Net นี้ รวมค่าอุทยานแล้ว
                </span>
              </label>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมายเหตุ
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรอกหมายเหตุเพิ่มเติม..."
              />
            </div>
          </div>
        </div>

        {/* Files Section */}
        <div className="space-y-6">
          {/* Supplier Files */}
          {selectedSupplier && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📎 ไฟล์ Supplier ({selectedSupplier.name})
              </h2>

              <SupplierFileUpload
                supplierId={selectedSupplier.id}
                onFileUploaded={handleSupplierFileUploaded}
              />

              {supplierFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">
                    ไฟล์ที่อัพโหลดแล้ว ({supplierFiles.length} ไฟล์)
                  </h3>
                  <div className="space-y-2">
                    {supplierFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {file.file_type === "pdf" ? "📄" : "🖼️"}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {file.label || file.original_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file.file_size_formatted} • Supplier File
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleViewFile(file, true)}
                            className="px-2 py-1 text-blue-600 hover:bg-blue-100 rounded text-sm"
                          >
                            👁️ ดู
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSupplierFile(file.id)}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                          >
                            🗑️ ลบ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tour Files */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              📎 ไฟล์เฉพาะทัวร์นี้
            </h2>

            <TourFileUpload
              tourId={id}
              onFileUploaded={handleTourFileUploaded}
            />

            {tourFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  ไฟล์ที่อัพโหลดแล้ว ({tourFiles.length} ไฟล์)
                </h3>
                <div className="space-y-2">
                  {tourFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">
                          {file.file_type === "pdf" ? "📄" : "🖼️"}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.original_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.file_size_formatted} • Tour File
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleViewFile(file, false)}
                          className="px-2 py-1 text-blue-600 hover:bg-blue-100 rounded text-sm"
                        >
                          👁️ ดู
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTourFile(file.id)}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                        >
                          🗑️ ลบ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons - Sticky at bottom */}
        <div className="sticky rounded-lg bottom-0 bg-white border-t border-gray-200 shadow-lg -mx-6 px-6 py-4 mt-6 z-30">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
            >
              {saving ? "กำลังบันทึก..." : "💾 บันทึกการแก้ไข"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
            >
              {saving ? "กำลังลบ..." : "🗑️ ลบทัวร์นี้"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium shadow-md"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </form>

      {/* Modals */}
      <SupplierModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        onSuccess={handleSupplierCreated}
        initialName={modalInitialName}
      />
    </div>
  );
};

export default EditTour;
