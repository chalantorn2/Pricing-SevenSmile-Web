import { useState } from "react";
import { transfersService } from "../../services/api-service";
import { PROVINCES } from "./constants";
import { Field, ModalShell, inputClass } from "./formUi";

const EMPTY = { name: "", province: "Phuket", sort_order: 0, is_active: true };

/**
 * Create/edit a pickup or dropoff point. `province` is this system's addition to
 * the shared transfer schema: it is what puts a route under a province in the
 * sidebar, so a location filed under the wrong one disappears from that menu.
 */
const LocationFormModal = ({ location, onClose, onSaved }) => {
  const isEdit = Boolean(location?.id);
  const [form, setForm] = useState(() =>
    location?.id
      ? {
          name: location.name || "",
          province: location.province || "Phuket",
          sort_order: location.sort_order ?? 0,
          is_active: Number(location.is_active) === 1,
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Location name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        province: form.province,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      };
      if (isEdit) {
        await transfersService.updateTransferItem("locations", location.id, payload);
      } else {
        await transfersService.createTransferItem("locations", payload);
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
      title={isEdit ? "Edit Location" : "Add Location"}
      subtitle="A pickup or dropoff point used by transfer routes"
      formId="transferLocationForm"
      onSubmit={submit}
      onClose={onClose}
      saving={saving}
      error={error}
      saveLabel="Save Location"
      width="max-w-md"
    >
      <Field label="Name" required>
        <input
          className={inputClass}
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Phuket Airport (HKT)"
          autoFocus
        />
      </Field>

      <Field label="Province" hint="decides which sidebar menu the route appears in">
        <select className={inputClass} value={form.province} onChange={set("province")}>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Sort order" hint="lower shows first">
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
          <p className="text-xs text-gray-400">Offered when building a route</p>
        </div>
      </label>
    </ModalShell>
  );
};

export default LocationFormModal;
