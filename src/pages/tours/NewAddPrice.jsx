import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SubAgentAutocomplete, MultiTourForm } from "../../components/forms";
import { SubAgentModal } from "../../components/modals";
import { SubAgentFileUpload } from "../../components/uploads";
import { toursService, subAgentFilesService } from "../../services/api-service";

const NewAddPrice = () => {
  const navigate = useNavigate();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Data states
  const [selectedSubAgent, setSelectedSubAgent] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showSubAgentModal, setShowSubAgentModal] = useState(false);
  const [modalInitialName, setModalInitialName] = useState("");

  const steps = [
    {
      id: 1,
      name: "เลือก Sub Agent",
      icon: "🏢",
      description: "เลือกหรือสร้าง Sub Agent",
    },
    {
      id: 2,
      name: "อัพโหลดไฟล์",
      icon: "📎",
      description: "อัพโหลด Contact Rate Files",
    },
    { id: 3, name: "เพิ่มทัวร์", icon: "🏝️", description: "เพิ่มรายการทัวร์" },
    { id: 4, name: "สรุป", icon: "📋", description: "ตรวจสอบและบันทึก" },
  ];

  // Step 1: Sub Agent Selection
  const handleSubAgentSelect = (subAgent) => {
    setSelectedSubAgent(subAgent);
    markStepCompleted(1);
  };

  const handleCreateNewSubAgent = (name) => {
    setModalInitialName(name);
    setShowSubAgentModal(true);
  };

  const handleSubAgentCreated = (newSubAgent) => {
    setSelectedSubAgent(newSubAgent);
    markStepCompleted(1);
  };

  // Step 2: File Upload
  const handleFileUploaded = async (newFile) => {
    setUploadedFiles((prev) => [newFile, ...prev]);
    markStepCompleted(2);
  };

  const loadSubAgentFiles = async () => {
    if (!selectedSubAgent) return;

    try {
      const files = await subAgentFilesService.getSubAgentFiles(
        selectedSubAgent.id
      );
      setUploadedFiles(files);
      if (files.length > 0) {
        markStepCompleted(2);
      }
    } catch (error) {
      console.error("Error loading files:", error);
    }
  };

  // Step 3: Tours Submission
  const handleToursSubmit = async (toursData) => {
    setLoading(true);

    try {
      const response = await toursService.addTours(toursData);
      console.log("Tours created:", response);

      alert(
        `✅ สร้างทัวร์สำเร็จ ${
          Array.isArray(response) ? response.length : 1
        } รายการ!`
      );
      navigate("/");
    } catch (error) {
      console.error("Error creating tours:", error);
      alert("เกิดข้อผิดพลาดในการสร้างทัวร์: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const markStepCompleted = (stepId) => {
    setCompletedSteps((prev) => [...new Set([...prev, stepId])]);
  };

  const goToStep = (stepId) => {
    if (stepId === 1 || completedSteps.includes(stepId - 1)) {
      setCurrentStep(stepId);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepAccessible = (stepId) => {
    return stepId === 1 || completedSteps.includes(stepId - 1);
  };

  const isStepCompleted = (stepId) => {
    return completedSteps.includes(stepId);
  };

  // Load files when sub agent changes
  useEffect(() => {
    if (selectedSubAgent) {
      loadSubAgentFiles();
    }
  }, [selectedSubAgent]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            เพิ่มราคาทัวร์ใหม่
          </h1>
          <p className="text-gray-600 mt-1">
            ระบบใหม่: เลือก Sub Agent → อัพโหลดไฟล์ → เพิ่มหลายทัวร์
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← กลับ
        </button>
      </div>

      {/* Step Progress */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors cursor-pointer ${
                  currentStep === step.id
                    ? "border-blue-500 bg-blue-500 text-white"
                    : isStepCompleted(step.id)
                    ? "border-green-500 bg-green-500 text-white"
                    : isStepAccessible(step.id)
                    ? "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
                    : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                onClick={() => isStepAccessible(step.id) && goToStep(step.id)}
              >
                {isStepCompleted(step.id) ? (
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="text-lg">{step.icon}</span>
                )}
              </div>

              {/* Step Info */}
              <div className="ml-3 hidden md:block">
                <p
                  className={`text-sm font-medium ${
                    currentStep === step.id
                      ? "text-blue-600"
                      : isStepCompleted(step.id)
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {step.name}
                </p>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    isStepCompleted(step.id) ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          {/* Step 1: Sub Agent Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center pb-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  🏢 เลือกหรือสร้าง Sub Agent
                </h2>
                <p className="text-gray-600">
                  เริ่มต้นด้วยการเลือก Sub Agent ที่จะเพิ่มทัวร์
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <SubAgentAutocomplete
                  onSelect={handleSubAgentSelect}
                  onCreateNew={handleCreateNewSubAgent}
                  value={selectedSubAgent}
                  placeholder="ค้นหา Sub Agent หรือสร้างใหม่..."
                />

                {selectedSubAgent && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">
                      ✅ Sub Agent ที่เลือก:
                    </h3>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>ชื่อ:</strong> {selectedSubAgent.name}
                      </p>
                      {selectedSubAgent.phone && (
                        <p>
                          <strong>โทร:</strong> {selectedSubAgent.phone}
                        </p>
                      )}
                      {selectedSubAgent.line && (
                        <p>
                          <strong>Line:</strong> {selectedSubAgent.line}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={nextStep}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      ถัดไป: อัพโหลดไฟล์ →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: File Upload */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center pb-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  📎 อัพโหลด Contact Rate Files
                </h2>
                <p className="text-gray-600">
                  อัพโหลดไฟล์ Contact Rate และเอกสารที่เกี่ยวข้อง
                </p>
              </div>

              <SubAgentFileUpload
                subAgentId={selectedSubAgent?.id}
                onFileUploaded={handleFileUploaded}
              />

              {uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    📁 ไฟล์ที่อัพโหลดแล้ว ({uploadedFiles.length} ไฟล์)
                  </h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
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
                              {file.label || file.original_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file.file_size_formatted} •{" "}
                              {new Date(file.uploaded_at).toLocaleDateString(
                                "th-TH"
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={prevStep}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      ← ย้อนกลับ
                    </button>
                    <button
                      onClick={nextStep}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      ถัดไป: เพิ่มทัวร์ →
                    </button>
                  </div>
                </div>
              )}

              {uploadedFiles.length === 0 && (
                <div className="text-center py-4">
                  <button
                    onClick={nextStep}
                    className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    ข้าม: เพิ่มทัวร์ก่อน →
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    (สามารถอัพโหลดไฟล์ทีหลังได้)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Tours Form */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center pb-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  🏝️ เพิ่มรายการทัวร์
                </h2>
                <p className="text-gray-600">
                  เพิ่มทัวร์หลายรายการสำหรับ {selectedSubAgent?.name}
                </p>
              </div>

              <MultiTourForm
                onSubmit={handleToursSubmit}
                loading={loading}
                subAgentId={selectedSubAgent?.id}
              />

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={prevStep}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  ← ย้อนกลับ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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

export default NewAddPrice;
