import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  LayoutGrid,
  List,
  MapPin,
  Plus,
  Rows3,
  Star,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { restaurantsService } from "../../services/api-service";
import RestaurantFormModal from "../../components/restaurants/RestaurantFormModal";
import { ConfirmDialog, Toast } from "../../components/core";
import { useI18n } from "../../i18n";
import { hasCache, readCache, writeCache } from "../../utils";

const VIEW_KEY = "restaurantsViewMode";

const RestaurantList = () => {
  const { t } = useI18n();
  const { province } = useParams();
  // Quick search on the home screen lands here with ?q= — seed the filter from it.
  const [searchParams] = useSearchParams();

  // "card" | "list" | "compact" — remembered so the choice survives navigation and reloads
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem(VIEW_KEY) || "compact"
  );
  // One entry per province slice, so /restaurant and /restaurant/Krabi keep their own rows.
  const cacheKey = `restaurants:${province || "all"}`;
  const [restaurants, setRestaurants] = useState(() => readCache(cacheKey) || []);
  const [loading, setLoading] = useState(() => !hasCache(cacheKey));
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [error, setError] = useState(null);
  // null = closed, {} = create, restaurant object = edit
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const loadRestaurants = useCallback(async () => {
    try {
      if (!hasCache(cacheKey)) setLoading(true);
      setError(null);
      const filters = { limit: 500, sort_by: "name", sort_order: "asc" };
      if (province) filters.province = province;
      const res = await restaurantsService.getAllRestaurants(filters);
      setRestaurants(writeCache(cacheKey, res.data || []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [province, cacheKey]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const keepMobileReadable = () => {
      if (media.matches && viewMode === "compact") setViewMode("list");
    };
    keepMobileReadable();
    media.addEventListener("change", keepMobileReadable);
    return () => media.removeEventListener("change", keepMobileReadable);
  }, [viewMode]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await restaurantsService.deleteRestaurant(deleteTarget.id);
      setDeleteTarget(null);
      setToast({ type: "success", message: t("restaurants.deleteSuccess") });
      await loadRestaurants();
    } catch (err) {
      setToast({ type: "error", message: err.message || t("common.deleteError") });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Suggestions for the form's datalists
  const destinations = useMemo(
    () =>
      [...new Set(restaurants.map((r) => r.destination).filter(Boolean))].sort(),
    [restaurants]
  );
  const cuisines = useMemo(
    () => [...new Set(restaurants.map((r) => r.cuisine).filter(Boolean))].sort(),
    [restaurants]
  );

  const term = searchTerm.trim().toLowerCase();
  const filtered = term
    ? restaurants.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(term) ||
          (r.destination || "").toLowerCase().includes(term) ||
          (r.cuisine || "").toLowerCase().includes(term)
      )
    : restaurants;

  const menuCount = (r) => (Array.isArray(r.menu_types) ? r.menu_types.length : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-gray-900">{t("restaurants.title")}</h1>
            {province && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-brand-100 text-brand-700">
                <MapPin size={14} /> {province}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {t("restaurants.count", { count: restaurants.length })} · {t("restaurants.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-lg bg-gray-100">
            {[
              { id: "card", label: t("common.view.card"), Icon: LayoutGrid },
              { id: "list", label: t("common.view.list"), Icon: List },
              { id: "compact", label: t("common.view.compact"), Icon: Rows3 },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setViewMode(v.id)}
                title={v.label}
                aria-label={v.label}
                aria-pressed={viewMode === v.id}
                className={`${v.id === "compact" ? "hidden md:flex" : "flex"} min-h-11 min-w-11 items-center justify-center rounded-md transition ${
                  viewMode === v.id
                    ? "bg-white text-brand-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <v.Icon size={18} />
              </button>
            ))}
          </div>
          <button
            onClick={() => setEditing({})}
            className="btn-primary"
          >
            <Plus size={16} /> {t("restaurants.add")}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("restaurants.searchPlaceholder")}
          aria-label={t("restaurants.searchPlaceholder")}
          className="input"
        />
      </div>

      {/* Body */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-12 text-center text-gray-500">
          {t("restaurants.loading")}
        </div>
      ) : error ? (
        <div className="bg-danger-50 border border-danger-200 rounded-xl p-6 text-center text-danger-700">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-12 text-center space-y-3">
          <UtensilsCrossed size={40} className="mx-auto text-gray-300" />
          <p className="text-gray-500">
            {restaurants.length === 0
              ? t("restaurants.empty")
              : t("restaurants.noResults")}
          </p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden flex flex-col hover:shadow-md hover:ring-brand-200 transition"
            >
              <div className="h-40 bg-gray-100 relative">
                {r.main_image ? (
                  <img
                    src={r.main_image}
                    alt={r.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <UtensilsCrossed size={40} />
                  </div>
                )}
                {/* Status badges share the left corner so the logo owns the right one. */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {!!r.is_featured && (
                    <span className="badge-warning">
                      {t("common.featured")}
                    </span>
                  )}
                  {!r.is_active && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-700 text-white">
                      {t("common.inactive")}
                    </span>
                  )}
                </div>
                {r.logo && (
                  <img
                    src={r.logo}
                    alt=""
                    className="absolute top-2 right-2 h-14 max-w-[120px] object-contain rounded-lg bg-white/90 ring-1 ring-black/5 p-1.5"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="p-4 flex flex-col gap-1 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-snug">
                    <Link to={`/restaurant/view/${encodeURIComponent(r.slug)}`} className="text-gray-900 hover:text-brand-700">
                      {r.name}
                    </Link>
                  </h3>
                  {r.cuisine && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                      {r.cuisine}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{r.destination}</p>
                <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500 mt-1">
                  {r.rating ? (
                    <span className="flex items-center gap-1">
                      <Star
                        size={14}
                        className="text-warning-600"
                        fill="currentColor"
                        strokeWidth={0}
                      />
                      {r.rating}{" "}
                      <span className="text-gray-400">{t("restaurants.reviews", { count: r.review_count })}</span>
                    </span>
                  ) : null}
                  {r.seating_capacity ? (
                    <span className="flex items-center gap-1">
                      <Users size={14} className="text-gray-400" />
                      {t("restaurants.capacity", { count: r.seating_capacity })}
                    </span>
                  ) : null}
                </div>
                {menuCount(r) > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {t("restaurants.menuCount", { count: menuCount(r) })}
                  </p>
                )}

                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setEditing(r);
                    }}
                    className="btn-secondary btn-sm min-h-10"
                  >
                    {t("common.edit")}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteTarget(r);
                    }}
                    className="btn-ghost btn-sm min-h-10 text-danger-600 hover:bg-danger-50 hover:text-danger-700"
                  >
                    {t("common.delete")}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : viewMode === "list" ? (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 divide-y divide-gray-100 overflow-hidden">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="flex items-center gap-4 p-3 sm:p-4 hover:bg-gray-50 transition"
            >
              <div className="h-16 w-24 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                {r.main_image ? (
                  <img
                    src={r.main_image}
                    alt={r.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <UtensilsCrossed size={22} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold leading-snug truncate">
                    <Link to={`/restaurant/view/${encodeURIComponent(r.slug)}`} className="text-gray-900 hover:text-brand-700">
                      {r.name}
                    </Link>
                  </h3>
                  {r.cuisine && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                      {r.cuisine}
                    </span>
                  )}
                  {!!r.is_featured && (
                    <span className="badge-warning">
                      {t("common.featured")}
                    </span>
                  )}
                  {!r.is_active && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-700 text-white">
                      {t("common.inactive")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500 mt-0.5">
                  {r.destination && <span className="truncate">{r.destination}</span>}
                  {r.seating_capacity ? (
                    <span className="flex items-center gap-1">
                      <Users size={14} className="text-gray-400" />
                      {t("restaurants.capacity", { count: r.seating_capacity })}
                    </span>
                  ) : null}
                </div>
              </div>

              {r.logo && (
                <img
                  src={r.logo}
                  alt=""
                  className="hidden md:block h-10 max-w-[100px] object-contain shrink-0"
                  loading="lazy"
                />
              )}

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setEditing(r);
                  }}
                  className="btn-secondary btn-sm min-h-10"
                >
                  {t("common.edit")}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setDeleteTarget(r);
                  }}
                  className="btn-ghost btn-sm min-h-10 text-danger-600 hover:bg-danger-50 hover:text-danger-700"
                >
                  {t("common.delete")}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium w-12">#</th>
                <th className="px-4 py-2 text-left font-medium">{t("restaurants.col.name")}</th>
                <th className="px-4 py-2 text-left font-medium">{t("restaurants.col.destination")}</th>
                <th className="px-4 py-2 text-left font-medium w-40">{t("restaurants.col.cuisine")}</th>
                <th className="px-4 py-2 text-left font-medium w-24">{t("restaurants.col.menus")}</th>
                <th className="px-4 py-2 text-right font-medium w-48">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-400 tabular-nums">{i + 1}</td>
                  <td className="px-4 py-2">
                    <Link
                      to={`/restaurant/view/${encodeURIComponent(r.slug)}`}
                      className="font-medium text-gray-900 hover:text-brand-700"
                    >
                      {r.name}
                    </Link>
                    {!r.is_active && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-700 text-white">
                      {t("common.inactive")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-500">{r.destination || "—"}</td>
                  <td className="px-4 py-2 text-gray-500">{r.cuisine || "—"}</td>
                  <td className="px-4 py-2 text-gray-500 tabular-nums">
                    {menuCount(r) || "—"}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/restaurant/rates/${encodeURIComponent(r.slug)}`}
                        className="inline-flex min-h-10 items-center rounded-lg border border-brand-200 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                      >
                        {t("restaurants.rates")}
                      </Link>
                      <button
                        onClick={() => setEditing(r)}
                        className="btn-secondary btn-sm min-h-10"
                      >
                        {t("common.edit")}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(r)}
                        className="btn-ghost btn-sm min-h-10 text-danger-600 hover:bg-danger-50 hover:text-danger-700"
                      >
                        {t("common.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <RestaurantFormModal
          restaurant={editing.id ? editing : null}
          destinations={destinations}
          cuisines={cuisines}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await loadRestaurants();
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t("restaurants.deleteTitle")}
        description={t("restaurants.deleteDescription", { name: deleteTarget?.name || "" })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default RestaurantList;
