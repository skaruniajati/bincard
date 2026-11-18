"use client";

import { useState, useEffect, useCallback } from "react";
import {
  History,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatNumber, formatDateTime, formatDateOnly } from "@/lib/utils";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        type: typeFilter,
        startDate,
        endDate,
        page: String(page),
        limit: "15",
      });

      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Fetch transactions error:", err);
      toast.error("Gagal memuat riwayat transaksi");
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter, startDate, endDate, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Export ke Excel
  const handleExportExcel = () => {
    if (transactions.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    const exportRows = transactions.map((t, idx) => ({
      No: idx + 1,
      "No. Transaksi": t.transactionNumber,
      "Tanggal & Waktu": formatDateTime(t.transactionDate),
      "Kode Material": t.material?.materialCode,
      "Nama Material": t.material?.description,
      "Jenis Mutasi": t.transactionType === "GR" ? "Barang Masuk (GR)" : "Barang Keluar (GI)",
      Kuantitas: t.quantity,
      Satuan: t.material?.uom,
      "Saldo Awal": t.previousBalance,
      "Saldo Akhir": t.newBalance,
      "No. Dokumen Ref": t.referenceNumber || "-",
      "Petugas Gudang": t.user?.name || t.user?.username || "-",
      Catatan: t.remarks || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Transaksi");
    XLSX.writeFile(workbook, `Riwayat_Transaksi_Gudang_${formatDateOnly(new Date())}.xlsx`);
    toast.success("File Excel berhasil diunduh.");
  };

  // Export ke CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    const headers = [
      "No",
      "No Transaksi",
      "Waktu",
      "Kode Material",
      "Deskripsi",
      "Tipe",
      "Qty",
      "Satuan",
      "Saldo Awal",
      "Saldo Akhir",
      "Dokumen Ref",
      "Petugas",
      "Catatan",
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...transactions.map((t, idx) =>
          [
            idx + 1,
            `"${t.transactionNumber}"`,
            `"${formatDateTime(t.transactionDate)}"`,
            `"${t.material?.materialCode}"`,
            `"${t.material?.description.replace(/"/g, '""')}"`,
            `"${t.transactionType}"`,
            t.quantity,
            `"${t.material?.uom}"`,
            t.previousBalance,
            t.newBalance,
            `"${t.referenceNumber || "-"}"`,
            `"${t.user?.name || "-"}"`,
            `"${(t.remarks || "-").replace(/"/g, '""')}"`,
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Riwayat_Transaksi_${formatDateOnly(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File CSV berhasil diunduh.");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Riwayat Transaksi Barang Masuk & Keluar
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Catatan log mutasi fisik barang (Goods Receipt & Goods Issue) yang tidak dapat dimanipulasi (Immutable)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Ekspor CSV
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

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-12">
        <div className="relative sm:col-span-5">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari no. transaksi, kode material, referensi..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-warehouse-primary focus:bg-white focus:outline-none"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-700 focus:border-warehouse-primary focus:bg-white focus:outline-none"
          >
            <option value="ALL">Semua Tipe (GR & GI)</option>
            <option value="GR">Goods Receipt (GR) - Masuk</option>
            <option value="GI">Goods Issue (GI) - Keluar</option>
          </select>
        </div>

        <div className="flex items-center gap-2 sm:col-span-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-2.5 text-xs text-slate-700 focus:outline-none"
          />
          <span className="text-slate-400 text-xs">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-2.5 text-xs text-slate-700 focus:outline-none"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3.5">Waktu & Tanggal</th>
                <th className="px-4 py-3.5">No. Transaksi</th>
                <th className="px-4 py-3.5">Material</th>
                <th className="px-4 py-3.5 text-center">Tipe Mutasi</th>
                <th className="px-4 py-3.5 text-right">Kuantitas</th>
                <th className="px-4 py-3.5 text-right">Saldo Awal</th>
                <th className="px-4 py-3.5 text-right">Saldo Akhir</th>
                <th className="px-4 py-3.5">Dokumen Ref</th>
                <th className="px-4 py-3.5">Petugas</th>
                <th className="px-4 py-3.5">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-warehouse-primary" />
                    Memuat data riwayat transaksi...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Belum ada data transaksi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const isGR = t.transactionType === "GR";
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {formatDateTime(t.transactionDate)}
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                        {t.transactionNumber}
                      </td>

                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="font-bold text-slate-900 uppercase truncate">
                          {t.material?.materialCode}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {t.material?.description}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                            isGR
                              ? "bg-sky-100 text-sky-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isGR ? (
                            <>
                              <ArrowDownLeft className="h-3 w-3" /> MASUK
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="h-3 w-3" /> KELUAR
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right font-black">
                        <span className={isGR ? "text-sky-700" : "text-red-600"}>
                          {isGR ? `+${formatNumber(t.quantity)}` : `-${formatNumber(t.quantity)}`}{" "}
                          <span className="text-[10px] font-normal text-slate-500">
                            {t.material?.uom}
                          </span>
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right text-slate-500 font-semibold">
                        {formatNumber(t.previousBalance)}
                      </td>

                      <td className="px-4 py-3 text-right font-black text-slate-900">
                        {formatNumber(t.newBalance)}{" "}
                        <span className="text-[10px] font-normal text-slate-500">
                          {t.material?.uom}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-700 font-mono text-[11px]">
                        {t.referenceNumber || "-"}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {t.user?.name || t.user?.username || "-"}
                      </td>

                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate text-[11px]">
                        {t.remarks || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <div>
            Total <strong>{total}</strong> transaksi tersimpan
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Sebelumnya
            </button>
            <span className="font-bold">
              Hal {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold hover:bg-slate-50 disabled:opacity-50"
            >
              Berikutnya
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
