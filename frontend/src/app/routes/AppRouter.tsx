import { Navigate, Route, Routes } from "react-router-dom";

import { AdminLayout } from "@app/layouts/AdminLayout";
import { ProtectedRoute } from "@app/routes/ProtectedRoute";
import { DashboardPage } from "@pages/Dashboard/DashboardPage";
import { LoginPage } from "@pages/Auth/LoginPage";
import { UsersListPage } from "@pages/Users/UsersListPage";
import { UserDetailPage } from "@pages/Users/UserDetailPage";
import { SubscriptionsListPage } from "@pages/Subscriptions/SubscriptionsListPage";
import { SubscriptionDetailPage } from "@pages/Subscriptions/SubscriptionDetailPage";
import { TokensPage } from "@pages/Tokens/TokensPage";

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
      <Route path="users" element={<UsersListPage />} />
      <Route path="users/:userId" element={<UserDetailPage />} />
      <Route path="subscriptions" element={<SubscriptionsListPage />} />
      <Route path="subscriptions/:subscriptionId" element={<SubscriptionDetailPage />} />
      <Route path="tokens" element={<TokensPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
