import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const MaterialSchema = z.object({
  materialCode: z
    .string()
    .min(3, "Kode material minimal 3 karakter")
    .max(50, "Kode material maksimal 50 karakter")
    .regex(/^[a-zA-Z0-9-_/]+$/, "Kode material hanya boleh huruf, angka, tanda minus, garis miring, dan underscore"),
  description: z.string().min(3, "Deskripsi material minimal 3 karakter"),
  category: z.string().min(2, "Kategori wajib dipilih atau diisi"),
  uom: z.string().min(1, "Satuan ukuran (UOM) wajib diisi"),
  initialStock: z.coerce.number().min(0, "Stok awal tidak boleh negatif").default(0),
  minimumStock: z.coerce.number().min(0, "Stok minimum tidak boleh negatif").default(0),
  maximumStock: z.coerce.number().min(0, "Stok maksimum tidak boleh negatif").optional(),
  storageLocation: z.string().min(2, "Lokasi penyimpanan rak/bin wajib diisi"),
  remarks: z.string().optional(),
});

export const TransactionSchema = z.object({
  materialId: z.string().min(1, "Material ID wajib ada"),
  transactionType: z.enum(["GR", "GI"], {
    errorMap: () => ({ message: "Tipe transaksi harus GR (Barang Masuk) atau GI (Barang Keluar)" }),
  }),
  quantity: z.coerce.number().positive("Jumlah kuantitas harus lebih besar dari 0"),
  transactionDate: z.string().optional(),
  referenceNumber: z.string().optional(),
  remarks: z.string().optional(),
});

export const UserSchema = z.object({
  name: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "PETUGAS"]),
  isActive: z.boolean().default(true),
});
