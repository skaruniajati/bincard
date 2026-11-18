import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { MaterialSchema } from "@/lib/validations";
import realtime from "@/lib/events";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const material = await db.material.findUnique({
      where: { id },
      include: {
        binCard: true,
        transactions: {
          take: 10,
          orderBy: { transactionDate: "desc" },
          include: {
            user: { select: { id: true, name: true, username: true } },
          },
        },
      },
    });

    if (!material) {
      return NextResponse.json({ error: "Material tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ material });
  } catch (error) {
    console.error("GET Material Detail Error:", error);
    return NextResponse.json({ error: "Gagal memuat detail material" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Hanya Admin yang dapat mengedit material" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const parsed = MaterialSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi data gagal", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const current = await db.material.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Material tidak ditemukan" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.description) updateData.description = body.description.toUpperCase();
    if (body.category) updateData.category = body.category;
    if (body.uom) updateData.uom = body.uom.toUpperCase();
    if (body.minimumStock !== undefined) updateData.minimumStock = Number(body.minimumStock);
    if (body.maximumStock !== undefined) updateData.maximumStock = Number(body.maximumStock);
    if (body.storageLocation) updateData.storageLocation = body.storageLocation.toUpperCase();
    if (body.remarks !== undefined) updateData.remarks = body.remarks;

    const updated = await db.material.update({
      where: { id },
      data: updateData,
      include: { binCard: true },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE",
        entity: "Material",
        entityId: id,
        oldValue: JSON.stringify(current),
        newValue: JSON.stringify(updated),
      },
    });

    realtime.broadcast("material_updated", { materialId: id });

    return NextResponse.json({ success: true, material: updated });
  } catch (error) {
    console.error("PUT Material Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui material" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Hanya Admin yang dapat menonaktifkan material" }, { status: 403 });
    }

    const { id } = params;
    const deactivated = await db.material.update({
      where: { id },
      data: { isActive: false },
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "DEACTIVATE",
        entity: "Material",
        entityId: id,
        newValue: `Material dinonaktifkan: ${deactivated.materialCode}`,
      },
    });

    realtime.broadcast("material_deactivated", { materialId: id });

    return NextResponse.json({ success: true, message: "Material berhasil dinonaktifkan" });
  } catch (error) {
    console.error("DELETE Material Error:", error);
    return NextResponse.json({ error: "Gagal menonaktifkan material" }, { status: 500 });
  }
}
