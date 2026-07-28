import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Palmtree,
  Map,
  Paperclip,
  Folder,
  Link2,
  FileText,
  Image as ImageIcon,
  Eye,
  Trash2,
  Save,
} from "lucide-react";
import { SupplierAutocomplete } from "../../components/suppliers";
import { SupplierModal } from "../../components/suppliers";
import {
  TourFileUpload,
  ShareGalleryManager,
  SharedGalleryGroup,
} from "../../components/tours";
import { AutocompleteInput, ProvincePicker } from "../../components/common";
import { TOUR_TYPES } from "../../utils/tour-types";
import { COMMON_PROVINCES } from "../../utils/provinces";
import SupplierFileUpload from "../../components/suppliers/SupplierFileUpload";
import {
  toursService,
  suppliersService,
  filesService,
  supplierFilesService,
} from "../../services/api-service";
import { useTourFiles } from "../../hooks";

const EditTour = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Use tour files hook instead of manual state
  const {
    files: tourFiles,
    sharedGalleryGroups,
    ownGalleryFiles,
    refreshFiles,
  } = useTourFiles(id);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data states
  const [tour, setTour] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierFiles, setSupplierFiles] = useState([]);

  // Modal states
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [modalInitialName, setModalInitialName] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    tour_name: "",
    tour_type: "one_day_trip",
    departure_from: "",
    destination: "",
    pier: "",
    adult_price: "",
    child_price: "",
    start_date: "",
    end_date: "",
    no_end_date: false,
    notes: "",
    park_fee_included: false,
    park_fee_adult: "",
    park_fee_child: "",
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
      const tourData = tours.find((t) => String(t.id) === String(id));

      if (tourData) {
        setTour(tourData);

        // Check if tour has no end date
        const hasNoEndDate =
          !tourData.end_date || tourData.end_date === "0000-00-00";

        setFormData({
          tour_name: tourData.tour_name || "",
          tour_type: tourData.tour_type || "one_day_trip",
          departure_from: tourData.departure_from || "",
          destination: tourData.destination || "",
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
          park_fee_adult:
            tourData.park_fee_adult != null && tourData.park_fee_adult !== ""
              ? parseFloat(tourData.park_fee_adult).toString()
              : "",
          park_fee_child:
            tourData.park_fee_child != null && tourData.park_fee_child !== ""
              ? parseFloat(tourData.park_fee_child).toString()
              : "",
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
      } else {
        alert("Tour not found");
        navigate("/");
      }
    } catch (error) {
      console.error("Error fetching tour:", error);
      alert("An error occurred while loading data");
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
    refreshFiles(); // use refreshFiles from the hook instead
  };

  const handleDeleteTourFile = async (fileId) => {
    if (window.confirm("Do you want to delete this file?")) {
      try {
        await filesService.deleteFile(fileId);
        refreshFiles();
      } catch (error) {
        console.error("Error deleting file:", error);
        alert("An error occurred while deleting the file");
      }
    }
  };

  const handleDeleteSupplierFile = async (fileId) => {
    if (window.confirm("Do you want to delete this file?")) {
      try {
        await supplierFilesService.deleteSupplierFile(fileId);
        setSupplierFiles((prev) => prev.filter((file) => file.id !== fileId));
      } catch (error) {
        console.error("Error deleting supplier file:", error);
        alert("An error occurred while deleting the file");
      }
    }
  };

  const handleViewFile = (file, isSupplierFile = false) => {
    const fileUrl = isSupplierFile
      ? supplierFilesService.getSupplierFileUrl(file)
      : filesService.getFileUrl(file);
    window.open(fileUrl, "_blank");
  };

  const handleUnshareGallery = async (sourceTourId) => {
    try {
      await filesService.unshareGalleryFiles(sourceTourId, id);
      refreshFiles(); // use refreshFiles instead of manual setTourFiles
      alert("Gallery images unshared successfully");
    } catch (error) {
      console.error("Error unsharing gallery:", error);
      alert("An error occurred while unsharing: " + error.message);
    }
  };

  const handleUnshareFile = async (file) => {
    try {
      console.log("🔍 Unsharing single file:", file);

      if (file.isSharedFile) {
        await filesService.unshareSingleFile(file.id, id);
      } else {
        await filesService.deleteFile(file.id);
      }

      refreshFiles(); // use refreshFiles instead of manual setTourFiles
    } catch (error) {
      console.error("Error unsharing file:", error);
      alert("An error occurred while deleting the file");
    }
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
      newErrors.tour_name = "Please enter a tour name";
    }

    // Date validation
    if (!formData.no_end_date && formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      if (endDate <= startDate) {
        newErrors.end_date = "End date must be later than start date";
      }
    }

    // Number validation
    if (formData.adult_price && isNaN(parseFloat(formData.adult_price))) {
      newErrors.adult_price = "Please enter a valid number";
    }

    if (formData.child_price && isNaN(parseFloat(formData.child_price))) {
      newErrors.child_price = "Please enter a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please make sure all information is complete and correct");
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
        // Keep empty string so the backend stores NULL instead of 0
        park_fee_adult:
          formData.park_fee_adult === ""
            ? ""
            : parseFloat(formData.park_fee_adult) || 0,
        park_fee_child:
          formData.park_fee_child === ""
            ? ""
            : parseFloat(formData.park_fee_child) || 0,
        end_date: formData.no_end_date ? null : formData.end_date,
      };

      await toursService.updateTour(id, submitData);
      alert("Data updated successfully");
      navigate(-1);
    } catch (error) {
      console.error("Error saving tour:", error);
      alert("An error occurred while saving data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        `Do you want to delete the tour "${formData.tour_name}"?\n\nThis deletion cannot be undone!`
      )
    ) {
      try {
        setSaving(true);
        await toursService.deleteTour(id);
        alert("Data deleted successfully");
        navigate(-1);
      } catch (error) {
        console.error("Error deleting tour:", error);
        alert("An error occurred while deleting data");
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Tour</h1>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 px-4 py-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <Building2 className="h-5 w-5" />
            Supplier
          </h2>
          <SupplierAutocomplete
            onSelect={handleSupplierSelect}
            onCreateNew={handleCreateNewSupplier}
            value={selectedSupplier}
            placeholder="Select or change Supplier..."
          />
        </div>

        {/* Tour Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <Palmtree className="h-5 w-5" />
            Tour Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tour Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tour name <span className="text-danger-600">*</span>
              </label>
              <input
                type="text"
                name="tour_name"
                value={formData.tour_name}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                  errors.tour_name ? "border-danger-500" : "border-gray-300"
                }`}
                placeholder="Enter tour name"
              />
              {errors.tour_name && (
                <p className="text-danger-600 text-xs mt-1">{errors.tour_name}</p>
              )}
            </div>

            {/* Tour Type */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tour type
              </label>
              <select
                name="tour_type"
                value={formData.tour_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                {TOUR_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Departure From - province picker (can be more than one) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departure from{" "}
                <span className="font-normal text-gray-400">
                  — can be more than one
                </span>
              </label>
              <ProvincePicker
                multiple
                quickPicks={COMMON_PROVINCES}
                value={
                  formData.departure_from
                    ? formData.departure_from
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : []
                }
                onChange={(arr) =>
                  handleAutocompleteChange("departure_from", arr.join(", "))
                }
                placeholder="Type a province"
              />
              {errors.departure_from && (
                <p className="text-danger-600 text-xs mt-1">
                  {errors.departure_from}
                </p>
              )}
            </div>

            {/* Destination - single province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination{" "}
                <span className="font-normal text-gray-400">
                  — one province
                </span>
              </label>
              <ProvincePicker
                quickPicks={COMMON_PROVINCES}
                value={formData.destination || ""}
                onChange={(val) =>
                  handleAutocompleteChange("destination", val || "")
                }
                placeholder="Type a province"
              />
            </div>

            {/* Pier - with Autocomplete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pier
              </label>
              <AutocompleteInput
                type="pier"
                value={formData.pier}
                onChange={(value) => handleAutocompleteChange("pier", value)}
                placeholder="Pier name"
                className={errors.pier ? "border-danger-500" : ""}
              />
              {errors.pier && (
                <p className="text-danger-600 text-xs mt-1">{errors.pier}</p>
              )}
            </div>

            {/* Adult Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adult price (THB)
              </label>
              <input
                type="number"
                name="adult_price"
                value={formData.adult_price}
                onChange={handleChange}
                min="0"
                step="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                  errors.adult_price ? "border-danger-500" : "border-gray-300"
                }`}
              />
              {errors.adult_price && (
                <p className="text-danger-600 text-xs mt-1">
                  {errors.adult_price}
                </p>
              )}
            </div>

            {/* Child Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Child price (THB)
              </label>
              <input
                type="number"
                name="child_price"
                value={formData.child_price}
                onChange={handleChange}
                min="0"
                step="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                  errors.child_price ? "border-danger-500" : "border-gray-300"
                }`}
              />
              {errors.child_price && (
                <p className="text-danger-600 text-xs mt-1">
                  {errors.child_price}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            {/* End Date - with Optional Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End date
              </label>

              {/* End Date Input - conditionally shown */}
              {!formData.no_end_date && (
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                    errors.end_date ? "border-danger-500" : "border-gray-300"
                  }`}
                />
              )}

              {/* End Date in Disabled State */}
              {formData.no_end_date && (
                <input
                  type="text"
                  value="Not specified"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-warning-50 text-warning-700 cursor-not-allowed"
                />
              )}

              {/* No End Date Checkbox */}
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.no_end_date}
                    onChange={(e) => handleNoEndDateToggle(e.target.checked)}
                    className="rounded border-gray-300 text-warning-600 focus:ring-warning-500"
                  />
                  <span className="ml-2 text-sm text-warning-700">
                    No end date (valid until changed)
                  </span>
                </label>
              </div>

              {errors.end_date && (
                <p className="text-danger-600 text-xs mt-1">{errors.end_date}</p>
              )}
            </div>

            {/* Map URL */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <Map className="h-4 w-4" />
                Google Maps URL
              </label>
              <input
                type="url"
                name="map_url"
                value={formData.map_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="https://maps.google.com/... or https://goo.gl/maps/..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Copy the URL from Google Maps and paste it here (optional)
              </p>
            </div>

            {/* Park Fee — Adult */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Park fee / adult (THB)
              </label>
              <input
                type="number"
                name="park_fee_adult"
                value={formData.park_fee_adult}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            {/* Park Fee — Child */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Park fee / child (THB)
              </label>
              <input
                type="number"
                name="park_fee_child"
                value={formData.park_fee_child}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            {/* Park Fee Included */}
            <div className="md:col-span-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="park_fee_included"
                  checked={formData.park_fee_included}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  This Net price includes the park fee
                </span>
              </label>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="Enter additional notes..."
              />
            </div>
          </div>
        </div>

        {/* Files Section */}
        <div className="space-y-6">
          {/* Supplier Files */}
          {selectedSupplier && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Paperclip className="h-5 w-5" />
                Supplier files ({selectedSupplier.name})
              </h2>

              <SupplierFileUpload
                supplierId={selectedSupplier.id}
                onFileUploaded={handleSupplierFileUploaded}
              />

              {supplierFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Uploaded files ({supplierFiles.length} files)
                  </h3>
                  <div className="space-y-2">
                    {supplierFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-brand-50 rounded-lg border border-brand-200"
                      >
                        <div className="flex items-center space-x-3">
                          {file.file_type === "pdf" ? (
                            <FileText className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-500" />
                          )}
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
                            className="inline-flex items-center gap-1 px-2 py-1 text-brand-600 hover:bg-brand-100 rounded text-sm"
                          >
                            <Eye className="h-4 w-4" /> View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSupplierFile(file.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-danger-600 hover:bg-danger-50 rounded text-sm"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
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
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <Paperclip className="h-5 w-5" />
              Files for this tour
            </h2>

            <TourFileUpload
              tourId={id}
              onFileUploaded={handleTourFileUploaded}
              onGalleryShared={refreshFiles} // use refreshFiles instead
            />

            {tourFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  Uploaded files ({tourFiles.length} files)
                </h3>

                {/* Own Files */}
                {tourFiles.filter((file) => !file.isSharedFile).length > 0 && (
                  <div className="mb-4">
                    <h4 className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                      <Folder className="h-4 w-4" />
                      Files for this tour
                    </h4>
                    <div className="space-y-2">
                      {tourFiles
                        .filter((file) => !file.isSharedFile)
                        .map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-success-50 rounded-lg border border-success-200"
                          >
                            <div className="flex items-center space-x-3">
                              {file.file_type === "pdf" ? (
                                <FileText className="h-5 w-5 text-gray-500" />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-gray-500" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {file.original_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {file.file_size_formatted} • This tour's file •{" "}
                                  {file.file_category || "general"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => handleViewFile(file, false)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-brand-600 hover:bg-brand-100 rounded text-sm"
                              >
                                <Eye className="h-4 w-4" /> View
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTourFile(file.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-danger-600 hover:bg-danger-50 rounded text-sm"
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Shared Gallery Groups */}
                {Object.keys(sharedGalleryGroups).length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                      <Link2 className="h-4 w-4" />
                      Shared Gallery images
                    </h4>
                    {Object.values(sharedGalleryGroups).map((group) => (
                      <SharedGalleryGroup
                        key={group.sourceTourId}
                        sourceTourId={group.sourceTourId}
                        sourceTourName={group.sourceTourName}
                        files={group.files}
                        onUnshareAll={handleUnshareGallery}
                        onUnshareFile={handleUnshareFile}
                        onViewFile={handleViewFile}
                      />
                    ))}
                  </div>
                )}
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
              className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-600 text-white py-3 px-4 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-danger-600 text-white py-3 px-4 rounded-lg hover:bg-danger-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
            >
              <Trash2 className="h-4 w-4" />
              {saving ? "Deleting..." : "Delete this tour"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium shadow-md"
            >
              Cancel
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
