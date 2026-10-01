import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toursService } from "../../services/api-service";
import { useI18n } from "../../i18n";
import { TourDetailsModal } from "../../components/tours";
import { DocumentModal } from "../../components/common";
import { Toast } from "../../components/core";
import {
  hasCache,
  readCache,
  writeCache,
  isExpired,
  isSupplierActive,
} from "../../utils";
import {
  MapPin,
  X,
  FileSpreadsheet,
  Plus,
  Building2,
  FileText,
  Paperclip,
  Pencil,
  Link2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  AlertTriangle,
  RotateCcw,
  Star,
  CalendarDays,
} from "lucide-react";

// Labels are i18n keys — the header row renders them through t().
const columns = [
  { key: "id", label: "tours.col.no", sortable: false },
  { key: "tour_name", label: "tours.col.name", sortable: true },
  { key: "departure_from", label: "tours.col.departure", sortable: true },
  { key: "destination", label: "tours.col.destination", sortable: true },
  { key: "adult_price", label: "tours.col.adultPrice", sortable: true, align: "right" },
  { key: "child_price", label: "tours.col.childPrice", sortable: true, align: "right" },
];

// A <select> that shrinks to the width of the option currently selected.
// The native select is taken out of flow (absolute + transparent) so its own
// intrinsic width — always the widest option — never drives the layout; the
// visible label span sizes the control instead.
const FitSelect = ({ value, onChange, options, ariaLabel }) => {
  const selectedLabel =
    options.find((opt) => opt.value === value)?.label ?? options[0]?.label;

  return (
    <span className="relative inline-flex items-center self-start max-w-full lg:max-w-xs rounded-lg border border-gray-300 bg-white pl-3 pr-8 py-2 text-sm text-gray-900 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500">
      <span className="truncate">{selectedLabel}</span>
      <ChevronDown className="pointer-events-none absolute right-2.5 w-4 h-4 text-gray-500" />
      <select
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </span>
  );
};

// First page, last page, and the pages either side of the current one, with
// "gap" markers standing in for the ranges that get collapsed.
const getPageItems = (current, total) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const visible = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  return visible.flatMap((page, i) =>
    i > 0 && page - visible[i - 1] > 1 ? ["gap", page] : [page]
  );
};

const formatDate = (dateString, locale) =>
  new Date(dateString).toLocaleDateString(locale, {
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

const getNotesWithExpiry = (tour, t) => {
  let notes = tour.notes || "";
  notes =
    (tour.park_fee_included
      ? t("tour.parkFeeIncludedNote")
      : t("tour.parkFeeExcludedNote")) +
    (notes ? ` | ${notes}` : "");

  if (isExpired(tour.end_date)) {
    notes += ` | ${t("tour.expiredRenew")}`;
  }
  return notes;
};

const CACHE_KEY = "tours";

const TourList = () => {
  const { t, lang } = useI18n();

  // ========= State =========
  const [tours, setTours] = useState(() => readCache(CACHE_KEY) || []);
  const [loading, setLoading] = useState(() => !hasCache(CACHE_KEY));
  const [loadError, setLoadError] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchParams] = useSearchParams();
  const activeProvince = searchParams.get("province");

  // Deep links from the home screen land here as /tours?q=... (quick search)
  // and /tours?status=expired (the expired pill) — seed the filters from them.
  const initialSearch = searchParams.get("q") || "";
  const initialStatus = ["all", "active", "expired"].includes(
    searchParams.get("status")
  )
    ? searchParams.get("status")
    : "all";

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [supplierFilter, setSupplierFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus); // all | active | expired
  const [frequentOnly, setFrequentOnly] = useState(false);
  // Ids currently being pinned/unpinned, so the star can't be double-clicked
  const [pendingFrequent, setPendingFrequent] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modals
  const [selectedTour, setSelectedTour] = useState(null);
  const [showTourDetailsModal, setShowTourDetailsModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  // Bulk date renewal: tick tours, pick new dates, save once
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDates, setBulkDates] = useState({
    start_date: "",
    end_date: "",
    no_end_date: false,
  });
  const [bulkSaving, setBulkSaving] = useState(false);

  // ========= Effects =========
  useEffect(() => {
    fetchTours();
  }, []);

  // Debounce the search box so typing stays responsive on large lists
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to first page when filters/search/sort/pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    supplierFilter,
    destinationFilter,
    statusFilter,
    sortConfig,
    activeProvince,
    pageSize,
  ]);

  // ========= Data/Logic =========
  const fetchTours = async () => {
    try {
      // A cached list is already on screen: refresh it in place rather than
      // replacing it with a skeleton.
      if (!hasCache(CACHE_KEY)) setLoading(true);
      setLoadError(null);
      const data = await toursService.getAllTours();
      setTours(writeCache(CACHE_KEY, data));
    } catch (error) {
      console.error("Error fetching tours:", error);
      setLoadError(error?.message || t("tour.loadError"));
    } finally {
      setLoading(false);
    }
  };

  // Tours of a supplier that has been switched off stay in the database (and on
  // the supplier's own page) but drop out of this list and its filters.
  const activeTours = useMemo(
    () => tours.filter((tour) => isSupplierActive(tour.supplier_active)),
    [tours]
  );

  // Options for the filter dropdowns, derived from the loaded data
  const supplierOptions = useMemo(
    () =>
      [...new Set(activeTours.map((t) => t.supplier_name).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [activeTours]
  );

  const destinationOptions = useMemo(
    () =>
      [...new Set(activeTours.map((t) => t.destination).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [activeTours]
  );

  const expiredCount = useMemo(
    () => activeTours.filter((t) => isExpired(t.end_date)).length,
    [activeTours]
  );

  const filteredTours = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();

    const filtered = activeTours.filter((tour) => {
      // Province filter (from sidebar submenu) — by destination
      if (
        activeProvince &&
        (tour.destination || "").trim().toLowerCase() !==
          activeProvince.trim().toLowerCase()
      ) {
        return false;
      }
      if (frequentOnly && Number(tour.is_frequent) !== 1) return false;
      if (supplierFilter && tour.supplier_name !== supplierFilter) return false;
      if (destinationFilter && tour.destination !== destinationFilter) {
        return false;
      }
      if (statusFilter !== "all") {
        const expired = isExpired(tour.end_date);
        if (statusFilter === "expired" && !expired) return false;
        if (statusFilter === "active" && expired) return false;
      }
      if (!searchLower) return true;

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
    } else {
      // No column chosen: the tours the office sells often come first, and the
      // API's "most recently updated" order is preserved within each group.
      filtered.sort(
        (a, b) => Number(b.is_frequent || 0) - Number(a.is_frequent || 0)
      );
    }

    return filtered;
  }, [
    activeTours,
    searchTerm,
    supplierFilter,
    destinationFilter,
    statusFilter,
    frequentOnly,
    sortConfig,
    activeProvince,
  ]);

  // Drop ticks on tours a filter change has hidden, so Save never touches a
  // tour the user can no longer see.
  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.length === 0) return prev;
      const visible = new Set(filteredTours.map((tour) => tour.id));
      const next = prev.filter((id) => visible.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [filteredTours]);

  const allFilteredSelected =
    filteredTours.length > 0 && selectedIds.length === filteredTours.length;

  const toggleSelectTour = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Header checkbox covers every tour matching the filters, not just this page
  const toggleSelectAllFiltered = () => {
    setSelectedIds(
      allFilteredSelected ? [] : filteredTours.map((tour) => tour.id)
    );
  };

  const flashToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleBulkDatesSave = async () => {
    const { start_date, end_date, no_end_date } = bulkDates;
    if (selectedIds.length === 0) return;
    if (!no_end_date && !end_date) {
      flashToast(t("tours.bulkDates.endRequired"));
      return;
    }
    if (!no_end_date) {
      const byId = new Map(tours.map((tour) => [tour.id, tour]));
      const clash = selectedIds.some((id) => {
        const start = start_date || byId.get(id)?.start_date;
        return start && start !== "0000-00-00" && end_date <= start.slice(0, 10);
      });
      if (clash) {
        flashToast(t("tour.validation.endAfterStart"));
        return;
      }
    }

    setBulkSaving(true);
    try {
      await toursService.bulkUpdateDates(selectedIds, bulkDates);
      const ids = new Set(selectedIds);
      setTours((prev) =>
        writeCache(
          CACHE_KEY,
          prev.map((tour) =>
            ids.has(tour.id)
              ? {
                  ...tour,
                  start_date: start_date || tour.start_date,
                  end_date: no_end_date ? null : end_date,
                }
              : tour
          )
        )
      );
      flashToast(t("tours.bulkDates.saved", { count: selectedIds.length }));
      setSelectedIds([]);
      setBulkDates({ start_date: "", end_date: "", no_end_date: false });
    } catch (error) {
      console.error("Bulk date update failed:", error);
      flashToast(error?.message || t("tours.bulkDates.failed"));
    } finally {
      setBulkSaving(false);
    }
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(supplierFilter) ||
    Boolean(destinationFilter) ||
    frequentOnly ||
    statusFilter !== "all";

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setSupplierFilter("");
    setDestinationFilter("");
    setStatusFilter("all");
    setFrequentOnly(false);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // xlsx is ~400 KB parsed: pulled in on demand so the list screen does not pay
  // for a button most visits never press.
  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");
    const locale = lang === "th" ? "th-TH" : "en-US";
    const exportData = filteredTours.map((tour, index) => ({
      [t("common.number")]: index + 1,
      [t("tours.col.name")]: tour.tour_name,
      [t("tours.filterSupplier")]: tour.supplier_name,
      [t("tours.col.departure")]: tour.departure_from,
      [t("tours.col.destination")]: tour.destination,
      [t("tour.field.pier")]: tour.pier,
      [t("tours.col.adultPrice")]: tour.adult_price,
      [t("tours.col.childPrice")]: tour.child_price,
      [t("common.note")]: getNotesWithExpiry(tour, t),
      [t("tour.field.startDate")]: new Date(tour.start_date).toLocaleDateString(locale),
      [t("tour.field.endDate")]: new Date(tour.end_date).toLocaleDateString(locale),
      [t("suppliers.updated")]: formatDate(tour.updated_at, locale),
      [t("tour.field.updatedBy")]: tour.updated_by,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tour Prices");
    XLSX.writeFile(
      wb,
      `Tour_Prices_${new Date().toLocaleDateString("en-US")}.xlsx`
    );
  };

  const openTourDetailsModal = (tour) => {
    setSelectedTour(tour);
    setShowTourDetailsModal(true);
  };

  const openDocumentModal = (tour) => {
    setSelectedTour(tour);
    setShowDocumentModal(true);
  };

  const handleCopyTourLink = async (tour) => {
    const url = `${window.location.origin}/tour/${tour.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast(t("tours.linkCopied"));
    } catch {
      setToast(t("tours.linkCopyError"));
    }
    setTimeout(() => setToast(null), 1500);
  };

  const closeModals = () => {
    setShowTourDetailsModal(false);
    setShowDocumentModal(false);
    setSelectedTour(null);
  };

  // ========= Derived =========
  const totalItems = filteredTours.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedTours = filteredTours.slice(startIndex, startIndex + pageSize);

  // ========= Sub-renders =========
  // In the desktop table the buttons stay dimmed until the row is hovered or
  // something inside them takes focus; the mobile cards always show them.
  // Pin / unpin "frequently used". Updated locally first so the list re-orders
  // straight away, and rolled back if the write fails.
  const handleToggleFrequent = async (tour) => {
    const next = Number(tour.is_frequent) === 1 ? 0 : 1;
    setPendingFrequent((prev) => [...prev, tour.id]);
    setTours((prev) =>
      prev.map((t) => (t.id === tour.id ? { ...t, is_frequent: next } : t))
    );
    try {
      await toursService.setFrequent(tour.id, next);
    } catch (error) {
      console.error("Failed to update frequently-used flag", error);
      setTours((prev) =>
        prev.map((t) =>
          t.id === tour.id ? { ...t, is_frequent: tour.is_frequent } : t
        )
      );
      setToast({ message: t("tours.pinError"), type: "error" });
    } finally {
      setPendingFrequent((prev) => prev.filter((id) => id !== tour.id));
    }
  };

  // Always visible (unlike the hover actions) - a pin only helps if you can see it.
  const renderFrequentButton = (tour) => {
    const pinned = Number(tour.is_frequent) === 1;
    return (
      <button
        type="button"
        onClick={() => handleToggleFrequent(tour)}
        disabled={pendingFrequent.includes(tour.id)}
        aria-pressed={pinned}
        title={pinned ? t("tours.unpin") : t("tours.pin")}
        aria-label={`${pinned ? t("tours.unpin") : t("tours.pin")} ${tour.tour_name}`}
        className={`inline-flex shrink-0 items-center justify-center w-6 h-6 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50 ${
          pinned
            ? "text-warning-500 hover:text-warning-600"
            : "text-gray-300 hover:text-warning-500"
        }`}
      >
        <Star className={`w-4 h-4 ${pinned ? "fill-current" : ""}`} />
      </button>
    );
  };

  const renderActions = (tour, { revealOnHover = false } = {}) => (
    <div
      className={`inline-flex items-center gap-1 ${
        revealOnHover
          ? "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
          : ""
      }`}
    >
      <button
        onClick={() => openTourDetailsModal(tour)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[.98]"
        title={t("tours.viewDetails")}
        aria-label={`${t("tours.viewDetails")} ${tour.tour_name}`}
      >
        <FileText className="w-4 h-4" />
      </button>
      <button
        onClick={() => openDocumentModal(tour)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[.98]"
        title={t("tours.viewDocuments")}
        aria-label={`${t("tours.viewDocuments")} ${tour.tour_name}`}
      >
        <Paperclip className="w-4 h-4" />
      </button>
      <Link
        to={`/edit/${tour.id}`}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[.98]"
        title={t("common.edit")}
        aria-label={`${t("common.edit")} ${tour.tour_name}`}
      >
        <Pencil className="w-4 h-4" />
      </Link>
      <button
        onClick={() => handleCopyTourLink(tour)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[.98]"
        title={t("tours.copyLink")}
        aria-label={`${t("tours.copyLink")} ${tour.tour_name}`}
      >
        <Link2 className="w-4 h-4" />
      </button>
    </div>
  );

  const renderEmptyState = () => {
    if (hasActiveFilters || activeProvince) {
      return (
        <div className="text-center py-12 px-6">
          <p className="text-gray-500 font-medium">{t("tours.noMatches")}</p>
          <p className="text-sm text-gray-500 mt-1">
            {t("tours.noMatchesHint")}
          </p>
          {/* Frequently used */}
          <button
            type="button"
            onClick={() => setFrequentOnly((on) => !on)}
            aria-pressed={frequentOnly}
            className={`inline-flex items-center justify-center gap-1.5 self-start px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
              frequentOnly
                ? "border-warning-400 bg-warning-50 text-warning-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Star
              className={`w-4 h-4 ${frequentOnly ? "fill-current" : ""}`}
            />
            {t("tours.frequent")}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4" />
              {t("common.clearFilters")}
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="text-center py-12 px-6">
        <p className="text-gray-500 font-medium">{t("tours.empty")}</p>
        <p className="text-sm text-gray-500 mt-1">
          {t("tours.emptyHint")}
        </p>
        <Link
          to="/add"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-brand-600 hover:bg-brand-700 text-sm"
        >
          <Plus className="w-4 h-4" />
          {t("tours.addNew")}
        </Link>
      </div>
    );
  };

  const renderSkeleton = () => (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
          <div className="h-4 w-6 rounded bg-gray-200" />
          <div className="h-4 flex-1 rounded bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-6 w-24 rounded bg-gray-200" />
          <div className="h-6 w-24 rounded bg-gray-200" />
          <div className="h-8 w-28 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-gray-900">
              {t("tours.title")}
            </h1>
            {activeProvince && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-brand-100 text-brand-700">
                <MapPin className="w-4 h-4" />
                {activeProvince}
                <Link
                  to="/tours"
                  className="ml-1 text-brand-600 hover:text-brand-800"
                >
                  <X className="w-4 h-4" />
                </Link>
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {activeProvince
              ? t("tours.showingIn", { province: activeProvince })
              : t("tours.subtitle")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportExcel}
            disabled={totalItems === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-success-600 hover:bg-success-700 active:scale-[.98] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            title={`Export ${totalItems} rows to Excel`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>
              {t("tours.export")} ({totalItems})
            </span>
          </button>
          <Link
            to="/add"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-brand-600 hover:bg-brand-700 active:scale-[.98] shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t("tours.addNew")}</span>
          </Link>
        </div>
      </div>

      {/* Expired warning */}
      {!loading && expiredCount > 0 && statusFilter !== "expired" && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl bg-danger-50 px-4 py-3 ring-1 ring-danger-200">
          <div className="flex items-center gap-2 text-sm text-danger-800">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{t("tours.expiredBanner", { count: expiredCount })}</span>
          </div>
          <button
            onClick={() => setStatusFilter("expired")}
            className="self-start sm:self-auto text-sm font-medium text-danger-700 underline underline-offset-2 hover:text-danger-800"
          >
            {t("tours.reviewThem")}
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="tour-search" className="sr-only">
              Search tours
            </label>
            <div className="relative">
              <input
                id="tour-search"
                type="text"
                placeholder={t("tours.searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
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
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                  aria-label={t("common.closeSearch")}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Supplier */}
          <FitSelect
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            ariaLabel="Filter by supplier"
            options={[
              { value: "", label: t("tours.allSuppliers") },
              ...supplierOptions.map((name) => ({ value: name, label: name })),
            ]}
          />

          {/* Destination — hidden when the sidebar already pins a province */}
          {!activeProvince && (
            <FitSelect
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              ariaLabel="Filter by destination"
              options={[
                { value: "", label: t("tours.allDestinations") },
                ...destinationOptions.map((name) => ({
                  value: name,
                  label: name,
                })),
              ]}
            />
          )}

          {/* Status */}
          <FitSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            ariaLabel="Filter by status"
            options={[
              { value: "all", label: t("tours.statusAll") },
              { value: "active", label: t("tours.statusActive") },
              { value: "expired", label: t("tours.statusExpired") },
            ]}
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-1.5 self-start px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t("common.clearFilters")}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {loadError && (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-danger-200 p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-danger-600 mx-auto mb-2" />
          <p className="text-gray-900 font-medium">{t("tours.errorTitle")}</p>
          <p className="text-sm text-gray-500 mt-1">{loadError}</p>
          <button
            onClick={fetchTours}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-brand-600 hover:bg-brand-700 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            {t("common.retry")}
          </button>
        </div>
      )}

      {/* Bulk date renewal bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-2 z-20 rounded-xl bg-brand-50 px-4 py-3 ring-1 ring-brand-200 shadow-sm text-sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-2 font-medium text-brand-900 mr-2 self-center">
              <CalendarDays className="w-4 h-4 shrink-0" />
              {t("tours.bulkDates.title", { count: selectedIds.length })}
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-600">
                {t("tour.field.endDate")}
              </span>
              <input
                type="date"
                value={bulkDates.end_date}
                disabled={bulkDates.no_end_date}
                onChange={(e) =>
                  setBulkDates((prev) => ({ ...prev, end_date: e.target.value }))
                }
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-600">
                {t("tour.field.startDate")} ({t("tours.bulkDates.optional")})
              </span>
              <input
                type="date"
                value={bulkDates.start_date}
                onChange={(e) =>
                  setBulkDates((prev) => ({ ...prev, start_date: e.target.value }))
                }
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </label>
            <label className="flex items-center gap-2 py-2 text-gray-700">
              <input
                type="checkbox"
                checked={bulkDates.no_end_date}
                onChange={(e) =>
                  setBulkDates((prev) => ({
                    ...prev,
                    no_end_date: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              {t("tour.noEndDate")}
            </label>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSelectedIds([])}
                disabled={bulkSaving}
                className="px-3 py-2 rounded-lg text-sm text-gray-700 bg-white ring-1 ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleBulkDatesSave}
                disabled={
                  bulkSaving || (!bulkDates.end_date && !bulkDates.no_end_date)
                }
                className="px-4 py-2 rounded-lg text-sm text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkSaving
                  ? t("tours.bulkDates.saving")
                  : t("tours.bulkDates.save", { count: selectedIds.length })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {!loadError && (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">
          {loading ? (
            renderSkeleton()
          ) : totalItems === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {/* Desktop table */}
              {/* The scroll container needs a bounded height, otherwise the
                  sticky header has nothing to stick to and scrolls away. */}
              <div className="hidden md:block overflow-auto max-h-[calc(100vh-16rem)]">
                <table className="min-w-full text-sm">
                  <thead className="text-gray-500">
                    <tr>
                      <th
                        scope="col"
                        className="sticky top-0 z-10 w-0 bg-gray-50 border-b border-gray-200 pl-4 pr-0 py-3"
                      >
                        <input
                          type="checkbox"
                          checked={allFilteredSelected}
                          onChange={toggleSelectAllFiltered}
                          aria-label={t("tours.bulkDates.selectAll")}
                          title={t("tours.bulkDates.selectAll")}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                      </th>
                      {columns.map((column) => {
                        const active = sortConfig.key === column.key;
                        const alignRight = column.align === "right";
                        return (
                          <th
                            key={column.key}
                            scope="col"
                            aria-sort={
                              active
                                ? sortConfig.direction === "asc"
                                  ? "ascending"
                                  : "descending"
                                : column.sortable
                                ? "none"
                                : undefined
                            }
                            className={`sticky top-0 z-10 bg-gray-50 border-b border-gray-200 px-6 py-3 uppercase tracking-wider text-[11px] font-semibold ${
                              alignRight ? "text-right" : "text-left"
                            }`}
                          >
                            {column.sortable ? (
                              <button
                                type="button"
                                onClick={() => handleSort(column.key)}
                                className={`inline-flex items-center gap-1 rounded -mx-1 px-1 py-0.5 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                                  active ? "text-gray-900" : ""
                                }`}
                              >
                                <span>{t(column.label)}</span>
                                {active ? (
                                  sortConfig.direction === "asc" ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )
                                ) : (
                                  <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" />
                                )}
                              </button>
                            ) : (
                              t(column.label)
                            )}
                          </th>
                        );
                      })}
                      <th
                        scope="col"
                        className="sticky top-0 z-10 w-0 bg-gray-50 border-b border-gray-200 pl-2 pr-4 py-3"
                      >
                        <span className="sr-only">{t("common.actions")}</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {paginatedTours.map((tour, index) => {
                      const expired = isExpired(tour.end_date);

                      return (
                        <tr
                          key={tour.id}
                          className={`group transition ${
                            expired
                              ? "bg-danger-50/40 hover:bg-danger-50"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="w-0 pl-4 pr-0 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(tour.id)}
                              onChange={() => toggleSelectTour(tour.id)}
                              aria-label={tour.tour_name}
                              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-gray-900">
                            {startIndex + index + 1}
                          </td>

                          {/* Tour Name + Supplier + expired badge */}
                          <td className="px-6 py-3 align-top">
                            <div className="flex items-start gap-2">
                              {renderFrequentButton(tour)}
                              <div className="font-medium text-gray-900 leading-5">
                                {tour.tour_name}
                              </div>
                              {expired && (
                                <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-danger-100 px-2 py-0.5 text-[11px] font-semibold text-danger-700 ring-1 ring-inset ring-danger-200">
                                  <AlertTriangle className="w-3 h-3" />
                                  {t("common.expired")}
                                </span>
                              )}
                            </div>
                            {tour.supplier_name && (
                              <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
                                <Building2 className="w-3.5 h-3.5" />
                                <span className="truncate">
                                  {tour.supplier_name}
                                </span>
                              </div>
                            )}
                          </td>

                          {["departure_from", "destination"].map((key) => (
                            <td
                              key={key}
                              className="px-6 py-3 whitespace-nowrap text-gray-900"
                            >
                              {tour[key] || "-"}
                            </td>
                          ))}

                          {["adult_price", "child_price"].map((key) => (
                            <td
                              key={key}
                              className="px-6 py-3 whitespace-nowrap text-right font-semibold text-gray-900 tabular-nums"
                            >
                              {formatPrice(tour[key])}
                              <span className="ml-1 text-xs font-normal text-gray-400">
                                THB
                              </span>
                            </td>
                          ))}

                          <td className="w-0 pl-2 pr-4 py-3 whitespace-nowrap text-right">
                            {renderActions(tour, { revealOnHover: true })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {paginatedTours.map((tour) => {
                  const expired = isExpired(tour.end_date);

                  return (
                    <div
                      key={tour.id}
                      className={`p-4 space-y-3 ${
                        expired ? "bg-danger-50/40" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(tour.id)}
                              onChange={() => toggleSelectTour(tour.id)}
                              aria-label={tour.tour_name}
                              className="mt-1 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                            {renderFrequentButton(tour)}
                            <div className="font-medium text-gray-900 leading-5">
                              {tour.tour_name}
                            </div>
                          </div>
                          {tour.supplier_name && (
                            <div className="mt-1 ml-8 inline-flex items-center gap-1 text-xs text-gray-500">
                              <Building2 className="w-3.5 h-3.5" />
                              <span className="truncate">
                                {tour.supplier_name}
                              </span>
                            </div>
                          )}
                        </div>
                        {expired && (
                          <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-danger-100 px-2 py-0.5 text-[11px] font-semibold text-danger-700 ring-1 ring-inset ring-danger-200">
                            <AlertTriangle className="w-3 h-3" />
                            {t("common.expired")}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                        <span className="text-gray-500">
                          {t("tour.adult")}{" "}
                          <span className="font-semibold text-gray-900 tabular-nums">
                            {formatPrice(tour.adult_price)}
                          </span>{" "}
                          <span className="text-xs text-gray-400">THB</span>
                        </span>
                        <span className="text-gray-500">
                          {t("tour.child")}{" "}
                          <span className="font-semibold text-gray-900 tabular-nums">
                            {formatPrice(tour.child_price)}
                          </span>{" "}
                          <span className="text-xs text-gray-400">THB</span>
                        </span>
                      </div>

                      <div className="text-xs text-gray-500">
                        <span className="text-gray-400">{t("tour.from")} </span>
                        {tour.departure_from || "-"}
                        {tour.destination && (
                          <>
                            <span className="text-gray-400"> → </span>
                            {tour.destination}
                          </>
                        )}
                      </div>

                      {renderActions(tour)}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>
                    {t("common.showing")} {" "}
                    <span className="font-medium">{startIndex + 1}</span>–
                    <span className="font-medium">
                      {Math.min(startIndex + pageSize, totalItems)}
                    </span>{" "}
                    {t("common.of")} <span className="font-medium">{totalItems}</span>
                  </span>
                  <span className="hidden sm:inline text-gray-400">|</span>
                  <label className="flex items-center gap-2">
                    <span>{t("common.perPage")}</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    >
                      {[10, 25, 50, 100].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <nav className="flex items-center gap-1" aria-label={t("common.pagination")}>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t("common.previous")}
                  </button>
                  {getPageItems(safePage, totalPages).map((item, i) =>
                    item === "gap" ? (
                      <span
                        key={`gap-${i}`}
                        className="px-2 text-sm text-gray-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        aria-current={item === safePage ? "page" : undefined}
                        className={`min-w-[2.25rem] px-2 py-1.5 rounded-lg text-sm border ${
                          item === safePage
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={safePage === totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t("common.next")}
                  </button>
                </nav>
              </div>
            </>
          )}
        </div>
      )}

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

      {toast && <Toast message={toast} />}
    </div>
  );
};

export default TourList;
