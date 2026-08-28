import { Link } from "react-router-dom";
import { useState } from "react";
import { MapLink, FileDownloads } from "../common";
import { filesService } from "../../services/api-service";
import { useTourFiles } from "../../hooks";
import { getTourCategoryInfo } from "../../utils/file-categories";
import { getTourTypeLabel } from "../../utils/tour-types";
import {
  DURATION_TYPES,
  PRICE_MODES,
  MEALS,
  MEAL_STYLES,
  VESSEL_TYPES,
  TRANSFER_TYPES,
  GUIDE_LANGUAGES,
  getLabel,
  toArray,
  formatOperatingDays,
  formatTimeRange,
  formatHours,
  formatAgeRange,
  formatTriState,
} from "../../utils/tour-details";
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
  Layers,
  Clock,
  UtensilsCrossed,
  Ship,
  BusFront,
  Star,
  EyeOff,
} from "lucide-react";
import { useI18n } from "../../i18n";

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
          <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-500">
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
  const { t } = useI18n();
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeFileTab, setActiveFileTab] = useState("all");
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

  // Show the park-fee breakdown only when an actual amount was entered
  const hasParkFee =
    Number(tour.park_fee_adult) > 0 || Number(tour.park_fee_child) > 0;

  // Detail fields, pre-formatted. A blank string means the field was never
  // filled in, and the section that would hold it is hidden rather than
  // showing a row of dashes.
  const detail = {
    durationType: getLabel(DURATION_TYPES, tour.duration_type),
    hours: formatHours(tour.duration_hours),
    tourTime: formatTimeRange(tour.start_time, tour.end_time),
    timeNote: tour.time_note || "",
    operatingDays: formatOperatingDays(tour.operating_days),
    leadHours: tour.booking_lead_hours ? `${tour.booking_lead_hours} hrs` : "",
    verifiedAt: tour.last_verified_at ? formatDate(tour.last_verified_at) : "",

    priceMode: getLabel(PRICE_MODES, tour.price_mode),
    childAge: formatAgeRange(tour.child_age_min, tour.child_age_max),
    infantAge: formatAgeRange(null, tour.infant_age_max),
    infantPrice:
      tour.infant_price === null || tour.infant_price === undefined
        ? ""
        : `THB ${formatPrice(tour.infant_price)}`,
    singleSupplement:
      Number(tour.single_supplement) > 0
        ? `THB ${formatPrice(tour.single_supplement)}`
        : "",
    paxRange:
      tour.min_pax || tour.max_pax
        ? [tour.min_pax, tour.max_pax].filter(Boolean).join(" – ") + " pax"
        : "",

    meals: toArray(tour.meals_included)
      .map((m) => getLabel(MEALS, m))
      .join(", "),
    mealStyle: getLabel(MEAL_STYLES, tour.meal_style),
    mealVenue: tour.meal_venue || "",
    halal: formatTriState(tour.halal_available),
    vegetarian: formatTriState(tour.vegetarian_available),
    mealNote: tour.meal_note || "",

    vesselType: getLabel(VESSEL_TYPES, tour.vessel_type),
    vesselName: tour.vessel_name || "",
    vesselCapacity: tour.vessel_capacity ? `${tour.vessel_capacity} pax` : "",
    vesselDetail: tour.vessel_detail || "",
    guide: formatTriState(tour.guide_included),
    guideLanguages: toArray(tour.guide_languages)
      .map((l) => getLabel(GUIDE_LANGUAGES, l))
      .join(", "),

    transferIncluded: formatTriState(tour.transfer_included),
    transferType: getLabel(TRANSFER_TYPES, tour.transfer_type),
    pickupWindow: formatTimeRange(tour.pickup_time_from, tour.pickup_time_to),
    meetingPoint: tour.meeting_point || "",
  };

  const filled = (...values) => values.some((v) => v !== "" && v != null);

  const hasSchedule = filled(
    detail.durationType,
    detail.hours,
    detail.tourTime,
    detail.timeNote,
    detail.operatingDays,
    detail.leadHours,
    detail.verifiedAt
  );
  const hasMeals = filled(
    detail.meals,
    detail.mealStyle,
    detail.mealVenue,
    detail.halal,
    detail.vegetarian,
    detail.mealNote
  );
  const hasVessel = filled(
    detail.vesselType,
    detail.vesselName,
    detail.vesselCapacity,
    detail.vesselDetail,
    detail.guide,
    detail.guideLanguages
  );
  const hasPickup = filled(
    detail.transferIncluded,
    detail.transferType,
    detail.pickupWindow,
    detail.meetingPoint
  );
  const hasPriceDetail = filled(
    detail.priceMode,
    detail.childAge,
    detail.infantAge,
    detail.infantPrice,
    detail.singleSupplement,
    detail.paxRange
  );

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
                className="text-brand-600 hover:underline"
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

  // Fall back to "All" when the selected category no longer has any files
  const effectiveFileTab = fileCategories.some((g) => g.key === activeFileTab)
    ? activeFileTab
    : "all";
  const visibleFileCategories =
    effectiveFileTab === "all"
      ? fileCategories
      : fileCategories.filter((g) => g.key === effectiveFileTab);

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
                {tour.tour_name || t("tour.details")}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {!!tour.tour_type && (
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
                    {getTourTypeLabel(tour.tour_type)}
                  </span>
                )}
                {Number(tour.is_frequent) === 1 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-3 py-1 text-xs font-medium text-warning-700 ring-1 ring-inset ring-warning-200">
                    <Star className="h-3 w-3 fill-current" />
                    Frequently used
                  </span>
                )}
                {Number(tour.is_active) === 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-300">
                    <EyeOff className="h-3 w-3" />
                    Inactive
                  </span>
                )}
                {!!detail.durationType && (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-700 ring-1 ring-inset ring-gray-200">
                    {detail.durationType}
                    {detail.hours && ` · ${detail.hours}`}
                  </span>
                )}
                {!!detail.vesselType && (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-700 ring-1 ring-inset ring-gray-200">
                    {detail.vesselType}
                  </span>
                )}
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
                  <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 px-3 py-1 text-xs font-medium text-danger-700 ring-1 ring-inset ring-danger-200">
                    <AlertTriangle className="h-3 w-3" />
                    {t("common.expired")}
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
                    title={t("tour.action.openShare")}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                )}

                {onEdit && (
                  <Link
                    to={`/edit/${tour.id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 active:scale-[.98]"
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
          iconClass="text-success-600"
          title={t("tour.section.netPrice")}
          defaultOpen
        >
          <div className="space-y-3 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200">
                <div className="text-xs text-gray-500">{t("tour.adult")}</div>
                <div className="mt-1 text-2xl font-bold text-success-600">
                  THB {formatPrice(tour.adult_price)}
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200">
                <div className="text-xs text-gray-500">{t("tour.child")}</div>
                <div className="mt-1 text-2xl font-bold text-success-600">
                  THB {formatPrice(tour.child_price)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-xs font-medium text-gray-500">{t("tour.from")}</span>
                <span className="text-sm text-gray-900">
                  {formatDate(tour.start_date)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <span className="text-xs font-medium text-gray-500">{t("tour.until")}</span>
                <span
                  className={`text-sm ${
                    isExpired ? "font-medium text-danger-600" : "text-gray-900"
                  }`}
                >
                  {formatDate(tour.end_date)}
                </span>
              </div>
            </div>
            {hasParkFee && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-lg bg-warning-50 px-3 py-2 ring-1 ring-warning-200">
                  <span className="text-xs font-medium text-warning-700">
                    Park fee / adult
                  </span>
                  <span className="text-sm font-medium text-warning-800">
                    THB {formatPrice(tour.park_fee_adult)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-warning-50 px-3 py-2 ring-1 ring-warning-200">
                  <span className="text-xs font-medium text-warning-700">
                    Park fee / child
                  </span>
                  <span className="text-sm font-medium text-warning-800">
                    THB {formatPrice(tour.park_fee_child)}
                  </span>
                </div>
              </div>
            )}
            {hasPriceDetail && (
              <dl className="divide-y divide-gray-100 rounded-lg ring-1 ring-gray-200">
                {!!detail.priceMode && (
                  <Row label={t("tour.field.priceMode")}>{detail.priceMode}</Row>
                )}
                {!!detail.childAge && (
                  <Row label={t("tour.field.childAge")}>{detail.childAge}</Row>
                )}
                {(!!detail.infantAge || !!detail.infantPrice) && (
                  <Row label={t("tour.field.infantPrice")}>
                    {[detail.infantAge, detail.infantPrice]
                      .filter(Boolean)
                      .join(" · ")}
                  </Row>
                )}
                {!!detail.singleSupplement && (
                  <Row label={t("tour.field.singleSupplement")}>
                    {detail.singleSupplement}
                  </Row>
                )}
                {!!detail.paxRange && <Row label={t("tour.field.capacity")}>{detail.paxRange}</Row>}
              </dl>
            )}
          </div>
        </AccordionSection>

        {/* Tour Information — open by default */}
        <AccordionSection
          icon={Info}
          iconClass="text-brand-600"
          title={t("tour.section.information")}
          defaultOpen
        >
          <dl className="divide-y divide-gray-100">
            <Row label={t("tour.field.name")}>{tour.tour_name}</Row>
            {!!tour.tour_type && (
              <Row label={t("tour.field.tourType")}>{getTourTypeLabel(tour.tour_type)}</Row>
            )}
            <Row label={t("tour.field.departureFrom")}>{tour.departure_from}</Row>
            {!!tour.destination && (
              <Row label={t("tour.field.destination")}>{tour.destination}</Row>
            )}
            <Row label={t("tour.field.pier")}>{tour.pier}</Row>
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

        {/* Duration & schedule — only when something was recorded */}
        {hasSchedule && (
          <AccordionSection
            icon={Clock}
            iconClass="text-brand-600"
            title={t("tour.section.duration")}
            defaultOpen
          >
            <dl className="divide-y divide-gray-100">
              {!!detail.durationType && (
                <Row label={t("tour.field.duration")}>{detail.durationType}</Row>
              )}
              {!!detail.hours && <Row label={t("tour.field.hours")}>{detail.hours}</Row>}
              {!!detail.tourTime && <Row label={t("tour.schedule")}>{detail.tourTime}</Row>}
              {!!detail.timeNote && (
                <Row label={t("tour.field.timingNote")}>{detail.timeNote}</Row>
              )}
              {!!detail.operatingDays && (
                <Row label={t("tour.field.operatingDays")}>{detail.operatingDays}</Row>
              )}
              {!!detail.leadHours && (
                <Row label={t("tour.field.bookAhead")}>{detail.leadHours}</Row>
              )}
              {!!detail.verifiedAt && (
                <Row label={t("tour.field.rateConfirmed")}>{detail.verifiedAt}</Row>
              )}
            </dl>
          </AccordionSection>
        )}

        {/* Meals */}
        {hasMeals && (
          <AccordionSection
            icon={UtensilsCrossed}
            iconClass="text-warning-600"
            title={t("tour.section.meals")}
          >
            <dl className="divide-y divide-gray-100">
              {!!detail.meals && <Row label={t("tour.field.included")}>{detail.meals}</Row>}
              {!!detail.mealStyle && (
                <Row label={t("tour.field.mealStyle")}>{detail.mealStyle}</Row>
              )}
              {!!detail.mealVenue && <Row label={t("tour.field.mealVenue")}>{detail.mealVenue}</Row>}
              {!!detail.halal && <Row label={t("tour.field.halal")}>{detail.halal}</Row>}
              {!!detail.vegetarian && (
                <Row label={t("tour.field.vegetarian")}>{detail.vegetarian}</Row>
              )}
              {!!detail.mealNote && <Row label={t("common.note")}>{detail.mealNote}</Row>}
            </dl>
          </AccordionSection>
        )}

        {/* Boat / vehicle & guide */}
        {hasVessel && (
          <AccordionSection
            icon={Ship}
            iconClass="text-brand-600"
            title={t("tour.section.transport")}
          >
            <dl className="divide-y divide-gray-100">
              {!!detail.vesselType && <Row label={t("tour.field.type")}>{detail.vesselType}</Row>}
              {!!detail.vesselName && <Row label={t("common.name")}>{detail.vesselName}</Row>}
              {!!detail.vesselCapacity && (
                <Row label={t("tour.field.capacity")}>{detail.vesselCapacity}</Row>
              )}
              {!!detail.vesselDetail && (
                <Row label={t("tour.field.detail")}>{detail.vesselDetail}</Row>
              )}
              {!!detail.guide && <Row label={t("tour.field.guide")}>{detail.guide}</Row>}
              {!!detail.guideLanguages && (
                <Row label={t("tour.field.guideLanguages")}>{detail.guideLanguages}</Row>
              )}
            </dl>
          </AccordionSection>
        )}

        {/* Pickup & transfer */}
        {hasPickup && (
          <AccordionSection
            icon={BusFront}
            iconClass="text-brand-600"
            title={t("tour.section.pickup")}
          >
            <dl className="divide-y divide-gray-100">
              {!!detail.transferIncluded && (
                <Row label={t("tour.field.hotelTransfer")}>{detail.transferIncluded}</Row>
              )}
              {!!detail.transferType && (
                <Row label={t("tour.field.transferType")}>{detail.transferType}</Row>
              )}
              {!!detail.pickupWindow && (
                <Row label={t("tour.section.pickup")}>{detail.pickupWindow}</Row>
              )}
              {!!detail.meetingPoint && (
                <Row label={t("tour.field.meetingPoint")}>{detail.meetingPoint}</Row>
              )}
            </dl>
          </AccordionSection>
        )}

        {/* Contact & Supplier — collapsed by default */}
        <AccordionSection
          icon={Phone}
          iconClass="text-brand-600"
          title={t("tour.section.contact")}
        >
          <dl className="divide-y divide-gray-100">
            {renderPhoneNumbers()}
            {tour.line && (
              <div className="grid grid-cols-3 gap-3 px-4 py-2.5">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <MessageCircle className="h-3.5 w-3.5 text-success-600" />
                  Line
                </dt>
                <dd className="col-span-2 text-sm text-gray-900">{tour.line}</dd>
              </div>
            )}
            {tour.facebook && (
              <div className="grid grid-cols-3 gap-3 px-4 py-2.5">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <ExternalLink className="h-3.5 w-3.5 text-brand-600" />
                  Facebook
                </dt>
                <dd className="col-span-2 text-sm">
                  <a
                    href={tour.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-brand-600 hover:underline"
                  >
                    {tour.facebook}
                  </a>
                </dd>
              </div>
            )}
            {tour.whatsapp && (
              <div className="grid grid-cols-3 gap-3 px-4 py-2.5">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <Smartphone className="h-3.5 w-3.5 text-success-600" />
                  WhatsApp
                </dt>
                <dd className="col-span-2 text-sm">
                  <a
                    href={`https://wa.me/${tour.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-success-600 hover:underline"
                  >
                    {tour.whatsapp}
                  </a>
                </dd>
              </div>
            )}
            {hasSupplier && (
              <>
                <Row label={t("tour.field.supplier")}>{tour.supplier_name}</Row>
                {tour.address && <Row label={t("suppliers.address")}>{tour.address}</Row>}
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
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
            <p className="text-sm text-gray-500">{t("tour.loadingFiles")}</p>
          </div>
        ) : (
          totalFiles > 0 && (
            <AccordionSection
              icon={Paperclip}
              iconClass="text-warning-600"
              title={t("tour.section.files")}
              badge={totalFiles}
            >
              {/* Category tabs — keeps the panel short instead of stacking
                  every category on top of each other */}
              {fileCategories.length > 1 && (
                <div
                  role="tablist"
                  aria-label={t("common.fileCategories")}
                  className="flex items-center gap-2 overflow-x-auto border-b border-gray-100 px-4 py-3"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={effectiveFileTab === "all"}
                    onClick={() => setActiveFileTab("all")}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                      effectiveFileTab === "all"
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    All
                    <span className="opacity-75">({totalFiles})</span>
                  </button>

                  {fileCategories.map(({ key, files, categoryInfo }) => {
                    const CategoryIcon = categoryInfo.icon;
                    const isActive = effectiveFileTab === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveFileTab(key)}
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                          isActive
                            ? `${categoryInfo.color} border-current font-medium`
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <CategoryIcon className="h-3.5 w-3.5" />
                        {categoryInfo.label}
                        <span className="opacity-75">({files.length})</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="space-y-6 p-4">
                {visibleFileCategories.map(({ key, files, categoryInfo }) => {
                  const CategoryIcon = categoryInfo.icon;
                  const isImageGroup =
                    key === "gallery" ||
                    files.some((f) => f.file_type === "image");
                  return (
                    <div key={key}>
                      {/* The active tab already names a filtered view */}
                      {effectiveFileTab === "all" && (
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <CategoryIcon className="h-4 w-4 text-gray-400" />
                          {t(`file.category.${key}`)} ({" "}
                          {isImageGroup
                            ? t("common.imageCount", { count: files.length })
                            : t("document.fileCount", { count: files.length })})
                        </h4>
                      )}

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
              ? "bg-success-50 ring-success-200"
              : "bg-warning-50 ring-warning-200"
          }`}
        >
          <p className="flex items-start gap-2 whitespace-pre-wrap text-sm text-gray-900">
            <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            {getNotes(tour)}
          </p>
          {isExpired && (
            <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-danger-600">
              <AlertTriangle className="h-4 w-4" />
              {t("tour.expiredRenew")}
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
              alt={t("common.enlargedView")}
              className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white bg-opacity-90 text-gray-900 shadow-lg transition-all hover:bg-opacity-100"
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
