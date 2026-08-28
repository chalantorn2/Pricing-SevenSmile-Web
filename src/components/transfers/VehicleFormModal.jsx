import { useState } from "react";
import { transfersService } from "../../services/api-service";
import { Field, ModalShell, inputClass } from "./formUi";

const EMPTY = {
  name: "",
  max_passengers: 1,
  max_luggage: 2,
  description: "",
  image_url: "",
  sort_order: 0,
  is_active: true,
};

/**
 * Create/edit a vehicle type. Vehicles are the price columns of the rate matrix,
 * so adding one here adds a column to every route in the Routes tab — it does not
 * price anything on its own.
 */
const VehicleFormModal = ({ vehicle, onClose, onSaved }) => {
  const isEdit = Boolean(vehicle?.id);
  const [form, setForm] = useState(() =>
    vehicle?.id
      ? {
          name: vehicle.name || "",
          max_passengers: vehicle.max_passengers ?? 1,
          max_luggage: vehicle.max_luggage ?? 0,
          description: vehicle.description || "",
          image_url: vehicle.image_url || "",
          sort_order: vehicle.sort_order ?? 0,
          is_active: Number(vehicle.is_active) === 1,
        }
      : EMPTY
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const data = await transfersService.uploadTransferImage(file);
      if (data?.url) setForm((f) => ({ ...f, image_url: data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Vehicle name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        max_passengers: Number(form.max_passengers) || 1,
        max_luggage: Number(form.max_luggage) || 0,
        description: form.description.trim(),
        image_url: form.image_url || null,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      };
      if (isEdit) {
        await transfersService.updateTransferItem("vehicles", vehicle.id, payload);
      } else {
        await transfersService.createTransferItem("vehicles", payload);
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
      title={isEdit ? "Edit Vehicle" : "Add Vehicle"}
      subtitle="Vehicle types are the price columns on every route"
      formId="transferVehicleForm"
      onSubmit={submit}
      onClose={onClose}
      saving={saving}
      error={error}
      saveLabel="Save Vehicle"
    >
      <Field label="Name" required>
        <input
          className={inputClass}
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Toyota Commuter Van"
          autoFocus
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Max passengers">
          <input
            type="number"
            min="1"
            className={inputClass}
            value={form.max_passengers}
            onChange={set("max_passengers")}
          />
        </Field>
        <Field label="Max luggage">
          <input
            type="number"
            min="0"
            className={inputClass}
            value={form.max_luggage}
            onChange={set("max_luggage")}
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          rows={2}
          className={`${inputClass} resize-y`}
          value={form.description}
          onChange={set("description")}
          placeholder="Short note about the vehicle"
        />
      </Field>

      <Field label="Photo">
        {form.image_url ? (
          <div className="relative inline-block">
            <img
              src={form.image_url}
              alt=""
              className="max-h-28 rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
              aria-label="Remove photo"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger-600 text-white text-sm leading-none"
            >
              &times;
            </button>
          </div>
        ) : (
          <label className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:border-brand-200 hover:bg-brand-50/40 transition">
            <span className="text-sm text-gray-500">
              {uploading ? "Uploading…" : "Click to upload an image"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onPickImage}
            />
          </label>
        )}
      </Field>

      <Field label="Sort order" hint="sets the column order in the rate table">
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
          <p className="text-xs text-gray-400">Priceable when editing a route</p>
        </div>
      </label>
    </ModalShell>
  );
};

export default VehicleFormModal;
