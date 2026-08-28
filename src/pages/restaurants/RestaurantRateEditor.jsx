import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Copy } from "lucide-react";
import { restaurantsService } from "../../services/api-service";
import Toast from "../../components/core/Toast";
import { useI18n } from "../../i18n";

// Manual rate editor for a restaurant. Loads existing rows from
// restaurant-rates.php, lets staff add/edit/delete rate rows + free-text
// conditions, then bulk-saves (POST replaces all rows for the restaurant).
// Menu names come from the restaurant's menu_types as a datalist, but the field
// stays free text so a rate can name a menu that was never set up in the form.
const PRICE_UNITS = [
  { value: "per_person", label: "per person" },
  { value: "per_set", label: "per set" },
  { value: "per_table", label: "per table" },
];

const emptyRow = () => ({
  _key: Math.random().toString(36).slice(2),
  id: null,
  menu_name: "",
  period_label: "",
  period_start: "",
  period_end: "",
  price: "",
  price_unit: "per_person",
  min_pax: "",
  note: "",
});

const cellClass =
  "w-full px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none";

export default function RestaurantRateEditor() {
  const { t } = useI18n();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [rows, setRows] = useState([]);
  const [conditions, setConditions] = useState({
    rate_validity: "",
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
      const r = await restaurantsService.getRestaurantBySlug(slug);
      if (!r) {
        setError(true);
        return;
      }
      setRestaurant(r);
      const data = await restaurantsService.getRestaurantRates(r.id);
      const loaded = (data?.rates || []).map((x) => ({
        _key: Math.random().toString(36).slice(2),
        id: x.id,
        menu_name: x.menu_name || "",
        period_label: x.period_label || "",
        period_start: x.period_start || "",
        period_end: x.period_end || "",
        price: x.price ?? "",
        price_unit: x.price_unit || "per_person",
        min_pax: x.min_pax ?? "",
        note: x.note || "",
      }));
      setRows(loaded.length ? loaded : [emptyRow()]);
      setConditions({
        rate_validity: data?.conditions?.rate_validity || "",
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

  const menuNames = Array.isArray(restaurant?.menu_types)
    ? restaurant.menu_types.map((m) => m.name).filter(Boolean)
    : [];

  const updateRow = (key, field, value) =>
    setRows((prev) =>
      prev.map((r) => (r._key === key ? { ...r, [field]: value } : r))
    );

  const addRow = (afterKey) =>
    setRows((prev) => {
      const row = emptyRow();
      if (!afterKey) return [...prev, row];
      const idx = prev.findIndex((r) => r._key === afterKey);
      // carry the menu and unit down so adding a season for the same menu is quick
      const src = prev[idx];
      row.menu_name = src.menu_name;
      row.price_unit = src.price_unit;
      row.min_pax = src.min_pax;
      const next = [...prev];
      next.splice(idx + 1, 0, row);
      return next;
    });

  const duplicateRow = (key) =>
    setRows((prev) => {
      const idx = prev.findIndex((r) => r._key === key);
      const copy = {
        ...prev[idx],
        _key: Math.random().toString(36).slice(2),
        id: null,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });

  const removeRow = (key) => setRows((prev) => prev.filter((r) => r._key !== key));

  const handleSave = async () => {
    // keep only rows that have a menu name and a numeric price
    const cleaned = rows
      .filter(
        (r) => r.menu_name.trim() && r.price !== "" && !isNaN(Number(r.price))
      )
      .map((r, i) => ({
        menu_name: r.menu_name.trim(),
        period_label: r.period_label.trim() || null,
        period_start: r.period_start || null,
        period_end: r.period_end || null,
        price: Number(r.price),
        price_unit: r.price_unit || "per_person",
        min_pax: r.min_pax === "" ? null : Number(r.min_pax),
        note: r.note.trim() || null,
        sort_order: i,
      }));

    if (!cleaned.length) {
      notify(t("restaurants.validation.rateRow"), "warning");
      return;
    }

    try {
      setSaving(true);
      await restaurantsService.saveRestaurantRates(
        restaurant.id,
        cleaned,
        conditions
      );
      notify(`Saved ${cleaned.length} rate rows.`);
      setTimeout(() => navigate(`/restaurant/view/${slug}`), 800);
    } catch (err) {
      console.error("Error saving rates:", err);
      notify(t("common.saveFailed", { message: err.message }), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
          <p className="mt-4 text-gray-500">{t("rates.loading")}</p>
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
          <ArrowLeft size={14} /> {t("restaurants.back")}
        </Link>
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-12 text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t("restaurants.notFound")}
          </h2>
          <button
            onClick={load}
            className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700"
          >
            {t("common.retry")}
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
            to={`/restaurant/view/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-700 mb-2"
          >
            <ArrowLeft size={16} /> {t("common.backTo", { name: restaurant.name })}
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">{t("restaurants.editRates")}</h1>
          <p className="text-sm text-gray-500">{restaurant.name}</p>
        </div>
      </div>

      {/* Rate rows */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4 md:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Rates{" "}
            <span className="text-gray-400 font-normal">
              ({rows.length} rows · THB)
            </span>
          </h2>
          <button
            onClick={() => addRow()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100"
          >
            <Plus size={16} /> {t("rates.addRow")}
          </button>
        </div>

        <datalist id="restaurant-menu-names">
          {menuNames.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="px-2 py-2 font-medium min-w-[180px]">{t("restaurants.menu")}</th>
                <th className="px-2 py-2 font-medium min-w-[190px]">{t("common.periodLabel")}</th>
                <th className="px-2 py-2 font-medium">{t("common.start")}</th>
                <th className="px-2 py-2 font-medium">{t("common.end")}</th>
                <th className="px-2 py-2 font-medium text-right">{t("common.price")}</th>
                <th className="px-2 py-2 font-medium">{t("restaurants.unit")}</th>
                <th className="px-2 py-2 font-medium text-right">{t("restaurants.minPax")}</th>
                <th className="px-2 py-2 font-medium min-w-[160px]">{t("common.note")}</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._key} className="align-top">
                  <td className="px-2 py-1.5">
                    <input
                      value={r.menu_name}
                      onChange={(e) => updateRow(r._key, "menu_name", e.target.value)}
                      list="restaurant-menu-names"
                      placeholder={t("restaurants.rateMenuPlaceholder")}
                      className={cellClass}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      value={r.period_label}
                      onChange={(e) =>
                        updateRow(r._key, "period_label", e.target.value)
                      }
                      placeholder="01 Nov 25 – 25 Dec 25"
                      className={cellClass}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="date"
                      value={r.period_start}
                      onChange={(e) =>
                        updateRow(r._key, "period_start", e.target.value)
                      }
                      className="px-2 py-1.5 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="date"
                      value={r.period_end}
                      onChange={(e) =>
                        updateRow(r._key, "period_end", e.target.value)
                      }
                      className="px-2 py-1.5 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={r.price}
                      onChange={(e) => updateRow(r._key, "price", e.target.value)}
                      placeholder="0"
                      className="w-24 px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-right"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      value={r.price_unit}
                      onChange={(e) =>
                        updateRow(r._key, "price_unit", e.target.value)
                      }
                      className="px-2 py-1.5 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none bg-white"
                    >
                      {PRICE_UNITS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={r.min_pax}
                      onChange={(e) => updateRow(r._key, "min_pax", e.target.value)}
                      placeholder="—"
                      className="w-20 px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-right"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      value={r.note}
                      onChange={(e) => updateRow(r._key, "note", e.target.value)}
                      placeholder={t("restaurants.rateNotePlaceholder")}
                      className={cellClass}
                    />
                  </td>
                  <td className="px-1 py-1.5 whitespace-nowrap">
                    <button
                      onClick={() => addRow(r._key)}
                      title={t("rates.addBelow")}
                      className="p-1.5 text-gray-400 hover:text-brand-600"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => duplicateRow(r._key)}
                      title={t("rates.duplicate")}
                      className="p-1.5 text-gray-400 hover:text-brand-600"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      onClick={() => removeRow(r._key)}
                      title={t("rates.deleteRow")}
                      className="p-1.5 text-gray-400 hover:text-danger-600"
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
        <h2 className="text-lg font-semibold text-gray-900">{t("common.rateConditions")}</h2>
        {[
          [
            "rate_validity",
            t("common.validityMarket"),
            t("rates.validityPlaceholder"),
          ],
          [
            "rate_terms",
            t("common.termsConditions"),
            t("rates.termsPlaceholder"),
          ],
        ].map(([field, label, ph]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {label}
            </label>
            <textarea
              rows={field === "rate_terms" ? 5 : 3}
              value={conditions[field]}
              onChange={(e) =>
                setConditions((c) => ({ ...c, [field]: e.target.value }))
              }
              placeholder={ph}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none text-sm leading-relaxed"
            />
          </div>
        ))}
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-gray-200 px-4 py-3 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-end gap-3">
          <Link
            to={`/restaurant/view/${slug}`}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-medium hover:bg-gray-50"
          >
            {t("common.cancel")}
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-60"
          >
            <Save size={18} />
            {saving ? t("common.saving") : t("rates.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
