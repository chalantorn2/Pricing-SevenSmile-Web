import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Car, MapPin, Plus } from "lucide-react";
import { transfersService } from "../../services/api-service";
import {
  LocationFormModal,
  RouteFormModal,
  ROUTE_CATEGORIES,
  VehicleFormModal,
} from "../../components/transfers";
import { ConfirmDialog, Toast } from "../../components/core";
import { useI18n } from "../../i18n";

const TABS = [
  { key: "routes", label: "transfers.tabs.routes" },
  { key: "locations", label: "transfers.tabs.locations" },
  { key: "vehicles", label: "transfers.tabs.vehicles" },
];

const money = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

const StatusPill = ({ active }) => {
  const { t } = useI18n();
  return active ? (
    <span className="badge-success">{t("common.active")}</span>
  ) : (
    <span className="badge-neutral">{t("common.inactive")}</span>
  );
};

const RowActions = ({ onEdit, onDelete }) => {
  const { t } = useI18n();
  return (
  <div className="flex justify-end gap-2">
    <button
      onClick={onEdit}
      className="btn-secondary btn-sm min-h-10"
    >
      {t("common.edit")}
    </button>
    <button
      onClick={onDelete}
      className="btn-ghost btn-sm min-h-10 text-danger-600 hover:bg-danger-50 hover:text-danger-700"
    >
      {t("common.delete")}
    </button>
  </div>
  );
};

/**
 * Transfers are priced as a matrix, not as a catalogue of vendors, so this screen
 * does not follow the list-then-detail shape hotels and restaurants use. The three
 * tabs are the three tables behind it: routes are the rates, locations and vehicles
 * are the master lists the routes are built from.
 *
 * Every supplier drives the same journeys, so the routes are shared and only the
 * money is theirs: the Routes tab is always one supplier's rate sheet, picked at
 * the top. It opens showing only the routes they actually price; unticking the
 * filter brings back the ones they do not sell, as empty rows to fill in.
 *
 * The province in the URL narrows the routes only — a route counts as belonging to
 * a province when either end of it does, so a Phuket-to-Krabi transfer shows up
 * under both. Locations, vehicles and suppliers stay complete because the route
 * form needs the full lists to pick from.
 */
const TransferList = () => {
  const { t } = useI18n();
  const { province } = useParams();
  // Quick search on the home screen lands here with ?q= — seed the filter from it.
  const [searchParams] = useSearchParams();

  const [tab, setTab] = useState("routes");
  const [data, setData] = useState({
    locations: [],
    vehicles: [],
    suppliers: [],
    routes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  // Which rate sheet is on screen. "" until the first load picks one; the fetch
  // sends it so the routes come back carrying only that supplier's prices.
  const [supplierId, setSupplierId] = useState("");
  // On by default: a sheet is mostly dashes for suppliers who only drive part of
  // the network, and the rates you already have are what you come here to read.
  // Untick to get the blank routes back and price them.
  const [onlyPriced, setOnlyPriced] = useState(true);
  // null = closed; {} = create; a record = edit. One per resource so the open
  // modal always matches the tab it was opened from.
  const [editingRoute, setEditingRoute] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await transfersService.getTransferData(
        province ? { province } : {}
      );
      const suppliers = result.suppliers || [];
      setData({
        locations: result.locations || [],
        vehicles: result.vehicles || [],
        suppliers,
        routes: result.routes || [],
      });
      // Every supplier's prices arrive together and are split apart below, so
      // switching rate sheets costs nothing. Open on whoever prices the most
      // routes: the sheet most likely to be the one being worked on.
      setSupplierId((current) =>
        current && suppliers.some((s) => String(s.id) === current)
          ? current
          : suppliers.length > 0
          ? String(suppliers[0].id)
          : ""
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [province]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await transfersService.deleteTransferItem(deleteTarget.resource, deleteTarget.id);
      setDeleteTarget(null);
      setToast({ type: "success", message: t("transfers.deleteSuccess") });
      await load();
    } catch (err) {
      setToast({ type: "error", message: err.message || t("common.deleteError") });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const term = search.trim().toLowerCase();

  const supplier = useMemo(
    () => data.suppliers.find((s) => String(s.id) === supplierId) || null,
    [data.suppliers, supplierId]
  );

  // The rate sheet on screen: every route, but only the selected supplier's prices
  // on it. A route with nothing left is one this supplier does not sell — it stays
  // visible so the blank cells can be filled in.
  const sheetRoutes = useMemo(
    () =>
      data.routes.map((r) => ({
        ...r,
        prices: (r.prices || []).filter(
          (p) => String(p.supplier_id) === supplierId
        ),
      })),
    [data.routes, supplierId]
  );

  // Columns of the rate table: active vehicles, plus any inactive one still
  // carrying a price so a retired vehicle's rates do not vanish from view.
  const priceColumns = useMemo(() => {
    const priced = new Set();
    sheetRoutes.forEach((r) => r.prices.forEach((p) => priced.add(p.vehicle_id)));
    return data.vehicles.filter(
      (v) => Number(v.is_active) === 1 || priced.has(v.id)
    );
  }, [sheetRoutes, data.vehicles]);

  const filteredRoutes = useMemo(() => {
    let routes = sheetRoutes;
    if (onlyPriced) {
      routes = routes.filter((r) => r.prices.length > 0);
    }
    if (!term) return routes;
    return routes.filter((r) =>
      [
        r.label,
        r.origin_name,
        r.destination_name,
        t(`transfers.category.${r.category || "transfer"}`),
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term))
    );
  }, [sheetRoutes, onlyPriced, term]);

  // Grouped into the rate-sheet sections, in the order ROUTE_CATEGORIES lists them.
  const routeGroups = useMemo(() => {
    const order = ROUTE_CATEGORIES.map((c) => c.value);
    const byCategory = new Map();
    filteredRoutes.forEach((r) => {
      const key = r.category || "transfer";
      if (!byCategory.has(key)) byCategory.set(key, []);
      byCategory.get(key).push(r);
    });
    return [...byCategory.entries()]
      .sort(([a], [b]) => {
        const ai = order.indexOf(a);
        const bi = order.indexOf(b);
        return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi);
      })
      .map(([category, routes]) => ({ category, routes }));
  }, [filteredRoutes]);

  const filteredLocations = useMemo(() => {
    if (!term) return data.locations;
    return data.locations.filter(
      (l) =>
        l.name.toLowerCase().includes(term) ||
        (l.province || "").toLowerCase().includes(term)
    );
  }, [data.locations, term]);

  const filteredVehicles = useMemo(() => {
    if (!term) return data.vehicles;
    return data.vehicles.filter((v) => v.name.toLowerCase().includes(term));
  }, [data.vehicles, term]);

  const addButton = {
    routes: { label: t("transfers.tabs.routes"), onClick: () => setEditingRoute({}) },
    locations: { label: t("transfers.tabs.locations"), onClick: () => setEditingLocation({}) },
    vehicles: { label: t("transfers.tabs.vehicles"), onClick: () => setEditingVehicle({}) },
  }[tab];

  const searchPlaceholder = {
    routes: t("transfers.search.routes"),
    locations: t("transfers.search.locations"),
    vehicles: t("transfers.search.vehicles"),
  }[tab];

  const card = "bg-white rounded-xl shadow-sm ring-1 ring-black/5";
  const th = "px-4 py-2 text-left font-medium";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-gray-900">{t("transfers.title")}</h1>
            {province && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-brand-100 text-brand-700">
                <MapPin size={14} /> {province}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {data.routes.length} routes across {data.locations.length} locations —
            {supplier
              ? ` showing what ${supplier.name} charges per vehicle`
              : " manage transfer prices per vehicle"}
          </p>
        </div>

        <button
          onClick={addButton.onClick}
          className="btn-primary"
        >
          <Plus size={16} /> {t("transfers.add", { item: addButton.label })}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              tab === item.key
                ? "text-brand-700 border-brand-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      {/* Search, and on the rates tab the supplier whose sheet is on screen */}
      <div className={`${card} p-4 space-y-3`}>
        <div className="flex flex-col lg:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="input flex-1"
          />
          {tab === "routes" && (
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="lg:w-72 px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {data.suppliers.length === 0 && (
                <option value="">{t("transfers.noSuppliers")}</option>
              )}
              {data.suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.priced_routes > 0 ? ` (${s.priced_routes})` : " (no rates)"}
                </option>
              ))}
            </select>
          )}
        </div>
        {tab === "routes" && (
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={onlyPriced}
              onChange={(e) => setOnlyPriced(e.target.checked)}
              className="w-4 h-4 accent-brand-600"
            />
            Only routes this supplier prices
          </label>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div className={`${card} p-12 text-center text-gray-500`}>
          {t("common.loading")}
        </div>
      ) : error ? (
        <div className="bg-danger-50 border border-danger-200 rounded-xl p-6 text-center text-danger-700">
          {error}
        </div>
      ) : tab === "routes" ? (
        filteredRoutes.length === 0 ? (
          <div className={`${card} p-12 text-center space-y-3`}>
            <Car size={40} className="mx-auto text-gray-300" />
            <p className="text-gray-500">
              {data.routes.length === 0
                ? province
                  ? t("transfers.noRoutesProvince", { province })
                  : t("transfers.noRoutes")
                : onlyPriced && !term && supplier
                ? t("transfers.noSupplierRates", { name: supplier.name })
                : t("transfers.noRouteMatches")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {routeGroups.map((group) => (
              <div key={group.category} className={`${card} overflow-hidden`}>
                <div className="flex items-baseline justify-between gap-3 px-4 py-3 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900">
                    {t(`transfers.category.${group.category || "transfer"}`)}
                  </h2>
                  <span className="text-xs text-gray-400">
                    {t("transfers.routeCount", { count: group.routes.length })}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className={`${th} w-12`}>#</th>
                        <th className={th}>{t("transfers.route")}</th>
                        {priceColumns.map((v) => (
                          <th key={v.id} className="px-4 py-2 text-right font-medium w-28">
                            {v.name}
                          </th>
                        ))}
                        <th className="px-4 py-2 text-right font-medium w-40">
                          {t("common.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {group.routes.map((r, i) => {
                        const priceFor = (vehicleId) =>
                          (r.prices || []).find((p) => p.vehicle_id === vehicleId);
                        return (
                          <tr key={r.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-400 tabular-nums align-top">
                              {i + 1}
                            </td>
                            <td className="px-4 py-2 align-top">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-gray-900">
                                  {r.label || `${r.origin_name} to ${r.destination_name}`}
                                </span>
                                {!r.is_active && <StatusPill active={false} />}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {r.origin_name} → {r.destination_name}
                              </p>
                              {r.note && (
                                <p className="text-xs text-warning-800 mt-0.5">{r.note}</p>
                              )}
                            </td>
                            {priceColumns.map((v) => {
                              const price = priceFor(v.id);
                              return (
                                <td
                                  key={v.id}
                                  className="px-4 py-2 text-right tabular-nums align-top"
                                >
                                  {price ? (
                                    <span className="text-gray-900">
                                      {money(price.price)}
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">—</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-4 py-2 align-top">
                              <RowActions
                                onEdit={() => setEditingRoute(r)}
                                onDelete={() =>
                                  setDeleteTarget({
                                    resource: "routes",
                                    id: r.id,
                                    label:
                                      r.label || `${r.origin_name} to ${r.destination_name}`,
                                  })
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === "locations" ? (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className={`${th} w-12`}>#</th>
                <th className={th}>{t("transfers.location")}</th>
                <th className={`${th} w-40`}>{t("common.province")}</th>
                <th className={`${th} w-24`}>{t("common.sort")}</th>
                <th className={`${th} w-28`}>{t("common.status")}</th>
                <th className="px-4 py-2 text-right font-medium w-40">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    No locations match your search.
                  </td>
                </tr>
              ) : (
                filteredLocations.map((l, i) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-400 tabular-nums">{i + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">{l.name}</td>
                    <td className="px-4 py-2 text-gray-500">{l.province}</td>
                    <td className="px-4 py-2 text-gray-500 tabular-nums">
                      {l.sort_order}
                    </td>
                    <td className="px-4 py-2">
                      <StatusPill active={l.is_active === 1} />
                    </td>
                    <td className="px-4 py-2">
                      <RowActions
                        onEdit={() => setEditingLocation(l)}
                        onDelete={() =>
                          setDeleteTarget({ resource: "locations", id: l.id, label: l.name })
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className={`${th} w-24`}>{t("common.photo")}</th>
                <th className={th}>{t("transfers.vehicle")}</th>
                <th className={`${th} w-32`}>{t("transfers.passengers")}</th>
                <th className={`${th} w-28`}>{t("transfers.luggage")}</th>
                <th className={`${th} w-28`}>{t("common.status")}</th>
                <th className="px-4 py-2 text-right font-medium w-40">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                    No vehicles match your search.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {v.image_url ? (
                        <img
                          src={v.image_url}
                          alt=""
                          className="w-16 h-12 rounded-lg object-cover border border-gray-200"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                          <Car size={18} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-medium text-gray-900">{v.name}</div>
                      {v.description && (
                        <p className="text-xs text-gray-500 mt-0.5 max-w-md">
                          {v.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-500 tabular-nums">
                      up to {v.max_passengers}
                    </td>
                    <td className="px-4 py-2 text-gray-500 tabular-nums">
                      {v.max_luggage}
                    </td>
                    <td className="px-4 py-2">
                      <StatusPill active={v.is_active === 1} />
                    </td>
                    <td className="px-4 py-2">
                      <RowActions
                        onEdit={() => setEditingVehicle(v)}
                        onDelete={() =>
                          setDeleteTarget({ resource: "vehicles", id: v.id, label: v.name })
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingRoute && (
        <RouteFormModal
          route={editingRoute.id ? editingRoute : null}
          locations={data.locations}
          vehicles={data.vehicles}
          supplier={supplier}
          onClose={() => setEditingRoute(null)}
          onSaved={async () => {
            setEditingRoute(null);
            await load();
          }}
        />
      )}
      {editingLocation && (
        <LocationFormModal
          location={editingLocation.id ? editingLocation : null}
          onClose={() => setEditingLocation(null)}
          onSaved={async () => {
            setEditingLocation(null);
            await load();
          }}
        />
      )}
      {editingVehicle && (
        <VehicleFormModal
          vehicle={editingVehicle.id ? editingVehicle : null}
          onClose={() => setEditingVehicle(null)}
          onSaved={async () => {
            setEditingVehicle(null);
            await load();
          }}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t("transfers.deleteTitle")}
        description={t("transfers.deleteDescription", { name: deleteTarget?.label || "" })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setDeleteTarget(null)}
      />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default TransferList;
