"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Search,
  Filter,
  Plus,
  QrCode,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import MaterialModal from "@/components/materials/MaterialModal";
import BinCardLabelPrint from "@/components/bincard/BinCardLabelPrint";
import { formatNumber } from "@/lib/utils";
import { toast } from "sonner";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        category: categoryFilter,
        status: statusFilter,
        page: String(page),
        limit: "10",
      });

      const res = await fetch(`/api/materials?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMaterials(data.materials || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.categories) setCategories(data.categories);
      }
    } catch (err) {
      console.error("Fetch materials error:", err);
      toast.error("Gagal memuat data master material");
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryFilter, statusFilter, page]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleDeactivate = async (id: string, code: string) => {
    if (!confirm(`Apakah Anda yakin ingin menonaktifkan material ${code}?`)) return;

    try {
      const res = await fetch(`/api/materials/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Material ${code} berhasil dinonaktifkan.`);
        fetchMaterials();
      } else {
        toast.error(data.error || "Gagal menonaktifkan material");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memproses permintaan");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Master Data Material & Suku Cadang
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Katalog suku cadang armada dump truck, traktor, peralatan operasional, pelumas, dan material pergudangan
          </p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-sky-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Material Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:grid-cols-12">
        <div className="relative sm:col-span-6">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari kode material, deskripsi, atau lokasi rak..."
            className="w-full rounded-xl border border-sky-100 bg-sky-50/40 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-sky-100 bg-sky-50/40 py-2.5 px-3 text-xs font-semibold text-slate-700 focus:border-sky-500 focus:bg-white focus:outline-none"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-sky-100 bg-sky-50/40 py-2.5 px-3 text-xs font-semibold text-slate-700 focus:border-sky-500 focus:bg-white focus:outline-none"
          >
            <option value="ALL">Semua Status Stok</option>
            <option value="NORMAL">Stok Normal / Aman</option>
            <option value="LOW">Stok Minimum (Alert)</option>
            <option value="EMPTY">Stok Kosong</option>
          </select>
        </div>
      </div>

      {/* Material Table */}
      <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-sky-100 bg-sky-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3.5 text-center w-12">No</th>
                <th className="px-4 py-3.5">Kode Material</th>
                <th className="px-4 py-3.5">Deskripsi Barang</th>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">Lokasi Rak</th>
                <th className="px-4 py-3.5 text-right">Stok Fisik</th>
                <th className="px-4 py-3.5 text-right">Batas Min</th>
                <th className="px-4 py-3.5 text-center">Status QR</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-sky-600" />
                    Memuat data master material...
                  </td>
                </tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada material yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                materials.map((mat, idx) => {
                  const isOutOfStock = mat.currentStock <= 0;
                  const isLowStock =
                    mat.currentStock > 0 && mat.currentStock <= mat.minimumStock;

                  return (
                    <tr key={mat.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="px-4 py-3 text-center text-slate-400">
                        {(page - 1) * 10 + idx + 1}
                      </td>

                      <td className="px-4 py-3">
                        <Link
                          href={`/materials/${mat.id}`}
                          className="font-bold text-slate-900 hover:text-sky-700 uppercase hover:underline"
                        >
                          {mat.materialCode}
                        </Link>
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-slate-900 line-clamp-1">
                          {mat.description}
                        </div>
                        {mat.remarks && (
                          <div className="text-[10px] text-slate-400 truncate">
                            {mat.remarks}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {mat.category}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-[11px] text-slate-600">
                          <MapPin className="h-3 w-3 text-sky-600" />
                          {mat.storageLocation}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-black ${
                            isOutOfStock
                              ? "text-rose-600"
                              : isLowStock
                              ? "text-amber-600"
                              : "text-sky-700"
                          }`}
                        >
                          {formatNumber(mat.currentStock)}{" "}
                          <span className="text-[10px] font-normal text-slate-500">
                            {mat.uom}
                          </span>
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right text-slate-500">
                        {formatNumber(mat.minimumStock)} {mat.uom}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            mat.binCard?.isActive
                              ? "bg-sky-100 text-sky-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {mat.binCard?.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/scan/${mat.binCard?.qrToken || mat.materialCode}`}
                            title="Scan / Buka Transaksi"
                            className="rounded-lg p-1.5 text-sky-700 hover:bg-sky-50"
                          >
                            <QrCode className="h-4 w-4" />
                          </Link>

                          <Link
                            href={`/materials/${mat.id}`}
                            title="Detail Material"
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(mat);
                              setIsModalOpen(true);
                            }}
                            title="Edit Material"
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeactivate(mat.id, mat.materialCode)}
                            title="Nonaktifkan Material"
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
            Menampilkan <strong>{materials.length}</strong> dari <strong>{total}</strong> material
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

      {/* Modal Add / Edit */}
      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMaterials}
        editItem={editingItem}
      />
    </div>
  );
}
