"use client";

import { useState } from "react";
import {
  Settings,
  Building2,
  Database,
  Radio,
  ShieldCheck,
  Save,
  CheckCircle2,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";
import MiniCalendar from "@/components/dashboard/MiniCalendar";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("PT Muaratoyu Subur Lestari");
  const [estateName, setEstateName] = useState("Unit Logistik & Gudang Sentral");
  const [storagePrefix, setStoragePrefix] = useState("RAK-");
  const [autoReorderAlert, setAutoReorderAlert] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Pengaturan sistem gudang berhasil diperbarui.");
  };

  return (
    <div className="space-y-8 pb-14 max-w-5xl">
      <div>
        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          Pengaturan Sistem Gudang
        </h2>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Konfigurasi identitas perusahaan, preferensi label Bin Card, dan parameter operasional pergudangan
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identitas Unit Pergudangan */}
        <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-sky-50 pb-3">
            <Building2 className="h-5 w-5 text-sky-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Profil Perusahaan & Unit Pergudangan
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Perusahaan
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl border border-sky-100 bg-sky-50/40 p-2.5 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nama Unit / Gudang Sentral
              </label>
              <input
                type="text"
                value={estateName}
                onChange={(e) => setEstateName(e.target.value)}
                className="w-full rounded-xl border border-sky-100 bg-sky-50/40 p-2.5 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>
        </div>

        {/* Database & Integrasi Real-Time */}
        <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-sky-50 pb-3">
            <Database className="h-5 w-5 text-sky-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Status Database & Engine Real-Time
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div>
                <span className="font-bold text-slate-900 block">
                  Server-Sent Events (SSE) Real-Time Stream
                </span>
                <span className="text-slate-500 text-[11px]">
                  Memperbarui saldo dan grafik otomatis saat transaksi GR/GI dicatat
                </span>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 font-extrabold text-sky-800 text-[10px]">
                <Radio className="h-3 w-3 animate-pulse" />
                AKTIF
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div>
                <span className="font-bold text-slate-900 block">
                  Database Engine
                </span>
                <span className="text-slate-500 text-[11px]">
                  Prisma ORM dengan Atomic Transaction Lock
                </span>
              </div>
              <span className="rounded-full bg-slate-200 px-3 py-1 font-bold text-slate-700 text-[10px]">
                PRISMA READY
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-sky-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            Simpan Perubahan Pengaturan
          </button>
        </div>
      </form>

      {/* Kalender & Waktu Dibawah Fitur Pengaturan Sistem */}
      <div className="pt-6 border-t border-sky-100">
        <MiniCalendar />
      </div>
    </div>
  );
}
