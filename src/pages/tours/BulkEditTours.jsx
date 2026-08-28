import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  ChevronDown,
  MapPin,
  CalendarDays,
  Ticket,
  StickyNote,
  AlertTriangle,
  Pencil,
  Building2,
} from "lucide-react";
import { AutocompleteInput, ProvincePicker } from "../../components/common";
import { Toast } from "../../components/core";
import { COMMON_PROVINCES } from "../../utils/provinces";
import { TOUR_TYPES } from "../../utils/tour-types";
import { toursService, suppliersService } from "../../services/api-service";
import { useI18n } from "../../i18n";

// Shared grid template so the header and every row stay aligned
const ROW_GRID =
  "grid grid-cols-[36px_28px_minmax(0,1fr)_150px_92px_92px_76px] gap-2 items-center";

// Fields compared to decide whether a row needs a PUT
const EDITABLE_FIELDS = [
  "tour_name",
  "tour_type",
  "departure_from",
  "destination",
  "pier",
  "adult_price",
  "child_price",
  "start_date",
  "end_date",
  "no_end_date",
  "notes",
  "park_fee_included",
  "park_fee_adult",
  "park_fee_child",
  "map_url",
];

// Normalize an API tour into the shape the form edits
const toFormRow = (tourData) => {
  const hasNoEndDate =
    !tourData.end_date || tourData.end_date === "0000-00-00";

  return {
    id: tourData.id,
    tour_name: tourData.tour_name || "",
    tour_type: tourData.tour_type || "one_day_trip",
    departure_from: tourData.departure_from || "",
    destination: tourData.destination || "",
    pier: tourData.pier || "",
    adult_price: tourData.adult_price
      ? parseFloat(tourData.adult_price).toString()
      : "",
    child_price: tourData.child_price
      ? parseFloat(tourData.child_price).toString()
      : "",
    start_date: tourData.start_date || "",
    end_date: hasNoEndDate ? "" : tourData.end_date || "",
    no_end_date: hasNoEndDate,
    notes: tourData.notes || "",
    park_fee_included: !!Number(tourData.park_fee_included),
    park_fee_adult:
      tourData.park_fee_adult != null && tourData.park_fee_adult !== ""
        ? parseFloat(tourData.park_fee_adult).toString()
        : "",
    park_fee_child:
      tourData.park_fee_child != null && tourData.park_fee_child !== ""
        ? parseFloat(tourData.park_fee_child).toString()
        : "",
    map_url: tourData.map_url || "",
  };
};

const isExpired = (row) => {
  if (row.no_end_date || !row.end_date) return false;
  const end = new Date(row.end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return end < today;
};

const BulkEditTours = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { supplierId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [toast, setToast] = useState(null);

  const [supplier, setSupplier] = useState(null);
  // Pristine copies keyed by tour id, used for dirty detection
  const [original, setOriginal] = useState({});
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetchData();
  }, [supplierId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setLoadError(null);

      const [supplierData, allTours] = await Promise.all([
        suppliersService.getSupplierById(supplierId),
        toursService.getAllTours(),
      ]);

      if (!supplierData) {
        setLoadError("notfound");
        return;
      }
      setSupplier(supplierData);

      // Expired tours are included on purpose: bumping their dates is the
      // main reason to open this page.
      const supplierTours = allTours
        .filter((t) => Number(t.supplier_id) === Number(supplierId))
        .map(toFormRow);

      setRows(supplierTours);
      setOriginal(
        Object.fromEntries(supplierTours.map((row) => [row.id, { ...row }])),
      );
      setSelected([]);
      setErrors({});
    } catch (error) {
      console.error("Error loading bulk edit data:", error);
      const message = error?.message || t("tour.loadError");
      setLoadError(/not found/i.test(message) ? "notfound" : message);
    } finally {
      setLoading(false);
    }
  };

  const isRowDirty = useCallback(
    (row) => {
      const base = original[row.id];
      if (!base) return true;
      return EDITABLE_FIELDS.some((field) => row[field] !== base[field]);
    },
    [original],
  );

  const dirtyRows = useMemo(
    () => rows.filter(isRowDirty),
    [rows, isRowDirty],
  );

  // Warn before losing unsaved edits on a reload or tab close
  useEffect(() => {
    if (dirtyRows.length === 0) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirtyRows.length]);

  const updateRow = (rowId, field, value) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );

    if (errors[rowId]?.[field]) {
      setErrors((prev) => ({
        ...prev,
        [rowId]: { ...prev[rowId], [field]: null },
      }));
    }
  };

  const handleNoEndDateToggle = (rowId, checked) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        if (checked) return { ...row, no_end_date: true, end_date: "" };

        // Restore the original end date when available, otherwise a year out
        const base = original[rowId];
        if (base?.end_date) {
          return { ...row, no_end_date: false, end_date: base.end_date };
        }
        const start = row.start_date ? new Date(row.start_date) : new Date();
        const fallback = new Date(start);
        fallback.setFullYear(start.getFullYear() + 1);
        return {
          ...row,
          no_end_date: false,
          end_date: fallback.toISOString().split("T")[0],
        };
      }),
    );
  };

  const toggleExpand = (rowId) => {
    setExpanded((prev) => ({ ...prev, [rowId]: !prev[rowId] }));
  };

  const toggleSelect = (rowId) => {
    setSelected((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId],
    );
  };

  const toggleSelectAll = () => {
    setSelected((prev) => (prev.length === rows.length ? [] : rows.map((r) => r.id)));
  };

  const selectExpired = () => {
    setSelected(rows.filter(isExpired).map((r) => r.id));
  };

  const detailCount = (row) => {
    let n = 0;
    if (row.departure_from) n++;
    if (row.pier) n++;
    if (row.destination) n++;
    if (row.map_url) n++;
    if (row.notes) n++;
    if (row.park_fee_adult || row.park_fee_child) n++;
    return n;
  };

  const validateRows = (rowsToCheck) => {
    const allErrors = {};

    rowsToCheck.forEach((row) => {
      const rowErrors = {};

      if (!row.tour_name.trim()) {
        rowErrors.tour_name = t("tour.validation.nameRequired");
      }
      if (!row.tour_type) {
        rowErrors.tour_type = t("tour.validation.typeRequired");
      }
      if (!row.no_end_date && row.start_date && row.end_date) {
        if (new Date(row.end_date) <= new Date(row.start_date)) {
          rowErrors.end_date = t("tour.validation.endAfterStart");
        }
      }

      if (Object.keys(rowErrors).length > 0) allErrors[row.id] = rowErrors;
    });

    setErrors(allErrors);

    // Open detail panels for rows whose error lives inside the panel
    const toOpen = {};
    Object.entries(allErrors).forEach(([id, errs]) => {
      if (errs.end_date) toOpen[id] = true;
    });
    if (Object.keys(toOpen).length > 0) {
      setExpanded((prev) => ({ ...prev, ...toOpen }));
    }

    return Object.keys(allErrors).length === 0;
  };

  const handleSaveAll = async () => {
    if (dirtyRows.length === 0) return;

    if (!validateRows(dirtyRows)) {
      setToast({
        message: t("tour.bulk.fixFields"),
        type: "error",
      });
      return;
    }

    setSaving(true);
    const failed = [];

    for (const row of dirtyRows) {
      const payload = {
        tour_name: row.tour_name,
        tour_type: row.tour_type,
        departure_from: row.departure_from,
        destination: row.destination,
        pier: row.pier,
        supplier_id: Number(supplierId),
        adult_price: parseFloat(row.adult_price) || 0,
        child_price: parseFloat(row.child_price) || 0,
        start_date: row.start_date,
        end_date: row.no_end_date ? null : row.end_date,
        notes: row.notes,
        park_fee_included: row.park_fee_included,
        // Keep empty string so the backend stores NULL instead of 0
        park_fee_adult:
          row.park_fee_adult === "" ? "" : parseFloat(row.park_fee_adult) || 0,
        park_fee_child:
          row.park_fee_child === "" ? "" : parseFloat(row.park_fee_child) || 0,
        map_url: row.map_url,
      };

      try {
        await toursService.updateTour(row.id, payload);
        setOriginal((prev) => ({ ...prev, [row.id]: { ...row } }));
      } catch (error) {
        console.error("Failed to update tour", row.id, error);
        failed.push(row.tour_name || `#${row.id}`);
      }
    }

    setSaving(false);

    if (failed.length === 0) {
      setToast({
        message: `Saved ${dirtyRows.length} tour${dirtyRows.length > 1 ? "s" : ""}`,
        type: "success",
      });
    } else {
      setToast({
        message: t("tour.bulk.saveFailed", { items: failed.join(", ") }),
        type: "error",
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;

    const names = rows
      .filter((row) => selected.includes(row.id))
      .map((row) => row.tour_name || `#${row.id}`);

    const confirmed = window.confirm(
      `Delete ${selected.length} tour${selected.length > 1 ? "s" : ""}?\n\n` +
        `${names.join("\n")}\n\nThis deletion cannot be undone.`,
    );
    if (!confirmed) return;

    setSaving(true);
    const failed = [];
    const deleted = [];

    for (const rowId of selected) {
      try {
        await toursService.deleteTour(rowId);
        deleted.push(rowId);
      } catch (error) {
        console.error("Failed to delete tour", rowId, error);
        const row = rows.find((r) => r.id === rowId);
        failed.push(row?.tour_name || `#${rowId}`);
      }
    }

    setRows((prev) => prev.filter((row) => !deleted.includes(row.id)));
    setOriginal((prev) => {
      const next = { ...prev };
      deleted.forEach((rowId) => delete next[rowId]);
      return next;
    });
    setSelected(failed.length > 0 ? selected.filter((id) => !deleted.includes(id)) : []);
    setSaving(false);

    if (failed.length === 0) {
      setToast({
        message: `Deleted ${deleted.length} tour${deleted.length > 1 ? "s" : ""}`,
        type: "success",
      });
    } else {
      setToast({
        message: t("tour.bulk.deleteFailed", { items: failed.join(", ") }),
        type: "error",
      });
    }
  };

  const handleBack = () => {
    if (
      dirtyRows.length > 0 &&
      !window.confirm(t("tour.unsavedConfirm"))
    ) {
      return;
    }
    navigate(`/suppliers/${supplierId}`);
  };

  const hasFieldError = (rowId, field) => !!errors[rowId]?.[field];

  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const sectionHead =
    "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide mb-2";
  const sectionCard =
    "bg-white rounded-lg border border-gray-200 border-l-4 p-3 grid grid-cols-1 gap-x-4 gap-y-3";
  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500";
  const cellInput =
    "w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-brand-500 focus:border-brand-500";

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-40 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-gray-700">
          {loadError === "notfound"
            ? t("suppliers.notFound")
            : loadError}
        </p>
        <button
          onClick={() => navigate("/suppliers")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("common.backTo", { name: t("suppliers.title") })}
        </button>
      </div>
    );
  }

  const expiredCount = rows.filter(isExpired).length;
  const allSelected = rows.length > 0 && selected.length === rows.length;

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.backTo", { name: t("suppliers.title") })}
          </button>
          <h1 className="text-xl font-semibold text-gray-900 truncate">
            Edit tour prices
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="truncate">{supplier?.name}</span>
            <span className="text-gray-300">·</span>
            <span>
              {rows.length} tour{rows.length === 1 ? "" : "s"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selected.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white bg-danger-600 hover:bg-danger-700 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete selected ({selected.length})
            </button>
          )}
          <button
            onClick={handleSaveAll}
            disabled={saving || dirtyRows.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Working...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {dirtyRows.length > 0
                  ? `Save changes (${dirtyRows.length})`
                  : t("tour.bulk.noChanges")}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expired tours hint */}
      {expiredCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-danger-50 px-4 py-3 ring-1 ring-danger-200 text-sm text-danger-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{t("tour.bulk.expiredCount", { count: expiredCount })}</span>
          <button
            onClick={selectExpired}
            className="underline underline-offset-2 hover:no-underline font-medium"
          >
            {t("tour.bulk.selectExpired")}
          </button>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center">
          <p className="font-medium text-gray-500">
            {t("tour.bulk.noTours")}
          </p>
          <Link
            to={`/add?supplier=${supplierId}`}
            className="inline-block mt-3 text-sm text-brand-600 hover:underline"
          >
            {t("tour.bulk.addTour")}
          </Link>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {/* Header */}
          <div
            className={`${ROW_GRID} px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500`}
          >
            <span className="flex justify-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                aria-label={t("tour.bulk.selectAll")}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
            </span>
            <span className="text-center">#</span>
            <span>{t("tour.field.name")}</span>
            <span>{t("tour.field.type")}</span>
            <span>{t("tour.adult")} ฿</span>
            <span>{t("tour.child")} ฿</span>
            <span className="text-center">{t("tour.field.edit")}</span>
          </div>

          {/* Rows */}
          {rows.map((row, index) => {
            const dirty = isRowDirty(row);
            const expired = isExpired(row);

            return (
              <div
                key={row.id}
                className="border-b border-gray-100 last:border-0"
              >
                <div
                  className={`${ROW_GRID} px-3 py-2 hover:bg-gray-50/60 ${
                    selected.includes(row.id) ? "bg-danger-50/40" : ""
                  }`}
                >
                  <span className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      aria-label={`Select ${row.tour_name}`}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                  </span>

                  <span className="text-center text-sm text-gray-400 relative">
                    {index + 1}
                    {dirty && (
                      <span
                        className="absolute -right-0.5 top-0 w-1.5 h-1.5 bg-brand-600 rounded-full"
                        title={t("tour.bulk.unsaved")}
                      />
                    )}
                  </span>

                  <div className="min-w-0">
                    <input
                      type="text"
                      value={row.tour_name}
                      onChange={(e) =>
                        updateRow(row.id, "tour_name", e.target.value)
                      }
                      placeholder={t("tour.placeholder.name")}
                      className={`${cellInput} ${
                        hasFieldError(row.id, "tour_name")
                          ? "border-danger-500 ring-1 ring-danger-500"
                          : ""
                      }`}
                    />
                    {expired && (
                      <span className="inline-block mt-1 text-[11px] font-medium text-danger-700 bg-danger-50 border border-danger-200 rounded px-1.5 py-0.5">
                        {t("common.expired")} {row.end_date}
                      </span>
                    )}
                  </div>

                  <select
                    value={row.tour_type}
                    onChange={(e) =>
                      updateRow(row.id, "tour_type", e.target.value)
                    }
                    className={`${cellInput} ${
                      hasFieldError(row.id, "tour_type")
                        ? "border-danger-500 ring-1 ring-danger-500"
                        : ""
                    }`}
                  >
                    <option value="">{t("tour.selectType")} *</option>
                    {TOUR_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(`tour.option.${option.value}`)}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={row.adult_price}
                    onChange={(e) =>
                      updateRow(row.id, "adult_price", e.target.value)
                    }
                    min="0"
                    placeholder="0"
                    className={`${cellInput} text-right`}
                  />

                  <input
                    type="number"
                    value={row.child_price}
                    onChange={(e) =>
                      updateRow(row.id, "child_price", e.target.value)
                    }
                    min="0"
                    placeholder="0"
                    className={`${cellInput} text-right`}
                  />

                  <div className="flex items-center justify-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => toggleExpand(row.id)}
                      className="relative p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      title={t("tour.action.moreDetails")}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expanded[row.id] ? "rotate-180" : ""
                        }`}
                      />
                      {!expanded[row.id] && detailCount(row) > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-brand-600 rounded-full" />
                      )}
                    </button>
                    <Link
                      to={`/edit/${row.id}`}
                      title={t("tour.bulk.fullEdit")}
                      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Detail panel */}
                {expanded[row.id] && (
                  <div className="px-4 py-4 bg-gray-50 border-t border-gray-100 space-y-5">
                    {/* Route & pickup */}
                    <section>
                      <h5 className={`${sectionHead} text-brand-600`}>
                        <MapPin className="w-3.5 h-3.5" /> {t("tour.routePickup")}
                      </h5>
                      <div
                        className={`${sectionCard} border-l-brand-500 md:grid-cols-2`}
                      >
                        <div>
                          <label className={labelClass}>
                            {t("tour.field.departureFrom")}{" "}
                            <span className="font-normal text-gray-400">
                              — {t("tour.multipleAllowed")}
                            </span>
                          </label>
                          <ProvincePicker
                            multiple
                            quickPicks={COMMON_PROVINCES}
                            value={
                              row.departure_from
                                ? row.departure_from
                                    .split(",")
                                    .map((s) => s.trim())
                                    .filter(Boolean)
                                : []
                            }
                            onChange={(arr) =>
                              updateRow(
                                row.id,
                                "departure_from",
                                arr.join(", "),
                              )
                            }
                            placeholder={t("tour.placeholder.province")}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            {t("tour.field.destination")}{" "}
                            <span className="font-normal text-gray-400">
                              — {t("tour.oneProvince")}
                            </span>
                          </label>
                          <ProvincePicker
                            quickPicks={COMMON_PROVINCES}
                            value={row.destination || ""}
                            onChange={(val) =>
                              updateRow(row.id, "destination", val || "")
                            }
                            placeholder={t("tour.placeholder.province")}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>{t("tour.field.pier")}</label>
                          <AutocompleteInput
                            type="pier"
                            value={row.pier}
                            onChange={(value) =>
                              updateRow(row.id, "pier", value)
                            }
                            placeholder={t("tour.placeholder.pier")}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>{t("tour.field.mapUrl")}</label>
                          <input
                            type="url"
                            value={row.map_url}
                            onChange={(e) =>
                              updateRow(row.id, "map_url", e.target.value)
                            }
                            className={inputClass}
                            placeholder="https://maps.app.goo.gl/..."
                          />
                        </div>
                      </div>
                    </section>

                    {/* Schedule */}
                    <section>
                      <h5 className={`${sectionHead} text-brand-600`}>
                        <CalendarDays className="w-3.5 h-3.5" /> Schedule
                      </h5>
                      <div
                        className={`${sectionCard} border-l-brand-500 md:grid-cols-2`}
                      >
                        <div>
                          <label className={labelClass}>{t("tour.field.startDate")}</label>
                          <input
                            type="date"
                            value={row.start_date}
                            onChange={(e) =>
                              updateRow(row.id, "start_date", e.target.value)
                            }
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                              End date
                            </label>
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={row.no_end_date}
                                onChange={(e) =>
                                  handleNoEndDateToggle(
                                    row.id,
                                    e.target.checked,
                                  )
                                }
                                className="rounded border-gray-300 text-warning-600 focus:ring-warning-500"
                              />
                              <span className="ml-1.5 text-xs text-warning-700">
                                No end date
                              </span>
                            </label>
                          </div>
                          {!row.no_end_date ? (
                            <input
                              type="date"
                              value={row.end_date}
                              onChange={(e) =>
                                updateRow(row.id, "end_date", e.target.value)
                              }
                              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                                hasFieldError(row.id, "end_date")
                                  ? "border-danger-500"
                                  : "border-gray-300"
                              }`}
                            />
                          ) : (
                            <input
                              type="text"
                              value="Not specified"
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-warning-50 text-warning-700 cursor-not-allowed"
                            />
                          )}
                          {hasFieldError(row.id, "end_date") && (
                            <p className="text-danger-600 text-xs mt-1">
                              {errors[row.id].end_date}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* Park fee */}
                    <section>
                      <h5 className={`${sectionHead} text-warning-600`}>
                        <Ticket className="w-3.5 h-3.5" /> Park fee
                      </h5>
                      <div
                        className={`${sectionCard} border-l-warning-500 md:grid-cols-3 md:items-end`}
                      >
                        <div>
                          <label className={labelClass}>
                            Park fee{" "}
                            <span className="font-normal text-gray-400">
                              / adult ฿
                            </span>
                          </label>
                          <input
                            type="number"
                            value={row.park_fee_adult}
                            onChange={(e) =>
                              updateRow(
                                row.id,
                                "park_fee_adult",
                                e.target.value,
                              )
                            }
                            min="0"
                            placeholder="0"
                            className={`${inputClass} text-right`}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            Park fee{" "}
                            <span className="font-normal text-gray-400">
                              / child ฿
                            </span>
                          </label>
                          <input
                            type="number"
                            value={row.park_fee_child}
                            onChange={(e) =>
                              updateRow(
                                row.id,
                                "park_fee_child",
                                e.target.value,
                              )
                            }
                            min="0"
                            placeholder="0"
                            className={`${inputClass} text-right`}
                          />
                        </div>

                        <div className="flex items-center md:pb-2">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={row.park_fee_included}
                              onChange={(e) =>
                                updateRow(
                                  row.id,
                                  "park_fee_included",
                                  e.target.checked,
                                )
                              }
                              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Net price includes park fee
                            </span>
                          </label>
                        </div>
                      </div>
                    </section>

                    {/* Notes */}
                    <section>
                      <h5 className={`${sectionHead} text-gray-500`}>
                        <StickyNote className="w-3.5 h-3.5" /> Notes
                      </h5>
                      <div className={`${sectionCard} border-l-gray-300`}>
                        <label className="sr-only">
                          Notes specific to this tour
                        </label>
                        <textarea
                          value={row.notes}
                          onChange={(e) =>
                            updateRow(row.id, "notes", e.target.value)
                          }
                          rows={2}
                          className={inputClass}
                          placeholder={t("tour.placeholder.notes")}
                        />
                      </div>
                    </section>

                    <p className="text-xs text-gray-400">
                      Files and gallery are edited on the tour&apos;s own page.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default BulkEditTours;
