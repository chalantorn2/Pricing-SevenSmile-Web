import { useEffect, useMemo, useRef, useState } from "react";
import { hotelsService } from "../../services/api-service";
import { useI18n } from "../../i18n";

const PRESET_CATEGORIES = [
  "Exterior",
  "Lobby",
  "Bedroom",
  "Bathroom",
  "Restaurant",
  "Pool",
  "Spa",
  "Gym",
  "View",
];
const BED_TYPES = ["King", "Queen", "Twin", "Double", "Single", "Bunk"];

const EMPTY = {
  name: "",
  destination: "",
  stars: 4,
  description: "",
  short_description: "",
  address: "",
  contact_phone: "",
  contact_email: "",
  website: "",
  check_in_time: "",
  check_out_time: "",
  main_image: "",
  logo: "",
  rating: 0,
  review_count: 0,
  amenities: "",
  is_featured: false,
  is_active: true,
};

const TABS = [
  { key: "basic", labelKey: "common.basicInfo" },
  { key: "media", labelKey: "common.media" },
  { key: "rooms", labelKey: "hotels.roomTypes" },
  { key: "settings", labelKey: "common.settings" },
];

const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500";

const linesToArray = (s) =>
  (s || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
const csvToArray = (s) =>
  (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const Field = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-danger-600"> *</span>}
      {hint && <span className="text-gray-400 font-normal"> {hint}</span>}
    </label>
    {children}
  </div>
);

const SectionCard = ({ title, right, children }) => (
  <div className="border border-gray-200 rounded-xl p-4 mb-4">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {right && <span className="text-xs text-gray-400">{right}</span>}
    </div>
    {children}
  </div>
);

function hotelToForm(h) {
  return {
    ...EMPTY,
    name: h.name || "",
    destination: h.destination || "",
    stars: h.stars ?? 4,
    description: h.description || "",
    short_description: h.short_description || "",
    address: h.address || "",
    contact_phone: h.contact_phone || "",
    contact_email: h.contact_email || "",
    website: h.website || "",
    check_in_time: h.check_in_time || "",
    check_out_time: h.check_out_time || "",
    main_image: h.main_image || "",
    logo: h.logo || "",
    rating: h.rating ?? 0,
    review_count: h.review_count ?? 0,
    amenities: Array.isArray(h.amenities) ? h.amenities.join("\n") : "",
    is_featured: Number(h.is_featured) === 1,
    is_active: Number(h.is_active) === 1,
  };
}

/**
 * Create/edit a hotel by hand. Ported from the indosmilesouthservices.com admin
 * modal — same tabs, category-grouped gallery (bulk category / delete, drag
 * reorder) and room-type builder — restyled to this app's UI.
 */
const HotelFormModal = ({ hotel, destinations, onClose, onSaved }) => {
  const { t } = useI18n();
  const isEdit = Boolean(hotel);
  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState(EMPTY);
  const [gallery, setGallery] = useState([]); // { image_url, category, caption }[]
  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState(() => new Set()); // gallery indexes
  const [uploadCategory, setUploadCategory] = useState("Uncategorized");
  const [customCategory, setCustomCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mainUploading, setMainUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const dragIndex = useRef(null);

  useEffect(() => {
    if (hotel) {
      setForm(hotelToForm(hotel));
      setGallery(
        Array.isArray(hotel.images)
          ? hotel.images.map((img) => ({
              image_url: img.image_url,
              category: img.category || "Uncategorized",
              caption: img.caption || "",
            }))
          : []
      );
      setRooms(
        Array.isArray(hotel.room_types)
          ? hotel.room_types.map((r) => ({
              name: r.name || "",
              bed_type: r.bed_type || "",
              max_guests: r.max_guests ?? 2,
              room_size: r.room_size ?? "",
              description: r.description || "",
              amenities: Array.isArray(r.amenities) ? r.amenities.join(", ") : "",
            }))
          : []
      );
    } else {
      setForm(EMPTY);
      setGallery([]);
      setRooms([]);
    }
    setSelected(new Set());
    setTab("basic");
    setError("");
  }, [hotel]);

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  // --- category options for the gallery (presets + room names + custom in use) ---
  const roomNames = useMemo(
    () => rooms.map((r) => r.name.trim()).filter(Boolean),
    [rooms]
  );
  const categoryOptions = useMemo(() => {
    const used = new Set(gallery.map((g) => g.category));
    const custom = [...used].filter(
      (c) =>
        c &&
        c !== "Uncategorized" &&
        !PRESET_CATEGORIES.includes(c) &&
        !roomNames.includes(c)
    );
    return { presets: PRESET_CATEGORIES, rooms: roomNames, custom };
  }, [gallery, roomNames]);

  const resolveUploadCategory = () => {
    if (uploadCategory === "__custom__")
      return customCategory.trim() || "Uncategorized";
    return uploadCategory;
  };

  // --- image uploads ---
  const onMainImage = async (files) => {
    if (!files?.[0]) return;
    setMainUploading(true);
    try {
      const data = await hotelsService.uploadHotelImages([files[0]]);
      if (data.url) setForm((f) => ({ ...f, main_image: data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setMainUploading(false);
    }
  };

  const onLogo = async (files) => {
    if (!files?.[0]) return;
    setLogoUploading(true);
    try {
      const data = await hotelsService.uploadHotelImages([files[0]]);
      if (data.url) setForm((f) => ({ ...f, logo: data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLogoUploading(false);
    }
  };

  const onGalleryImages = async (files) => {
    if (!files?.length) return;
    const category = resolveUploadCategory();
    setGalleryUploading(true);
    try {
      const data = await hotelsService.uploadHotelImages(files);
      setGallery((g) => [
        ...g,
        ...(data.urls || []).map((url) => ({
          image_url: url,
          category,
          caption: "",
        })),
      ]);
      if (data.errors?.length) setError(t("common.uploadFailed", { message: data.errors.join(", ") }));
    } catch (err) {
      setError(err.message);
    } finally {
      setGalleryUploading(false);
    }
  };

  // --- gallery selection / bulk ops ---
  const toggleSelect = (index) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const applyCategory = (category) => {
    if (!category) return;
    setGallery((g) => g.map((img, i) => (selected.has(i) ? { ...img, category } : img)));
    setSelected(new Set());
  };

  const deleteSelected = () => {
    if (!window.confirm(t("common.deleteSelectedImages", { count: selected.size }))) return;
    setGallery((g) => g.filter((_, i) => !selected.has(i)));
    setSelected(new Set());
  };

  const removeImage = (index) => {
    setGallery((g) => g.filter((_, i) => i !== index));
    setSelected(new Set());
  };

  const onGalleryDrop = (targetIndex) => {
    const from = dragIndex.current;
    if (from === null || from === targetIndex) return;
    setGallery((g) => {
      const next = [...g];
      const targetCategory = next[targetIndex]?.category;
      const [item] = next.splice(from, 1);
      if (targetCategory) item.category = targetCategory;
      next.splice(targetIndex, 0, item);
      return next;
    });
    dragIndex.current = null;
    setSelected(new Set());
  };

  // --- room builder ---
  const addRoom = () =>
    setRooms((r) => [
      ...r,
      { name: "", bed_type: "", max_guests: 2, room_size: "", description: "", amenities: "" },
    ]);
  const updateRoom = (i, key, value) =>
    setRooms((r) => r.map((x, idx) => (idx === i ? { ...x, [key]: value } : x)));
  const removeRoom = (i) => setRooms((r) => r.filter((_, idx) => idx !== i));

  // grouped gallery view (keeps original indexes)
  const grouped = useMemo(() => {
    const groups = {};
    gallery.forEach((img, index) => {
      const cat = img.category || "Uncategorized";
      (groups[cat] ||= []).push({ ...img, _index: index });
    });
    return Object.entries(groups).sort((a, b) => {
      if (a[0] === "Uncategorized") return -1;
      if (b[0] === "Uncategorized") return 1;
      return a[0].localeCompare(b[0]);
    });
  }, [gallery]);

  const buildPayload = () => ({
    name: form.name,
    destination: form.destination,
    stars: parseInt(form.stars, 10) || 0,
    description: form.description,
    short_description: form.short_description,
    address: form.address || null,
    contact_phone: form.contact_phone || null,
    contact_email: form.contact_email || null,
    website: form.website || null,
    check_in_time: form.check_in_time || null,
    check_out_time: form.check_out_time || null,
    main_image: form.main_image,
    logo: form.logo || null,
    rating: parseFloat(form.rating) || 0,
    review_count: parseInt(form.review_count, 10) || 0,
    amenities: linesToArray(form.amenities),
    is_featured: form.is_featured ? 1 : 0,
    is_active: form.is_active ? 1 : 0,
    images: gallery.map((img, index) => ({ ...img, sort_order: index })),
    room_types: rooms
      .filter((r) => r.name.trim())
      .map((r, index) => ({
        name: r.name.trim(),
        description: r.description.trim() || null,
        max_guests: parseInt(r.max_guests, 10) || 2,
        bed_type: r.bed_type || null,
        room_size: parseFloat(r.room_size) || null,
        amenities: csvToArray(r.amenities),
        sort_order: index,
      })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const [key, label] of [
      ["name", t("hotels.col.name")],
      ["destination", t("hotels.col.destination")],
      ["description", t("common.fullDescription")],
    ]) {
      if (!form[key] || !String(form[key]).trim()) {
        setTab("basic");
        setError(t("common.fillField", { field: label }));
        return;
      }
    }
    setSaving(true);
    setError("");
    try {
      const payload = buildPayload();
      if (isEdit) await hotelsService.updateHotel(hotel.id, payload);
      else await hotelsService.createHotel(payload);
      onSaved(isEdit ? t("hotels.updatedSuccess") : t("hotels.createdSuccess"));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const catSelectClass =
    "px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-xl shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEdit ? t("hotels.edit") : t("hotels.add")}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEdit
                ? t("hotels.editSubtitle")
                : t("hotels.addSubtitle")}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t("common.close")}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-danger-50 hover:text-danger-600 transition text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap px-6 bg-gray-50 border-b border-gray-100 gap-1">
          {TABS.map((tabItem) => (
            <button
              key={tabItem.key}
              type="button"
              onClick={() => setTab(tabItem.key)}
              className={`shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition ${
                tab === tabItem.key
                  ? "text-brand-700 border-brand-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              {t(tabItem.labelKey)}
            </button>
          ))}
        </div>

        <form id="hotelForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Basic */}
          {tab === "basic" && (
            <div>
              <SectionCard title={t("hotels.identity")}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label={t("hotels.col.name")} required>
                    <input
                      className={inputClass}
                      value={form.name}
                      onChange={set("name")}
                      placeholder={t("hotels.namePlaceholder")}
                    />
                  </Field>
                  <Field label={t("hotels.col.destination")} required>
                    <input
                      className={inputClass}
                      value={form.destination}
                      onChange={set("destination")}
                      list="hotel-destinations"
                      placeholder={t("hotels.destinationPlaceholder")}
                    />
                    <datalist id="hotel-destinations">
                      {(destinations || []).map((d) => (
                        <option key={d} value={d} />
                      ))}
                    </datalist>
                  </Field>
                </div>
                <Field label={t("hotels.col.stars")}>
                  <select className={inputClass} value={form.stars} onChange={set("stars")}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} Star{n === 1 ? "" : "s"}
                      </option>
                    ))}
                  </select>
                </Field>
              </SectionCard>

              <SectionCard title={t("common.description")}>
                <div className="mb-4">
                  <Field label={t("common.shortDescription")} hint={t("common.shownOnCards")}>
                    <input
                      className={inputClass}
                      value={form.short_description}
                      onChange={set("short_description")}
                      maxLength={160}
                      placeholder={t("common.taglinePlaceholder")}
                    />
                  </Field>
                </div>
                <Field label={t("common.fullDescription")} required>
                  <textarea
                    rows={5}
                    className={`${inputClass} resize-y`}
                    value={form.description}
                    onChange={set("description")}
                    placeholder={t("hotels.descriptionPlaceholder")}
                  />
                </Field>
              </SectionCard>

              <SectionCard title={t("common.contactLocation")}>
                <div className="mb-4">
                  <Field label={t("suppliers.address")}>
                    <input
                      className={inputClass}
                      value={form.address}
                      onChange={set("address")}
                      placeholder={t("common.addressPlaceholder")}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label={t("common.contactPhone")}>
                    <input
                      className={inputClass}
                      value={form.contact_phone}
                      onChange={set("contact_phone")}
                      placeholder="+66..."
                    />
                  </Field>
                  <Field label={t("common.contactEmail")}>
                    <input
                      type="email"
                      className={inputClass}
                      value={form.contact_email}
                      onChange={set("contact_email")}
                      placeholder="reservations@hotel.com"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label={t("common.website")}>
                    <input
                      className={inputClass}
                      value={form.website}
                      onChange={set("website")}
                      placeholder="https://..."
                    />
                  </Field>
                  <div />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t("hotels.checkInTime")}>
                    <input
                      className={inputClass}
                      value={form.check_in_time}
                      onChange={set("check_in_time")}
                      placeholder="14:00"
                    />
                  </Field>
                  <Field label={t("hotels.checkOutTime")}>
                    <input
                      className={inputClass}
                      value={form.check_out_time}
                      onChange={set("check_out_time")}
                      placeholder="12:00"
                    />
                  </Field>
                </div>
              </SectionCard>
            </div>
          )}

          {/* Media */}
          {tab === "media" && (
            <div>
              {/* Logo and cover sit side by side so the whole media tab fits
                  without much scrolling. */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SectionCard title={t("common.logo")} right="brand mark">
                  {form.logo ? (
                    <div className="relative inline-block">
                      <img
                        src={form.logo}
                        alt={t("hotels.logoAlt")}
                        className="h-[140px] w-auto max-w-full object-contain rounded-lg border border-gray-200 bg-white p-2"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, logo: "" }))}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-danger-600 text-white text-lg leading-none"
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition min-h-[140px] flex flex-col items-center justify-center">
                      <p className="text-sm font-medium text-gray-600">
                        {logoUploading ? t("common.uploading") : t("common.clickUploadLogo")}
                      </p>
                      <small className="text-xs text-gray-400 mt-1">
                        {t("common.logoHint")}
                      </small>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => onLogo(e.target.files)}
                      />
                    </label>
                  )}
                </SectionCard>

                <div className="sm:col-span-2">
                  <SectionCard title={t("common.coverImage")}>
                    {form.main_image ? (
                      <div className="relative inline-block">
                        <img
                          src={form.main_image}
                          alt={t("hotels.coverAlt")}
                          className="h-[140px] w-auto max-w-full object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, main_image: "" }))}
                          className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-danger-600 text-white text-lg leading-none"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition min-h-[140px] flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-gray-600">
                          {mainUploading ? t("common.uploading") : t("common.clickUploadCover")}
                        </p>
                        <small className="text-xs text-gray-400 mt-1">
                          {t("common.imageFormatHint")}
                        </small>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => onMainImage(e.target.files)}
                        />
                      </label>
                    )}
                  </SectionCard>
                </div>
              </div>

              <SectionCard title={t("common.galleryImages")} right={t("common.imageCount", { count: gallery.length })}>
                {/* Upload row with category */}
                <div className="flex flex-wrap items-end gap-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t("common.category")}
                    </label>
                    <select
                      className={catSelectClass}
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                    >
                      <option value="Uncategorized">{t("common.uncategorized")}</option>
                      <optgroup label={t("common.general")}>
                        {categoryOptions.presets.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </optgroup>
                      {categoryOptions.rooms.length > 0 && (
                        <optgroup label={t("hotels.roomTypesCategory")}>
                          {categoryOptions.rooms.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {categoryOptions.custom.length > 0 && (
                        <optgroup label={t("common.custom")}>
                          {categoryOptions.custom.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <option value="__custom__">{t("common.newCategory")}</option>
                    </select>
                  </div>
                  {uploadCategory === "__custom__" && (
                    <input
                      className={catSelectClass}
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder={t("common.newCategoryPlaceholder")}
                    />
                  )}
                  <label className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium cursor-pointer hover:bg-brand-700 transition">
                    {galleryUploading ? t("common.uploading") : t("common.uploadImages")}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={(e) => onGalleryImages(e.target.files)}
                    />
                  </label>
                </div>

                {/* Bulk bar */}
                {selected.size > 0 && (
                  <div className="flex flex-wrap items-center gap-3 mb-4 rounded-lg bg-brand-50 border border-brand-200 px-4 py-2.5">
                    <span className="text-sm font-medium text-brand-700">
                      {t("common.selectedCount", { count: selected.size })}
                    </span>
                    <select
                      className={`${catSelectClass} !py-1.5 !text-xs`}
                      defaultValue=""
                      onChange={(e) => {
                        applyCategory(
                          e.target.value === "__custom__"
                            ? (window.prompt(t("common.newCategoryPlaceholder")) || "").trim()
                            : e.target.value
                        );
                        e.target.value = "";
                      }}
                    >
                      <option value="" disabled>
                        Apply category…
                      </option>
                      <option value="Uncategorized">{t("common.uncategorized")}</option>
                      {categoryOptions.presets.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      {categoryOptions.rooms.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="__custom__">{t("common.newCategory")}</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setSelected(new Set())}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      {t("common.deselect")}
                    </button>
                    <button
                      type="button"
                      onClick={deleteSelected}
                      className="ml-auto px-3 py-1.5 text-xs font-medium text-danger-700 border border-danger-200 rounded-lg hover:bg-danger-50"
                    >
                      {t("common.deleteSelected")}
                    </button>
                  </div>
                )}

                {/* Grouped gallery */}
                {gallery.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">
                    {t("common.emptyGallery")}
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {grouped.map(([category, images]) => (
                      <div
                        key={category}
                        className={`border rounded-lg overflow-hidden ${
                          category === "Uncategorized"
                            ? "border-warning-200"
                            : "border-gray-100"
                        }`}
                      >
                        <div
                          className={`px-4 py-2.5 flex items-center justify-between ${
                            category === "Uncategorized" ? "bg-warning-50" : "bg-gray-50"
                          }`}
                        >
                          <span
                            className={`text-sm font-medium ${
                              category === "Uncategorized"
                                ? "text-warning-700"
                                : "text-gray-900"
                            }`}
                          >
                            {category}
                          </span>
                          <span className="text-xs text-gray-400">
                            {images.length} photo{images.length === 1 ? "" : "s"}
                          </span>
                        </div>
                        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {images.map((img) => (
                            <div
                              key={img._index}
                              draggable
                              onDragStart={() => (dragIndex.current = img._index)}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => onGalleryDrop(img._index)}
                              onClick={() => toggleSelect(img._index)}
                              className={`relative rounded-lg overflow-hidden border-2 cursor-pointer ${
                                selected.has(img._index)
                                  ? "border-brand-600"
                                  : "border-transparent"
                              }`}
                            >
                              <img
                                src={img.image_url}
                                alt={img.caption || category}
                                className="w-full h-24 object-cover pointer-events-none"
                              />
                              <input
                                type="checkbox"
                                checked={selected.has(img._index)}
                                readOnly
                                className="absolute top-1.5 left-1.5 w-4 h-4 pointer-events-none"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(img._index);
                                }}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white text-xs"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* Rooms */}
          {tab === "rooms" && (
            <SectionCard
              title={t("hotels.roomTypes")}
              right={`${rooms.length} room type${rooms.length === 1 ? "" : "s"}`}
            >
              <div className="flex flex-col gap-3">
                {rooms.map((room, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {t("hotels.roomTypeNumber", { number: i + 1 })}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRoom(i)}
                        className="text-sm text-danger-600 hover:underline"
                      >
                        {t("common.remove")}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <Field label={t("hotels.roomName")} required>
                        <input
                          className={inputClass}
                          value={room.name}
                          onChange={(e) => updateRoom(i, "name", e.target.value)}
                          placeholder={t("hotels.rateRoomPlaceholder")}
                        />
                      </Field>
                      <Field label={t("hotels.bedType")}>
                        <select
                          className={inputClass}
                          value={room.bed_type}
                          onChange={(e) => updateRoom(i, "bed_type", e.target.value)}
                        >
                          <option value="">{t("common.select")}</option>
                          {BED_TYPES.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <Field label={t("hotels.maxGuestsLabel")}>
                        <input
                          type="number"
                          min="1"
                          className={inputClass}
                          value={room.max_guests}
                          onChange={(e) => updateRoom(i, "max_guests", e.target.value)}
                        />
                      </Field>
                      <Field label={t("hotels.roomSize")}>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          className={inputClass}
                          value={room.room_size}
                          onChange={(e) => updateRoom(i, "room_size", e.target.value)}
                          placeholder="32"
                        />
                      </Field>
                    </div>
                    <div className="mb-3">
                      <Field label={t("common.description")}>
                        <textarea
                          rows={2}
                          className={`${inputClass} resize-y`}
                          value={room.description}
                          onChange={(e) => updateRoom(i, "description", e.target.value)}
                          placeholder={t("hotels.roomDescriptionPlaceholder")}
                        />
                      </Field>
                    </div>
                    <Field label={t("hotels.amenities")} hint={t("restaurants.commaSeparated")}>
                      <input
                        className={inputClass}
                        value={room.amenities}
                        onChange={(e) => updateRoom(i, "amenities", e.target.value)}
                        placeholder={t("hotels.roomAmenitiesPlaceholder")}
                      />
                    </Field>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addRoom}
                className="mt-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-brand-500 hover:text-brand-600 transition"
              >
                  {t("hotels.addRoomType")}
              </button>
            </SectionCard>
          )}

          {/* Settings */}
          {tab === "settings" && (
            <div>
              <SectionCard title={t("common.ratings")}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t("common.ratings")}>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      className={inputClass}
                      value={form.rating}
                      onChange={set("rating")}
                    />
                  </Field>
                  <Field label={t("common.ratings")}>
                    <input
                      type="number"
                      min="0"
                      className={inputClass}
                      value={form.review_count}
                      onChange={set("review_count")}
                    />
                  </Field>
                </div>
              </SectionCard>
              <SectionCard title={t("hotels.amenities")}>
                <Field label={t("hotels.amenities")}>
                  <textarea
                    rows={5}
                    className={`${inputClass} resize-y`}
                    value={form.amenities}
                    onChange={set("amenities")}
                    placeholder={"Free WiFi\nSwimming Pool\nSpa\nFitness Center"}
                  />
                </Field>
              </SectionCard>
              <SectionCard title={t("common.visibility")}>
                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={set("is_featured")}
                    className="w-4 h-4 accent-brand-600"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{t("hotels.featured")}</span>
                    <p className="text-xs text-gray-400">{t("hotels.featuredHint")}</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={set("is_active")}
                    className="w-4 h-4 accent-brand-600"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{t("common.active")}</span>
                    <p className="text-xs text-gray-400">{t("common.visibleToUsers")}</p>
                  </div>
                </label>
              </SectionCard>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="text-sm text-danger-600">{error}</div>
          <div className="flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              form="hotelForm"
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? t("common.saving") : t("hotels.saveHotel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelFormModal;
