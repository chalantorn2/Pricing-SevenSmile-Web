import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  X,
  Eye,
  Download,
  FolderOpen,
  FileText,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Layers,
} from "lucide-react";
import { filesService, supplierFilesService } from "../../services/api-service";
import {
  getTourCategoryInfo,
  getSupplierCategoryInfo,
} from "../../utils/file-categories";
import { useI18n } from "../../i18n";

const CATEGORY_ORDER = [
  "contact_rate",
  "qr_code",
  "brochure",
  "brochure_supplier",
  "general",
  "gallery",
];

const resolveFileUrl = (file) =>
  file.source === "supplier"
    ? supplierFilesService.getSupplierFileUrl(file)
    : filesService.getFileUrl(file);

const getDisplayName = (file) => {
  if (file.source === "supplier" && file.label && file.label.trim()) {
    return file.label;
  }
  return file.original_name;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Thumbnail = ({ file, onOpen }) => {
  const { t } = useI18n();
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const name = getDisplayName(file);

  return (
    <button
      type="button"
      onClick={onOpen}
      title={name}
      aria-label={t("common.viewNamed", { name })}
      className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-200"
    >
      {broken ? (
        <span className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-1">
          <ImageOff className="h-6 w-6" />
          <span className="text-[10px] px-1 truncate max-w-full">
            {t("document.unavailable")}
          </span>
        </span>
      ) : (
        <>
          {!loaded && (
            <span className="absolute inset-0 animate-pulse bg-gray-200" />
          )}
          <img
            src={resolveFileUrl(file)}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setBroken(true)}
          />
        </>
      )}
    </button>
  );
};

const DocumentModal = ({ isOpen, onClose, tour }) => {
  const { t } = useI18n();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState(null); // { files: [], index: number }
  const [activeTab, setActiveTab] = useState("all"); // "all" or a group key
  const requestRef = useRef(0);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const stepLightbox = useCallback((delta) => {
    setLightbox((current) => {
      if (!current) return current;
      const total = current.files.length;
      return { ...current, index: (current.index + delta + total) % total };
    });
  }, []);

  // Load files whenever the modal opens for a tour
  useEffect(() => {
    if (!isOpen || !tour) return;

    const requestId = ++requestRef.current;
    setFiles([]);
    setError(null);
    setLightbox(null);
    setActiveTab("all");
    setLoading(true);

    const load = async () => {
      try {
        const [tourFiles, supplierFiles] = await Promise.all([
          filesService.getTourFiles(tour.id),
          tour.supplier_id
            ? supplierFilesService.getSupplierFiles(tour.supplier_id)
            : Promise.resolve([]),
        ]);

        if (requestId !== requestRef.current) return;

        setFiles([
          ...supplierFiles.map((file) => ({ ...file, source: "supplier" })),
          ...tourFiles.map((file) => ({ ...file, source: "tour" })),
        ]);
      } catch (err) {
        if (requestId !== requestRef.current) return;
        console.error("Error fetching files:", err);
        setError(err.message || t("document.loadError"));
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    };

    load();
  }, [isOpen, tour]);

  // Lock background scroll while the modal is open
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Keyboard: Escape closes the lightbox first, then the modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (lightbox) closeLightbox();
        else onClose();
        return;
      }
      if (!lightbox || lightbox.files.length < 2) return;
      if (event.key === "ArrowLeft") stepLightbox(-1);
      if (event.key === "ArrowRight") stepLightbox(1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, lightbox, onClose, closeLightbox, stepLightbox]);

  const handleViewFile = (file) => {
    if (file.file_type === "image") {
      setLightbox({ files: [file], index: 0 });
    } else {
      window.open(resolveFileUrl(file), "_blank", "noopener");
    }
  };

  const handleDownloadFile = (file) => {
    const link = document.createElement("a");
    link.href = resolveFileUrl(file);
    link.download = file.original_name || getDisplayName(file);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Group by source + category, each group split into images and documents
  const fileGroups = useMemo(() => {
    const groups = new Map();

    files.forEach((file) => {
      const category = file.file_category || "general";
      const key = `${file.source}::${category}`;

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          source: file.source,
          category,
          categoryInfo:
            file.source === "supplier"
              ? getSupplierCategoryInfo(category)
              : getTourCategoryInfo(category),
          images: [],
          documents: [],
        });
      }

      const group = groups.get(key);
      if (file.file_type === "image") group.images.push(file);
      else group.documents.push(file);
    });

    const rank = (category) => {
      const index = CATEGORY_ORDER.indexOf(category);
      return index === -1 ? CATEGORY_ORDER.length : index;
    };

    return [...groups.values()].sort((a, b) => {
      if (a.source !== b.source) return a.source === "supplier" ? -1 : 1;
      return rank(a.category) - rank(b.category);
    });
  }, [files]);

  const imageCount = files.filter((file) => file.file_type === "image").length;
  const documentCount = files.length - imageCount;

  // Fall back to "all" if the selected category no longer exists
  const effectiveTab = fileGroups.some((group) => group.key === activeTab)
    ? activeTab
    : "all";
  const visibleGroups =
    effectiveTab === "all"
      ? fileGroups
      : fileGroups.filter((group) => group.key === effectiveTab);

  if (!isOpen || !tour) return null;

  const activeImage = lightbox ? lightbox.files[lightbox.index] : null;

  return (
    <div className="modal-backdrop">
      <div
        className="modal-overlay"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("document.attachments")}
          className="modal-content document-modal-large bg-white rounded-lg shadow-xl flex flex-col"
          style={{ overflow: "hidden" }}
        >
          {/* Header */}
          <div className="modal-header border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between gap-4 shrink-0">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-gray-900">
                {t("document.attachments")}
              </h2>
              <p className="text-sm text-gray-500 mt-1 truncate">
                {tour.tour_name}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label={t("document.closeAttachments")}
              className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Category tabs */}
          {!loading && !error && fileGroups.length > 0 && (
            <div
              role="tablist"
              aria-label={t("document.categories")}
              className="border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto shrink-0"
            >
              <button
                role="tab"
                aria-selected={effectiveTab === "all"}
                onClick={() => setActiveTab("all")}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm whitespace-nowrap transition-colors ${
                  effectiveTab === "all"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Layers className="h-4 w-4" />
                {t("common.all")}
                <span className="text-xs opacity-75">({files.length})</span>
              </button>

              {fileGroups.map((group) => {
                const CategoryIcon = group.categoryInfo.icon;
                const total = group.images.length + group.documents.length;
                const isActive = effectiveTab === group.key;

                return (
                  <button
                    key={group.key}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(group.key)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm whitespace-nowrap transition-colors ${
                      isActive
                        ? `${group.categoryInfo.color} border-current font-medium`
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <CategoryIcon className="h-4 w-4" />
                    {group.categoryInfo.label}
                    <span className="text-xs opacity-75">
                      {group.source === "supplier" ? t("tour.field.supplier") : t("nav.tours")} (
                      {total})
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">{t("document.loading")}</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-danger-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("document.loadError")}
                </h3>
                <p className="text-gray-500">{error}</p>
              </div>
            ) : files.length > 0 ? (
              <div className="space-y-8">
                {visibleGroups.map((group) => {
                  const CategoryIcon = group.categoryInfo.icon;
                  const total = group.images.length + group.documents.length;

                  return (
                    <div key={group.key}>
                      {/* Category header (the tab already labels a filtered view) */}
                      <div
                        className={`flex-wrap items-center gap-3 mb-4 ${
                          effectiveTab === "all" ? "flex" : "hidden"
                        }`}
                      >
                        <div
                          className={`inline-flex items-center px-3 py-2 rounded-lg ${group.categoryInfo.color} border`}
                        >
                          <CategoryIcon className="mr-2 h-5 w-5" />
                          <span className="font-medium">
                            {group.categoryInfo.label}
                          </span>
                          <span className="ml-2 text-xs opacity-75">
                            ({group.source === "supplier" ? t("tour.field.supplier") : t("nav.tours")}
                            )
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {t("document.fileCount", { count: total })}
                        </span>
                      </div>

                      {/* Images */}
                      {group.images.length > 0 && (
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{t("document.openImage")}</span>
                            <span>{t("common.imageCount", { count: group.images.length })}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {group.images.map((file, index) => (
                              <Thumbnail
                                key={file.id}
                                file={file}
                                onOpen={() =>
                                  setLightbox({ files: group.images, index })
                                }
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Documents */}
                      {group.documents.length > 0 && (
                        <div className="space-y-3">
                          {group.documents.map((file) => (
                            <div
                              key={file.id}
                              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-start gap-3 min-w-0">
                                  <FileText className="h-6 w-6 text-gray-400 shrink-0 mt-0.5" />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <h4
                                        className="font-medium text-gray-900 truncate"
                                        title={getDisplayName(file)}
                                      >
                                        {getDisplayName(file)}
                                      </h4>
                                      <span
                                        className={`px-2 py-1 text-xs rounded-full shrink-0 ${
                                          file.source === "supplier"
                                            ? "bg-brand-100 text-brand-700"
                                            : "bg-success-100 text-success-700"
                                        }`}
                                      >
                                        {file.source === "supplier"
                                          ? t("tour.field.supplier")
                                          : t("nav.tours")}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 mt-0.5">
                                      <span>{file.file_size_formatted}</span>
                                      <span>&middot;</span>
                                      <span>
                                        {t("document.uploadedOn", {
                                          date: formatDate(file.uploaded_at),
                                        })}
                                      </span>
                                      {file.uploaded_by && (
                                        <>
                                          <span>&middot;</span>
                                          <span>{t("document.by", { name: file.uploaded_by })}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => handleViewFile(file)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors text-sm"
                                  >
                                    <Eye className="h-4 w-4" />
                                    {t("document.view")}
                                  </button>
                                  <button
                                    onClick={() => handleDownloadFile(file)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors text-sm"
                                  >
                                    <Download className="h-4 w-4" />
                                    {t("document.download")}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("document.empty")}
                </h3>
                <p className="text-gray-500">
                  {t("document.emptyHint")}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-t border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center gap-4 shrink-0">
            <div className="text-sm text-gray-500">
              {files.length > 0
                ? t("document.summary", {
                    documents: documentCount,
                    images: imageCount,
                  })
                : t("document.noDocuments")}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors shrink-0"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {activeImage && (
        <div
          className="modal-backdrop flex items-center justify-center z-50 p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-auto h-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={resolveFileUrl(activeImage)}
              alt={getDisplayName(activeImage)}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-xl"
            />

            <button
              onClick={closeLightbox}
              aria-label={t("document.closeImage")}
              className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 rounded-full w-10 h-10 flex items-center justify-center transition-all shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>

            {lightbox.files.length > 1 && (
              <>
                <button
                  onClick={() => stepLightbox(-1)}
                  aria-label={t("document.previousImage")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 rounded-full w-10 h-10 flex items-center justify-center transition-all shadow-lg"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => stepLightbox(1)}
                  aria-label={t("document.nextImage")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-900 rounded-full w-10 h-10 flex items-center justify-center transition-all shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white text-xs px-3 py-1.5 rounded-full">
                  {lightbox.index + 1} / {lightbox.files.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentModal;
