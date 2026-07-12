import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { suppliersService, toursService } from "../../services/api-service";
import SupplierFilters from "../../components/suppliers/SupplierFilters";
import {
  TableSkeleton,
  CardSkeleton,
  ErrorState,
  MobileOptimizedTable,
} from "../../components/common/LoadingSkeleton";
import * as XLSX from "xlsx";
import {
  Home,
  FileSpreadsheet,
  Plus,
  Building2,
  Palmtree,
  AlertTriangle,
  ClipboardList,
  MapPin,
  MessageCircle,
  Smartphone,
  Globe,
  Phone,
  FileText,
} from "lucide-react";

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [tours, setTours] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [activeFilters, setActiveFilters] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [showDashboard, setShowDashboard] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortSuppliers();
  }, [suppliers, tours, searchTerm, sortConfig, activeFilters]);

  // Handle URL params for direct filter links
  useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam) {
      setActiveFilters([filterParam]);
      setShowDashboard(false);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both suppliers and tours data
      const [suppliersData, toursData] = await Promise.all([
        suppliersService.getAllSuppliers(),
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

  const filterAndSortSuppliers = () => {
    let filtered = suppliers.map((supplier) => {
      // Count tours for each supplier
      const supplierTours = tours.filter(
        (tour) => tour.supplier_id === supplier.id,
      );
      const tourCount = supplierTours.length;

      // Get latest tour update
      const latestTourUpdate = supplierTours.reduce((latest, tour) => {
        const tourDate = new Date(tour.updated_at);
        return tourDate > latest ? tourDate : latest;
      }, new Date(supplier.updated_at));

      return {
        ...supplier,
        tour_count: tourCount,
        latest_activity: latestTourUpdate,
      };
    });

    // Apply search filter - include all phone numbers in the search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (supplier) =>
          supplier.name?.toLowerCase().includes(searchLower) ||
          supplier.phone?.toLowerCase().includes(searchLower) ||
          supplier.phone_2?.toLowerCase().includes(searchLower) ||
          supplier.phone_3?.toLowerCase().includes(searchLower) ||
          supplier.phone_4?.toLowerCase().includes(searchLower) ||
          supplier.phone_5?.toLowerCase().includes(searchLower) ||
          supplier.line?.toLowerCase().includes(searchLower) ||
          supplier.address?.toLowerCase().includes(searchLower),
      );
    }

    // Apply smart filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter((supplier) => {
        return activeFilters.every((filterId) => {
          switch (filterId) {
            case "expiring_soon":
              const supplierTours = tours.filter(
                (tour) => tour.supplier_id === supplier.id,
              );
              const now = new Date();
              const thirtyDaysLater = new Date(
                now.getTime() + 30 * 24 * 60 * 60 * 1000,
              );
              return supplierTours.some((tour) => {
                if (!tour.end_date || tour.end_date === "0000-00-00")
                  return false;
                const endDate = new Date(tour.end_date);
                return endDate > now && endDate <= thirtyDaysLater;
              });

            case "no_tours":
              return supplier.tour_count === 0;

            case "incomplete_info":
              return !supplier.phone && !supplier.line;

            case "has_active_promo":
              const promoTours = tours.filter(
                (tour) =>
                  tour.supplier_id === supplier.id && tour.park_fee_included,
              );
              return promoTours.length > 0;

            case "recent_activity":
              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              return new Date(supplier.updated_at) > weekAgo;

            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "tour_count") {
          aValue = parseInt(aValue) || 0;
          bValue = parseInt(bValue) || 0;
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

    setFilteredSuppliers(filtered);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function for displaying multiple phone numbers
  const renderPhoneoumbers = (supplier, maxShow = 2) => {
    const phones = [
      supplier.phone,
      supplier.phone_2,
      supplier.phone_3,
      supplier.phone_4,
      supplier.phone_5,
    ].filter((phone) => phone?.trim());

    if (phones.length === 0) {
      return <span className="text-gray-400 text-xs">No phone</span>;
    }

    const visiblePhones = phones.slice(0, maxShow);
    const hiddenCount = phones.length - maxShow;

    return (
      <div className="space-y-1">
        {visiblePhones.map((phone, index) => (
          <div key={index} className="flex items-center space-x-1">
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <a
              href={`tel:${phone}`}
              className="text-blue-600 hover:text-blue-800 text-sm hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {phone}
            </a>
            {index === 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                Primary
              </span>
            )}
          </div>
        ))}

        {hiddenCount > 0 && (
          <div className="text-xs text-gray-500">
            +{hiddenCount} more numbers
          </div>
        )}
      </div>
    );
  };

  // Compact phone display for mobile
  const renderPhoneCompact = (supplier) => {
    const phones = [
      supplier.phone,
      supplier.phone_2,
      supplier.phone_3,
      supplier.phone_4,
      supplier.phone_5,
    ].filter((phone) => phone?.trim());

    if (phones.length === 0) {
      return <span className="text-gray-400 text-xs">No phone</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {phones.slice(0, 2).map((phone, index) => (
          <a
            key={index}
            href={`tel:${phone}`}
            className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-100"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="w-3 h-3" />
            <span>{phone.length > 8 ? `${phone.slice(0, 8)}...` : phone}</span>
          </a>
        ))}
        {phones.length > 2 && (
          <span className="text-xs text-gray-500 px-2 py-1">
            +{phones.length - 2}
          </span>
        )}
      </div>
    );
  };

  const handleExportExcel = () => {
    const dataToExport =
      selectedSuppliers.length > 0
        ? filteredSuppliers.filter((s) => selectedSuppliers.includes(s.id))
        : filteredSuppliers;

    const exportData = dataToExport.map((supplier, index) => ({
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
      "Tour count": supplier.tour_count,
      "Created at": formatDate(supplier.created_at),
      "Last updated": formatDate(supplier.latest_activity),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Suppliers List");

    const filename =
      selectedSuppliers.length > 0
        ? `Suppliers_List_Selected_${new Date().toLocaleDateString(
            "en-US",
          )}.xlsx`
        : `Suppliers_List_${new Date().toLocaleDateString("en-US")}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    setShowDashboard(filters.length === 0);
  };

  const handleSelectAll = () => {
    if (selectedSuppliers.length === filteredSuppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(filteredSuppliers.map((s) => s.id));
    }
  };

  const handleSelectSupplier = (supplierId) => {
    if (selectedSuppliers.includes(supplierId)) {
      setSelectedSuppliers(selectedSuppliers.filter((id) => id !== supplierId));
    } else {
      setSelectedSuppliers([...selectedSuppliers, supplierId]);
    }
  };

  const handleBulkAction = (action) => {
    if (selectedSuppliers.length === 0) {
      alert("Please select the Suppliers you want to act on");
      return;
    }

    switch (action) {
      case "export":
        handleExportExcel();
        break;
      case "contact_check":
        const incompleteContacts = filteredSuppliers
          .filter((s) => selectedSuppliers.includes(s.id))
          .filter((s) => !s.phone && !s.line);

        if (incompleteContacts.length > 0) {
          alert(
            `Found ${
              incompleteContacts.length
            } Suppliers with incomplete contact info:\n${incompleteContacts
              .map((s) => s.name)
              .join(", ")}`,
          );
        } else {
          alert("The selected Suppliers have complete contact information");
        }
        break;
      default:
        alert(`The ${action} feature is in development`);
    }
  };

  const getStatusBadge = (supplier) => {
    if (supplier.tour_count === 0) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
          No tours
        </span>
      );
    }
    if (!supplier.phone && !supplier.line) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
          Incomplete info
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
        Ready
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <CardSkeleton count={4} />
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <TableSkeleton rows={5} columns={8} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="An error occurred"
        message={error}
        onRetry={fetchData}
        icon={<AlertTriangle className="w-12 h-12 mx-auto text-red-500" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {showDashboard
              ? "Manage Suppliers"
              : `Search results (${filteredSuppliers.length})`}
          </h1>
          <p className="text-gray-600 mt-1">
            {showDashboard
              ? "Manage Supplier data and view related tours"
              : "Showing results based on the selected filters"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {!showDashboard && (
            <button
              onClick={() => {
                setActiveFilters([]);
                setShowDashboard(true);
                setSearchTerm("");
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Clear filters
            </button>
          )}
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </button>
          <Link
            to="/add"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add new tour
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                Total Suppliers
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {suppliers.length}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Has tours</p>
              <p className="text-2xl font-bold text-green-600">
                {
                  suppliers.filter((s) =>
                    tours.some((t) => t.supplier_id === s.id),
                  ).length
                }
              </p>
            </div>
            <Palmtree className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">No tours</p>
              <p className="text-2xl font-bold text-yellow-600">
                {
                  suppliers.filter(
                    (s) => !tours.some((t) => t.supplier_id === s.id),
                  ).length
                }
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                Incomplete info
              </p>
              <p className="text-2xl font-bold text-red-600">
                {suppliers.filter((s) => !s.phone && !s.line).length}
              </p>
            </div>
            <ClipboardList className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search Supplier, phone, Line ID, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <SupplierFilters
              onFilterChange={handleFilterChange}
              suppliers={suppliers}
              tours={tours}
            />
            <div className="text-sm text-gray-600">
              Showing {filteredSuppliers.length} of {suppliers.length} Suppliers
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedSuppliers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-blue-700 font-medium">
                Selected {selectedSuppliers.length} Suppliers
              </span>
              <button
                onClick={() => setSelectedSuppliers([])}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction("export")}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm inline-flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Selected
              </button>
              <button
                onClick={() => handleBulkAction("contact_check")}
                className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm inline-flex items-center gap-1.5"
              >
                <ClipboardList className="w-4 h-4" />
                Check Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Mobile-Optimized Table */}
      <MobileOptimizedTable
        data={filteredSuppliers}
        columns={[
          {
            key: "index",
            label: "No.",
            render: (item, index) => (
              <div className="text-center font-medium">{index + 1}</div>
            ),
          },
          {
            key: "name",
            label: "Supplier oame",
            render: (item) => (
              <div>
                <div className="font-medium text-gray-900">{item.name}</div>
                {item.address && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2 flex items-start gap-1">
                    <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{item.address}</span>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "contact",
            label: "Contact Info",
            render: (item) => (
              <div className="space-y-2">
                {/* Phone oumbers - display neatly */}
                <div className="phone-section">
                  {renderPhoneoumbers(item, 1)}
                </div>

                {/* Other Contact Methods */}
                <div className="flex flex-wrap gap-2">
                  {item.line && (
                    <div className="inline-flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                      <MessageCircle className="w-3 h-3" />
                      <span>{item.line}</span>
                    </div>
                  )}
                  {item.whatsapp && (
                    <a
                      href={`https://wa.me/${item.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs hover:bg-green-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  {item.website && (
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Globe className="w-3 h-3" />
                      <span>Website</span>
                    </a>
                  )}
                </div>

                {!item.phone && !item.line && !item.whatsapp && (
                  <span className="text-gray-400 text-xs">
                    No contact information
                  </span>
                )}
              </div>
            ),
          },
          {
            key: "tour_count",
            label: "Tour Count",
            render: (item) => (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  item.tour_count > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {item.tour_count} tours
              </span>
            ),
          },

          {
            key: "latest_activity",
            label: "Last Updated",
            render: (item) => (
              <div className="text-sm">
                <div>{formatDate(item.latest_activity)}</div>
                <div className="text-xs text-gray-500">
                  {item.latest_activity > item.updated_at
                    ? "From tour"
                    : "From Supplier"}
                </div>
              </div>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (item) => (
              <Link
                to={`/suppliers/${item.id}`}
                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm cursor-pointer inline-flex items-center space-x-1"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="w-4 h-4" />
                <span>View Details</span>
              </Link>
            ),
          },
        ]}
        loading={loading}
        selectedItems={selectedSuppliers}
        onSelectItem={handleSelectSupplier}
        onSelectAll={handleSelectAll}
        onRowClick={(supplier) => {
          // oavigate to supplier detail on row click (mobile-friendly)
          window.location.href = `/suppliers/${supplier.id}`;
        }}
      />
    </div>
  );
};

export default SupplierList;
