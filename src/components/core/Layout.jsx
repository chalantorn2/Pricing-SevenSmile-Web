import { Outlet, useLocation } from "react-router-dom";
import TopBar from "./TopBar";

// Module screens: the top bar carries all navigation — there is no sidebar.
const Layout = () => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-surface">
      <TopBar nav />
      <main className="p-4 lg:p-6">
        <div key={pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
