import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { hotelsService } from "../../services/api-service";

const HotelList = () => {
  const { province } = useParams();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

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

  const handleSync = async () => {
    if (syncing) return;
    try {
      setSyncing(true);
      const res = await hotelsService.syncHotels();
      alert(
        `Sync complete\nNew: ${res.inserted}  Updated: ${res.updated}  Total: ${res.total}`
      );
      await loadHotels();
    } catch (err) {
      alert("Sync failed: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

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
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                📍 {province}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Synced from indosmilesouthservices.com — {hotels.length} hotels
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {syncing ? "Syncing…" : "⟳ Sync hotels"}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or destination…"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Body */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-12 text-center text-gray-500">
          Loading hotels…
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-12 text-center space-y-3">
          <div className="text-4xl">🏨</div>
          <p className="text-gray-500">
            {hotels.length === 0
              ? "No hotels yet. Click “Sync hotels” to pull them from the source."
              : "No hotels match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((h) => (
            <Link
              key={h.id}
              to={`/hotel/view/${encodeURIComponent(h.slug)}`}
              className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden flex flex-col hover:shadow-md hover:ring-blue-200 transition"
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
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🏨
                  </div>
                )}
                {!!h.is_featured && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-amber-900">
                    Featured
                  </span>
                )}
                {!h.is_active && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-700 text-white">
                    Inactive
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col gap-1 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 leading-snug">
                    {h.name}
                  </h3>
                  {h.stars ? (
                    <span className="text-amber-500 text-sm whitespace-nowrap">
                      {"★".repeat(h.stars)}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-gray-500">{h.destination}</p>
                {h.rating ? (
                  <p className="text-sm text-gray-600 mt-1">
                    ⭐ {h.rating}{" "}
                    <span className="text-gray-400">
                      ({h.review_count} reviews)
                    </span>
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelList;
