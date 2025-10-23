// src/routes/index.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoginPage } from "@/pages/Login";
import { DashboardPage } from "@/pages/Dashboard";
import { HotelsListPage } from "@/pages/hotels/HotelsList";
import { HotelDetailsPage } from "@/pages/hotels/HotelDetailsPage";
import { UsersListPage } from "@/pages/users/UsersList";
import { ProfilePage } from "@/pages/ProfilePage";
import { DocumentationPage } from "@/pages/Documentation";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
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
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "documentation",
        element: <DocumentationPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
