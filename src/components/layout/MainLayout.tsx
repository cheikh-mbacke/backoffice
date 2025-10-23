// src/components/layout/MainLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <Outlet context={{ toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen) }} />
      </main>
    </div>
  );
}
