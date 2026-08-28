import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Layout } from "./components/core";
import Login from "./pages/auth/Login";
import TourList from "./pages/tours/TourList";
import TourDetail from "./pages/tours/TourDetail";
import AddTour from "./pages/tours/AddTour";
import TransferList from "./pages/transfers/TransferList";
import HotelList from "./pages/hotels/HotelList";
import HotelDetail from "./pages/hotels/HotelDetail";
import HotelRateEditor from "./pages/hotels/HotelRateEditor";
import HotelNoticeEditor from "./pages/hotels/HotelNoticeEditor";
import RestaurantList from "./pages/restaurants/RestaurantList";
import RestaurantDetail from "./pages/restaurants/RestaurantDetail";
import RestaurantRateEditor from "./pages/restaurants/RestaurantRateEditor";
import UserManagement from "./pages/users/UserManagement";
import SupplierList from "./pages/suppliers/SupplierList";
import SupplierDetail from "./pages/suppliers/SupplierDetail";
import SharedTour from "./pages/tours/SharedTour";
import EditTour from "./pages/tours/EditTour";
import BulkEditTours from "./pages/tours/BulkEditTours";
import PackageTourList from "./pages/packages/PackageTourList";
import PackageTourForm from "./pages/packages/PackageTourForm";
import PackageTourView from "./pages/packages/PackageTourView";
import "./index.css";

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// App Routes Component
const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/share/tour/:id" element={<SharedTour />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Tours Routes */}
        <Route index element={<TourList />} />
        <Route path="add" element={<AddTour />} />
        <Route path="tour/:id" element={<TourDetail />} />
        <Route path="edit/:id" element={<EditTour />} />
        <Route path="edit-tours/:supplierId" element={<BulkEditTours />} />

        {/* Package Tours Routes */}
        <Route path="packages" element={<PackageTourList />} />
        <Route path="packages/create" element={<PackageTourForm />} />
        <Route path="packages/edit/:id" element={<PackageTourForm />} />
        <Route path="packages/view/:id" element={<PackageTourView />} />

        {/* Supplier Routes */}
        <Route path="suppliers" element={<SupplierList />} />
        <Route path="suppliers/:id" element={<SupplierDetail />} />

        {/* Transfer Routes */}
        <Route path="transfer" element={<TransferList />} />
        <Route path="transfer/:province" element={<TransferList />} />

        {/* Hotel Routes */}
        <Route path="hotel" element={<HotelList />} />
        <Route path="hotel/view/:slug" element={<HotelDetail />} />
        <Route path="hotel/rates/:slug" element={<HotelRateEditor />} />
        <Route path="hotel/notices/:slug" element={<HotelNoticeEditor />} />
        <Route path="hotel/:province" element={<HotelList />} />

        {/* Restaurant Routes */}
        <Route path="restaurant" element={<RestaurantList />} />
        <Route path="restaurant/view/:slug" element={<RestaurantDetail />} />
        <Route path="restaurant/rates/:slug" element={<RestaurantRateEditor />} />
        <Route path="restaurant/:province" element={<RestaurantList />} />

        {/* User Management Routes */}
        <Route path="users" element={<UserManagement />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
