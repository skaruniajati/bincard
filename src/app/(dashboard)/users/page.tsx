"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit,
  RefreshCw,
  Lock,
  X,
  Save,
  AlertTriangle,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "PETUGAS",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setIsAccessDenied(false);
    try {
      const res = await fetch("/api/users");
      if (res.status === 403) {
        setIsAccessDenied(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      toast.error("Gagal memuat daftar pengguna");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      username: "",
      password: "",
      role: "PETUGAS",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = "/api/users";
      const method = editingUser ? "PUT" : "POST";
      const payload = editingUser ? { id: editingUser.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan data pengguna");
      }

      toast.success(editingUser ? "Data pengguna berhasil diperbarui" : "Pengguna baru berhasil ditambahkan");
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan internal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
      });

      if (res.ok) {
        toast.success(`Status akun ${user.username} berhasil diubah.`);
        fetchUsers();
      } else {
        toast.error("Gagal mengubah status akun");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memproses status");
    }
  };

  if (isAccessDenied) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mx-auto mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-black text-slate-900">Akses Ditolak (403 Forbidden)</h3>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          Halaman Manajemen Pengguna hanya dapat diakses oleh akun dengan hak akses <strong>Admin Gudang</strong>. Akun Petugas Gudang tidak diizinkan mengubah konfigurasi akun.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Manajemen Pengguna Gudang
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Pengaturan akun staf gudang, administrator, dan hak otorisasi transaksi Bin Card
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-warehouse-dark px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-sky-700 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Tambah Pengguna Baru
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Nama Lengkap</th>
                <th className="px-5 py-3.5">Username</th>
                <th className="px-5 py-3.5">Hak Akses (Role)</th>
                <th className="px-5 py-3.5 text-center">Status Akun</th>
                <th className="px-5 py-3.5">Tanggal Dibuat</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-warehouse-primary" />
                    Memuat daftar pengguna...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada pengguna terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{u.username}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          u.role === "ADMIN"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        {u.role === "ADMIN" ? "Admin Gudang" : "Petugas Gudang"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                          u.isActive
                            ? "bg-sky-100 text-sky-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDateTime(u.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                          title="Edit Pengguna"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                            u.isActive
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-sky-50 text-sky-700 hover:bg-sky-100"
                          }`}
                        >
                          {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">
                {editingUser ? "Edit Profil Pengguna" : "Tambah Pengguna Baru"}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Rian Gunawan"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username Login</label>
                <input
                  type="text"
                  required
                  disabled={!!editingUser}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                  placeholder="Contoh: rian_gudang"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-900 focus:bg-white focus:outline-none disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Password {editingUser ? "(Kosongkan jika tidak diubah)" : "*"}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hak Akses (Role)</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-900 focus:bg-white focus:outline-none"
                >
                  <option value="PETUGAS">Petugas Gudang (Scan, Transaksi GR/GI)</option>
                  <option value="ADMIN">Admin Gudang (Full Kontrol, Master Material, User)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-warehouse-dark px-4 py-2 font-bold text-white shadow-sm hover:bg-sky-700"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Menyimpan..." : "Simpan Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
