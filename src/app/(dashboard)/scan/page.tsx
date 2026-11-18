import QrScannerComponent from "@/components/scanner/QrScannerComponent";

export default function ScanPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          Scan QR Code Bin Card
        </h2>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          Pindai barcode QR yang terpasang pada rak gudang atau gunakan input manual kode material
        </p>
      </div>

      <QrScannerComponent />
    </div>
  );
}
