import { useState, useEffect } from "react";
import { useI18n } from "../../i18n";
import { Link } from "react-router-dom";

const SupplierDashboard = ({ suppliers, tours, loading }) => {
  const { t } = useI18n();
  const [RECENTLY_UPDATED, setRecentlyUpdated] = useState([]);

  useEffect(() => {
    if (!loading && suppliers.length > 0) {
      calculateRecentlyUpdated();
    }
  }, [suppliers, tours, loading]);

  const calculateRecentlyUpdated = () => {
    // Recently Updated (last 7 days) - show only 3 items
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSuppliers = suppliers
      .filter((supplier) => new Date(supplier.updated_at) > weekAgo)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 3); // ✨ changed from 5 to 3

    setRecentlyUpdated(recentSuppliers);
  };

  const FORMAT_DATE_TIME = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Dashboard Header Skeleton */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* Recently Updated Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </div>
          <div className="p-4">
            <div className="flex space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 bg-gray-50 rounded-lg p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-brand-50 to-brand-50 rounded-lg p-6 border border-brand-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {t("suppliers.title")}
        </h2>
        <p className="text-gray-500">{t("suppliers.overview")}</p>
      </div>

      {/* Recently Updated - Horizontal Layout */}
      {/* <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🆕</span>
              Recently Updated
            </h3>
            <Link
              to="/suppliers"
              className="text-brand-600 hover:text-brand-800 text-sm font-medium"
            >
              {t("common.viewAll")} →
            </Link>
          </div>
        </div>

        <div className="p-4">
          {recentlyUpdated.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto">
              {recentlyUpdated.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex-1 min-w-[280px] bg-brand-50 rounded-lg p-4 border border-brand-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        to={`/suppliers/${supplier.id}`}
                        className="font-medium text-gray-900 hover:text-brand-600 block"
                      >
                        {supplier.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        Updated {formatDateTime(supplier.updated_at)}
                      </p>

                      {supplier.tour_count > 0 && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                            🏝️ {supplier.tour_count} tours
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-brand-600 text-xs whitespace-nowrap ml-2">
                      🕒 New
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">📅</div>
              <p className="text-gray-500">{t("suppliers.noRecentUpdates")}</p>
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default SupplierDashboard;
