"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  FileText,
} from "lucide-react";
import { formatNumber, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

interface TransactionDialogProps {
  material: {
    id: string;
    materialCode: string;
    description: string;
    currentStock: number;
    uom: string;
    storageLocation: string;
  };
  currentUser?: {
    name: string;
    username: string;
    role: string;
  } | null;
  onSuccess?: (updatedMaterial: any, createdTransaction?: any) => void;
}

export default function TransactionDialog({
  material,
  currentUser,
  onSuccess,
}: TransactionDialogProps) {
  const [txType, setTxType] = useState<"GR" | "GI">("GR");
  const [quantity, setQuantity] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numQty = parseFloat(quantity) || 0;
  const currentStock = material.currentStock;

  // Hitung simulasi saldo baru
  const calculatedNewBalance =
    txType === "GR" ? currentStock + numQty : currentStock - numQty;

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (numQty <= 0) {
      toast.error("Kuantitas transaksi wajib lebih besar dari 0!");
      return;
    }

    if (txType === "GI" && numQty > currentStock) {
      toast.error(
        `Kuantitas barang keluar (${numQty} ${material.uom}) melebihi stok yang tersedia (${currentStock} ${material.uom})!`
      );
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId: material.id,
          transactionType: txType,
          quantity: numQty,
          referenceNumber: referenceNumber.trim() || undefined,
          remarks: remarks.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan transaksi");
      }

      toast.success(data.message || "Transaksi berhasil disimpan!");
      setShowConfirmModal(false);
      setQuantity("");
      setReferenceNumber("");
      setRemarks("");

      if (onSuccess && data.material) {
        onSuccess(data.material, data.transaction);
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat memproses transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Form Pencatatan Transaksi Bin Card
          </h3>
          <p className="text-xs text-slate-500">
            Pilih jenis mutasi fisik dan input kuantitas barang
          </p>
        </div>

        {/* User Identity Pill */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-right text-xs">
          <span className="text-[10px] text-slate-400 block">Petugas Pelaksana:</span>
          <span className="font-bold text-slate-800">{currentUser?.name || "Operator"}</span>
        </div>
      </div>

      {/* Transaction Type Selector (GR vs GI) */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setTxType("GR")}
          className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-xs font-bold transition-all ${
            txType === "GR"
              ? "border-sky-600 bg-sky-50 text-sky-900 shadow-sm ring-2 ring-sky-500/20"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <ArrowDownLeft className={`h-4 w-4 ${txType === "GR" ? "text-sky-700" : "text-slate-400"}`} />
          GOODS RECEIPT (GR) - Barang Masuk
        </button>

        <button
          type="button"
          onClick={() => setTxType("GI")}
          className={`flex items-center justify-center gap-2 rounded-xl border p-3.5 text-xs font-bold transition-all ${
            txType === "GI"
              ? "border-red-600 bg-red-50 text-red-900 shadow-sm ring-2 ring-red-500/20"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <ArrowUpRight className={`h-4 w-4 ${txType === "GI" ? "text-red-700" : "text-slate-400"}`} />
          GOODS ISSUE (GI) - Barang Keluar
        </button>
      </div>

      {/* Form Fields */}
      <form onSubmit={handlePreSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kuantitas ({material.uom}) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={`Masukkan jumlah dalam ${material.uom}`}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm font-bold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:border-warehouse-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {txType === "GR" ? "No. Referensi (Surat Jalan / PO)" : "No. Dokumen SPB / Work Order (WO)"}
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder={txType === "GR" ? "Contoh: SJ-2026-881 atau PO/SLM/X/01" : "Contoh: SPB-AFD2-004 atau WO-DT08"}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-warehouse-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Catatan Transaksi / Keperluan Lapangan
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={
              txType === "GR"
                ? "Contoh: Penerimaan dari ekspedisi vendor dalam kondisi segel baik"
                : "Contoh: Penggantian sparepart dump truck unit DT-05 Afdeling II"
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-warehouse-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        {/* Live Calculation Preview Banner */}
        {numQty > 0 && (
          <div
            className={`flex items-center justify-between rounded-xl p-3.5 text-xs ${
              txType === "GI" && numQty > currentStock
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-emerald-50 text-sky-900 border border-emerald-200"
            }`}
          >
            <div>
              <span className="font-semibold text-slate-600">Simulasi Saldo:</span>{" "}
              <strong>{formatNumber(currentStock)}</strong> {material.uom}{" "}
              {txType === "GR" ? "+" : "-"} <strong>{formatNumber(numQty)}</strong> ={" "}
              <strong className="text-sm font-black">
                {formatNumber(calculatedNewBalance)} {material.uom}
              </strong>
            </div>

            {txType === "GI" && numQty > currentStock && (
              <span className="font-bold text-red-700">⚠️ Melebihi Stok!</span>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={numQty <= 0 || (txType === "GI" && numQty > currentStock)}
          className={`w-full rounded-xl py-3 text-xs font-bold text-white shadow-sm transition-all ${
            txType === "GR"
              ? "bg-sky-600 hover:bg-sky-700"
              : "bg-red-600 hover:bg-red-700"
          } disabled:cursor-not-allowed disabled:bg-slate-300`}
        >
          Lanjut ke Konfirmasi Transaksi
        </button>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h4 className="text-sm font-bold text-slate-900">
                  Konfirmasi Transaksi Fisik Gudang
                </h4>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Mohon pastikan kuantitas fisik suku cadang/barang telah dihitung dengan teliti sebelum diverifikasi ke sistem:
              </p>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Kode Material:</span>
                  <span className="font-bold text-slate-900">{material.materialCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Deskripsi:</span>
                  <span className="font-bold text-slate-900 text-right max-w-xs">{material.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jenis Transaksi:</span>
                  <span
                    className={`font-black ${
                      txType === "GR" ? "text-sky-700" : "text-red-700"
                    }`}
                  >
                    {txType === "GR" ? "BARANG MASUK (GR)" : "BARANG KELUAR (GI)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kuantitas:</span>
                  <span className="font-black text-slate-900 text-sm">
                    {formatNumber(numQty)} {material.uom}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                  <span className="text-slate-600">Saldo Sebelum:</span>
                  <span>{formatNumber(currentStock)} {material.uom}</span>
                </div>
                <div className="flex justify-between font-black text-sky-800 text-sm">
                  <span>Saldo Sesudah:</span>
                  <span>{formatNumber(calculatedNewBalance)} {material.uom}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-xl bg-warehouse-dark px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700 transition-colors"
              >
                {isSubmitting ? "Menyimpan ke Database..." : "Simpan & Update Saldo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
