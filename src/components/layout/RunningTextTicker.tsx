"use client";

import React from "react";
import {
  Warehouse,
  Radio,
  QrCode,
  ShieldCheck,
  Sparkles,
  ClipboardCheck,
  Zap,
} from "lucide-react";

export default function RunningTextTicker() {
  const announcements = [
    {
      icon: Radio,
      text: "Sistem Digital Warehouse Inventaris Aktif & Terhubung Real-Time SSE",
      badge: "LIVE SYNC",
      badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
    },
    {
      icon: QrCode,
      text: "Seluruh mutasi fisik Barang Masuk (GR) dan Barang Keluar (GI) wajib diverifikasi menggunakan scan QR Code Bin Card pada rak",
      badge: "SOP GUDANG",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    {
      icon: ShieldCheck,
      text: "Validasi saldo persediaan diproses secara atomik di server database untuk menjamin akurasi 100% dan 0% selisih fisik",
      badge: "DATABASE LOCKED",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    },
    {
      icon: ClipboardCheck,
      text: "Jadwal Stock Opname berkala dilaksanakan rutin pada setiap akhir periode untuk memastikan kepatuhan kartu bin card",
      badge: "AUDIT FISIK",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    },
    {
      icon: Zap,
      text: "Gunakan fitur Unggah Foto QR jika kamera perangkat tidak tersedia atau mengalami kendala pencahayaan",
      badge: "TIPS OPERASIONAL",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    },
  ];

  return (
    <div className="relative flex items-center border-b border-sky-100 bg-gradient-to-r from-sky-50/90 via-white to-blue-50/80 px-4 py-2 text-xs shadow-xs overflow-hidden">
      {/* Left Static Badge with Animated Warehouse Icon */}
      <div className="relative z-10 flex shrink-0 items-center gap-2 rounded-xl bg-sky-600 px-3 py-1.5 font-extrabold text-white shadow-sm ring-2 ring-sky-200">
        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-sky-700 text-white">
          <Warehouse className="h-3.5 w-3.5 animate-bounce" style={{ animationDuration: "2s" }} />
        </div>
        <span className="text-[10px] tracking-wider uppercase">INFO GUDANG</span>
      </div>

      {/* Marquee Track */}
      <div className="relative ml-3 flex flex-1 overflow-hidden select-none">
        <div className="animate-marquee flex items-center gap-8 text-slate-700 font-medium">
          {/* Render 1st set */}
          {announcements.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={`msg1-${index}`} className="flex items-center gap-2 whitespace-nowrap">
                <span
                  className={`rounded-md border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
                <span className="text-xs text-slate-700 flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                  {item.text}
                </span>
                <span className="text-slate-300 font-bold ml-4">&bull;</span>
              </div>
            );
          })}

          {/* Render 2nd set for seamless infinite loop */}
          {announcements.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={`msg2-${index}`} className="flex items-center gap-2 whitespace-nowrap">
                <span
                  className={`rounded-md border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
                <span className="text-xs text-slate-700 flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                  {item.text}
                </span>
                <span className="text-slate-300 font-bold ml-4">&bull;</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
