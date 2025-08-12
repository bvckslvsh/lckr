import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./router/ProtectedRoute";
import LockerDashboard from "./pages/LockerDashboard";
import LockerSetup from "./pages/LockerSetup";
import Landing from "./pages/Landing";
import { NotificationProvider } from "./notifications/NotificationProvider";

function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <LockerSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireVault>
              <LockerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </NotificationProvider>
  );
}

export default App;
