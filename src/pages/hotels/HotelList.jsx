import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { hotelsService } from "../../services/api-service";
import HotelFormModal from "../../components/hotels/HotelFormModal";

const HotelList = () => {
  const { province } = useParams();

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
                📍 {province}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {hotels.length} hotels — this site is the master record;
            indosmilesouthservices.com pulls from here
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing({})}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700"
          >
            + Add hotel
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
          <div className="text-4xl">🏨</div>
          <p className="text-gray-500">
            {hotels.length === 0
              ? "No hotels yet. Click “Add hotel” to create one."
              : "No hotels match your search."}
          </p>
        </div>
      ) : (
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
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🏨
                  </div>
                )}
                {!!h.is_featured && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-warning-600 text-warning-800">
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
                    <span className="text-warning-600 text-sm whitespace-nowrap">
                      {"★".repeat(h.stars)}
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-gray-500">{h.destination}</p>
                {h.rating ? (
                  <p className="text-sm text-gray-500 mt-1">
                    ⭐ {h.rating}{" "}
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
