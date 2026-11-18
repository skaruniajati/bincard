"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Package,
  MapPin,
  QrCode,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  History,
  Printer,
  RefreshCw,
  ExternalLink,
  Eye,
  Maximize2,
  X,
  Tag,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  FileText,
  Calendar,
  User,
  Info,
  Camera,
  UploadCloud,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import TransactionDialog from "@/components/transactions/TransactionDialog";
import BinCardLabelPrint from "@/components/bincard/BinCardLabelPrint";
import { formatNumber, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function ScanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawQrToken = params.qrToken as string;

  const [data, setData] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal zoom foto material
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoTimestamp, setPhotoTimestamp] = useState(Date.now());

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data?.material) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File yang diunggah harus berupa file gambar!");
      return;
    }

    setIsUploadingPhoto(true);
    const toastId = toast.loading("Mengunggah dan menyimpan foto material baru...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/material-image/${encodeURIComponent(data.material.materialCode)}`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengunggah foto material");

      setImageError(false);
      setPhotoTimestamp(Date.now());
      toast.success(json.message || "Foto fisik material berhasil diperbarui!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah foto material", { id: toastId });
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const fetchScanData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setImageError(false);
    try {
      const [scanRes, userRes] = await Promise.all([
        fetch(`/api/scan/${encodeURIComponent(rawQrToken)}`),
        fetch("/api/auth/me"),
      ]);

      const scanJson = await scanRes.json();
      if (!scanRes.ok) {
        throw new Error(scanJson.error || "Material dengan QR Code ini tidak ditemukan.");
      }

      setData(scanJson);

      if (userRes.ok) {
        const userJson = await userRes.json();
        setCurrentUser(userJson.user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memproses QR Code");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (rawQrToken) {
      fetchScanData();
    }
  }, [rawQrToken]);

  // Handle transaksi GR / GI sukses
  const handleTransactionSuccess = (updatedMaterial: any, createdTransaction?: any) => {
    setData((prev: any) => {
      if (!prev || !prev.material) return prev;

      const newTx = createdTransaction || {
        id: `tx-${Date.now()}`,
        transactionNumber: "TERCATAT",
        transactionType: updatedMaterial.currentStock > prev.material.currentStock ? "GR" : "GI",
        quantity: Math.abs(updatedMaterial.currentStock - prev.material.currentStock),
        previousBalance: prev.material.currentStock,
        newBalance: updatedMaterial.currentStock,
        transactionDate: new Date().toISOString(),
        user: { name: currentUser?.name || "Operator Gudang" },
      };

      return {
        ...prev,
        material: {
          ...prev.material,
          currentStock: updatedMaterial.currentStock,
          transactions: [newTx, ...(prev.material.transactions || [])],
        },
      };
    });

    toast.success(
      `Saldo fisik material berhasil diperbarui menjadi ${formatNumber(updatedMaterial.currentStock)} ${data?.material?.uom || ""}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-warehouse-primary" />
        <p className="text-xs font-semibold text-slate-500">
          Memuat data spesifikasi material & memverifikasi token QR...
        </p>
      </div>
    );
  }

  if (errorMessage || !data?.material) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 mx-auto mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">QR Code Tidak Ditemukan</h3>
        <p className="mt-2 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {errorMessage ||
            "Token QR Code atau kode material yang Anda pindai tidak terdaftar dalam database persediaan gudang."}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/scan"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Scanner
          </Link>
          <Link
            href="/materials"
            className="flex items-center gap-1.5 rounded-xl bg-warehouse-dark px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700 transition-colors"
          >
            Lihat Master Data Material
          </Link>
        </div>
      </div>
    );
  }

  const { material } = data;
  const isOutOfStock = material.currentStock <= 0;
  const isLowStock = material.currentStock > 0 && material.currentStock <= material.minimumStock;

  // URL gambar material berdasarkan kode material (file di public/ atau via API image converter)
  const imageUrl = `/api/material-image/${encodeURIComponent(material.materialCode)}?t=${photoTimestamp}`;

  // Hitung persentase kapasitas stok jika maxStock ditentukan
  const maxStockCapacity = material.maximumStock && material.maximumStock > 0 ? material.maximumStock : material.minimumStock * 3 || 100;
  const stockPercentage = Math.min(100, Math.round((material.currentStock / maxStockCapacity) * 100));

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/scan"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Pindai QR Lain
          </Link>

          <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs text-slate-700 border border-slate-200">
            <QrCode className="h-4 w-4 text-sky-600" />
            <span className="font-mono font-bold text-slate-900">
              {data.qrToken || `QR-${material.materialCode}`}
            </span>
          </div>
        </div>

        {/* Action button print label */}
        <div className="flex items-center gap-2">
          <BinCardLabelPrint
            material={material}
            qrToken={data.qrToken || material.binCard?.qrToken || `QR-${material.materialCode}`}
          />
        </div>
      </div>

      {/* Main Grid: Left (Photo & Details) | Right (Stock & GR/GI Transaction Form) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Material Photo & Physical Identity (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Foto Material Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-sky-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Foto Suku Cadang Fisik
                </h3>
              </div>

              <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-black tracking-wider text-sky-950 uppercase">
                {material.materialCode}
              </span>
            </div>

            {/* Photo Container */}
            <div className="relative aspect-square w-full bg-slate-900 flex items-center justify-center overflow-hidden group">
              {!imageError ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={material.description}
                    onError={() => setImageError(true)}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Click to zoom button overlay */}
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    Perbesar Foto
                  </button>
                </>
              ) : (
                /* Fallback placeholder when no photo exists */
                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800 text-slate-500 mb-3 border border-slate-700">
                    <Package className="h-10 w-10 stroke-[1.5]" />
                  </div>
                  <span className="text-sm font-bold text-slate-200">
                    Foto Belum Tersedia
                  </span>
                  <p className="mt-1 text-xs text-slate-400 max-w-xs leading-relaxed">
                    Belum terdapat file foto bernama <code className="text-sky-400 font-mono font-bold">{material.materialCode}.jpg</code> di folder penyimpanan gambar.
                  </p>
                </div>
              )}
            </div>

            {/* Pilihan Unggah / Perbarui Foto Fisik Material */}
            <div className="border-t border-slate-100 bg-sky-50/60 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <Camera className="h-4 w-4 text-sky-700 shrink-0" />
                <span className="font-bold text-slate-800">
                  Perbarui Foto Material:
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="upload-photo-detail-input"
                  className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-sky-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-800 active:scale-95 transition-all ${
                    isUploadingPhoto ? "opacity-75 pointer-events-none" : ""
                  }`}
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan Foto...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>Unggah / Jepret Foto Baru</span>
                    </>
                  )}
                </label>
                <input
                  id="upload-photo-detail-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  disabled={isUploadingPhoto}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Description & Attributes */}
            <div className="p-5 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nama Suku Cadang / Material
                </span>
                <h2 className="mt-1 text-base font-black text-slate-900 leading-snug">
                  {material.description}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 block">Kategori</span>
                  <span className="font-bold text-slate-800">{material.category}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 block">Satuan (UOM)</span>
                  <span className="font-bold text-slate-800">{material.uom}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 block">Lokasi Rak / Bin</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-sky-600" />
                    {material.storageLocation}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 block">Stok Minimum</span>
                  <span className="font-bold text-slate-800">
                    {formatNumber(material.minimumStock)} {material.uom}
                  </span>
                </div>
              </div>

              {material.remarks && (
                <div className="pt-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-400">Catatan:</span> {material.remarks}
                </div>
              )}

              <div className="pt-2 text-center">
                <Link
                  href={`/materials/${material.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-warehouse-primary hover:underline"
                >
                  Buka Master Data & Kartu Stok Lengkap
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Stock & GR / GI Transaction Controls (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Live Current Stock Card */}
          <div
            className={`overflow-hidden rounded-2xl border p-6 shadow-sm transition-all ${
              isOutOfStock
                ? "border-red-200 bg-red-50/60"
                : isLowStock
                ? "border-amber-200 bg-amber-50/60"
                : "border-sky-200 bg-sky-50/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Saldo Stok Fisik Terkini
                </span>
                <p className="text-xs text-slate-500">
                  Status persediaan aktual terverifikasi di rak gudang
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                  isOutOfStock
                    ? "bg-red-200 text-red-900 border border-red-300"
                    : isLowStock
                    ? "bg-amber-200 text-amber-900 border border-amber-300"
                    : "bg-emerald-200 text-sky-950 border border-emerald-300"
                }`}
              >
                {isOutOfStock ? "Stok Habis" : isLowStock ? "Mendekati Minimum" : "Aman / Normal"}
              </span>
            </div>

            {/* Giant Stock Number Display */}
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900 tracking-tight">
                {formatNumber(material.currentStock)}
              </span>
              <span className="text-xl font-bold text-slate-600">
                {material.uom}
              </span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>
                  Batas Min: {formatNumber(material.minimumStock)} {material.uom}
                </span>
                <span>
                  Kapasitas Max:{" "}
                  {material.maximumStock
                    ? `${formatNumber(material.maximumStock)} ${material.uom}`
                    : "-"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className={`h-full transition-all duration-500 ${
                    isOutOfStock
                      ? "bg-red-600"
                      : isLowStock
                      ? "bg-amber-500"
                      : "bg-sky-600"
                  }`}
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Form Perubahan GR / GI */}
          <TransactionDialog
            material={material}
            currentUser={currentUser}
            onSuccess={handleTransactionSuccess}
          />
        </div>
      </div>

      {/* Bottom Section: Histori Mutasi Terkini (Kartu Bin Card Digital) */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Catatan Mutasi Terkini (Digital Bin Card Log)
              </h3>
              <p className="text-xs text-slate-500">
                Histori 10 transaksi terakhir barang masuk (GR) dan barang keluar (GI)
              </p>
            </div>
          </div>

          <Link
            href={`/transactions?materialId=${material.id}`}
            className="flex items-center gap-1 text-xs font-bold text-warehouse-primary hover:underline"
          >
            Lihat Semua Transaksi
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Table of Transactions */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-4">Jenis Mutasi</th>
                <th className="py-3 px-4">No. Dokumen / Ref</th>
                <th className="py-3 px-4 text-right">Masuk / Keluar</th>
                <th className="py-3 px-4 text-right">Sisa Saldo</th>
                <th className="py-3 px-4">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {material.transactions && material.transactions.length > 0 ? (
                material.transactions.map((tx: any) => {
                  const isGR = tx.transactionType === "GR";
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        {formatDateTime(tx.transactionDate)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {tx.transactionNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                            isGR
                              ? "bg-sky-100 text-sky-800 border border-emerald-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {isGR ? (
                            <>
                              <ArrowDownLeft className="h-3 w-3" /> GR (Masuk)
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="h-3 w-3" /> GI (Keluar)
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {tx.referenceNumber || "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-black">
                        <span className={isGR ? "text-sky-700" : "text-red-700"}>
                          {isGR ? "+" : "-"}
                          {formatNumber(tx.quantity)} {material.uom}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatNumber(tx.newBalance)} {material.uom}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {tx.user?.name || "Petugas Lapangan"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada catatan mutasi transaksi pada material ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox Modal Zoom Foto */}
      {isPhotoModalOpen && (
        <div
          onClick={() => setIsPhotoModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl bg-slate-900 p-2 shadow-2xl"
          >
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <span className="rounded-lg bg-black/60 px-3 py-1 font-mono text-xs font-bold text-white backdrop-blur-md">
                {material.materialCode}
              </span>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="rounded-lg bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={material.description}
              className="max-h-[80vh] w-auto rounded-xl object-contain"
            />
            <div className="p-3 text-center text-xs font-bold text-slate-300">
              {material.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
