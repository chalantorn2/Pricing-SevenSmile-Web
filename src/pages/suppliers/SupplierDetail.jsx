import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  suppliersService,
  toursService,
  supplierFilesService,
  transfersService,
} from "../../services/api-service";
import { TourDetailsModal } from "../../components/tours";
import { DocumentModal } from "../../components/common";
import { FileDownloads } from "../../components/common";
import { SupplierModal, SupplierFileUpload } from "../../components/suppliers";
import { Toast } from "../../components/core";
import { pushRecentItem } from "../../utils/recentItems";
import {
  hasCache,
  readCache,
  writeCache,
  isExpired,
  isExpiringSoon,
  daysUntilExpiry,
  isSupplierActive,
} from "../../utils";
import { useI18n } from "../../i18n";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Phone,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  Smartphone,
  Globe,
  MapPin,
  FolderOpen,
  Palmtree,
  FileText,
  Paperclip,
  SearchX,
  AlertTriangle,
  RotateCcw,
  ListChecks,
  Link2,
  Star,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  UploadCloud,
  X,
  Route as RouteIcon,
  Power,
} from "lucide-react";

// The tour table mirrors the one on the Tours screen — same columns, same
// sorting, same row actions — so the two lists read the same way.
const columns = [
  { key: "id", label: "tours.col.no", sortable: false },
  { key: "tour_name", label: "tours.col.name", sortable: true },
  { key: "departure_from", label: "tours.col.departure", sortable: true },
  { key: "destination", label: "tours.col.destination", sortable: true },
  { key: "adult_price", label: "tours.col.adultPrice", sortable: true, align: "right" },
  { key: "child_price", label: "tours.col.childPrice", sortable: true, align: "right" },
  { key: "end_date", label: "tour.field.endDate", sortable: true },
];

const formatDate = (dateString, lang, t) => {
  if (!dateString || dateString === "0000-00-00") return t("common.notSet");
  return new Date(dateString).toLocaleDateString(lang === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatPrice = (price) => {
  const n =
    typeof price === "number"
      ? price
      : Number(String(price ?? "").replace(/[, ]/g, ""));
  if (Number.isNaN(n)) return "-";
  return new Intl.NumberFormat("en-US").format(n);
};

const routeLabel = (route) =>
  route.label || `${route.origin_name} → ${route.destination_name}`;

const SupplierDetail = () => {
  const { t, lang } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();

  // Everything this screen loaded for one supplier, kept for the life of the tab
  // so coming back from a tour repaints the page instead of blanking to a skeleton.
  const cacheKey = `supplier:${id}`;
  const seed = readCache(cacheKey);
  // Which supplier the screen is on right now: a request started for the previous
  // one must not paint its rows over the one being looked at.
  const currentId = useRef(id);

  const [supplier, setSupplier] = useState(seed?.supplier || null);
  const [supplierTours, setSupplierTours] = useState(seed?.tours || []);
  const [supplierFiles, setSupplierFiles] = useState(seed?.files || []);
  const [supplierRoutes, setSupplierRoutes] = useState(seed?.routes || []);
  const [loading, setLoading] = useState(!seed);
  const [loadError, setLoadError] = useState(null);
  const [toursLoading, setToursLoading] = useState(!seed);
  const [filesLoading, setFilesLoading] = useState(!seed);
  const [routesLoading, setRoutesLoading] = useState(false);

  const [copiedValue, setCopiedValue] = useState(null);
  const [toast, setToast] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  // Tour list controls
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | expired
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [pendingFrequent, setPendingFrequent] = useState([]);

  // Modal states
  const [selectedTour, setSelectedTour] = useState(null);
  const [showTourDetailsModal, setShowTourDetailsModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    currentId.current = id;
    // Moving from one supplier to another reuses this component, so drop the
    // previous record unless the new one is already cached.
    const cached = readCache(`supplier:${id}`);
    setSupplier(cached?.supplier || null);
    setSupplierTours(cached?.tours || []);
    setSupplierFiles(cached?.files || []);
    setSupplierRoutes(cached?.routes || []);
    setLoading(!cached);
    setToursLoading(!cached);
    setFilesLoading(!cached);
    setShowUpload(false);

    fetchSupplier();
    fetchSupplierTours();
    fetchSupplierFiles();
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!copiedValue) return;
    const timer = setTimeout(() => setCopiedValue(null), 1500);
    return () => clearTimeout(timer);
  }, [copiedValue]);

  // Debounce the search box so typing stays responsive
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Transfer companies carry routes instead of tours, so their rate sheet is
  // fetched only once the supplier's type is known.
  useEffect(() => {
    if (supplier?.type === "transfer") fetchSupplierRoutes();
  }, [supplier?.type, id]);

  // Merge one slice into the cached bag without dropping the others.
  const patchCache = (patch) => {
    const current = readCache(cacheKey) || {};
    writeCache(cacheKey, { ...current, ...patch });
  };

  const fetchSupplier = async () => {
    try {
      if (!hasCache(cacheKey)) setLoading(true);
      setLoadError(null);
      const data = await suppliersService.getSupplierById(id);
      if (currentId.current !== id) return;
      if (!data) {
        setLoadError("notfound");
        return;
      }
      setSupplier(data);
      patchCache({ supplier: data });
      // Remember the visit so the home screen can offer a shortcut back
      pushRecentItem({
        type: "supplier",
        id: data.id,
        name: data.name,
        meta:
          data.type === "transfer"
            ? t("suppliers.typeTransfer")
            : t("suppliers.typeTour"),
      });
    } catch (error) {
      console.error("Error fetching supplier:", error);
      // The API answers a missing id with a 404 carrying "Supplier not found"
      const message = error?.message || t("suppliers.loadDetailError");
      setLoadError(/not found/i.test(message) ? "notfound" : message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierTours = async () => {
    try {
      setToursLoading(true);
      const tours = await toursService.getToursBySupplier(id);
      if (currentId.current !== id) return;
      setSupplierTours(tours);
      patchCache({ tours });
    } catch (error) {
      console.error("Error fetching tours:", error);
      setToast({ message: t("suppliers.loadToursError"), type: "error" });
    } finally {
      setToursLoading(false);
    }
  };

  const fetchSupplierFiles = async () => {
    try {
      setFilesLoading(true);
      const files = await supplierFilesService.getSupplierFiles(Number(id));
      if (currentId.current !== id) return;
      setSupplierFiles(files);
      patchCache({ files });
    } catch (error) {
      console.error("Error fetching files:", error);
      setSupplierFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  const fetchSupplierRoutes = async () => {
    try {
      setRoutesLoading(true);
      // `supplier` narrows each route's prices to this rate sheet; routes this
      // company does not price come back with an empty list.
      const routes = await transfersService.getTransferResource("routes", {
        supplier: id,
      });
      const priced = (routes || []).filter((r) => (r.prices || []).length > 0);
      if (currentId.current !== id) return;
      setSupplierRoutes(priced);
      patchCache({ routes: priced });
    } catch (error) {
      console.error("Error fetching transfer routes:", error);
      setToast({ message: t("suppliers.loadRoutesError"), type: "error" });
    } finally {
      setRoutesLoading(false);
    }
  };

  const handleSupplierUpdate = (updatedSupplier) => {
    setSupplier(updatedSupplier);
    patchCache({ supplier: updatedSupplier });
    setShowEditModal(false);
    setToast({ message: t("suppliers.updateSuccess"), type: "success" });
    fetchSupplierFiles();
  };

  const [statusSaving, setStatusSaving] = useState(false);

  // Switching a supplier off keeps its tours, rates and files; it only drops out
  // of the pickers and the default lists.
  const handleToggleActive = async () => {
    const next = !isSupplierActive(supplier.is_active);
    if (
      !next &&
      !window.confirm(t("suppliers.deactivateConfirm", { name: supplier.name }))
    ) {
      return;
    }
    try {
      setStatusSaving(true);
      const updated = await suppliersService.setSupplierActive(supplier.id, next);
      const merged = { ...supplier, is_active: updated?.is_active ?? (next ? 1 : 0) };
      setSupplier(merged);
      patchCache({ supplier: merged });
      setToast({
        message: t(next ? "suppliers.activated" : "suppliers.deactivated"),
        type: "success",
      });
    } catch (error) {
      console.error("Error updating supplier status:", error);
      setToast({ message: t("suppliers.statusError"), type: "error" });
    } finally {
      setStatusSaving(false);
    }
  };

  const handleSupplierDelete = () => {
    setShowEditModal(false);
    // The list screen shows the confirmation: this page is about to unmount.
    navigate("/suppliers", {
      state: { flash: { message: t("suppliers.deleteSuccess"), type: "success" } },
    });
  };

  const handleFileUploaded = (newFile) => {
    setSupplierFiles((prev) => {
      const next = [newFile, ...prev];
      patchCache({ files: next });
      return next;
    });
  };

  const copyToClipboard = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
    } catch {
      setToast({ message: t("suppliers.copyError"), type: "error" });
    }
  };

  const handleCopyTourLink = async (tour) => {
    const url = `${window.location.origin}/tour/${tour.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast({ message: t("tours.linkCopied"), type: "success" });
    } catch {
      setToast({ message: t("tours.linkCopyError"), type: "error" });
    }
  };

  // Pin / unpin "frequently used", updated locally first and rolled back if the
  // write fails — same behaviour as the Tours screen.
  const handleToggleFrequent = async (tour) => {
    const next = Number(tour.is_frequent) === 1 ? 0 : 1;
    setPendingFrequent((prev) => [...prev, tour.id]);
    setSupplierTours((prev) =>
      prev.map((row) => (row.id === tour.id ? { ...row, is_frequent: next } : row))
    );
    try {
      await toursService.setFrequent(tour.id, next);
    } catch (error) {
      console.error("Failed to update frequently-used flag", error);
      setSupplierTours((prev) =>
        prev.map((row) =>
          row.id === tour.id ? { ...row, is_frequent: tour.is_frequent } : row
        )
      );
      setToast({ message: t("tours.pinError"), type: "error" });
    } finally {
      setPendingFrequent((prev) => prev.filter((rowId) => rowId !== tour.id));
    }
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

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter("all");
  };

  const expiredCount = useMemo(
    () => supplierTours.filter((tour) => isExpired(tour.end_date)).length,
    [supplierTours]
  );

  const expiringSoonCount = useMemo(
    () => supplierTours.filter((tour) => isExpiringSoon(tour.end_date)).length,
    [supplierTours]
  );

  const hasActiveFilters = Boolean(searchTerm) || statusFilter !== "all";

  const visibleTours = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();

    const filtered = supplierTours.filter((tour) => {
      if (statusFilter !== "all") {
        const expired = isExpired(tour.end_date);
        if (statusFilter === "expired" && !expired) return false;
        if (statusFilter === "active" && expired) return false;
      }
      if (!searchLower) return true;

      return (
        tour.tour_name?.toLowerCase().includes(searchLower) ||
        tour.departure_from?.toLowerCase().includes(searchLower) ||
        tour.destination?.toLowerCase().includes(searchLower) ||
        tour.pier?.toLowerCase().includes(searchLower) ||
        tour.notes?.toLowerCase().includes(searchLower)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key.includes("price")) {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        } else if (sortConfig.key.includes("date")) {
          aValue = aValue || "";
          bValue = bValue || "";
        } else {
          aValue = aValue?.toString().toLowerCase() || "";
          bValue = bValue?.toString().toLowerCase() || "";
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    } else {
      // No column chosen: pinned tours first, the API's "recently updated" order
      // preserved within each group.
      filtered.sort(
        (a, b) => Number(b.is_frequent || 0) - Number(a.is_frequent || 0)
      );
    }

    return filtered;
  }, [supplierTours, searchTerm, statusFilter, sortConfig]);

  // Transfer companies never carry tours, so everything tour-shaped on this page
  // is hidden for them; the contacts, the rate sheet and the files are what they
  // are here for.
  const isTourSupplier = supplier?.type !== "transfer";
  const supplierActive = isSupplierActive(supplier?.is_active);

  const phones = useMemo(() => {
    if (!supplier) return [];
    return [
      { number: supplier.phone, label: t("common.primary"), primary: true },
      { number: supplier.phone_2, label: t("suppliers.phoneNumber", { number: 2 }) },
      { number: supplier.phone_3, label: t("suppliers.phoneNumber", { number: 3 }) },
      { number: supplier.phone_4, label: t("suppliers.phoneNumber", { number: 4 }) },
      { number: supplier.phone_5, label: t("suppliers.phoneNumber", { number: 5 }) },
    ].filter((item) => item.number?.trim());
  }, [supplier, t]);

  const channels = useMemo(() => {
    if (!supplier) return [];
    return [
      supplier.line && {
        key: "line",
        icon: MessageCircle,
        name: "Line",
        value: supplier.line,
        href: `https://line.me/ti/p/~${supplier.line}`,
      },
      supplier.whatsapp && {
        key: "whatsapp",
        icon: Smartphone,
        name: "WhatsApp",
        value: supplier.whatsapp,
        href: `https://wa.me/${supplier.whatsapp}`,
      },
      supplier.facebook && {
        key: "facebook",
        icon: ExternalLink,
        name: "Facebook",
        value: supplier.facebook,
        href: supplier.facebook.startsWith("http")
          ? supplier.facebook
          : `https://facebook.com/${supplier.facebook}`,
      },
      supplier.website && {
        key: "website",
        icon: Globe,
        name: "Website",
        value: supplier.website,
        href: supplier.website,
      },
    ].filter(Boolean);
  }, [supplier]);

  // ========= Sub-renders =========
  const renderExpiryBadge = (tour) => {
    if (isExpired(tour.end_date)) {
      return (
        <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-danger-100 px-2 py-0.5 text-[11px] font-semibold text-danger-700 ring-1 ring-inset ring-danger-200">
          <AlertTriangle className="w-3 h-3" />
          {t("common.expired")}
        </span>
      );
    }
    if (isExpiringSoon(tour.end_date)) {
      const days = daysUntilExpiry(tour.end_date);
      return (
        <span
          title={
            days === 0
              ? t("suppliers.expiresToday")
              : t("suppliers.expiresInDays", { count: days })
          }
          className="inline-flex items-center gap-1 shrink-0 rounded-full bg-warning-100 px-2 py-0.5 text-[11px] font-semibold text-warning-700 ring-1 ring-inset ring-warning-200"
        >
          <Clock className="w-3 h-3" />
          {t("common.expiringSoon")}
        </span>
      );
    }
    return null;
  };

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

  const renderTourActions = (tour, { revealOnHover = false } = {}) => (
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
        aria-label={t("suppliers.viewTourDetails", { name: tour.tour_name })}
      >
        <FileText className="w-4 h-4" />
      </button>
      <button
        onClick={() => openDocumentModal(tour)}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[.98]"
        title={t("tours.viewDocuments")}
        aria-label={t("suppliers.viewTourDocuments", { name: tour.tour_name })}
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

  const renderSectionSkeleton = (rows = 3) => (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-6 py-4 animate-pulse"
        >
          <div className="h-4 flex-1 rounded bg-gray-200" />
          <div className="h-6 w-24 rounded bg-gray-200" />
          <div className="h-8 w-28 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );

  // ========= Page states =========
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-64 rounded bg-gray-200 animate-pulse" />
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[0, 1].map((col) => (
            <div key={col} className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">
          {renderSectionSkeleton(4)}
        </div>
      </div>
    );
  }

  if (loadError || !supplier) {
    const notFound = loadError === "notfound" || !supplier;
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-8 text-center">
        {notFound ? (
          <SearchX className="w-10 h-10 mx-auto text-gray-400 mb-3" />
        ) : (
          <AlertTriangle className="w-10 h-10 mx-auto text-danger-600 mb-3" />
        )}
        <p className="font-medium text-gray-900">
          {notFound ? t("suppliers.notFound") : t("suppliers.loadDetailError")}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {notFound
            ? t("suppliers.notFoundHint")
            : loadError}
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Link
            to="/suppliers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.backTo", { name: t("suppliers.title") })}
          </Link>
          {!notFound && (
            <button
              onClick={fetchSupplier}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white bg-brand-600 hover:bg-brand-700"
            >
              <RotateCcw className="w-4 h-4" />
              {t("common.retry")}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Link
          to="/suppliers"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("suppliers.title")}
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold text-gray-900">
                {supplier.name}
              </h1>
              {!isTourSupplier && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">
                  {t("suppliers.typeTransfer")}
                </span>
              )}
              {!supplierActive && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200">
                  {t("suppliers.inactive")}
                </span>
              )}
            </div>
            {/* At-a-glance meta so the page answers the basics without scrolling */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
              {isTourSupplier ? (
                <span className="inline-flex items-center gap-1.5">
                  <Palmtree className="w-4 h-4" />
                  {toursLoading
                    ? "…"
                    : t("suppliers.tourCount", { count: supplierTours.length })}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <RouteIcon className="w-4 h-4" />
                  {routesLoading
                    ? "…"
                    : t("suppliers.transferRouteCount", {
                        count: supplierRoutes.length,
                      })}
                </span>
              )}
              {isTourSupplier && expiredCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-danger-700">
                  <AlertTriangle className="w-4 h-4" />
                  {t("suppliers.expiredCount", { count: expiredCount })}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4" />
                {filesLoading
                  ? "…"
                  : t("suppliers.fileCount", { count: supplierFiles.length })}
              </span>
              <span className="text-gray-400">
                {t("suppliers.updated")} {formatDate(supplier.updated_at, lang, t)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {isTourSupplier ? (
              <>
                <Link
                  to={`/add?supplier=${supplier.id}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:scale-[.98]"
                >
                  <Plus className="w-4 h-4" />
                  {t("suppliers.addTour")}
                </Link>
                <Link
                  to={`/edit-tours/${supplier.id}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:scale-[.98]"
                >
                  <ListChecks className="w-4 h-4" />
                  {t("suppliers.editPrices")}
                </Link>
              </>
            ) : (
              <Link
                to={`/transfer?supplier=${supplier.id}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:scale-[.98]"
              >
                <ListChecks className="w-4 h-4" />
                {t("suppliers.editRates")}
              </Link>
            )}
            <button
              onClick={handleToggleActive}
              disabled={statusSaving}
              aria-pressed={supplierActive}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm border active:scale-[.98] disabled:opacity-50 ${
                supplierActive
                  ? "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  : "border-success-300 text-success-700 bg-success-50 hover:bg-success-100"
              }`}
            >
              <Power className="w-4 h-4" />
              {supplierActive ? t("suppliers.deactivate") : t("suppliers.activate")}
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm text-white bg-brand-600 hover:bg-brand-700 active:scale-[.98] shadow-sm"
            >
              <Pencil className="w-4 h-4" />
              {t("suppliers.edit")}
            </button>
          </div>
        </div>
      </div>

      {!supplierActive && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 ring-1 ring-gray-200 text-sm text-gray-700">
          <Power className="w-4 h-4 shrink-0" />
          <span>{t("suppliers.inactiveBanner")}</span>
        </div>
      )}

      {/* Expiry warnings */}
      {isTourSupplier && !toursLoading && expiredCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-danger-50 px-4 py-3 ring-1 ring-danger-200 text-sm text-danger-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{t("tours.expiredBanner", { count: expiredCount })}</span>
          <Link
            to={`/edit-tours/${supplier.id}`}
            className="underline underline-offset-2 hover:no-underline font-medium"
          >
            {t("suppliers.updatePrices")}
          </Link>
        </div>
      )}

      {isTourSupplier && !toursLoading && expiredCount === 0 && expiringSoonCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-warning-50 px-4 py-3 ring-1 ring-warning-200 text-sm text-warning-800">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            {t("suppliers.expiringSoonBanner", { count: expiringSoonCount })}
          </span>
          <Link
            to={`/edit-tours/${supplier.id}`}
            className="underline underline-offset-2 hover:no-underline font-medium"
          >
            {t("suppliers.updatePrices")}
          </Link>
        </div>
      )}

      {/* Contact card */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
          {/* Phones */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              {t("suppliers.phoneNumbers")}
            </h2>

            {phones.length === 0 ? (
              <p className="text-sm text-gray-400">{t("suppliers.noPhone")}</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {phones.map((phone) => (
                  <li
                    key={phone.number}
                    className="group flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <a
                        href={`tel:${phone.number}`}
                        className="font-medium text-gray-900 tabular-nums hover:text-brand-700 hover:underline"
                      >
                        {phone.number}
                      </a>
                      {phone.primary && (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
                          {t("common.primary")}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => copyToClipboard(phone.number)}
                      title={t("common.copyNumber")}
                      aria-label={t("suppliers.copyValue", { name: phone.number })}
                      className="inline-flex items-center gap-1 text-xs text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-gray-700 transition"
                    >
                      {copiedValue === phone.number ? (
                        <>
                          <Check className="w-4 h-4 text-success-600" />
                          <span className="text-success-700">{t("suppliers.copied")}</span>
                        </>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Other channels + general info */}
          <div className="space-y-8">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                {t("suppliers.otherChannels")}
              </h2>

              {channels.length === 0 ? (
                <p className="text-sm text-gray-400">
                  {t("suppliers.noChannels")}
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {channels.map((channel) => {
                    const Icon = channel.icon;
                    return (
                      <li
                        key={channel.key}
                        className="group flex items-center gap-3 py-2.5"
                      >
                        <a
                          href={channel.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-w-0 flex-1 items-center gap-3 -mx-2 px-2 py-0.5 rounded-lg hover:bg-gray-50"
                        >
                          <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="w-20 shrink-0 text-sm text-gray-500">
                            {channel.name}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium text-gray-900 group-hover:text-brand-700">
                            {channel.value}
                          </span>
                        </a>
                        {/* The Line ID and the WhatsApp number get pasted into other
                            apps far more often than they get clicked. */}
                        <button
                          onClick={() => copyToClipboard(channel.value)}
                          title={t("common.copy")}
                          aria-label={t("suppliers.copyValue", {
                            name: channel.name,
                          })}
                          className="inline-flex shrink-0 items-center gap-1 text-xs text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-gray-700 transition"
                        >
                          {copiedValue === channel.value ? (
                            <>
                              <Check className="w-4 h-4 text-success-600" />
                              <span className="text-success-700">
                                {t("suppliers.copied")}
                              </span>
                            </>
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                {t("common.general")}
              </h2>
              <dl className="space-y-2.5 text-sm">
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-gray-500">{t("suppliers.address")}</dt>
                  <dd className="min-w-0 flex-1 text-gray-900">
                    {supplier.address ? (
                      <span className="flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                        {supplier.address}
                      </span>
                    ) : (
                      <span className="text-gray-400">{t("tour.notSpecified")}</span>
                    )}
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-gray-500">{t("suppliers.created")}</dt>
                  <dd className="text-gray-900">
                    {formatDate(supplier.created_at, lang, t)}
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-gray-500">{t("suppliers.updated")}</dt>
                  <dd className="text-gray-900">
                    {formatDate(supplier.updated_at, lang, t)}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-gray-900 inline-flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-gray-400" />
            {t("suppliers.documents")}
            {!filesLoading && (
              <span className="text-sm font-normal text-gray-500">
                ({supplierFiles.length})
              </span>
            )}
          </h2>
          {/* Uploading a rate sheet is the reason most visits open the edit modal
              at all — the panel is right here instead. */}
          <button
            onClick={() => setShowUpload((open) => !open)}
            className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:text-brand-900"
          >
            {showUpload ? (
              <>
                <X className="w-4 h-4" />
                {t("suppliers.hideUpload")}
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                {t("suppliers.uploadFiles")}
              </>
            )}
          </button>
        </div>

        {showUpload && (
          <div className="rounded-lg bg-gray-50 p-4">
            <SupplierFileUpload
              supplierId={supplier.id}
              onFileUploaded={handleFileUploaded}
            />
          </div>
        )}

        {filesLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 rounded bg-gray-200 animate-pulse" />
          </div>
        ) : supplierFiles.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FolderOpen className="w-4 h-4" />
            {t("suppliers.noDocuments")}
          </div>
        ) : (
          <FileDownloads
            files={supplierFiles}
            getFileUrl={supplierFilesService.getSupplierFileUrl}
            title={t("suppliers.documents")}
            isSupplier={true}
            showCategory={true}
          />
        )}
      </div>

      {/* Transfer rate sheet */}
      {!isTourSupplier && (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 inline-flex items-center gap-2">
              <RouteIcon className="w-4 h-4 text-gray-400" />
              {t("suppliers.transferRoutes")}
              {!routesLoading && (
                <span className="text-sm font-normal text-gray-500">
                  ({supplierRoutes.length})
                </span>
              )}
            </h2>
            <Link
              to={`/transfer?supplier=${supplier.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:text-brand-900"
            >
              <Pencil className="w-4 h-4" />
              {t("suppliers.editRates")}
            </Link>
          </div>

          {routesLoading ? (
            renderSectionSkeleton(3)
          ) : supplierRoutes.length === 0 ? (
            <div className="text-center py-12 px-6">
              <p className="font-medium text-gray-500">
                {t("suppliers.noTransferRoutes")}
              </p>
              <Link
                to={`/transfer?supplier=${supplier.id}`}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-brand-600 hover:bg-brand-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                {t("suppliers.editRates")}
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr className="border-b border-gray-200">
                    <th
                      scope="col"
                      className="px-6 py-3 text-left uppercase tracking-wider text-[11px] font-semibold"
                    >
                      {t("transfers.route")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left uppercase tracking-wider text-[11px] font-semibold"
                    >
                      {t("transfers.prices")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {supplierRoutes.map((route) => (
                    <tr key={route.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 align-top">
                        <div className="font-medium text-gray-900 leading-5">
                          {routeLabel(route)}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {route.origin_name} → {route.destination_name}
                        </div>
                      </td>
                      <td className="px-6 py-3 align-top">
                        <div className="flex flex-wrap gap-1.5">
                          {route.prices.map((price) => (
                            <span
                              key={`${route.id}-${price.vehicle_id}`}
                              className="inline-flex items-baseline gap-1.5 rounded-md bg-gray-50 px-2 py-1 ring-1 ring-gray-200"
                            >
                              <span className="text-xs text-gray-500">
                                {price.vehicle_name}
                              </span>
                              <span className="font-semibold text-gray-900 tabular-nums">
                                {formatPrice(price.price)}
                              </span>
                              <span className="text-xs font-normal text-gray-400">
                                {price.currency || "THB"}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tours */}
      {isTourSupplier && (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="flex flex-col gap-3 px-6 py-4 border-b border-gray-100 md:flex-row md:items-center md:justify-between">
            <h2 className="font-semibold text-gray-900 inline-flex items-center gap-2">
              <Palmtree className="w-4 h-4 text-gray-400" />
              {t("suppliers.toursFrom")}
              {!toursLoading && (
                <span className="text-sm font-normal text-gray-500">
                  ({supplierTours.length})
                </span>
              )}
            </h2>
            {supplierTours.length > 0 && (
              <Link
                to={`/add?supplier=${supplier.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-brand-700 hover:text-brand-900"
              >
                <Plus className="w-4 h-4" />
                {t("suppliers.addTour")}
              </Link>
            )}
          </div>

          {/* Search & status — the same controls as the Tours screen, minus the
              filters that only make sense across suppliers. */}
          {!toursLoading && supplierTours.length > 0 && (
            <div className="flex flex-col gap-3 px-6 py-3 border-b border-gray-100 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <label htmlFor="supplier-tour-search" className="sr-only">
                  {t("suppliers.searchTours")}
                </label>
                <input
                  id="supplier-tour-search"
                  type="text"
                  placeholder={t("suppliers.searchTours")}
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

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label={t("common.status")}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="all">{t("tours.statusAll")}</option>
                <option value="active">{t("tours.statusActive")}</option>
                <option value="expired">{t("tours.statusExpired")}</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t("common.clearFilters")}
                </button>
              )}
            </div>
          )}

          {toursLoading ? (
            renderSectionSkeleton(3)
          ) : supplierTours.length === 0 ? (
            <div className="text-center py-12 px-6">
              <p className="font-medium text-gray-500">{t("suppliers.noTours")}</p>
              <p className="text-sm text-gray-500 mt-1">
                {t("suppliers.addFirstTour")}
              </p>
              <Link
                to={`/add?supplier=${supplier.id}`}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-brand-600 hover:bg-brand-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                {t("suppliers.addTour")}
              </Link>
            </div>
          ) : visibleTours.length === 0 ? (
            <div className="text-center py-12 px-6">
              <p className="text-gray-500 font-medium">{t("tours.noMatches")}</p>
              <p className="text-sm text-gray-500 mt-1">
                {t("tours.noMatchesHint")}
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4" />
                {t("common.clearFilters")}
              </button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-gray-500">
                    <tr>
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
                            className={`bg-gray-50 border-b border-gray-200 px-6 py-3 uppercase tracking-wider text-[11px] font-semibold ${
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
                        className="w-0 bg-gray-50 border-b border-gray-200 pl-2 pr-4 py-3"
                      >
                        <span className="sr-only">{t("common.actions")}</span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {visibleTours.map((tour, index) => {
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
                          <td className="px-6 py-3 whitespace-nowrap text-gray-900">
                            {index + 1}
                          </td>

                          <td className="px-6 py-3 align-top">
                            <div className="flex items-start gap-2">
                              {renderFrequentButton(tour)}
                              <Link
                                to={`/tour/${tour.id}`}
                                title={t("suppliers.viewTour", {
                                  name: tour.tour_name,
                                })}
                                className="font-medium text-gray-900 leading-5 hover:text-brand-700 hover:underline"
                              >
                                {tour.tour_name}
                              </Link>
                              {renderExpiryBadge(tour)}
                            </div>
                            {tour.pier && (
                              <div className="mt-1 ml-8 text-xs text-gray-500">
                                {t("tour.field.pier")}: {tour.pier}
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

                          <td
                            className={`px-6 py-3 whitespace-nowrap ${
                              expired ? "text-danger-700" : "text-gray-500"
                            }`}
                          >
                            {formatDate(tour.end_date, lang, t)}
                          </td>

                          <td className="w-0 pl-2 pr-4 py-3 whitespace-nowrap text-right">
                            {renderTourActions(tour, { revealOnHover: true })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {visibleTours.map((tour) => {
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
                            {renderFrequentButton(tour)}
                            <Link
                              to={`/tour/${tour.id}`}
                              className="font-medium text-gray-900 leading-5 hover:text-brand-700"
                            >
                              {tour.tour_name}
                            </Link>
                          </div>
                          {tour.pier && (
                            <div className="mt-1 ml-8 text-xs text-gray-500">
                              {t("tour.field.pier")}: {tour.pier}
                            </div>
                          )}
                        </div>
                        {renderExpiryBadge(tour)}
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

                      <div className="text-xs text-gray-500">
                        {t("tour.field.endDate")}:{" "}
                        <span className={expired ? "text-danger-700" : ""}>
                          {formatDate(tour.end_date, lang, t)}
                        </span>
                      </div>

                      {renderTourActions(tour)}
                    </div>
                  );
                })}
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

      <SupplierModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleSupplierUpdate}
        onDelete={handleSupplierDelete}
        supplier={supplier}
        isEdit={true}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default SupplierDetail;
