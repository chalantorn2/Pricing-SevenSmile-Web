import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { suppliersService, toursService } from "../../services/api-service";
import SupplierFilters from "../../components/supplier/SupplierFilters";
import SupplierDashboard from "../../components/supplier/SupplierDashboard";
import {
  TableSkeleton,
  CardSkeleton,
  ErrorState,
  MobileOptimizedTable,
} from "../../components/common/LoadingSkeleton";
import * as XLSX from "xlsx";

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [tours, setTours] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [activeFilters, setActiveFilters] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [showDashboard, setShowDashboard] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortSuppliers();
  }, [suppliers, tours, searchTerm, sortConfig, activeFilters]);

  // Handle URL params for direct filter links
  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam) {
      setActiveFilters([filterParam]);
      setShowDashboard(false);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both suppliers and tours data
      const [suppliersData, toursData] = await Promise.all([
        suppliersService.getAllSuppliers(),
        toursService.getAllTours(),
      ]);

      setSuppliers(suppliersData);
      setTours(toursData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล Suppliers");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSuppliers = () => {
    let filtered = suppliers.map((supplier) => {
      // Count tours for each supplier
      const supplierTours = tours.filter(
        (tour) => tour.supplier_id === supplier.id
      );
      const tourCount = supplierTours.length;

      // Get latest tour update
      const latestTourUpdate = supplierTours.reduce((latest, tour) => {
        const tourDate = new Date(tour.updated_at);
        return tourDate > latest ? tourDate : latest;
      }, new Date(supplier.updated_at));

      return {
        ...supplier,
        tour_count: tourCount,
        latest_activity: latestTourUpdate,
      };
    });

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (supplier) =>
          supplier.name?.toLowerCase().includes(searchLower) ||
          supplier.phone?.toLowerCase().includes(searchLower) ||
          supplier.line?.toLowerCase().includes(searchLower) ||
          supplier.address?.toLowerCase().includes(searchLower)
      );
    }

    // Apply smart filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter((supplier) => {
        return activeFilters.every((filterId) => {
          switch (filterId) {
            case "expiring_soon":
              const supplierTours = tours.filter(
                (tour) => tour.supplier_id === supplier.id
              );
              const now = new Date();
              const thirtyDaysLater = new Date(
                now.getTime() + 30 * 24 * 60 * 60 * 1000
              );
              return supplierTours.some((tour) => {
                if (!tour.end_date || tour.end_date === "0000-00-00")
                  return false;
                const endDate = new Date(tour.end_date);
                return endDate > now && endDate <= thirtyDaysLater;
              });

            case "no_tours":
              return supplier.tour_count === 0;

            case "incomplete_info":
              return !supplier.phone && !supplier.line;

            case "has_active_promo":
              const promoTours = tours.filter(
                (tour) =>
                  tour.supplier_id === supplier.id && tour.park_fee_included
              );
              return promoTours.length > 0;

            case "recent_activity":
              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              return new Date(supplier.updated_at) > weekAgo;

            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "tour_count") {
          aValue = parseInt(aValue) || 0;
          bValue = parseInt(bValue) || 0;
        } else if (sortConfig.key === "latest_activity") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else {
          aValue = aValue?.toString().toLowerCase() || "";
          bValue = bValue?.toString().toLowerCase() || "";
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredSuppliers(filtered);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleExportExcel = () => {
    const dataToExport =
      selectedSuppliers.length > 0
        ? filteredSuppliers.filter((s) => selectedSuppliers.includes(s.id))
        : filteredSuppliers;

    const exportData = dataToExport.map((supplier, index) => ({
      ลำดับ: index + 1,
      "ชื่อ Supplier": supplier.name,
      เบอร์โทร: supplier.phone || "-",
      "Line ID": supplier.line || "-",
      Facebook: supplier.facebook || "-",
      WhatsApp: supplier.whatsapp || "-",
      ที่อยู่: supplier.address || "-",
      จำนวนทัวร์: supplier.tour_count,
      สร้างเมื่อ: formatDate(supplier.created_at),
      อัพเดทล่าสุด: formatDate(supplier.latest_activity),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "รายการ Suppliers");

    const filename =
      selectedSuppliers.length > 0
        ? `รายการ_Suppliers_เลือก_${new Date().toLocaleDateString(
            "th-TH"
          )}.xlsx`
        : `รายการ_Suppliers_${new Date().toLocaleDateString("th-TH")}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    setShowDashboard(filters.length === 0);
  };

  const handleSelectAll = () => {
    if (selectedSuppliers.length === filteredSuppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(filteredSuppliers.map((s) => s.id));
    }
  };

  const handleSelectSupplier = (supplierId) => {
    if (selectedSuppliers.includes(supplierId)) {
      setSelectedSuppliers(selectedSuppliers.filter((id) => id !== supplierId));
    } else {
      setSelectedSuppliers([...selectedSuppliers, supplierId]);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedSuppliers.length === 0) {
      alert("กรุณาเลือก Suppliers ที่ต้องการดำเนินการ");
      return;
    }

    switch (action) {
      case "export":
        handleExportExcel();
        break;
      case "contact_check":
        const incompleteContacts = filteredSuppliers
          .filter((s) => selectedSuppliers.includes(s.id))
          .filter((s) => !s.phone && !s.line);

        if (incompleteContacts.length > 0) {
          alert(
            `พบ ${
              incompleteContacts.length
            } Suppliers ที่ข้อมูลติดต่อไม่ครบ:\n${incompleteContacts
              .map((s) => s.name)
              .join(", ")}`
          );
        } else {
          alert("Suppliers ที่เลือกมีข้อมูลติดต่อครบถ้วนแล้ว");
        }
        break;
      default:
        alert(`ฟีเจอร์ ${action} กำลังพัฒนา`);
    }
  };

  const getStatusBadge = (supplier) => {
    if (supplier.tour_count === 0) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
          ไม่มีทัวร์
        </span>
      );
    }
    if (!supplier.phone && !supplier.line) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
          ข้อมูลไม่ครบ
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
        พร้อมใช้งาน
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <CardSkeleton count={4} />
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <TableSkeleton rows={5} columns={8} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="เกิดข้อผิดพลาด"
        message={error}
        onRetry={fetchData}
        icon="🚨"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Section */}
      {showDashboard && (
        <SupplierDashboard
          suppliers={suppliers}
          tours={tours}
          loading={loading}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {showDashboard
              ? "จัดการ Suppliers"
              : `ผลการค้นหา (${filteredSuppliers.length})`}
          </h1>
          <p className="text-gray-600 mt-1">
            {showDashboard
              ? "จัดการข้อมูล Suppliers และดูทัวร์ที่เกี่ยวข้อง"
              : "แสดงผลตามฟิลเตอร์ที่เลือก"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {!showDashboard && (
            <button
              onClick={() => {
                setActiveFilters([]);
                setShowDashboard(true);
                setSearchTerm("");
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              🏠 กลับ Dashboard
            </button>
          )}
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
          >
            📊 Export Excel
          </button>
          <Link
            to="/add"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center cursor-pointer"
          >
            ➕ เพิ่มทัวร์ใหม่
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                Total Suppliers
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {suppliers.length}
              </p>
            </div>
            <div className="text-blue-500">🏢</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">มีทัวร์</p>
              <p className="text-2xl font-bold text-green-600">
                {
                  suppliers.filter((s) =>
                    tours.some((t) => t.supplier_id === s.id)
                  ).length
                }
              </p>
            </div>
            <div className="text-green-500">🏝️</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">ไม่มีทัวร์</p>
              <p className="text-2xl font-bold text-yellow-600">
                {
                  suppliers.filter(
                    (s) => !tours.some((t) => t.supplier_id === s.id)
                  ).length
                }
              </p>
            </div>
            <div className="text-yellow-500">⚠️</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">ข้อมูลไม่ครบ</p>
              <p className="text-2xl font-bold text-red-600">
                {suppliers.filter((s) => !s.phone && !s.line).length}
              </p>
            </div>
            <div className="text-red-500">📋</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="ค้นหา Supplier, เบอร์โทร, Line ID, ที่อยู่..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <SupplierFilters
              onFilterChange={handleFilterChange}
              suppliers={suppliers}
              tours={tours}
            />
            <div className="text-sm text-gray-600">
              แสดง {filteredSuppliers.length} จาก {suppliers.length} Suppliers
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSuppliers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-blue-700 font-medium">
                เลือกแล้ว {selectedSuppliers.length} Suppliers
              </span>
              <button
                onClick={() => setSelectedSuppliers([])}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                ยกเลิกการเลือก
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction("export")}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                📊 Export ที่เลือก
              </button>
              <button
                onClick={() => handleBulkAction("contact_check")}
                className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                📋 ตรวจสอบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Optimized Table */}
      <MobileOptimizedTable
        data={filteredSuppliers}
        columns={[
          {
            key: "index",
            label: "ลำดับ",
            render: (item, index) => (
              <div
                className="text-center !important"
                style={{ textAlign: "center !important" }}
              >
                {index + 1}
              </div>
            ),
          },
          {
            key: "name",
            label: "ชื่อ Supplier",
            render: (item) => (
              <div>
                <div className="font-medium">{item.name}</div>
                {item.address && (
                  <div className="text-xs text-gray-500 mt-1">
                    {item.address}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "contact",
            label: "ข้อมูลติดต่อ",
            render: (item) => (
              <div className="space-y-1">
                {item.phone && (
                  <div className="flex items-center space-x-1">
                    <span>📞</span>
                    <span>{item.phone}</span>
                  </div>
                )}
                {item.line && (
                  <div className="flex items-center space-x-1">
                    <span>💬</span>
                    <span>{item.line}</span>
                  </div>
                )}
                {!item.phone && !item.line && (
                  <span className="text-gray-400 text-xs">ไม่มีข้อมูล</span>
                )}
              </div>
            ),
          },
          {
            key: "tour_count",
            label: "จำนวนทัวร์",
            render: (item) => (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  item.tour_count > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {item.tour_count} ทัวร์
              </span>
            ),
          },
          {
            key: "status",
            label: "สถานะ",
            render: (item) => getStatusBadge(item),
          },
          {
            key: "latest_activity",
            label: "อัพเดทล่าสุด",
            render: (item) => formatDate(item.latest_activity),
          },
          {
            key: "actions",
            label: "การดำเนินการ",
            render: (item) => (
              <Link
                to={`/suppliers/${item.id}`}
                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                📋 ดูรายละเอียด
              </Link>
            ),
          },
        ]}
        loading={loading}
        selectedItems={selectedSuppliers}
        onSelectItem={handleSelectSupplier}
        onSelectAll={handleSelectAll}
        onRowClick={(supplier) => {
          // Navigate to supplier detail on row click (mobile-friendly)
          window.location.href = `/suppliers/${supplier.id}`;
        }}
      />
    </div>
  );
};

export default SupplierManagement;
