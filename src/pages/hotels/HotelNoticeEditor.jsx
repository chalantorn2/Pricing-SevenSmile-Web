import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Pencil, Ban, Tag } from "lucide-react";
import { hotelsService } from "../../services/api-service";
import Toast from "../../components/core/Toast";
import NoticeCalendar from "../../components/hotels/NoticeCalendar";

// Manage Stop Sale / Promotion notices for one hotel. A month calendar visualises
// the periods (red = stop sale, green = promotion) and a form below adds/edits
// individual notices via per-record CRUD (hotel-notices.php).

// Format a YYYY-MM-DD range into a compact label, e.g. "1 May – 31 Oct 26".
// Drops the start year when both ends share it.
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const shortRange = (start, end) => {
  const part = (s) => {
    const [y, m, d] = s.slice(0, 10).split("-");
    return { d: +d, m: MON[+m - 1], y: y.slice(2) };
  };
  const a = part(start);
  const b = part(end);
  const e = `${b.d} ${b.m} ${b.y}`;
  const s = a.y === b.y ? `${a.d} ${a.m}` : `${a.d} ${a.m} ${a.y}`;
  return `${s} – ${e}`;
};

const emptyForm = () => ({
  id: null,
  type: "stop_sale",
  room_type: "",
  date_start: "",
  date_end: "",
  title: "",
  detail: "",
  promo_price: "",
});

export default function HotelNoticeEditor() {
  const { slug } = useParams();

  const [hotel, setHotel] = useState(null);
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const loadNotices = useCallback(async (hotelId) => {
    const list = await hotelsService.getHotelNotices(hotelId);
    setNotices(list);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const h = await hotelsService.getHotelBySlug(slug);
      if (!h) {
        setError(true);
        return;
      }
      setHotel(h);
      await loadNotices(h.id);
    } catch (err) {
      console.error("Error loading notices:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug, loadNotices]);

  useEffect(() => {
    load();
  }, [load]);

  const roomOptions = useMemo(() => {
    const rooms = hotel?.room_types || [];
    return rooms.map((r) => r.name).filter(Boolean);
  }, [hotel]);

  // Existing rate periods (from hotel.rates) as pick-able presets for the date
  // range. Deduped by start+end; only rows that actually have both dates.
  const periodOptions = useMemo(() => {
    const rates = hotel?.rates || [];
    const n = new Date();
    const today = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
    const seen = new Set();
    const out = [];
    rates.forEach((r) => {
      if (!r.period_start || !r.period_end) return;
      if (r.period_end.slice(0, 10) < today) return; // skip expired periods
      const key = `${r.period_start}|${r.period_end}`;
      if (seen.has(key)) return;
      seen.add(key);
      const start = r.period_start.slice(0, 10);
      const end = r.period_end.slice(0, 10);
      out.push({ key, start, end, label: shortRange(start, end) });
    });
    return out;
  }, [hotel]);

  // which preset (if any) currently matches the form dates
  const selectedPeriodKey = useMemo(() => {
    const match = periodOptions.find(
      (p) => p.start === form.date_start && p.end === form.date_end
    );
    return match ? match.key : "";
  }, [periodOptions, form.date_start, form.date_end]);

  // Columns in the top form row: room + start + end (3), plus period preset and
  // promo price when present. Static class names so Tailwind keeps them.
  const rowCols =
    3 + (periodOptions.length > 0 ? 1 : 0) + (form.type === "promotion" ? 1 : 0);
  const rowColClass = {
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
  }[rowCols];

  const startEdit = (n) => {
    setForm({
      id: n.id,
      type: n.type,
      room_type: n.room_type || "",
      date_start: n.date_start,
      date_end: n.date_end,
      title: n.title || "",
      detail: n.detail || "",
      promo_price: n.promo_price ?? "",
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const resetForm = () => setForm(emptyForm());

  const handleSubmit = async () => {
    if (!form.date_start || !form.date_end) {
      notify("Pick a start and end date.", "warning");
      return;
    }
    if (form.date_end < form.date_start) {
      notify("End date must be on or after start date.", "warning");
      return;
    }
    if (form.type === "promotion" && form.promo_price === "") {
      notify("Enter the promo price.", "warning");
      return;
    }

    const payload = {
      type: form.type,
      room_type: form.room_type || null,
      date_start: form.date_start,
      date_end: form.date_end,
      title: form.title.trim() || null,
      detail: form.detail.trim() || null,
      promo_price:
        form.type === "promotion" && form.promo_price !== ""
          ? Number(form.promo_price)
          : null,
    };

    try {
      setSaving(true);
      if (form.id) {
        await hotelsService.updateHotelNotice(form.id, payload);
        notify("Notice updated.");
      } else {
        await hotelsService.createHotelNotice(hotel.id, payload);
        notify("Notice added.");
      }
      await loadNotices(hotel.id);
      resetForm();
    } catch (err) {
      notify("Save failed: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await hotelsService.deleteHotelNotice(id);
      await loadNotices(hotel.id);
      if (form.id === id) resetForm();
      notify("Notice deleted.");
    } catch (err) {
      notify("Delete failed: " + err.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
          <p className="mt-4 text-gray-500">Loading notices…</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="space-y-4">
        <Link
          to="/hotel"
          className="inline-flex items-center gap-1 text-brand-600 hover:underline text-sm"
        >
          <ArrowLeft size={14} /> Back to hotels
        </Link>
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-12 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Hotel not found</h2>
          <button
            onClick={load}
            className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/hotel/view/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-700 mb-2"
        >
          <ArrowLeft size={16} /> Back to {hotel.name}
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">
          Stop Sale &amp; Promotions
        </h1>
        <p className="text-sm text-gray-500">{hotel.name}</p>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4 md:p-6 mb-6">
        <NoticeCalendar
          notices={notices}
          onDayClick={(ds) =>
            setForm((f) => ({
              ...f,
              date_start: ds,
              date_end: f.date_end && f.date_end >= ds ? f.date_end : ds,
            }))
          }
        />
        <p className="mt-3 text-xs text-gray-400">
          Tip: click a day to set it as the start date in the form below.
        </p>
      </div>

      {/* Existing notices list */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4 md:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Notices <span className="text-gray-400 font-normal">({notices.length})</span>
        </h2>
        {notices.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            No stop sale or promotion yet. Add one below.
          </p>
        ) : (
          <div className="space-y-2">
            {notices.map((n) => {
              const stop = n.type === "stop_sale";
              return (
                <div
                  key={n.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                    n.is_active ? "border-gray-100" : "border-gray-100 opacity-50"
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold shrink-0 ${
                      stop
                        ? "bg-danger-50 text-danger-600"
                        : "bg-success-50 text-success-600"
                    }`}
                  >
                    {stop ? <Ban size={13} /> : <Tag size={13} />}
                    {stop ? "Stop Sale" : "Promo"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-gray-900 font-medium truncate">
                      {n.date_start} → {n.date_end}
                      {n.room_type ? (
                        <span className="text-gray-400 font-normal"> · {n.room_type}</span>
                      ) : (
                        <span className="text-gray-400 font-normal"> · All rooms</span>
                      )}
                    </div>
                    {(n.title || n.promo_price != null) && (
                      <div className="text-xs text-gray-500 truncate">
                        {n.title}
                        {n.promo_price != null && (
                          <span className="text-success-600 font-medium">
                            {n.title ? " · " : ""}฿{Number(n.promo_price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => startEdit(n)}
                    className="p-1.5 text-gray-400 hover:text-brand-600"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 text-gray-400 hover:text-danger-600"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / edit form */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {form.id ? "Edit notice" : "Add notice"}
        </h2>

        {/* type toggle */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setForm((f) => ({ ...f, type: "stop_sale" }))}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition ${
              form.type === "stop_sale"
                ? "bg-danger-50 border-danger-200 text-danger-600"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <Ban size={15} /> Stop Sale
          </button>
          <button
            onClick={() => setForm((f) => ({ ...f, type: "promotion" }))}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition ${
              form.type === "promotion"
                ? "bg-success-50 border-success-200 text-success-600"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <Tag size={15} /> Promotion
          </button>
        </div>

        <div className="space-y-4">
          {/* Room / period / price / dates on one row */}
          <div className={`grid grid-cols-1 gap-4 ${rowColClass}`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Room type
              </label>
              <select
                value={form.room_type}
                onChange={(e) => setForm((f) => ({ ...f, room_type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white"
              >
                <option value="">All rooms</option>
                {roomOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {periodOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Use existing period
                </label>
                <select
                  value={selectedPeriodKey}
                  onChange={(e) => {
                    const p = periodOptions.find((o) => o.key === e.target.value);
                    if (p) setForm((f) => ({ ...f, date_start: p.start, date_end: p.end }));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white"
                >
                  <option value="">Custom dates…</option>
                  {periodOptions.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {form.type === "promotion" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Promo price (฿ / room / night)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.promo_price}
                  onChange={(e) => setForm((f) => ({ ...f, promo_price: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start date
              </label>
              <input
                type="date"
                value={form.date_start}
                onChange={(e) => setForm((f) => ({ ...f, date_start: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                End date
              </label>
              <input
                type="date"
                value={form.date_end}
                onChange={(e) => setForm((f) => ({ ...f, date_end: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Title <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={
                form.type === "stop_sale"
                  ? "e.g. Fully booked / owner block"
                  : "e.g. Early bird 2026"
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Detail <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={form.detail}
              onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
              placeholder="Conditions, min nights, notes…"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm leading-relaxed"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          {form.id && (
            <button
              onClick={resetForm}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-medium hover:bg-gray-50"
            >
              Cancel edit
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-60"
          >
            <Plus size={18} />
            {saving ? "Saving…" : form.id ? "Update notice" : "Add notice"}
          </button>
        </div>
      </div>
    </div>
  );
}
