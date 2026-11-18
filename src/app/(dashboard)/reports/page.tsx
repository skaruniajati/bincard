"use client";

import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  RefreshCw,
  Search,
} from "lucide-react";
import { formatNumber, formatDateTime, formatDateOnly } from "@/lib/utils";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<"STOCK" | "GR" | "GI" | "MOVEMENT" | "LOW_STOCK">("STOCK");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: reportType,
        startDate,
        endDate,
      });

      const res = await fetch(`/api/reports?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRows(data.rows || []);
      }
    } catch (err) {
      console.error("Fetch report error:", err);
      toast.error("Gagal memuat data laporan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, startDate, endDate]);

  const handleExportExcel = () => {
    if (rows.length === 0) {
      toast.error("Tidak ada data laporan untuk diekspor");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Laporan_${reportType}`);
    XLSX.writeFile(workbook, `Laporan_${reportType}_${formatDateOnly(new Date())}.xlsx`);
    toast.success("File Excel laporan berhasil diunduh.");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Laporan & Audit Persediaan Gudang
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Rekapitulasi berkala stok fisik, mutasi masuk/keluar, dan laporan evaluasi persediaan perkebunan pergudangan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" />
            Cetak PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 rounded-xl bg-warehouse-dark px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Ekspor Excel
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 no-print">
        {[
          { type: "STOCK", label: "Posisi Stok Fisik", icon: Layers },
          { type: "GR", label: "Barang Masuk (GR)", icon: ArrowDownLeft },
          { type: "GI", label: "Barang Keluar (GI)", icon: ArrowUpRight },
          { type: "MOVEMENT", label: "Kartu Mutasi Stok", icon: FileSpreadsheet },
          { type: "LOW_STOCK", label: "Stok Kritis / Min", icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setReportType(tab.type as any)}
              className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-bold transition-all ${
                isActive
                  ? "bg-warehouse-dark text-white shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-emerald-300" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm no-print">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Periode:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 focus:outline-none"
          />
          <span className="text-slate-400 text-xs">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-700 focus:outline-none"
          />
        </div>

        <button
          onClick={fetchReport}
          className="flex items-center gap-1 text-xs font-semibold text-warehouse-primary hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Terapkan Filter
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Printable Header */}
        <div className="border-b-2 border-slate-800 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-sky-800">
                PT Muaratoyu Subur Lestari &bull; DIVISI LOGISTIK
              </div>
              <h1 className="text-xl font-black text-slate-900 uppercase">
                {reportType === "STOCK" && "Laporan Posisi Persediaan Gudang Sentral"}
                {reportType === "GR" && "Laporan Rekapitulasi Penerimaan Barang (Goods Receipt)"}
                {reportType === "GI" && "Laporan Rekapitulasi Pengeluaran Barang (Goods Issue)"}
                {reportType === "MOVEMENT" && "Laporan Histori Kartu Mutasi Stok (Stock Movement)"}
                {reportType === "LOW_STOCK" && "Laporan Peringatan Stok Minimum & Kritis"}
              </h1>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Dicetak pada: {formatDateTime(new Date())}</div>
              <div>Total Data: {rows.length} Baris</div>
            </div>
          </div>
        </div>

        {/* Content Table */}
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-warehouse-primary" />
            Menyusun data laporan...
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Tidak ada data yang tersedia untuk parameter laporan ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-300 bg-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                {reportType === "STOCK" || reportType === "LOW_STOCK" ? (
                  <tr>
                    <th className="px-3 py-2.5 text-center">No</th>
                    <th className="px-3 py-2.5">Kode Material</th>
                    <th className="px-3 py-2.5">Deskripsi Barang</th>
                    <th className="px-3 py-2.5">Kategori</th>
                    <th className="px-3 py-2.5">Lokasi Rak</th>
                    <th className="px-3 py-2.5 text-right">Stok Fisik</th>
                    <th className="px-3 py-2.5 text-right">Batas Min</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                  </tr>
                ) : reportType === "GR" || reportType === "GI" ? (
                  <tr>
                    <th className="px-3 py-2.5 text-center">No</th>
                    <th className="px-3 py-2.5">Tanggal</th>
                    <th className="px-3 py-2.5">No. Transaksi</th>
                    <th className="px-3 py-2.5">Kode Material</th>
                    <th className="px-3 py-2.5">Nama Barang</th>
                    <th className="px-3 py-2.5 text-right">Kuantitas</th>
                    <th className="px-3 py-2.5 text-right">Saldo Akhir</th>
                    <th className="px-3 py-2.5">Dokumen Ref</th>
                    <th className="px-3 py-2.5">Petugas</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-3 py-2.5 text-center">No</th>
                    <th className="px-3 py-2.5">Tanggal</th>
                    <th className="px-3 py-2.5">No. Transaksi</th>
                    <th className="px-3 py-2.5">Material</th>
                    <th className="px-3 py-2.5 text-center">Tipe Mutasi</th>
                    <th className="px-3 py-2.5 text-right">Masuk</th>
                    <th className="px-3 py-2.5 text-right">Keluar</th>
                    <th className="px-3 py-2.5 text-right">Saldo</th>
                    <th className="px-3 py-2.5">Petugas</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {rows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 text-center text-slate-400">{r.no}</td>
                    {reportType === "STOCK" || reportType === "LOW_STOCK" ? (
                      <>
                        <td className="px-3 py-2.5 font-bold uppercase">{r.code}</td>
                        <td className="px-3 py-2.5">{r.description}</td>
                        <td className="px-3 py-2.5">{r.category}</td>
                        <td className="px-3 py-2.5 font-semibold text-slate-600">{r.storageLocation}</td>
                        <td className="px-3 py-2.5 text-right font-black text-slate-900">
                          {formatNumber(r.currentStock)} {r.uom}
                        </td>
                        <td className="px-3 py-2.5 text-right text-slate-500">
                          {formatNumber(r.minimumStock)} {r.uom}
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] uppercase ${
                              r.status === "KOSONG"
                                ? "bg-red-100 text-red-800"
                                : r.status === "MINIMUM"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </>
                    ) : reportType === "GR" || reportType === "GI" ? (
                      <>
                        <td className="px-3 py-2.5 text-slate-500">{formatDateTime(r.date)}</td>
                        <td className="px-3 py-2.5 font-bold">{r.transactionNumber}</td>
                        <td className="px-3 py-2.5 font-semibold uppercase">{r.materialCode}</td>
                        <td className="px-3 py-2.5 truncate max-w-[200px]">{r.materialDescription}</td>
                        <td className="px-3 py-2.5 text-right font-black">
                          {formatNumber(r.quantity)} {r.uom}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold">{formatNumber(r.newBalance)}</td>
                        <td className="px-3 py-2.5 font-mono text-[11px]">{r.referenceNumber}</td>
                        <td className="px-3 py-2.5">{r.user}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-2.5 text-slate-500">{formatDateTime(r.date)}</td>
                        <td className="px-3 py-2.5 font-bold">{r.transactionNumber}</td>
                        <td className="px-3 py-2.5 font-semibold uppercase">{r.materialCode}</td>
                        <td className="px-3 py-2.5 text-center font-bold text-[10px]">{r.type}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-sky-700">
                          {r.quantityIn > 0 ? `+${formatNumber(r.quantityIn)}` : "-"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold text-red-600">
                          {r.quantityOut > 0 ? `-${formatNumber(r.quantityOut)}` : "-"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-black">
                          {formatNumber(r.balance)} {r.uom}
                        </td>
                        <td className="px-3 py-2.5">{r.user}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
