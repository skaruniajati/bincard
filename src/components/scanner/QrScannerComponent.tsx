"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  CameraOff,
  UploadCloud,
  FileImage,
  Keyboard,
  AlertCircle,
  CheckCircle2,
  QrCode,
  ArrowRight,
  HelpCircle,
  Loader2,
  RefreshCw,
  X,
  Smartphone,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

export default function QrScannerComponent() {
  const router = useRouter();

  // Mode: "camera" | "upload" | "material-photo"
  const [activeTab, setActiveTab] = useState<"camera" | "upload" | "material-photo">("camera");

  // Camera states
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerInstanceRef = useRef<any>(null);

  // File upload states (QR decoding)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [detectedToken, setDetectedToken] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Material photo direct upload states (Perbarui Foto Suku Cadang)
  const [matUploadCode, setMatUploadCode] = useState("");
  const [matPhotoFile, setMatPhotoFile] = useState<File | null>(null);
  const [matPhotoPreviewUrl, setMatPhotoPreviewUrl] = useState<string | null>(null);
  const [isUploadingMatPhoto, setIsUploadingMatPhoto] = useState(false);
  const [matUploadDone, setMatUploadDone] = useState(false);
  const matPhotoInputRef = useRef<HTMLInputElement>(null);

  // Manual fallback states
  const [manualCode, setManualCode] = useState("");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const qrCameraRegionId = "html5qr-code-camera-region";
  const qrFileRegionId = "html5qr-code-file-region";

  // Cleanup camera scanner saat unmount
  useEffect(() => {
    return () => {
      if (scannerInstanceRef.current) {
        try {
          scannerInstanceRef.current.stop().catch(() => {});
        } catch {}
      }
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Handler sukses scan (baik dari kamera maupun upload foto)
  const handleScanSuccess = (decodedText: string) => {
    let token = decodedText.trim();

    // Jika hasil scan berupa URL (misal: http://.../scan/QR-202040992), ambil token ujungnya
    if (token.includes("/scan/")) {
      const parts = token.split("/scan/");
      token = parts[parts.length - 1];
    }

    setDetectedToken(token);
    toast.success(`QR Code Bin Card terdeteksi: ${token}`);

    // Hentikan kamera jika sedang aktif
    if (isScanning) {
      stopScanning();
    }

    // Arahkan ke halaman khusus detail material & transaksi
    setTimeout(() => {
      router.push(`/scan/${encodeURIComponent(token)}`);
    }, 600);
  };

  // Mulai scanner kamera
  const startScanning = async () => {
    setCameraError(null);
    setIsScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (scannerInstanceRef.current) {
        try {
          await scannerInstanceRef.current.stop();
        } catch {}
      }

      const html5QrCode = new Html5Qrcode(qrCameraRegionId);
      scannerInstanceRef.current = html5QrCode;

      const config = {
        fps: 12,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: "environment" }, // Kamera belakang jika pada smartphone
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // Frame scanner error diabaikan
        }
      );
    } catch (err: any) {
      console.error("Camera scanner error:", err);
      setIsScanning(false);
      if (err?.name === "NotAllowedError" || err?.message?.includes("Permission")) {
        setCameraError(
          "Izin akses kamera ditolak oleh browser. Mohon izinkan akses kamera di pengaturan peramban Anda atau gunakan fitur Unggah Foto QR."
        );
      } else if (err?.name === "NotFoundError" || err?.message?.includes("not found")) {
        setCameraError(
          "Perangkat kamera tidak terdeteksi pada perangkat ini. Gunakan fitur Unggah Foto QR atau Input Manual di bawah."
        );
      } else {
        setCameraError(
          "Gagal membuka kamera scanner. Silakan beralih ke tab 'Unggah Foto QR' atau gunakan input manual kode material."
        );
      }
    }
  };

  // Hentikan scanner kamera
  const stopScanning = async () => {
    if (scannerInstanceRef.current) {
      try {
        await scannerInstanceRef.current.stop();
        scannerInstanceRef.current = null;
      } catch (err) {
        console.warn("Stop scanner error:", err);
      }
    }
    setIsScanning(false);
  };

  // Proses file gambar yang dipilih untuk decode QR
  const processImageFile = async (file: File) => {
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      toast.error("File yang dipilih harus berupa file gambar (JPG, PNG, WEBP, dll.)");
      return;
    }

    // Buat URL preview
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    setUploadedFile(file);
    setUploadError(null);
    setDetectedToken(null);
    setIsAnalyzingFile(true);

    // Hentikan scanner kamera jika sedang jalan agar tidak bentrok
    if (isScanning) {
      await stopScanning();
    }

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5QrCode = new Html5Qrcode(qrFileRegionId);

      try {
        // scanFile akan mem-parsing QR code langsung dari blob gambar
        const decodedText = await html5QrCode.scanFile(file, false);
        handleScanSuccess(decodedText);
      } catch (scanErr: any) {
        console.warn("QR Scan File error:", scanErr);
        setUploadError(
          "Kode QR tidak terdeteksi pada gambar ini. Pastikan foto memiliki pencahayaan cukup, tidak buram, dan barcode QR tampak jelas di dalam frame."
        );
      } finally {
        try {
          await html5QrCode.clear();
        } catch {}
      }
    } catch (err: any) {
      console.error("Html5Qrcode file init error:", err);
      setUploadError("Gagal menginisialisasi modul pembaca QR dari gambar. Silakan coba kembali.");
    } finally {
      setIsAnalyzingFile(false);
    }
  };

  // Handler input file via onChange
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Handler Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Handler submit manual
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.error("Silakan masukkan kode material atau token Bin Card");
      return;
    }
    setIsSubmittingManual(true);
    router.push(`/scan/${encodeURIComponent(manualCode.trim())}`);
  };

  // Reset upload
  const handleResetUpload = () => {
    setUploadedFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    setUploadError(null);
    setDetectedToken(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handler material photo direct upload
  const handleMatPhotoSelected = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa file gambar (JPG, PNG, WEBP)!");
      return;
    }
    setMatPhotoFile(file);
    if (matPhotoPreviewUrl) URL.revokeObjectURL(matPhotoPreviewUrl);
    setMatPhotoPreviewUrl(URL.createObjectURL(file));
    setMatUploadDone(false);
  };

  const handleUploadMatPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = matUploadCode.replace(/^QR-/i, "").trim();
    if (!cleanCode) {
      toast.error("Silakan masukkan atau pilih kode material!");
      return;
    }
    if (!matPhotoFile) {
      toast.error("Silakan pilih file foto atau jepret foto material terlebih dahulu!");
      return;
    }

    setIsUploadingMatPhoto(true);
    const toastId = toast.loading(`Mengunggah foto material ${cleanCode}...`);
    try {
      const formData = new FormData();
      formData.append("file", matPhotoFile);

      const res = await fetch(`/api/material-image/${encodeURIComponent(cleanCode)}`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengunggah foto");

      setMatUploadDone(true);
      toast.success(json.message || `Foto untuk material ${cleanCode} berhasil diperbarui!`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Gagal mengunggah foto material", { id: toastId });
    } finally {
      setIsUploadingMatPhoto(false);
    }
  };

  const handleResetMatPhoto = () => {
    setMatPhotoFile(null);
    if (matPhotoPreviewUrl) {
      URL.revokeObjectURL(matPhotoPreviewUrl);
      setMatPhotoPreviewUrl(null);
    }
    setMatUploadDone(false);
    if (matPhotoInputRef.current) {
      matPhotoInputRef.current.value = "";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Hidden container for file scanning to avoid DOM collision */}
      <div id={qrFileRegionId} className="hidden" aria-hidden="true" />

      {/* Main Scanner Section (Camera or Upload) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Tab Selector Header */}
        <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setActiveTab("camera");
              setUploadError(null);
            }}
            className={`flex flex-1 w-full sm:w-auto items-center justify-center gap-2 rounded-xl py-2 sm:py-2.5 px-3 text-xs font-bold transition-all ${
              activeTab === "camera"
                ? "bg-warehouse-dark text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Camera className="h-4 w-4" />
            Pindai Kamera
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("upload");
              if (isScanning) {
                stopScanning();
              }
            }}
            className={`flex flex-1 w-full sm:w-auto items-center justify-center gap-2 rounded-xl py-2 sm:py-2.5 px-3 text-xs font-bold transition-all ${
              activeTab === "upload"
                ? "bg-warehouse-dark text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            Unggah Foto QR
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("material-photo");
              if (isScanning) {
                stopScanning();
              }
            }}
            className={`flex flex-1 w-full sm:w-auto items-center justify-center gap-2 rounded-xl py-2 sm:py-2.5 px-3 text-xs font-bold transition-all ${
              activeTab === "material-photo"
                ? "bg-sky-700 text-white shadow-sm"
                : "text-sky-800 bg-sky-50/70 hover:bg-sky-100 border border-sky-200"
            }`}
          >
            <FileImage className="h-4 w-4" />
            Unggah Foto Material Baru
          </button>
        </div>

        {/* TAB 1: Pemindai Kamera */}
        {activeTab === "camera" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-warehouse-dark">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pemindai Kamera QR Code Bin Card
                  </h3>
                  <p className="text-xs text-slate-500">
                    Arahkan kamera ke label barcode Bin Card pada rak gudang
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isScanning ? (
                  <button
                    type="button"
                    onClick={startScanning}
                    className="flex items-center gap-1.5 rounded-xl bg-warehouse-dark px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                    Buka Kamera
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopScanning}
                    className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
                  >
                    <CameraOff className="h-4 w-4" />
                    Tutup Kamera
                  </button>
                )}
              </div>
            </div>

            {/* Camera Viewfinder Box */}
            <div className="mt-6 flex flex-col items-center justify-center">
              <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-2xl border-2 border-dashed border-sky-500/40 bg-slate-950 flex items-center justify-center">
                {/* HTML5 QR Camera Container */}
                <div
                  id={qrCameraRegionId}
                  className={`w-full h-full ${!isScanning ? "hidden" : ""}`}
                />

                {!isScanning && (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-sky-400 mb-3 border border-slate-800">
                      <Camera className="h-8 w-8 stroke-[1.8]" />
                    </div>
                    <span className="text-sm font-bold text-slate-200">
                      Kamera Sedang Nonaktif
                    </span>
                    <p className="mt-1 text-xs text-slate-400 max-w-xs leading-relaxed">
                      Klik tombol &ldquo;Buka Kamera&rdquo; untuk memindai otomatis via webcam laptop atau kamera smartphone.
                    </p>
                    <button
                      type="button"
                      onClick={startScanning}
                      className="mt-4 flex items-center gap-1.5 rounded-xl bg-warehouse-primary px-4 py-2 text-xs font-bold text-white hover:bg-sky-700 shadow-sm transition-colors"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      Aktifkan Kamera Sekarang
                    </button>
                  </div>
                )}

                {/* Animated viewfinder line when active */}
                {isScanning && (
                  <div className="pointer-events-none absolute inset-8 border-2 border-sky-400/80 rounded-xl">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-sky-400 shadow-[0_0_8px_#38bdf8] animate-pulse" />
                  </div>
                )}
              </div>

              {/* Error Message if camera failed with quick switch */}
              {cameraError && (
                <div className="mt-4 flex w-full max-w-sm flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Kendala Perangkat Kamera</p>
                      <p className="mt-0.5 text-red-600 leading-relaxed">{cameraError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("upload");
                      setCameraError(null);
                    }}
                    className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    Gunakan Fitur Unggah Foto QR
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Unggah / Perbarui Foto Fisik Material Langsung */}
        {activeTab === "material-photo" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
                  <FileImage className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Unggah & Perbarui Foto Material Langsung
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perbarui foto fisik jika suku cadang berubah, ganti kemasan, atau melengkapi foto yang belum ada
                  </p>
                </div>
              </div>

              {matPhotoFile && (
                <button
                  type="button"
                  onClick={handleResetMatPhoto}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Reset
                </button>
              )}
            </div>

            <form onSubmit={handleUploadMatPhoto} className="space-y-4">
              {/* Input Kode Material */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Masukkan Kode Material yang Ingin Diperbarui Fotonya:
                </label>
                <input
                  type="text"
                  value={matUploadCode}
                  onChange={(e) => {
                    setMatUploadCode(e.target.value);
                    setMatUploadDone(false);
                  }}
                  placeholder="Contoh: 202040992 atau 212043604"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3.5 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 uppercase"
                />
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Pilih Cepat:</span>
                  {[
                    { code: "212043604", label: "212043604 (Spider Kit)" },
                    { code: "202041211", label: "202041211 (Pipe Lub)" },
                    { code: "202040992", label: "202040992 (Pump Oil)" },
                    { code: "212043651", label: "212043651 (Belt Fan)" },
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        setMatUploadCode(item.code);
                        setMatUploadDone(false);
                      }}
                      className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-900 hover:bg-sky-100 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input & Preview Foto Baru */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Pilih File Foto atau Jepret Kamera HP:
                </label>

                <input
                  type="file"
                  ref={matPhotoInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleMatPhotoSelected(f);
                  }}
                  className="hidden"
                />

                {!matPhotoPreviewUrl ? (
                  <div
                    onClick={() => matPhotoInputRef.current?.click()}
                    className="relative cursor-pointer rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/40 p-6 text-center hover:bg-sky-50 transition-colors flex flex-col items-center justify-center"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 mb-2">
                      <Camera className="h-7 w-7" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Klik untuk Jepret Kamera HP atau Pilih File Gambar
                    </span>
                    <p className="mt-1 text-[11px] text-slate-500 max-w-sm">
                      Mendukung format JPG, PNG, WEBP dari smartphone maupun file komputer
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative aspect-video max-h-56 w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-200 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={matPhotoPreviewUrl}
                        alt="Preview Foto Baru"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => matPhotoInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Ganti Foto
                      </button>
                      <button
                        type="button"
                        onClick={handleResetMatPhoto}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Submit */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  disabled={isUploadingMatPhoto || !matPhotoFile || !matUploadCode.trim()}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-sky-700 py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-sky-800 disabled:opacity-50 disabled:pointer-events-none transition-all active:scale-98"
                >
                  {isUploadingMatPhoto ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan Foto ke Server...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      <span>Simpan & Terapkan Foto Material Baru</span>
                    </>
                  )}
                </button>

                {matUploadDone && (
                  <button
                    type="button"
                    onClick={() => {
                      router.push(`/scan/${encodeURIComponent(matUploadCode.trim())}`);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
                  >
                    <span>Buka Detail Scan Material</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
        {activeTab === "upload" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-900">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Unggah Foto QR Code (Mitigasi Tanpa Kamera)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih file gambar atau jepret foto QR Code dari galeri ponsel / komputer
                  </p>
                </div>
              </div>

              {uploadedFile && (
                <button
                  type="button"
                  onClick={handleResetUpload}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Ganti Foto
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Dropzone Area */}
            <div className="mt-6 flex flex-col items-center justify-center">
              {!imagePreviewUrl ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex aspect-[4/3] w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                    isDragging
                      ? "border-warehouse-primary bg-sky-50/50 scale-[0.99]"
                      : "border-slate-300 bg-slate-50/70 hover:border-sky-500 hover:bg-sky-50/30"
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-warehouse-dark shadow-sm border border-slate-200 mb-3">
                    <FileImage className="h-8 w-8 stroke-[1.8]" />
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    Tarik & Lepas Foto QR ke Sini
                  </span>
                  <p className="mt-1 text-xs text-slate-500 max-w-xs leading-relaxed">
                    atau klik untuk memilih file foto dari perangkat Anda. Mendukung JPG, PNG, WEBP, dan foto smartphone.
                  </p>
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-warehouse-dark px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700 transition-colors">
                    <UploadCloud className="h-4 w-4" />
                    Pilih File Foto QR
                  </div>
                </div>
              ) : (
                /* Preview Image & Status Box */
                <div className="flex w-full max-w-md flex-col items-center">
                  <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreviewUrl}
                      alt="Preview Foto QR"
                      className="h-full w-full object-contain"
                    />

                    {/* Scanning overlay spinner */}
                    {isAnalyzingFile && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white">
                        <Loader2 className="h-8 w-8 animate-spin text-sky-400 mb-2" />
                        <span className="text-xs font-bold">Menganalisis QR Code...</span>
                        <span className="text-[10px] text-slate-300">Memproses citra digital barcode</span>
                      </div>
                    )}

                    {/* Detected token overlay */}
                    {detectedToken && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-sky-900/85 backdrop-blur-sm text-white p-4 text-center">
                        <CheckCircle2 className="h-10 w-10 text-sky-300 mb-2 animate-bounce" />
                        <span className="text-xs font-semibold text-sky-200">
                          QR Berhasil Ditemukan!
                        </span>
                        <span className="mt-1 font-mono text-sm font-black text-white bg-sky-800/80 px-2 py-1 rounded-md">
                          {detectedToken}
                        </span>
                        <span className="mt-2 text-[11px] text-sky-200">
                          Mengarahkan ke halaman material...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Upload Error Banner */}
                  {uploadError && (
                    <div className="mt-4 flex w-full flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-bold">QR Code Tidak Terbaca</p>
                          <p className="mt-0.5 text-slate-700 leading-relaxed">{uploadError}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 rounded-lg bg-amber-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-900 transition-colors"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Coba Foto Lain
                        </button>
                        <button
                          type="button"
                          onClick={handleResetUpload}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Side Column: Manual Input Fallback & SOP Guidance */}
      <div className="space-y-6 lg:col-span-5">
        {/* Manual Input Fallback */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Fallback Input Manual
              </h3>
              <p className="text-xs text-slate-500">
                Gunakan jika kamera/foto tidak tersedia atau barcode rusak
              </p>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Material atau Token Bin Card
              </label>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Contoh: 202040992 atau QR-202040992"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-warehouse-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingManual}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-warehouse-primary py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-700 transition-colors"
            >
              {isSubmittingManual ? "Membuka Halaman..." : "Cari & Buka Form Material"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Shortcuts */}
          <div className="mt-4 border-t border-slate-100 pt-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Contoh Material Siap Pakai:
            </span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                "202040992",
                "202041139",
                "212043651",
                "2120417084",
                "212043604",
              ].map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setManualCode(code);
                    router.push(`/scan/${encodeURIComponent(code)}`);
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-950 transition-colors"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SOP Instructions Card */}
        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5 text-xs text-slate-700">
          <div className="flex items-center gap-2 font-bold text-sky-950">
            <HelpCircle className="h-4 w-4 text-sky-700" />
            SOP Pemindaian Bin Card di Lapangan
          </div>
          <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-slate-600 leading-relaxed">
            <li>
              <strong>Pilih Metode:</strong> Gunakan <em>Pemindai Kamera</em> untuk scan langsung di rak, atau <em>Unggah Foto QR</em> jika menggunakan foto galeri ponsel/tanpa kamera.
            </li>
            <li>
              <strong>Verifikasi Identitas:</strong> Setelah terscan, sistem akan membuka halaman khusus material yang memuat foto fisik suku cadang & saldo stok terkini.
            </li>
            <li>
              <strong>Pencatatan Mutasi:</strong> Tentukan transaksi <strong>Barang Masuk (GR)</strong> atau <strong>Barang Keluar (GI)</strong> secara akurat.
            </li>
            <li>
              <strong>Sinkronisasi Otomatis:</strong> Saldo kartu bin card diperbarui secara atomic dan tercatat di kartu stok digital.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
