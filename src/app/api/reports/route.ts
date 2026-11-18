import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "STOCK"; // STOCK, GR, GI, MOVEMENT, LOW_STOCK
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const materialId = searchParams.get("materialId") || "";

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(`${startDate}T00:00:00.000Z`);
    if (endDate) dateFilter.lte = new Date(`${endDate}T23:59:59.999Z`);

    if (reportType === "STOCK" || reportType === "LOW_STOCK") {
      const where: any = { isActive: true };
      if (materialId) where.id = materialId;

      let materials = await db.material.findMany({
        where,
        include: { binCard: true },
        orderBy: { category: "asc" },
      });

      if (reportType === "LOW_STOCK") {
        materials = materials.filter((m) => m.currentStock <= m.minimumStock);
      }

      const rows = materials.map((m, idx) => ({
        no: idx + 1,
        code: m.materialCode,
        description: m.description,
        category: m.category,
        uom: m.uom,
        currentStock: m.currentStock,
        minimumStock: m.minimumStock,
        maximumStock: m.maximumStock || "-",
        storageLocation: m.storageLocation,
        status: m.currentStock <= 0 ? "KOSONG" : m.currentStock <= m.minimumStock ? "MINIMUM" : "AMAN",
        qrToken: m.binCard?.qrToken || "-",
      }));

      return NextResponse.json({ success: true, reportType, rows });
    }

    if (reportType === "GR" || reportType === "GI") {
      const where: any = {
        transactionType: reportType,
      };
      if (materialId) where.materialId = materialId;
      if (startDate || endDate) where.transactionDate = dateFilter;

      const transactions = await db.transaction.findMany({
        where,
        include: {
          material: true,
          user: { select: { name: true, username: true } },
        },
        orderBy: { transactionDate: "desc" },
      });

      const rows = transactions.map((t, idx) => ({
        no: idx + 1,
        transactionNumber: t.transactionNumber,
        date: t.transactionDate,
        materialCode: t.material.materialCode,
        materialDescription: t.material.description,
        type: t.transactionType,
        quantity: t.quantity,
        uom: t.material.uom,
        previousBalance: t.previousBalance,
        newBalance: t.newBalance,
        referenceNumber: t.referenceNumber || "-",
        user: t.user?.name || t.user?.username || "-",
        remarks: t.remarks || "-",
      }));

      return NextResponse.json({ success: true, reportType, rows });
    }

    if (reportType === "MOVEMENT") {
      const where: any = {};
      if (materialId) where.materialId = materialId;
      if (startDate || endDate) where.createdAt = dateFilter;

      const movements = await db.stockMovement.findMany({
        where,
        include: {
          material: true,
          transaction: {
            include: {
              user: { select: { name: true, username: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const rows = movements.map((m, idx) => ({
        no: idx + 1,
        date: m.createdAt,
        transactionNumber: m.transaction.transactionNumber,
        materialCode: m.material.materialCode,
        materialDescription: m.material.description,
        type: m.movementType === "IN" ? "BARANG MASUK (GR)" : "BARANG KELUAR (GI)",
        quantityIn: m.quantityIn,
        quantityOut: m.quantityOut,
        balance: m.balance,
        uom: m.material.uom,
        referenceNumber: m.transaction.referenceNumber || "-",
        user: m.transaction.user?.name || "-",
        remarks: m.transaction.remarks || "-",
      }));

      return NextResponse.json({ success: true, reportType, rows });
    }

    return NextResponse.json({ error: "Tipe laporan tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("GET Reports Error:", error);
    return NextResponse.json({ error: "Gagal memproses data laporan" }, { status: 500 });
  }
}
