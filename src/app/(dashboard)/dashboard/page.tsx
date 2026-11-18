"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  XCircle,
  RefreshCw,
  QrCode,
  FileSpreadsheet,
  Plus,
  Warehouse,
  Sparkles,
  Radio,
} from "lucide-react";
import Link from "next/link";
import KPICard from "@/components/dashboard/KPICard";
import MovementChart from "@/components/dashboard/MovementChart";
import StockCompositionChart from "@/components/dashboard/StockCompositionChart";
import RecentTransactionsTable from "@/components/dashboard/RecentTransactionsTable";
import MaterialAlertList from "@/components/dashboard/MaterialAlertList";
import MaterialMonitoringSection from "@/components/dashboard/MaterialMonitoringSection";
import MaterialModal from "@/components/materials/MaterialModal";
import { formatNumber } from "@/lib/utils";
import { toast } from "sonner";

export default function DashboardPage() {
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchStats = useCallback(async (quiet = false) => {
    if (!quiet) setIsRefreshing(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Gagal memuat statistik dashboard:", err);
      if (!quiet) toast.error("Gagal memperbarui data dashboard");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(true);

    // Integrasi Real-Time SSE
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/realtime");
      eventSource.addEventListener("transaction_completed", () => {
        fetchStats(true);
      });
      eventSource.addEventListener("material_created", () => {
        fetchStats(true);
      });
      eventSource.addEventListener("material_updated", () => {
        fetchStats(true);
      });
    } catch (err) {
      console.warn("SSE connection error:", err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [fetchStats]);

  if (isLoading && !stats) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-sky-600" />
        <p className="text-xs font-semibold text-slate-500">
          Memuat data persediaan sistem inventaris gudang...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-14 animate-fade-in">
      {/* Top Banner & Quick Actions with soft sky-blue gradient & animated warehouse badge */}
      <div className="relative overflow-hidden flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-[#0369A1] via-[#0284C7] to-[#38BDF8] p-7 text-white shadow-soft transition-all duration-300 hover:shadow-lg md:flex-row md:items-center md:justify-between">
        {/* Subtle decorative background circles */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute left-1/3 -bottom-12 h-44 w-44 rounded-full bg-sky-300/20 blur-xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-100">
            <span className="flex h-2.5 w-2.5 rounded-full bg-sky-200 animate-pulse" />
            General Warehouse Monitoring Dashboard
          </div>
          <h2 className="mt-1.5 text-xl font-black tracking-tight sm:text-2xl lg:text-3xl">
            Sistem Inventaris Pergudangan Digital
          </h2>
          <p className="mt-1.5 text-xs text-sky-100/90 max-w-xl leading-relaxed">
            Monitoring mutasi fisik suku cadang, pelumas mesin, perlengkapan operasional, dan material persediaan secara real-time berbasis QR Code.
          </p>
        </div>

        {/* Animated Warehouse Status Badge */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-md border border-white/20 shadow-xs group hover:bg-white/15 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <Warehouse className="h-5 w-5 stroke-[2.2] animate-bounce" style={{ animationDuration: "2.5s" }} />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-200">
                Fasilitas Gudang
              </div>
              <div className="text-xs font-black text-white">
                Sentral Logistik Aktif
              </div>
            </div>
          </div>

          <button
            onClick={() => fetchStats(false)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2.5 text-xs font-bold text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Segarkan
          </button>

          <Link
            href="/scan"
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-sky-800 shadow-md hover:bg-sky-50 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <QrCode className="h-4 w-4 text-sky-600" />
            Scan Bin Card
          </Link>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-sky-950/40 px-4 py-2.5 text-xs font-bold text-white shadow-md border border-sky-400/30 hover:bg-sky-950/60 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Tambah Material
          </button>
        </div>
      </div>

      {/* KPI Cards Grid with Staggered Entrance Animations & Hover Lift */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* 1. Total Jenis Material */}
        <KPICard
          title="Jenis Material"
          value={formatNumber(stats?.totalMaterials || 0)}
          subtitle="Item terdaftar aktif"
          icon={Package}
          badge="Katalog"
          variant="default"
          delayIndex={0}
        />

        {/* 2. Total Stok Persediaan */}
        <KPICard
          title="Total Fisik Stok"
          value={formatNumber(stats?.totalStockUnits || 0)}
          subtitle="Unit total persediaan"
          icon={Layers}
          badge="Akumulasi"
          variant="info"
          delayIndex={1}
        />

        {/* 3. Total Transaksi Barang Masuk */}
        <KPICard
          title="Barang Masuk (GR)"
          value={formatNumber(stats?.totalReceiptsCount || 0)}
          subtitle={`${formatNumber(stats?.totalReceiptsQty || 0)} unit diterima`}
          icon={ArrowDownLeft}
          badge="Penerimaan"
          variant="success"
          delayIndex={2}
        />

        {/* 4. Total Transaksi Barang Keluar */}
        <KPICard
          title="Barang Keluar (GI)"
          value={formatNumber(stats?.totalIssuesCount || 0)}
          subtitle={`${formatNumber(stats?.totalIssuesQty || 0)} unit disalurkan`}
          icon={ArrowUpRight}
          badge="Pengeluaran"
          variant="danger"
          delayIndex={3}
        />

        {/* 5. Material dengan Stok Minimum */}
        <KPICard
          title="Stok Minimum"
          value={formatNumber(stats?.lowStockCount || 0)}
          subtitle="Perlu re-order segera"
          icon={AlertTriangle}
          badge="Atensi"
          variant="warning"
          delayIndex={4}
        />

        {/* 6. Material dengan Stok Kosong */}
        <KPICard
          title="Stok Kosong"
          value={formatNumber(stats?.outOfStockCount || 0)}
          subtitle="Saldo fisik 0"
          icon={XCircle}
          badge="Kritis"
          variant="danger"
          delayIndex={5}
        />
      </div>

      {/* Visual Charts Grid (Pergerakan Barang & Komposisi Stok) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Chart 1: Pergerakan Barang */}
        <div className="card-hover-fx rounded-2xl border border-sky-100 bg-white p-6 shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between border-b border-sky-50 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Grafik Pergerakan Barang (Goods Receipt vs Goods Issue)
              </h3>
              <p className="text-xs text-slate-500">
                Volume penerimaan dan pengeluaran fisik barang dalam 7 hari terakhir
              </p>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-800 border border-sky-100">
              Tren Harian
            </span>
          </div>

          <MovementChart data={stats?.movementTrends || []} />
        </div>

        {/* Chart 2: Komposisi Stok */}
        <div className="card-hover-fx rounded-2xl border border-sky-100 bg-white p-6 shadow-sm lg:col-span-4">
          <div className="border-b border-sky-50 pb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Komposisi Status Persediaan
            </h3>
            <p className="text-xs text-slate-500">
              Kondisi kesehatan stok seluruh material gudang
            </p>
          </div>

          <StockCompositionChart data={stats?.stockComposition || []} />
        </div>
      </div>

      {/* Alert Items & Recent Transactions Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Material Alert List (Stok Minimum & Kosong) */}
        <div className="card-hover-fx rounded-2xl border border-sky-100 bg-white p-6 shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-sky-50 pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Peringatan Stok Gudang (Alert)
              </h3>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
              {(stats?.alertMaterials || []).length} Item
            </span>
          </div>

          <div className="mt-4">
            <MaterialAlertList materials={stats?.alertMaterials || []} />
          </div>
        </div>

        {/* Right: Recent Transactions Table */}
        <div className="card-hover-fx rounded-2xl border border-sky-100 bg-white p-6 shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-sky-50 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Transaksi Terkini (Recent Transactions)
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan GR & GI terbaru yang diverifikasi petugas
              </p>
            </div>
            <Link
              href="/transactions"
              className="text-xs font-bold text-sky-700 hover:text-sky-800 hover:underline"
            >
              Lihat Semua &rarr;
            </Link>
          </div>

          <div className="mt-4">
            <RecentTransactionsTable transactions={stats?.recentTransactions || []} />
          </div>
        </div>
      </div>

      {/* Feature 1 Part B: Material Monitoring (Pencarian & Penelusuran Detail Spesifik) */}
      <MaterialMonitoringSection />

      {/* Modal Tambah Material Baru */}
      <MaterialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => fetchStats(true)}
      />
    </div>
  );
}
