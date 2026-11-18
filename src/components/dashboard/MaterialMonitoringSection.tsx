"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Package,
  Layers,
  MapPin,
  TrendingUp,
  History,
  QrCode,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { formatDateTime, formatNumber } from "@/lib/utils";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MaterialMonitoringSection() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);

  // Cari material saat query berubah (debounce)
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSearch(true);
      try {
        const res = await fetch(`/api/materials?search=${encodeURIComponent(query)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.materials || []);
        }
      } catch (err) {
        console.error("Search material error:", err);
      } finally {
        setIsLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Load movements history saat material dipilih
  const handleSelectMaterial = async (mat: any) => {
    setSelectedMaterial(mat);
    setSearchResults([]);
    setIsLoadingMovements(true);

    try {
      const res = await fetch(`/api/materials/${mat.id}/movements?limit=15`);
      if (res.ok) {
        const data = await res.json();
        setMovements(data.movements || []);
      }
    } catch (err) {
      console.error("Fetch movements error:", err);
    } finally {
      setIsLoadingMovements(false);
    }
  };

  // Format data chart tren pergerakan stok
  const chartData = [...movements]
    .reverse()
    .map((m) => ({
      date: formatDateTime(m.createdAt),
      balance: m.balance,
      type: m.movementType,
    }));

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition-all hover:border-sky-200">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Material Monitoring & Stock Movement
          </h3>
          <p className="text-xs text-slate-500">
            Pencarian dan penelusuran mutasi persediaan spesifik per material
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kode material atau nama material..."
            className="w-full rounded-xl border border-sky-100 bg-sky-50/40 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-xl border border-sky-100 bg-white p-1.5 shadow-xl">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectMaterial(item)}
                  className="flex cursor-pointer items-center justify-between rounded-lg p-2.5 hover:bg-sky-50 transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {item.materialCode}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {item.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-sky-700">
                      {formatNumber(item.currentStock)} {item.uom}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {item.storageLocation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Material Detail or Empty State */}
      {!selectedMaterial ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-100 bg-sky-50/20 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 shadow-xs">
            <Search className="h-8 w-8 stroke-[1.8]" />
          </div>
          <h4 className="mt-4 text-sm font-bold text-slate-800">
            Pencarian Persediaan Material
          </h4>
          <p className="mt-1 max-w-md text-xs text-slate-500 leading-relaxed">
            Silakan cari dan pilih material untuk melihat detail monitoring persediaan, saldo fisik, lokasi bin, dan riwayat mutasi pergerakan stok.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Material Identity Card */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-sky-100 bg-sky-50/50 p-5 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-sky-200/80 px-2 py-0.5 text-[11px] font-black text-sky-950 uppercase tracking-wider">
                  {selectedMaterial.materialCode}
                </span>
                <span className="text-xs text-slate-500">
                  Kategori: {selectedMaterial.category}
                </span>
              </div>
              <h2 className="mt-2 text-base font-bold text-slate-900">
                {selectedMaterial.description}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <MapPin className="h-4 w-4 text-sky-700" />
                <span className="font-semibold text-slate-800">
                  Lokasi Gudang: {selectedMaterial.storageLocation}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center rounded-xl bg-white p-3.5 shadow-sm border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                Stok Fisik Tersedia
              </span>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {formatNumber(selectedMaterial.currentStock)}{" "}
                <span className="text-xs font-normal text-slate-500">
                  {selectedMaterial.uom}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>Min: {formatNumber(selectedMaterial.minimumStock)}</span>
                <span>Max: {selectedMaterial.maximumStock ? formatNumber(selectedMaterial.maximumStock) : "-"}</span>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-2 rounded-xl bg-white p-3.5 shadow-sm border border-slate-100">
              <Link
                href={`/scan/${selectedMaterial.binCard?.qrToken || selectedMaterial.materialCode}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700 transition-colors"
              >
                <QrCode className="h-4 w-4" />
                Transaksi Bin Card
              </Link>
              <Link
                href={`/materials/${selectedMaterial.id}`}
                className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-sky-700"
              >
                Lihat Detail Lengkap <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Trend Chart (jika ada data pergerakan) */}
          {chartData.length > 1 && (
            <div className="rounded-xl border border-sky-100 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-sky-600" />
                  Grafik Fluktuasi Saldo Stok
                </span>
                <span className="text-[11px] text-slate-400">
                  Berdasarkan riwayat transaksi
                </span>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F7FF" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} hide />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0F172A",
                        borderRadius: "8px",
                        border: "none",
                        color: "#FFFFFF",
                        fontSize: "11px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      name="Saldo Akhir"
                      stroke="#0284C7"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#0284C7" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Stock Movement History Table */}
          <div className="overflow-hidden rounded-xl border border-sky-100">
            <div className="flex items-center justify-between border-b border-sky-100 bg-sky-50/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-slate-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Riwayat Mutasi Stock Movement
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                {movements.length} Transaksi Tercatat
              </span>
            </div>

            {isLoadingMovements ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Memuat riwayat mutasi stok...
              </div>
            ) : movements.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada transaksi mutasi untuk material ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-sky-100 bg-sky-50/40 text-[11px] font-semibold text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-2.5">Tanggal</th>
                      <th className="px-4 py-2.5">No. Transaksi</th>
                      <th className="px-4 py-2.5 text-center">Tipe Mutasi</th>
                      <th className="px-4 py-2.5 text-right">Masuk (Qty In)</th>
                      <th className="px-4 py-2.5 text-right">Keluar (Qty Out)</th>
                      <th className="px-4 py-2.5 text-right">Saldo (Balance)</th>
                      <th className="px-4 py-2.5">Petugas</th>
                      <th className="px-4 py-2.5">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {movements.map((m) => (
                      <tr key={m.id} className="hover:bg-sky-50/30 transition-colors">
                        <td className="px-4 py-2.5 text-slate-500">
                          {formatDateTime(m.createdAt)}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-slate-900">
                          {m.transaction?.transactionNumber || "-"}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              m.movementType === "IN"
                                ? "bg-sky-100 text-sky-800"
                                : "bg-rose-100 text-rose-800"
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
                        <td className="px-4 py-2.5 text-right font-bold text-sky-700">
                          {m.quantityIn > 0 ? `+${formatNumber(m.quantityIn)}` : "-"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-rose-600">
                          {m.quantityOut > 0 ? `-${formatNumber(m.quantityOut)}` : "-"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-black text-slate-900">
                          {formatNumber(m.balance)} {selectedMaterial.uom}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">
                          {m.transaction?.user?.name || m.transaction?.user?.username || "-"}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate text-[11px]">
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
      )}
    </div>
  );
}
