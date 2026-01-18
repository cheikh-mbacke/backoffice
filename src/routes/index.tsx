// src/routes/index.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoginPage } from "@/pages/Login";
import { ProfileSelectionPage } from "@/pages/ProfileSelectionPage";
import { DashboardPage } from "@/pages/Dashboard";
import { HotelsListPage } from "@/pages/hotels/HotelsList";
import { HotelDetailsPage } from "@/pages/hotels/HotelDetailsPage";
import { UsersListPage } from "@/pages/users/UsersList";
import AccountPage from "@/pages/Account";
import ProfilesPage from "@/pages/Profiles";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/profiles",
    element: (
      <ProtectedRoute>
        <ProfileSelectionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "hotels",
        element: <HotelsListPage />,
      },
      {
        path: "hotels/:id",
        element: <HotelDetailsPage />,
      },
      {
        path: "users",
        element: <UsersListPage />,
      },
      {
        path: "account",
        element: <AccountPage />,
      },
      {
        path: "profiles-management",
        element: <ProfilesPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
