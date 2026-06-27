import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { hotelsService } from "../../services/api-service";

const HotelDetail = () => {
  const { slug } = useParams();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await hotelsService.getHotelBySlug(slug);
        if (!alive) return;
        setHotel(data);
        setActiveImage(data?.main_image || null);
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-12 text-center text-gray-500">
        Loading hotel…
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="space-y-4">
        <Link to="/hotel" className="text-blue-600 hover:underline text-sm">
          ← Back to hotels
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
          {error || "Hotel not found"}
        </div>
      </div>
    );
  }

  const gallery = [
    hotel.main_image,
    ...(Array.isArray(hotel.images) ? hotel.images : []),
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <Link to="/hotel" className="text-blue-600 hover:underline text-sm">
        ← Back to hotels
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-gray-900">
              {hotel.name}
            </h1>
            {hotel.stars ? (
              <span className="text-amber-500">{"★".repeat(hotel.stars)}</span>
            ) : null}
            {!!hotel.is_featured && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-amber-900">
                Featured
              </span>
            )}
            {!hotel.is_active && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-700 text-white">
                Inactive
              </span>
            )}
          </div>
          <p className="text-gray-500 mt-1">{hotel.destination}</p>
        </div>
        {hotel.rating ? (
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ⭐ {hotel.rating}
            </div>
            <div className="text-sm text-gray-400">
              {hotel.review_count} reviews
            </div>
          </div>
        ) : null}
      </div>

      {/* Gallery */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="h-72 bg-gray-100 flex items-center justify-center">
          {activeImage ? (
            <img
              src={activeImage}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-6xl">🏨</span>
          )}
        </div>
        {gallery.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden ring-2 ${
                  activeImage === img ? "ring-blue-500" : "ring-transparent"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {hotel.short_description && (
            <p className="text-gray-700 font-medium">{hotel.short_description}</p>
          )}
          {hotel.description && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-5">
              <h2 className="font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                {hotel.description}
              </p>
            </div>
          )}

          {Array.isArray(hotel.amenities) && hotel.amenities.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Amenities</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {hotel.amenities.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(hotel.room_types) && hotel.room_types.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Room types</h2>
              <ul className="space-y-2">
                {hotel.room_types.map((r, i) => (
                  <li key={i} className="text-gray-600">
                    {typeof r === "string" ? r : r.name || JSON.stringify(r)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">Info</h2>
            <InfoRow label="Check-in" value={hotel.check_in_time} />
            <InfoRow label="Check-out" value={hotel.check_out_time} />
            <InfoRow label="Address" value={hotel.address} />
            <InfoRow label="Phone" value={hotel.contact_phone} />
            <InfoRow label="Email" value={hotel.contact_email} />
            {hotel.website && (
              <div>
                <div className="text-xs text-gray-400">Website</div>
                <a
                  href={hotel.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {hotel.website}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) =>
  value ? (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-gray-700">{value}</div>
    </div>
  ) : null;

export default HotelDetail;
