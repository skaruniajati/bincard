import React from "react";
import { formatDateTime, formatNumber } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface RecentTransactionsTableProps {
  transactions: any[];
}

export default function RecentTransactionsTable({ transactions }: RecentTransactionsTableProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">
        Belum ada riwayat transaksi tercatat.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-sky-100 bg-sky-50/50 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          <tr>
            <th className="px-4 py-3">Waktu & No. Transaksi</th>
            <th className="px-4 py-3">Material</th>
            <th className="px-4 py-3 text-center">Tipe</th>
            <th className="px-4 py-3 text-right">Jumlah (Qty)</th>
            <th className="px-4 py-3 text-right">Saldo Akhir</th>
            <th className="px-4 py-3">Petugas</th>
            <th className="px-4 py-3">Ref / Catatan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {transactions.map((tx) => {
            const isGR = tx.transactionType === "GR";
            return (
              <tr key={tx.id} className="hover:bg-sky-50/40 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{tx.transactionNumber}</div>
                  <div className="text-[11px] text-slate-400">{formatDateTime(tx.transactionDate)}</div>
                </td>

                <td className="px-4 py-3">
                  <div className="font-bold text-slate-900">{tx.material?.materialCode}</div>
                  <div className="text-[11px] text-slate-500 max-w-xs truncate">
                    {tx.material?.description}
                  </div>
                </td>

                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                      isGR
                        ? "bg-sky-100 text-sky-800 border border-sky-300"
                        : "bg-rose-100 text-rose-800 border border-rose-300"
                    }`}
                  >
                    {isGR ? (
                      <>
                        <ArrowDownLeft className="h-3 w-3" /> MASUK (GR)
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="h-3 w-3" /> KELUAR (GI)
                      </>
                    )}
                  </span>
                </td>

                <td className="px-4 py-3 text-right font-bold text-slate-900">
                  <span className={isGR ? "text-sky-700" : "text-rose-600"}>
                    {isGR ? `+${formatNumber(tx.quantity)}` : `-${formatNumber(tx.quantity)}`}
                  </span>{" "}
                  <span className="text-[10px] font-normal text-slate-500">
                    {tx.material?.uom}
                  </span>
                </td>

                <td className="px-4 py-3 text-right font-semibold text-slate-800">
                  {formatNumber(tx.newBalance)}{" "}
                  <span className="text-[10px] font-normal text-slate-500">
                    {tx.material?.uom}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {tx.user?.name || tx.user?.username || "-"}
                  </span>
                </td>

                <td className="px-4 py-3 text-slate-500 max-w-xs truncate text-[11px]">
                  {tx.referenceNumber ? `[${tx.referenceNumber}] ` : ""}
                  {tx.remarks || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
