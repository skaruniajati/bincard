"use client";

import { useState, useEffect } from "react";
import { X, PackagePlus, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editItem?: any | null;
}

export default function MaterialModal({
  isOpen,
  onClose,
  onSuccess,
  editItem,
}: MaterialModalProps) {
  const [formData, setFormData] = useState({
    materialCode: "",
    description: "",
    category: "Sparepart Armada",
    uom: "PCS",
    initialStock: "0",
    minimumStock: "10",
    maximumStock: "",
    storageLocation: "",
    remarks: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editItem) {
      setFormData({
        materialCode: editItem.materialCode || "",
        description: editItem.description || "",
        category: editItem.category || "Sparepart Armada",
        uom: editItem.uom || "PCS",
        initialStock: String(editItem.currentStock || 0),
        minimumStock: String(editItem.minimumStock || 0),
        maximumStock: editItem.maximumStock ? String(editItem.maximumStock) : "",
        storageLocation: editItem.storageLocation || "",
        remarks: editItem.remarks || "",
      });
    } else {
      setFormData({
        materialCode: "",
        description: "",
        category: "Sparepart Armada",
        uom: "PCS",
        initialStock: "0",
        minimumStock: "10",
        maximumStock: "",
        storageLocation: "",
        remarks: "",
      });
    }
    setErrors({});
  }, [editItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const url = editItem ? `/api/materials/${editItem.id}` : "/api/materials";
      const method = editItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          const flatErr: Record<string, string> = {};
          Object.keys(data.details).forEach((k) => {
            flatErr[k] = data.details[k][0];
          });
          setErrors(flatErr);
        }
        throw new Error(data.error || "Gagal menyimpan material");
      }

      toast.success(
        editItem
          ? "Data material berhasil diperbarui!"
          : "Material baru & QR Code Bin Card berhasil dibuat!"
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan internal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "Sparepart Armada",
    "Sparepart Alat Berat",
    "Alat Panen Pergudangan",
    "Pelumas & Kimia",
    "Pupuk & Nutrisi",
    "Sparepart Pabrik (PKS)",
    "Alat Pelindung Diri (APD)",
    "Bahan Bangunan & Infrastruktur",
  ];

  const uomList = ["PCS", "SET", "LTR", "KG", "SAK", "DRUM", "JERIGEN", "PASANG", "ROLL", "METER"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-warehouse-dark">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {editItem ? "Edit Data Master Material" : "Tambah Material Baru"}
              </h4>
              <p className="text-xs text-slate-500">
                {editItem
                  ? "Perbarui informasi dan spesifikasi barang"
                  : "Sistem otomatis menghasilkan QR Code Bin Card unik"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kode Material <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                disabled={!!editItem}
                value={formData.materialCode}
                onChange={(e) =>
                  setFormData({ ...formData, materialCode: e.target.value.toUpperCase() })
                }
                placeholder="Contoh: T-04371-0K120"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-warehouse-primary focus:bg-white focus:outline-none disabled:bg-slate-100"
              />
              {errors.materialCode && (
                <p className="mt-1 text-[11px] text-red-600">{errors.materialCode}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Material <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-900 focus:border-warehouse-primary focus:bg-white focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Deskripsi / Nama Lengkap Barang <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value.toUpperCase() })
              }
              placeholder="Contoh: SPIDER KIT REAR (UNIVERSAL JOINT DUMP TRUCK)"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-warehouse-primary focus:bg-white focus:outline-none"
            />
            {errors.description && (
              <p className="mt-1 text-[11px] text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Satuan (UOM) <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.uom}
                onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-warehouse-primary focus:bg-white focus:outline-none"
              >
                {uomList.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {!editItem && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Stok Awal Fisik
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={formData.initialStock}
                  onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-warehouse-primary focus:bg-white focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Stok Minimum (Alert) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.minimumStock}
                onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-warehouse-primary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lokasi Rak / Bin Gudang <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.storageLocation}
                onChange={(e) =>
                  setFormData({ ...formData, storageLocation: e.target.value.toUpperCase() })
                }
                placeholder="Contoh: RAK A-01 / BIN 04"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-warehouse-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Stok Maksimum Kapasitas (Opsional)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.maximumStock}
                onChange={(e) => setFormData({ ...formData, maximumStock: e.target.value })}
                placeholder="Contoh: 100"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-900 focus:border-warehouse-primary focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan / Spesifikasi Tambahan
            </label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Contoh: Digunakan untuk armada angkut TBS afdeling I - IV"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-warehouse-primary focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-xl bg-warehouse-dark px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Menyimpan..." : editItem ? "Simpan Perubahan" : "Daftarkan Material"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
