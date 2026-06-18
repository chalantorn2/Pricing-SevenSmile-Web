import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  suppliersService,
  toursService,
  supplierFilesService,
  filesService,
} from "../../services/api-service";
import { TourDetailsModal } from "../../components/tours";
import { DocumentModal } from "../../components/common";
import { FileDownloads } from "../../components/common";
import { SupplierModal } from "../../components/suppliers";

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [supplierTours, setSupplierTours] = useState([]);
  const [supplierFiles, setSupplierFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toursLoading, setToursLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(true);

  // Modal states
  const [selectedTour, setSelectedTour] = useState(null);
  const [showTourDetailsModal, setShowTourDetailsModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSupplierData();
      fetchSupplierTours();
      fetchSupplierFiles();
    }
  }, [id]);

  const fetchSupplierData = async () => {
    try {
      setLoading(true);
      const suppliers = await suppliersService.getAllSuppliers();

      console.log("🔍 Looking for supplier ID:", id, "Type:", typeof id);
      console.log(
        "📋 Available suppliers:",
        suppliers.map((s) => ({ id: s.id, name: s.name, idType: typeof s.id }))
      );

      // ✅ Fix ID comparison
      const foundSupplier = suppliers.find((s) => Number(s.id) === Number(id));

      console.log("✅ Found supplier:", foundSupplier);

      if (foundSupplier) {
        setSupplier(foundSupplier);
      } else {
        console.error("❌ Supplier not found for ID:", id);
        alert("Supplier not found");
        navigate("/suppliers");
      }
    } catch (error) {
      console.error("Error fetching supplier:", error);
      alert("An error occurred while loading Supplier data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierTours = async () => {
    try {
      setToursLoading(true);
      const allTours = await toursService.getAllTours();

      // ✅ Fix tour filtering
      const filteredTours = allTours.filter(
        (tour) => Number(tour.supplier_id) === Number(id)
      );

      console.log(
        "🏝️ Filtered tours for supplier",
        id,
        ":",
        filteredTours.length,
        "tours"
      );
      setSupplierTours(filteredTours);
    } catch (error) {
      console.error("Error fetching tours:", error);
      alert("An error occurred while loading tours");
    } finally {
      setToursLoading(false);
    }
  };

  const fetchSupplierFiles = async () => {
    try {
      setFilesLoading(true);
      const files = await supplierFilesService.getSupplierFiles(Number(id));
      console.log("📁 Supplier files:", files.length, "files");
      setSupplierFiles(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      // Don't show alert for files error, just log it
    } finally {
      setFilesLoading(false);
    }
  };

  const handleEditSupplier = () => {
    setShowEditModal(true);
  };

  const handleSupplierUpdate = (updatedSupplier) => {
    setSupplier(updatedSupplier);
    setShowEditModal(false);
    // Refresh files when changes occur
    fetchSupplierFiles();
  };

  const handleSupplierDelete = () => {
    setShowEditModal(false);
    navigate("/suppliers");
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString || dateString === "0000-00-00") return "Not set";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("th-TH").format(price);
  };

  const isExpired = (endDate) => {
    if (!endDate || endDate === "0000-00-00") return false;
    return new Date(endDate) < new Date();
  };

  const getNotesWithExpiry = (tour) => {
    let notes = tour.notes || "";
    notes =
      (tour.park_fee_included
        ? "This net price includes the national park fee"
        : "This net price does not include the national park fee") + (notes ? ` | ${notes}` : "");

    if (isExpired(tour.end_date)) {
      notes += " | ⚠️ Expired. Please renew";
    }
    return notes;
  };

  const openTourDetailsModal = (tour) => {
    setSelectedTour(tour);
    setShowTourDetailsModal(true);
  };

  const openDocumentModal = (tour) => {
    setSelectedTour(tour);
    setShowDocumentModal(true);
  };

  const closeModals = () => {
    setShowTourDetailsModal(false);
    setShowDocumentModal(false);
    setSelectedTour(null);
  };

  const handleContactClick = (type, value) => {
    switch (type) {
      case "phone":
        window.open(`tel:${value}`);
        break;
      case "line":
        // Try to open Line app, fallback to web
        window.open(`https://line.me/ti/p/~${value}`);
        break;
      case "facebook":
        window.open(
          value.startsWith("http") ? value : `https://facebook.com/${value}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(`https://wa.me/${value}`, "_blank");
        break;
    }
  };

  const handleFileView = (file) => {
    const fileUrl = supplierFilesService.getSupplierFileUrl(file);
    if (file.file_type === "image") {
      // Show in modal or new tab
      window.open(fileUrl, "_blank");
    } else {
      window.open(fileUrl, "_blank");
    }
  };

  // 🎨 Enhanced Phone Numbers Render Function
  const renderPhoneNumbers = (supplier) => {
    const phones = [
      { number: supplier.phone, label: "Primary phone" },
      { number: supplier.phone_2, label: "Phone 2" },
      { number: supplier.phone_3, label: "Phone 3" },
      { number: supplier.phone_4, label: "Phone 4" },
      { number: supplier.phone_5, label: "Phone 5" },
    ].filter((item) => item.number?.trim());

    if (phones.length === 0) {
      return (
        <div className="text-center text-gray-400 py-4">
          <span className="text-2xl mb-2 block">📵</span>
          <span className="text-sm">No phone numbers</span>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {phones.map((phone, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg transition-all hover:shadow-md ${
              index === 0
                ? "bg-blue-50 border border-blue-200"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index === 0 ? "bg-blue-500" : "bg-gray-500"
                } text-white text-sm font-medium`}
              >
                {index === 0 ? "📞" : `${index + 1}`}
              </div>
              <div>
                <div className="font-medium text-gray-900">{phone.number}</div>
                <div
                  className={`text-xs ${
                    index === 0 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {phone.label} {index === 0 && "(Primary)"}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleContactClick("phone", phone.number)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  index === 0
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                📞 Call
              </button>
              <button
                onClick={() => navigator.clipboard?.writeText(phone.number)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy phone number"
              >
                📋
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">😞</div>
        <p className="text-gray-500 text-lg mb-4">Supplier not found</p>
        <Link
          to="/suppliers"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ← Back to Suppliers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/suppliers")}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Back"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {supplier.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Supplier details and related tours
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/add?supplier=${supplier.id}`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            ➕ Add New Tour
          </Link>
          <button
            onClick={handleEditSupplier}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ✏️ Edit Supplier
          </button>
        </div>
      </div>

      {/* Supplier Info Card - Enhanced */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">🏢</span>
            Supplier Information
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Phone Numbers */}
            <div>
              <h3 className="font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center">
                <span className="mr-2">📞</span>
                Phone Numbers
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {
                    [
                      supplier.phone,
                      supplier.phone_2,
                      supplier.phone_3,
                      supplier.phone_4,
                      supplier.phone_5,
                    ].filter((p) => p?.trim()).length
                  }{" "}
                  numbers
                </span>
              </h3>

              {renderPhoneNumbers(supplier)}
            </div>

            {/* Right Column: Other Info */}
            <div className="space-y-6">
              {/* Other Contact Methods */}
              <div>
                <h3 className="font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200">
                  Other Contact Methods
                </h3>
                <div className="space-y-3">
                  {supplier.line && (
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">💬</span>
                        <span className="font-medium">{supplier.line}</span>
                        <span className="text-xs text-green-600">Line ID</span>
                      </div>
                      <button
                        onClick={() =>
                          handleContactClick("line", supplier.line)
                        }
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Open Line
                      </button>
                    </div>
                  )}

                  {supplier.facebook && (
                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-600">📘</span>
                        <span className="font-medium truncate max-w-[200px]">
                          {supplier.facebook}
                        </span>
                        <span className="text-xs text-blue-600">Facebook</span>
                      </div>
                      <button
                        onClick={() =>
                          handleContactClick("facebook", supplier.facebook)
                        }
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Open
                      </button>
                    </div>
                  )}

                  {supplier.whatsapp && (
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">📱</span>
                        <span className="font-medium">{supplier.whatsapp}</span>
                        <span className="text-xs text-green-600">WhatsApp</span>
                      </div>
                      <button
                        onClick={() =>
                          handleContactClick("whatsapp", supplier.whatsapp)
                        }
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        WhatsApp
                      </button>
                    </div>
                  )}

                  {/* Website - add this section */}
                  {supplier.website && (
                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-600">🌐</span>
                        <span className="font-medium truncate max-w-[200px]">
                          {supplier.website}
                        </span>
                        <span className="text-xs text-blue-600">Website</span>
                      </div>
                      <button
                        onClick={() =>
                          window.open(
                            supplier.website,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Visit
                      </button>
                    </div>
                  )}

                  {!supplier.line &&
                    !supplier.facebook &&
                    !supplier.whatsapp &&
                    !supplier.website && (
                      <div className="text-center text-gray-400 py-4">
                        <span className="text-2xl mb-2 block">📫</span>
                        <span className="text-sm">No other contact methods</span>
                      </div>
                    )}
                </div>
              </div>

              {/* Address & System Info */}
              <div>
                <h3 className="font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200">
                  General Information
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Address</p>
                    <p className="text-gray-900">
                      {supplier.address || "Not specified"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Created At</p>
                      <p className="text-gray-900">
                        {formatDate(supplier.created_at)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                      <p className="text-gray-900">
                        {formatDate(supplier.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Files Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📁</span>
          Document Files ({supplierFiles.length} files)
        </h2>

        {filesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading files...</p>
          </div>
        ) : (
          <FileDownloads
            files={supplierFiles}
            getFileUrl={supplierFilesService.getSupplierFileUrl}
            title="Supplier Documents"
            isSupplier={true}
            showCategory={true}
          />
        )}
      </div>

      {/* Tours Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🏝️</span>
          Tours from This Supplier ({supplierTours.length} tours)
        </h2>

        {toursLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading tours...</p>
          </div>
        ) : supplierTours.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tour Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departure From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adult Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Child Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {supplierTours.map((tour) => (
                  <tr
                    key={tour.id}
                    className={`hover:bg-gray-50 ${
                      isExpired(tour.end_date) ? "row-expired" : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{tour.tour_name}</div>
                      {tour.pier && (
                        <div className="text-xs text-gray-500">
                          Pier: {tour.pier}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tour.departure_from || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      THB {formatPrice(tour.adult_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      THB {formatPrice(tour.child_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={
                          isExpired(tour.end_date) ? "text-red-600" : ""
                        }
                      >
                        {formatDate(tour.end_date)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openTourDetailsModal(tour)}
                          className="px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-xs"
                        >
                          📋 Details
                        </button>
                        <button
                          onClick={() => openDocumentModal(tour)}
                          className="px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors text-xs"
                        >
                          📎 Documents
                        </button>
                        <Link
                          to={`/edit/${tour.id}`}
                          className="px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors text-xs"
                        >
                          ✏️ Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">🏝️</div>
            <p className="text-gray-500 text-lg mb-2">No tours yet</p>
            <p className="text-gray-400 text-sm mb-4">
              Add the first tour for this Supplier
            </p>
            <Link
              to={`/add?supplier=${supplier.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ Add New Tour
            </Link>
          </div>
        )}
      </div>

      {/* Modals */}
      <TourDetailsModal
        isOpen={showTourDetailsModal}
        onClose={closeModals}
        tour={selectedTour}
      />

      <DocumentModal
        isOpen={showDocumentModal}
        onClose={closeModals}
        tour={selectedTour}
      />

      <SupplierModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleSupplierUpdate}
        onDelete={handleSupplierDelete}
        supplier={supplier}
        isEdit={true}
      />
    </div>
  );
};

export default SupplierDetail;
