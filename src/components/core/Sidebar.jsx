import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toursService } from "../../services/api-service";
import {
  Palmtree,
  Hotel,
  Car,
  UtensilsCrossed,
  Building2,
  Users,
  Package,
  ChevronDown,
  MapPin,
  LayoutList,
  LogOut,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";

// Static province list for modules without data yet (Hotels / Transfers)
const STATIC_PROVINCES = [
  "Krabi",
  "Phuket",
  "Phang Nga",
  "Samui",
  "Bangkok",
  "Hua Hin",
];

const Sidebar = ({ onNavigate, collapsed = false, onSetCollapsed }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeProvince = searchParams.get("province");

  const [tourProvinces, setTourProvinces] = useState([]);
  const [openGroups, setOpenGroups] = useState({});

  // collapse only affects the lg viewport; the mobile drawer is always full
  const lgHide = collapsed ? "lg:hidden" : "";
  const lgCenter = collapsed ? "lg:justify-center lg:px-0" : "";

  // Fetch distinct tour provinces from DB (destination)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const tours = await toursService.getAllTours();
        if (!mounted) return;
        const distinct = [
          ...new Set(
            (tours || [])
              .map((t) => (t.destination || "").trim())
              .filter(Boolean)
          ),
        ].sort((a, b) => a.localeCompare(b));
        setTourProvinces(distinct);
      } catch {
        setTourProvinces([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const groups = useMemo(
    () => [
      {
        key: "tours",
        label: "Tours",
        icon: Palmtree,
        children: [
          { label: "All Tours", to: "/", end: true },
          ...tourProvinces.map((p) => ({
            label: p,
            to: `/?province=${encodeURIComponent(p)}`,
            province: p,
          })),
        ],
      },
      {
        key: "hotels",
        label: "Hotels",
        icon: Hotel,
        children: [
          { label: "All Hotels", to: "/hotel", end: true },
          ...STATIC_PROVINCES.map((p) => ({
            label: p,
            to: `/hotel/${encodeURIComponent(p)}`,
          })),
        ],
      },
      {
        key: "restaurants",
        label: "Restaurants",
        icon: UtensilsCrossed,
        children: [
          { label: "All Restaurants", to: "/restaurant", end: true },
          ...STATIC_PROVINCES.map((p) => ({
            label: p,
            to: `/restaurant/${encodeURIComponent(p)}`,
          })),
        ],
      },
      {
        key: "transfers",
        label: "Transfers",
        icon: Car,
        children: STATIC_PROVINCES.map((p) => ({
          label: p,
          to: `/transfer/${encodeURIComponent(p)}`,
        })),
      },
    ],
    [tourProvinces]
  );

  const singles = [
    // { label: "Tour Packages", to: "/packages", icon: Package },
    { label: "Suppliers", to: "/suppliers", icon: Building2 },
    {
      label: isAdmin() ? "Users" : "My Account",
      to: "/users",
      icon: Users,
    },
  ];

  const isGroupActive = (key) => {
    if (key === "tours") return location.pathname === "/";
    if (key === "hotels") return location.pathname.startsWith("/hotel");
    if (key === "restaurants")
      return location.pathname.startsWith("/restaurant");
    if (key === "transfers") return location.pathname.startsWith("/transfer");
    return false;
  };

  // Auto-open the group matching the current route
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      ["tours", "hotels", "restaurants", "transfers"].forEach((key) => {
        if (isGroupActive(key)) next[key] = true;
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  const handleGroupClick = (key) => {
    // when collapsed, clicking a group expands the rail first then opens it
    if (collapsed) {
      onSetCollapsed?.(false);
      setOpenGroups((prev) => ({ ...prev, [key]: true }));
      return;
    }
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isChildActive = (child, groupKey) => {
    if (groupKey === "tours") {
      if (child.end) return location.pathname === "/" && !activeProvince;
      return location.pathname === "/" && activeProvince === child.province;
    }
    return location.pathname === child.to.split("?")[0];
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div
        className={`group flex items-center h-16 border-b border-gray-200 px-5 ${
          collapsed ? "lg:px-0 lg:justify-center" : ""
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={`relative flex items-center justify-center w-9 h-9 rounded-lg bg-brand-600 text-white shadow-sm shrink-0 ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            <Palmtree className="w-5 h-5" />
          </div>
          <div
            className={`leading-tight whitespace-nowrap transition-all duration-200 ${
              collapsed ? "lg:w-0 lg:opacity-0" : "opacity-100"
            }`}
          >
            <p className="text-sm font-bold text-gray-900">Contract Rate</p>
            <p className="text-[11px] text-gray-400">Price Management</p>
          </div>
        </div>

        {/* Desktop: collapse / expand sidebar */}
        <button
          onClick={() => onSetCollapsed?.(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`hidden lg:inline-flex p-2 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors ${
            collapsed ? "" : "ml-auto"
          }`}
        >
          {collapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p
          className={`px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 ${lgHide}`}
        >
          Catalog
        </p>

        {groups.map((group) => {
          const Icon = group.icon;
          const open = openGroups[group.key];
          const groupActive = isGroupActive(group.key);
          return (
            <div key={group.key}>
              <button
                onClick={() => handleGroupClick(group.key)}
                title={collapsed ? group.label : undefined}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${lgCenter} ${
                  groupActive
                    ? "text-brand-700 bg-brand-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                    groupActive ? "text-brand-600" : "text-gray-400"
                  }`}
                />
                <span className={`flex-1 text-left whitespace-nowrap ${lgHide}`}>
                  {group.label}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${lgHide} ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Submenu — animated open/close via grid-rows */}
              <div
                className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${lgHide} ${
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="mt-1 mb-1 ml-4 pl-3 border-l border-gray-200 space-y-0.5">
                    {group.children.map((child) => {
                      const active = isChildActive(child, group.key);
                      return (
                        <Link
                          key={child.label}
                          to={child.to}
                          onClick={onNavigate}
                          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                            active
                              ? "bg-brand-100 text-brand-700 font-medium"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          {child.province !== undefined ||
                          group.key !== "tours" ? (
                            <MapPin className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          ) : (
                            <LayoutList className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          )}
                          <span className="truncate">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Divider shown only in collapsed rail (desktop) */}
        {collapsed && (
          <div className="hidden lg:block mx-2 my-2 border-t border-gray-200" />
        )}

        <p
          className={`px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 ${lgHide}`}
        >
          Management
        </p>

        {singles.map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${lgCenter} ${
                active
                  ? "text-brand-700 bg-brand-50"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                  active ? "text-brand-600" : "text-gray-400"
                }`}
              />
              <span className={`whitespace-nowrap ${lgHide}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-200 p-3">
        <div
          className={`flex items-center gap-3 px-2 py-2 rounded-lg ${lgCenter}`}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-semibold text-sm uppercase shrink-0">
            {user?.username?.charAt(0) || "U"}
          </div>
          <div className={`flex-1 min-w-0 ${lgHide}`}>
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-400">
              {user?.role === "admin" ? "Administrator" : "User"}
            </p>
          </div>
          <button
            onClick={logout}
            className={`p-2 rounded-md text-gray-400 hover:text-danger-600 hover:bg-danger-50 transition-colors ${lgHide}`}
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
