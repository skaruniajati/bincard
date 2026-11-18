"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Printer, Download, Eye, X, Boxes, QrCode as QrIcon } from "lucide-react";

interface BinCardLabelPrintProps {
  material: {
    materialCode: string;
    description: string;
    category: string;
    uom: string;
    storageLocation: string;
  };
  qrToken: string;
}

export default function BinCardLabelPrint({ material, qrToken }: BinCardLabelPrintProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [labelSize, setLabelSize] = useState<"A6" | "STICKER">("A6");
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!qrToken) return;
    const scanUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/scan/${qrToken}`;
    QRCode.toDataURL(scanUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: "#0369A1",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Generate QR error:", err));
  }, [qrToken]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `QR-BINCARD-${material.materialCode}.png`;
    link.click();
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowPreviewModal(true)}
          className="flex items-center gap-1.5 rounded-xl border border-sky-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 shadow-sm transition-colors"
        >
          <Eye className="h-3.5 w-3.5 text-sky-600" />
          Preview Label
        </button>

        <button
          type="button"
          onClick={handleDownloadPNG}
          className="flex items-center gap-1.5 rounded-xl border border-sky-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 shadow-sm transition-colors"
        >
          <Download className="h-3.5 w-3.5 text-sky-600" />
          Unduh PNG
        </button>

        <button
          type="button"
          onClick={() => {
            setShowPreviewModal(true);
            setTimeout(() => window.print(), 400);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-sky-700 shadow-sm transition-colors"
        >
          <Printer className="h-3.5 w-3.5" />
          Cetak Label
        </button>
      </div>

      {/* Preview Modal & Print Document Container */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Preview Cetak Label Bin Card
                </h4>
                <p className="text-xs text-slate-400">
                  Siap dicetak pada kertas stiker rak atau karton A6
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Size toggle */}
                <div className="flex rounded-lg border border-slate-200 p-0.5 text-[11px] font-bold">
                  <button
                    onClick={() => setLabelSize("A6")}
                    className={`rounded-md px-2.5 py-1 ${
                      labelSize === "A6"
                        ? "bg-sky-700 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Format A6
                  </button>
                  <button
                    onClick={() => setLabelSize("STICKER")}
                    className={`rounded-md px-2.5 py-1 ${
                      labelSize === "STICKER"
                        ? "bg-sky-700 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Stiker Rak
                  </button>
                </div>

                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Bin Card Layout */}
            <div className="my-6 flex justify-center overflow-x-auto">
              <div
                ref={printAreaRef}
                className={`bin-card-print-container border-2 border-slate-900 bg-white p-5 text-slate-900 shadow-md ${
                  labelSize === "A6"
                    ? "w-[360px] min-h-[480px] rounded-2xl"
                    : "w-[320px] min-h-[220px] rounded-xl"
                }`}
              >
                {/* Company Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-800 text-white">
                      <Boxes className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-wider uppercase text-sky-800 leading-tight">
                        PT Muaratoyu Subur Lestari
                      </div>
                      <div className="text-xs font-black tracking-tight text-slate-900 uppercase">
                        CENTRAL WAREHOUSE SYSTEM
                      </div>
                    </div>
                  </div>
                  <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider">
                    BIN CARD
                  </span>
                </div>

                {/* Storage Location & Category */}
                <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-bold">
                  <div>
                    LOKASI:{" "}
                    <span className="text-sky-800 font-black">
                      {material.storageLocation}
                    </span>
                  </div>
                  <div className="text-slate-600 uppercase text-[10px]">
                    {material.category}
                  </div>
                </div>

                {/* Material Info */}
                <div className="mt-3 text-center">
                  <div className="text-lg font-black tracking-wide text-slate-900 uppercase">
                    {material.materialCode}
                  </div>
                  <div className="mt-1 text-xs font-bold text-slate-700 line-clamp-2 uppercase">
                    {material.description}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold text-slate-500">
                    Satuan: <strong className="text-slate-900">{material.uom}</strong>
                  </div>
                </div>

                {/* QR Code Graphic */}
                <div className="mt-3 flex flex-col items-center justify-center">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Bin Card ${material.materialCode}`}
                      className="h-44 w-44 rounded-xl border border-slate-200 p-1 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-44 w-44 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <QrIcon className="h-12 w-12" />
                    </div>
                  )}

                  <div className="mt-2 text-center">
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-[10px] font-black tracking-wider text-sky-900 uppercase">
                      SCAN TO UPDATE STOCK
                    </span>
                    <div className="mt-1 font-mono text-[9px] font-bold text-slate-400">
                      {qrToken}
                    </div>
                  </div>
                </div>

                {/* Footer instructions */}
                <div className="mt-4 border-t border-slate-300 pt-2 text-center text-[9px] text-slate-500">
                  Pindai QR ini melalui aplikasi Digital Warehouse untuk mencatat GR/GI secara real-time.
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3 no-print">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Cetak Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
