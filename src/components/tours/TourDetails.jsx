import { Link } from "react-router-dom";
import { useState } from "react";
import { MapLink, FileDownloads } from "../common";
import { filesService } from "../../services/api-service";
import { useTourFiles } from "../../hooks";
import { getTourCategoryInfo } from "../../utils/file-categories";
import {
  Pencil,
  Share2,
  Banknote,
  Info,
  Phone,
  Paperclip,
  StickyNote,
  MapPin,
  AlertTriangle,
  MessageCircle,
  ExternalLink,
  Smartphone,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";

// Collapsible section (module scope so its open/closed state persists across re-renders)
const AccordionSection = ({
  icon: Icon,
  iconClass = "text-gray-400",
  title,
  badge,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 bg-gray-50/80 px-4 py-3 text-left transition-colors hover:bg-gray-100"
      >
        {Icon && <Icon className={`h-4 w-4 shrink-0 ${iconClass}`} />}
        <h3 className="flex-1 text-sm font-semibold text-gray-900">{title}</h3>
        {badge != null && (
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
            {badge}
          </span>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="border-t border-gray-100">{children}</div>}
    </section>
  );
};

const TourDetails = ({
  tour,
  showActions = true,
  onEdit,
  onShare,
  showHeader = true,
  className = "",
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const { filesByCategory, loading: filesLoading } = useTourFiles(tour?.id);

  const getOrderedCategories = () => {
    const order = ["brochure", "brochure_supplier", "general", "gallery"];
    const result = [];

    order.forEach((categoryKey) => {
      if (filesByCategory[categoryKey]?.length > 0) {
        result.push({
          key: categoryKey,
          files: filesByCategory[categoryKey],
          categoryInfo: getTourCategoryInfo(categoryKey),
        });
      }
    });

    return result;
  };

  if (!tour) return null;

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString || dateString === "0000-00-00") return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    const n =
      typeof price === "number"
        ? price
        : Number(String(price).replace(/[, ]/g, ""));
    if (Number.isNaN(n)) return "-";
    return new Intl.NumberFormat("en-US").format(n);
  };

  const isExpired =
    tour.end_date &&
    tour.end_date !== "0000-00-00" &&
    new Date(tour.end_date) < new Date();

  const getNotes = (tour) => {
    const base = tour.park_fee_included
      ? "This Net price includes the park fee"
      : "This Net price does not include the park fee";
    return tour.notes ? `${base} | ${tour.notes}` : base;
  };

  const Row = ({ label, children }) => (
    <div className="grid grid-cols-3 gap-3 px-4 py-2.5">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="col-span-2 text-sm text-gray-900">{children || "-"}</dd>
    </div>
  );

  const renderPhoneNumbers = () => {
    const phones = [
      tour.phone,
      tour.phone_2,
      tour.phone_3,
      tour.phone_4,
      tour.phone_5,
    ].filter((phone) => phone?.trim());

    if (phones.length === 0) return null;

    return (
      <div className="grid grid-cols-3 gap-3 px-4 py-2.5">
        <dt className="text-xs font-medium text-gray-500">
          Phone{phones.length > 1 && ` (${phones.length})`}
        </dt>
        <dd className="col-span-2 text-sm">
          {phones.map((phone, index) => (
            <span key={index}>
              <a
                href={`tel:${phone}`}
                className="text-blue-600 hover:underline"
              >
                {phone}
              </a>
              {index < phones.length - 1 && (
                <span className="text-gray-400">, </span>
              )}
            </span>
          ))}
        </dd>
      </div>
    );
  };

  const hasContact =
    tour.phone || tour.line || tour.facebook || tour.whatsapp;
  const hasSupplier = tour.supplier_name || tour.address;

  const fileCategories = getOrderedCategories();
  const totalFiles = fileCategories.reduce((sum, g) => sum + g.files.length, 0);

  const formatUpdatedAt = (value) =>
    value
      ? new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  return (
    <div className={`tour-details ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2
                className="truncate text-xl font-semibold text-gray-900"
                title={tour.tour_name}
              >
                {tour.tour_name || "Tour Details"}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {!!tour.pier && (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-700 ring-1 ring-inset ring-gray-200">
                    Pier: {tour.pier}
                  </span>
                )}
                {!!tour.departure_from && (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-700 ring-1 ring-inset ring-gray-200">
                    Departure from: {tour.departure_from}
                  </span>
                )}
                {!!tour.supplier_name && (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-700 ring-1 ring-inset ring-gray-200">
                    Supplier: {tour.supplier_name}
                  </span>
                )}
                {isExpired && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
                    <AlertTriangle className="h-3 w-3" />
                    Expired
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex shrink-0 items-center gap-2">
                {onShare && (
                  <button
                    onClick={() => onShare(tour)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[.98]"
                    title="Open share page"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                )}

                {onEdit && (
                  <Link
                    to={`/edit/${tour.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 active:scale-[.98]"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        {/* Pricing — open by default */}
        <AccordionSection
          icon={Banknote}
          iconClass="text-emerald-500"
          title="Net Price (THB)"
          defaultOpen
        >
          <div className="space-y-3 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200">
                <div className="text-xs text-gray-500">Adult</div>
                <div className="mt-1 text-2xl font-bold text-emerald-600">
                  THB {formatPrice(tour.adult_price)}
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200">
                <div className="text-xs text-gray-500">Child</div>
                <div className="mt-1 text-2xl font-bold text-emerald-600">
                  THB {formatPrice(tour.child_price)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-xs font-medium text-gray-500">From</span>
                <span className="text-sm text-gray-900">
                  {formatDate(tour.start_date)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-xs font-medium text-gray-500">Until</span>
                <span
                  className={`text-sm ${
                    isExpired ? "font-medium text-red-600" : "text-gray-900"
                  }`}
                >
                  {formatDate(tour.end_date)}
                </span>
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* Tour Information — open by default */}
        <AccordionSection
          icon={Info}
          iconClass="text-blue-500"
          title="Tour Information"
          defaultOpen
        >
          <dl className="divide-y divide-gray-100">
            <Row label="Tour name">{tour.tour_name}</Row>
            <Row label="Departure from">{tour.departure_from}</Row>
            <Row label="Pier">{tour.pier}</Row>
          </dl>
          {tour.map_url && (
            <div className="border-t border-gray-100 p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                Map
              </div>
              <MapLink mapUrl={tour.map_url} tourName={tour.tour_name} />
            </div>
          )}
        </AccordionSection>

        {/* Contact & Supplier — collapsed by default */}
        <AccordionSection
          icon={Phone}
          iconClass="text-violet-500"
          title="Contact & Supplier"
        >
          <dl className="divide-y divide-gray-100">
            {renderPhoneNumbers()}
            {tour.line && (
              <div className="grid grid-cols-3 gap-3 px-4 py-2.5">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                  Line
                </dt>
                <dd className="col-span-2 text-sm text-gray-900">{tour.line}</dd>
              </div>
            )}
            {tour.facebook && (
              <div className="grid grid-cols-3 gap-3 px-4 py-2.5">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                  Facebook
                </dt>
                <dd className="col-span-2 text-sm">
                  <a
                    href={tour.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-blue-600 hover:underline"
                  >
                    {tour.facebook}
                  </a>
                </dd>
              </div>
            )}
            {tour.whatsapp && (
              <div className="grid grid-cols-3 gap-3 px-4 py-2.5">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <Smartphone className="h-3.5 w-3.5 text-green-600" />
                  WhatsApp
                </dt>
                <dd className="col-span-2 text-sm">
                  <a
                    href={`https://wa.me/${tour.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline"
                  >
                    {tour.whatsapp}
                  </a>
                </dd>
              </div>
            )}
            {hasSupplier && (
              <>
                <Row label="Supplier">{tour.supplier_name}</Row>
                {tour.address && <Row label="Address">{tour.address}</Row>}
              </>
            )}
            {!hasContact && !hasSupplier && (
              <div className="px-4 py-3 text-center text-sm text-gray-500">
                No contact information
              </div>
            )}
          </dl>
        </AccordionSection>

        {/* Files & Gallery — collapsed by default */}
        {filesLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Loading files...</p>
          </div>
        ) : (
          totalFiles > 0 && (
            <AccordionSection
              icon={Paperclip}
              iconClass="text-amber-500"
              title="Files & Gallery"
              badge={totalFiles}
            >
              <div className="space-y-6 p-4">
                {fileCategories.map(({ key, files, categoryInfo }) => {
                  const CategoryIcon = categoryInfo.icon;
                  const isImageGroup =
                    key === "gallery" ||
                    files.some((f) => f.file_type === "image");
                  return (
                    <div key={key}>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <CategoryIcon className="h-4 w-4 text-gray-400" />
                        {categoryInfo.label} ({files.length}{" "}
                        {isImageGroup ? "images" : "files"})
                      </h4>

                      {isImageGroup ? (
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                          {files
                            .filter((f) => f.file_type === "image")
                            .map((file) => (
                              <div
                                key={file.id}
                                className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-all duration-200 hover:shadow-md"
                              >
                                <img
                                  src={filesService.getFileUrl(file)}
                                  alt={file.original_name}
                                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                                  loading="lazy"
                                  onClick={() =>
                                    setSelectedImage(
                                      filesService.getFileUrl(file)
                                    )
                                  }
                                />
                              </div>
                            ))}
                        </div>
                      ) : (
                        <FileDownloads
                          files={files}
                          getFileUrl={filesService.getFileUrl}
                          title={categoryInfo.label}
                          isSupplier={false}
                          showCategory={false}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionSection>
          )
        )}

        {/* Notes — kept at the bottom */}
        <div
          className={`rounded-xl p-3 ring-1 ${
            tour.park_fee_included
              ? "bg-emerald-50 ring-emerald-200"
              : "bg-amber-50 ring-amber-200"
          }`}
        >
          <p className="flex items-start gap-2 whitespace-pre-wrap text-sm text-gray-800">
            <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            {getNotes(tour)}
          </p>
          {isExpired && (
            <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Expired, please renew
            </p>
          )}
        </div>

        {/* System footer */}
        <p className="pt-1 text-center text-xs text-gray-400">
          Updated by {tour.updated_by || "-"} ·{" "}
          {formatUpdatedAt(tour.updated_at)}
        </p>
      </div>

      {/* Image Modal for Enlarged View */}
      {selectedImage && (
        <div
          className="modal-backdrop z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative h-auto max-h-[90vh] w-auto max-w-4xl">
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-90 text-gray-800 shadow-lg transition-all hover:bg-opacity-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourDetails;
