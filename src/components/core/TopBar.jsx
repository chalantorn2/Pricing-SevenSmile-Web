import { Link, useLocation } from "react-router-dom";
import {
  Palmtree,
  Hotel,
  Car,
  UtensilsCrossed,
  Building2,
  Users,
  Home,
  Package,
  LogOut,
} from "lucide-react";
import { useI18n } from "../../i18n";
import { useAuth } from "../../hooks/useAuth";

// The one app-wide chrome since the sidebar retired: brand + (optional) module
// nav + language toggle + user. `nav` is off on the launcher, where the category
// cards are the navigation.
//
// Layout notes:
// - The container is wide (7xl) and the pills drop their icons below xl, so the
//   single brand row fits at every desktop width — no header scrollbar.
// - User management is NOT in the catalog nav: it is admin territory, so it sits
//   in the account cluster as an icon link (labelled "My account" for regular
//   users, who can still reach their own profile there).
// - Below lg the nav becomes a swipe strip under the brand row (bar hidden).
const NAV_ITEMS = [
  { to: "/", label: "nav.home", icon: Home, match: (p) => p === "/" },
  {
    to: "/tours",
    label: "nav.tours",
    icon: Palmtree,
    match: (p) =>
      p.startsWith("/tours") ||
      p.startsWith("/tour/") ||
      p.startsWith("/edit/") ||
      p === "/add",
  },
  {
    to: "/hotel",
    label: "nav.hotels",
    icon: Hotel,
    match: (p) => p.startsWith("/hotel"),
  },
  {
    to: "/restaurant",
    label: "nav.restaurants",
    icon: UtensilsCrossed,
    match: (p) => p.startsWith("/restaurant"),
  },
  {
    to: "/transfer",
    label: "nav.transfers",
    icon: Car,
    match: (p) => p.startsWith("/transfer"),
  },
  {
    to: "/packages",
    label: "nav.packages",
    icon: Package,
    match: (p) => p.startsWith("/packages"),
  },
  {
    to: "/suppliers",
    label: "nav.suppliers",
    icon: Building2,
    match: (p) => p.startsWith("/suppliers"),
  },
];

const pill = (active) =>
  `flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
    active
      ? "bg-brand-50 text-brand-700"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  }`;

const TopBar = ({ nav = false }) => {
  const { t, lang, setLang } = useI18n();
  const { user, logout, isAdmin } = useAuth();
  const { pathname } = useLocation();

  const onUsers = pathname.startsWith("/users");

  return (
    <header className={`sticky top-0 z-40 border-b border-gray-200/70 bg-white/85 backdrop-blur ${nav ? "pb-12 lg:pb-0" : ""}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Single row: brand, catalog nav, account cluster */}
        <div className="flex h-16 items-center gap-2">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Palmtree className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-gray-900">Contract Rate</p>
              <p className="hidden text-[11px] text-gray-500 sm:block">
                {t("brand.tagline")}
              </p>
            </div>
          </Link>

          {/* Catalog nav — desktop sits inline, small screens swipe */}
          {nav && (
            <>
              <nav
                className="no-scrollbar ml-2 hidden min-w-0 items-center gap-0.5 overflow-x-auto lg:flex"
                aria-label={t("nav.catalog")}
              >
                {NAV_ITEMS.map((item) => (
                  <Link key={item.to} to={item.to} className={pill(item.match(pathname))}>
                    <item.icon className="hidden h-4 w-4 xl:block" />
                    {t(item.label)}
                  </Link>
                ))}
              </nav>

              {/* Mobile/tablet strip under the row */}
              <nav
                className="no-scrollbar absolute left-0 right-0 top-full flex items-center gap-1 overflow-x-auto border-b border-gray-200/70 bg-white/90 px-4 py-2 backdrop-blur sm:px-6 lg:hidden"
                aria-label={t("nav.catalog")}
              >
                {NAV_ITEMS.map((item) => (
                  <Link key={item.to} to={item.to} className={pill(item.match(pathname))}>
                    <item.icon className="h-4 w-4" />
                    {t(item.label)}
                  </Link>
                ))}
              </nav>

            </>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {/* Language toggle */}
            <div
              className="flex rounded-lg bg-gray-100 p-0.5"
              role="group"
              aria-label={t("lang.switch")}
            >
              {["th", "en"].map((code) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
                    lang === code
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {code === "th" ? t("lang.thai") : t("lang.english")}
                </button>
              ))}
            </div>

            {/* User chip */}
            <div className="hidden items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 ring-1 ring-inset ring-gray-200 md:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold uppercase text-white">
                {user?.username?.charAt(0) || "U"}
              </div>
              <div className="hidden leading-tight xl:block">
                <p className="max-w-[8rem] truncate text-xs font-semibold text-gray-900">
                  {user?.username}
                </p>
                <p className="text-[10px] text-gray-400">
                  {user?.role === "admin" ? t("role.admin") : t("role.user")}
                </p>
              </div>
            </div>

            {/* Users / my account — kept out of the catalog nav on purpose */}
            <Link
              to="/users"
              title={isAdmin() ? t("nav.users") : t("nav.myAccount")}
              aria-label={isAdmin() ? t("nav.users") : t("nav.myAccount")}
              className={`flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 transition-colors ${
                onUsers
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              <Users className="h-4.5 w-4.5" />
            </Link>

            <button
              onClick={logout}
              title={t("common.logout")}
              aria-label={t("common.logout")}
              className="min-h-11 min-w-11 rounded-lg p-2 text-gray-400 transition-colors hover:bg-danger-50 hover:text-danger-600"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};

export default TopBar;
