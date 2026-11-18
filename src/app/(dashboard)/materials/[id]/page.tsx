"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Layers,
  MapPin,
  QrCode,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Printer,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import BinCardLabelPrint from "@/components/bincard/BinCardLabelPrint";
import { formatNumber, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function MaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [material, setMaterial] = useState<any | null>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [matRes, movRes] = await Promise.all([
          fetch(`/api/materials/${id}`),
          fetch(`/api/materials/${id}/movements?limit=100`),
        ]);

        if (matRes.ok) {
          const matData = await matRes.json();
          setMaterial(matData.material);
        } else {
          toast.error("Material tidak ditemukan");
        }

        if (movRes.ok) {
          const movData = await movRes.json();
          setMovements(movData.movements || []);
        }
      } catch (err) {
        console.error("Load material detail error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  if (isLoading || !material) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-warehouse-primary" />
        <p className="text-xs font-semibold text-slate-500">Memuat profil lengkap material...</p>
      </div>
    );
  }

  const isOutOfStock = material.currentStock <= 0;
  const isLowStock = material.currentStock > 0 && material.currentStock <= material.minimumStock;

  return (
    <div className="space-y-6 pb-12">
      {/* Back button and actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/materials"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Data Material
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/scan/${material.binCard?.qrToken || material.materialCode}`}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
          >
            <QrCode className="h-4 w-4" />
            Catat Mutasi (GR/GI)
          </Link>

          <BinCardLabelPrint
            material={material}
            qrToken={material.binCard?.qrToken || material.materialCode}
          />
        </div>
      </div>

      {/* Hero Info Card */}
      <div className="grid grid-cols-1 gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-emerald-100 px-2.5 py-0.5 text-xs font-black tracking-wider text-emerald-950 uppercase">
              {material.materialCode}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {material.category}
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 leading-snug">
            {material.description}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>Lokasi Rak Gudang: <strong>{material.storageLocation}</strong></span>
            </div>
            <span>&bull;</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Terdaftar Sejak: {formatDateTime(material.createdAt)}</span>
            </div>
          </div>

          {material.remarks && (
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <span className="font-bold text-slate-800">Catatan Khusus:</span> {material.remarks}
            </div>
          )}
        </div>

        {/* Stock Status Box */}
        <div className="flex flex-col justify-center rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 lg:col-span-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Saldo Fisik Aktual
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                isOutOfStock
                  ? "bg-red-200 text-red-900"
                  : isLowStock
                  ? "bg-amber-200 text-amber-900"
                  : "bg-emerald-200 text-emerald-900"
              }`}
            >
              {isOutOfStock ? "Stok Habis" : isLowStock ? "Minimum" : "Aman"}
            </span>
          </div>

          <div className="mt-2 text-4xl font-black text-slate-900">
            {formatNumber(material.currentStock)}{" "}
            <span className="text-base font-semibold text-slate-600">
              {material.uom}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-emerald-200/60 pt-2 text-xs text-slate-600">
            <span>Batas Minimum: <strong>{formatNumber(material.minimumStock)} {material.uom}</strong></span>
            <span>Kapasitas Max: <strong>{material.maximumStock ? `${formatNumber(material.maximumStock)} ${material.uom}` : "-"}</strong></span>
          </div>
        </div>
      </div>

      {/* Stock Movement Audit Trail Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-warehouse-primary" />
            <h3 className="text-sm font-bold text-slate-900">
              Audit Mutasi Bin Card & Riwayat Pergerakan Fisik
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {movements.length} Transaksi Tercatat
          </span>
        </div>

        {movements.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Belum ada data mutasi fisik untuk material ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Waktu & Tanggal</th>
                  <th className="px-5 py-3">No. Transaksi</th>
                  <th className="px-5 py-3 text-center">Jenis Mutasi</th>
                  <th className="px-5 py-3 text-right">Masuk (GR)</th>
                  <th className="px-5 py-3 text-right">Keluar (GI)</th>
                  <th className="px-5 py-3 text-right">Saldo Akhir</th>
                  <th className="px-5 py-3">Petugas Pelaksana</th>
                  <th className="px-5 py-3">No. Dokumen Ref & Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 text-slate-500">
                      {formatDateTime(m.createdAt)}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">
                      {m.transaction?.transactionNumber || "-"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          m.movementType === "IN"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {m.movementType === "IN" ? (
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
                    <td className="px-5 py-3 text-right font-bold text-emerald-700">
                      {m.quantityIn > 0 ? `+${formatNumber(m.quantityIn)}` : "-"}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-red-600">
                      {m.quantityOut > 0 ? `-${formatNumber(m.quantityOut)}` : "-"}
                    </td>
                    <td className="px-5 py-3 text-right font-black text-slate-900">
                      {formatNumber(m.balance)} {material.uom}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {m.transaction?.user?.name || "-"}
                    </td>
                    <td className="px-5 py-3 text-slate-500 max-w-xs truncate text-[11px]">
                      {m.transaction?.referenceNumber ? `[${m.transaction.referenceNumber}] ` : ""}
                      {m.transaction?.remarks || "-"}
                    </td>
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
