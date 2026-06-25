import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "1"
  );
  const { user } = useAuth();

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
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 shadow-sm transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          collapsed ? "lg:w-16" : "lg:w-64"
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
          collapsed ? "lg:pl-16" : "lg:pl-64"
        }`}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Mobile: open drawer */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Desktop: collapse / expand sidebar */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="hidden lg:inline-flex p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeft className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.username}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
