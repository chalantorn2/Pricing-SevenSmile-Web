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
import AddTour from "./pages/tours/AddTour";
import TransferList from "./pages/transfers/TransferList";
import HotelList from "./pages/hotels/HotelList";
import UserManagement from "./pages/users/UserManagement";
import SupplierList from "./pages/suppliers/SupplierList";
import SupplierDetail from "./pages/suppliers/SupplierDetail";
import SharedTour from "./pages/tours/SharedTour";
import EditTour from "./pages/tours/EditTour";
import "./index.css";

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <Route path="edit/:id" element={<EditTour />} />

        {/* ✨ Supplier Routes */}
        <Route path="suppliers" element={<SupplierList />} />
        <Route path="suppliers/:id" element={<SupplierDetail />} />

        {/* Transfer Routes */}
        <Route path="transfer" element={<TransferList />} />

        {/* Hotel Routes */}
        <Route path="hotel" element={<HotelList />} />

        {/* User Management Routes */}
        <Route
          path="users"
          element={
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          }
        />
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
