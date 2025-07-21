import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toursService, filesService } from "../services/api-service";
import FileUpload from "../components/FileUpload";

const AddPrice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [tourFiles, setTourFiles] = useState([]);
  const [formData, setFormData] = useState({
    sub_agent_name: "",
    address: "",
    phone: "",
    line: "",
    facebook: "",
    whatsapp: "",
    tour_name: "",
    departure_from: "",
    pier: "",
    adult_price: "",
    child_price: "",
    start_date: "",
    end_date: "",
    notes: "",
    park_fee_included: false,
  });

  useEffect(() => {
    if (isEditing) {
      fetchTourData();
    }
  }, [id]);

  const fetchTourData = async () => {
    try {
      setLoading(true);
      const tours = await toursService.getAllTours();
      const tour = tours.find((t) => t.id === id);

      if (tour) {
        setFormData({
          sub_agent_name: tour.sub_agent_name || "",
          address: tour.address || "",
          phone: tour.phone || "",
          line: tour.line || "",
          facebook: tour.facebook || "",
          whatsapp: tour.whatsapp || "",
          tour_name: tour.tour_name || "",
          departure_from: tour.departure_from || "",
          pier: tour.pier || "",
          adult_price: tour.adult_price || "",
          child_price: tour.child_price || "",
          start_date: tour.start_date || "",
          end_date: tour.end_date || "",
          notes: tour.notes || "",
          park_fee_included: tour.park_fee_included || false,
        });

        // Fetch tour files
        try {
          const files = await filesService.getTourFiles(id);
          setTourFiles(files);
        } catch (error) {
          console.error("Error fetching tour files:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching tour:", error);
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploaded = (newFile) => {
    setTourFiles((prevFiles) => [newFile, ...prevFiles]);
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm("คุณต้องการลบไฟล์นี้หรือไม่?")) {
      try {
        await filesService.deleteFile(fileId);
        setTourFiles((prevFiles) =>
          prevFiles.filter((file) => file.id !== fileId)
        );
      } catch (error) {
        console.error("Error deleting file:", error);
        alert("เกิดข้อผิดพลาดในการลบไฟล์");
      }
    }
  };

  const handleViewFile = (file) => {
    const fileUrl = filesService.getFileUrl(file);
    window.open(fileUrl, "_blank");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      const requiredFields = [
        "sub_agent_name",
        "tour_name",
        "adult_price",
        "child_price",
        "start_date",
        "end_date",
      ];
      const missingFields = requiredFields.filter((field) => !formData[field]);

      if (missingFields.length > 0) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        setLoading(false);
        return;
      }

      // Validate date range
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        alert("วันที่เริ่มต้นต้องน้อยกว่าวันที่สิ้นสุด");
        setLoading(false);
        return;
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        adult_price: parseFloat(formData.adult_price),
        child_price: parseFloat(formData.child_price),
      };

      if (isEditing) {
        await toursService.updateTour(id, submitData);
        alert("อัปเดตข้อมูลเรียบร้อยแล้ว");
      } else {
        await toursService.addTour(submitData);
        alert("เพิ่มข้อมูลเรียบร้อยแล้ว");
      }

      navigate("/");
    } catch (error) {
      console.error("Error saving tour:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `คุณต้องการลบทัวร์ "${formData.tour_name}" หรือไม่?\n\nการลบนี้ไม่สามารถกู้คืนได้!`
      )
    ) {
      try {
        setLoading(true);
        await toursService.deleteTour(id);
        alert("ลบข้อมูลเรียบร้อยแล้ว");
        navigate("/");
      } catch (error) {
        console.error("Error deleting tour:", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  if (loading && isEditing) {
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
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? "แก้ไขราคาทัวร์" : "เพิ่มราคาทัวร์ใหม่"}
        </h1>
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← กลับ
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border p-6 space-y-6"
      >
        {/* Sub Agent Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ข้อมูล Sub Agent
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อ Sub Agent <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sub_agent_name"
                value={formData.sub_agent_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรอกชื่อ Sub Agent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ที่อยู่
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรอกที่อยู่"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-3">
            ช่องทางการติดต่อ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                Line
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

        {/* Tour Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ข้อมูลทัวร์
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรอกชื่อทัวร์"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ออกจาก
              </label>
              <input
                type="text"
                name="departure_from"
                value={formData.departure_from}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="จังหวัด/สถานที่ออกเดินทาง"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ท่าเรือ
              </label>
              <input
                type="text"
                name="pier"
                value={formData.pier}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ชื่อท่าเรือ"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ราคา Net (บาท)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ราคาผู้ใหญ่ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="adult_price"
                value={formData.adult_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ราคาเด็ก <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="child_price"
                value={formData.child_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ช่วงเวลาที่ราคานี้ใช้ได้
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่เริ่มต้น <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่สิ้นสุด <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">หมายเหตุ</h2>
          <div className="space-y-4">
            <div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมายเหตุเพิ่มเติม
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

        {/* File Upload Section - แสดงเฉพาะเมื่อแก้ไข */}
        {isEditing && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              เอกสารแนบ
            </h2>
            <div className="space-y-4">
              {/* File Upload */}
              <div>
                <FileUpload tourId={id} onFileUploaded={handleFileUploaded} />
              </div>

              {/* Existing Files */}
              {tourFiles.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">
                    ไฟล์ที่อัพโหลดแล้ว ({tourFiles.length} ไฟล์)
                  </h3>
                  <div className="space-y-2">
                    {tourFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
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
                              {file.file_size_formatted} •{" "}
                              {new Date(file.uploaded_at).toLocaleDateString(
                                "th-TH"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleViewFile(file)}
                            className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                          >
                            👁️ ดู
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.id)}
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
        )}

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading
              ? "กำลังบันทึก..."
              : isEditing
              ? "อัปเดตข้อมูล"
              : "บันทึกข้อมูล"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "กำลังลบ..." : "ลบรายการนี้"}
            </button>
          )}

          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPrice;
