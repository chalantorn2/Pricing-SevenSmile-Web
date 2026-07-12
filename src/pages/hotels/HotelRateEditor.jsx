import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Copy } from "lucide-react";
import { hotelsService } from "../../services/api-service";
import Toast from "../../components/core/Toast";

// Manual rate editor for a hotel. Loads existing rows from hotel-rates.php,
// lets staff add/edit/delete rate rows + free-text conditions, then bulk-saves
// (POST replaces all rows for the hotel). Room metadata is pulled from the
// hotel API; only price/period data is entered here.
const emptyRow = () => ({
  _key: Math.random().toString(36).slice(2),
  id: null,
  room_type: "",
  period_label: "",
  period_start: "",
  period_end: "",
  meal_plan: "",
  price: "",
});

export default function HotelRateEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [rows, setRows] = useState([]);
  const [conditions, setConditions] = useState({
    rate_validity: "",
    child_policy: "",
    rate_terms: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

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
      const data = await hotelsService.getHotelRates(h.id);
      const loaded = (data?.rates || []).map((r) => ({
        _key: Math.random().toString(36).slice(2),
        id: r.id,
        room_type: r.room_type || "",
        period_label: r.period_label || "",
        period_start: r.period_start || "",
        period_end: r.period_end || "",
        meal_plan: r.meal_plan || "",
        price: r.price ?? "",
      }));
      setRows(loaded.length ? loaded : [emptyRow()]);
      setConditions({
        rate_validity: data?.conditions?.rate_validity || "",
        child_policy: data?.conditions?.child_policy || "",
        rate_terms: data?.conditions?.rate_terms || "",
      });
    } catch (err) {
      console.error("Error loading rate editor:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const updateRow = (key, field, value) =>
    setRows((prev) =>
      prev.map((r) => (r._key === key ? { ...r, [field]: value } : r))
    );

  const addRow = (afterKey) =>
    setRows((prev) => {
      const row = emptyRow();
      if (!afterKey) return [...prev, row];
      const idx = prev.findIndex((r) => r._key === afterKey);
      // carry the room type/period down so adding a season for the same room is quick
      const src = prev[idx];
      row.room_type = src.room_type;
      const next = [...prev];
      next.splice(idx + 1, 0, row);
      return next;
    });

  const duplicateRow = (key) =>
    setRows((prev) => {
      const idx = prev.findIndex((r) => r._key === key);
      const copy = { ...prev[idx], _key: Math.random().toString(36).slice(2), id: null };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });

  const removeRow = (key) =>
    setRows((prev) => prev.filter((r) => r._key !== key));

  const handleSave = async () => {
    // keep only rows that have a room type and a numeric price
    const cleaned = rows
      .filter((r) => r.room_type.trim() && r.price !== "" && !isNaN(Number(r.price)))
      .map((r, i) => ({
        room_type: r.room_type.trim(),
        period_label: r.period_label.trim() || null,
        period_start: r.period_start || null,
        period_end: r.period_end || null,
        meal_plan: r.meal_plan || null,
        price: Number(r.price),
        sort_order: i,
      }));

    if (!cleaned.length) {
      notify("Add at least one row with a room type and price.", "warning");
      return;
    }

    try {
      setSaving(true);
      await hotelsService.saveHotelRates(hotel.id, cleaned, conditions);
      notify(`Saved ${cleaned.length} rate rows.`);
      setTimeout(() => navigate(`/hotel/view/${slug}`), 800);
    } catch (err) {
      console.error("Error saving rates:", err);
      notify("Save failed: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Loading rates…</p>
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
          <h2 className="text-2xl font-semibold text-gray-900">Hotel not found</h2>
          <button
            onClick={load}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            to={`/hotel/view/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-700 mb-2"
          >
            <ArrowLeft size={16} /> Back to {hotel.name}
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Net Rates</h1>
          <p className="text-sm text-gray-500">{hotel.name}</p>
        </div>
      </div>

      {/* Rate rows */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4 md:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Rates <span className="text-gray-400 font-normal">({rows.length} rows · THB)</span>
          </h2>
          <button
            onClick={() => addRow()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
          >
            <Plus size={16} /> Add row
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-2 py-2 font-medium min-w-[180px]">Room type</th>
                <th className="px-2 py-2 font-medium min-w-[200px]">Period label</th>
                <th className="px-2 py-2 font-medium">Start</th>
                <th className="px-2 py-2 font-medium">End</th>
                <th className="px-2 py-2 font-medium">Meal</th>
                <th className="px-2 py-2 font-medium text-right">Price</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._key} className="align-top">
                  <td className="px-2 py-1.5">
                    <input
                      value={r.room_type}
                      onChange={(e) => updateRow(r._key, "room_type", e.target.value)}
                      placeholder="Deluxe"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      value={r.period_label}
                      onChange={(e) => updateRow(r._key, "period_label", e.target.value)}
                      placeholder="01 Nov 25 – 25 Dec 25"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="date"
                      value={r.period_start}
                      onChange={(e) => updateRow(r._key, "period_start", e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="date"
                      value={r.period_end}
                      onChange={(e) => updateRow(r._key, "period_end", e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      value={r.meal_plan}
                      onChange={(e) => updateRow(r._key, "meal_plan", e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none bg-white"
                    >
                      <option value="">— none —</option>
                      <option value="RO">RO (room only)</option>
                      <option value="RB">RB (breakfast)</option>
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={r.price}
                      onChange={(e) => updateRow(r._key, "price", e.target.value)}
                      placeholder="0"
                      className="w-28 px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none text-right"
                    />
                  </td>
                  <td className="px-1 py-1.5 whitespace-nowrap">
                    <button
                      onClick={() => addRow(r._key)}
                      title="Add row below (same room)"
                      className="p-1.5 text-gray-400 hover:text-blue-600"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => duplicateRow(r._key)}
                      title="Duplicate row"
                      className="p-1.5 text-gray-400 hover:text-blue-600"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      onClick={() => removeRow(r._key)}
                      title="Delete row"
                      className="p-1.5 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conditions */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4 md:p-6 mb-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Rate conditions</h2>
        {[
          ["rate_validity", "Validity & Market", "Validity / sales-stay period / market / booking code"],
          ["child_policy", "Children & Extra Bed", "Child rates, extra bed, max occupancy…"],
          ["rate_terms", "Terms & Conditions", "Cancellation, inclusions, check-in/out…"],
        ].map(([field, label, ph]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <textarea
              rows={field === "rate_terms" ? 5 : 3}
              value={conditions[field]}
              onChange={(e) =>
                setConditions((c) => ({ ...c, [field]: e.target.value }))
              }
              placeholder={ph}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none text-sm leading-relaxed"
            />
          </div>
        ))}
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-gray-200 px-4 py-3 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-end gap-3">
          <Link
            to={`/hotel/view/${slug}`}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? "Saving…" : "Save rates"}
          </button>
        </div>
      </div>
    </div>
  );
}
