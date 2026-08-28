import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Globe,
  Link2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Star,
  UtensilsCrossed,
  Users,
  X,
} from "lucide-react";
import { restaurantsService } from "../../services/api-service";
import { pushRecentItem } from "../../utils/recentItems";

const UNIT_LABEL = {
  per_person: "/pax",
  per_set: "/set",
  per_table: "/table",
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// "2026-11-01" + "2026-12-25" -> "1 Nov – 25 Dec 26". Falls back to whatever
// label the contract used when the dates were never parsed.
const shortLabel = (start, end, fallback) => {
  if (!start || !end) return fallback || "—";
  const part = (s) => {
    const [y, m, d] = s.slice(0, 10).split("-");
    return { d: +d, m: MONTHS[+m - 1], y: y.slice(2) };
  };
  const a = part(start);
  const b = part(end);
  const from = a.y === b.y ? `${a.d} ${a.m}` : `${a.d} ${a.m} ${a.y}`;
  return `${from} – ${b.d} ${b.m} ${b.y}`;
};

const money = (n) =>
  Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

export default function RestaurantDetail() {
  const { slug } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [copied, setCopied] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const fetchRestaurant = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await restaurantsService.getRestaurantBySlug(slug);
      if (!data) {
        setError(true);
        return;
      }
      setRestaurant(data);
      // Remember the visit so the home screen can offer a shortcut back
      pushRecentItem({
        type: "restaurant",
        id: data.slug,
        name: data.name,
        meta: data.destination || "",
      });
    } catch (err) {
      console.error("Error loading restaurant:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  const facilities = useMemo(
    () => (Array.isArray(restaurant?.facilities) ? restaurant.facilities : []),
    [restaurant]
  );

  const menus = useMemo(
    () => (Array.isArray(restaurant?.menu_types) ? restaurant.menu_types : []),
    [restaurant]
  );

  // One matrix: menus down the side, periods across the top. A menu that has a
  // single undated rate still gets a row, under a "—" period.
  const rateMatrix = useMemo(() => {
    const rates = restaurant?.rates || [];
    if (!rates.length) return null;

    const today = new Date().toISOString().slice(0, 10);
    const periods = [];
    const periodSeen = new Set();
    const rows = [];
    const rowMap = {};

    rates.forEach((r) => {
      const label = r.period_label || shortLabel(r.period_start, r.period_end, "—");
      if (!periodSeen.has(label)) {
        periodSeen.add(label);
        periods.push({
          label,
          start: r.period_start,
          end: r.period_end,
          expired: !!r.period_end && r.period_end < today,
        });
      }
      if (!rowMap[r.menu_name]) {
        rowMap[r.menu_name] = { menu: r.menu_name, cells: {} };
        rows.push(rowMap[r.menu_name]);
      }
      rowMap[r.menu_name].cells[label] = r;
    });

    // dated periods first, in date order; undated ones keep insertion order
    periods.sort((a, b) => {
      if (a.start && b.start) return a.start.localeCompare(b.start);
      if (a.start) return -1;
      if (b.start) return 1;
      return 0;
    });

    return { periods, rows };
  }, [restaurant]);

  // Cheapest live rate per menu, for the badge on the menu cards.
  const menuPriceFrom = useMemo(() => {
    const map = {};
    (restaurant?.rates || []).forEach((r) => {
      const current = map[r.menu_name];
      if (!current || r.price < current.price) map[r.menu_name] = r;
    });
    return map;
  }, [restaurant]);

  const images = useMemo(
    () => (Array.isArray(restaurant?.images) ? restaurant.images : []),
    [restaurant]
  );

  const categories = useMemo(
    () => [...new Set(images.map((i) => i.category || "Other"))].sort(),
    [images]
  );

  const visibleImages = useMemo(
    () =>
      activeCategory === "all"
        ? images
        : images.filter((i) => (i.category || "Other") === activeCategory),
    [images, activeCategory]
  );

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const nextImage = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null ? i : (i + 1) % Math.max(visibleImages.length, 1)
      ),
    [visibleImages.length]
  );
  const prevImage = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null
          ? i
          : (i - 1 + visibleImages.length) % Math.max(visibleImages.length, 1)
      ),
    [visibleImages.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") nextImage();
      else if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, closeLightbox, nextImage, prevImage]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: restaurant.name, url });
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
          <p className="mt-4 text-gray-500">Loading restaurant…</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="space-y-4">
        <Link
          to="/restaurant"
          className="inline-flex items-center gap-1 text-brand-600 hover:underline text-sm"
        >
          <ArrowLeft size={14} /> Back to restaurants
        </Link>
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-12 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Restaurant not found
          </h2>
          <p className="text-gray-500">
            We couldn&apos;t load this restaurant. It may have been removed.
          </p>
          <button
            onClick={fetchRestaurant}
            className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const hours =
    restaurant.open_time && restaurant.close_time
      ? `${restaurant.open_time} – ${restaurant.close_time}`
      : restaurant.open_time || restaurant.close_time || null;

  return (
    <div className="-m-4 lg:-m-6 pb-12">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/restaurant" className="hover:text-brand-700">
            Restaurants
          </Link>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-900 font-medium truncate max-w-[220px]">
            {restaurant.name}
          </span>
        </nav>
      </div>

      {/* Hero */}
      <div className="relative h-[46vh] min-h-[330px] w-full overflow-hidden mt-4">
        {restaurant.main_image ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${restaurant.main_image})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <UtensilsCrossed size={64} className="text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10">
          <button
            onClick={handleShare}
            className="absolute top-6 right-6 bg-black/30 backdrop-blur-md text-white/80 hover:text-white hover:bg-black/50 p-3 rounded-full transition"
            title="Share"
          >
            {copied ? <Check size={18} /> : <Link2 size={18} />}
          </button>
          {copied && (
            <span className="absolute top-6 right-20 bg-black/60 text-white text-xs px-3 py-2 rounded-full">
              Link copied!
            </span>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {restaurant.destination && (
              <span className="bg-warning-600 text-gray-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                {restaurant.destination}
              </span>
            )}
            {restaurant.cuisine && (
              <span className="bg-black/30 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold">
                {restaurant.cuisine}
              </span>
            )}
            {!restaurant.is_active && (
              <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Inactive
              </span>
            )}
          </div>

          {restaurant.logo && (
            <img
              src={restaurant.logo}
              alt=""
              className="h-16 md:h-20 w-auto max-w-[220px] object-contain rounded-lg bg-white/90 ring-1 ring-black/5 p-2 mb-4"
            />
          )}

          <h1 className="text-3xl md:text-5xl font-semibold text-white mb-3 leading-tight">
            {restaurant.name}
          </h1>

          <div className="flex items-center flex-wrap text-white/90 gap-6 text-sm md:text-base">
            <span className="flex items-center gap-2">
              <MapPin size={16} /> {restaurant.destination}
            </span>
            {restaurant.seating_capacity ? (
              <span className="flex items-center gap-2">
                <Users size={16} /> {restaurant.seating_capacity} pax
              </span>
            ) : null}
            {hours && (
              <span className="flex items-center gap-2">
                <Clock size={16} /> {hours}
              </span>
            )}
            {Number(restaurant.rating) > 0 && (
              <span className="flex items-center gap-2">
                <Star
                  size={16}
                  className="text-warning-600"
                  fill="currentColor"
                  strokeWidth={0}
                />
                <span className="font-semibold">{restaurant.rating} / 5.0</span>
                <span className="text-white/60">
                  ({restaurant.review_count} reviews)
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
            {/* Net Rates */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <h2 className="text-2xl font-semibold text-gray-900">Net Rates</h2>
                <Link
                  to={`/restaurant/rates/${slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100"
                >
                  <Pencil size={15} /> Edit rates
                </Link>
              </div>

              {!rateMatrix ? (
                <p className="text-gray-500 text-sm">
                  No rates entered yet.{" "}
                  <Link
                    to={`/restaurant/rates/${slug}`}
                    className="text-brand-600 hover:underline"
                  >
                    Add the contract rates
                  </Link>
                  .
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-separate border-spacing-0">
                    <thead>
                      <tr>
                        <th className="sticky left-0 bg-white text-left px-3 py-2 font-medium text-gray-500 border-b border-gray-100">
                          Menu
                        </th>
                        {rateMatrix.periods.map((p) => (
                          <th
                            key={p.label}
                            className={`px-3 py-2 text-right font-medium border-b border-gray-100 whitespace-nowrap ${
                              p.expired ? "text-gray-300" : "text-gray-500"
                            }`}
                          >
                            {p.label}
                            {p.expired && (
                              <span className="block text-[10px] font-normal uppercase tracking-wide">
                                expired
                              </span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rateMatrix.rows.map((row) => (
                        <tr key={row.menu} className="hover:bg-gray-50">
                          <td className="sticky left-0 bg-white px-3 py-2.5 font-medium text-gray-900 border-b border-gray-50 whitespace-nowrap">
                            {row.menu}
                          </td>
                          {rateMatrix.periods.map((p) => {
                            const cell = row.cells[p.label];
                            return (
                              <td
                                key={p.label}
                                className={`px-3 py-2.5 text-right border-b border-gray-50 tabular-nums ${
                                  p.expired ? "text-gray-300" : "text-gray-900"
                                }`}
                              >
                                {cell ? (
                                  <>
                                    <span className="font-semibold">
                                      {money(cell.price)}
                                    </span>
                                    <span className="text-gray-400 text-xs">
                                      {" "}
                                      {UNIT_LABEL[cell.price_unit] || "/pax"}
                                    </span>
                                    {(cell.min_pax || cell.note) && (
                                      <span className="block text-[11px] text-gray-400 font-normal">
                                        {cell.min_pax ? `min ${cell.min_pax} pax` : ""}
                                        {cell.min_pax && cell.note ? " · " : ""}
                                        {cell.note || ""}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Menus */}
            {menus.length > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm ring-1 ring-black/5">
                <h2 className="text-2xl font-semibold text-gray-900 mb-5">Menus</h2>
                <div className="flex flex-col gap-4">
                  {menus.map((m, i) => {
                    const from = menuPriceFrom[m.name];
                    return (
                      <div
                        key={`${m.name}-${i}`}
                        className="rounded-xl border border-gray-100 p-4"
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <h3 className="font-semibold text-gray-900">{m.name}</h3>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                              {m.kind && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                                  {m.kind}
                                </span>
                              )}
                              {m.min_pax ? (
                                <span className="text-xs text-gray-400">
                                  min {m.min_pax} pax
                                </span>
                              ) : null}
                            </div>
                          </div>
                          {from && (
                            <div className="text-right">
                              <span className="text-xs text-gray-400 block">from</span>
                              <span className="text-lg font-semibold text-gray-900 tabular-nums">
                                {money(from.price)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {" "}
                                {UNIT_LABEL[from.price_unit] || "/pax"}
                              </span>
                            </div>
                          )}
                        </div>
                        {m.description && (
                          <p className="text-sm text-gray-500 mt-2">{m.description}</p>
                        )}
                        {Array.isArray(m.items) && m.items.length > 0 && (
                          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                            {m.items.map((item, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-gray-600 flex items-start gap-2"
                              >
                                <span className="text-brand-400 mt-1.5 w-1 h-1 rounded-full bg-current shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            {restaurant.description && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm ring-1 ring-black/5">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  About {restaurant.name}
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {restaurant.description}
                </p>
              </div>
            )}

            {/* Gallery */}
            {images.length > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                  <h2 className="text-2xl font-semibold text-gray-900">Gallery</h2>
                  {categories.length > 1 && (
                    <div className="flex flex-wrap gap-1.5">
                      {["all", ...categories].map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setActiveCategory(c);
                            setLightboxIndex(null);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                            activeCategory === c
                              ? "bg-brand-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {c === "all" ? "All" : c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {visibleImages.map((img, i) => (
                    <button
                      key={`${img.image_url}-${i}`}
                      onClick={() => setLightboxIndex(i)}
                      className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100"
                    >
                      <img
                        src={img.image_url}
                        alt={img.caption || img.category || restaurant.name}
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact & Location
              </h2>
              <dl className="flex flex-col gap-3 text-sm">
                {restaurant.address && (
                  <div className="flex gap-3">
                    <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <dd className="text-gray-600">{restaurant.address}</dd>
                  </div>
                )}
                {restaurant.contact_phone && (
                  <div className="flex gap-3">
                    <Phone size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <dd>
                      <a
                        href={`tel:${restaurant.contact_phone}`}
                        className="text-gray-600 hover:text-brand-700"
                      >
                        {restaurant.contact_phone}
                      </a>
                    </dd>
                  </div>
                )}
                {restaurant.contact_email && (
                  <div className="flex gap-3">
                    <Mail size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <dd>
                      <a
                        href={`mailto:${restaurant.contact_email}`}
                        className="text-gray-600 hover:text-brand-700 break-all"
                      >
                        {restaurant.contact_email}
                      </a>
                    </dd>
                  </div>
                )}
                {restaurant.website && (
                  <div className="flex gap-3">
                    <Globe size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <dd>
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 hover:underline break-all"
                      >
                        {restaurant.website}
                      </a>
                    </dd>
                  </div>
                )}
                {restaurant.map_url && (
                  <div className="flex gap-3">
                    <ExternalLink size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <dd>
                      <a
                        href={restaurant.map_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 hover:underline"
                      >
                        Open in Google Maps
                      </a>
                    </dd>
                  </div>
                )}
                {hours && (
                  <div className="flex gap-3">
                    <Clock size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <dd className="text-gray-600">{hours}</dd>
                  </div>
                )}
                {restaurant.seating_capacity ? (
                  <div className="flex gap-3">
                    <Users size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <dd className="text-gray-600">
                      Seats {restaurant.seating_capacity} pax
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>

            {facilities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Facilities
                </h2>
                <ul className="flex flex-col gap-2">
                  {facilities.map((f, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <Check size={15} className="text-brand-600 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(restaurant.rate_validity || restaurant.rate_terms) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-black/5 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Rate conditions
                </h2>
                {restaurant.rate_validity && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                      Validity & Market
                    </h3>
                    <p className="text-sm text-gray-500 whitespace-pre-line leading-relaxed">
                      {restaurant.rate_validity}
                    </p>
                  </div>
                )}
                {restaurant.rate_terms && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">
                      Terms & Conditions
                    </h3>
                    <p className="text-sm text-gray-500 whitespace-pre-line leading-relaxed">
                      {restaurant.rate_terms}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && visibleImages[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-2"
            aria-label="Close"
          >
            <X size={26} />
          </button>
          {visibleImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 text-white/70 hover:text-white p-3"
                aria-label="Previous"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 text-white/70 hover:text-white p-3"
                aria-label="Next"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
          <img
            src={visibleImages[lightboxIndex].image_url}
            alt={visibleImages[lightboxIndex].caption || restaurant.name}
            className="max-h-[88vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="absolute bottom-6 text-white/60 text-sm">
            {lightboxIndex + 1} / {visibleImages.length}
          </span>
        </div>
      )}
    </div>
  );
}
