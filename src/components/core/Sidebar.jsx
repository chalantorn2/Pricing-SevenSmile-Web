import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  ChevronRight,
  MapPin,
  LayoutList,
  LogOut,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";

// Static province list for modules without data yet (Hotels / Restaurants)
const STATIC_PROVINCES = [
  "Krabi",
  "Phuket",
  "Phang Nga",
  "Samui",
  "Bangkok",
  "Hua Hin",
];

const FLYOUT_WIDTH = 200;

const Sidebar = ({ onNavigate, collapsed = false, onSetCollapsed }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const activeProvince = searchParams.get("province");

  const [tourProvinces, setTourProvinces] = useState([]);
  // { key, top, left } of the province flyout, or null when nothing is open
  const [flyout, setFlyout] = useState(null);
  const closeTimer = useRef(null);

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
        to: "/",
        children: tourProvinces.map((p) => ({
          label: p,
          to: `/?province=${encodeURIComponent(p)}`,
          province: p,
        })),
      },
      {
        key: "hotels",
        label: "Hotels",
        icon: Hotel,
        to: "/hotel",
        children: STATIC_PROVINCES.map((p) => ({
          label: p,
          to: `/hotel/${encodeURIComponent(p)}`,
        })),
      },
      {
        key: "restaurants",
        label: "Restaurants",
        icon: UtensilsCrossed,
        to: "/restaurant",
        children: STATIC_PROVINCES.map((p) => ({
          label: p,
          to: `/restaurant/${encodeURIComponent(p)}`,
        })),
      },
      // No province children: a transfer route links two provinces rather than
      // sitting in one, so splitting the rate sheet by province hides half of it.
      // The screen itself is where you narrow the routes down.
      { key: "transfers", label: "Transfers", icon: Car, to: "/transfer", children: [] },
    ],
    [tourProvinces]
  );

  const singles = [
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

  const isChildActive = (child, groupKey) => {
    if (groupKey === "tours") {
      return location.pathname === "/" && activeProvince === child.province;
    }
    return location.pathname === child.to.split("?")[0];
  };

  const isAllActive = (group) => {
    if (group.key === "tours")
      return location.pathname === "/" && !activeProvince;
    return location.pathname === group.to;
  };

  // Flyout is positioned fixed so the scrollable nav never clips it
  const openFlyout = useCallback((key, el) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const rect = el.getBoundingClientRect();
    const maxHeight = Math.min(window.innerHeight * 0.7, 420);
    setFlyout({
      key,
      top: Math.max(
        8,
        Math.min(rect.top, window.innerHeight - maxHeight - 8)
      ),
      left: rect.right + 6,
    });
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setFlyout(null), 140);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Close the flyout whenever the route changes or the rail is scrolled
  useEffect(() => {
    setFlyout(null);
  }, [location.pathname, location.search]);

  const activeGroup = flyout
    ? groups.find((g) => g.key === flyout.key)
    : null;

  return (
    <div className="flex flex-col h-full bg-brand-800 text-white">
      {/* Logo */}
      <div
        className={`flex items-center h-16 border-b border-brand-700 px-4 ${
          collapsed ? "lg:px-0 lg:justify-center" : ""
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-lg bg-white text-brand-700 shrink-0 ${
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
            <p className="text-sm font-bold">Contract Rate</p>
            <p className="text-[11px] text-brand-200">Price Management</p>
          </div>
        </div>

        {/* Desktop: collapse / expand sidebar */}
        <button
          onClick={() => onSetCollapsed?.(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`hidden lg:inline-flex p-1.5 rounded-md text-brand-200 hover:text-white hover:bg-brand-700 transition-colors ${
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
      <nav
        className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5"
        onScroll={() => setFlyout(null)}
      >
        <p
          className={`px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-200/70 ${lgHide}`}
        >
          Catalog
        </p>

        {groups.map((group) => {
          const Icon = group.icon;
          const groupActive = isGroupActive(group.key);
          // A group with nothing to branch into is a plain link: no chevron, and
          // hovering it closes whatever flyout another group left open.
          const hasChildren = group.children.length > 0;
          return (
            <div
              key={group.key}
              data-group-row
              className={`flex items-center rounded-lg transition-colors ${
                groupActive
                  ? "bg-brand-600 text-white"
                  : "text-brand-100 hover:bg-brand-700 hover:text-white"
              }`}
              onMouseEnter={(e) =>
                hasChildren ? openFlyout(group.key, e.currentTarget) : setFlyout(null)
              }
              onMouseLeave={hasChildren ? scheduleClose : undefined}
            >
              <Link
                to={group.to}
                onClick={onNavigate}
                title={collapsed ? group.label : undefined}
                className={`flex-1 min-w-0 flex items-center gap-2.5 pl-2.5 py-2 text-sm font-medium ${lgCenter}`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    groupActive ? "text-white" : "text-brand-200"
                  }`}
                />
                <span className={`truncate ${lgHide}`}>{group.label}</span>
              </Link>
              {/* Touch devices have no hover — this opens the flyout on tap */}
              {hasChildren && (
                <button
                  type="button"
                  aria-label={`Show ${group.label} provinces`}
                  onClick={(e) => {
                    const row = e.currentTarget.closest("[data-group-row]");
                    if (flyout?.key === group.key) setFlyout(null);
                    else openFlyout(group.key, row);
                  }}
                  className={`px-2 py-2 shrink-0 ${lgHide}`}
                >
                  <ChevronRight className="w-4 h-4 text-brand-200" />
                </button>
              )}
            </div>
          );
        })}

        {/* Divider shown only in collapsed rail (desktop) */}
        {collapsed && (
          <div className="hidden lg:block mx-2 my-2 border-t border-brand-700" />
        )}

        <p
          className={`px-2 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-200/70 ${lgHide}`}
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
              onMouseEnter={() => setFlyout(null)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium rounded-lg transition-colors ${lgCenter} ${
                active
                  ? "bg-brand-600 text-white"
                  : "text-brand-100 hover:bg-brand-700 hover:text-white"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  active ? "text-white" : "text-brand-200"
                }`}
              />
              <span className={`truncate ${lgHide}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Province flyout — fixed so the scrolling nav cannot clip it */}
      {activeGroup && (
        <div
          className="fixed z-[60] rounded-lg bg-white shadow-xl border border-gray-200 py-1 overflow-y-auto"
          style={{
            top: flyout.top,
            left: flyout.left,
            width: FLYOUT_WIDTH,
            maxHeight: "min(70vh, 420px)",
          }}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {activeGroup.label}
          </p>
          <Link
            to={activeGroup.to}
            onClick={onNavigate}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
              isAllActive(activeGroup)
                ? "bg-brand-50 text-brand-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <LayoutList className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="truncate">All {activeGroup.label}</span>
          </Link>
          {activeGroup.children.map((child) => {
            const active = isChildActive(child, activeGroup.key);
            return (
              <Link
                key={child.label}
                to={child.to}
                onClick={onNavigate}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span className="truncate">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* User footer */}
      <div className="border-t border-brand-700 p-2">
        <div
          className={`flex items-center gap-2.5 px-1.5 py-1.5 rounded-lg ${lgCenter}`}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white font-semibold text-sm uppercase shrink-0">
            {user?.username?.charAt(0) || "U"}
          </div>
          <div className={`flex-1 min-w-0 ${lgHide}`}>
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-brand-200">
              {user?.role === "admin" ? "Administrator" : "User"}
            </p>
          </div>
          <button
            onClick={logout}
            className={`p-1.5 rounded-md text-brand-200 hover:text-white hover:bg-danger-600 transition-colors ${lgHide}`}
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
