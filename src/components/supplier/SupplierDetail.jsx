import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  suppliersService,
  toursService,
  supplierFilesService,
} from "../../services/api-service";
import { SupplierModal } from "../../components/modals";
import { SupplierFileUpload } from "../../components/uploads";
import {
  formatPrice,
  formatDate,
  formatDateTime,
} from "../../utils/formatters";
import { getNotesWithExpiry } from "../../utils/helpers";
import {
  DetailSkeleton,
  ErrorState,
  EmptyState,
  MobileOptimizedTable,
} from "../../components/common/LoadingSkeleton";

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [tours, setTours] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [stats, setStats] = useState({
    totalTours: 0,
    activeTours: 0,
    expiredTours: 0,
    totalFiles: 0,
  });

  const handleSupplierDelete = (deletedSupplier) => {
    console.log("Supplier deleted:", deletedSupplier);
    // ✨ Navigate ไปหน้า Suppliers
    navigate("/suppliers");
  };

  useEffect(() => {
    if (id) {
      fetchSupplierData();
    }
  }, [id]);

  const fetchSupplierData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch supplier, tours, and files in parallel
      const [allSuppliers, allTours, supplierFiles] = await Promise.all([
        suppliersService.getAllSuppliers(),
        toursService.getAllTours(),
        supplierFilesService.getSupplierFiles(id),
      ]);

      // Find specific supplier - แก้ไขการเปรียบเทียบ id
      const supplierId = parseInt(id);
      console.log(
        "🔍 Looking for supplier ID:",
        supplierId,
        "Type:",
        typeof supplierId
      );
      console.log(
        "🏢 Available suppliers:",
        allSuppliers.map((s) => ({ id: s.id, name: s.name, type: typeof s.id }))
      );

      const foundSupplier = allSuppliers.find((s) => {
        // Convert both to number for comparison
        const supplierIdNum = typeof s.id === "string" ? parseInt(s.id) : s.id;
        return supplierIdNum === supplierId;
      });
      if (!foundSupplier) {
        console.error("❌ Supplier not found. Looking for ID:", supplierId);
        console.error(
          "❌ Available IDs:",
          allSuppliers.map((s) => s.id)
        );
        throw new Error("ไม่พบข้อมูล Supplier");
      }

      console.log("✅ Found supplier:", foundSupplier);

      // Filter tours for this supplier - แก้ไขการเปรียบเทียบ id
      const supplierTours = allTours.filter((tour) => {
        const tourSupplierId =
          typeof tour.supplier_id === "string"
            ? parseInt(tour.supplier_id)
            : tour.supplier_id;
        return tourSupplierId === supplierId;
      });

      // Calculate statistics
      const now = new Date();
      const activeTours = supplierTours.filter((tour) => {
        if (!tour.end_date || tour.end_date === "0000-00-00") return true;
        return new Date(tour.end_date) >= now;
      });
      const expiredTours = supplierTours.filter((tour) => {
        if (!tour.end_date || tour.end_date === "0000-00-00") return false;
        return new Date(tour.end_date) < now;
      });

      setSupplier(foundSupplier);
      setTours(supplierTours);
      setFiles(supplierFiles);
      setStats({
        totalTours: supplierTours.length,
        activeTours: activeTours.length,
        expiredTours: expiredTours.length,
        totalFiles: supplierFiles.length,
      });
    } catch (error) {
      console.error("Error fetching supplier data:", error);
      setError(error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = (updatedSupplier) => {
    setSupplier(updatedSupplier);
    setShowEditModal(false);
  };

  const handleFileUploadSuccess = () => {
    fetchSupplierData(); // Refresh data
    setShowFileUpload(false);
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm("ต้องการลบไฟล์นี้หรือไม่?")) return;

    try {
      await supplierFilesService.deleteSupplierFile(fileId);
      fetchSupplierData(); // Refresh data
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("เกิดข้อผิดพลาดในการลบไฟล์");
    }
  };

  const handleViewFile = (file) => {
    const fileUrl = supplierFilesService.getSupplierFileUrl(file);
    window.open(fileUrl, "_blank");
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="เกิดข้อผิดพลาด"
        message={error}
        onRetry={fetchSupplierData}
        icon="🚨"
      />
    );
  }

  if (!supplier) {
    return (
      <ErrorState
        title="ไม่พบข้อมูล Supplier"
        message="Supplier ที่คุณค้นหาไม่มีอยู่ในระบบ"
        icon="❓"
      />
    );
  }

  const tourColumns = [
    { key: "index", label: "ลำดับ", render: (item, index) => index + 1 },
    {
      key: "tour_name",
      label: "ชื่อทัวร์",
      render: (item) => (
        <div>
          <div className="font-medium">{item.tour_name}</div>
          {item.departure_from && (
            <div className="text-xs text-gray-500">
              ออกจาก: {item.departure_from}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "price",
      label: "ราคา (บาท)",
      render: (item) => (
        <div>
          <div className="text-sm">
            <span className="font-medium">ผู้ใหญ่:</span> ฿
            {formatPrice(item.adult_price)}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">เด็ก:</span> ฿
            {formatPrice(item.child_price)}
          </div>
        </div>
      ),
    },
    {
      key: "dates",
      label: "วันที่ใช้ได้",
      render: (item) => (
        <div className="text-sm">
          <div>เริ่ม: {formatDate(item.start_date)}</div>
          <div>สิ้นสุด: {formatDate(item.end_date)}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "สถานะ",
      render: (item) => {
        const now = new Date();
        let status = "ใช้งานได้";
        let colorClass = "bg-green-100 text-green-800";

        if (item.end_date && item.end_date !== "0000-00-00") {
          if (new Date(item.end_date) < now) {
            status = "หมดอายุ";
            colorClass = "bg-red-100 text-red-800";
          }
        }

        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "updated",
      label: "อัพเดทล่าสุด",
      render: (item) => (
        <div className="text-sm">
          <div>{formatDate(item.updated_at)}</div>
          <div className="text-xs text-gray-500">โดย {item.updated_by}</div>
        </div>
      ),
    },
    {
      key: "actions",
      label: "การดำเนินการ",
      render: (item) => (
        <Link
          to={`/edit/${item.id}`}
          className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
        >
          ✏️ แก้ไข
        </Link>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-5 h-5"
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
          <span>กลับ</span>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
          <p className="text-gray-600">รายละเอียด Supplier และทัวร์ทั้งหมด</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFileUpload(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📎 อัพโหลดไฟล์
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ✏️ แก้ไขข้อมูล
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                จำนวนทัวร์ทั้งหมด
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalTours}
              </p>
            </div>
            <div className="text-blue-500">🏝️</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                ทัวร์ที่ใช้งานได้
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.activeTours}
              </p>
            </div>
            <div className="text-green-500">✅</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">ทัวร์หมดอายุ</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.expiredTours}
              </p>
            </div>
            <div className="text-red-500">⚠️</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">ไฟล์เอกสาร</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalFiles}
              </p>
            </div>
            <div className="text-purple-500">📁</div>
          </div>
        </div>
      </div>

      {/* Supplier Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          ข้อมูล Supplier
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              ข้อมูลพื้นฐาน
            </h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">
                  ชื่อ Supplier:
                </dt>
                <dd className="text-sm text-gray-900">{supplier.name}</dd>
              </div>
              {supplier.address && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    ที่อยู่:
                  </dt>
                  <dd className="text-sm text-gray-900 text-right">
                    {supplier.address}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">
                  สร้างเมื่อ:
                </dt>
                <dd className="text-sm text-gray-900">
                  {formatDateTime(supplier.created_at)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">
                  อัพเดทล่าสุด:
                </dt>
                <dd className="text-sm text-gray-900">
                  {formatDateTime(supplier.updated_at)}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              ช่องทางการติดต่อ
            </h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">เบอร์โทร:</dt>
                <dd className="text-sm text-gray-900">
                  {supplier.phone ? (
                    <a
                      href={`tel:${supplier.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {supplier.phone}
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Line ID:</dt>
                <dd className="text-sm text-gray-900">
                  {supplier.line || <span className="text-gray-400">-</span>}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Facebook:</dt>
                <dd className="text-sm text-gray-900">
                  {supplier.facebook ? (
                    <a
                      href={supplier.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {supplier.facebook}
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">WhatsApp:</dt>
                <dd className="text-sm text-gray-900">
                  {supplier.whatsapp ? (
                    <a
                      href={`https://wa.me/${supplier.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline"
                    >
                      {supplier.whatsapp}
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Files Section */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            เอกสารแนบ ({files.length} ไฟล์)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">
                        {file.file_type === "pdf" ? "📄" : "🖼️"}
                      </span>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {file.label || file.original_name}
                      </h4>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>ขนาด: {file.file_size_formatted}</div>
                      <div>อัพโหลดโดย: {file.uploaded_by}</div>
                      <div>{formatDate(file.uploaded_at)}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-3">
                  <button
                    onClick={() => handleViewFile(file)}
                    className="flex-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                  >
                    👁️ ดู
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                  >
                    🗑️ ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tours Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            รายการทัวร์ ({tours.length} ทัวร์)
          </h2>
          <Link
            to={`/add?supplier_id=${supplier.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ เพิ่มทัวร์ใหม่
          </Link>
        </div>

        {tours.length > 0 ? (
          <MobileOptimizedTable
            data={tours}
            columns={tourColumns}
            loading={false}
          />
        ) : (
          <div className="p-6">
            <EmptyState
              title="ยังไม่มีทัวร์"
              message="Supplier นี้ยังไม่มีทัวร์ในระบบ"
              actionText="➕ เพิ่มทัวร์แรก"
              onAction={() => navigate(`/add?supplier_id=${supplier.id}`)}
              icon="🏝️"
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <SupplierModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        onDelete={handleSupplierDelete}
        supplier={supplier}
        isEdit={true}
      />

      <SupplierFileUpload
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onSuccess={handleFileUploadSuccess}
        supplierId={supplier.id}
      />
    </div>
  );
};

export default SupplierDetail;
