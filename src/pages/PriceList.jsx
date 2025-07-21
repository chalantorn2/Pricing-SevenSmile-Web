import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toursService } from "../services/api-service";
import DetailsModal from "../components/DetailsModal";
import DocumentModal from "../components/DocumentModal";
import ColumnToggle from "../components/ColumnToggle";
import * as XLSX from "xlsx";

const PriceList = () => {
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Modal states
  const [selectedTour, setSelectedTour] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Main table columns (updated structure)
  const mainColumns = [
    { key: "id", label: "ลำดับ", sortable: false },
    { key: "tour_name", label: "ชื่อทัวร์", sortable: true },
    { key: "departure_from", label: "ออกจาก", sortable: true },
    { key: "adult_price", label: "ราคาผู้ใหญ่", sortable: true },
    { key: "child_price", label: "ราคาเด็ก", sortable: true },
    { key: "details", label: "รายละเอียดเพิ่มเติม", sortable: false },
    { key: "documents", label: "ดูเอกสาร", sortable: false },
  ];

  // All columns for column toggle (removed sub_agent_name, added back other fields)
  const allColumns = [
    { key: "id", label: "ลำดับ", sortable: false },
    { key: "tour_name", label: "ชื่อทัวร์", sortable: true },
    { key: "departure_from", label: "ออกจาก", sortable: true },
    { key: "pier", label: "ท่าเรือ", sortable: true },
    { key: "adult_price", label: "ราคาผู้ใหญ่", sortable: true },
    { key: "child_price", label: "ราคาเด็ก", sortable: true },
    { key: "notes", label: "หมายเหตุ", sortable: false },
    { key: "updated_at", label: "อัพเดทเมื่อ", sortable: true },
    { key: "updated_by", label: "อัพเดทโดย", sortable: true },
  ];

  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    tour_name: true,
    departure_from: true,
    pier: false,
    adult_price: true,
    child_price: true,
    notes: false,
    updated_at: false,
    updated_by: false,
  });

  const [useMainTable, setUseMainTable] = useState(true);

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    filterAndSortTours();
  }, [tours, searchTerm, sortConfig]);

  const fetchTours = async () => {
    try {
      const data = await toursService.getAllTours();
      setTours(data);
    } catch (error) {
      console.error("Error fetching tours:", error);
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTours = () => {
    let filtered = tours.filter((tour) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        tour.tour_name?.toLowerCase().includes(searchLower) ||
        tour.sub_agent_name?.toLowerCase().includes(searchLower) ||
        tour.departure_from?.toLowerCase().includes(searchLower) ||
        tour.pier?.toLowerCase().includes(searchLower) ||
        tour.notes?.toLowerCase().includes(searchLower) ||
        tour.updated_by?.toLowerCase().includes(searchLower)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key.includes("price")) {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        } else if (sortConfig.key === "updated_at") {
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

    setFilteredTours(filtered);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("th-TH").format(price);
  };

  const getNotesWithExpiry = (tour) => {
    let notes = tour.notes || "";
    if (tour.park_fee_included) {
      notes = "ราคา Net นี้ รวมค่าอุทยานแล้ว" + (notes ? ` | ${notes}` : "");
    } else {
      notes = "ราคา Net นี้ ยังไม่รวมค่าอุทยาน" + (notes ? ` | ${notes}` : "");
    }

    if (isExpired(tour.end_date)) {
      notes += " | ⚠️ หมดอายุแล้ว กรุณาต่ออายุ";
    }

    return notes;
  };

  const handleExportExcel = () => {
    const exportData = filteredTours.map((tour, index) => ({
      ลำดับ: index + 1,
      ชื่อทัวร์: tour.tour_name,
      "Sub Agent": tour.sub_agent_name,
      ออกจาก: tour.departure_from,
      ท่าเรือ: tour.pier,
      ราคาผู้ใหญ่: tour.adult_price,
      ราคาเด็ก: tour.child_price,
      หมายเหตุ: getNotesWithExpiry(tour),
      วันที่เริ่มต้น: new Date(tour.start_date).toLocaleDateString("th-TH"),
      วันที่สิ้นสุด: new Date(tour.end_date).toLocaleDateString("th-TH"),
      อัพเดทเมื่อ: formatDate(tour.updated_at),
      อัพเดทโดย: tour.updated_by,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ราคาทัวร์");
    XLSX.writeFile(
      wb,
      `ราคาทัวร์_${new Date().toLocaleDateString("th-TH")}.xlsx`
    );
  };

  const toggleColumn = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const openDetailsModal = (tour) => {
    setSelectedTour(tour);
    setShowDetailsModal(true);
  };

  const openDocumentModal = (tour) => {
    setSelectedTour(tour);
    setShowDocumentModal(true);
  };

  const closeModals = () => {
    setShowDetailsModal(false);
    setShowDocumentModal(false);
    setSelectedTour(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentColumns = useMainTable ? mainColumns : allColumns;
  const showColumn = useMainTable
    ? (key) => mainColumns.some((col) => col.key === key)
    : (key) => visibleColumns[key];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">รายการราคาทัวร์</h1>
        <div className="flex flex-col sm:flex-row gap-3">
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
            ➕ เพิ่มราคาใหม่
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="ค้นหาทัวร์, Sub Agent, ออกจาก, ท่าเรือ, หมายเหตุ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-sm text-gray-600 flex items-center">
            แสดง {filteredTours.length} จาก {tours.length} รายการ
          </div>
        </div>

        {/* Table View Toggle & Column Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setUseMainTable(!useMainTable)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                useMainTable
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {useMainTable ? "📋 ตารางย่อ" : "📊 ตารางเต็ม"}
            </button>
            {!useMainTable && (
              <ColumnToggle
                columns={allColumns}
                visibleColumns={visibleColumns}
                onToggleColumn={toggleColumn}
              />
            )}
          </div>
          <div className="text-xs text-gray-500">
            {useMainTable ? "แสดงคอลัมน์หลัก 7 คอลัมน์" : "แสดงตารางแบบเต็ม"}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {currentColumns.map((column) => {
                  if (!showColumn(column.key)) return null;
                  return (
                    <th
                      key={column.key}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        column.sortable
                          ? "cursor-pointer hover:bg-gray-100"
                          : ""
                      }`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.label}</span>
                        {column.sortable && (
                          <span className="text-gray-400">
                            {sortConfig.key === column.key
                              ? sortConfig.direction === "asc"
                                ? "↑"
                                : "↓"
                              : "↕"}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTours.map((tour, index) => {
                const expired = isExpired(tour.end_date);
                return (
                  <tr
                    key={tour.id}
                    className={`price-hover hover:bg-gray-50 ${
                      expired ? "row-expired" : ""
                    }`}
                  >
                    {/* ID Column */}
                    {showColumn("id") && (
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                        {index + 1}
                      </td>
                    )}

                    {/* Tour Name + Sub Agent Column */}
                    {showColumn("tour_name") && (
                      <td className="px-6 py-4 text-base text-gray-900 max-w-xs">
                        <div className="font-medium leading-5 mb-1">
                          {tour.tour_name}
                        </div>
                        <div className="sub-agent-name">
                          <span>🏢</span>
                          <span>{tour.sub_agent_name}</span>
                        </div>
                      </td>
                    )}

                    {/* Departure From */}
                    {showColumn("departure_from") && (
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                        {tour.departure_from}
                      </td>
                    )}

                    {/* Pier */}
                    {showColumn("pier") && (
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                        {tour.pier}
                      </td>
                    )}

                    {/* Adult Price */}
                    {showColumn("adult_price") && (
                      <td className="px-6 py-4 whitespace-nowrap price-cell">
                        <div className="price-container">
                          <div className="price-adult">
                            <span>฿{formatPrice(tour.adult_price)}</span>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Child Price */}
                    {showColumn("child_price") && (
                      <td className="px-6 py-4 whitespace-nowrap price-cell">
                        <div className="price-container">
                          <div className="price-child">
                            <span>฿{formatPrice(tour.child_price)}</span>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Notes */}
                    {showColumn("notes") && (
                      <td className="px-6 py-4 text-base text-gray-900 max-w-sm">
                        <div className="whitespace-pre-wrap leading-4">
                          {getNotesWithExpiry(tour)}
                        </div>
                      </td>
                    )}

                    {/* Updated At */}
                    {showColumn("updated_at") && (
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                        {formatDate(tour.updated_at)}
                      </td>
                    )}

                    {/* Updated By */}
                    {showColumn("updated_by") && (
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                        {tour.updated_by}
                      </td>
                    )}

                    {/* Main Table Action Buttons */}
                    {useMainTable && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => openDetailsModal(tour)}
                            className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm cursor-pointer"
                          >
                            📋 ดูรายละเอียด
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => openDocumentModal(tour)}
                            className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm cursor-pointer"
                          >
                            📎 ดูเอกสาร
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTours.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">ไม่พบข้อมูลที่ค้นหา</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <DetailsModal
        isOpen={showDetailsModal}
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

export default PriceList;
