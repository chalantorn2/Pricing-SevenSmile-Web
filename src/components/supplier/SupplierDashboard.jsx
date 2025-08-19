import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SupplierDashboard = ({ suppliers, tours, loading }) => {
  const [recentlyUpdated, setRecentlyUpdated] = useState([]);

  useEffect(() => {
    if (!loading && suppliers.length > 0) {
      calculateRecentlyUpdated();
    }
  }, [suppliers, tours, loading]);

  const calculateRecentlyUpdated = () => {
    // Recently Updated (7 วันล่าสุด) - แสดงแค่ 3 รายการ
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSuppliers = suppliers
      .filter((supplier) => new Date(supplier.updated_at) > weekAgo)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 3); // ✨ เปลี่ยนจาก 5 เป็น 3

    setRecentlyUpdated(recentSuppliers);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          📊 Supplier Dashboard
        </h2>
        <p className="text-gray-600">ภาพรวมและการแจ้งเตือนสำคัญ</p>
      </div>

      {/* อัพเดทล่าสุด - Horizontal Layout */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🆕</span>
              อัพเดทล่าสุด
            </h3>
            <Link
              to="/suppliers"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ดูทั้งหมด →
            </Link>
          </div>
        </div>

        <div className="p-4">
          {recentlyUpdated.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto">
              {recentlyUpdated.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex-1 min-w-[280px] bg-blue-50 rounded-lg p-4 border border-blue-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        to={`/suppliers/${supplier.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600 block"
                      >
                        {supplier.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        อัพเดท {formatDateTime(supplier.updated_at)}
                      </p>
                      {/* แสดงจำนวนทัวร์ถ้ามี */}
                      {supplier.tour_count > 0 && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🏝️ {supplier.tour_count} ทัวร์
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-blue-600 text-xs whitespace-nowrap ml-2">
                      🕒 ใหม่
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">📅</div>
              <p className="text-gray-500">ไม่มีการอัพเดทใน 7 วันล่าสุด</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
