import React from "react";
import { AlertTriangle, XCircle, ArrowRight, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";

interface MaterialAlertListProps {
  materials: any[];
}

export default function MaterialAlertList({ materials }: MaterialAlertListProps) {
  if (!materials || materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 mb-2 shadow-xs">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-slate-800">Semua Stok Material Aman</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Tidak ada material yang mencapai batas minimum atau kosong.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {materials.map((mat) => {
        const isOutOfStock = mat.currentStock <= 0;
        return (
          <div
            key={mat.id}
            className={`flex items-center justify-between rounded-xl border p-3 transition-all duration-200 hover:-translate-y-0.5 ${
              isOutOfStock
                ? "border-rose-200 bg-rose-50/50 hover:bg-rose-50"
                : "border-amber-200 bg-amber-50/40 hover:bg-amber-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${
                  isOutOfStock
                    ? "bg-rose-100 text-rose-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {isOutOfStock ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">
                    {mat.materialCode}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.2 text-[9px] font-extrabold uppercase ${
                      isOutOfStock
                        ? "bg-rose-200 text-rose-900"
                        : "bg-amber-200 text-amber-900"
                    }`}
                  >
                    {isOutOfStock ? "Stok Habis" : "Stok Minimum"}
                  </span>
                </div>

                <div className="text-xs font-medium text-slate-700 line-clamp-1">
                  {mat.description}
                </div>

                <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {mat.storageLocation}
                  </span>
                  <span>&bull;</span>
                  <span>Kategori: {mat.category}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-black text-slate-900">
                {formatNumber(mat.currentStock)}{" "}
                <span className="text-[10px] font-normal text-slate-500">{mat.uom}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Min: {formatNumber(mat.minimumStock)} {mat.uom}
              </div>

              <Link
                href={`/scan/${mat.binCard?.qrToken || mat.materialCode}`}
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-800 hover:underline"
              >
                Transaksi GR <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
