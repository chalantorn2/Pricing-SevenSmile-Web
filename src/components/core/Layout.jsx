import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "1"
  );
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-56 shadow-sm transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          collapsed ? "lg:w-14" : "lg:w-56"
        } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar
          collapsed={collapsed}
          onSetCollapsed={setCollapsed}
          onNavigate={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          collapsed ? "lg:pl-14" : "lg:pl-56"
        }`}
      >
        {/* Mobile: floating button to open the drawer */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-3 left-3 z-30 p-2 rounded-lg bg-white shadow-md border border-gray-200 text-gray-500 hover:text-gray-900"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page content */}
        <main className="p-4 pt-16 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
