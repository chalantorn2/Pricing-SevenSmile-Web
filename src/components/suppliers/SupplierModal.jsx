import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  ChevronDown,
  AlertTriangle,
  User,
  Phone,
  FolderOpen,
} from "lucide-react";
import {
  suppliersService,
  supplierFilesService,
} from "../../services/api-service";
import SupplierFileUpload from "./SupplierFileUpload";
import { FileDownloads } from "../common";
import { useI18n } from "../../i18n";

// A supplier is one kind or the other — the tour vendors and the transfer
// companies are separate businesses, and nothing appears in both lists.
const SUPPLIER_TYPES = [
  { value: "tour", labelKey: "nav.tours", hintKey: "suppliers.typeTourHint" },
  { value: "transfer", labelKey: "nav.transfers", hintKey: "suppliers.typeTransferHint" },
];

const SupplierModal = ({
  isOpen,
  onClose,
  onSuccess,
  onDelete,
  initialName = "",
  supplier = null,
  isEdit = false,
  // Which list a new supplier joins: "tour" or "transfer". They are different
  // companies, so the screen that opened this modal decides, and editing keeps
  // whatever the supplier already is.
  defaultType = "tour",
}) => {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form data state - added phone fields
  const [formData, setFormData] = useState({
    name: initialName,
    type: defaultType,
    address: "",
    phone: "",
    phone_2: "",
    phone_3: "",
    phone_4: "",
    phone_5: "",
    line: "",
    facebook: "",
    whatsapp: "",
    website: "",
    email: "",
  });

  // Phone fields management for dynamic UI
  const [visiblePhoneFields, setVisiblePhoneFields] = useState(1); // show the first field

  // File management states
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesSectionOpen, setFilesSectionOpen] = useState(false);

  // Update form data when supplier prop changes
  useEffect(() => {
    if (isEdit && supplier) {
      setFormData({
        name: supplier.name || "",
        type: supplier.type || "tour",
        address: supplier.address || "",
        phone: supplier.phone || "",
        phone_2: supplier.phone_2 || "",
        phone_3: supplier.phone_3 || "",
        phone_4: supplier.phone_4 || "",
        phone_5: supplier.phone_5 || "",
        line: supplier.line || "",
        facebook: supplier.facebook || "",
        whatsapp: supplier.whatsapp || "",
        website: supplier.website || "",
        email: supplier.email || "",
      });

      // Calculate how many phone fields to show
      const phoneFields = [
        supplier.phone,
        supplier.phone_2,
        supplier.phone_3,
        supplier.phone_4,
        supplier.phone_5,
      ];
      const lastFilledIndex = phoneFields.findLastIndex((phone) =>
        phone?.trim()
      );
      setVisiblePhoneFields(Math.max(1, lastFilledIndex + 1));

      // Load files for existing supplier
      if (supplier.id) {
        loadSupplierFiles(supplier.id);
      }
    } else {
      setFormData({
        name: initialName,
        type: defaultType,
        address: "",
        phone: "",
        phone_2: "",
        phone_3: "",
        phone_4: "",
        phone_5: "",
        line: "",
        facebook: "",
        whatsapp: "",
        website: "",
        email: "",
      });
      setVisiblePhoneFields(1);
      setFiles([]);
    }
  }, [isEdit, supplier, initialName, defaultType]);

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

  // Manage adding/removing phone fields
  const addPhoneField = () => {
    if (visiblePhoneFields < 5) {
      setVisiblePhoneFields(visiblePhoneFields + 1);
    }
  };

  const removePhoneField = (index) => {
    if (visiblePhoneFields > 1) {
      // Clear the data in the field being hidden
      const phoneFieldName = index === 0 ? "phone" : `phone_${index + 1}`;
      setFormData((prev) => ({
        ...prev,
        [phoneFieldName]: "",
      }));

      setVisiblePhoneFields(visiblePhoneFields - 1);
    }
  };

  // Phone field data for rendering
  const phoneFields = [
    { key: "phone", label: t("suppliers.primaryPhone"), placeholder: "0xx-xxx-xxxx" },
    {
      key: "phone_2",
      label: t("suppliers.phoneNumber", { number: 2 }),
      placeholder: "0xx-xxx-xxxx ",
    },
    { key: "phone_3", label: t("suppliers.phoneNumber", { number: 3 }), placeholder: "0xx-xxx-xxxx " },
    {
      key: "phone_4",
      label: t("suppliers.phoneNumber", { number: 4 }),
      placeholder: "0xx-xxx-xxxx ",
    },
    {
      key: "phone_5",
      label: t("suppliers.phoneNumber", { number: 5 }),
      placeholder: "0xx-xxx-xxxx ",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error(t("common.validationRequired", { field: t("suppliers.name") }));
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
          t("suppliers.saveError", {
            action: t(isEdit ? "suppliers.actionUpdate" : "suppliers.actionCreate"),
          })
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
      alert(error.message || t("common.deleteError"));
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
    if (!confirm(t("suppliers.deleteFileConfirm"))) return;

    try {
      await supplierFilesService.deleteSupplierFile(fileId);
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
      alert(t("suppliers.deleteFileError"));
    }
  };

  const handleClose = () => {
    if (!isEdit) {
      setFormData({
        name: "",
        address: "",
        phone: "",
        phone_2: "",
        phone_3: "",
        phone_4: "",
        phone_5: "",
        line: "",
        facebook: "",
        whatsapp: "",
        website: "",
        email: "",
      });
      setVisiblePhoneFields(1);
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
              <h2 className="text-lg font-semibold text-gray-900">
                {isEdit ? t("suppliers.edit") : t("suppliers.add")}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
                disabled={loading || deleteLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Section 1: Basic Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-500" />
                    {t("packages.basicInfo")}
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t("suppliers.name")} <span className="text-danger-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                          placeholder={t("suppliers.namePlaceholder")}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t("suppliers.type")} <span className="text-danger-600">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {SUPPLIER_TYPES.map((option) => {
                            const active = formData.type === option.value;
                            return (
                              <label
                                key={option.value}
                                className={`flex-1 min-w-[10rem] cursor-pointer rounded-lg border px-3 py-2 text-sm transition ${
                                  active
                                    ? "border-brand-500 bg-brand-50 text-brand-800"
                                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="type"
                                  value={option.value}
                                  checked={active}
                                  onChange={handleChange}
                                  className="sr-only"
                                />
                                <span className="font-medium">{t(option.labelKey)}</span>
                                <span className="block text-xs text-gray-500 mt-0.5">
                                  {t(option.hintKey)}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          {t("suppliers.address")}
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                          placeholder={t("suppliers.addressPlaceholder")}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact Info - Enhanced Phone Fields */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-gray-500" />
                    {t("suppliers.contactChannels")}
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-4">
                      {/* Dynamic Phone Fields */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            {t("suppliers.phoneNumbers")}{" "}
                            <span className="font-normal text-gray-400">
                              ({visiblePhoneFields}/5)
                            </span>
                          </label>
                          {visiblePhoneFields < 5 && (
                            <button
                              type="button"
                              onClick={addPhoneField}
                              className="flex items-center gap-1 px-2.5 py-1 bg-brand-100 text-brand-700 text-xs rounded-lg hover:bg-brand-100 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              {t("suppliers.addPhone")}
                            </button>
                          )}
                        </div>

                        <div className="space-y-3">
                          {phoneFields
                            .slice(0, visiblePhoneFields)
                            .map((field, index) => (
                              <div
                                key={field.key}
                                className="flex items-center space-x-3"
                              >
                                <div className="flex-1">
                                  <input
                                    type="tel"
                                    name={field.key}
                                    value={formData[field.key]}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                    placeholder={field.placeholder}
                                  />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500 min-w-[80px]">
                                    {field.label}
                                  </span>
                                  {visiblePhoneFields > 1 && index > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => removePhoneField(index)}
                                      className="p-1 text-danger-600 hover:bg-danger-100 rounded transition-colors"
                                      title={t("suppliers.removePhone")}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>

                        <p className="mt-2 text-xs text-gray-500">
                          {t("suppliers.phoneHint")}
                        </p>
                      </div>

                      {/* Other Contact Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t("common.contactEmail")}
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                            placeholder="name@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t("suppliers.lineId")}
                          </label>
                          <input
                            type="text"
                            name="line"
                            value={formData.line}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                            placeholder="Line ID"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            WhatsApp
                          </label>
                          <input
                            type="tel"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                            placeholder={t("suppliers.whatsAppPlaceholder")}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Facebook
                          </label>
                          <input
                            type="text"
                            name="facebook"
                            value={formData.facebook}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                            placeholder={t("suppliers.facebookPlaceholder")}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t("common.website")}
                          </label>
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: File Management (Edit only) */}
                {isEdit && supplier && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                        <FolderOpen className="w-4 h-4 text-gray-500" />
                        {t("suppliers.manageDocuments", { count: files.length })}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setFilesSectionOpen(!filesSectionOpen)}
                        className="flex items-center gap-1.5 px-3 py-1 text-sm text-brand-600 hover:text-brand-800 transition-colors"
                      >
                        <span>{filesSectionOpen ? t("common.hide") : t("common.show")}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            filesSectionOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {filesSectionOpen && (
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        {/* File Upload */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            {t("suppliers.uploadFiles")}
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
                            {t("suppliers.existingFiles")}
                          </h4>
                          {filesLoading ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500 mx-auto mb-2"></div>
                              <p className="text-sm text-gray-500">
                                {t("document.loading")}
                              </p>
                            </div>
                          ) : (
                            <FileDownloads
                              files={files}
                              getFileUrl={
                                supplierFilesService.getSupplierFileUrl
                              }
                              title={t("suppliers.documents")}
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
              {/* Delete Button - Edit only */}
              <div>
                {isEdit && supplier && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={loading || deleteLoading}
                    className="px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t("suppliers.delete")}</span>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading || deleteLoading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading || deleteLoading || !formData.name.trim()}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{isEdit ? t("common.updating") : t("common.creating")}</span>
                    </div>
                  ) : (
                    isEdit ? t("suppliers.update") : t("suppliers.create")
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
                <div className="flex-shrink-0 w-10 h-10 bg-danger-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-danger-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t("suppliers.deleteConfirmTitle")}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {t("suppliers.deleteIrreversible")}
                  </p>
                </div>
              </div>

              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-danger-800">
                  {t("suppliers.deleteAbout", { name: supplier?.name || "" })}
                </p>
                <p className="text-sm text-danger-700 mt-1">
                  • {t("suppliers.deleteDataWarning")}
                </p>
                <p className="text-sm text-danger-700">
                  • {t("suppliers.deleteFilesWarning")}
                </p>
                <p className="text-sm text-danger-700">
                  • {t("suppliers.deleteToursWarning")}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{t("suppliers.deleting")}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>{t("suppliers.delete")}</span>
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
