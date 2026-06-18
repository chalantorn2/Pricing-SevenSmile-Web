import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapLink, FileGallery, FileDownloads } from "../common";
import { filesService } from "../../services/api-service";
import { useTourFiles } from "../../hooks";
import { getTourCategoryInfo } from "../../utils/file-categories";

const TourDetails = ({
  tour,
  showActions = true,
  onEdit,
  onShare,
  showHeader = true,
  className = "",
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const {
    filesByCategory, // use this instead
    loading: filesLoading,
  } = useTourFiles(tour?.id);

  const getOrderedCategories = () => {
    const order = ["brochure", "general", "gallery"];
    const result = [];

    console.log("🐛 filesByCategory:", filesByCategory); // added this line

    order.forEach((categoryKey) => {
      if (
        filesByCategory[categoryKey] &&
        filesByCategory[categoryKey].length > 0
      ) {
        result.push({
          key: categoryKey,
          files: filesByCategory[categoryKey],
          categoryInfo: getTourCategoryInfo(categoryKey),
        });
      }
    });

    console.log("🐛 result:", result); // added this line
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

  const getNotesWithExpiry = (tour) => {
    let notes = tour.notes || "";
    notes =
      (tour.park_fee_included
        ? "This Net price includes the park fee"
        : "This Net price does not include the park fee") + (notes ? ` | ${notes}` : "");

    if (tour.end_date && tour.end_date !== "0000-00-00") {
      const expired = new Date(tour.end_date) < new Date();
      if (expired) notes += " | ⚠️ Expired, please renew";
    }
    return notes;
  };

  const SectionHeader = ({ icon = "⬤", children }) => (
    <div className="flex items-center gap-2 rounded-t-xl bg-gray-50/80 px-4 py-3 border-b border-gray-200">
      <span className="text-xs">{icon}</span>
      <h3 className="text-sm font-semibold text-gray-900">{children}</h3>
    </div>
  );

  // Added to the Helper functions section
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
      <div className="grid grid-cols-3 gap-3 px-4 py-3">
        <dt className="text-xs font-medium text-gray-500">
          Phone{phones.length > 1 && ` (${phones.length} numbers)`}
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
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h6m0 0v6m0-6l-8 8M7 7v10a2 2 0 002 2h6"
                      />
                    </svg>
                    Share
                  </button>
                )}

                {onEdit && (
                  <Link
                    to={`/edit/${tour.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 active:scale-[.98]"
                  >
                    <span>✏️</span> Edit
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-6">
        {/* Pricing */}
        <section className="rounded-xl border border-gray-200 bg-gray-50/60">
          <SectionHeader icon="THB">Net Price (THB)</SectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:gap-6">
            <div className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
              <div className="text-xs text-gray-500">Adult</div>
              <div className="mt-1 text-2xl font-bold text-emerald-600">
                THB {formatPrice(tour.adult_price)}
              </div>
            </div>
            <div className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
              <div className="text-xs text-gray-500">Child</div>
              <div className="mt-1 text-2xl font-bold text-emerald-600">
                THB {formatPrice(tour.child_price)}
              </div>
            </div>
          </div>
        </section>

        {/* Two columns info */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left: Tour info + Dates */}
          <section className="space-y-6">
            <div className="rounded-xl border border-gray-200">
              <SectionHeader icon="ℹ️">Tour Information</SectionHeader>
              <dl className="divide-y divide-gray-100">
                <div className="grid grid-cols-3 gap-3 px-4 py-3">
                  <dt className="text-xs font-medium text-gray-500">
                    Tour name
                  </dt>
                  <dd className="col-span-2 text-sm text-gray-900">
                    {tour.tour_name || "-"}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-3 px-4 py-3">
                  <dt className="text-xs font-medium text-gray-500">Departure from</dt>
                  <dd className="col-span-2 text-sm text-gray-900">
                    {tour.departure_from || "-"}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-3 px-4 py-3">
                  <dt className="text-xs font-medium text-gray-500">Pier</dt>
                  <dd className="col-span-2 text-sm text-gray-900">
                    {tour.pier || "-"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-gray-200">
              <SectionHeader icon="🗓️">Validity Period for This Price</SectionHeader>
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-xs font-medium text-gray-500">
                    Start date
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatDate(tour.start_date)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-xs font-medium text-gray-500">
                    End date
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatDate(tour.end_date)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Right: Contact + Supplier + System */}
          <section className="space-y-6">
            <div className="rounded-xl border border-gray-200">
              <SectionHeader icon="☎️">Contact Channels</SectionHeader>
              <dl className="divide-y divide-gray-100">
                {renderPhoneNumbers()}
                {tour.line && (
                  <div className="grid grid-cols-3 gap-3 px-4 py-3">
                    <dt className="text-xs font-medium text-gray-500">Line</dt>
                    <dd className="col-span-2 text-sm text-gray-900">
                      {tour.line}
                    </dd>
                  </div>
                )}
                {tour.line && (
                  <div className="grid grid-cols-3 gap-3 px-4 py-3">
                    <dt className="text-xs font-medium text-gray-500">Line</dt>
                    <dd className="col-span-2 text-sm text-gray-900">
                      {tour.line}
                    </dd>
                  </div>
                )}
                {tour.facebook && (
                  <div className="grid grid-cols-3 gap-3 px-4 py-3">
                    <dt className="text-xs font-medium text-gray-500">
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
                  <div className="grid grid-cols-3 gap-3 px-4 py-3">
                    <dt className="text-xs font-medium text-gray-500">
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
                {!tour.phone &&
                  !tour.line &&
                  !tour.facebook &&
                  !tour.whatsapp && (
                    <div className="px-4 py-3 text-center text-sm text-gray-500">
                      No contact information
                    </div>
                  )}
              </dl>
            </div>

            <div className="rounded-xl border border-gray-200">
              <SectionHeader icon="🤝">Supplier Information</SectionHeader>
              <dl className="divide-y divide-gray-100">
                <div className="grid grid-cols-3 gap-3 px-4 py-3">
                  <dt className="text-xs font-medium text-gray-500">Name</dt>
                  <dd className="col-span-2 text-sm text-gray-900">
                    {tour.supplier_name || "-"}
                  </dd>
                </div>
                {tour.address && (
                  <div className="grid grid-cols-3 gap-3 px-4 py-3">
                    <dt className="text-xs font-medium text-gray-500">
                      Address
                    </dt>
                    <dd className="col-span-2 text-sm text-gray-900">
                      {tour.address}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-xl border border-gray-200">
              <SectionHeader icon="⚙️">System Information</SectionHeader>
              <dl className="divide-y divide-gray-100">
                <div className="grid grid-cols-3 gap-3 px-4 py-3">
                  <dt className="text-xs font-medium text-gray-500">
                    Updated at
                  </dt>
                  <dd className="col-span-2 text-sm text-gray-900">
                    {tour.updated_at
                      ? new Date(tour.updated_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-3 px-4 py-3">
                  <dt className="text-xs font-medium text-gray-500">
                    Updated by
                  </dt>
                  <dd className="col-span-2 text-sm text-gray-900">
                    {tour.updated_by || "-"}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </div>

        {/* Notes */}
        <section>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">Notes</h3>
          <div
            className={`rounded-xl p-4 ring-1 ${
              tour.park_fee_included
                ? "bg-emerald-50 ring-emerald-200"
                : "bg-amber-50 ring-amber-200"
            }`}
          >
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {getNotesWithExpiry(tour)}
            </p>
          </div>
        </section>

        {/* Map Link */}
        {tour.map_url && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Map</h3>
            <MapLink mapUrl={tour.map_url} tourName={tour.tour_name} />
          </section>
        )}

        {/* Files Sections - revised */}
        {getOrderedCategories().length > 0 && (
          <section className="space-y-6">
            {getOrderedCategories().map(({ key, files, categoryInfo }) => (
              <div key={key}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">{categoryInfo.icon}</span>
                  {categoryInfo.label} ({files.length}{" "}
                  {files.some((f) => f.file_type === "image") ? "images" : "files"})
                </h3>

                {/* If it is a gallery or has images -> show as grid */}
                {key === "gallery" ||
                files.some((f) => f.file_type === "image") ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {files
                      .filter((f) => f.file_type === "image")
                      .map((file) => (
                        <div
                          key={file.id}
                          className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                        >
                          <img
                            src={filesService.getFileUrl(file)}
                            alt={file.original_name}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                            loading="lazy"
                            onClick={() =>
                              setSelectedImage(filesService.getFileUrl(file))
                            }
                          />
                        </div>
                      ))}
                  </div>
                ) : (
                  /* If not images -> show as downloads */
                  <FileDownloads
                    files={files}
                    getFileUrl={filesService.getFileUrl}
                    title={categoryInfo.label}
                    isSupplier={false}
                    showCategory={false}
                  />
                )}
              </div>
            ))}
          </section>
        )}

        {/* Loading state */}
        {filesLoading && (
          <section className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading files...</p>
          </section>
        )}
      </div>

      {/* Image Modal for Enlarged View */}
      {selectedImage && (
        <div
          className="modal-backdrop flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-auto h-auto">
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 rounded-full w-10 h-10 flex items-center justify-center transition-all shadow-lg"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourDetails;
