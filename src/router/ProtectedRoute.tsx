import { Navigate, useLocation } from "react-router-dom";
import { useLockerStore } from "../store/lockerStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVault?: boolean;
}

const ProtectedRoute = ({
  children,
  requireVault = false,
}: ProtectedRouteProps) => {
  const isLockerInitialized = useLockerStore(
    (state) => state.isLockerInitialized
  );
  const location = useLocation();

  if (!requireVault && isLockerInitialized && location.pathname === "/") {
    return <Navigate to="/dashboard" replace />;
  }

  if (
    requireVault &&
    !isLockerInitialized &&
    location.pathname === "/dashboard"
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
