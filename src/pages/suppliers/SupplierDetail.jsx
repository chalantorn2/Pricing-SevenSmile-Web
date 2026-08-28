import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  suppliersService,
  toursService,
  supplierFilesService,
} from "../../services/api-service";
import { TourDetailsModal } from "../../components/tours";
import { DocumentModal } from "../../components/common";
import { FileDownloads } from "../../components/common";
import { SupplierModal } from "../../components/suppliers";
import { Toast } from "../../components/core";
import { pushRecentItem } from "../../utils/recentItems";
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
} from "lucide-react";

const formatDate = (dateString) => {
  if (!dateString || dateString === "0000-00-00") return "Not set";
  return new Date(dateString).toLocaleDateString("en-US", {
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

const isExpired = (endDate) => {
  if (!endDate || endDate === "0000-00-00") return false;
  return new Date(endDate) < new Date();
};

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [supplierTours, setSupplierTours] = useState([]);
  const [supplierFiles, setSupplierFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [toursLoading, setToursLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(true);

  const [copiedValue, setCopiedValue] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal states
  const [selectedTour, setSelectedTour] = useState(null);
  const [showTourDetailsModal, setShowTourDetailsModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!id) return;
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

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await suppliersService.getSupplierById(id);
      if (!data) {
        setLoadError("notfound");
        return;
      }
      setSupplier(data);
      // Remember the visit so the home screen can offer a shortcut back
      pushRecentItem({
        type: "supplier",
        id: data.id,
        name: data.name,
        meta: "",
      });
    } catch (error) {
      console.error("Error fetching supplier:", error);
      // The API answers a missing id with a 404 carrying "Supplier not found"
      const message = error?.message || "An error occurred while loading data";
      setLoadError(/not found/i.test(message) ? "notfound" : message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierTours = async () => {
    try {
      setToursLoading(true);
      const allTours = await toursService.getAllTours();
      setSupplierTours(
        allTours.filter((tour) => Number(tour.supplier_id) === Number(id)),
      );
    } catch (error) {
      console.error("Error fetching tours:", error);
      setToast({ message: "Could not load tours", type: "error" });
    } finally {
      setToursLoading(false);
    }
  };

  const fetchSupplierFiles = async () => {
    try {
      setFilesLoading(true);
      const files = await supplierFilesService.getSupplierFiles(Number(id));
      setSupplierFiles(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      setSupplierFiles([]);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleSupplierUpdate = (updatedSupplier) => {
    setSupplier(updatedSupplier);
    setShowEditModal(false);
    setToast({ message: "Supplier updated", type: "success" });
    fetchSupplierFiles();
  };

  const handleSupplierDelete = () => {
    setShowEditModal(false);
    navigate("/suppliers");
  };

  const copyToClipboard = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
    } catch {
      setToast({ message: "Could not copy to clipboard", type: "error" });
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

  const expiredCount = useMemo(
    () => supplierTours.filter((tour) => isExpired(tour.end_date)).length,
    [supplierTours],
  );

  // Transfer companies never carry tours, so everything tour-shaped on this page
  // is hidden for them; the contacts and the files are what they are here for.
  const isTourSupplier = supplier?.type !== "transfer";

  const phones = useMemo(() => {
    if (!supplier) return [];
    return [
      { number: supplier.phone, label: "Primary" },
      { number: supplier.phone_2, label: "Phone 2" },
      { number: supplier.phone_3, label: "Phone 3" },
      { number: supplier.phone_4, label: "Phone 4" },
      { number: supplier.phone_5, label: "Phone 5" },
    ].filter((item) => item.number?.trim());
  }, [supplier]);

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
  const renderTourActions = (tour) => (
    <div className="inline-flex items-center gap-1">
      <button
        onClick={() => openTourDetailsModal(tour)}
        title="View details"
        aria-label={`View details of ${tour.tour_name}`}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200 hover:bg-brand-100 active:scale-[.98]"
      >
        <FileText className="w-4 h-4" />
      </button>
      <button
        onClick={() => openDocumentModal(tour)}
        title="View documents"
        aria-label={`View documents of ${tour.tour_name}`}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-100 active:scale-[.98]"
      >
        <Paperclip className="w-4 h-4" />
      </button>
      <Link
        to={`/edit/${tour.id}`}
        title="Edit"
        aria-label={`Edit ${tour.tour_name}`}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-warning-50 text-warning-700 ring-1 ring-inset ring-warning-200 hover:bg-warning-100 active:scale-[.98]"
      >
        <Pencil className="w-4 h-4" />
      </Link>
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
          {notFound ? "Supplier not found" : "Could not load this supplier"}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {notFound
            ? "It may have been deleted, or the link is out of date."
            : loadError}
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Link
            to="/suppliers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Suppliers
          </Link>
          {!notFound && (
            <button
              onClick={fetchSupplier}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white bg-brand-600 hover:bg-brand-700"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
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
          Suppliers
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold text-gray-900">
                {supplier.name}
              </h1>
              {!isTourSupplier && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">
                  Transfer
                </span>
              )}
            </div>
            {/* At-a-glance meta so the page answers the basics without scrolling */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
              {isTourSupplier && (
                <span className="inline-flex items-center gap-1.5">
                  <Palmtree className="w-4 h-4" />
                  {toursLoading ? "…" : `${supplierTours.length} tours`}
                </span>
              )}
              {isTourSupplier && expiredCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-danger-700">
                  <AlertTriangle className="w-4 h-4" />
                  {expiredCount} expired
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4" />
                {filesLoading ? "…" : `${supplierFiles.length} files`}
              </span>
              <span className="text-gray-400">
                Updated {formatDate(supplier.updated_at)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {isTourSupplier && (
              <>
                <Link
                  to={`/add?supplier=${supplier.id}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:scale-[.98]"
                >
                  <Plus className="w-4 h-4" />
                  Add tour
                </Link>
                <Link
                  to={`/edit-tours/${supplier.id}`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:scale-[.98]"
                >
                  <ListChecks className="w-4 h-4" />
                  Edit tour prices
                </Link>
              </>
            )}
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm text-white bg-brand-600 hover:bg-brand-700 active:scale-[.98] shadow-sm"
            >
              <Pencil className="w-4 h-4" />
              Edit Supplier
            </button>
          </div>
        </div>
      </div>

      {/* Expired tours warning */}
      {isTourSupplier && !toursLoading && expiredCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-danger-50 px-4 py-3 ring-1 ring-danger-200 text-sm text-danger-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <span className="font-semibold">{expiredCount}</span> tour price
            {expiredCount > 1 ? "s have" : " has"} expired and may be out of
            date.
          </span>
          <Link
            to={`/edit-tours/${supplier.id}`}
            className="underline underline-offset-2 hover:no-underline font-medium"
          >
            Update prices
          </Link>
        </div>
      )}

      {/* Contact card */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
          {/* Phones */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Phone numbers
            </h2>

            {phones.length === 0 ? (
              <p className="text-sm text-gray-400">No phone numbers on file</p>
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
                      {phone.label === "Primary" && (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
                          Primary
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => copyToClipboard(phone.number)}
                      title="Copy number"
                      aria-label={`Copy ${phone.number}`}
                      className="inline-flex items-center gap-1 text-xs text-gray-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-gray-700 transition"
                    >
                      {copiedValue === phone.number ? (
                        <>
                          <Check className="w-4 h-4 text-success-600" />
                          <span className="text-success-700">Copied</span>
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
                Other channels
              </h2>

              {channels.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No Line, WhatsApp, Facebook or website on file
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {channels.map((channel) => {
                    const Icon = channel.icon;
                    return (
                      <li key={channel.key}>
                        <a
                          href={channel.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 py-2.5 -mx-2 px-2 rounded-lg hover:bg-gray-50"
                        >
                          <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="w-20 shrink-0 text-sm text-gray-500">
                            {channel.name}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium text-gray-900 group-hover:text-brand-700">
                            {channel.value}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                General
              </h2>
              <dl className="space-y-2.5 text-sm">
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-gray-500">Address</dt>
                  <dd className="min-w-0 flex-1 text-gray-900">
                    {supplier.address ? (
                      <span className="flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                        {supplier.address}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not specified</span>
                    )}
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-gray-500">Created</dt>
                  <dd className="text-gray-900">
                    {formatDate(supplier.created_at)}
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-20 shrink-0 text-gray-500">Updated</dt>
                  <dd className="text-gray-900">
                    {formatDate(supplier.updated_at)}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </div>

      {/* Documents — FileDownloads renders its own heading and count */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-6">
        {filesLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
            <div className="h-10 rounded bg-gray-200 animate-pulse" />
          </div>
        ) : supplierFiles.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FolderOpen className="w-4 h-4" />
            No documents uploaded for this supplier
          </div>
        ) : (
          <FileDownloads
            files={supplierFiles}
            getFileUrl={supplierFilesService.getSupplierFileUrl}
            title="Supplier documents"
            isSupplier={true}
            showCategory={true}
          />
        )}
      </div>

      {/* Tours */}
      {isTourSupplier && (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 inline-flex items-center gap-2">
              <Palmtree className="w-4 h-4 text-gray-400" />
              Tours from this supplier
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
                Add tour
              </Link>
            )}
          </div>

          {toursLoading ? (
            renderSectionSkeleton(3)
          ) : supplierTours.length === 0 ? (
            <div className="text-center py-12 px-6">
              <p className="font-medium text-gray-500">No tours yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Add the first tour price for this supplier.
              </p>
              <Link
                to={`/add?supplier=${supplier.id}`}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-brand-600 hover:bg-brand-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add tour
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr className="border-b border-gray-200">
                      {[
                        "Tour name",
                        "Departure from",
                        "Adult price",
                        "Child price",
                        "End date",
                      ].map((label, i) => (
                        <th
                          key={label}
                          scope="col"
                          className={`px-6 py-3 uppercase tracking-wider text-[11px] font-semibold ${
                            i === 2 || i === 3 ? "text-right" : "text-left"
                          }`}
                        >
                          {label}
                        </th>
                      ))}
                      <th
                        scope="col"
                        className="px-6 py-3 text-right uppercase tracking-wider text-[11px] font-semibold"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {supplierTours.map((tour) => {
                      const expired = isExpired(tour.end_date);

                      return (
                        <tr
                          key={tour.id}
                          className={
                            expired
                              ? "bg-danger-50/40 hover:bg-danger-50"
                              : "hover:bg-gray-50"
                          }
                        >
                          <td className="px-6 py-3 align-top">
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-gray-900 leading-5">
                                {tour.tour_name}
                              </span>
                              {expired && (
                                <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-danger-100 px-2 py-0.5 text-[11px] font-semibold text-danger-700 ring-1 ring-inset ring-danger-200">
                                  <AlertTriangle className="w-3 h-3" />
                                  Expired
                                </span>
                              )}
                            </div>
                            {tour.pier && (
                              <div className="mt-1 text-xs text-gray-500">
                                Pier: {tour.pier}
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-3 whitespace-nowrap text-gray-900">
                            {tour.departure_from || "-"}
                          </td>

                          <td className="px-6 py-3 whitespace-nowrap text-right">
                            <span className="inline-flex items-baseline rounded-md bg-success-50 px-2 py-1 ring-1 ring-success-200 font-semibold text-success-700 tabular-nums">
                              THB {formatPrice(tour.adult_price)}
                            </span>
                          </td>

                          <td className="px-6 py-3 whitespace-nowrap text-right">
                            <span className="inline-flex items-baseline rounded-md bg-brand-50 px-2 py-1 ring-1 ring-brand-200 font-semibold text-brand-700 tabular-nums">
                              THB {formatPrice(tour.child_price)}
                            </span>
                          </td>

                          <td
                            className={`px-6 py-3 whitespace-nowrap ${
                              expired ? "text-danger-700" : "text-gray-500"
                            }`}
                          >
                            {formatDate(tour.end_date)}
                          </td>

                          <td className="px-6 py-3 whitespace-nowrap text-right">
                            {renderTourActions(tour)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {supplierTours.map((tour) => {
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
                          <div className="font-medium text-gray-900 leading-5">
                            {tour.tour_name}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {tour.departure_from || "-"}
                          </div>
                        </div>
                        {expired && (
                          <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-danger-100 px-2 py-0.5 text-[11px] font-semibold text-danger-700 ring-1 ring-inset ring-danger-200">
                            <AlertTriangle className="w-3 h-3" />
                            Expired
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="rounded-md bg-success-50 px-2 py-1 ring-1 ring-success-200 font-semibold text-success-700 tabular-nums">
                          Adult THB {formatPrice(tour.adult_price)}
                        </span>
                        <span className="rounded-md bg-brand-50 px-2 py-1 ring-1 ring-brand-200 font-semibold text-brand-700 tabular-nums">
                          Child THB {formatPrice(tour.child_price)}
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
