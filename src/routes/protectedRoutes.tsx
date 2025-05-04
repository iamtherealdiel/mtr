import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { ROUTES } from "./routeConstants";

// Protected pages
import AdminPanel from "../features/admin/pages/AdminPanel";
import Dashboard from "../features/dashboard/pages/Dashboard";
import LabelGrowth from "../pages/LabelGrowth";
import Messages from "../pages/Messages";
import ShowGrowth from "../pages/ShowGrowth";

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_PANEL}
        element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MESSAGES}
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.LABEL_GROWTH}
        element={
          <ProtectedRoute>
            <LabelGrowth />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SHOW_GROWTH}
        element={
          <ProtectedRoute>
            <ShowGrowth />
          </ProtectedRoute>
        }
      />

      {/* Redirect unauthorized access */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} />} />
    </Routes>
  );
};

export default ProtectedRoutes;
