import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toursService } from "../../services/api-service";
import { DetailsModal, DocumentModal } from "../../components/modals";
import { ColumnToggle } from "../../components/core";
import * as XLSX from "xlsx";

const TourList = () => {
  // ========= State =========
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Modals (logic เดิม)
  const [selectedTour, setSelectedTour] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Columns (logic เดิม)
  const mainColumns = [
    { key: "id", label: "ลำดับ", sortable: false },
    { key: "tour_name", label: "ชื่อทัวร์", sortable: true },
    { key: "departure_from", label: "ออกจาก", sortable: true },
    { key: "adult_price", label: "ราคาผู้ใหญ่", sortable: true },
    { key: "child_price", label: "ราคาเด็ก", sortable: true },
    { key: "details", label: "รายละเอียดเพิ่มเติม", sortable: false },
    { key: "documents", label: "ดูเอกสาร", sortable: false },
  ];

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

  // ========= Effects (logic เดิม) =========
  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    filterAndSortTours();
  }, [tours, searchTerm, sortConfig]);

  // ========= Data/Logic (เดิม) =========
  const fetchTours = async () => {
    try {
      setLoading(true);
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
    const searchLower = searchTerm.toLowerCase().trim();
    let filtered = tours.filter((tour) => {
      return (
        tour.tour_name?.toLowerCase().includes(searchLower) ||
        tour.supplier_name?.toLowerCase().includes(searchLower) ||
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
    if (!endDate || endDate === "0000-00-00") return false;
    return new Date(endDate) < new Date();
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatPrice = (price) => {
    // รองรับทั้ง number และ string ที่เป็นตัวเลข
    const n =
      typeof price === "number"
        ? price
        : Number(String(price ?? "").replace(/[, ]/g, ""));
    if (Number.isNaN(n)) return "-";
    return new Intl.NumberFormat("th-TH").format(n);
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

  const handleExportExcel = () => {
    const exportData = filteredTours.map((tour, index) => ({
      ลำดับ: index + 1,
      ชื่อทัวร์: tour.tour_name,
      Supplier: tour.supplier_name,
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
    setVisibleColumns((prev) => ({ ...prev, [columnKey]: !prev[columnKey] }));
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

  // ========= UI =========
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">รายการทัวร์</h1>
          <p className="text-sm text-gray-500 mt-1">
            จัดการราคาและรายละเอียดทัวร์ทั้งหมดในระบบ
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 active:scale-[.98] shadow-sm"
          >
            <span>📊</span>
            <span>Export Excel</span>
          </button>
          <Link
            to="/add"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 active:scale-[.98] shadow-sm"
          >
            <span>➕</span>
            <span>เพิ่มราคาใหม่</span>
          </Link>
        </div>
      </div>

      {/* Search & View Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="tour-search" className="sr-only">
              ค้นหารายการทัวร์
            </label>
            <div className="relative">
              <input
                id="tour-search"
                type="text"
                placeholder="ค้นหา: ชื่อทัวร์, Supplier, ออกจาก, ท่าเรือ, หมายเหตุ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <svg
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </div>
          </div>

          {/* Result count */}
          <div className="text-sm text-gray-600 flex items-center">
            แสดง{" "}
            <span className="mx-1 font-medium">{filteredTours.length}</span> จาก{" "}
            <span className="mx-1 font-medium">{tours.length}</span> รายการ
          </div>
        </div>

        {/* Table toggle & Column controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseMainTable(!useMainTable)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors border ${
                useMainTable
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
              title="สลับรูปแบบคอลัมน์"
            >
              {useMainTable ? "📋 ตารางย่อ" : "📊 ตารางเต็ม"}
            </button>

            {!useMainTable && (
              <div className="ml-1">
                <ColumnToggle
                  columns={allColumns}
                  visibleColumns={visibleColumns}
                  onToggleColumn={toggleColumn}
                />
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500">
            {useMainTable ? "แสดงคอลัมน์หลัก 7 คอลัมน์" : "แสดงตารางแบบเต็ม"}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
              <tr className="border-b border-gray-200">
                {currentColumns.map((column) => {
                  if (!showColumn(column.key)) return null;
                  const active = sortConfig.key === column.key;
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      className={`px-6 py-3 text-left uppercase tracking-wider text-[11px] font-semibold ${
                        column.sortable ? "cursor-pointer select-none" : ""
                      }`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="inline-flex items-center gap-1">
                        <span>{column.label}</span>
                        {column.sortable && (
                          <span
                            className={`${
                              active ? "text-gray-800" : "text-gray-400"
                            }`}
                          >
                            {active
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

            <tbody className="divide-y divide-gray-100">
              {filteredTours.map((tour, index) => {
                const expired = isExpired(tour.end_date);

                return (
                  <tr
                    key={tour.id}
                    className={`group hover:bg-gray-50 transition ${
                      expired ? "opacity-95" : ""
                    }`}
                  >
                    {/* Index */}
                    {showColumn("id") && (
                      <td className="px-6 py-3 whitespace-nowrap text-gray-900">
                        {index + 1}
                      </td>
                    )}

                    {/* Tour Name + Supplier */}
                    {showColumn("tour_name") && (
                      <td className="px-6 py-3 align-top">
                        <div className="font-medium text-gray-900 leading-5">
                          {tour.tour_name}
                        </div>
                        {tour.supplier_name && (
                          <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-600">
                            <span aria-hidden>🏢</span>
                            <span className="truncate">
                              {tour.supplier_name}
                            </span>
                          </div>
                        )}
                      </td>
                    )}

                    {/* Departure From */}
                    {showColumn("departure_from") && (
                      <td className="px-6 py-3 whitespace-nowrap text-gray-900">
                        {tour.departure_from || "-"}
                      </td>
                    )}

                    {/* Pier */}
                    {showColumn("pier") && (
                      <td className="px-6 py-3 whitespace-nowrap text-gray-900">
                        {tour.pier || "-"}
                      </td>
                    )}

                    {/* Adult Price */}
                    {showColumn("adult_price") && (
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div
                          className="inline-flex items-baseline gap-1 rounded-md bg-emerald-50 px-2 py-1
                   ring-1 ring-emerald-200 transition transform
                   group-hover:scale-115 
                   group-hover:bg-emerald-100 group-hover:ring-emerald-300"
                        >
                          <span className="font-semibold text-emerald-700">
                            ฿{formatPrice(tour.adult_price)}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Child Price */}
                    {showColumn("child_price") && (
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div
                          className="inline-flex items-baseline gap-1 rounded-md bg-cyan-50 px-2 py-1
                   ring-1 ring-cyan-200 transition transform
                   group-hover:scale-110
                   group-hover:bg-cyan-100 group-hover:ring-cyan-300"
                        >
                          <span className="font-semibold text-cyan-700">
                            ฿{formatPrice(tour.child_price)}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Notes */}
                    {showColumn("notes") && (
                      <td className="px-6 py-3">
                        <div className="whitespace-pre-wrap leading-5 text-gray-800">
                          {getNotesWithExpiry(tour)}
                        </div>
                      </td>
                    )}

                    {/* Updated At */}
                    {showColumn("updated_at") && (
                      <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                        {tour.updated_at ? formatDate(tour.updated_at) : "-"}
                      </td>
                    )}

                    {/* Updated By */}
                    {showColumn("updated_by") && (
                      <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                        {tour.updated_by || "-"}
                      </td>
                    )}

                    {/* Actions (main table only) */}
                    {useMainTable && (
                      <>
                        <td className="px-6 py-3 whitespace-nowrap text-center">
                          <button
                            onClick={() => openDetailsModal(tour)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-100 active:scale-[.98] text-xs"
                            title="ดูรายละเอียด"
                          >
                            <span aria-hidden>📋</span>
                            <span>ดูรายละเอียด</span>
                          </button>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-center">
                          <button
                            onClick={() => openDocumentModal(tour)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-100 active:scale-[.98] text-xs"
                            title="ดูเอกสาร"
                          >
                            <span aria-hidden>📎</span>
                            <span>ดูเอกสาร</span>
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

      {/* Modals (logic เดิม) */}
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

export default TourList;
