import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateQrToken } from "@/lib/utils";
import realtime from "@/lib/events";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { qrToken: { contains: search } },
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

    const binCards = await db.binCard.findMany({
      where,
      include: {
        material: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ binCards });
  } catch (error) {
    console.error("GET BinCards Error:", error);
    return NextResponse.json({ error: "Gagal memuat daftar Bin Card" }, { status: 500 });
  }
}

// Regenerate QR Code atau Toggle Status Bin Card
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Hanya Admin yang dapat mengelola QR Code Bin Card" }, { status: 403 });
    }

    const body = await request.json();
    const { materialId, action } = body;

    const material = await db.material.findUnique({
      where: { id: materialId },
      include: { binCard: true },
    });

    if (!material) {
      return NextResponse.json({ error: "Material tidak ditemukan" }, { status: 404 });
    }

    if (action === "REGENERATE") {
      const newToken = generateQrToken(material.materialCode);
      const updated = await db.binCard.upsert({
        where: { materialId },
        update: {
          qrToken: newToken,
          isActive: true,
        },
        create: {
          materialId,
          qrToken: newToken,
          isActive: true,
        },
      });

      await db.auditLog.create({
        data: {
          userId: user.id,
          action: "REGENERATE_QR",
          entity: "BinCard",
          entityId: updated.id,
          newValue: `QR Code diperbarui untuk ${material.materialCode}: ${newToken}`,
        },
      });

      realtime.broadcast("bincard_updated", { materialId });

      return NextResponse.json({
        success: true,
        message: "QR Code Bin Card berhasil diperbarui ulang.",
        binCard: updated,
      });
    } else if (action === "TOGGLE_STATUS") {
      if (!material.binCard) {
        return NextResponse.json({ error: "Bin Card belum dibuat untuk material ini" }, { status: 400 });
      }

      const updated = await db.binCard.update({
        where: { materialId },
        data: {
          isActive: !material.binCard.isActive,
        },
      });

      await db.auditLog.create({
        data: {
          userId: user.id,
          action: updated.isActive ? "ACTIVATE_QR" : "DEACTIVATE_QR",
          entity: "BinCard",
          entityId: updated.id,
          newValue: `Status QR Code diubah menjadi: ${updated.isActive ? "Aktif" : "Non-Aktif"}`,
        },
      });

      realtime.broadcast("bincard_updated", { materialId });

      return NextResponse.json({
        success: true,
        message: `Bin Card berhasil di-${updated.isActive ? "aktifkan" : "nonaktifkan"}.`,
        binCard: updated,
      });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error) {
    console.error("Manage BinCard Error:", error);
    return NextResponse.json({ error: "Gagal memproses permintaan Bin Card" }, { status: 500 });
  }
}
