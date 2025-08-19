import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SupplierDashboard = ({ suppliers, tours, loading }) => {
  const [dashboardData, setDashboardData] = useState({
    topSuppliers: [],
    recentlyUpdated: [],
    missingInfo: [],
    expiringTours: [],
  });

  useEffect(() => {
    if (!loading && suppliers.length > 0) {
      calculateDashboardData();
    }
  }, [suppliers, tours, loading]);

  const calculateDashboardData = () => {
    // Top Suppliers (มีทัวร์มากสุด)
    const suppliersWithTours = suppliers
      .map((supplier) => ({
        ...supplier,
        tourCount: tours.filter((tour) => tour.supplier_id === supplier.id)
          .length,
      }))
      .filter((supplier) => supplier.tourCount > 0)
      .sort((a, b) => b.tourCount - a.tourCount)
      .slice(0, 5);

    // Recently Updated (7 วันล่าสุด)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSuppliers = suppliers
      .filter((supplier) => new Date(supplier.updated_at) > weekAgo)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5);

    // Missing Information
    const incompleteSuppliers = suppliers
      .filter((supplier) => !supplier.phone && !supplier.line)
      .slice(0, 5);

    // Expiring Tours (30 วันข้างหน้า)
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringToursData = tours
      .filter((tour) => {
        if (!tour.end_date || tour.end_date === "0000-00-00") return false;
        const endDate = new Date(tour.end_date);
        return endDate > now && endDate <= thirtyDaysLater;
      })
      .map((tour) => ({
        ...tour,
        supplier: suppliers.find((s) => s.id === tour.supplier_id),
      }))
      .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
      .slice(0, 5);

    setDashboardData({
      topSuppliers: suppliersWithTours,
      recentlyUpdated: recentSuppliers,
      missingInfo: incompleteSuppliers,
      expiringTours: expiringToursData,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      month: "short",
      day: "numeric",
    });
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const DashboardCard = ({ title, icon, children, linkTo, linkText }) => (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">{icon}</span>
            {title}
          </h3>
          {linkTo && (
            <Link
              to={linkTo}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {linkText || "ดูทั้งหมด →"}
            </Link>
          )}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          📊 Supplier Dashboard
        </h2>
        <p className="text-gray-600">ภาพรวมและการแจ้งเตือนสำคัญ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Suppliers */}
        <DashboardCard
          title="Top Suppliers"
          icon="🏆"
          linkTo="/suppliers"
          linkText="ดูทั้งหมด"
        >
          {dashboardData.topSuppliers.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.topSuppliers.map((supplier, index) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : index === 2
                          ? "bg-orange-600"
                          : "bg-blue-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <Link
                        to={`/suppliers/${supplier.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600"
                      >
                        {supplier.name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {supplier.tourCount} ทัวร์
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🏝️ {supplier.tourCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              ยังไม่มี Suppliers ที่มีทัวร์
            </p>
          )}
        </DashboardCard>

        {/* Recently Updated */}
        <DashboardCard title="อัพเดทล่าสุด" icon="🆕" linkTo="/suppliers">
          {dashboardData.recentlyUpdated.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentlyUpdated.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                >
                  <div>
                    <Link
                      to={`/suppliers/${supplier.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {supplier.name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      อัพเดท {formatDateTime(supplier.updated_at)}
                    </p>
                  </div>
                  <span className="text-blue-600 text-xs">🕒 ใหม่</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              ไม่มีการอัพเดทใน 7 วันล่าสุด
            </p>
          )}
        </DashboardCard>

        {/* Missing Information */}
        <DashboardCard
          title="ข้อมูลไม่ครบ"
          icon="⚠️"
          linkTo="/suppliers?filter=incomplete_info"
          linkText="แก้ไขทั้งหมด"
        >
          {dashboardData.missingInfo.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.missingInfo.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <Link
                      to={`/suppliers/${supplier.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {supplier.name}
                    </Link>
                    <p className="text-sm text-red-600">
                      ไม่มีเบอร์โทรและ Line
                    </p>
                  </div>
                  <button className="text-red-600 hover:text-red-800 text-xs">
                    แก้ไข →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-green-600">✅</span>
              <p className="text-green-600 text-sm mt-1">ข้อมูลครบถ้วนแล้ว</p>
            </div>
          )}
        </DashboardCard>

        {/* Expiring Tours */}
        <DashboardCard
          title="ทัวร์ใกล้หมดอายุ"
          icon="⏰"
          linkTo="/suppliers?filter=expiring_soon"
          linkText="ดูทั้งหมด"
        >
          {dashboardData.expiringTours.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.expiringTours.map((tour) => (
                <div
                  key={tour.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                >
                  <div>
                    <Link
                      to={`/edit/${tour.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {tour.tour_name}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {tour.supplier?.name} • หมดอายุ{" "}
                      {formatDate(tour.end_date)}
                    </p>
                  </div>
                  <span className="text-orange-600 text-xs">
                    ⏳{" "}
                    {Math.ceil(
                      (new Date(tour.end_date) - new Date()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    วัน
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-green-600">✅</span>
              <p className="text-green-600 text-sm mt-1">
                ไม่มีทัวร์ใกล้หมดอายุ
              </p>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">⚡</span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/add"
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
          >
            <span className="text-2xl mb-2">➕</span>
            <span className="text-sm font-medium text-blue-700">
              เพิ่มทัวร์ใหม่
            </span>
          </Link>

          <Link
            to="/suppliers?filter=no_tours"
            className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center"
          >
            <span className="text-2xl mb-2">🏢</span>
            <span className="text-sm font-medium text-yellow-700">
              Suppliers ไม่มีทัวร์
            </span>
          </Link>

          <button
            onClick={() => window.location.reload()}
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
          >
            <span className="text-2xl mb-2">🔄</span>
            <span className="text-sm font-medium text-gray-700">
              รีเฟรชข้อมูล
            </span>
          </button>

          <Link
            to="/suppliers?export=true"
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
          >
            <span className="text-2xl mb-2">📊</span>
            <span className="text-sm font-medium text-green-700">
              Export ข้อมูล
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
