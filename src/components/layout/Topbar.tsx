"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu,
  Bell,
  LogOut,
  User as UserIcon,
  Radio,
  RefreshCw,
  Warehouse,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface TopbarProps {
  onToggleSidebar?: () => void;
  user?: {
    name: string;
    username: string;
    role: string;
  } | null;
}

export default function Topbar({ onToggleSidebar, user }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Pantau koneksi Real-Time SSE
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/realtime");
      eventSource.onopen = () => {
        setIsLiveConnected(true);
      };
      eventSource.onerror = () => {
        setIsLiveConnected(false);
      };
      eventSource.addEventListener("transaction_completed", () => {
        toast.info("Transaksi baru terdeteksi! Data diperbarui otomatis.", {
          duration: 3000,
        });
      });
    } catch {
      setIsLiveConnected(false);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        toast.success("Anda telah berhasil logout.");
        router.push("/login");
        router.refresh();
      }
    } catch {
      toast.error("Gagal melakukan logout.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Breadcrumbs text helper
  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Dashboard Monitoring Persediaan";
    if (pathname.startsWith("/scan")) return "Scan QR Code Bin Card";
    if (pathname.startsWith("/materials")) return "Master Data Material";
    if (pathname.startsWith("/bincards")) return "Pengelolaan QR Code Bin Card";
    if (pathname.startsWith("/transactions")) return "Riwayat Transaksi Barang";
    if (pathname.startsWith("/reports")) return "Laporan & Audit Persediaan";
    if (pathname.startsWith("/users")) return "Manajemen Pengguna Gudang";
    if (pathname.startsWith("/settings")) return "Pengaturan Sistem Gudang";
    return "Sistem Inventaris Gudang";
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-sky-100 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile menu toggle + Page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
          className="rounded-lg p-2 text-slate-600 hover:bg-sky-50 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
            <Warehouse className="h-3.5 w-3.5 animate-pulse-soft" />
            <span>PT Muaratoyu Subur Lestari &bull; Central Digital Warehouse</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Real-time status + User Profile + Logout */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Download Standalone index.html Button */}
        <a
          href="/index.html"
          download="index.html"
          title="Unduh Aplikasi Mandiri Format index.html"
          className="flex items-center gap-1.5 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50/80 px-3 py-1.5 text-xs font-bold text-sky-800 shadow-xs hover:bg-sky-100 hover:scale-105 active:scale-95 transition-all"
        >
          <Download className="h-3.5 w-3.5 text-sky-600" />
          <span className="hidden sm:inline">Download HTML</span>
        </a>

        {/* Real-Time SSE Indicator */}
        <div
          title={isLiveConnected ? "Terhubung ke Live Real-Time SSE Server" : "Menghubungkan ke SSE..."}
          className="hidden items-center gap-2 rounded-full border border-sky-100 bg-sky-50/70 px-3 py-1.5 text-xs md:flex"
        >
          <span
            className={`flex h-2.5 w-2.5 rounded-full ${
              isLiveConnected ? "bg-sky-500 animate-pulse" : "bg-amber-400"
            }`}
          />
          <span className="font-medium text-slate-700">
            {isLiveConnected ? "Real-Time Aktif" : "Menghubungkan..."}
          </span>
          <Radio className="h-3.5 w-3.5 text-sky-500" />
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/50 py-1.5 pl-3 pr-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-800 font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
          </div>

          <div className="hidden text-left sm:block">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {user?.name || "Petugas Gudang"}
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              {user?.role === "ADMIN" ? (
                <span className="text-sky-700 font-semibold">Administrator Gudang</span>
              ) : (
                <span className="text-slate-600">Operator / Petugas</span>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Keluar dari Sistem"
            className="ml-1 rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            {isLoggingOut ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
