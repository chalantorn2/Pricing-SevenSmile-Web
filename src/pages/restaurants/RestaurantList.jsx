import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
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

const VIEW_KEY = "restaurantsViewMode";

const RestaurantList = () => {
  const { province } = useParams();

  // "card" | "list" | "compact" — remembered so the choice survives navigation and reloads
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem(VIEW_KEY) || "compact"
  );
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  // null = closed, {} = create, restaurant object = edit
  const [editing, setEditing] = useState(null);

  const loadRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = { limit: 500, sort_by: "name", sort_order: "asc" };
      if (province) filters.province = province;
      const res = await restaurantsService.getAllRestaurants(filters);
      setRestaurants(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [province]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, viewMode);
  }, [viewMode]);

  const handleDelete = async (restaurant) => {
    if (!window.confirm(`Delete "${restaurant.name}"?`)) return;
    try {
      await restaurantsService.deleteRestaurant(restaurant.id);
      await loadRestaurants();
    } catch (err) {
      alert(err.message);
    }
  };

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
            <h1 className="text-2xl font-semibold text-gray-900">Restaurants</h1>
            {province && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-brand-100 text-brand-700">
                <MapPin size={14} /> {province}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {restaurants.length} restaurants — manage restaurant information and menus
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 rounded-lg bg-gray-100">
            {[
              { id: "card", label: "Card view", Icon: LayoutGrid },
              { id: "list", label: "List view", Icon: List },
              { id: "compact", label: "Compact view", Icon: Rows3 },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setViewMode(v.id)}
                title={v.label}
                aria-label={v.label}
                aria-pressed={viewMode === v.id}
                className={`p-2 rounded-md transition ${
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
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700"
          >
            <Plus size={16} /> Add restaurant
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, destination or cuisine…"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Body */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-12 text-center text-gray-500">
          Loading restaurants…
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
              ? "No restaurants yet. Click “Add restaurant” to create one."
              : "No restaurants match your search."}
          </p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <Link
              key={r.id}
              to={`/restaurant/view/${encodeURIComponent(r.slug)}`}
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
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-warning-600 text-warning-800">
                      Featured
                    </span>
                  )}
                  {!r.is_active && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-700 text-white">
                      Inactive
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
                  <h3 className="font-semibold text-gray-900 leading-snug">
                    {r.name}
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
                      <span className="text-gray-400">({r.review_count} reviews)</span>
                    </span>
                  ) : null}
                  {r.seating_capacity ? (
                    <span className="flex items-center gap-1">
                      <Users size={14} className="text-gray-400" />
                      {r.seating_capacity} pax
                    </span>
                  ) : null}
                </div>
                {menuCount(r) > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {menuCount(r)} menu{menuCount(r) === 1 ? "" : "s"}
                  </p>
                )}

                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setEditing(r);
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(r);
                    }}
                    className="px-3 py-1 text-xs font-medium text-danger-600 border border-danger-200 rounded-lg hover:bg-danger-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : viewMode === "list" ? (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 divide-y divide-gray-100 overflow-hidden">
          {filtered.map((r) => (
            <Link
              key={r.id}
              to={`/restaurant/view/${encodeURIComponent(r.slug)}`}
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
                  <h3 className="font-semibold text-gray-900 leading-snug truncate">
                    {r.name}
                  </h3>
                  {r.cuisine && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                      {r.cuisine}
                    </span>
                  )}
                  {!!r.is_featured && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-warning-600 text-warning-800">
                      Featured
                    </span>
                  )}
                  {!r.is_active && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-700 text-white">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500 mt-0.5">
                  {r.destination && <span className="truncate">{r.destination}</span>}
                  {r.seating_capacity ? (
                    <span className="flex items-center gap-1">
                      <Users size={14} className="text-gray-400" />
                      {r.seating_capacity} pax
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
                  className="px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(r);
                  }}
                  className="px-3 py-1 text-xs font-medium text-danger-600 border border-danger-200 rounded-lg hover:bg-danger-50"
                >
                  Delete
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium w-12">#</th>
                <th className="px-4 py-2 text-left font-medium">Restaurant</th>
                <th className="px-4 py-2 text-left font-medium">Destination</th>
                <th className="px-4 py-2 text-left font-medium w-40">Cuisine</th>
                <th className="px-4 py-2 text-left font-medium w-24">Menus</th>
                <th className="px-4 py-2 text-right font-medium w-48">Actions</th>
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
                        Inactive
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
                        className="px-3 py-1 text-xs font-medium text-brand-700 border border-brand-200 rounded-lg hover:bg-brand-50"
                      >
                        Rates
                      </Link>
                      <button
                        onClick={() => setEditing(r)}
                        className="px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r)}
                        className="px-3 py-1 text-xs font-medium text-danger-600 border border-danger-200 rounded-lg hover:bg-danger-50"
                      >
                        Delete
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
    </div>
  );
};

export default RestaurantList;
