import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const rawCode = decodeURIComponent(params.code || "").trim();
    // Normalisasi kode dengan menghapus prefix QR- jika ada
    const cleanCode = rawCode.replace(/^QR-/i, "").trim();

    if (!cleanCode) {
      return new NextResponse("Material code missing", { status: 400 });
    }

    const publicDir = path.join(process.cwd(), "public");

    // Urutan ekstensi gambar yang diperiksa
    const extensions = [".jpg", ".jpeg", ".png", ".webp"];

    for (const ext of extensions) {
      const filePath = path.join(publicDir, `${cleanCode}${ext}`);
      if (fs.existsSync(filePath)) {
        const mimeTypes: Record<string, string> = {
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".webp": "image/webp",
        };

        const fileBuffer = fs.readFileSync(filePath);
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": mimeTypes[ext] || "image/jpeg",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
      }
    }

    // Jika hanya ditemukan file .heic tapi belum ada .jpg, coba konversi dinamis jika modul tersedia
    const heicPath = path.join(publicDir, `${cleanCode}.heic`);
    if (fs.existsSync(heicPath)) {
      try {
        // @ts-ignore
        const convert = (await import("heic-convert")).default;
        const inputBuffer = fs.readFileSync(heicPath);
        const outputBuffer = await convert({
          buffer: inputBuffer,
          format: "JPEG",
          quality: 0.85,
        });

        // Simpan cache .jpg
        const jpgCachePath = path.join(publicDir, `${cleanCode}.jpg`);
        fs.writeFileSync(jpgCachePath, outputBuffer);

        return new NextResponse(outputBuffer, {
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });
      } catch (convertErr) {
        console.warn("Fallback HEIC conversion error:", convertErr);
      }
    }

    return new NextResponse("Image not found", { status: 404 });
  } catch (error) {
    console.error("GET material image error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST: Unggah foto material baru langsung ke sistem
export async function POST(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const rawCode = decodeURIComponent(params.code || "").trim();
    const cleanCode = rawCode.replace(/^QR-/i, "").trim();

    if (!cleanCode) {
      return NextResponse.json(
        { error: "Kode material tidak valid" },
        { status: 400 }
      );
    }

    let buffer: Buffer | null = null;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "File gambar tidak ditemukan dalam formulir" },
          { status: 400 }
        );
      }
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      const body = await request.json();
      if (!body.image) {
        return NextResponse.json(
          { error: "Data gambar tidak ditemukan" },
          { status: 400 }
        );
      }
      // Decode base64
      const base64Data = body.image.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64Data, "base64");
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json(
        { error: "Isi file gambar kosong" },
        { status: 400 }
      );
    }

    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Simpan file foto sebagai .jpg
    const targetFilePath = path.join(publicDir, `${cleanCode}.jpg`);
    fs.writeFileSync(targetFilePath, buffer);

    // Salin juga ke folder dist_netlify jika ada
    const distNetlifyDir = path.join(process.cwd(), "dist_netlify");
    if (fs.existsSync(distNetlifyDir)) {
      fs.writeFileSync(path.join(distNetlifyDir, `${cleanCode}.jpg`), buffer);
    }

    return NextResponse.json({
      success: true,
      message: `Foto fisik suku cadang ${cleanCode} berhasil diperbarui!`,
      materialCode: cleanCode,
      imageUrl: `/api/material-image/${encodeURIComponent(cleanCode)}?t=${Date.now()}`,
    });
  } catch (error: any) {
    console.error("POST upload material image error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengunggah foto material" },
      { status: 500 }
    );
  }
}
