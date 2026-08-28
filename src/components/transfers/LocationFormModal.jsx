import { useState } from "react";
import { transfersService } from "../../services/api-service";
import { useI18n } from "../../i18n";
import { PROVINCES } from "./constants";
import { Field, ModalShell, inputClass } from "./formUi";

const EMPTY = { name: "", province: "Phuket", sort_order: 0, is_active: true };

/**
 * Create/edit a pickup or dropoff point. `province` is this system's addition to
 * the shared transfer schema: it is what puts a route under a province in the
 * sidebar, so a location filed under the wrong one disappears from that menu.
 */
const LocationFormModal = ({ location, onClose, onSaved }) => {
  const { t } = useI18n();
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
      setError(t("transfers.locationNameRequired"));
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
      title={isEdit ? t("transfers.location.edit") : t("transfers.location.add")}
      subtitle={t("transfers.location.subtitle")}
      formId="transferLocationForm"
      onSubmit={submit}
      onClose={onClose}
      saving={saving}
      error={error}
      saveLabel={t("common.save")}
      width="max-w-md"
    >
      <Field label={t("common.name")} required>
        <input
          className={inputClass}
          value={form.name}
          onChange={set("name")}
          placeholder={t("transfers.locationPlaceholder")}
          autoFocus
        />
      </Field>

      <Field label={t("common.province")}>
        <select className={inputClass} value={form.province} onChange={set("province")}>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>

      <Field label={t("common.sort")}>
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
          <span className="text-sm font-medium text-gray-700">{t("common.active")}</span>
          <p className="text-xs text-gray-400">{t("transfers.location.activeHint")}</p>
        </div>
      </label>
    </ModalShell>
  );
};

export default LocationFormModal;
