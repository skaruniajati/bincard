"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import RunningTextTicker from "./RunningTextTicker";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    username: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Unauthenticated");
      })
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {
        // Fallback default
        setUser({
          name: "Petugas Gudang",
          username: "petugas",
          role: "ADMIN",
        });
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-warehouse-bg">
      {/* Sidebar */}
      <Sidebar
        userRole={user?.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          user={user}
        />

        {/* Tulisan Berjalan / Running Text Ticker */}
        <RunningTextTicker />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
