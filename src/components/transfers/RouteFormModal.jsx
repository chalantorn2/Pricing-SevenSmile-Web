import { useMemo, useState } from "react";
import { transfersService } from "../../services/api-service";
import { ROUTE_CATEGORIES } from "./constants";
import { Field, ModalShell, inputClass } from "./formUi";

/**
 * Create/edit one row of the rate matrix: a pair of locations, the section of the
 * rate sheet it belongs to, and a price per vehicle.
 *
 * The route itself is shared by every supplier — the same journey however it is
 * sold — so the prices edited here belong to `supplier` alone and saving leaves
 * every other supplier's rates on the route untouched.
 *
 * Prices are edited as a whole set and saved as a whole set — clearing a cell
 * removes that vehicle's price rather than storing a zero, which would read as
 * "free" instead of "not offered".
 */
const RouteFormModal = ({
  route,
  locations,
  vehicles,
  supplier,
  defaultCategory,
  onClose,
  onSaved,
}) => {
  const isEdit = Boolean(route?.id);

  // Inactive locations stay selectable while they are still on a saved route, so
  // editing an old route does not silently drop one end of it.
  const selectableLocations = useMemo(() => {
    const keep = new Set([route?.origin_id, route?.destination_id].filter(Boolean));
    return locations.filter((l) => Number(l.is_active) === 1 || keep.has(l.id));
  }, [locations, route]);

  const priceableVehicles = useMemo(() => {
    const priced = new Set((route?.prices || []).map((p) => p.vehicle_id));
    return vehicles.filter((v) => Number(v.is_active) === 1 || priced.has(v.id));
  }, [vehicles, route]);

  const [form, setForm] = useState(() => ({
    origin_id: route?.origin_id ? String(route.origin_id) : "",
    destination_id: route?.destination_id ? String(route.destination_id) : "",
    category: route?.category || defaultCategory || "transfer",
    label: route?.label || "",
    note: route?.note || "",
    sort_order: route?.sort_order ?? 0,
    is_active: route?.id ? Number(route.is_active) === 1 : true,
  }));

  // { [vehicleId]: "1350" } — kept as strings so a half-typed number is not fought
  // with by the input on every keystroke.
  const [prices, setPrices] = useState(() => {
    const map = {};
    (route?.prices || []).forEach((p) => {
      map[p.vehicle_id] = String(p.price);
    });
    return map;
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const nameOf = (id) => locations.find((l) => String(l.id) === String(id))?.name || "";
  const derivedLabel =
    form.origin_id && form.destination_id
      ? `${nameOf(form.origin_id)} to ${nameOf(form.destination_id)}`
      : "";

  const submit = async (e) => {
    e.preventDefault();
    const origin = Number(form.origin_id);
    const destination = Number(form.destination_id);
    if (!origin || !destination) {
      setError("Pick both an origin and a destination");
      return;
    }
    if (origin === destination) {
      setError("Origin and destination must be different");
      return;
    }

    const priceList = Object.entries(prices)
      .map(([vehicleId, value]) => ({
        vehicle_id: Number(vehicleId),
        price: parseFloat(value),
      }))
      .filter((p) => Number.isFinite(p.price) && p.price > 0);

    if (!supplier?.id) {
      setError("Pick a supplier before saving prices");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        origin_id: origin,
        destination_id: destination,
        category: form.category,
        label: form.label.trim() || derivedLabel,
        note: form.note.trim(),
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
        supplier_id: supplier.id,
        prices: priceList,
      };
      if (isEdit) {
        await transfersService.updateTransferItem("routes", route.id, payload);
      } else {
        await transfersService.createTransferItem("routes", payload);
      }
      await onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title={isEdit ? "Edit Route" : "Add Route"}
      subtitle={
        supplier
          ? `One origin, one destination, and ${supplier.name}'s price per vehicle`
          : "One origin, one destination, and a price per vehicle"
      }
      formId="transferRouteForm"
      onSubmit={submit}
      onClose={onClose}
      saving={saving}
      error={error}
      saveLabel="Save Route"
      width="max-w-2xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Origin" required>
          <select className={inputClass} value={form.origin_id} onChange={set("origin_id")}>
            <option value="">Select a location…</option>
            {selectableLocations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} — {l.province}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Destination" required>
          <select
            className={inputClass}
            value={form.destination_id}
            onChange={set("destination_id")}
          >
            <option value="">Select a location…</option>
            {selectableLocations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} — {l.province}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Category" hint="the section of the rate sheet this came from">
        <select className={inputClass} value={form.category} onChange={set("category")}>
          {ROUTE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Label" hint="how the supplier words it — leave blank to use the route">
        <input
          className={inputClass}
          value={form.label}
          onChange={set("label")}
          placeholder={derivedLabel || "e.g. Krabi / Krabi Airport (3 hrs)"}
        />
      </Field>

      <Field
        label={supplier ? `Prices — ${supplier.name}` : "Prices"}
        hint="blank means this supplier does not offer the vehicle on this route; other suppliers' rates are not touched"
      >
        {priceableVehicles.length === 0 ? (
          <p className="p-4 text-center text-sm text-gray-400 border border-gray-200 rounded-lg">
            No vehicles yet. Add one on the Vehicles tab first.
          </p>
        ) : (
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
            {priceableVehicles.map((v) => (
              <div key={v.id} className="flex items-center gap-4 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{v.name}</div>
                  <div className="text-xs text-gray-400">
                    up to {v.max_passengers} pax · {v.max_luggage} bags
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  value={prices[v.id] ?? ""}
                  onChange={(e) =>
                    setPrices((p) => ({ ...p, [v.id]: e.target.value }))
                  }
                  placeholder="—"
                  className="w-32 px-3 py-2 text-sm text-right tabular-nums border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                <span className="text-xs text-gray-400 w-8">THB</span>
              </div>
            ))}
          </div>
        )}
      </Field>

      <Field label="Note">
        <input
          className={inputClass}
          value={form.note}
          onChange={set("note")}
          placeholder="e.g. price on request, night surcharge applies"
        />
      </Field>

      <Field label="Sort order" hint="lower shows first within its category">
        <input
          type="number"
          className={inputClass}
          value={form.sort_order}
          onChange={set("sort_order")}
        />
      </Field>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={set("is_active")}
          className="w-4 h-4 accent-brand-600"
        />
        <div>
          <span className="text-sm font-medium text-gray-700">Active</span>
          <p className="text-xs text-gray-400">Currently sold</p>
        </div>
      </label>
    </ModalShell>
  );
};

export default RouteFormModal;
