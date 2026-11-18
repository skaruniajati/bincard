import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { MaterialSchema } from "@/lib/validations";
import { generateQrToken } from "@/lib/utils";
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
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "ALL"; // ALL, NORMAL, LOW, EMPTY
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { materialCode: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
        { storageLocation: { contains: search } },
      ];
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    // Filter status stok
    if (status === "LOW") {
      where.AND = [
        { currentStock: { gt: 0 } },
        // SQLite query filter will be handled or checked
      ];
    } else if (status === "EMPTY") {
      where.currentStock = { lte: 0 };
    }

    const [total, materials, categories] = await Promise.all([
      db.material.count({ where }),
      db.material.findMany({
        where,
        include: {
          binCard: true,
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      db.material.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ["category"],
      }),
    ]);

    // Handle post-query low stock filtering if requested
    let filteredMaterials = materials;
    if (status === "LOW") {
      filteredMaterials = materials.filter(
        (m) => m.currentStock > 0 && m.currentStock <= m.minimumStock
      );
    } else if (status === "NORMAL") {
      filteredMaterials = materials.filter((m) => m.currentStock > m.minimumStock);
    }

    return NextResponse.json({
      materials: filteredMaterials,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categories: categories.map((c) => c.category),
    });
  } catch (error) {
    console.error("GET Materials Error:", error);
    return NextResponse.json({ error: "Gagal memuat data material" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Otentikasi diperlukan" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya Admin Gudang yang memiliki izin menambah material baru" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = MaterialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi data gagal", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Cek apakah kode material sudah ada
    const existing = await db.material.findUnique({
      where: { materialCode: data.materialCode.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Material dengan kode '${data.materialCode.toUpperCase()}' sudah terdaftar.` },
        { status: 400 }
      );
    }

    const qrToken = generateQrToken(data.materialCode);

    // Buat material dan BinCard secara atomik
    const newMaterial = await db.$transaction(async (tx) => {
      const created = await tx.material.create({
        data: {
          materialCode: data.materialCode.toUpperCase(),
          description: data.description.toUpperCase(),
          category: data.category,
          uom: data.uom.toUpperCase(),
          currentStock: data.initialStock || 0,
          minimumStock: data.minimumStock || 0,
          maximumStock: data.maximumStock || null,
          storageLocation: data.storageLocation.toUpperCase(),
          remarks: data.remarks || null,
          isActive: true,
          binCard: {
            create: {
              qrToken,
              isActive: true,
            },
          },
        },
        include: {
          binCard: true,
        },
      });

      // Jika ada initial stock > 0, catat stock movement awal
      if (data.initialStock && data.initialStock > 0) {
        const initialTx = await tx.transaction.create({
          data: {
            transactionNumber: `TR-INIT-${Date.now().toString().slice(-6)}`,
            materialId: created.id,
            transactionType: "GR",
            quantity: data.initialStock,
            previousBalance: 0,
            newBalance: data.initialStock,
            remarks: "Saldo awal inisialisasi master data material",
            userId: user.id,
          },
        });

        await tx.stockMovement.create({
          data: {
            materialId: created.id,
            transactionId: initialTx.id,
            movementType: "IN",
            quantityIn: data.initialStock,
            quantityOut: 0,
            balance: data.initialStock,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CREATE",
          entity: "Material",
          entityId: created.id,
          newValue: `Tambah material: ${created.materialCode} - ${created.description} (Stok Awal: ${created.currentStock} ${created.uom})`,
        },
      });

      return created;
    });

    // Broadcast realtime event
    realtime.broadcast("material_created", { materialId: newMaterial.id });

    return NextResponse.json({
      success: true,
      material: newMaterial,
      message: "Material dan Bin Card QR Code berhasil didaftarkan.",
    });
  } catch (error) {
    console.error("POST Material Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat menyimpan material." },
      { status: 500 }
    );
  }
}
