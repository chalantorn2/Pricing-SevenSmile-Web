import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Paperclip,
  Palmtree,
  ClipboardList,
  CheckCircle2,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { TourMultiForm, ShareGalleryManager } from "../../components/tours";
import { SupplierAutocomplete } from "../../components/suppliers";
import { SupplierModal } from "../../components/suppliers";
import SupplierFileUpload from "../../components/suppliers/SupplierFileUpload";
import {
  toursService,
  supplierFilesService,
  filesService,
  authService,
} from "../../services/api-service";
import { getTourTypeLabel } from "../../utils/tour-types";
import { useI18n } from "../../i18n";

const AddTour = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Data states
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [supplierTours, setSupplierTours] = useState([]);
  const [loadingSupplierTours, setLoadingSupplierTours] = useState(false);
  const [loading, setLoading] = useState(false);
  // Tours staged in step 3, reviewed in step 4 before the final save
  const [pendingTours, setPendingTours] = useState(null);

  // Modal states
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [modalInitialName, setModalInitialName] = useState("");

  const steps = [
    {
      id: 1,
      name: t("tour.add.stepSupplier"),
      Icon: Building2,
      description: t("tour.add.stepSupplierDesc"),
    },
    {
      id: 2,
      name: t("tour.add.stepFiles"),
      Icon: Paperclip,
      description: t("tour.add.stepFilesDesc"),
    },
    { id: 3, name: t("tour.add.stepTours"), Icon: Palmtree, description: t("tour.add.stepToursDesc") },
    { id: 4, name: t("tour.add.stepSummary"), Icon: ClipboardList, description: t("tour.add.stepSummaryDesc") },
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

  // Load the supplier's existing tours so users can reference them while
  // adding new ones (read-only — Add Tour only ever creates new records).
  const loadSupplierTours = async () => {
    if (!selectedSupplier) return;

    setLoadingSupplierTours(true);
    try {
      const allTours = await toursService.getAllTours();
      const tours = (allTours || []).filter(
        (t) => String(t.supplier_id) === String(selectedSupplier.id)
      );
      setSupplierTours(tours);
    } catch (error) {
      console.error("Error loading supplier tours:", error);
      setSupplierTours([]);
    } finally {
      setLoadingSupplierTours(false);
    }
  };

  // Step 3: stage the tours and move to the summary instead of saving directly
  const handleToursReview = (toursData) => {
    setPendingTours(toursData);
    markStepCompleted(3);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 4: confirm and save the staged tours
  const handleConfirmSave = async () => {
    if (!pendingTours) return;
    setLoading(true);

    // Pull staged per-tour files out before sending tour data to the API
    const { tourFiles = [], ...toursPayload } = pendingTours;

    try {
      const response = await toursService.addTours(toursPayload);
      console.log("Tours created:", response);

      // Normalize: API returns a single object for one tour, array for many
      const createdTours = Array.isArray(response) ? response : [response];

      // Upload staged files for each tour (index matches submission order)
      const uploadResult = await uploadStagedFiles(createdTours, tourFiles);

      if (uploadResult.failed > 0) {
        alert(
          t("tour.createPartial", { count: createdTours.length, failed: uploadResult.failed })
        );
      } else {
        alert(t("tour.createSuccess", { count: createdTours.length }));
      }
      navigate("/tours");
    } catch (error) {
      console.error("Error creating tours:", error);
      alert(t("tour.upload.error", { message: error.message }));
    } finally {
      setLoading(false);
    }
  };

  // Upload staged brochure/gallery files for each created tour
  const uploadStagedFiles = async (createdTours, tourFiles) => {
    const currentUser = authService.getCurrentUser();
    const uploadedBy = currentUser?.username || "Unknown";
    let failed = 0;

    for (let i = 0; i < createdTours.length; i++) {
      const tourId = createdTours[i]?.id;
      const staged = tourFiles[i];
      if (!tourId || !staged) continue;

      const jobs = [
        ...(staged.brochure || []).map((file) => ({
          file,
          category: "brochure",
        })),
        ...(staged.brochure_supplier || []).map((file) => ({
          file,
          category: "brochure_supplier",
        })),
        ...(staged.gallery || []).map((file) => ({
          file,
          category: "gallery",
        })),
      ];

      for (const job of jobs) {
        try {
          await filesService.uploadTourFile(
            tourId,
            job.file,
            job.category,
            uploadedBy
          );
        } catch (err) {
          console.error(
            `Failed to upload ${job.category} file for tour ${tourId}:`,
            err
          );
          failed++;
        }
      }
    }

    return { failed };
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

  // Load files and existing tours when supplier changes
  useEffect(() => {
    if (selectedSupplier) {
      loadSupplierFiles();
      loadSupplierTours();
    } else {
      setSupplierTours([]);
    }
  }, [selectedSupplier]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("tour.addTitle")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("tour.addSubtitle")}
          </p>
        </div>
        <button
          onClick={() => navigate("/tours")}
          className="flex items-center gap-1.5 px-4 py-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
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
                    ? "border-brand-500 bg-brand-600 text-white"
                    : isStepCompleted(step.id)
                    ? "border-success-500 bg-success-600 text-white"
                    : isStepAccessible(step.id)
                    ? "border-gray-300 bg-white text-gray-700 hover:border-brand-200"
                    : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                onClick={() => isStepAccessible(step.id) && goToStep(step.id)}
              >
                {isStepCompleted(step.id) ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <step.Icon className="w-5 h-5" />
                )}
              </div>

              {/* Step Info */}
              <div className="ml-3 hidden md:block">
                <p
                  className={`text-sm font-medium ${
                    currentStep === step.id
                      ? "text-brand-600"
                      : isStepCompleted(step.id)
                      ? "text-success-600"
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
                    isStepCompleted(step.id) ? "bg-success-600" : "bg-gray-200"
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
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b">
                <Building2 className="w-5 h-5 text-brand-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("tour.add.selectSupplier")}
                </h2>
              </div>

              <div className="max-w-2xl mx-auto">
                <SupplierAutocomplete
                  onSelect={handleSupplierSelect}
                  onCreateNew={handleCreateNewSupplier}
                  value={selectedSupplier}
                  placeholder={t("tour.placeholder.searchSupplier")}
                />

                {selectedSupplier && (
                  <div className="mt-4 flex items-center justify-between gap-3 bg-success-50 border border-success-200 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckCircle2 className="w-5 h-5 text-success-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {selectedSupplier.name}
                        </p>
                        {(selectedSupplier.phone || selectedSupplier.line) && (
                          <p className="text-xs text-gray-500 truncate">
                            {[
                              selectedSupplier.phone,
                              selectedSupplier.line &&
                                `Line: ${selectedSupplier.line}`,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedSupplier(null)}
                      className="text-sm text-gray-500 hover:text-gray-700 shrink-0"
                    >
                      {t("common.change")}
                    </button>
                  </div>
                )}
              </div>

              {selectedSupplier && (
                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
                  >
                    {t("tour.add.nextFiles")}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: File Upload */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b">
                <Paperclip className="w-5 h-5 text-brand-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("tour.add.uploadRates")}
                </h2>
              </div>

              <SupplierFileUpload
                supplierId={selectedSupplier?.id}
                onFileUploaded={handleFileUploaded}
              />

              {uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="flex items-center gap-1.5 font-semibold text-gray-900">
                    <FolderOpen className="w-4 h-4 text-gray-500" />
                    {t("tour.add.uploadedFiles", { count: uploadedFiles.length })}
                  </h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center space-x-3">
                          {file.file_type === "pdf" ? (
                            <FileText className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {file.label || file.original_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file.file_size_formatted} •{" "}
                              {new Date(file.uploaded_at).toLocaleDateString(
                                lang === "th" ? "th-TH" : "en-US"
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
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {t("common.back")}
                    </button>
                    <button
                      onClick={nextStep}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                    >
                      {t("tour.add.nextTours")}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {uploadedFiles.length === 0 && (
                <div className="text-center py-4">
                  <button
                    onClick={nextStep}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    {t("tour.add.skipFiles")}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    {t("tour.add.uploadLater")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Tours Form (kept mounted on step 4 so going Back preserves input) */}
          {(currentStep === 3 || currentStep === 4) && (
            <div className={`space-y-5 ${currentStep === 4 ? "hidden" : ""}`}>
              <div className="flex items-center gap-2 pb-4 border-b">
                <Palmtree className="w-5 h-5 text-brand-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("tour.add.items")}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    {t("common.for")} {selectedSupplier?.name}
                  </span>
                </h2>
              </div>

              {/* Existing tours for this supplier (read-only reference) */}
              {loadingSupplierTours ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border rounded-lg px-4 py-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300" />
                  {t("tour.add.loadingExisting")}
                </div>
              ) : (
                supplierTours.length > 0 && (
                  <div className="border border-brand-200 bg-brand-50/50 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-brand-50 border-b border-brand-200">
                      <Palmtree className="w-4 h-4 text-brand-600" />
                      <h3 className="text-sm font-semibold text-gray-900">
                        {t("tour.add.existingFor", {
                          name: selectedSupplier?.name || "",
                          count: supplierTours.length,
                        })}
                      </h3>
                      <span className="ml-auto text-xs text-gray-500">
                        {t("tour.add.referenceHint")}
                      </span>
                    </div>
                    <div className="max-h-56 overflow-y-auto divide-y divide-brand-200">
                      {supplierTours.map((tour) => (
                        <div
                          key={tour.id}
                          className="flex items-center gap-3 px-4 py-2 text-sm"
                        >
                          <span className="font-medium text-gray-900 truncate flex-1">
                            {tour.tour_name}
                          </span>
                          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-white border text-gray-500">
                            {getTourTypeLabel(tour.tour_type)}
                          </span>
                          {tour.destination && (
                            <span className="shrink-0 text-xs text-gray-500 hidden sm:inline">
                              {tour.destination}
                            </span>
                          )}
                          <span className="shrink-0 text-xs text-gray-500 tabular-nums w-28 text-right">
                            ฿{Number(tour.adult_price || 0).toLocaleString()} /
                            ฿{Number(tour.child_price || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* Share Gallery Manager - Show only if we have created tours */}
              {completedSteps.includes(3) && (
                <div className="mb-6">
                  <ShareGalleryManager
                    currentTourId={null} // For new tours, we'll handle this differently
                    onGalleryShared={() => {
                      alert(
                        t("tour.gallery.saveFirst")
                      );
                    }}
                  />
                </div>
              )}

              <TourMultiForm
                onSubmit={handleToursReview}
                loading={loading}
                supplierId={selectedSupplier?.id}
                  submitLabel={t("tour.add.reviewContinue")}
              />

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={prevStep}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("common.back")}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {currentStep === 4 && pendingTours && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b">
                <ClipboardList className="w-5 h-5 text-brand-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("tour.add.review")}
                </h2>
              </div>

              {/* Supplier */}
              <div className="flex items-center gap-3 bg-gray-50 border rounded-lg px-4 py-3">
                <Building2 className="w-5 h-5 text-brand-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">{t("tour.field.supplier")}</p>
                  <p className="font-medium text-gray-900 truncate">
                    {selectedSupplier?.name}
                  </p>
                </div>
              </div>

              {/* Contract rate files */}
              <div className="flex items-center gap-3 bg-gray-50 border rounded-lg px-4 py-3">
                <Paperclip className="w-5 h-5 text-brand-600 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">{t("tour.field.rateFiles")}</p>
                  <p className="font-medium text-gray-900">
                    {t("document.fileCount", { count: uploadedFiles.length })}
                  </p>
                </div>
              </div>

              {/* Tours — one card each for easy review */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palmtree className="w-4 h-4 text-brand-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    {t("tour.add.createCount", { count: pendingTours.tours.length })}
                  </h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {pendingTours.tours.map((tour, index) => {
                    const parkFee = tour.park_fee_included
                      ? t("tour.includedInPrice")
                      : tour.park_fee_adult || tour.park_fee_child
                      ? `฿${Number(
                          tour.park_fee_adult || 0
                        ).toLocaleString()} / ฿${Number(
                          tour.park_fee_child || 0
                        ).toLocaleString()}`
                      : "—";
                    return (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 space-y-2.5"
                      >
                        {/* Title row */}
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-brand-50 text-brand-600 text-xs font-semibold">
                            {index + 1}
                          </span>
                          <p className="font-semibold text-gray-900 flex-1 break-words">
                            {tour.tour_name}
                          </p>
                          <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            {getTourTypeLabel(tour.tour_type)}
                          </span>
                        </div>

                        {/* Detail grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm pl-8">
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="text-gray-400 w-28 shrink-0">
                              {t("common.price")}
                            </span>
                            <span className="font-medium tabular-nums">
                              ฿{Number(tour.adult_price || 0).toLocaleString()} /
                              ฿{Number(tour.child_price || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="text-gray-400 w-28 shrink-0">
                              {t("tour.parkFee")}
                            </span>
                            <span className="truncate">{parkFee}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="text-gray-400 w-28 shrink-0">
                              {t("tour.field.departureFrom")}
                            </span>
                            <span className="truncate">
                              {tour.departure_from || "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="text-gray-400 w-28 shrink-0">
                              {t("tour.field.destination")}
                            </span>
                            <span className="truncate">
                              {tour.destination || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={prevStep}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("common.back")}
                </button>
                <button
                  onClick={handleConfirmSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>{t("tour.saving")}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        {t("tour.add.saveAll", { count: pendingTours.tours.length })}
                      </span>
                    </>
                  )}
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
