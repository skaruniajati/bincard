import { NextResponse } from "next/server";
import db from "@/lib/db";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { id } from "date-fns/locale";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const materials = await db.material.findMany({
      where: { isActive: true },
      include: { binCard: true },
    });

    const totalMaterials = materials.length;
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let normalStockCount = 0;

    const alertMaterials: any[] = [];

    materials.forEach((m) => {
      totalStockUnits += m.currentStock;
      if (m.currentStock <= 0) {
        outOfStockCount++;
        alertMaterials.push({
          ...m,
          stockStatus: "EMPTY",
          statusLabel: "Stok Habis",
        });
      } else if (m.currentStock <= m.minimumStock) {
        lowStockCount++;
        alertMaterials.push({
          ...m,
          stockStatus: "LOW",
          statusLabel: "Mendekati Minimum",
        });
      } else {
        normalStockCount++;
      }
    });

    // Total transactions
    const [grStats, giStats] = await Promise.all([
      db.transaction.aggregate({
        where: { transactionType: "GR" },
        _count: { id: true },
        _sum: { quantity: true },
      }),
      db.transaction.aggregate({
        where: { transactionType: "GI" },
        _count: { id: true },
        _sum: { quantity: true },
      }),
    ]);

    // Trend pergerakan 7 hari terakhir
    const movementTrends = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = subDays(new Date(), i);
      const dayStart = startOfDay(targetDate);
      const dayEnd = endOfDay(targetDate);
      const dayLabel = format(targetDate, "dd MMM", { locale: id });

      const dayGR = await db.transaction.aggregate({
        where: {
          transactionType: "GR",
          transactionDate: { gte: dayStart, lte: dayEnd },
        },
        _sum: { quantity: true },
      });

      const dayGI = await db.transaction.aggregate({
        where: {
          transactionType: "GI",
          transactionDate: { gte: dayStart, lte: dayEnd },
        },
        _sum: { quantity: true },
      });

      movementTrends.push({
        period: dayLabel,
        masuk: dayGR._sum.quantity || 0,
        keluar: dayGI._sum.quantity || 0,
      });
    }

    // Recent Transactions (8 transaksi terakhir)
    const recentTransactions = await db.transaction.findMany({
      take: 8,
      orderBy: { transactionDate: "desc" },
      include: {
        material: true,
        user: { select: { name: true, username: true } },
      },
    });

    const stockComposition = [
      { status: "Stok Aman / Normal", count: normalStockCount, color: "#0284C7" },
      { status: "Mendekati Minimum", count: lowStockCount, color: "#F59E0B" },
      { status: "Stok Habis / Kosong", count: outOfStockCount, color: "#F43F5E" },
    ];

    return NextResponse.json({
      totalMaterials,
      totalStockUnits,
      totalReceiptsCount: grStats._count.id || 0,
      totalReceiptsQty: grStats._sum.quantity || 0,
      totalIssuesCount: giStats._count.id || 0,
      totalIssuesQty: giStats._sum.quantity || 0,
      lowStockCount,
      outOfStockCount,
      stockComposition,
      movementTrends,
      recentTransactions,
      alertMaterials,
    });
  } catch (error) {
    console.error("GET Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Gagal memuat statistik dashboard" }, { status: 500 });
  }
}
