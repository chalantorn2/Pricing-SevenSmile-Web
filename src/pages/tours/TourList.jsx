import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toursService } from "../../services/api-service";
import { TourDetailsModal } from "../../components/tours";
import { DocumentModal } from "../../components/common";
import { ColumnToggle } from "../../components/core";
import * as XLSX from "xlsx";
import {
  MapPin,
  X,
  FileSpreadsheet,
  Plus,
  Building2,
  FileText,
  Paperclip,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  LayoutList,
  Table2,
} from "lucide-react";

const TourList = () => {
  // ========= State =========
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchParams] = useSearchParams();
  const activeProvince = searchParams.get("province");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modals (existing logic)
  const [selectedTour, setSelectedTour] = useState(null);
  const [showTourDetailsModal, setShowTourDetailsModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Columns (existing logic)
  const mainColumns = [
    { key: "id", label: "No.", sortable: false },
    { key: "tour_name", label: "Tour name", sortable: true },
    { key: "departure_from", label: "Departure from", sortable: true },
    { key: "adult_price", label: "Adult price", sortable: true },
    { key: "child_price", label: "Child price", sortable: true },
    { key: "details", label: "More details", sortable: false },
    { key: "documents", label: "View documents", sortable: false },
  ];

  const allColumns = [
    { key: "id", label: "No.", sortable: false },
    { key: "tour_name", label: "Tour name", sortable: true },
    { key: "departure_from", label: "Departure from", sortable: true },
    { key: "pier", label: "Pier", sortable: true },
    { key: "adult_price", label: "Adult price", sortable: true },
    { key: "child_price", label: "Child price", sortable: true },
    { key: "notes", label: "Notes", sortable: false },
    { key: "updated_at", label: "Updated at", sortable: true },
    { key: "updated_by", label: "Updated by", sortable: true },
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

  // ========= Effects (existing logic) =========
  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    filterAndSortTours();
  }, [tours, searchTerm, sortConfig, activeProvince]);

  // Reset to first page when filters/search/sort/pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig, activeProvince, pageSize]);

  // ========= Data/Logic (existing) =========
  const fetchTours = async () => {
    try {
      setLoading(true);
      const data = await toursService.getAllTours();
      setTours(data);
    } catch (error) {
      console.error("Error fetching tours:", error);
      alert("An error occurred while loading data");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTours = () => {
    const searchLower = searchTerm.toLowerCase().trim();
    let filtered = tours.filter((tour) => {
      // Province filter (from sidebar submenu)
      if (
        activeProvince &&
        (tour.departure_from || "").trim().toLowerCase() !==
          activeProvince.trim().toLowerCase()
      ) {
        return false;
      }
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
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatPrice = (price) => {
    // Support both number and numeric string
    const n =
      typeof price === "number"
        ? price
        : Number(String(price ?? "").replace(/[, ]/g, ""));
    if (Number.isNaN(n)) return "-";
    return new Intl.NumberFormat("en-US").format(n);
  };

  const getNotesWithExpiry = (tour) => {
    let notes = tour.notes || "";
    notes =
      (tour.park_fee_included
        ? "This Net price includes the park fee"
        : "This Net price does not include the park fee") + (notes ? ` | ${notes}` : "");

    if (isExpired(tour.end_date)) {
      notes += " | ⚠️ Expired, please renew";
    }
    return notes;
  };

  const handleExportExcel = () => {
    const exportData = filteredTours.map((tour, index) => ({
      "No.": index + 1,
      "Tour name": tour.tour_name,
      Supplier: tour.supplier_name,
      "Departure from": tour.departure_from,
      Pier: tour.pier,
      "Adult price": tour.adult_price,
      "Child price": tour.child_price,
      Notes: getNotesWithExpiry(tour),
      "Start date": new Date(tour.start_date).toLocaleDateString("en-US"),
      "End date": new Date(tour.end_date).toLocaleDateString("en-US"),
      "Updated at": formatDate(tour.updated_at),
      "Updated by": tour.updated_by,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tour Prices");
    XLSX.writeFile(
      wb,
      `Tour_Prices_${new Date().toLocaleDateString("en-US")}.xlsx`
    );
  };

  const toggleColumn = (columnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [columnKey]: !prev[columnKey] }));
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

  // ========= UI =========
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  const currentColumns = useMainTable ? mainColumns : allColumns;
  const showColumn = useMainTable
    ? (key) => mainColumns.some((col) => col.key === key)
    : (key) => visibleColumns[key];

  // Pagination derived values
  const totalItems = filteredTours.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedTours = filteredTours.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-gray-900">Tour List</h1>
            {activeProvince && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                <MapPin className="w-4 h-4" />
                {activeProvince}
                <Link to="/" className="ml-1 text-blue-500 hover:text-blue-800">
                  <X className="w-4 h-4" />
                </Link>
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {activeProvince
              ? `Showing tours departing from ${activeProvince}`
              : "Manage all tour prices and details in the system"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 active:scale-[.98] shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <Link
            to="/add"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 active:scale-[.98] shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add new price</span>
          </Link>
        </div>
      </div>

      {/* Search & View Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="tour-search" className="sr-only">
              Search tours
            </label>
            <div className="relative">
              <input
                id="tour-search"
                type="text"
                placeholder="Search: tour name, Supplier, departure, pier, notes..."
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
            Showing{" "}
            <span className="mx-1 font-medium">{filteredTours.length}</span> of{" "}
            <span className="mx-1 font-medium">{tours.length}</span> items
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
              title="Switch column layout"
            >
              <span className="inline-flex items-center gap-1.5">
                {useMainTable ? (
                  <LayoutList className="w-4 h-4" />
                ) : (
                  <Table2 className="w-4 h-4" />
                )}
                {useMainTable ? "Compact table" : "Full table"}
              </span>
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
            {useMainTable ? "Showing 7 main columns" : "Showing full table"}
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
                        {column.sortable &&
                          (active ? (
                            sortConfig.direction === "asc" ? (
                              <ChevronUp className="w-3.5 h-3.5 text-gray-800" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-gray-800" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" />
                          ))}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginatedTours.map((tour, index) => {
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
                        {startIndex + index + 1}
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
                            <Building2 className="w-3.5 h-3.5" />
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
                   group-hover:scale-125
                   group-hover:bg-emerald-100 group-hover:ring-emerald-300"
                        >
                          <span className="font-semibold text-emerald-700">
                            THB {formatPrice(tour.adult_price)}
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
                   group-hover:scale-115
                   group-hover:bg-cyan-100 group-hover:ring-cyan-300"
                        >
                          <span className="font-semibold text-cyan-700">
                            THB {formatPrice(tour.child_price)}
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
                            onClick={() => openTourDetailsModal(tour)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 hover:bg-blue-100 active:scale-[.98] text-xs"
                            title="View details"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View details</span>
                          </button>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-center">
                          <button
                            onClick={() => openDocumentModal(tour)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-100 active:scale-[.98] text-xs"
                            title="View documents"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>View documents</span>
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
            <p className="text-gray-500">No matching data found</p>
          </div>
        )}

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>
                Showing{" "}
                <span className="font-medium">{startIndex + 1}</span>–
                <span className="font-medium">
                  {Math.min(startIndex + pageSize, totalItems)}
                </span>{" "}
                of <span className="font-medium">{totalItems}</span>
              </span>
              <span className="hidden sm:inline text-gray-300">|</span>
              <label className="flex items-center gap-2">
                <span>Per page</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safePage === 1}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-600">
                Page <span className="font-medium">{safePage}</span> /{" "}
                <span className="font-medium">{totalPages}</span>
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals (existing logic) */}
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

export default TourList;
