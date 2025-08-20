import { useState } from "react";

const SupplierFilters = ({ onFilterChange, suppliers, tours }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  // Calculate filter counts
  const getFilterCounts = () => {
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      expiringSoon: suppliers.filter((supplier) => {
        const supplierTours = tours.filter(
          (tour) => tour.supplier_id === supplier.id
        );
        return supplierTours.some((tour) => {
          if (!tour.end_date || tour.end_date === "0000-00-00") return false;
          const endDate = new Date(tour.end_date);
          return endDate > now && endDate <= thirtyDaysLater;
        });
      }).length,

      noFiles: suppliers.filter((supplier) => {
        // This would need to be checked against actual files, for now assume all have files
        return false; // Placeholder
      }).length,

      noTours: suppliers.filter(
        (supplier) => !tours.some((tour) => tour.supplier_id === supplier.id)
      ).length,

      incompleteInfo: suppliers.filter(
        (supplier) => !supplier.phone && !supplier.line
      ).length,

      hasActivePromo: suppliers.filter((supplier) => {
        const supplierTours = tours.filter(
          (tour) => tour.supplier_id === supplier.id
        );
        return supplierTours.some((tour) => tour.park_fee_included);
      }).length,
    };
  };

  const filterCounts = getFilterCounts();

  const filterOptions = [
    {
      id: "expiring_soon",
      label: "ทัวร์ใกล้หมดอายุ (30 วัน)",
      count: filterCounts.expiringSoon,
      color: "bg-orange-100 text-orange-700",
      icon: "⏰",
    },
    {
      id: "no_tours",
      label: "ไม่มีทัวร์",
      count: filterCounts.noTours,
      color: "bg-yellow-100 text-yellow-700",
      icon: "⚠️",
    },
    {
      id: "incomplete_info",
      label: "ข้อมูลติดต่อไม่ครบ",
      count: filterCounts.incompleteInfo,
      color: "bg-red-100 text-red-700",
      icon: "📋",
    },
    {
      id: "has_active_promo",
      label: "มีโปรโมชั่น (รวมค่าอุทยาน)",
      count: filterCounts.hasActivePromo,
      color: "bg-green-100 text-green-700",
      icon: "🎯",
    },
    {
      id: "recent_activity",
      label: "อัพเดทภายใน 7 วัน",
      count: suppliers.filter((supplier) => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(supplier.updated_at) > weekAgo;
      }).length,
      color: "bg-blue-100 text-blue-700",
      icon: "🆕",
    },
  ];

  const handleFilterToggle = (filterId) => {
    let newActiveFilters;

    if (activeFilters.includes(filterId)) {
      newActiveFilters = activeFilters.filter((id) => id !== filterId);
    } else {
      newActiveFilters = [...activeFilters, filterId];
    }

    setActiveFilters(newActiveFilters);
    onFilterChange(newActiveFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    onFilterChange([]);
  };

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          hasActiveFilters
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <span>🔍</span>
        <span>Smart Filters</span>
        {hasActiveFilters && (
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            {activeFilters.length}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">
                  กรองข้อมูลอัจฉริยะ
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    ล้างทั้งหมด
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filterOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      activeFilters.includes(option.id)
                        ? option.color
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={activeFilters.includes(option.id)}
                        onChange={() => handleFilterToggle(option.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        activeFilters.includes(option.id)
                          ? "bg-white bg-opacity-70"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {option.count}
                    </span>
                  </label>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Total: {suppliers.length} Suppliers • {tours.length} Tours
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Active Filters Pills */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeFilters.map((filterId) => {
            const option = filterOptions.find((opt) => opt.id === filterId);
            return (
              <span
                key={filterId}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${option.color}`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
                <button
                  onClick={() => handleFilterToggle(filterId)}
                  className="ml-2 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupplierFilters;
