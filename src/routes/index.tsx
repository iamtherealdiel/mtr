import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import HomePage from "../pages/HomePage";
import ProtectedRoutes from "./protectedRoutes";
import PublicRoutes from "./publicRoutes";
import { ROUTES } from "./routeConstants";

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Home route */}
      <Route path={ROUTES.HOME} element={<HomePage />} />

      {/* Choose between protected and public routes based on authentication status */}
      {user ? (
        <Route path="/*" element={<ProtectedRoutes />} />
      ) : (
        <>
          <Route path="/*" element={<PublicRoutes />} />
          {/* Redirect dashboard attempts to home if not logged in */}
          <Route
            path={ROUTES.DASHBOARD}
            element={<Navigate to={ROUTES.HOME} replace />}
          />
        </>
      )}
    </Routes>
  );
};

export default AppRoutes;
