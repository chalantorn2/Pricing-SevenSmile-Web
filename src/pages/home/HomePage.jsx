import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Palmtree,
  Hotel,
  Car,
  UtensilsCrossed,
  Building2,
  Package,
  Search,
  AlertTriangle,
  History,
  ArrowRight,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { useI18n } from "../../i18n";
import { useAuth } from "../../hooks/useAuth";
import TopBar from "../../components/core/TopBar";
import { statsService, searchService } from "../../services/api-service";
import { getRecentItems } from "../../utils/recentItems";

// One focused card per module. Keep the launcher intentionally quiet: the
// destination filters belong inside each module, not on the home screen.
const CARDS = [
  { key: "tours", icon: Palmtree, to: "/tours", countKey: "tours" },
  { key: "hotels", icon: Hotel, to: "/hotel", countKey: "hotels" },
  {
    key: "restaurants",
    icon: UtensilsCrossed,
    to: "/restaurant",
    countKey: "restaurants",
  },
  { key: "transfers", icon: Car, to: "/transfer", countKey: "transferRoutes" },
  { key: "suppliers", icon: Building2, to: "/suppliers", countKey: "suppliers" },
  { key: "packages", icon: Package, to: "/packages", countKey: "packages" },
];

// Where each search-result group links. `itemTo` is the detail page; transfer
// routes have none, so their rows open the list pre-filtered instead.
const RESULT_GROUPS = [
  {
    key: "tours",
    icon: Palmtree,
    listTo: (q) => `/tours?q=${encodeURIComponent(q)}`,
    itemTo: (id) => `/tour/${id}`,
  },
  {
    key: "hotels",
    icon: Hotel,
    listTo: (q) => `/hotel?q=${encodeURIComponent(q)}`,
    itemTo: (id) => `/hotel/view/${id}`,
  },
  {
    key: "restaurants",
    icon: UtensilsCrossed,
    listTo: (q) => `/restaurant?q=${encodeURIComponent(q)}`,
    itemTo: (id) => `/restaurant/view/${id}`,
  },
  {
    key: "suppliers",
    icon: Building2,
    listTo: (q) => `/suppliers?q=${encodeURIComponent(q)}`,
    itemTo: (id) => `/suppliers/${id}`,
  },
  {
    key: "transfers",
    icon: Car,
    listTo: (q) => `/transfer?q=${encodeURIComponent(q)}`,
    itemTo: null,
  },
];

const greetingKeyForHour = (hour) => {
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
};

// Where a recently-opened item lives, per type. Hotel/restaurant use slugs.
const RECENT_ROUTES = {
  tour: (id) => `/tour/${id}`,
  hotel: (id) => `/hotel/view/${id}`,
  restaurant: (id) => `/restaurant/view/${id}`,
  supplier: (id) => `/suppliers/${id}`,
};

const RECENT_ICONS = {
  tour: Palmtree,
  hotel: Hotel,
  restaurant: UtensilsCrossed,
  supplier: Building2,
};

const CategoryCard = ({ card, counts, index }) => {
  const { t } = useI18n();
  const Icon = card.icon;
  const count = counts ? counts[card.countKey] : undefined;

  return (
    <Link
      to={card.to}
      style={{ "--stagger": `${index * 55}ms` }}
      className="group card-enter flex min-h-44 flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-soft ring-1 ring-gray-100 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:ring-brand-200 active:translate-y-0"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
          <Icon className="w-5.5 h-5.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 font-bold text-gray-900">
            <span className="truncate">{t(`home.card.${card.key}`)}</span>
            <ArrowRight className="w-4 h-4 shrink-0 text-gray-300 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-brand-500" />
          </p>
          <p className="truncate text-sm text-gray-500">
            {t(`home.desc.${card.key}`)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xl font-bold text-gray-900">
        {count === undefined ? (
          <span className="inline-block h-7 w-12 animate-pulse rounded bg-gray-100 align-middle" />
        ) : (
          <>
            {count.toLocaleString()}{" "}
            <span className="text-sm font-medium text-gray-500">
              {t(`home.unit.${card.key}`)}
            </span>
          </>
        )}
      </p>

      <div className="mt-auto pt-3">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-600">
          {t("common.openModule")}
          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
};

const SearchResults = ({ searching, results, query, onOpenList }) => {
  const { t } = useI18n();

  if (searching) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-4 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
        {t("home.searching")}
      </div>
    );
  }

  const open = RESULT_GROUPS.filter((g) => results?.groups?.[g.key]?.total > 0);
  if (!results || open.length === 0) {
    return (
      <div className="px-4 py-5 text-center">
        <p className="text-sm font-medium text-gray-700">
          {t("home.noResults")}
        </p>
        <p className="mt-0.5 text-xs text-gray-400">
          {t("home.noResultsHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto">
      {open.map((group) => {
        const { items, total } = results.groups[group.key];
        const Icon = group.icon;
        return (
          <div key={group.key} className="border-b border-gray-100 last:border-b-0">
            {/* Group header — module name, match count, link into the full list */}
            <div className="flex items-center gap-2 bg-gray-50/70 px-4 py-2">
              <Icon className="w-3.5 h-3.5 text-brand-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {t(`home.card.${group.key}`)}
              </span>
              <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] font-semibold text-gray-500 ring-1 ring-inset ring-gray-200">
                {total}
              </span>
              <button
                type="button"
                onClick={() => onOpenList(group.listTo(query))}
                className="ml-auto inline-flex items-center gap-0.5 text-xs font-medium text-brand-600 hover:text-brand-700 hover:underline"
              >
                {t("home.seeAllIn", { module: t(`home.card.${group.key}`) })}
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenList(
                        group.itemTo ? group.itemTo(item.id) : group.listTo(query)
                      )
                    }
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-brand-50/60"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                      {item.name}
                    </span>
                    {item.sub && (
                      <span className="hidden max-w-[10rem] shrink-0 truncate text-xs text-gray-400 sm:block">
                        {item.sub}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-300" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

const HomePage = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  // undefined = nothing searched yet, object = last response
  const [results, setResults] = useState(undefined);
  const [recent, setRecent] = useState([]);
  // Guard against out-of-order responses while the user keeps typing
  const requestId = useRef(0);

  // undefined = loading, null = failed, object = loaded
  const [stats, setStats] = useState(undefined);

  // Bookmarks from before the home screen existed pointed at the tour list via
  // /?province=X — send them on to the list's new address.
  useEffect(() => {
    const province = searchParams.get("province");
    if (province) {
      navigate(`/tours?province=${encodeURIComponent(province)}`, {
        replace: true,
      });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await statsService.getStats();
        if (mounted) setStats(data);
      } catch {
        // Cards fall back to placeholder counts; the lists themselves still work.
        if (mounted) setStats(null);
      }
    })();
    setRecent(getRecentItems());
    return () => {
      mounted = false;
    };
  }, []);

  // Live search: debounce keystrokes, then query every module at once. Results
  // land grouped in the panel under the box.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(undefined);
      setSearching(false);
      return undefined;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      const id = ++requestId.current;
      try {
        const data = await searchService.getGlobalSearch(q);
        if (requestId.current === id) {
          setResults(data);
          setSearching(false);
        }
      } catch {
        if (requestId.current === id) {
          setResults(null);
          setSearching(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const displayName =
    user?.nickname || user?.full_name || user?.username || "";

  const greeting = useMemo(
    () => t(`home.greeting.${greetingKeyForHour(new Date().getHours())}`),
    [t]
  );

  const expiredTours = stats?.counts?.expiredTours ?? 0;

  const openResult = (to) => {
    setPanelOpen(false);
    navigate(to);
  };

  const handleSubmit = (e) => {
    // Search is live as the user types — Enter just keeps the panel open.
    e.preventDefault();
    if (query.trim().length >= 2) setPanelOpen(true);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Same chrome as module pages, minus the nav row — the cards below are
          the navigation here */}
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        {/* Greeting + the one big search */}
        <section className="pb-8 pt-10 text-center sm:pt-14">
          <h1 className="text-3xl font-bold text-gray-900">
            {greeting}
            {displayName ? `, ${displayName}` : ""}
          </h1>
          <p className="mt-1.5 text-base text-gray-500">{t("home.subtitle")}</p>

          <div className="relative mx-auto mt-7 max-w-2xl">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center gap-3 rounded-2xl bg-white py-1 pl-4 pr-1 shadow-soft ring-1 ring-gray-200 transition-shadow focus-within:ring-2 focus-within:ring-brand-500/40">
                <Search className="w-5 h-5 shrink-0 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setPanelOpen(true)}
                  onBlur={() => {
                    // Let the mousedown on a result land before the panel folds
                    setTimeout(() => setPanelOpen(false), 150);
                  }}
                  onKeyDown={(e) => e.key === "Escape" && setPanelOpen(false)}
                  placeholder={t("home.searchPlaceholder")}
                  className="w-full bg-transparent py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    title={t("home.closeSearch")}
                    className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button type="submit" className="btn-primary shrink-0 rounded-xl">
                  {t("common.search")}
                </button>
              </div>
            </form>

            {/* Grouped results, one section per module */}
            {panelOpen && query.trim().length >= 2 && (
              <div
                className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl bg-white text-left shadow-soft ring-1 ring-gray-200"
                onMouseDown={(e) => {
                  // Keep the input focused while the click travels to a result
                  e.preventDefault();
                }}
              >
                <SearchResults
                  searching={searching}
                  results={results}
                  query={query.trim()}
                  onOpenList={openResult}
                />
              </div>
            )}
          </div>
        </section>

        {/* Expired tours — surface the one thing that needs attention */}
        {expiredTours > 0 && (
          <Link
            to="/tours?status=expired"
            className="mb-6 flex items-center gap-2.5 rounded-2xl bg-warning-50 px-4 py-3 text-sm text-warning-800 ring-1 ring-inset ring-warning-200 hover:bg-warning-100"
          >
            <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-warning-600" />
            <span className="flex-1">
              {t("tours.expiredBanner", { count: expiredTours })}
            </span>
            <span className="hidden items-center gap-0.5 font-semibold text-warning-700 md:inline-flex">
              {t("tours.reviewThem")}
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        )}

        {/* Category cards */}
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((card, index) => (
              <CategoryCard
                key={card.key}
                card={card}
                counts={stats?.counts}
                index={index}
              />
            ))}
          </div>
          {stats === null && (
            <p className="mt-3 text-center text-sm text-gray-400">
              {t("home.statsError")}
            </p>
          )}
        </section>

        {/* Recently opened */}
        {recent.length > 0 && (
          <section className="mt-6 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-gray-100">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <History className="w-4 h-4 text-gray-400" />
              {t("home.recent")}
            </h2>
            <ul className="mt-2 divide-y divide-gray-100">
              {recent.slice(0, 4).map((item) => {
                const Icon = RECENT_ICONS[item.type] || History;
                const to = RECENT_ROUTES[item.type]?.(item.id);
                if (!to) return null;
                return (
                  <li key={`${item.type}-${item.id}`}>
                    <Link
                      to={to}
                      className="flex items-center gap-2.5 py-2 text-sm text-gray-700 hover:text-brand-700"
                    >
                      <Icon className="w-4 h-4 shrink-0 text-gray-400" />
                      <span className="min-w-0 flex-1 truncate">{item.name}</span>
                      <span className="shrink-0 rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-500 ring-1 ring-inset ring-gray-200">
                        {t(`home.type.${item.type}`)}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-300" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
};

export default HomePage;
