import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TourMultiForm, ShareGalleryManager } from "../../components/tours";
import { SupplierAutocomplete } from "../../components/suppliers";
import { SupplierModal } from "../../components/suppliers";
import SupplierFileUpload from "../../components/suppliers/SupplierFileUpload";
import { toursService, supplierFilesService } from "../../services/api-service";

const AddTour = () => {
  const navigate = useNavigate();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Data states
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [modalInitialName, setModalInitialName] = useState("");

  const steps = [
    {
      id: 1,
      name: "Select Supplier",
      icon: "🏢",
      description: "Select or create a Supplier",
    },
    {
      id: 2,
      name: "Upload files",
      icon: "📎",
      description: "Upload Contact Rate Files",
    },
    { id: 3, name: "Add tours", icon: "🏝️", description: "Add tour items" },
    { id: 4, name: "Summary", icon: "📋", description: "Review and save" },
  ];

  // Step 1: Supplier Selection
  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier);
    markStepCompleted(1);
  };

  const handleCreateNewSupplier = (name) => {
    setModalInitialName(name);
    setShowSupplierModal(true);
  };

  const handleSupplierCreated = (newSupplier) => {
    setSelectedSupplier(newSupplier);
    markStepCompleted(1);
  };

  // Step 2: File Upload
  const handleFileUploaded = async (newFile) => {
    setUploadedFiles((prev) => [newFile, ...prev]);
    markStepCompleted(2);
  };

  const loadSupplierFiles = async () => {
    if (!selectedSupplier) return;

    try {
      const files = await supplierFilesService.getSupplierFiles(
        selectedSupplier.id
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
        `✅ Successfully created ${
          Array.isArray(response) ? response.length : 1
        } tours!`
      );
      navigate("/");
    } catch (error) {
      console.error("Error creating tours:", error);
      alert("An error occurred while creating tours: " + error.message);
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

  // Load files when supplier changes
  useEffect(() => {
    if (selectedSupplier) {
      loadSupplierFiles();
    }
  }, [selectedSupplier]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Add New Tour Prices
          </h1>
          <p className="text-gray-600 mt-1">
            New flow: select Supplier → upload files → add multiple tours
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back
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
          {/* Step 1: Supplier Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center pb-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  🏢 Select or create a Supplier
                </h2>
                <p className="text-gray-600">
                  Start by selecting the Supplier to add tours for
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <SupplierAutocomplete
                  onSelect={handleSupplierSelect}
                  onCreateNew={handleCreateNewSupplier}
                  value={selectedSupplier}
                  placeholder="Search for a Supplier or create a new one..."
                />

                {selectedSupplier && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">
                      ✅ Selected Supplier:
                    </h3>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>Name:</strong> {selectedSupplier.name}
                      </p>
                      {selectedSupplier.phone && (
                        <p>
                          <strong>Phone:</strong> {selectedSupplier.phone}
                        </p>
                      )}
                      {selectedSupplier.line && (
                        <p>
                          <strong>Line:</strong> {selectedSupplier.line}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={nextStep}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Next: Upload files →
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
                  📎 Upload Contact Rate Files
                </h2>
                <p className="text-gray-600">
                  Upload Contact Rate files and related documents
                </p>
              </div>

              <SupplierFileUpload
                supplierId={selectedSupplier?.id}
                onFileUploaded={handleFileUploaded}
              />

              {uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    📁 Uploaded files ({uploadedFiles.length} files)
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
                                "en-US"
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
                      ← Back
                    </button>
                    <button
                      onClick={nextStep}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Next: Add tours →
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
                    Skip: Add tours first →
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    (You can upload files later)
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
                  🏝️ Add tour items
                </h2>
                <p className="text-gray-600">
                  Add multiple tours for {selectedSupplier?.name}
                </p>
              </div>

              {/* Share Gallery Manager - Show only if we have created tours */}
              {completedSteps.includes(3) && (
                <div className="mb-6">
                  <ShareGalleryManager
                    currentTourId={null} // For new tours, we'll handle this differently
                    onGalleryShared={() => {
                      alert(
                        "To use Gallery image sharing, please save the tour first, then use this feature on the edit page"
                      );
                    }}
                  />
                </div>
              )}

              <TourMultiForm
                onSubmit={handleToursSubmit}
                loading={loading}
                supplierId={selectedSupplier?.id}
              />

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={prevStep}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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

export default AddTour;
