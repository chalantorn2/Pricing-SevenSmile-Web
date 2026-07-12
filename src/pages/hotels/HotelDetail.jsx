import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Ban, Tag, CalendarDays, Table2 } from "lucide-react";
import { hotelsService } from "../../services/api-service";
import NoticeCalendar from "../../components/hotels/NoticeCalendar";

// Detail page mirrors the indosmilesouthservices.com layout (hero, gallery by
// category, overview, amenities, room types, lightbox) adapted to this admin
// app's theme (slate/blue/amber, Prompt font) and routes.
export default function HotelDetail() {
  const { slug } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [rateView, setRateView] = useState("table"); // "table" | "calendar"
  const [copied, setCopied] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxIsGallery, setLightboxIsGallery] = useState(false);

  const fetchHotel = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await hotelsService.getHotelBySlug(slug);
      if (data) setHotel(data);
      else setError(true);
    } catch (err) {
      console.error("Error fetching hotel:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchHotel();
  }, [fetchHotel]);

  const amenities = useMemo(() => {
    if (!hotel?.amenities) return [];
    return typeof hotel.amenities === "string"
      ? JSON.parse(hotel.amenities)
      : hotel.amenities;
  }, [hotel]);

  const roomTypes = useMemo(() => {
    if (!hotel?.room_types) return [];
    return hotel.room_types.map((r) => ({
      ...r,
      amenities:
        typeof r.amenities === "string"
          ? JSON.parse(r.amenities)
          : r.amenities || [],
    }));
  }, [hotel]);

  const roomTypeNames = useMemo(
    () => new Set(roomTypes.map((r) => r.name)),
    [roomTypes]
  );

  // Net rates as a single matrix: rooms down the left, periods across the top.
  // Period labels can differ slightly between rooms, so columns are the union of
  // all labels (in first-seen order) and missing cells render as "—". Each cell
  // holds the meal-plan prices (RO/RB), or a single price when meal_plan is null.
  const rateMatrix = useMemo(() => {
    const rates = hotel?.rates || [];
    if (!rates.length) return null;
    // Hide periods that have already ended (period_end before today). Periods
    // still running (end today or later) stay even if they started last year.
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    // Compact column header derived from the dates, e.g. "1 Nov 25 – 25 Dec 25",
    // dropping the start year when both ends share it. Falls back to the raw
    // label when dates are missing.
    const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const part = (s) => {
      if (!s) return null;
      const [y, m, d] = s.slice(0, 10).split("-");
      return { d: +d, m: mon[+m - 1], y: y.slice(2) };
    };
    const shortLabel = (start, end, fallback) => {
      const a = part(start);
      const b = part(end);
      if (!b) return fallback;
      const e = `${b.d} ${b.m} ${b.y}`;
      if (!a) return `→ ${e}`;
      const s = a.y === b.y ? `${a.d} ${a.m}` : `${a.d} ${a.m} ${a.y}`;
      return `${s} – ${e}`;
    };

    const periods = [];
    const periodSet = new Set();
    const rooms = [];
    const roomMap = {};
    rates.forEach((r) => {
      if (r.period_end && r.period_end < today) return; // skip expired
      const label = r.period_label || "—";
      if (!periodSet.has(label)) {
        periodSet.add(label);
        periods.push({
          key: label,
          short: shortLabel(r.period_start, r.period_end, label),
        });
      }
      if (!roomMap[r.room_type]) {
        roomMap[r.room_type] = { name: r.room_type, cells: {} };
        rooms.push(roomMap[r.room_type]);
      }
      const meal = r.meal_plan || "_";
      const cells = roomMap[r.room_type].cells;
      if (!cells[label]) cells[label] = {};
      cells[label][meal] = { price: r.price, currency: r.currency };
    });
    if (!periods.length) return null; // all periods expired
    return { periods, rooms };
  }, [hotel]);

  // Lowest current breakfast-included price per room type, for the "from" price
  // shown on each Room Types card. Keyed by room name.
  const roomPriceFrom = useMemo(() => {
    if (!rateMatrix) return {};
    const map = {};
    rateMatrix.rooms.forEach((room) => {
      let min = Infinity;
      Object.values(room.cells).forEach((mealMap) => {
        const c = mealMap.RB || mealMap._ || mealMap.RO;
        if (c && c.price < min) min = c.price;
      });
      if (min < Infinity) map[room.name] = min;
    });
    return map;
  }, [rateMatrix]);

  // Active Stop Sale / Promotion notices (API already filters to is_active and
  // date_end >= today). Split for display.
  const stopSales = useMemo(
    () => (hotel?.notices || []).filter((n) => n.type === "stop_sale"),
    [hotel]
  );
  const promotions = useMemo(
    () => (hotel?.notices || []).filter((n) => n.type === "promotion"),
    [hotel]
  );

  // Match gallery images to room types by category == room name
  const roomImageMap = useMemo(() => {
    if (!hotel?.images) return {};
    const map = {};
    hotel.images.forEach((img) => {
      if (roomTypeNames.has(img.category)) {
        if (!map[img.category]) map[img.category] = [];
        map[img.category].push(img);
      }
    });
    return map;
  }, [hotel, roomTypeNames]);

  const galleryImages = useMemo(() => {
    if (!hotel?.images) return [];
    return hotel.images.filter((img) => !roomTypeNames.has(img.category));
  }, [hotel, roomTypeNames]);

  const galleryByCategory = useMemo(() => {
    const groups = {};
    galleryImages.forEach((img) => {
      const cat = img.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(img);
    });
    return groups;
  }, [galleryImages]);

  const galleryCategories = useMemo(
    () => Object.keys(galleryByCategory),
    [galleryByCategory]
  );

  const filteredGalleryImages = useMemo(() => {
    if (activeCategory === "all") return galleryImages;
    return galleryImages.filter((img) => img.category === activeCategory);
  }, [galleryImages, activeCategory]);

  // Lightbox
  const openGalleryLightbox = (index) => {
    setLightboxImages(filteredGalleryImages);
    setLightboxIndex(index);
    setLightboxIsGallery(true);
  };
  const openRoomLightbox = (roomName, index) => {
    setLightboxImages(roomImageMap[roomName] || []);
    setLightboxIndex(index);
    setLightboxIsGallery(false);
  };
  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    setLightboxImages([]);
    setLightboxIsGallery(false);
  }, []);
  const nextImage = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
    },
    [lightboxImages.length]
  );
  const prevImage = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setLightboxIndex(
        (prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length
      );
    },
    [lightboxImages.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") nextImage();
      else if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, nextImage, prevImage]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: hotel.name, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Loading hotel…</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="space-y-4">
        <Link to="/hotel" className="text-blue-600 hover:underline text-sm">
          ← Back to hotels
        </Link>
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-12 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Hotel not found
          </h2>
          <p className="text-gray-500">
            We couldn&apos;t load this hotel. It may have been removed.
          </p>
          <button
            onClick={fetchHotel}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="-m-4 lg:-m-6 pb-12">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/hotel" className="hover:text-blue-700">
            Hotels
          </Link>
          <span className="text-gray-300">›</span>
          <span className="text-gray-900 font-medium truncate max-w-[220px]">
            {hotel.name}
          </span>
        </nav>
      </div>

      {/* Hero */}
      <div className="relative h-[50vh] min-h-[360px] w-full overflow-hidden mt-4">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${hotel.main_image || ""})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10">
          <button
            onClick={handleShare}
            className="absolute top-6 right-6 bg-black/30 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/50 p-3 rounded-full transition"
            title="Share"
          >
            {copied ? "✓" : "🔗"}
          </button>
          {copied && (
            <span className="absolute top-6 right-20 bg-black/60 text-white text-xs px-3 py-2 rounded-full">
              Link copied!
            </span>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {hotel.destination && (
              <span className="bg-amber-400 text-slate-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {hotel.destination}
              </span>
            )}
            {hotel.stars ? (
              <div className="flex gap-1 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full">
                {Array.from({ length: parseInt(hotel.stars) || 0 }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">
                    ★
                  </span>
                ))}
              </div>
            ) : null}
            {!hotel.is_active && (
              <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Inactive
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-semibold text-white mb-3 leading-tight">
            {hotel.name}
          </h1>

          <div className="flex items-center text-white/90 gap-6 text-sm md:text-base">
            <span className="flex items-center gap-2">📍 {hotel.destination}</span>
            {parseFloat(hotel.rating) > 0 && (
              <span className="flex items-center gap-2">
                <span className="text-amber-400">★</span>
                <span className="font-semibold">{hotel.rating} / 5.0</span>
                <span className="text-white/60">
                  ({hotel.review_count} reviews)
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            {/* Net Rates — pulled to the top of the left column (order-first).
                One matrix: room types down the side, periods across the top. */}
            {rateMatrix && (
              <div className="order-first bg-white rounded-2xl p-6 md:p-8 shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                  <h2 className="text-2xl font-semibold text-gray-900">Net Rates</h2>
                  <div className="flex items-center gap-3">
                    {/* Table / Calendar toggle */}
                    <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                      <button
                        onClick={() => setRateView("table")}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                          rateView === "table"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <Table2 size={14} /> Rates
                      </button>
                      <button
                        onClick={() => setRateView("calendar")}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                          rateView === "calendar"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <CalendarDays size={14} /> Calendar
                      </button>
                    </div>
                  </div>
                </div>
                {rateView === "calendar" ? (
                  <>
                    <NoticeCalendar notices={hotel.notices || []} />
                    <p className="mt-2.5 text-xs text-gray-400">
                      Red = Stop Sale · Green = Promotion.{" "}
                      <Link
                        to={`/hotel/notices/${slug}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Manage
                      </Link>
                    </p>
                  </>
                ) : (
                <div className="overflow-x-auto rounded-xl ring-1 ring-gray-100">
                  <table className="w-full text-[13px] border-collapse tabular-nums">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500">
                        <th className="sticky left-0 z-10 bg-gray-50 px-2.5 py-2 text-left font-medium whitespace-nowrap">
                          Room type
                        </th>
                        {rateMatrix.periods.map((p) => (
                          <th
                            key={p.key}
                            className="px-2.5 py-2 text-right font-medium whitespace-nowrap"
                          >
                            {p.short}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rateMatrix.rooms.map((room, idx) => {
                        const zebra = idx % 2 === 1;
                        return (
                          <tr
                            key={room.name}
                            className={`group border-t border-gray-100 ${
                              zebra ? "bg-gray-50" : "bg-white"
                            } hover:bg-blue-50`}
                          >
                            <td
                              className={`sticky left-0 z-10 ${
                                zebra ? "bg-gray-50" : "bg-white"
                              } group-hover:bg-blue-50 px-2.5 py-1.5 font-medium text-gray-800 whitespace-nowrap`}
                            >
                              {room.name}
                            </td>
                            {rateMatrix.periods.map((p) => {
                              const cell = room.cells[p.key];
                              return (
                                <td
                                  key={p.key}
                                  className="px-2.5 py-1.5 text-right whitespace-nowrap"
                                >
                                  {(() => {
                                    // Breakfast-included price (RB); fall back to
                                    // the single price when there's no meal split.
                                    const c = cell && (cell.RB || cell._ || cell.RO);
                                    return c ? (
                                      <span className="font-medium text-gray-900">
                                        {c.price.toLocaleString()}
                                      </span>
                                    ) : (
                                      <span className="text-gray-300">—</span>
                                    );
                                  })()}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                )}
                {rateView === "table" && (
                  <p className="mt-2.5 text-xs text-gray-400">
                    * All prices include breakfast (per room / night).
                  </p>
                )}
              </div>
            )}

            {/* Stop Sale & Promotions — active notices for this hotel */}
            {(stopSales.length > 0 || promotions.length > 0) && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Stop Sale &amp; Promotions
                  </h2>
                  <Link
                    to={`/hotel/notices/${slug}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Manage
                  </Link>
                </div>
                <div className="space-y-2.5">
                  {stopSales.map((n) => (
                    <div
                      key={`s-${n.id}`}
                      className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3"
                    >
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-600 shrink-0">
                        <Ban size={13} /> Stop Sale
                      </span>
                      <div className="min-w-0 text-sm">
                        <div className="font-medium text-gray-800">
                          {n.date_start} → {n.date_end}
                          <span className="text-gray-400 font-normal">
                            {" · "}
                            {n.room_type || "All rooms"}
                          </span>
                        </div>
                        {(n.title || n.detail) && (
                          <p className="text-gray-500 text-xs mt-0.5 whitespace-pre-line">
                            {[n.title, n.detail].filter(Boolean).join(" — ")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {promotions.map((n) => (
                    <div
                      key={`p-${n.id}`}
                      className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3"
                    >
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-600 shrink-0">
                        <Tag size={13} /> Promo
                      </span>
                      <div className="min-w-0 text-sm flex-1">
                        <div className="font-medium text-gray-800">
                          {n.date_start} → {n.date_end}
                          <span className="text-gray-400 font-normal">
                            {" · "}
                            {n.room_type || "All rooms"}
                          </span>
                        </div>
                        {(n.title || n.detail) && (
                          <p className="text-gray-500 text-xs mt-0.5 whitespace-pre-line">
                            {[n.title, n.detail].filter(Boolean).join(" — ")}
                          </p>
                        )}
                      </div>
                      {n.promo_price != null && (
                        <span className="text-base font-semibold text-emerald-600 whitespace-nowrap shrink-0">
                          ฿{Number(n.promo_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {galleryImages.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Gallery
                </h2>
                {galleryCategories.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    <button
                      onClick={() => setActiveCategory("all")}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        activeCategory === "all"
                          ? "bg-slate-800 text-white"
                          : "bg-white border border-gray-200 text-gray-600 hover:border-slate-400"
                      }`}
                    >
                      All ({galleryImages.length})
                    </button>
                    {galleryCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          activeCategory === cat
                            ? "bg-slate-800 text-white"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-slate-400"
                        }`}
                      >
                        {cat} ({galleryByCategory[cat].length})
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredGalleryImages.slice(0, 6).map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => openGalleryLightbox(idx)}
                      className="relative h-44 rounded-xl overflow-hidden cursor-pointer group shadow-sm"
                    >
                      <img
                        src={img.image_url}
                        alt={img.caption || img.category}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      {idx === 5 && filteredGalleryImages.length > 6 && (
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                          <span className="text-white text-2xl font-semibold">
                            +{filteredGalleryImages.length - 6} photos
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview */}
            {hotel.description && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm ring-1 ring-black/5">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Property Overview
                </h2>
                {hotel.short_description && (
                  <p className="text-gray-700 font-medium mb-4">
                    {hotel.short_description}
                  </p>
                )}
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {hotel.description}
                </p>
                {(hotel.check_in_time || hotel.check_out_time) && (
                  <div className="mt-6 flex flex-wrap gap-6 text-gray-600">
                    {hotel.check_in_time && (
                      <span>
                        🕐 Check-in: <strong>{hotel.check_in_time}</strong>
                      </span>
                    )}
                    {hotel.check_out_time && (
                      <span>
                        🕐 Check-out: <strong>{hotel.check_out_time}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm ring-1 ring-black/5">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Popular Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {amenities.map((a, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-gray-700">
                      <span className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-green-600 shrink-0">
                        ✓
                      </span>
                      <span className="font-medium text-sm md:text-base">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room Types */}
            {roomTypes.length > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm ring-1 ring-black/5">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Room Types
                </h2>
                <div className="space-y-6">
                  {roomTypes.map((room, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {roomImageMap[room.name] &&
                        roomImageMap[room.name].length > 0 && (
                          <div className="flex gap-1 overflow-x-auto">
                            {roomImageMap[room.name].map((img, imgIdx) => (
                              <img
                                key={imgIdx}
                                src={img.image_url}
                                alt={img.caption || room.name}
                                loading="lazy"
                                onClick={() => openRoomLightbox(room.name, imgIdx)}
                                className="h-40 w-auto object-cover flex-shrink-0 cursor-pointer hover:brightness-90 transition"
                              />
                            ))}
                          </div>
                        )}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {room.name}
                          </h3>
                          {roomPriceFrom[room.name] != null && (
                            <div className="text-right shrink-0 leading-tight">
                              <span className="block text-[11px] text-gray-400">
                                from
                              </span>
                              <span className="text-base font-semibold text-blue-600 whitespace-nowrap">
                                ฿{roomPriceFrom[room.name].toLocaleString()}
                              </span>
                              <span className="block text-[11px] text-gray-400">
                                / night incl. breakfast
                              </span>
                            </div>
                          )}
                        </div>
                        {room.description && (
                          <p className="text-gray-500 text-sm mb-3">
                            {room.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          {room.bed_type && <span>🛏 {room.bed_type} Bed</span>}
                          {room.max_guests && <span>👥 Max {room.max_guests} guests</span>}
                          {room.room_size && <span>📐 {room.room_size} sqm</span>}
                        </div>
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                            {room.amenities.map((a, i) => (
                              <span
                                key={i}
                                className="bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-medium"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rate conditions */}
            {(hotel.rate_validity || hotel.child_policy || hotel.rate_terms) && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm ring-1 ring-black/5 space-y-5">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Rate Conditions
                </h2>
                {hotel.rate_validity && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1.5">
                      Validity &amp; Market
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {hotel.rate_validity}
                    </p>
                  </div>
                )}
                {hotel.child_policy && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1.5">
                      Children &amp; Extra Bed
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {hotel.child_policy}
                    </p>
                  </div>
                )}
                {hotel.rate_terms && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1.5">
                      Terms &amp; Conditions
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                      {hotel.rate_terms}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: info / contact */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5 space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Hotel info
                </h3>
                <p className="text-sm text-gray-500">
                  Synced from indosmilesouthservices.com
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                {hotel.contact_phone && (
                  <div className="flex items-center gap-3">
                    📞 <span>{hotel.contact_phone}</span>
                  </div>
                )}
                {hotel.contact_email && (
                  <div className="flex items-center gap-3 break-all">
                    ✉️ <span>{hotel.contact_email}</span>
                  </div>
                )}
                {hotel.website && (
                  <div className="flex items-center gap-3">
                    🌐{" "}
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

              {hotel.address && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    📍
                    <div>
                      <span>{hotel.address}</span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          hotel.address
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1.5 text-blue-600 hover:underline font-medium text-xs"
                      >
                        View on Google Maps →
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <Link
                to={`/hotel/rates/${slug}`}
                className="block text-center w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700"
              >
                ✎ Edit net rates
              </Link>

              <Link
                to={`/hotel/notices/${slug}`}
                className="block text-center w-full border border-amber-300 text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl font-medium hover:bg-amber-100"
              >
                🗓 Stop Sale &amp; Promotions
              </Link>

              <Link
                to="/hotel"
                className="block text-center w-full border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50"
              >
                ← Back to hotels
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && lightboxImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-md"
          onClick={closeLightbox}
        >
          {lightboxIsGallery && galleryCategories.length > 1 && (
            <div
              className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 z-10 max-w-[80vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setLightboxImages(galleryImages);
                  setLightboxIndex(0);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                  activeCategory === "all"
                    ? "bg-white text-slate-900"
                    : "bg-white/15 text-white/80 hover:bg-white/25"
                }`}
              >
                All ({galleryImages.length})
              </button>
              {galleryCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setLightboxImages(
                      galleryImages.filter((img) => img.category === cat)
                    );
                    setLightboxIndex(0);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                    activeCategory === cat
                      ? "bg-white text-slate-900"
                      : "bg-white/15 text-white/80 hover:bg-white/25"
                  }`}
                >
                  {cat} ({galleryByCategory[cat].length})
                </button>
              ))}
            </div>
          )}

          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-10 text-3xl leading-none"
            onClick={closeLightbox}
          >
            ✕
          </button>
          <button
            className="absolute left-4 md:left-8 text-white/70 hover:text-white p-4 bg-black/20 hover:bg-black/50 rounded-full text-2xl"
            onClick={prevImage}
          >
            ‹
          </button>
          <img
            src={lightboxImages[lightboxIndex]?.image_url}
            alt={lightboxImages[lightboxIndex]?.caption || "Gallery"}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-sm"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 md:right-8 text-white/70 hover:text-white p-4 bg-black/20 hover:bg-black/50 rounded-full text-2xl"
            onClick={nextImage}
          >
            ›
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
            {lightboxImages[lightboxIndex]?.caption && (
              <span className="text-white/80 text-sm bg-black/40 px-4 py-2 rounded-full">
                {lightboxImages[lightboxIndex].caption}
              </span>
            )}
            <span className="text-white/80 tracking-widest text-sm bg-black/40 px-4 py-2 rounded-full">
              {lightboxIndex + 1} / {lightboxImages.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
