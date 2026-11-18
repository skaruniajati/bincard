import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Digital Warehouse Inventory System | PT Muaratoyu Subur Lestari",
  description: "Sistem Digitalisasi Bin Card Berbasis QR Code & Real-Time Monitoring Dashboard Gudang Sawit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-warehouse-bg text-warehouse-text antialiased selection:bg-warehouse-accent selection:text-warehouse-dark">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
