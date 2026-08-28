import { useEffect, useMemo, useRef, useState } from "react";
import { restaurantsService } from "../../services/api-service";
import { useI18n } from "../../i18n";

const PRESET_CATEGORIES = [
  "Exterior",
  "Interior",
  "Dining Area",
  "Private Room",
  "Food",
  "Bar",
  "Kitchen",
  "View",
];
const MENU_KINDS = ["Set Menu", "Buffet", "A La Carte", "Course", "Coffee Break"];

const EMPTY = {
  name: "",
  destination: "",
  cuisine: "",
  description: "",
  short_description: "",
  address: "",
  map_url: "",
  contact_phone: "",
  contact_email: "",
  website: "",
  open_time: "",
  close_time: "",
  seating_capacity: "",
  main_image: "",
  logo: "",
  rating: 0,
  review_count: 0,
  facilities: "",
  is_featured: false,
  is_active: true,
};

const TABS = [
  { key: "basic", labelKey: "common.basicInfo" },
  { key: "media", labelKey: "common.media" },
  { key: "menus", labelKey: "restaurants.menus" },
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

function restaurantToForm(r) {
  return {
    ...EMPTY,
    name: r.name || "",
    destination: r.destination || "",
    cuisine: r.cuisine || "",
    description: r.description || "",
    short_description: r.short_description || "",
    address: r.address || "",
    map_url: r.map_url || "",
    contact_phone: r.contact_phone || "",
    contact_email: r.contact_email || "",
    website: r.website || "",
    open_time: r.open_time || "",
    close_time: r.close_time || "",
    seating_capacity: r.seating_capacity ?? "",
    main_image: r.main_image || "",
    logo: r.logo || "",
    rating: r.rating ?? 0,
    review_count: r.review_count ?? 0,
    facilities: Array.isArray(r.facilities) ? r.facilities.join("\n") : "",
    is_featured: Number(r.is_featured) === 1,
    is_active: Number(r.is_active) === 1,
  };
}

/**
 * Create/edit a restaurant by hand. Built on the same shape as HotelFormModal —
 * same tabs, category-grouped gallery and repeatable builder — with the room-type
 * builder replaced by a menu builder. Menus carry no price here; prices live in
 * the (future) restaurant rate editor, the same split hotels use.
 */
const RestaurantFormModal = ({ restaurant, destinations, cuisines, onClose, onSaved }) => {
  const { t } = useI18n();
  const isEdit = Boolean(restaurant);
  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState(EMPTY);
  const [gallery, setGallery] = useState([]); // { image_url, category, caption }[]
  const [menus, setMenus] = useState([]);
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
    if (restaurant) {
      setForm(restaurantToForm(restaurant));
      setGallery(
        Array.isArray(restaurant.images)
          ? restaurant.images.map((img) => ({
              image_url: img.image_url,
              category: img.category || "Uncategorized",
              caption: img.caption || "",
            }))
          : []
      );
      setMenus(
        Array.isArray(restaurant.menu_types)
          ? restaurant.menu_types.map((m) => ({
              name: m.name || "",
              kind: m.kind || "",
              min_pax: m.min_pax ?? "",
              description: m.description || "",
              items: Array.isArray(m.items) ? m.items.join(", ") : "",
            }))
          : []
      );
    } else {
      setForm(EMPTY);
      setGallery([]);
      setMenus([]);
    }
    setSelected(new Set());
    setTab("basic");
    setError("");
  }, [restaurant]);

  const set = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  // --- category options for the gallery (presets + menu names + custom in use) ---
  const menuNames = useMemo(
    () => menus.map((m) => m.name.trim()).filter(Boolean),
    [menus]
  );
  const categoryOptions = useMemo(() => {
    const used = new Set(gallery.map((g) => g.category));
    const custom = [...used].filter(
      (c) =>
        c &&
        c !== "Uncategorized" &&
        !PRESET_CATEGORIES.includes(c) &&
        !menuNames.includes(c)
    );
    return { presets: PRESET_CATEGORIES, menus: menuNames, custom };
  }, [gallery, menuNames]);

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
      const data = await restaurantsService.uploadRestaurantImages([files[0]]);
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
      const data = await restaurantsService.uploadRestaurantImages([files[0]]);
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
      const data = await restaurantsService.uploadRestaurantImages(files);
      setGallery((g) => [
        ...g,
        ...(data.urls || []).map((url) => ({
          image_url: url,
          category,
          caption: "",
        })),
      ]);
      if (data.errors?.length)
        setError(t("common.uploadFailed", { message: data.errors.join(", ") }));
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
    setGallery((g) =>
      g.map((img, i) => (selected.has(i) ? { ...img, category } : img))
    );
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

  // --- menu builder ---
  const addMenu = () =>
    setMenus((m) => [
      ...m,
      { name: "", kind: "Set Menu", min_pax: "", description: "", items: "" },
    ]);
  const updateMenu = (i, key, value) =>
    setMenus((m) => m.map((x, idx) => (idx === i ? { ...x, [key]: value } : x)));
  const removeMenu = (i) => setMenus((m) => m.filter((_, idx) => idx !== i));

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
    cuisine: form.cuisine || null,
    description: form.description,
    short_description: form.short_description,
    address: form.address || null,
    map_url: form.map_url || null,
    contact_phone: form.contact_phone || null,
    contact_email: form.contact_email || null,
    website: form.website || null,
    open_time: form.open_time || null,
    close_time: form.close_time || null,
    seating_capacity: form.seating_capacity === "" ? null : parseInt(form.seating_capacity, 10) || null,
    main_image: form.main_image,
    logo: form.logo || null,
    rating: parseFloat(form.rating) || 0,
    review_count: parseInt(form.review_count, 10) || 0,
    facilities: linesToArray(form.facilities),
    is_featured: form.is_featured ? 1 : 0,
    is_active: form.is_active ? 1 : 0,
    images: gallery.map((img, index) => ({ ...img, sort_order: index })),
    menu_types: menus
      .filter((m) => m.name.trim())
      .map((m, index) => ({
        name: m.name.trim(),
        kind: m.kind || null,
        min_pax: parseInt(m.min_pax, 10) || null,
        description: m.description.trim() || null,
        items: csvToArray(m.items),
        sort_order: index,
      })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const [key, label] of [
      ["name", t("restaurants.col.name")],
      ["destination", t("restaurants.col.destination")],
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
      if (isEdit) await restaurantsService.updateRestaurant(restaurant.id, payload);
      else await restaurantsService.createRestaurant(payload);
      onSaved(
        isEdit ? t("restaurants.updatedSuccess") : t("restaurants.createdSuccess")
      );
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
              {isEdit ? t("restaurants.edit") : t("restaurants.add")}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEdit
                ? t("restaurants.editSubtitle")
                : t("restaurants.addSubtitle")}
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

        <form
          id="restaurantForm"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6"
        >
          {/* Basic */}
          {tab === "basic" && (
            <div>
              <SectionCard title={t("restaurants.identity")}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label={t("restaurants.col.name")} required>
                    <input
                      className={inputClass}
                      value={form.name}
                      onChange={set("name")}
                      placeholder={t("restaurants.namePlaceholder")}
                    />
                  </Field>
                  <Field label={t("restaurants.col.destination")} required>
                    <input
                      className={inputClass}
                      value={form.destination}
                      onChange={set("destination")}
                      list="restaurant-destinations"
                      placeholder={t("restaurants.destinationPlaceholder")}
                    />
                    <datalist id="restaurant-destinations">
                      {(destinations || []).map((d) => (
                        <option key={d} value={d} />
                      ))}
                    </datalist>
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t("restaurants.col.cuisine")} hint={t("restaurants.cuisineHint")}>
                    <input
                      className={inputClass}
                      value={form.cuisine}
                      onChange={set("cuisine")}
                      list="restaurant-cuisines"
                      placeholder={t("restaurants.cuisinePlaceholder")}
                    />
                    <datalist id="restaurant-cuisines">
                      {(cuisines || []).map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </Field>
                  <Field label={t("restaurants.seatingCapacity")} hint={t("restaurants.maxPaxHint")}>
                    <input
                      type="number"
                      min="0"
                      className={inputClass}
                      value={form.seating_capacity}
                      onChange={set("seating_capacity")}
                      placeholder="120"
                    />
                  </Field>
                </div>
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
                    placeholder={t("restaurants.descriptionPlaceholder")}
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
                <div className="mb-4">
                  <Field label={t("restaurants.mapLink")}>
                    <input
                      className={inputClass}
                      value={form.map_url}
                      onChange={set("map_url")}
                      placeholder="https://maps.google.com/..."
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
                      placeholder="reservations@restaurant.com"
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
                  <Field label={t("restaurants.openingTime")}>
                    <input
                      className={inputClass}
                      value={form.open_time}
                      onChange={set("open_time")}
                      placeholder="10:00"
                    />
                  </Field>
                  <Field label={t("restaurants.closingTime")}>
                    <input
                      className={inputClass}
                      value={form.close_time}
                      onChange={set("close_time")}
                      placeholder="22:00"
                    />
                  </Field>
                </div>
              </SectionCard>
            </div>
          )}

          {/* Media */}
          {tab === "media" && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SectionCard title={t("common.logo")} right="brand mark">
                  {form.logo ? (
                    <div className="relative inline-block">
                      <img
                        src={form.logo}
                        alt={t("common.logo")}
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
                        PNG with transparent background works best
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
                          alt={t("common.coverImage")}
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
                          JPEG, PNG, WebP (max 10MB)
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
                      {categoryOptions.menus.length > 0 && (
                        <optgroup label={t("restaurants.menus")}>
                          {categoryOptions.menus.map((c) => (
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
                      {categoryOptions.menus.map((c) => (
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

          {/* Menus */}
          {tab === "menus" && (
            <SectionCard
              title={t("restaurants.menus")}
              right={`${menus.length} menu${menus.length === 1 ? "" : "s"}`}
            >
              <p className="text-xs text-gray-400 mb-3">
                {t("restaurants.menuSetupHint")}
              </p>
              <div className="flex flex-col gap-3">
                {menus.map((menu, i) => (
                  <div key={i} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {t("restaurants.menuNumber", { number: i + 1 })}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMenu(i)}
                        className="text-sm text-danger-600 hover:underline"
                      >
                        {t("common.remove")}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <Field label={t("restaurants.menuName")} required>
                        <input
                          className={inputClass}
                          value={menu.name}
                          onChange={(e) => updateMenu(i, "name", e.target.value)}
                          placeholder={t("restaurants.rateMenuPlaceholder")}
                        />
                      </Field>
                      <Field label={t("restaurants.menuType")}>
                        <select
                          className={inputClass}
                          value={menu.kind}
                          onChange={(e) => updateMenu(i, "kind", e.target.value)}
                        >
                          <option value="">{t("common.select")}</option>
                          {MENU_KINDS.map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <Field label={t("restaurants.minPax")}>
                        <input
                          type="number"
                          min="1"
                          className={inputClass}
                          value={menu.min_pax}
                          onChange={(e) => updateMenu(i, "min_pax", e.target.value)}
                          placeholder="10"
                        />
                      </Field>
                      <div />
                    </div>
                    <div className="mb-3">
                      <Field label={t("common.description")}>
                        <textarea
                          rows={2}
                          className={`${inputClass} resize-y`}
                          value={menu.description}
                          onChange={(e) => updateMenu(i, "description", e.target.value)}
                          placeholder={t("restaurants.menuDescriptionPlaceholder")}
                        />
                      </Field>
                    </div>
                    <Field label={t("restaurants.dishes")} hint={t("restaurants.commaSeparated")}>
                      <input
                        className={inputClass}
                        value={menu.items}
                        onChange={(e) => updateMenu(i, "items", e.target.value)}
                        placeholder={t("restaurants.dishesPlaceholder")}
                      />
                    </Field>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addMenu}
                className="mt-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-brand-500 hover:text-brand-600 transition"
              >
                  {t("restaurants.addMenu")}
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
              <SectionCard title={t("restaurants.facilities")}>
                <Field label={t("restaurants.facilities")}>
                  <textarea
                    rows={5}
                    className={`${inputClass} resize-y`}
                    value={form.facilities}
                    onChange={set("facilities")}
                    placeholder={
                      "Air Conditioning\nPrivate Room\nParking\nSea View\nHalal Kitchen"
                    }
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
                    <span className="text-sm font-medium text-gray-700">
                      {t("restaurants.featured")}
                    </span>
                    <p className="text-xs text-gray-400">
                      {t("restaurants.featuredHint")}
                    </p>
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
              form="restaurantForm"
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? t("common.saving") : t("restaurants.saveRestaurant")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantFormModal;
