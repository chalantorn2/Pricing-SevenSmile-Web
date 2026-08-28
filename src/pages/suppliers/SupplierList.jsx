import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { suppliersService, toursService } from "../../services/api-service";
import { SupplierModal } from "../../components/suppliers";
import { Toast } from "../../components/core";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Plus,
  MapPin,
  MessageCircle,
  Smartphone,
  Globe,
  Phone,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  AlertTriangle,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

const PAGE_SIZE = 25;

// Tour vendors and transfer companies are different businesses kept in one table,
// so the page shows one list at a time rather than mixing them.
const TYPES = {
  tour: { label: "Tour", blurb: "the tours linked to each one" },
  transfer: { label: "Transfer", blurb: "the transfer routes they price" },
};
const DEFAULT_TYPE = "tour";

// A single-select quick filter keeps the toolbar to one row of chips. The
// tour-derived ones are hidden on the transfer list, where they mean nothing.
const FILTERS = {
  all: { label: "All", match: () => true },
  no_tours: {
    label: "No tours",
    match: (s) => s.tour_count === 0,
    tourOnly: true,
  },
  no_contact: {
    label: "No contact",
    match: (s) => !s.phone && !s.line && !s.whatsapp,
  },
  expiring_soon: {
    label: "Tours expiring 30d",
    match: (s) => s.expiring_tours > 0,
    tourOnly: true,
  },
  recent: {
    label: "Updated 7d",
    match: (s) =>
      new Date(s.latest_activity) > new Date(Date.now() - 7 * 86400000),
  },
};

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getPhones = (supplier) =>
  [
    supplier.phone,
    supplier.phone_2,
    supplier.phone_3,
    supplier.phone_4,
    supplier.phone_5,
  ].filter((phone) => phone?.trim());

const SupplierList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [suppliers, setSuppliers] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);

  const activeType = TYPES[searchParams.get("type")]
    ? searchParams.get("type")
    : DEFAULT_TYPE;
  const isTourList = activeType === "tour";

  const requestedFilter = searchParams.get("filter");
  // A tour-only chip left in the URL would silently empty the transfer list.
  const activeFilter =
    FILTERS[requestedFilter] && (isTourList || !FILTERS[requestedFilter].tourOnly)
      ? requestedFilter
      : "all";

  const visibleFilters = useMemo(
    () =>
      Object.entries(FILTERS).filter(
        ([, filter]) => isTourList || !filter.tourOnly
      ),
    [isTourList]
  );

  useEffect(() => {
    fetchData();
  }, [activeType]);

  // Debounce the search box so typing stays responsive on large lists
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput), 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter, sortConfig]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [suppliersData, toursData] = await Promise.all([
        suppliersService.getAllSuppliers(activeType),
        toursService.getAllTours(),
      ]);
      setSuppliers(suppliersData);
      setTours(toursData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(
        error.message || "An error occurred while loading Suppliers data",
      );
    } finally {
      setLoading(false);
    }
  };

  const setFilter = (filterId) => {
    const next = new URLSearchParams(searchParams);
    if (filterId === "all") {
      next.delete("filter");
    } else {
      next.set("filter", filterId);
    }
    setSearchParams(next, { replace: true });
  };

  // Switching lists drops the chip too: the two lists are filtered by different
  // things, so carrying one over would only confuse the counts.
  const setType = (typeId) => {
    const next = new URLSearchParams(searchParams);
    next.delete("filter");
    if (typeId === DEFAULT_TYPE) {
      next.delete("type");
    } else {
      next.set("type", typeId);
    }
    setSearchParams(next, { replace: true });
  };

  // Suppliers enriched with the tour-derived numbers the list sorts and filters on
  const enrichedSuppliers = useMemo(() => {
    const now = Date.now();
    const thirtyDaysLater = now + 30 * 86400000;

    return suppliers.map((supplier) => {
      const supplierTours = tours.filter((t) => t.supplier_id === supplier.id);

      const latestActivity = supplierTours.reduce((latest, tour) => {
        const tourDate = new Date(tour.updated_at);
        return tourDate > latest ? tourDate : latest;
      }, new Date(supplier.updated_at));

      const expiringTours = supplierTours.filter((tour) => {
        if (!tour.end_date || tour.end_date === "0000-00-00") return false;
        const endDate = new Date(tour.end_date).getTime();
        return endDate > now && endDate <= thirtyDaysLater;
      }).length;

      return {
        ...supplier,
        tour_count: supplierTours.length,
        latest_activity: latestActivity,
        expiring_tours: expiringTours,
      };
    });
  }, [suppliers, tours]);

  const filterCounts = useMemo(
    () =>
      Object.fromEntries(
        visibleFilters.map(([id, filter]) => [
          id,
          enrichedSuppliers.filter(filter.match).length,
        ]),
      ),
    [enrichedSuppliers, visibleFilters],
  );

  const filteredSuppliers = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();

    const filtered = enrichedSuppliers.filter((supplier) => {
      if (!FILTERS[activeFilter].match(supplier)) return false;
      if (!searchLower) return true;

      return (
        supplier.name?.toLowerCase().includes(searchLower) ||
        supplier.line?.toLowerCase().includes(searchLower) ||
        supplier.address?.toLowerCase().includes(searchLower) ||
        getPhones(supplier).some((phone) =>
          phone.toLowerCase().includes(searchLower),
        )
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "tour_count") {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        } else if (sortConfig.key === "latest_activity") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else {
          aValue = aValue?.toString().toLowerCase() || "";
          bValue = bValue?.toString().toLowerCase() || "";
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [enrichedSuppliers, searchTerm, activeFilter, sortConfig]);

  const totalItems = filteredSuppliers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageSuppliers = filteredSuppliers.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  const hasActiveFilters = Boolean(searchTerm) || activeFilter !== "all";
  const incompleteCount = filterCounts.no_contact;

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setFilter("all");
  };

  // The supplier name is the real link; clicking the rest of the row is a
  // convenience shortcut, so ignore clicks that land on nested controls or
  // that are just the end of a text selection.
  const handleRowClick = (event, supplier) => {
    if (event.target.closest("a, button, input, label")) return;
    if (window.getSelection()?.toString()) return;
    navigate(`/suppliers/${supplier.id}`);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Exports whatever the chips and the search box currently narrow the list to
  const handleExportExcel = () => {
    if (filteredSuppliers.length === 0) return;

    const exportData = filteredSuppliers.map((supplier, index) => ({
      "No.": index + 1,
      "Supplier name": supplier.name,
      "Primary phone": supplier.phone || "-",
      "Phone 2": supplier.phone_2 || "-",
      "Phone 3": supplier.phone_3 || "-",
      "Phone 4": supplier.phone_4 || "-",
      "Phone 5": supplier.phone_5 || "-",
      "Line ID": supplier.line || "-",
      Facebook: supplier.facebook || "-",
      WhatsApp: supplier.whatsapp || "-",
      Address: supplier.address || "-",
      ...(isTourList ? { "Tour count": supplier.tour_count } : {}),
      "Created at": formatDate(supplier.created_at),
      "Last updated": formatDate(supplier.latest_activity),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${TYPES[activeType].label} Suppliers`);
    XLSX.writeFile(
      wb,
      `${TYPES[activeType].label}_Suppliers_${new Date().toLocaleDateString(
        "en-US",
      )}.xlsx`,
    );

    setToast({
      message: `Exported ${filteredSuppliers.length} suppliers to Excel`,
      type: "success",
    });
  };

  const handleSupplierCreated = (supplier) => {
    setShowAddModal(false);
    setToast({
      message: `Added "${supplier?.name || "supplier"}"`,
      type: "success",
    });
    fetchData();
  };

  // ========= Sub-renders =========
  const renderContact = (supplier) => {
    const phones = getPhones(supplier);
    const links = [
      supplier.line && {
        key: "line",
        icon: MessageCircle,
        label: `Line: ${supplier.line}`,
      },
      supplier.whatsapp && {
        key: "whatsapp",
        icon: Smartphone,
        label: "WhatsApp",
        href: `https://wa.me/${supplier.whatsapp}`,
      },
      supplier.website && {
        key: "website",
        icon: Globe,
        label: "Website",
        href: supplier.website,
      },
    ].filter(Boolean);

    if (phones.length === 0 && links.length === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-warning-700">
          <AlertTriangle className="w-3.5 h-3.5" />
          No contact info
        </span>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {phones[0] && (
          <a
            href={`tel:${phones[0]}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:underline tabular-nums"
          >
            <Phone className="w-3.5 h-3.5" />
            {phones[0]}
          </a>
        )}
        {phones.length > 1 && (
          <span
            className="text-xs text-gray-500"
            title={phones.slice(1).join(", ")}
          >
            +{phones.length - 1} more
          </span>
        )}
        {links.map((link) => {
          const Icon = link.icon;
          const { key, label, href } = link;

          return href ? (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={label}
              aria-label={label}
              className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-gray-100 hover:text-gray-700"
            >
              <Icon className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span
              key={key}
              title={label}
              className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-200"
            >
              <Icon className="w-3.5 h-3.5" />
            </span>
          );
        })}
      </div>
    );
  };

  const renderTourBadge = (supplier) => (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold tabular-nums ring-1 ring-inset ${
        supplier.tour_count > 0
          ? "bg-success-50 text-success-700 ring-success-200"
          : "bg-gray-50 text-gray-500 ring-gray-200"
      }`}
    >
      {supplier.tour_count} tours
    </span>
  );

  const renderSkeleton = () => (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
          <div className="h-4 w-6 rounded bg-gray-200" />
          <div className="h-4 flex-1 rounded bg-gray-200" />
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="h-6 w-20 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => {
    if (hasActiveFilters) {
      return (
        <div className="text-center py-12 px-6">
          <p className="font-medium text-gray-500">
            No suppliers match your filters
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Try a different keyword or clear the filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            Clear filters
          </button>
        </div>
      );
    }

    return (
      <div className="text-center py-12 px-6">
        <p className="font-medium text-gray-500">
          No {TYPES[activeType].label.toLowerCase()} suppliers yet
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Add your first one to get started.
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-brand-600 hover:bg-brand-700 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>
    );
  };

  const sortableColumns = [
    { key: "name", label: "Supplier" },
    { key: "contact", label: "Contact", sortable: false },
    // Transfer suppliers never carry tours, so the column would be a row of zeroes.
    ...(isTourList ? [{ key: "tour_count", label: "Tours" }] : []),
    { key: "latest_activity", label: "Last updated" },
  ];

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-danger-200 p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-danger-600 mx-auto mb-2" />
        <p className="font-medium text-gray-900">Could not load suppliers</p>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-brand-600 hover:bg-brand-700 text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage supplier contacts and see {TYPES[activeType].blurb}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Which list: tour vendors or transfer companies */}
          <div className="inline-flex self-start sm:self-auto rounded-lg bg-gray-100 p-1">
            {Object.entries(TYPES).map(([id, type]) => {
              const active = activeType === id;
              return (
                <button
                  key={id}
                  onClick={() => setType(id)}
                  aria-pressed={active}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                    active
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={handleExportExcel}
            disabled={totalItems === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-success-600 hover:bg-success-700 active:scale-[.98] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            title={`Export the ${totalItems} suppliers currently listed`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel ({totalItems})</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-brand-600 hover:bg-brand-700 active:scale-[.98] shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Missing contact info warning */}
      {!loading && incompleteCount > 0 && activeFilter !== "no_contact" && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl bg-warning-50 px-4 py-3 ring-1 ring-warning-200">
          <div className="flex items-center gap-2 text-sm text-warning-800">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <span className="font-semibold">{incompleteCount}</span> supplier
              {incompleteCount > 1 ? "s have" : " has"} no phone, Line or
              WhatsApp on file.
            </span>
          </div>
          <button
            onClick={() => setFilter("no_contact")}
            className="self-start sm:self-auto text-sm font-medium text-warning-800 underline underline-offset-2 hover:text-warning-900"
          >
            Review them
          </button>
        </div>
      )}

      {/* Search & quick filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5 space-y-4">
        <div className="relative">
          <label htmlFor="supplier-search" className="sr-only">
            Search suppliers
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="supplier-search"
            type="text"
            placeholder="Search: supplier name, phone, Line ID, address..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {visibleFilters.map(([id, filter]) => {
              const active = activeFilter === id;
              return (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition ring-1 ring-inset ${
                    active
                      ? "bg-brand-600 text-white ring-brand-600"
                      : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span>{filter.label}</span>
                  <span
                    className={`tabular-nums text-xs ${
                      active ? "text-white/80" : "text-gray-400"
                    }`}
                  >
                    {filterCounts[id]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-sm text-gray-500 shrink-0">
            Showing <span className="font-medium">{totalItems}</span> of{" "}
            <span className="font-medium">{suppliers.length}</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">
        {loading ? (
          renderSkeleton()
        ) : totalItems === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr className="border-b border-gray-200">
                    <th
                      scope="col"
                      className="pl-6 pr-3 py-3 text-left uppercase tracking-wider text-[11px] font-semibold w-14"
                    >
                      No.
                    </th>
                    {sortableColumns.map((column) => {
                      const sortable = column.sortable !== false;
                      const active = sortConfig.key === column.key;
                      return (
                        <th
                          key={column.key}
                          scope="col"
                          onClick={() => sortable && handleSort(column.key)}
                          className={`px-6 py-3 text-left uppercase tracking-wider text-[11px] font-semibold ${
                            sortable ? "cursor-pointer select-none" : ""
                          }`}
                        >
                          <div className="inline-flex items-center gap-1">
                            <span>{column.label}</span>
                            {sortable &&
                              (active ? (
                                sortConfig.direction === "asc" ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-gray-900" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-gray-900" />
                                )
                              ) : (
                                <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" />
                              ))}
                          </div>
                        </th>
                      );
                    })}
                    <th scope="col" className="px-6 py-3 w-10">
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {pageSuppliers.map((supplier, index) => (
                    <tr
                      key={supplier.id}
                      onClick={(e) => handleRowClick(e, supplier)}
                      className="group cursor-pointer transition hover:bg-gray-50 focus-within:bg-gray-50"
                    >
                      <td className="pl-6 pr-3 py-3 text-gray-500 tabular-nums">
                        {startIndex + index + 1}
                      </td>

                      <td className="px-6 py-3 align-top max-w-xs">
                        <Link
                          to={`/suppliers/${supplier.id}`}
                          className="font-medium text-gray-900 leading-5 rounded-sm hover:text-brand-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                          {supplier.name}
                        </Link>
                        {supplier.address && (
                          <div className="mt-1 flex items-start gap-1 text-xs text-gray-500">
                            <MapPin className="w-3.5 h-3.5 mt-px shrink-0" />
                            <span className="line-clamp-1">
                              {supplier.address}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-3">{renderContact(supplier)}</td>

                      {isTourList && (
                        <td className="px-6 py-3 whitespace-nowrap">
                          {renderTourBadge(supplier)}
                        </td>
                      )}

                      <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                        {formatDate(supplier.latest_activity)}
                      </td>

                      <td className="px-6 py-3 text-right">
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {pageSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  onClick={(e) => handleRowClick(e, supplier)}
                  className="p-4 space-y-2 active:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/suppliers/${supplier.id}`}
                        className="font-medium text-gray-900 leading-5"
                      >
                        {supplier.name}
                      </Link>
                      {supplier.address && (
                        <div className="mt-1 flex items-start gap-1 text-xs text-gray-500">
                          <MapPin className="w-3.5 h-3.5 mt-px shrink-0" />
                          <span className="line-clamp-1">
                            {supplier.address}
                          </span>
                        </div>
                      )}
                    </div>
                    {isTourList && renderTourBadge(supplier)}
                  </div>

                  {renderContact(supplier)}

                  <div className="text-xs text-gray-400">
                    Updated {formatDate(supplier.latest_activity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  Showing <span className="font-medium">{startIndex + 1}</span>–
                  <span className="font-medium">
                    {Math.min(startIndex + PAGE_SIZE, totalItems)}
                  </span>{" "}
                  of <span className="font-medium">{totalItems}</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-500">
                    Page <span className="font-medium">{safePage}</span> /{" "}
                    <span className="font-medium">{totalPages}</span>
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={safePage === totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <SupplierModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleSupplierCreated}
        defaultType={activeType}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default SupplierList;
