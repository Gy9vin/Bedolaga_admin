import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout } from "@app/layouts/AdminLayout";
import { ProtectedRoute } from "@app/routes/ProtectedRoute";
import { DashboardPage } from "@pages/Dashboard/DashboardPage";
import { LoginPage } from "@pages/Auth/LoginPage";

export const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<DashboardPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
