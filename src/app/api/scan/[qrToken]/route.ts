import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { qrToken: string } }
) {
  try {
    const rawParam = decodeURIComponent(params.qrToken).trim();
    // Bersihkan prefix QR- jika ada untuk mendapatkan kode material murni
    const cleanCode = rawParam.replace(/^QR-/i, "").trim().toUpperCase();

    // 1. Coba cari berdasarkan qrToken persis atau dengan prefix QR-
    let binCard = await db.binCard.findFirst({
      where: {
        OR: [
          { qrToken: rawParam },
          { qrToken: `QR-${cleanCode}` },
          { qrToken: cleanCode },
        ],
      },
      include: {
        material: {
          include: {
            transactions: {
              take: 10,
              orderBy: { transactionDate: "desc" },
              include: {
                user: { select: { name: true, username: true } },
              },
            },
          },
        },
      },
    });

    // 2. Jika belum ketemu, coba cari berdasarkan materialCode
    if (!binCard) {
      const material = await db.material.findFirst({
        where: {
          OR: [
            { materialCode: cleanCode },
            { materialCode: rawParam.toUpperCase() },
          ],
        },
        include: {
          binCard: true,
          transactions: {
            take: 10,
            orderBy: { transactionDate: "desc" },
            include: {
              user: { select: { name: true, username: true } },
            },
          },
        },
      });

      if (material && material.binCard) {
        binCard = {
          ...material.binCard,
          material,
        };
      }
    }

    if (!binCard || !binCard.isActive) {
      return NextResponse.json(
        { error: "QR Code Bin Card tidak valid atau telah dinonaktifkan." },
        { status: 404 }
      );
    }

    if (!binCard.material || !binCard.material.isActive) {
      return NextResponse.json(
        { error: "Material yang terhubung dengan QR Code ini tidak aktif atau tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      binCardId: binCard.id,
      qrToken: binCard.qrToken,
      material: binCard.material,
    });
  } catch (error) {
    console.error("Scan API Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat memproses QR Code." },
      { status: 500 }
    );
  }
}
