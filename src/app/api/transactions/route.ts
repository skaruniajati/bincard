import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { TransactionSchema } from "@/lib/validations";
import { generateTransactionNumber } from "@/lib/utils";
import realtime from "@/lib/events";
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Sesi otentikasi telah berakhir. Silakan login kembali." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const type = searchParams.get("type") || "ALL"; // ALL, GR, GI
    const materialId = searchParams.get("materialId") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (type && type !== "ALL") {
      where.transactionType = type;
    }

    if (materialId) {
      where.materialId = materialId;
    }

    if (search) {
      where.OR = [
        { transactionNumber: { contains: search } },
        { referenceNumber: { contains: search } },
        { remarks: { contains: search } },
        {
          material: {
            OR: [
              { materialCode: { contains: search } },
              { description: { contains: search } },
            ],
          },
        },
      ];
    }

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) {
        where.transactionDate.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        where.transactionDate.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const [total, transactions] = await Promise.all([
      db.transaction.count({ where }),
      db.transaction.findMany({
        where,
        include: {
          material: true,
          user: {
            select: { id: true, name: true, username: true, role: true },
          },
        },
        orderBy: { transactionDate: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET Transactions Error:", error);
    return NextResponse.json({ error: "Gagal memuat riwayat transaksi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sesi otentikasi telah berakhir. Silakan login kembali." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = TransactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi data transaksi gagal", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { materialId, transactionType, quantity, referenceNumber, remarks, transactionDate } = parsed.data;

    if (quantity <= 0) {
      return NextResponse.json(
        { error: "Jumlah kuantitas transaksi harus lebih besar dari 0." },
        { status: 400 }
      );
    }

    const txDate = transactionDate ? new Date(transactionDate) : new Date();

    // Jalankan seluruh transaksi dalam atomic Prisma transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Ambil data material langsung dari server db (sumber kebenaran absolut)
      const material = await tx.material.findUnique({
        where: { id: materialId },
      });

      if (!material) {
        throw new Error("Material tidak ditemukan dalam database.");
      }

      if (!material.isActive) {
        throw new Error("Material ini berstatus non-aktif. Transaksi tidak diizinkan.");
      }

      const previousBalance = material.currentStock;
      let newBalance = previousBalance;

      // 2. Kalkulasi saldo dan validasi bisnis
      if (transactionType === "GR") {
        newBalance = previousBalance + quantity;
      } else if (transactionType === "GI") {
        if (quantity > previousBalance) {
          throw new Error(
            `Stok tidak mencukupi! Stok tersedia saat ini: ${previousBalance} ${material.uom}, permintaan keluar: ${quantity} ${material.uom}. Transaksi ditolak.`
          );
        }
        newBalance = previousBalance - quantity;
      } else {
        throw new Error("Tipe transaksi tidak valid.");
      }

      // Pastikan saldo akhir tidak pernah negatif
      if (newBalance < 0) {
        throw new Error("Kalkulasi saldo menghasilkan nilai negatif. Transaksi dibatalkan.");
      }

      // 3. Generate transaction number unik
      const transactionNumber = generateTransactionNumber(transactionType);

      // 4. Buat record Transaksi
      const createdTx = await tx.transaction.create({
        data: {
          transactionNumber,
          materialId,
          transactionType,
          quantity,
          previousBalance,
          newBalance,
          transactionDate: txDate,
          referenceNumber: referenceNumber?.trim() || null,
          remarks: remarks?.trim() || null,
          userId: user.id,
        },
        include: {
          material: true,
          user: {
            select: { id: true, name: true, username: true, role: true },
          },
        },
      });

      // 5. Catat Stock Movement
      await tx.stockMovement.create({
        data: {
          materialId,
          transactionId: createdTx.id,
          movementType: transactionType === "GR" ? "IN" : "OUT",
          quantityIn: transactionType === "GR" ? quantity : 0,
          quantityOut: transactionType === "GI" ? quantity : 0,
          balance: newBalance,
          createdAt: txDate,
        },
      });

      // 6. Update saldo material
      const updatedMaterial = await tx.material.update({
        where: { id: materialId },
        data: {
          currentStock: newBalance,
        },
      });

      // 7. Catat Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: transactionType === "GR" ? "GR_TRANSACTION" : "GI_TRANSACTION",
          entity: "Transaction",
          entityId: createdTx.id,
          newValue: `${transactionType} ${quantity} ${material.uom} untuk ${material.materialCode} (${material.description}). Saldo: ${previousBalance} -> ${newBalance}. Ref: ${referenceNumber || "-"}`,
        },
      });

      return {
        transaction: createdTx,
        material: updatedMaterial,
        previousBalance,
        newBalance,
      };
    });

    // Broadcast ke Real-Time SSE Stream agar seluruh dashboard terupdate otomatis
    realtime.broadcast("transaction_completed", {
      transactionId: result.transaction.id,
      materialId: result.material.id,
      transactionType,
      quantity,
      newBalance: result.newBalance,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: `Transaksi ${transactionType === "GR" ? "Barang Masuk (GR)" : "Barang Keluar (GI)"} berhasil disimpan.`,
      transaction: result.transaction,
      material: result.material,
      previousBalance: result.previousBalance,
      newBalance: result.newBalance,
    });
  } catch (error: any) {
    console.error("POST Transaction Error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan internal saat memproses transaksi." },
      { status: 400 }
    );
  }
}
