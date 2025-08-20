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

      // ✅ แก้ไขการเปรียบเทียบ ID
      const foundSupplier = suppliers.find((s) => Number(s.id) === Number(id));

      console.log("✅ Found supplier:", foundSupplier);

      if (foundSupplier) {
        setSupplier(foundSupplier);
      } else {
        console.error("❌ Supplier not found for ID:", id);
        alert("ไม่พบข้อมูล Supplier");
        navigate("/suppliers");
      }
    } catch (error) {
      console.error("Error fetching supplier:", error);
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูล Supplier");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierTours = async () => {
    try {
      setToursLoading(true);
      const allTours = await toursService.getAllTours();

      // ✅ แก้ไขการกรองทัวร์
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
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูลทัวร์");
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

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString || dateString === "0000-00-00") return "ไม่กำหนด";
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
        ? "ราคา Net นี้ รวมค่าอุทยานแล้ว"
        : "ราคา Net นี้ ยังไม่รวมค่าอุทยาน") + (notes ? ` | ${notes}` : "");

    if (isExpired(tour.end_date)) {
      notes += " | ⚠️ หมดอายุแล้ว กรุณาต่ออายุ";
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
        <p className="text-gray-500 text-lg mb-4">ไม่พบข้อมูล Supplier</p>
        <Link
          to="/suppliers"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ← กลับไปรายการ Suppliers
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
            title="กลับ"
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
              รายละเอียด Supplier และทัวร์ที่เกี่ยวข้อง
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/add?supplier=${supplier.id}`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            ➕ เพิ่มทัวร์ใหม่
          </Link>
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            title="แก้ไขข้อมูล Supplier (Coming Soon)"
          >
            ✏️ แก้ไข Supplier
          </button>
        </div>
      </div>

      {/* Supplier Info Card */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🏢</span>
          ข้อมูล Supplier
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700 border-b pb-2">
              ข้อมูลติดต่อ
            </h3>

            {supplier.phone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>📞</span>
                  <span>{supplier.phone}</span>
                </div>
                <button
                  onClick={() => handleContactClick("phone", supplier.phone)}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  โทร
                </button>
              </div>
            )}

            {supplier.line && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>💬</span>
                  <span>{supplier.line}</span>
                </div>
                <button
                  onClick={() => handleContactClick("line", supplier.line)}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  Line
                </button>
              </div>
            )}

            {supplier.facebook && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>📘</span>
                  <span className="truncate max-w-48">{supplier.facebook}</span>
                </div>
                <button
                  onClick={() =>
                    handleContactClick("facebook", supplier.facebook)
                  }
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  เปิด
                </button>
              </div>
            )}

            {supplier.whatsapp && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span>📱</span>
                  <span>{supplier.whatsapp}</span>
                </div>
                <button
                  onClick={() =>
                    handleContactClick("whatsapp", supplier.whatsapp)
                  }
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  WhatsApp
                </button>
              </div>
            )}

            {!supplier.phone &&
              !supplier.line &&
              !supplier.facebook &&
              !supplier.whatsapp && (
                <p className="text-gray-400 text-sm">ไม่มีข้อมูลติดต่อ</p>
              )}
          </div>

          {/* Address & System Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700 border-b pb-2">
              ข้อมูลทั่วไป
            </h3>

            <div>
              <p className="text-sm text-gray-600">ที่อยู่</p>
              <p className="text-gray-900">{supplier.address || "ไม่ระบุ"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">สร้างเมื่อ</p>
              <p className="text-gray-900">{formatDate(supplier.created_at)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">อัพเดทล่าสุด</p>
              <p className="text-gray-900">{formatDate(supplier.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Files Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">📎</span>
          ไฟล์เอกสาร ({supplierFiles.length} ไฟล์)
        </h2>

        {filesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">กำลังโหลดไฟล์...</p>
          </div>
        ) : supplierFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supplierFiles.map((file) => (
              <div
                key={file.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-2xl">
                      {file.file_type === "pdf" ? "📄" : "🖼️"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {file.label || file.original_name}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{file.file_size_formatted}</span>
                        <span>•</span>
                        <span>{formatDate(file.uploaded_at)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFileView(file)}
                    className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                  >
                    👁️ ดู
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📁</div>
            <p className="text-gray-500 mb-2">ยังไม่มีไฟล์เอกสาร</p>
            <p className="text-gray-400 text-sm">
              สามารถอัพโหลดไฟล์ได้ในหน้าแก้ไขทัวร์
            </p>
          </div>
        )}
      </div>

      {/* Tours Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🏝️</span>
          ทัวร์ของ Supplier นี้ ({supplierTours.length} ทัวร์)
        </h2>

        {toursLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">กำลังโหลดทัวร์...</p>
          </div>
        ) : supplierTours.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อทัวร์
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ออกจาก
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ราคาผู้ใหญ่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ราคาเด็ก
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สิ้นสุด
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การดำเนินการ
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
                          ท่าเรือ: {tour.pier}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tour.departure_from || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ฿{formatPrice(tour.adult_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ฿{formatPrice(tour.child_price)}
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
                          📋 รายละเอียด
                        </button>
                        <button
                          onClick={() => openDocumentModal(tour)}
                          className="px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors text-xs"
                        >
                          📎 เอกสาร
                        </button>
                        <Link
                          to={`/edit/${tour.id}`}
                          className="px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors text-xs"
                        >
                          ✏️ แก้ไข
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
            <p className="text-gray-500 text-lg mb-2">ยังไม่มีทัวร์</p>
            <p className="text-gray-400 text-sm mb-4">
              เพิ่มทัวร์แรกให้กับ Supplier นี้
            </p>
            <Link
              to={`/add?supplier=${supplier.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ เพิ่มทัวร์ใหม่
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
    </div>
  );
};

export default SupplierDetail;
