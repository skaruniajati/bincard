import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "50"));

    const movements = await db.stockMovement.findMany({
      where: { materialId: id },
      include: {
        transaction: {
          include: {
            user: { select: { id: true, name: true, username: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ movements });
  } catch (error) {
    console.error("GET Movements Error:", error);
    return NextResponse.json({ error: "Gagal memuat mutasi stok" }, { status: 500 });
  }
}
