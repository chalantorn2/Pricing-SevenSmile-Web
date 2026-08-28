import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Hotel, LayoutGrid, List, MapPin, Plus, Rows3, Star } from "lucide-react";
import { hotelsService } from "../../services/api-service";
import HotelFormModal from "../../components/hotels/HotelFormModal";

const VIEW_KEY = "hotelsViewMode";

const HotelList = () => {
  const { province } = useParams();

  // "card" | "list" | "compact" — remembered so the choice survives navigation and reloads
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem(VIEW_KEY) || "compact"
  );
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  // null = closed, {} = create, hotel object = edit
  const [editing, setEditing] = useState(null);

  const loadHotels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = { limit: 500, sort_by: "name", sort_order: "asc" };
      if (province) filters.province = province;
      const res = await hotelsService.getAllHotels(filters);
      setHotels(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [province]);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  useEffect(() => {
    localStorage.setItem(VIEW_KEY, viewMode);
  }, [viewMode]);

  const handleDelete = async (hotel) => {
    if (!window.confirm(`Delete "${hotel.name}"? This also removes its rates and notices.`))
      return;
    try {
      await hotelsService.deleteHotel(hotel.id);
      await loadHotels();
    } catch (err) {
      alert(err.message);
    }
  };

  // Destination suggestions for the form's datalist
  const destinations = useMemo(
    () => [...new Set(hotels.map((h) => h.destination).filter(Boolean))].sort(),
    [hotels]
  );

  const term = searchTerm.trim().toLowerCase();
  const filtered = term
    ? hotels.filter(
        (h) =>
          (h.name || "").toLowerCase().includes(term) ||
          (h.destination || "").toLowerCase().includes(term)
      )
    : hotels;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-gray-900">Hotels</h1>
            {province && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-brand-100 text-brand-700">
                <MapPin size={14} /> {province}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {hotels.length} hotels — this site is the master record;
            indosmilesouthservices.com pulls from here
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
            <Plus size={16} /> Add hotel
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or destination…"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Body */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-12 text-center text-gray-500">
          Loading hotels…
        </div>
      ) : error ? (
        <div className="bg-danger-50 border border-danger-200 rounded-xl p-6 text-center text-danger-700">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-12 text-center space-y-3">
          <Hotel size={40} className="mx-auto text-gray-300" />
          <p className="text-gray-500">
            {hotels.length === 0
              ? "No hotels yet. Click “Add hotel” to create one."
              : "No hotels match your search."}
          </p>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((h) => (
            <Link
              key={h.id}
              to={`/hotel/view/${encodeURIComponent(h.slug)}`}
              className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden flex flex-col hover:shadow-md hover:ring-brand-200 transition"
            >
              <div className="h-40 bg-gray-100 relative">
                {h.main_image ? (
                  <img
                    src={h.main_image}
                    alt={h.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Hotel size={40} />
                  </div>
                )}
                {/* Status badges share the left corner so the logo owns the right one. */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {!!h.is_featured && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-warning-600 text-warning-800">
                      Featured
                    </span>
                  )}
                  {!h.is_active && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-700 text-white">
                      Inactive
                    </span>
                  )}
                </div>
                {h.logo && (
                  <img
                    src={h.logo}
                    alt=""
                    className="absolute top-2 right-2 h-14 max-w-[120px] object-contain rounded-lg bg-white/90 ring-1 ring-black/5 p-1.5"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="p-4 flex flex-col gap-1 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 leading-snug">
                    {h.name}
                  </h3>
                  {h.stars ? (
                    <span className="flex items-center gap-0.5 text-warning-600 shrink-0">
                      {Array.from({ length: h.stars }).map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
                      ))}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-gray-500">{h.destination}</p>
                {h.rating ? (
                  <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <Star size={14} className="text-warning-600" fill="currentColor" strokeWidth={0} />
                    {h.rating}{" "}
                    <span className="text-gray-400">
                      ({h.review_count} reviews)
                    </span>
                  </p>
                ) : null}

                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setEditing(h);
                    }}
                    className="px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(h);
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
          {filtered.map((h) => (
            <Link
              key={h.id}
              to={`/hotel/view/${encodeURIComponent(h.slug)}`}
              className="flex items-center gap-4 p-3 sm:p-4 hover:bg-gray-50 transition"
            >
              <div className="h-16 w-24 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                {h.main_image ? (
                  <img
                    src={h.main_image}
                    alt={h.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Hotel size={22} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 leading-snug truncate">
                    {h.name}
                  </h3>
                  {h.stars ? (
                    <span className="flex items-center gap-0.5 text-warning-600 shrink-0">
                      {Array.from({ length: h.stars }).map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
                      ))}
                    </span>
                  ) : null}
                  {!!h.is_featured && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-warning-600 text-warning-800">
                      Featured
                    </span>
                  )}
                  {!h.is_active && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-700 text-white">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500 mt-0.5">
                  {h.destination && <span className="truncate">{h.destination}</span>}
                </div>
              </div>

              {h.logo && (
                <img
                  src={h.logo}
                  alt=""
                  className="hidden md:block h-10 max-w-[100px] object-contain shrink-0"
                  loading="lazy"
                />
              )}

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setEditing(h);
                  }}
                  className="px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(h);
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
                <th className="px-4 py-2 text-left font-medium">Hotel</th>
                <th className="px-4 py-2 text-left font-medium">Destination</th>
                <th className="px-4 py-2 text-left font-medium w-28">Stars</th>
                <th className="px-4 py-2 text-right font-medium w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((h, i) => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-400 tabular-nums">{i + 1}</td>
                  <td className="px-4 py-2">
                    <Link
                      to={`/hotel/view/${encodeURIComponent(h.slug)}`}
                      className="font-medium text-gray-900 hover:text-brand-700"
                    >
                      {h.name}
                    </Link>
                    {!h.is_active && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-700 text-white">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-500">{h.destination || "—"}</td>
                  <td className="px-4 py-2">
                    {h.stars ? (
                      <span className="flex items-center gap-0.5 text-warning-600">
                        {Array.from({ length: h.stars }).map((_, s) => (
                          <Star key={s} size={12} fill="currentColor" strokeWidth={0} />
                        ))}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditing(h)}
                        className="px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(h)}
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
        <HotelFormModal
          hotel={editing.id ? editing : null}
          destinations={destinations}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await loadHotels();
          }}
        />
      )}
    </div>
  );
};

export default HotelList;
