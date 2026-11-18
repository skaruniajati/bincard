import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { UserSchema } from "@/lib/validations";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Akses ditolak. Fitur Manajemen Pengguna hanya dapat diakses oleh Admin Gudang." },
        { status: 403 }
      );
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET Users Error:", error);
    return NextResponse.json({ error: "Gagal memuat pengguna" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak. Khusus Admin Gudang." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = UserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi data gagal", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, username, password, role, isActive } = parsed.data;

    if (!password) {
      return NextResponse.json({ error: "Password wajib diisi untuk pengguna baru" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        name,
        username,
        passwordHash,
        role,
        isActive: isActive ?? true,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await db.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "CREATE_USER",
        entity: "User",
        entityId: newUser.id,
        newValue: `Admin membuat user baru: ${newUser.username} (${newUser.role})`,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error("POST User Error:", error);
    return NextResponse.json({ error: "Gagal membuat pengguna baru" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak. Khusus Admin Gudang." }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, username, password, role, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID wajib disertakan" }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (password && password.trim().length >= 6) {
      updateData.passwordHash = await hashPassword(password.trim());
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await db.auditLog.create({
      data: {
        userId: currentUser.id,
        action: "UPDATE_USER",
        entity: "User",
        entityId: id,
        newValue: `Admin mengupdate data user: ${updated.username}`,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("PUT User Error:", error);
    return NextResponse.json({ error: "Gagal memperbarui pengguna" }, { status: 500 });
  }
}
