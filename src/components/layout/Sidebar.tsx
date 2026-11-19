"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  QrCode,
  Package,
  CreditCard,
  History,
  FileSpreadsheet,
  Users,
  Settings,
  X,
  Warehouse,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SidebarCalendarWidget from "./SidebarCalendarWidget";

interface SidebarProps {
  userRole?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ userRole = "PETUGAS", isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard Monitoring",
      href: "/dashboard",
      icon: LayoutDashboard,
      badge: "Live",
    },
    {
      name: "Scan Bin Card",
      href: "/scan",
      icon: QrCode,
      highlight: true,
    },
    {
      name: "Master Material",
      href: "/materials",
      icon: Package,
    },
    {
      name: "Bin Card QR",
      href: "/bincards",
      icon: CreditCard,
    },
    {
      name: "Riwayat Transaksi",
      href: "/transactions",
      icon: History,
    },
    {
      name: "Laporan Gudang",
      href: "/reports",
      icon: FileSpreadsheet,
    },
    ...(userRole === "ADMIN"
      ? [
          {
            name: "Manajemen User",
            href: "/users",
            icon: Users,
            adminOnly: true,
          },
        ]
      : []),
    {
      name: "Pengaturan Sistem",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-gradient-to-b from-[#0B2545] via-[#103158] to-[#091D33] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:max-w-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header / Logo with Animated Warehouse Icon */}
        <div className="flex h-20 items-center justify-between border-b border-sky-900/60 px-4 sm:px-6">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
            <div className="group flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-400 text-white shadow-lg shadow-sky-950/40 shrink-0">
              <Warehouse className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.2] animate-float-slow transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] sm:text-[11px] font-bold tracking-wider text-sky-300 uppercase truncate">
                PT Muaratoyu Subur Lestari
              </div>
              <div className="text-sm sm:text-base font-extrabold tracking-tight text-white truncate">
                Warehouse System
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-sky-200 hover:bg-sky-800/60 hover:text-white lg:hidden shrink-0"
            aria-label="Tutup Menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* System Sub-brand Banner */}
        <div className="mx-4 mt-4 rounded-xl border border-sky-700/40 bg-sky-900/30 p-3 text-xs text-sky-100">
          <div className="flex items-center gap-1.5 font-bold text-sky-300">
            <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-pulse"></span>
            DIGITAL BIN CARD 2.0
          </div>
          <p className="mt-1 text-[11px] text-sky-200/80 leading-relaxed">
            Sistem Inventaris Pergudangan Digital Terintegrasi
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-sky-300/70 uppercase">
            Menu Operasional
          </div>

          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white text-sky-950 shadow-md font-bold"
                    : "text-sky-100 hover:bg-sky-800/50 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                      isActive
                        ? "text-sky-600"
                        : item.highlight
                        ? "text-sky-300"
                        : "text-sky-200"
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        isActive
                          ? "bg-sky-100 text-sky-800"
                          : "bg-sky-800 text-sky-200"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.adminOnly && (
                    <span
                      title="Khusus Akun Admin"
                      className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300"
                    >
                      ADMIN
                    </span>
                  )}

                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-sky-600" />
                  )}
                </div>
              </Link>
            );
          })}

          {/* Kalender & Waktu Tepat Dibawah Fitur Pengaturan Sistem */}
          <div className="mt-5 pt-3">
            <SidebarCalendarWidget />
          </div>
        </nav>

        {/* Bottom User Role Badge */}
        <div className="border-t border-sky-900/60 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-sky-950/50 p-3 border border-sky-900/40">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-800 text-sky-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-sky-300 truncate">
                Hak Akses Anda
              </div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                {userRole === "ADMIN" ? "Admin Gudang (Full)" : "Petugas Gudang"}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
