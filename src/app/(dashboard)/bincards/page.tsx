"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  RefreshCw,
  QrCode,
  RotateCw,
  CheckCircle2,
  XCircle,
  Eye,
  Printer,
  Download,
  MapPin,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import BinCardLabelPrint from "@/components/bincard/BinCardLabelPrint";
import { formatNumber, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function BinCardsPage() {
  const [binCards, setBinCards] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBinCards = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bincards?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setBinCards(data.binCards || []);
      }
    } catch (err) {
      console.error("Fetch bin cards error:", err);
      toast.error("Gagal memuat daftar Bin Card");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBinCards();
  }, [search]);

  const handleRegenerate = async (materialId: string, code: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin meregenerasi QR Code untuk material ${code}? Label QR fisik lama di rak harus dicetak ulang.`
      )
    )
      return;

    setActionLoading(materialId);
    try {
      const res = await fetch("/api/bincards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId, action: "REGENERATE" }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "QR Code berhasil diperbarui.");
        fetchBinCards();
      } else {
        toast.error(data.error || "Gagal meregenerasi QR Code");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memproses permintaan");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (materialId: string) => {
    setActionLoading(materialId);
    try {
      const res = await fetch("/api/bincards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId, action: "TOGGLE_STATUS" }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Status Bin Card diperbarui.");
        fetchBinCards();
      } else {
        toast.error(data.error || "Gagal mengubah status Bin Card");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memproses permintaan");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Pengelolaan QR Code Bin Card
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Manajemen token unik barcode fisik pada setiap rak penyimpanan gudang kelapa pergudangan
          </p>
        </div>

        <button
          onClick={fetchBinCards}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Segarkan Data
        </button>
      </div>

      {/* Search Input */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari token QR, kode material, atau nama barang..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-warehouse-primary focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Bin Cards Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Material</th>
                <th className="px-5 py-3.5">Lokasi Rak</th>
                <th className="px-5 py-3.5">Token QR Bin Card</th>
                <th className="px-5 py-3.5 text-right">Stok Aktual</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Cetak & Preview</th>
                <th className="px-5 py-3.5 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-warehouse-primary" />
                    Memuat daftar Bin Card...
                  </td>
                </tr>
              ) : binCards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada Bin Card yang ditemukan.
                  </td>
                </tr>
              ) : (
                binCards.map((bc) => (
                  <tr key={bc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 uppercase">
                        {bc.material?.materialCode}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {bc.material?.description}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800">
                        <MapPin className="h-3 w-3 text-sky-600" />
                        {bc.material?.storageLocation}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-sky-800">
                      {bc.qrToken}
                    </td>

                    <td className="px-5 py-3.5 text-right font-black text-slate-900">
                      {formatNumber(bc.material?.currentStock)}{" "}
                      <span className="text-[10px] font-normal text-slate-500">
                        {bc.material?.uom}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                          bc.isActive
                            ? "bg-sky-100 text-sky-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {bc.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {bc.material && (
                        <BinCardLabelPrint
                          material={bc.material}
                          qrToken={bc.qrToken}
                        />
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleRegenerate(bc.materialId, bc.material?.materialCode)}
                          disabled={actionLoading === bc.materialId}
                          title="Generate Ulang Token QR"
                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                        >
                          <RotateCw className="h-3 w-3 text-slate-500" />
                          Regen QR
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(bc.materialId)}
                          disabled={actionLoading === bc.materialId}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                            bc.isActive
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-sky-50 text-sky-700 hover:bg-sky-100"
                          }`}
                        >
                          {bc.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
