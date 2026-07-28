import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { packageToursService } from "../../services/api-service";

const PackageTourList = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    filterAndSortPackages();
  }, [packages, searchTerm, sortConfig]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await packageToursService.getAllPackages();
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
      alert("An error occurred while loading data");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPackages = () => {
    const searchLower = searchTerm.toLowerCase().trim();
    let filtered = packages.filter((pkg) => {
      return (
        pkg.name?.toLowerCase().includes(searchLower) ||
        pkg.description?.toLowerCase().includes(searchLower)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "total_cost") {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        } else if (sortConfig.key === "created_at") {
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

    setFilteredPackages(filtered);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const formatPrice = (price) => {
    const n = typeof price === "number" ? price : Number(String(price ?? "").replace(/[, ]/g, ""));
    if (Number.isNaN(n)) return "-";
    return new Intl.NumberFormat("th-TH").format(n);
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    try {
      await packageToursService.deletePackage(id);
      alert("Package deleted successfully");
      fetchPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
      alert("An error occurred while deleting the package");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-3"></div>
          <p className="text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  const columns = [
    { key: "id", label: "No.", sortable: false },
    { key: "name", label: "Package Name", sortable: true },
    { key: "duration", label: "Duration", sortable: false },
    { key: "total_cost", label: "Total Cost", sortable: true },
    { key: "created_at", label: "Created At", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tour Packages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage tour packages and define daily details
          </p>
        </div>
        <Link
          to="/packages/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white bg-brand-600 hover:bg-brand-700 active:scale-[.98] shadow-sm"
        >
          <span>➕</span>
          <span>Create New Package</span>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-black/5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="package-search" className="sr-only">
              Search tour packages
            </label>
            <div className="relative">
              <input
                id="package-search"
                type="text"
                placeholder="Search: package name, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
              />
              <svg
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </div>
          </div>

          <div className="text-sm text-gray-500 flex items-center">
            Showing <span className="mx-1 font-medium">{filteredPackages.length}</span> of{" "}
            <span className="mx-1 font-medium">{packages.length}</span> items
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 sticky top-0 z-10">
              <tr className="border-b border-gray-200">
                {columns.map((column) => {
                  const active = sortConfig.key === column.key;
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      className={`px-6 py-3 text-left uppercase tracking-wider text-[11px] font-semibold ${
                        column.sortable ? "cursor-pointer select-none" : ""
                      }`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="inline-flex items-center gap-1">
                        <span>{column.label}</span>
                        {column.sortable && (
                          <span className={`${active ? "text-gray-900" : "text-gray-400"}`}>
                            {active ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredPackages.map((pkg, index) => (
                <tr key={pkg.id} className="group hover:bg-gray-50 transition">
                  <td className="px-6 py-3 whitespace-nowrap text-gray-900">
                    {index + 1}
                  </td>

                  <td className="px-6 py-3">
                    <div className="font-medium text-gray-900 leading-5">
                      {pkg.name}
                    </div>
                    {pkg.description && (
                      <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {pkg.description}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-3 whitespace-nowrap text-gray-900">
                    {pkg.days} days {pkg.nights} nights
                  </td>

                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="inline-flex items-baseline gap-1 rounded-md bg-success-50 px-2 py-1 ring-1 ring-success-200">
                      <span className="font-semibold text-success-700">
                        THB {formatPrice(pkg.total_cost)}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                    {pkg.created_at ? formatDate(pkg.created_at) : "-"}
                  </td>

                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/packages/edit/${pkg.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200 hover:bg-brand-100 active:scale-[.98] text-xs"
                        title="Edit"
                      >
                        <span aria-hidden>✏️</span>
                        <span>Edit</span>
                      </Link>
                      <Link
                        to={`/packages/view/${pkg.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success-50 text-success-700 ring-1 ring-inset ring-success-200 hover:bg-success-100 active:scale-[.98] text-xs"
                        title="Customer View"
                      >
                        <span aria-hidden>👁️</span>
                        <span>Customer View</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-danger-50 text-danger-700 ring-1 ring-inset ring-danger-200 hover:bg-danger-100 active:scale-[.98] text-xs"
                        title="Delete"
                      >
                        <span aria-hidden>🗑️</span>
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No matching data found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageTourList;
