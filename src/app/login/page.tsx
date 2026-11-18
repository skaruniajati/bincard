"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Warehouse,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  RefreshCw,
  QrCode,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk sistem");
      }

      toast.success(`Selamat datang, ${data.user.name}!`);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat otentikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Left Hero Graphic Section */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0B2545] via-[#103158] to-[#0A1F36] p-12 text-white lg:flex">
        {/* Subtle Geometric Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:28px_28px] opacity-15" />

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sky-300 backdrop-blur-md border border-white/20 shadow-xl">
            <Warehouse className="h-7 w-7 stroke-[2.2] animate-float-slow" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-sky-400">
              PT Muaratoyu Subur Lestari
            </div>
            <div className="text-lg font-black tracking-tight text-white">
              Sistem Logistik & Pergudangan Digital
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-lg space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-200 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            Digitalisasi Bin Card Berbasis QR Code 2.0
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white xl:text-4xl leading-tight">
            Akurasi Persediaan & Transaksi Gudang Digital Real-Time
          </h2>
          <p className="text-sm text-sky-100/80 leading-relaxed">
            Tingkatkan efisiensi penerimaan barang (GR) dan pengeluaran barang (GI) dengan pemindaian barcode QR langsung di rak gudang modern serta monitoring mutasi stok fisik secara real-time.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
              <div className="text-xl font-black text-white">0% Selisih</div>
              <div className="text-xs text-sky-200/80 mt-0.5">Validasi server atomik mutasi stok</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
              <div className="text-xl font-black text-white">100% Real-Time</div>
              <div className="text-xs text-sky-200/80 mt-0.5">Integrasi SSE live dashboard monitoring</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-sky-300/60 flex items-center justify-between border-t border-sky-900/60 pt-4">
          <span>&copy; 2026 PT Muaratoyu Subur Lestari &bull; Central Warehouse</span>
          <span>Versi Sistem 2.4.0</span>
        </div>
      </div>

      {/* Right Login Form Section */}
      <div className="flex w-full flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Header Logo */}
          <div className="flex items-center gap-2.5 lg:hidden mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-700 text-white shadow-sm">
              <Warehouse className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                PT Muaratoyu Subur Lestari
              </div>
              <div className="text-sm font-black text-slate-900">
                Digital Warehouse System
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Masuk ke Sistem Gudang
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Gunakan akun terdaftar untuk mengakses monitoring dan pencatatan Bin Card
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <span className="font-bold">Gagal Masuk:</span> {errorMessage}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username Akun
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username Anda"
                  className="w-full rounded-xl border border-sky-100 bg-sky-50/40 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-sky-100 bg-sky-50/40 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 text-xs font-bold text-white shadow-md hover:bg-sky-700 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Memverifikasi Akun...
                </>
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Credentials Card */}
          <div className="mt-8 rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
              <ShieldCheck className="h-4 w-4 text-sky-600" />
              Akun Demo Siap Pakai (Development Mode):
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Klik salah satu tombol di bawah untuk mengisi form login secara instan:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin", "admin123")}
                className="flex flex-col rounded-xl border border-sky-100 bg-white p-2.5 text-left hover:border-sky-400 hover:bg-sky-50/50 transition-all shadow-sm"
              >
                <span className="text-[10px] font-black uppercase text-sky-800">
                  Role: Admin Gudang
                </span>
                <span className="text-xs font-bold text-slate-900 mt-0.5">admin</span>
                <span className="text-[10px] text-slate-400">Pass: admin123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("petugas", "petugas123")}
                className="flex flex-col rounded-xl border border-sky-100 bg-white p-2.5 text-left hover:border-sky-400 hover:bg-sky-50/50 transition-all shadow-sm"
              >
                <span className="text-[10px] font-black uppercase text-slate-700">
                  Role: Petugas Gudang
                </span>
                <span className="text-xs font-bold text-slate-900 mt-0.5">petugas</span>
                <span className="text-[10px] text-slate-400">Pass: petugas123</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
