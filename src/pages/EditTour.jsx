import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SubAgentAutocomplete from "../components/SubAgentAutocomplete";
import SubAgentModal from "../components/SubAgentModal";
import SubAgentFileUpload from "../components/SubAgentFileUpload";
import FileUpload from "../components/FileUpload";
import {
  toursService,
  subAgentsService,
  filesService,
  subAgentFilesService,
} from "../services/api-service";

const EditTour = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data states
  const [tour, setTour] = useState(null);
  const [selectedSubAgent, setSelectedSubAgent] = useState(null);
  const [subAgentFiles, setSubAgentFiles] = useState([]);
  const [tourFiles, setTourFiles] = useState([]);

  // Modal states
  const [showSubAgentModal, setShowSubAgentModal] = useState(false);
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
    notes: "",
    park_fee_included: false,
  });

  useEffect(() => {
    fetchTourData();
  }, [id]);

  useEffect(() => {
    if (selectedSubAgent) {
      loadSubAgentFiles();
    }
  }, [selectedSubAgent]);

  const fetchTourData = async () => {
    try {
      setLoading(true);

      // Fetch tour data
      const tours = await toursService.getAllTours();
      const tourData = tours.find((t) => t.id === id);

      if (tourData) {
        setTour(tourData);
        setFormData({
          tour_name: tourData.tour_name || "",
          departure_from: tourData.departure_from || "",
          pier: tourData.pier || "",
          adult_price: tourData.adult_price || "",
          child_price: tourData.child_price || "",
          start_date: tourData.start_date || "",
          end_date: tourData.end_date || "",
          notes: tourData.notes || "",
          park_fee_included: tourData.park_fee_included || false,
        });

        // Set sub agent if exists
        if (tourData.sub_agent_id && tourData.sub_agent_name) {
          setSelectedSubAgent({
            id: tourData.sub_agent_id,
            name: tourData.sub_agent_name,
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

  const loadSubAgentFiles = async () => {
    if (!selectedSubAgent) return;

    try {
      const files = await subAgentFilesService.getSubAgentFiles(
        selectedSubAgent.id
      );
      setSubAgentFiles(files);
    } catch (error) {
      console.error("Error loading sub agent files:", error);
    }
  };

  const handleSubAgentSelect = async (subAgent) => {
    setSelectedSubAgent(subAgent);
  };

  const handleCreateNewSubAgent = (name) => {
    setModalInitialName(name);
    setShowSubAgentModal(true);
  };

  const handleSubAgentCreated = (newSubAgent) => {
    setSelectedSubAgent(newSubAgent);
  };

  const handleSubAgentFileUploaded = (newFile) => {
    setSubAgentFiles((prev) => [newFile, ...prev]);
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

  const handleDeleteSubAgentFile = async (fileId) => {
    if (window.confirm("คุณต้องการลบไฟล์นี้หรือไม่?")) {
      try {
        await subAgentFilesService.deleteSubAgentFile(fileId);
        setSubAgentFiles((prev) => prev.filter((file) => file.id !== fileId));
      } catch (error) {
        console.error("Error deleting sub agent file:", error);
        alert("เกิดข้อผิดพลาดในการลบไฟล์");
      }
    }
  };

  const handleViewFile = (file, isSubAgentFile = false) => {
    const fileUrl = isSubAgentFile
      ? subAgentFilesService.getSubAgentFileUrl(file)
      : filesService.getFileUrl(file);
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
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.tour_name.trim()) {
        alert("กรุณากรอกชื่อทัวร์");
        setSaving(false);
        return;
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        sub_agent_id: selectedSubAgent?.id || null,
        adult_price: parseFloat(formData.adult_price) || 0,
        child_price: parseFloat(formData.child_price) || 0,
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
        {/* Sub Agent Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🏢 Sub Agent
          </h2>
          <SubAgentAutocomplete
            onSelect={handleSubAgentSelect}
            onCreateNew={handleCreateNewSubAgent}
            value={selectedSubAgent}
            placeholder="เลือกหรือเปลี่ยน Sub Agent..."
          />
        </div>

        {/* Tour Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🏝️ ข้อมูลทัวร์
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

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
          {/* Sub Agent Files */}
          {selectedSubAgent && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📎 ไฟล์ Sub Agent ({selectedSubAgent.name})
              </h2>

              <SubAgentFileUpload
                subAgentId={selectedSubAgent.id}
                onFileUploaded={handleSubAgentFileUploaded}
              />

              {subAgentFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">
                    ไฟล์ที่อัพโหลดแล้ว ({subAgentFiles.length} ไฟล์)
                  </h3>
                  <div className="space-y-2">
                    {subAgentFiles.map((file) => (
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
                              {file.file_size_formatted} • Sub Agent File
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
                            onClick={() => handleDeleteSubAgentFile(file.id)}
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
        </div>

        {/* Tour Files */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📎 ไฟล์เฉพาะทัวร์นี้
          </h2>

          <FileUpload tourId={id} onFileUploaded={handleTourFileUploaded} />

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

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saving ? "กำลังบันทึก..." : "💾 บันทึกการแก้ไข"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saving ? "กำลังลบ..." : "🗑️ ลบทัวร์นี้"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            ยกเลิก
          </button>
        </div>
      </form>

      {/* Modals */}
      <SubAgentModal
        isOpen={showSubAgentModal}
        onClose={() => setShowSubAgentModal(false)}
        onSuccess={handleSubAgentCreated}
        initialName={modalInitialName}
      />
    </div>
  );
};

export default EditTour;
