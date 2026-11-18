const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function generate() {
  console.log("Fetching materials and transactions from database...");
  const materials = await prisma.material.findMany({
    orderBy: { materialCode: "asc" }
  });

  const transactions = await prisma.transaction.findMany({
    include: {
      material: {
        select: {
          materialCode: true,
          description: true,
          uom: true,
          storageLocation: true,
          category: true
        }
      }
    },
    orderBy: { transactionDate: "desc" }
  });

  console.log(`Loaded ${materials.length} materials and ${transactions.length} transactions.`);
  const grCount = transactions.filter(t => t.transactionType === "GR").length;
  const giCount = transactions.filter(t => t.transactionType === "GI").length;
  console.log(`GR count: ${grCount}, GI count: ${giCount}`);

  const materialsJson = JSON.stringify(materials);
  const transactionsJson = JSON.stringify(transactions);

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Digital Warehouse Inventory System | Netlify & Standalone</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- QRCode.js CDN for live label printing -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <!-- HTML5-QRCode CDN for camera & file scanning -->
  <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>

  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            warehouse: {
              dark: '#0369A1',       // Soft Deep Sky Blue
              primary: '#0284C7',    // Soft Light Blue (Sky 600)
              secondary: '#38BDF8',  // Soft Vibrant Sky Blue (Sky 400)
              accent: '#E0F2FE',     // Soft Pastel Light Blue (Sky 100)
              bg: '#F0F7FF',         // Soothing Soft Sky Background
              surface: '#FFFFFF',    // Surface Card
              border: '#E0F2FE',     // Soft Border Light Blue
              text: '#0F172A',       // Slate 900
              muted: '#64748B',      // Slate 500
            }
          },
          keyframes: {
            marquee: {
              '0%': { transform: 'translateX(0%)' },
              '100%': { transform: 'translateX(-50%)' }
            },
            floatSlow: {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-3px)' }
            },
            pulseSoft: {
              '0%, 100%': { opacity: '1', transform: 'scale(1)' },
              '50%': { opacity: '0.6', transform: 'scale(1.05)' }
            }
          },
          animation: {
            marquee: 'marquee 35s linear infinite',
            'float-slow': 'floatSlow 3s ease-in-out infinite',
            'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
          }
        }
      }
    }
  </script>

  <style>
    /* Custom scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #f0f7ff; }
    ::-webkit-scrollbar-thumb { background: #bae6fd; border-radius: 9999px; }
    ::-webkit-scrollbar-thumb:hover { background: #7dd3fc; }

    .card-hover-fx {
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .card-hover-fx:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -5px rgba(2, 132, 199, 0.08), 0 4px 6px -2px rgba(2, 132, 199, 0.04);
    }

    .animate-marquee:hover {
      animation-play-state: paused;
    }

    @media print {
      body { background: transparent !important; color: #000 !important; }
      .no-print { display: none !important; }
      .print-only { display: block !important; }
      .bin-card-print-container {
        page-break-inside: avoid;
        box-shadow: none !important;
        border: 2px solid #000 !important;
        margin: 0 !important;
        padding: 12px !important;
      }
    }
  </style>
</head>
<body class="min-h-screen bg-warehouse-bg text-warehouse-text font-sans antialiased flex flex-col">

  <!-- TOP RUNNING TEXT TICKER (Responsive) -->
  <div class="relative flex items-center border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50/80 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs shadow-xs overflow-hidden select-none">
    <div class="relative z-10 flex shrink-0 items-center gap-1.5 rounded-xl bg-sky-600 px-2.5 py-0.5 sm:py-1 font-extrabold text-white shadow-sm ring-1 sm:ring-2 ring-sky-200">
      <div class="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-lg bg-sky-700 text-white">
        <!-- Warehouse Icon Animated -->
        <svg class="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 7v14M21 7v14M6 21V11M18 21V11M6 11l6-4 6 4M6 11h12M10 21v-5h4v5" />
        </svg>
      </div>
      <span class="text-[9px] sm:text-[10px] tracking-wider uppercase">INFO GUDANG</span>
    </div>

    <div class="relative ml-2 sm:ml-3 flex flex-1 overflow-hidden">
      <div class="animate-marquee flex items-center gap-6 sm:gap-8 text-slate-700 font-medium whitespace-nowrap">
        <span class="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          <span class="rounded bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 text-[9px]">NETLIFY READY</span>
          Digital Warehouse Bin Card System: 52 Master Material & 252 Transaksi Q2 Terintegrasi Penuh
        </span>
        <span class="text-slate-300 font-bold">&bull;</span>
        <span class="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          <span class="rounded bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 text-[9px]">SOP SCAN</span>
          Seluruh mutasi Barang Masuk (GR) dan Barang Keluar (GI) wajib tercatat dengan scan QR Code Bin Card
        </span>
        <span class="text-slate-300 font-bold">&bull;</span>
        <span class="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          <span class="rounded bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 text-[9px]">STOK MINIMUM</span>
          Pantau indikator stok secara berkala untuk menghindari kekosongan suku cadang unit alat berat
        </span>
        <span class="text-slate-300 font-bold">&bull;</span>
        <span class="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          <span class="rounded bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 text-[9px]">UNGGAH FOTO</span>
          Fitur ambil/unggah foto fisik langsung dari kamera HP atau galeri file
        </span>
      </div>
    </div>

    <div class="relative z-10 hidden md:flex shrink-0 items-center gap-2 border-l border-sky-100 pl-3 text-slate-500 font-semibold text-[11px]">
      <span class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span>Sistem Online</span>
    </div>
  </div>

  <!-- TOP MOBILE APP BAR (Visible on Mobile & Tablet: md:hidden) -->
  <header class="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-sky-100 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2.5 shadow-xs select-none">
    <div class="flex items-center gap-2">
      <button onclick="toggleMobileDrawer(true)" class="p-2 -ml-1 text-slate-700 hover:text-sky-600 rounded-xl hover:bg-sky-50 transition-colors" aria-label="Buka Menu">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white shadow-xs">
          <svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 7v14M21 7v14M6 21V11M18 21V11M6 11l6-4 6 4M6 11h12M10 21v-5h4v5"/></svg>
        </div>
        <div>
          <h1 class="text-xs font-black text-slate-900 tracking-tight leading-tight">BIN CARD DIGITAL</h1>
          <p class="text-[9px] font-bold text-sky-600 uppercase tracking-wider">Warehouse Q2</p>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-1.5">
      <button onclick="switchView('scan')" class="flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-sky-700 active:scale-95 transition-all">
        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
        <span>Pindai</span>
      </button>
    </div>
  </header>

  <!-- MOBILE DRAWER BACKDROP & DRAWER CONTAINER -->
  <div id="mobile-drawer-backdrop" onclick="toggleMobileDrawer(false)" class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity hidden md:hidden"></div>
  <aside id="mobile-drawer" class="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out transform -translate-x-full md:hidden select-none">
    <div class="p-4 space-y-4 overflow-y-auto">
      <div class="flex items-center justify-between pb-3 border-b border-sky-100">
        <div class="flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white shadow-xs">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 7v14M21 7v14M6 21V11M18 21V11M6 11l6-4 6 4M6 11h12M10 21v-5h4v5"/></svg>
          </div>
          <div>
            <div class="text-xs font-black text-slate-900 tracking-tight leading-tight">BIN CARD DIGITAL</div>
            <div class="text-[9px] font-bold text-sky-600 uppercase">Warehouse Q2</div>
          </div>
        </div>
        <button onclick="toggleMobileDrawer(false)" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Navigation Menu for Mobile Drawer -->
      <nav class="space-y-1">
        <button onclick="switchView('dashboard'); toggleMobileDrawer(false)" id="mnav-dashboard" class="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all bg-sky-50 text-sky-900">
          <svg class="h-4 w-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          Dashboard
        </button>
        <button onclick="switchView('scan'); toggleMobileDrawer(false)" id="mnav-scan" class="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-slate-600 hover:bg-sky-50 hover:text-sky-900">
          <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
          Scan & Pindai QR
        </button>
        <button onclick="switchView('materials'); toggleMobileDrawer(false)" id="mnav-materials" class="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-slate-600 hover:bg-sky-50 hover:text-sky-900">
          <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          Katalog Master Material
        </button>
        <button onclick="switchView('transactions'); toggleMobileDrawer(false)" id="mnav-transactions" class="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-slate-600 hover:bg-sky-50 hover:text-sky-900">
          <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
          Riwayat Mutasi (252)
        </button>
        <button onclick="switchView('settings'); toggleMobileDrawer(false)" id="mnav-settings" class="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-slate-600 hover:bg-sky-50 hover:text-sky-900">
          <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Pengaturan Sistem
        </button>
      </nav>
    </div>

    <!-- Mini Calendar & Clock inside Mobile Drawer -->
    <div class="p-3 bg-gradient-to-b from-sky-900 to-sky-950 text-white rounded-t-2xl m-2 shadow-lg">
      <div class="flex items-center justify-between border-b border-sky-800/80 pb-2 mb-2">
        <span class="text-[10px] font-black uppercase tracking-wider text-sky-300">WAKTU GUDANG</span>
        <span id="drawer-time" class="font-mono text-xs font-black text-sky-200">--:--:--</span>
      </div>
      <div id="drawer-date" class="text-[10px] font-bold text-white mb-2">--</div>
    </div>
  </aside>

  <!-- DESKTOP / MAIN WRAPPER -->
  <div class="flex flex-1 overflow-hidden">
    <!-- DESKTOP SIDEBAR (hidden on mobile, visible on md and up) -->
    <aside class="hidden md:flex md:w-64 border-r border-sky-100 bg-white flex-col justify-between shrink-0 select-none">
      <div class="p-4 space-y-6">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white shadow-md shadow-sky-500/20">
            <!-- Animated Warehouse Icon -->
            <svg class="h-6 w-6 transform hover:rotate-6 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 7v14M21 7v14M6 21V11M18 21V11M6 11l6-4 6 4M6 11h12M10 21v-5h4v5" />
            </svg>
          </div>
          <div>
            <h1 class="text-sm font-black text-slate-900 tracking-tight leading-tight">BIN CARD DIGITAL</h1>
            <p class="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Warehouse Inventory</p>
          </div>
        </div>

        <!-- Desktop Navigation Menu -->
        <nav class="space-y-1">
          <button onclick="switchView('dashboard')" id="nav-dashboard" class="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all bg-sky-50 text-sky-900">
            <svg class="h-4 w-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Dashboard
          </button>
          <button onclick="switchView('scan')" id="nav-scan" class="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-slate-600 hover:bg-sky-50 hover:text-sky-900">
            <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
            Scan & Pindai QR
          </button>
          <button onclick="switchView('materials')" id="nav-materials" class="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-slate-600 hover:bg-sky-50 hover:text-sky-900">
            <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            Katalog Material
          </button>
          <button onclick="switchView('transactions')" id="nav-transactions" class="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-slate-600 hover:bg-sky-50 hover:text-sky-900">
            <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            Riwayat Mutasi (252)
          </button>
          <button onclick="switchView('settings')" id="nav-settings" class="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-slate-600 hover:bg-sky-50 hover:text-sky-900">
            <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            Pengaturan Sistem
          </button>
        </nav>
      </div>

      <!-- DESKTOP BOTTOM SIDEBAR: MINI CALENDAR & REAL-TIME CLOCK -->
      <div class="p-3 bg-gradient-to-b from-sky-900 to-sky-950 text-white rounded-t-2xl m-2 shadow-lg">
        <!-- Live Clock -->
        <div class="flex items-center justify-between border-b border-sky-800/80 pb-2 mb-2">
          <div class="flex items-center gap-1.5">
            <svg class="h-3.5 w-3.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span class="text-[10px] font-black uppercase tracking-wider text-sky-300">WAKTU GUDANG</span>
          </div>
          <span id="sidebar-time" class="font-mono text-xs font-black text-sky-200">--:--:--</span>
        </div>

        <div id="sidebar-date" class="text-[11px] font-bold text-white mb-2">Senin, 16 November 2026</div>

        <!-- Mini Calendar Widget -->
        <div class="rounded-xl bg-sky-950/70 p-2 border border-sky-800/60 text-center">
          <div class="flex items-center justify-between text-[10px] font-black text-sky-300 mb-1 px-1">
            <button onclick="prevMonth()" class="hover:text-white">&lt;</button>
            <span id="calendar-month-year">November 2026</span>
            <button onclick="nextMonth()" class="hover:text-white">&gt;</button>
          </div>
          <div class="grid grid-cols-7 gap-1 text-[9px] font-bold text-sky-400 border-b border-sky-800/50 pb-1 mb-1">
            <span>M</span><span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span>
          </div>
          <div id="calendar-days" class="grid grid-cols-7 gap-1 text-[9px]">
            <!-- Calendar Days Inserted via JS -->
          </div>
        </div>
      </div>
    </aside>

    <!-- MAIN CONTENT AREA (Responsive padding & safe bottom spacing for mobile bottom bar) -->
    <main class="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 pb-24 md:pb-8 bg-warehouse-bg">
      <div class="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        <!-- VIEW: DASHBOARD -->
        <div id="view-dashboard" class="space-y-4 sm:space-y-6">
          <!-- KPI Cards Grid: 2 columns on Mobile, 4 columns on Desktop -->
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
            <!-- Card 1: Master Material -->
            <div class="card-hover-fx rounded-2xl border border-sky-100 bg-white p-3.5 sm:p-5 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-[11px] sm:text-xs font-bold text-slate-500">Master Item</span>
                <div class="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                </div>
              </div>
              <div class="mt-2 sm:mt-3">
                <div id="kpi-total-materials" class="text-2xl sm:text-3xl font-black text-slate-900">52</div>
                <div class="mt-1 text-[10px] sm:text-xs text-sky-600 font-semibold truncate">
                  Suku cadang aktif
                </div>
              </div>
            </div>

            <!-- Card 2: Total Fisik Stok -->
            <div class="card-hover-fx rounded-2xl border border-sky-100 bg-white p-3.5 sm:p-5 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-[11px] sm:text-xs font-bold text-slate-500">Saldo Fisik</span>
                <div class="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
                </div>
              </div>
              <div class="mt-2 sm:mt-3">
                <div id="kpi-total-stock" class="text-2xl sm:text-3xl font-black text-slate-900">0</div>
                <div class="mt-1 text-[10px] sm:text-xs text-blue-600 font-semibold truncate">
                  Total seluruh rak
                </div>
              </div>
            </div>

            <!-- Card 3: Total GR Masuk -->
            <div class="card-hover-fx rounded-2xl border border-sky-100 bg-white p-3.5 sm:p-5 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-[11px] sm:text-xs font-bold text-slate-500">Masuk (GR Q2)</span>
                <div class="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                </div>
              </div>
              <div class="mt-2 sm:mt-3">
                <div id="kpi-total-gr" class="text-2xl sm:text-3xl font-black text-emerald-600">131</div>
                <div class="mt-1 text-[10px] sm:text-xs text-emerald-700 font-semibold truncate">
                  Mutasi penerimaan
                </div>
              </div>
            </div>

            <!-- Card 4: Total GI Keluar -->
            <div class="card-hover-fx rounded-2xl border border-sky-100 bg-white p-3.5 sm:p-5 shadow-xs">
              <div class="flex items-center justify-between">
                <span class="text-[11px] sm:text-xs font-bold text-slate-500">Keluar (GI Q2)</span>
                <div class="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                </div>
              </div>
              <div class="mt-2 sm:mt-3">
                <div id="kpi-total-gi" class="text-2xl sm:text-3xl font-black text-rose-600">121</div>
                <div class="mt-1 text-[10px] sm:text-xs text-rose-700 font-semibold truncate">
                  Mutasi pengeluaran
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions & Recent Table Grid -->
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
            <!-- Left: Quick QR Scanner Banner & Shortcut -->
            <div class="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-600 to-sky-700 p-5 sm:p-6 text-white shadow-sm flex flex-col justify-between">
              <div>
                <div class="inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-2.5 py-1 text-xs font-bold backdrop-blur-xs">
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
                  Scanner Kamera & Unggah Foto
                </div>
                <h3 class="mt-3 text-lg sm:text-xl font-black leading-tight">Digital QR Bin Card Scanner</h3>
                <p class="mt-2 text-xs text-sky-100 leading-relaxed">
                  Pindai label QR pada rak atau unggah gambar untuk melihat foto material, saldo stok, dan transaksi GR/GI secara langsung.
                </p>
              </div>

              <div class="mt-5 flex flex-col sm:flex-row lg:flex-col gap-2">
                <button onclick="switchView('scan')" class="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 sm:py-3 text-xs font-bold text-sky-800 shadow-md hover:bg-sky-50 active:scale-98 transition-all">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Buka Pindai QR Sekarang
                </button>
                <button onclick="switchView('materials')" class="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-800/80 hover:bg-sky-800 px-4 py-2 text-xs font-bold text-white transition-colors">
                  Katalog 52 Master Material & Foto
                </button>
              </div>
            </div>

            <!-- Right: Ringkasan Mutasi Terkini -->
            <div class="lg:col-span-2 rounded-2xl border border-sky-100 bg-white p-4 sm:p-5 shadow-xs">
              <div class="flex items-center justify-between border-b border-sky-50 pb-3">
                <div>
                  <h3 class="text-xs sm:text-sm font-bold text-slate-900">Mutasi Terakhir Bin Card</h3>
                  <p class="text-[11px] text-slate-500">5 transaksi terbaru dari total 252 log mutasi Q2</p>
                </div>
                <button onclick="switchView('transactions')" class="text-xs font-bold text-sky-600 hover:text-sky-700">
                  Semua (252) &rarr;
                </button>
              </div>

              <div class="overflow-x-auto mt-3 -mx-2 sm:mx-0">
                <table class="w-full text-left text-xs min-w-[500px] sm:min-w-0">
                  <thead class="bg-sky-50/60 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th class="py-2 px-3">Tanggal</th>
                      <th class="py-2 px-3">Material</th>
                      <th class="py-2 px-3 text-center">Tipe</th>
                      <th class="py-2 px-3 text-right">Qty</th>
                      <th class="py-2 px-3 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody id="dashboard-recent-tx" class="divide-y divide-slate-100 text-slate-700">
                    <!-- Populated by JS -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- VIEW: SCAN & PINDAI QR -->
        <div id="view-scan" class="hidden space-y-4 sm:space-y-6">
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
            <!-- Left: Scanner Controls & Camera Area (7 Cols) -->
            <div class="lg:col-span-7 space-y-4">
              <div class="rounded-2xl border border-sky-100 bg-white p-4 sm:p-5 shadow-sm">
                <!-- Mode Switcher Tabs (3 Pilihan Utama) -->
                <div class="grid grid-cols-3 gap-1.5 sm:gap-2 border-b border-sky-100 pb-3 mb-4">
                  <button id="tab-cam" onclick="setScanMode('camera')" class="rounded-xl py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold transition-all bg-sky-700 text-white shadow-xs">
                    Kamera QR
                  </button>
                  <button id="tab-up" onclick="setScanMode('upload')" class="rounded-xl py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold transition-all text-slate-600 hover:bg-sky-50">
                    File Foto QR
                  </button>
                  <button id="tab-mat-photo" onclick="setScanMode('mat-photo')" class="rounded-xl py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold transition-all text-sky-900 bg-sky-50/70 hover:bg-sky-100 border border-sky-200 flex items-center justify-center gap-1">
                    <svg class="h-3.5 w-3.5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <span>Foto Material</span>
                  </button>
                </div>

                <!-- Camera Scanner Container -->
                <div id="scan-camera-box" class="space-y-3">
                  <div class="relative w-full aspect-square sm:aspect-video bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-sky-300">
                    <div id="reader" class="w-full h-full hidden"></div>
                    <div id="camera-placeholder" class="text-center p-6 text-white space-y-3">
                      <div class="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-sky-800 text-sky-200 mx-auto">
                        <svg class="h-7 w-7 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      </div>
                      <p class="text-xs text-sky-200 max-w-xs mx-auto">Arahkan kamera HP/laptop ke QR Code Bin Card pada rak</p>
                    </div>
                  </div>

                  <div class="flex gap-2">
                    <button id="btn-start-cam" onclick="startCameraScan()" class="flex-1 rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-700 active:scale-98">Aktifkan Kamera</button>
                    <button id="btn-stop-cam" onclick="stopCameraScan()" class="flex-1 rounded-xl bg-slate-700 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 hidden">Hentikan Kamera</button>
                  </div>
                </div>

                <!-- File Upload Scanner Container (QR Code decoding) -->
                <div id="scan-upload-box" class="space-y-3 hidden">
                  <div class="relative w-full aspect-square sm:aspect-video bg-sky-50/50 rounded-2xl border-2 border-dashed border-sky-300 flex flex-col items-center justify-center p-6 text-center hover:bg-sky-50 transition-colors">
                    <input type="file" id="qr-file-input" accept="image/*" onchange="handleQrFileUpload(event)" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                    <div class="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 mb-3">
                      <svg class="h-7 w-7 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                    <span class="text-xs font-bold text-slate-800">Klik atau Tarik Foto QR ke Sini</span>
                    <p class="text-[11px] text-slate-500 mt-1">Mendukung foto QR dari galeri atau kamera HP</p>
                  </div>
                </div>

                <!-- TAB 3: OPSI UNGGAH FOTO MATERIAL BARU LANGSUNG -->
                <div id="scan-material-photo-box" class="space-y-4 hidden">
                  <div class="rounded-xl bg-sky-50/80 p-3.5 border border-sky-100">
                    <div class="flex items-center gap-2 text-sky-950 font-bold text-xs mb-1">
                      <svg class="h-4 w-4 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      <span>Unggah & Perbarui Foto Material Langsung</span>
                    </div>
                    <p class="text-[11px] text-slate-600 leading-relaxed">
                      Pilihan ini memudahkan petugas gudang memperbarui foto fisik suku cadang sewaktu-waktu (misal: kemasan berubah, part baru datang, atau melengkapi foto yang terlewat).
                    </p>
                  </div>

                  <div class="space-y-3">
                    <div>
                      <label class="text-[10px] font-bold uppercase text-slate-500 block mb-1">1. Pilih Suku Cadang / Material:</label>
                      <select id="select-mat-for-photo" onchange="handleSelectMatForPhotoChange(this.value)" class="w-full rounded-xl border border-sky-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500">
                        <option value="">-- Pilih Material dari 52 Master Item --</option>
                      </select>
                    </div>

                    <div>
                      <label class="text-[10px] font-bold uppercase text-slate-500 block mb-1">2. Jepret Kamera HP atau Pilih File Gambar:</label>
                      <input type="file" id="direct-mat-photo-input" accept="image/*" capture="environment" onchange="handleDirectMatPhotoFile(event)" class="hidden" />

                      <div id="direct-mat-photo-dropzone" onclick="document.getElementById('direct-mat-photo-input').click()" class="relative cursor-pointer rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/50 p-5 text-center hover:bg-sky-50 transition-colors flex flex-col items-center justify-center">
                        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 mb-2">
                          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </div>
                        <span class="text-xs font-bold text-slate-800">Klik untuk Buka Kamera HP / Pilih Foto</span>
                        <p class="text-[11px] text-slate-500 mt-0.5">Dapat langsung memotret fisik barang di rak gudang</p>
                      </div>

                      <!-- Preview Foto Baru -->
                      <div id="direct-mat-preview-box" class="hidden space-y-2 mt-3">
                        <span class="text-[10px] font-bold uppercase text-slate-400 block">Preview Foto Fisik Baru:</span>
                        <div class="relative w-full aspect-video max-h-52 rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center border border-sky-200">
                          <img id="direct-mat-preview-img" src="" alt="Preview Foto Baru" class="w-full h-full object-contain" />
                        </div>
                        <div class="flex gap-2">
                          <button type="button" onclick="document.getElementById('direct-mat-photo-input').click()" class="flex-1 rounded-xl border border-sky-200 bg-white py-1.5 text-xs font-bold text-sky-800 hover:bg-sky-50">Jepret / Ganti Foto Lain</button>
                          <button type="button" onclick="cancelDirectMatPhoto()" class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100">Batal</button>
                        </div>
                      </div>
                    </div>

                    <button id="btn-save-direct-photo" onclick="saveDirectMaterialPhoto()" disabled class="w-full rounded-xl bg-sky-700 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-800 disabled:opacity-50 disabled:pointer-events-none transition-all active:scale-98">
                      Simpan & Terapkan Foto Material Baru
                    </button>
                  </div>
                </div>

                <!-- Manual Code Input Fallback -->
                <div class="mt-4 border-t border-sky-100 pt-3">
                  <label class="text-[10px] font-bold uppercase text-slate-500 block mb-1">Cari Kode Material / Token QR:</label>
                  <div class="flex gap-2">
                    <input type="text" id="manual-scan-input" placeholder="Contoh: 202040992 atau 212043604" class="flex-1 rounded-xl border border-sky-200 bg-sky-50/50 px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400" />
                    <button onclick="handleManualScanSubmit()" class="rounded-xl bg-sky-700 px-4 py-2 text-xs font-bold text-white hover:bg-sky-800 active:scale-95">Periksa</button>
                  </div>
                  <div class="mt-2 flex flex-wrap gap-1.5 items-center text-[10px] text-slate-500">
                    <span>Cepat:</span>
                    <button onclick="inspectMaterialByCode('202040992')" class="rounded bg-sky-50 text-sky-800 font-mono text-[10px] font-bold px-2 py-0.5 border border-sky-200">202040992</button>
                    <button onclick="inspectMaterialByCode('212043604')" class="rounded bg-amber-50 text-amber-900 font-mono text-[10px] font-bold px-2 py-0.5 border border-amber-300" title="Item tanpa foto awal">212043604 (Baru)</button>
                    <button onclick="inspectMaterialByCode('202041211')" class="rounded bg-amber-50 text-amber-900 font-mono text-[10px] font-bold px-2 py-0.5 border border-amber-300" title="Item tanpa foto awal">202041211 (Baru)</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Inspected Material Panel with PHOTO & Details (5 Cols) -->
            <div class="lg:col-span-5">
              <div id="scan-result-card" class="rounded-2xl border border-sky-200 bg-white p-4 sm:p-5 shadow-sm hidden space-y-4">
                <div class="flex items-center justify-between border-b border-sky-100 pb-2">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[10px] font-bold text-slate-400 uppercase">Token QR:</span>
                    <span id="inspect-code" class="rounded bg-sky-100 text-sky-900 font-mono text-xs font-black px-2 py-0.5">202040992</span>
                  </div>
                  <span id="inspect-badge" class="rounded-full px-2 py-0.5 text-[10px] font-black uppercase bg-sky-100 text-sky-800">Aman</span>
                </div>

                <!-- Foto Material Preview Container -->
                <div class="space-y-2">
                  <div class="relative w-full aspect-video sm:aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-sky-100 group">
                    <img id="inspect-img" src="" alt="Foto Material" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    
                    <div id="inspect-no-img" class="hidden flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <svg class="w-9 h-9 sm:w-10 sm:h-10 text-slate-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                      <span class="text-xs font-bold text-slate-200">Foto Fisik Belum Tersedia</span>
                      <span class="text-[10px] text-sky-300 mt-1 font-semibold">Gunakan tombol kamera di bawah untuk menambah foto!</span>
                      <span class="text-[9px] text-slate-500 mt-0.5 font-mono" id="inspect-img-filename"></span>
                    </div>

                    <button type="button" id="inspect-zoom-btn" onclick="openPhotoModal()" class="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md hover:bg-black/80 transition-colors">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
                      Perbesar
                    </button>
                  </div>

                  <!-- FITUR INTERAKTIF: TAMBAH / GANTI FOTO MATERIAL -->
                  <div class="flex items-center gap-2">
                    <label for="material-photo-input" class="cursor-pointer flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50/80 hover:bg-sky-100 py-2 px-3 text-xs font-bold text-sky-800 transition-colors active:scale-98">
                      <svg class="h-4 w-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      <span id="label-photo-action">Ambil / Unggah Foto</span>
                    </label>
                    <input type="file" id="material-photo-input" accept="image/*" capture="environment" onchange="handleCustomPhotoUpload(event)" class="hidden" />

                    <button id="btn-delete-custom-photo" onclick="deleteCustomPhotoForCurrent()" class="hidden rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 p-2 text-rose-600 transition-colors" title="Hapus foto kustom & kembali ke foto default">
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>

                <div>
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Suku Cadang</span>
                  <h3 id="inspect-desc" class="text-sm font-black text-slate-900 leading-snug">PUMP ASSY OIL</h3>
                  <div class="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span id="inspect-cat">Kategori: -</span>
                  </div>
                </div>

                <!-- Current Stock Display -->
                <div class="rounded-xl bg-sky-50/80 p-3 border border-sky-100">
                  <div class="text-[10px] font-bold uppercase text-slate-500">Saldo Fisik Terkini</div>
                  <div class="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    <span id="inspect-stock">0</span> <span id="inspect-uom" class="text-sm font-bold text-slate-500">PCS</span>
                  </div>
                  <div class="text-[11px] text-slate-600 mt-1">
                    Lokasi Rak: <strong id="inspect-loc" class="text-sky-900 font-bold">Q2-0101A</strong> &bull; Min: <span id="inspect-min">0</span>
                  </div>
                </div>

                <!-- Action Buttons: GR & GI -->
                <div class="grid grid-cols-2 gap-2">
                  <button onclick="openTransactionModalForCurrent('GR')" class="rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-700 active:scale-98 transition-all flex items-center justify-center gap-1.5">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                    Masuk (GR)
                  </button>
                  <button onclick="openTransactionModalForCurrent('GI')" class="rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 active:scale-98 transition-all flex items-center justify-center gap-1.5">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                    Keluar (GI)
                  </button>
                </div>
                <button onclick="openLabelPrintForCurrent()" class="w-full rounded-xl border border-sky-200 bg-white py-2 text-xs font-bold text-sky-800 hover:bg-sky-50 active:scale-98 transition-all flex items-center justify-center gap-1.5">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                  Cetak Label Bin Card QR
                </button>

                <!-- Riwayat Mutasi Material Ini -->
                <div class="border-t border-sky-100 pt-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[11px] font-black uppercase tracking-wider text-slate-700">Riwayat Mutasi Item Ini</span>
                    <span id="inspect-tx-count" class="text-[10px] text-sky-700 font-bold"></span>
                  </div>
                  <div id="inspect-tx-list" class="space-y-1.5 max-h-44 overflow-y-auto">
                    <!-- Populated by JS -->
                  </div>
                </div>
              </div>

              <!-- Placeholder when no material scanned yet -->
              <div id="scan-empty-prompt" class="rounded-2xl border border-dashed border-sky-200 bg-white/60 p-6 sm:p-8 text-center text-slate-400">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-400 mx-auto mb-3">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                </div>
                <h4 class="text-xs font-bold text-slate-700">Menunggu Pemindaian QR</h4>
                <p class="text-[11px] text-slate-500 mt-1">Pindai QR rak atau klik contoh kode untuk melihat spesifikasi fisik, foto, dan formulir GR/GI.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- VIEW: MASTER MATERIAL -->
        <div id="view-materials" class="hidden space-y-4 sm:space-y-6">
          <div class="rounded-2xl border border-sky-100 bg-white p-4 sm:p-5 shadow-sm">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-sky-50 pb-4">
              <div>
                <h3 class="text-xs sm:text-sm font-bold text-slate-900">Katalog Master Material (52 Item)</h3>
                <p class="text-[11px] text-slate-500">Daftar lengkap material gudang dengan foto fisik dan saldo terkini</p>
              </div>
              <div class="flex gap-2">
                <input type="text" id="mat-search" oninput="renderMasterTable()" placeholder="Cari kode material, deskripsi, rak..." class="w-full sm:w-72 rounded-xl border border-sky-100 bg-sky-50/50 py-1.5 px-3 text-xs focus:bg-white focus:outline-none" />
              </div>
            </div>

            <div class="overflow-x-auto mt-4 -mx-2 sm:mx-0">
              <table class="w-full text-left text-xs min-w-[650px] sm:min-w-0">
                <thead class="bg-sky-50/60 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th class="py-2.5 px-3">No</th>
                    <th class="py-2.5 px-3">Foto</th>
                    <th class="py-2.5 px-3">Kode Material</th>
                    <th class="py-2.5 px-3">Deskripsi Suku Cadang</th>
                    <th class="py-2.5 px-3">Lokasi Rak</th>
                    <th class="py-2.5 px-3 text-right">Saldo Stok</th>
                    <th class="py-2.5 px-3 text-right">Batas Min</th>
                    <th class="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody id="mat-table-body" class="divide-y divide-slate-100 text-slate-700">
                  <!-- Populated by JS -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- VIEW: TRANSACTIONS LOG -->
        <div id="view-transactions" class="hidden space-y-4 sm:space-y-6">
          <div class="rounded-2xl border border-sky-100 bg-white p-4 sm:p-5 shadow-sm">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-sky-50 pb-4">
              <div>
                <h3 class="text-xs sm:text-sm font-bold text-slate-900">Riwayat Mutasi Fisik (252 Transaksi)</h3>
                <p class="text-[11px] text-slate-500">131 GR Barang Masuk & 121 GI Barang Keluar dari database Q2</p>
              </div>

              <!-- Filter Buttons & Search -->
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button id="tx-filter-btn-ALL" onclick="setTxFilter('ALL')" class="flex-1 sm:flex-none rounded-lg px-2.5 py-1 text-[11px] font-bold bg-white text-sky-900 shadow-xs">Semua (<span id="cnt-all">252</span>)</button>
                  <button id="tx-filter-btn-GR" onclick="setTxFilter('GR')" class="flex-1 sm:flex-none rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-sky-900">GR (<span id="cnt-gr">131</span>)</button>
                  <button id="tx-filter-btn-GI" onclick="setTxFilter('GI')" class="flex-1 sm:flex-none rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-sky-900">GI (<span id="cnt-gi">121</span>)</button>
                </div>
                <input type="text" id="tx-search" oninput="renderTransactionsTable()" placeholder="Cari transaksi, kode, catatan..." class="rounded-xl border border-sky-100 bg-sky-50/50 py-1.5 px-3 text-xs focus:bg-white focus:outline-none w-full sm:w-60" />
              </div>
            </div>

            <div class="overflow-x-auto mt-4 -mx-2 sm:mx-0">
              <table class="w-full text-left text-xs min-w-[700px] sm:min-w-0">
                <thead class="bg-sky-50/60 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th class="py-2.5 px-3">Waktu Mutasi</th>
                    <th class="py-2.5 px-3">No Transaksi</th>
                    <th class="py-2.5 px-3">Material Suku Cadang</th>
                    <th class="py-2.5 px-3 text-center">Jenis</th>
                    <th class="py-2.5 px-3 text-right">Kuantitas</th>
                    <th class="py-2.5 px-3 text-right">Saldo Baru</th>
                    <th class="py-2.5 px-3">Referensi / Catatan</th>
                  </tr>
                </thead>
                <tbody id="tx-table-body" class="divide-y divide-slate-100 text-slate-700">
                  <!-- Populated by JS -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- VIEW: SETTINGS -->
        <div id="view-settings" class="hidden space-y-4 sm:space-y-6">
          <div class="rounded-2xl border border-sky-100 bg-white p-4 sm:p-6 shadow-sm space-y-6">
            <div>
              <h3 class="text-xs sm:text-sm font-bold text-slate-900">Pengaturan Sistem & Foto Material</h3>
              <p class="text-[11px] text-slate-500">Kelola penyimpanan data lokal, penambahan foto suku cadang, dan pembaruan Netlify</p>
            </div>

            <!-- Bagian 1: Manajemen Foto Material Tambahan -->
            <div class="rounded-xl border border-sky-200 bg-sky-50/50 p-4 space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-xs font-black text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                    <svg class="h-4 w-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    Foto Material Tambahan (Custom Upload)
                  </h4>
                  <p class="text-[11px] text-slate-600 mt-0.5">
                    Anda dapat memotret suku cadang yang belum memiliki foto langsung lewat kamera HP di menu Pindai QR.
                  </p>
                </div>
                <span id="custom-photo-count-badge" class="rounded-full bg-sky-200 text-sky-900 font-bold px-2 py-0.5 text-[10px]">
                  0 Foto Kustom
                </span>
              </div>

              <!-- Quick action for 2 items without initial photos -->
              <div class="border-t border-sky-100 pt-3">
                <span class="text-[10px] font-bold text-slate-500 uppercase block mb-2">Item Belum Ada Foto Bawaan (Bisa Ditambahkan Sekarang):</span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div class="rounded-xl bg-white p-3 border border-sky-100 flex items-center justify-between">
                    <div>
                      <div class="font-mono font-bold text-sky-900 text-[11px]">212043604</div>
                      <div class="font-semibold text-slate-800 text-[11px]">T- 04371-0K120 SPIDER KIT REAR</div>
                      <div class="text-[10px] text-slate-500">Rak: Q2-0407B</div>
                    </div>
                    <button onclick="inspectMaterialByCode('212043604'); switchView('scan')" class="rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 px-3 py-1.5 text-[11px] font-bold transition-colors">
                      Unggah
                    </button>
                  </div>

                  <div class="rounded-xl bg-white p-3 border border-sky-100 flex items-center justify-between">
                    <div>
                      <div class="font-mono font-bold text-sky-900 text-[11px]">202041211</div>
                      <div class="font-semibold text-slate-800 text-[11px]">PIPE, LUB OIL 105990-39200</div>
                      <div class="text-[10px] text-slate-500">Rak: Q2-0505</div>
                    </div>
                    <button onclick="inspectMaterialByCode('202041211'); switchView('scan')" class="rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 px-3 py-1.5 text-[11px] font-bold transition-colors">
                      Unggah
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-2 pt-2">
                <button onclick="clearAllCustomPhotos()" class="rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 px-3 py-1.5 text-[11px] font-bold transition-colors">
                  Hapus Semua Foto Kustom
                </button>
              </div>
            </div>

            <!-- Bagian 2: Tindakan Data & Cadangan -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="rounded-xl border border-sky-100 bg-sky-50/40 p-4 space-y-2">
                <h4 class="text-xs font-black text-sky-950 uppercase tracking-wider">Reset ke Default Pabrik</h4>
                <p class="text-[11px] text-slate-600 leading-relaxed">
                  Kembalikan seluruh saldo stok ke kondisi awal Excel (52 Master Material & 252 Transaksi Q2).
                </p>
                <button onclick="resetDataDefault()" class="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 active:scale-95 transition-all">
                  Reset ke 252 Transaksi Asli
                </button>
              </div>

              <div class="rounded-xl border border-sky-100 bg-sky-50/40 p-4 space-y-2">
                <h4 class="text-xs font-black text-sky-950 uppercase tracking-wider">Format Standalone Offline</h4>
                <p class="text-[11px] text-slate-600 leading-relaxed">
                  Unduh file HTML tunggal ini untuk penggunaan langsung tanpa internet di perangkat gudang.
                </p>
                <button onclick="downloadSelfHtml()" class="rounded-xl bg-sky-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-800 active:scale-95 transition-all">
                  Unduh index.html
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>

  <!-- BOTTOM MOBILE NAVIGATION BAR (Visible on Mobile only: md:hidden) -->
  <nav class="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-sky-100 shadow-lg px-1 py-1.5 flex items-center justify-around select-none">
    <button onclick="switchView('dashboard')" id="bnav-dashboard" class="flex-1 flex flex-col items-center py-1 text-sky-600 font-bold transition-colors">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      <span class="text-[9px] mt-0.5">Beranda</span>
    </button>
    <button onclick="switchView('scan')" id="bnav-scan" class="flex-1 flex flex-col items-center py-1 text-slate-500 font-bold transition-colors">
      <div class="p-1.5 -mt-3 bg-sky-600 text-white rounded-xl shadow-md">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
      </div>
      <span class="text-[9px] mt-0.5">Pindai QR</span>
    </button>
    <button onclick="switchView('materials')" id="bnav-materials" class="flex-1 flex flex-col items-center py-1 text-slate-500 font-bold transition-colors">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
      <span class="text-[9px] mt-0.5">Material</span>
    </button>
    <button onclick="switchView('transactions')" id="bnav-transactions" class="flex-1 flex flex-col items-center py-1 text-slate-500 font-bold transition-colors">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
      <span class="text-[9px] mt-0.5">Riwayat</span>
    </button>
    <button onclick="switchView('settings')" id="bnav-settings" class="flex-1 flex flex-col items-center py-1 text-slate-500 font-bold transition-colors">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      <span class="text-[9px] mt-0.5">Setelan</span>
    </button>
  </nav>

  <!-- MODAL: TRANSACTION (GR / GI) -->
  <div id="modal-transaction" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 hidden">
    <div class="relative w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-sky-100 space-y-4">
      <div class="flex items-center justify-between border-b border-sky-50 pb-3">
        <h3 id="tx-modal-title" class="text-sm font-bold text-slate-900">Catat Mutasi Bin Card</h3>
        <button onclick="closeModal('modal-transaction')" class="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
      </div>

      <div class="space-y-3">
        <div class="rounded-xl bg-sky-50 p-3 border border-sky-100">
          <span class="text-[10px] font-bold text-slate-500 uppercase block">Material:</span>
          <div id="tx-mat-name" class="text-xs font-black text-slate-900 mt-0.5">202040992 - PUMP ASSY OIL</div>
          <div class="text-[11px] text-slate-600 mt-1">Saldo Saat Ini: <strong id="tx-mat-current">1 PCS</strong></div>
        </div>

        <!-- GR / GI Switch -->
        <div class="grid grid-cols-2 gap-2">
          <button id="btn-tx-gr" onclick="setModalTxType('GR')" class="rounded-xl py-2 font-bold border border-sky-600 bg-sky-50 text-sky-900 text-xs">Barang Masuk (GR)</button>
          <button id="btn-tx-gi" onclick="setModalTxType('GI')" class="rounded-xl py-2 font-bold border border-slate-200 text-slate-600 text-xs">Barang Keluar (GI)</button>
        </div>

        <div>
          <label class="text-[10px] font-bold uppercase text-slate-500 block mb-1">Kuantitas Mutasi:</label>
          <input type="number" id="tx-qty" min="0.001" step="any" oninput="calculateTxPreview()" placeholder="0" class="w-full rounded-xl border border-sky-200 px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>

        <div>
          <label class="text-[10px] font-bold uppercase text-slate-500 block mb-1">Nomor Referensi (PO / BAST / WO):</label>
          <input type="text" id="tx-ref" placeholder="Contoh: PO-2026-001" class="w-full rounded-xl border border-sky-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>

        <div>
          <label class="text-[10px] font-bold uppercase text-slate-500 block mb-1">Catatan Tambahan:</label>
          <textarea id="tx-notes" rows="2" placeholder="Keterangan peruntukan suku cadang..." class="w-full rounded-xl border border-sky-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"></textarea>
        </div>

        <!-- Simulation Box -->
        <div class="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs">
          <span class="text-[10px] font-bold uppercase text-slate-400 block">Simulasi Saldo Fisik Baru:</span>
          <div id="tx-sim-val" class="font-bold text-sky-900 mt-0.5">1 + 0 = 1 PCS</div>
        </div>
      </div>

      <div class="flex gap-2 pt-2 border-t border-sky-50">
        <button onclick="closeModal('modal-transaction')" class="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Batal</button>
        <button onclick="submitTransaction()" class="flex-1 rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white hover:bg-sky-700">Simpan Mutasi</button>
      </div>
    </div>
  </div>

  <!-- MODAL: LABEL PRINT -->
  <div id="modal-label" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 hidden">
    <div class="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-sky-100 space-y-4">
      <div class="flex items-center justify-between border-b border-sky-50 pb-3 no-print">
        <h3 class="text-sm font-bold text-slate-900">Cetak Label Bin Card QR</h3>
        <button onclick="closeModal('modal-label')" class="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
      </div>

      <!-- Printable Bin Card Label -->
      <div id="printable-label" class="bin-card-print-container border-2 border-slate-900 p-4 rounded-xl text-center space-y-2 bg-white">
        <div class="text-[10px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-900 pb-1">
          BIN CARD PERSIS GUDANG
        </div>
        <div id="print-mat-code" class="text-lg font-black font-mono text-slate-900">202040992</div>
        <div id="print-mat-desc" class="text-xs font-bold text-slate-800 leading-snug">PUMP ASSY OIL</div>

        <div class="py-2 flex justify-center">
          <div id="qrcode-container" class="bg-white p-2 border border-slate-300 rounded-lg inline-block"></div>
        </div>

        <div class="grid grid-cols-2 gap-1 text-[10px] border-t border-slate-900 pt-1 text-left">
          <div>Lokasi: <strong id="print-mat-loc">Q2-0101A</strong></div>
          <div class="text-right">Satuan: <strong id="print-mat-uom">PCS</strong></div>
        </div>
      </div>

      <div class="flex gap-2 pt-2 border-t border-sky-50 no-print">
        <button onclick="closeModal('modal-label')" class="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Tutup</button>
        <button onclick="window.print()" class="flex-1 rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white hover:bg-sky-700">Cetak (Print)</button>
      </div>
    </div>
  </div>

  <!-- MODAL: PHOTO ZOOM FULLSCREEN -->
  <div id="modal-photo-zoom" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 hidden" onclick="closeModal('modal-photo-zoom')">
    <div class="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden p-3 border border-slate-700" onclick="event.stopPropagation()">
      <div class="flex items-center justify-between pb-3 px-2 border-b border-slate-800 text-white">
        <div>
          <h4 id="photo-zoom-title" class="text-sm font-black"></h4>
          <p id="photo-zoom-code" class="text-xs text-sky-400 font-mono font-bold"></p>
        </div>
        <button onclick="closeModal('modal-photo-zoom')" class="rounded-xl bg-slate-800 p-2 text-slate-300 hover:text-white">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="p-3 flex items-center justify-center bg-black/40 min-h-[250px] max-h-[75vh]">
        <img id="photo-zoom-img" src="" alt="Zoom Foto Suku Cadang" class="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-2xl" />
      </div>
    </div>
  </div>

  <!-- EMBEDDED REAL DATA & APPLICATION ENGINE -->
  <script>
    const RAW_MATERIALS = ${materialsJson};
    const RAW_TRANSACTIONS = ${transactionsJson};

    // Auto-migration cache to ensure full 252 transactions are always loaded
    const CURRENT_VERSION = 'v3_responsive_custom_photos';
    const savedVer = localStorage.getItem('wh_version');
    let materials, transactions;

    if (savedVer !== CURRENT_VERSION || !localStorage.getItem('wh_transactions')) {
      materials = JSON.parse(JSON.stringify(RAW_MATERIALS));
      transactions = JSON.parse(JSON.stringify(RAW_TRANSACTIONS));
      localStorage.setItem('wh_version', CURRENT_VERSION);
      localStorage.setItem('wh_materials', JSON.stringify(materials));
      localStorage.setItem('wh_transactions', JSON.stringify(transactions));
    } else {
      materials = JSON.parse(localStorage.getItem('wh_materials')) || RAW_MATERIALS;
      transactions = JSON.parse(localStorage.getItem('wh_transactions')) || RAW_TRANSACTIONS;
    }

    function saveState() {
      localStorage.setItem('wh_version', CURRENT_VERSION);
      localStorage.setItem('wh_materials', JSON.stringify(materials));
      localStorage.setItem('wh_transactions', JSON.stringify(transactions));
      renderKPIs();
      renderRecentTable();
      renderMasterTable();
      renderTransactionsTable();
      renderCustomPhotoStats();
    }

    // Toggle Mobile Drawer
    function toggleMobileDrawer(open) {
      const drawer = document.getElementById('mobile-drawer');
      const backdrop = document.getElementById('mobile-drawer-backdrop');
      if (open === undefined) {
        open = drawer.classList.contains('-translate-x-full');
      }
      if (open) {
        drawer.classList.remove('-translate-x-full');
        backdrop.classList.remove('hidden');
      } else {
        drawer.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
      }
    }

    // Navigation Switcher (Desktop, Mobile Drawer, Bottom Bar)
    function switchView(viewId) {
      const views = ['dashboard', 'scan', 'materials', 'transactions', 'settings'];
      views.forEach(v => {
        const el = document.getElementById('view-' + v);
        const nav = document.getElementById('nav-' + v);
        const mnav = document.getElementById('mnav-' + v);
        const bnav = document.getElementById('bnav-' + v);

        if (v === viewId) {
          if (el) el.classList.remove('hidden');

          // Desktop sidebar active style
          if (nav) {
            nav.className = 'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all bg-sky-50 text-sky-900';
            const svg = nav.querySelector('svg');
            if (svg) { svg.classList.add('text-sky-600'); svg.classList.remove('text-slate-400'); }
          }
          // Mobile drawer active style
          if (mnav) {
            mnav.className = 'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all bg-sky-50 text-sky-900';
            const svg = mnav.querySelector('svg');
            if (svg) { svg.classList.add('text-sky-600'); svg.classList.remove('text-slate-400'); }
          }
          // Bottom nav active style
          if (bnav) {
            bnav.className = 'flex-1 flex flex-col items-center py-1 text-sky-600 font-bold transition-colors';
          }
        } else {
          if (el) el.classList.add('hidden');

          if (nav) {
            nav.className = 'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-slate-600 hover:bg-sky-50 hover:text-sky-900';
            const svg = nav.querySelector('svg');
            if (svg) { svg.classList.remove('text-sky-600'); svg.classList.add('text-slate-400'); }
          }
          if (mnav) {
            mnav.className = 'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-slate-600 hover:bg-sky-50 hover:text-sky-900';
            const svg = mnav.querySelector('svg');
            if (svg) { svg.classList.remove('text-sky-600'); svg.classList.add('text-slate-400'); }
          }
          if (bnav) {
            bnav.className = 'flex-1 flex flex-col items-center py-1 text-slate-400 font-bold transition-colors';
          }
        }
      });
      if (viewId === 'scan') {
        populateMatSelectOptions();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Render KPIs
    function renderKPIs() {
      document.getElementById('kpi-total-materials').textContent = materials.length;
      const totalStock = materials.reduce((acc, m) => acc + (parseFloat(m.currentStock) || 0), 0);
      document.getElementById('kpi-total-stock').textContent = totalStock.toLocaleString('id-ID');

      const grCount = transactions.filter(t => t.transactionType === 'GR').length;
      const giCount = transactions.filter(t => t.transactionType === 'GI').length;
      document.getElementById('kpi-total-gr').textContent = grCount;
      document.getElementById('kpi-total-gi').textContent = giCount;

      document.getElementById('cnt-all').textContent = transactions.length;
      document.getElementById('cnt-gr').textContent = grCount;
      document.getElementById('cnt-gi').textContent = giCount;
    }

    // Render Dashboard Recent Transactions
    function renderRecentTable() {
      const tbody = document.getElementById('dashboard-recent-tx');
      const recent = transactions.slice(0, 5);
      tbody.innerHTML = recent.map(t => {
        const isGR = t.transactionType === 'GR';
        const dateStr = new Date(t.transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        return \`
          <tr class="hover:bg-sky-50/40">
            <td class="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">\${dateStr}</td>
            <td class="py-2.5 px-3 font-semibold text-slate-900 truncate max-w-[180px] sm:max-w-none">\${t.material?.materialCode || '-'} - \${t.material?.description || ''}</td>
            <td class="py-2.5 px-3 text-center">
              <span class="rounded-full px-2 py-0.5 text-[9px] font-black whitespace-nowrap \${isGR ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'}">
                \${isGR ? 'GR' : 'GI'}
              </span>
            </td>
            <td class="py-2.5 px-3 text-right font-black \${isGR ? 'text-sky-700' : 'text-rose-600'}">
              \${isGR ? '+' : '-'}\${Number(t.quantity).toLocaleString('id-ID')}
            </td>
            <td class="py-2.5 px-3 text-right font-bold text-slate-900">\${Number(t.newBalance).toLocaleString('id-ID')}</td>
          </tr>
        \`;
      }).join('');
    }

    // Helper: Get photo src (checks custom localStorage uploaded photos first, then static file)
    function getMaterialPhotoSrc(code) {
      const custom = localStorage.getItem('wh_photo_' + code);
      if (custom) return custom;
      return code + '.jpg';
    }

    // Render Master Materials Table with Thumbnails
    const placeholderSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5'><path stroke-linecap='round' stroke-linejoin='round' d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'/></svg>";

    function renderMasterTable() {
      const q = (document.getElementById('mat-search')?.value || '').toLowerCase();
      const filtered = materials.filter(m => 
        m.materialCode.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.storageLocation.toLowerCase().includes(q)
      );

      const tbody = document.getElementById('mat-table-body');
      tbody.innerHTML = filtered.map((m, idx) => {
        const photoSrc = getMaterialPhotoSrc(m.materialCode);
        return \`
          <tr class="hover:bg-sky-50/40">
            <td class="py-2.5 px-3 text-slate-400 font-medium">\${idx + 1}</td>
            <td class="py-2 px-3">
              <img id="mat-thumb-\${m.materialCode}" src="\${photoSrc}" onerror="this.src='\${placeholderSvg}'" class="h-8 w-8 rounded-lg object-cover bg-slate-100 border border-sky-100 cursor-pointer" onclick="inspectMaterialByCode('\${m.materialCode}'); switchView('scan')" title="Klik untuk lihat foto besar & detail" />
            </td>
            <td class="py-2.5 px-3 font-mono font-bold text-sky-900">\${m.materialCode}</td>
            <td class="py-2.5 px-3 font-semibold text-slate-900">\${m.description}</td>
            <td class="py-2.5 px-3 text-slate-600">\${m.storageLocation}</td>
            <td class="py-2.5 px-3 text-right font-black">\${Number(m.currentStock).toLocaleString('id-ID')} \${m.uom}</td>
            <td class="py-2.5 px-3 text-right text-slate-500">\${m.minimumStock} \${m.uom}</td>
            <td class="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
              <button onclick="inspectMaterialByCode('\${m.materialCode}'); switchView('scan')" class="rounded bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold px-2 py-0.5 text-[11px]">Pilih</button>
              <button onclick="inspectMaterialByCode('\${m.materialCode}'); openLabelPrintForCurrent()" class="rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-0.5 text-[11px]">QR</button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    // Filter Transactions
    let currentTxFilter = 'ALL';
    function setTxFilter(type) {
      currentTxFilter = type;
      ['ALL', 'GR', 'GI'].forEach(t => {
        const btn = document.getElementById('tx-filter-btn-' + t);
        if (t === type) {
          btn.className = 'flex-1 sm:flex-none rounded-lg px-2.5 py-1 text-[11px] font-bold bg-white text-sky-900 shadow-xs';
        } else {
          btn.className = 'flex-1 sm:flex-none rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-sky-900';
        }
      });
      renderTransactionsTable();
    }

    // Render Transactions Table (Full 252 Data)
    function renderTransactionsTable() {
      const q = (document.getElementById('tx-search')?.value || '').toLowerCase();
      const filtered = transactions.filter(t => {
        if (currentTxFilter !== 'ALL' && t.transactionType !== currentTxFilter) return false;
        if (!q) return true;
        const text = (t.transactionNumber + ' ' + (t.material?.materialCode || '') + ' ' + (t.material?.description || '') + ' ' + (t.remarks || '') + ' ' + (t.referenceNumber || '')).toLowerCase();
        return text.includes(q);
      });

      const tbody = document.getElementById('tx-table-body');
      tbody.innerHTML = filtered.map(t => {
        const isGR = t.transactionType === 'GR';
        const dateStr = new Date(t.transactionDate).toLocaleString('id-ID');
        return \`
          <tr class="hover:bg-sky-50/40">
            <td class="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">\${dateStr}</td>
            <td class="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">\${t.transactionNumber}</td>
            <td class="py-2.5 px-3 font-semibold text-slate-900">\${t.material?.materialCode || '-'} - \${t.material?.description || ''}</td>
            <td class="py-2.5 px-3 text-center">
              <span class="rounded-full px-2 py-0.5 text-[9px] font-black \${isGR ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'}">
                \${isGR ? 'MASUK (GR)' : 'KELUAR (GI)'}
              </span>
            </td>
            <td class="py-2.5 px-3 text-right font-black \${isGR ? 'text-sky-700' : 'text-rose-600'}">
              \${isGR ? '+' : '-'}\${Number(t.quantity).toLocaleString('id-ID')}
            </td>
            <td class="py-2.5 px-3 text-right font-bold text-slate-900">\${Number(t.newBalance).toLocaleString('id-ID')}</td>
            <td class="py-2.5 px-3 text-slate-500 text-[11px]">\${t.referenceNumber || ''} \${t.remarks ? '(' + t.remarks + ')' : ''}</td>
          </tr>
        \`;
      }).join('');
    }

    // Inspect Material with Real Photo, Custom Upload, & Fallback
    let selectedMaterial = null;
    function inspectMaterialByCode(rawCode) {
      const clean = (rawCode || '').replace(/^QR-/i, '').trim().toUpperCase();
      const mat = materials.find(m => m.materialCode.toUpperCase() === clean);
      if (!mat) {
        alert('Material dengan kode "' + rawCode + '" tidak ditemukan!');
        return;
      }

      selectedMaterial = mat;
      document.getElementById('inspect-code').textContent = 'QR-' + mat.materialCode;
      document.getElementById('inspect-desc').textContent = mat.description;
      document.getElementById('inspect-cat').textContent = 'Kategori: ' + (mat.category || '-');
      document.getElementById('inspect-stock').textContent = Number(mat.currentStock).toLocaleString('id-ID');
      document.getElementById('inspect-uom').textContent = mat.uom;
      document.getElementById('inspect-loc').textContent = mat.storageLocation;
      document.getElementById('inspect-min').textContent = mat.minimumStock + ' ' + mat.uom;

      // Handle Material Photo Display
      const imgEl = document.getElementById('inspect-img');
      const noImgEl = document.getElementById('inspect-no-img');
      const zoomBtn = document.getElementById('inspect-zoom-btn');
      const btnDelCustom = document.getElementById('btn-delete-custom-photo');
      const labelPhoto = document.getElementById('label-photo-action');

      const customPhoto = localStorage.getItem('wh_photo_' + mat.materialCode);
      if (customPhoto) {
        btnDelCustom.classList.remove('hidden');
        labelPhoto.textContent = 'Ganti Foto Kustom';
      } else {
        btnDelCustom.classList.add('hidden');
        labelPhoto.textContent = 'Ambil / Unggah Foto';
      }

      imgEl.style.display = 'block';
      noImgEl.classList.add('hidden');
      zoomBtn.classList.remove('hidden');

      imgEl.src = getMaterialPhotoSrc(mat.materialCode);
      imgEl.onerror = function() {
        imgEl.style.display = 'none';
        noImgEl.classList.remove('hidden');
        zoomBtn.classList.add('hidden');
        document.getElementById('inspect-img-filename').textContent = 'File: ' + mat.materialCode + '.jpg';
      };

      const badge = document.getElementById('inspect-badge');
      if (mat.currentStock <= 0) {
        badge.textContent = 'Stok Habis';
        badge.className = 'rounded-full px-2 py-0.5 text-[10px] font-black uppercase bg-rose-100 text-rose-900';
      } else if (mat.currentStock <= mat.minimumStock) {
        badge.textContent = 'Mendekati Minimum';
        badge.className = 'rounded-full px-2 py-0.5 text-[10px] font-black uppercase bg-amber-100 text-amber-900';
      } else {
        badge.textContent = 'Aman';
        badge.className = 'rounded-full px-2 py-0.5 text-[10px] font-black uppercase bg-sky-100 text-sky-800';
      }

      // Render Riwayat Mutasi Suku Cadang Ini
      const matTxs = transactions.filter(t => t.material?.materialCode === mat.materialCode);
      document.getElementById('inspect-tx-count').textContent = matTxs.length + ' mutasi';
      const txListEl = document.getElementById('inspect-tx-list');
      if (matTxs.length === 0) {
        txListEl.innerHTML = '<div class="text-[11px] text-slate-400 py-2 text-center">Belum ada riwayat mutasi untuk suku cadang ini</div>';
      } else {
        txListEl.innerHTML = matTxs.slice(0, 5).map(t => {
          const isGR = t.transactionType === 'GR';
          const dt = new Date(t.transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
          return \`
            <div class="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-xs border border-slate-100">
              <div class="flex items-center gap-2">
                <span class="rounded px-1.5 py-0.5 text-[9px] font-black \${isGR ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'}">
                  \${t.transactionType}
                </span>
                <span class="font-mono text-[10px] text-slate-500">\${dt}</span>
                <span class="text-[11px] text-slate-700 font-semibold">\${t.referenceNumber || t.transactionNumber}</span>
              </div>
              <div class="font-black text-xs \${isGR ? 'text-sky-700' : 'text-rose-600'}">
                \${isGR ? '+' : '-'}\${Number(t.quantity).toLocaleString('id-ID')}
              </div>
            </div>
          \`;
        }).join('');
      }

      document.getElementById('scan-result-card').classList.remove('hidden');
      document.getElementById('scan-empty-prompt').classList.add('hidden');
    }

    // FITUR UNGGAH & KOMPRESI FOTO MATERIAL INTERAKTIF
    function handleCustomPhotoUpload(e) {
      const file = e.target.files[0];
      if (!file || !selectedMaterial) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
          // Kompresi resolusi ke max 800px untuk menghemat memori localStorage
          const maxDim = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round(h * (maxDim / w));
              w = maxDim;
            } else {
              w = Math.round(w * (maxDim / h));
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

          try {
            localStorage.setItem('wh_photo_' + selectedMaterial.materialCode, compressedDataUrl);
            
            // Simpan daftar kode yang memiliki foto kustom
            const list = JSON.parse(localStorage.getItem('wh_custom_photos_list') || '[]');
            if (!list.includes(selectedMaterial.materialCode)) {
              list.push(selectedMaterial.materialCode);
              localStorage.setItem('wh_custom_photos_list', JSON.stringify(list));
            }

            inspectMaterialByCode(selectedMaterial.materialCode);
            renderMasterTable();
            renderCustomPhotoStats();
            alert('Foto fisik untuk ' + selectedMaterial.materialCode + ' (' + selectedMaterial.description + ') berhasil disimpan!');
          } catch(err) {
            alert('Memori penyimpanan lokal browser penuh: ' + err.message);
          }
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }

    // Hapus foto kustom untuk material saat ini
    function deleteCustomPhotoForCurrent() {
      if (!selectedMaterial) return;
      if (confirm('Hapus foto kustom untuk ' + selectedMaterial.materialCode + ' dan gunakan foto default?')) {
        localStorage.removeItem('wh_photo_' + selectedMaterial.materialCode);
        const list = JSON.parse(localStorage.getItem('wh_custom_photos_list') || '[]');
        const updated = list.filter(c => c !== selectedMaterial.materialCode);
        localStorage.setItem('wh_custom_photos_list', JSON.stringify(updated));

        inspectMaterialByCode(selectedMaterial.materialCode);
        renderMasterTable();
        renderCustomPhotoStats();
        alert('Foto kustom berhasil dihapus!');
      }
    }

    // Render statistik foto kustom di menu Settings
    function renderCustomPhotoStats() {
      const list = JSON.parse(localStorage.getItem('wh_custom_photos_list') || '[]');
      const badge = document.getElementById('custom-photo-count-badge');
      if (badge) {
        badge.textContent = list.length + ' Foto Kustom';
      }
    }

    // Hapus semua foto kustom
    function clearAllCustomPhotos() {
      const list = JSON.parse(localStorage.getItem('wh_custom_photos_list') || '[]');
      if (list.length === 0) {
        alert('Belum ada foto kustom yang tersimpan.');
        return;
      }
      if (confirm('Apakah Anda yakin ingin menghapus semua ' + list.length + ' foto kustom yang diunggah?')) {
        list.forEach(c => localStorage.removeItem('wh_photo_' + c));
        localStorage.removeItem('wh_custom_photos_list');
        renderMasterTable();
        renderCustomPhotoStats();
        if (selectedMaterial) inspectMaterialByCode(selectedMaterial.materialCode);
        alert('Seluruh foto kustom berhasil dibersihkan!');
      }
    }

    function handleManualScanSubmit() {
      const val = document.getElementById('manual-scan-input').value;
      if (!val) return;
      inspectMaterialByCode(val);
    }

    // Photo Modal Zoom
    function openPhotoModal() {
      if (!selectedMaterial) return;
      document.getElementById('photo-zoom-title').textContent = selectedMaterial.description;
      document.getElementById('photo-zoom-code').textContent = 'KODE: ' + selectedMaterial.materialCode;
      document.getElementById('photo-zoom-img').src = getMaterialPhotoSrc(selectedMaterial.materialCode);
      document.getElementById('modal-photo-zoom').classList.remove('hidden');
    }

    // Scan Mode Switcher (Kamera, File QR, atau Unggah Foto Material Baru)
    function setScanMode(mode) {
      const boxCam = document.getElementById('scan-camera-box');
      const boxUp = document.getElementById('scan-upload-box');
      const boxMat = document.getElementById('scan-material-photo-box');

      const tabCam = document.getElementById('tab-cam');
      const tabUp = document.getElementById('tab-up');
      const tabMat = document.getElementById('tab-mat-photo');

      [tabCam, tabUp, tabMat].forEach(t => {
        if (t) t.className = 'rounded-xl py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold transition-all text-slate-600 hover:bg-sky-50';
      });

      if (mode === 'camera') {
        boxCam.classList.remove('hidden');
        boxUp.classList.add('hidden');
        boxMat.classList.add('hidden');
        tabCam.className = 'rounded-xl py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold transition-all bg-sky-700 text-white shadow-xs';
      } else if (mode === 'upload') {
        stopCameraScan();
        boxCam.classList.add('hidden');
        boxUp.classList.remove('hidden');
        boxMat.classList.add('hidden');
        tabUp.className = 'rounded-xl py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold transition-all bg-sky-700 text-white shadow-xs';
      } else if (mode === 'mat-photo') {
        stopCameraScan();
        boxCam.classList.add('hidden');
        boxUp.classList.add('hidden');
        boxMat.classList.remove('hidden');
        tabMat.className = 'rounded-xl py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold transition-all bg-sky-700 text-white shadow-xs';
        populateMatSelectOptions();
      }
    }

    // Populate dropdown material untuk unggah foto
    function populateMatSelectOptions() {
      const sel = document.getElementById('select-mat-for-photo');
      if (!sel || sel.options.length > 1) return;
      materials.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.materialCode;
        opt.textContent = m.materialCode + ' - ' + m.description + ' (Rak: ' + m.storageLocation + ')';
        sel.appendChild(opt);
      });
      if (selectedMaterial) {
        sel.value = selectedMaterial.materialCode;
      }
    }

    let directMatPhotoDataUrl = null;

    function handleSelectMatForPhotoChange(code) {
      if (!code) return;
      inspectMaterialByCode(code);
    }

    function handleDirectMatPhotoFile(e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
          const maxDim = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round(h * (maxDim / w));
              w = maxDim;
            } else {
              w = Math.round(w * (maxDim / h));
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          directMatPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.82);

          document.getElementById('direct-mat-preview-img').src = directMatPhotoDataUrl;
          document.getElementById('direct-mat-preview-box').classList.remove('hidden');
          document.getElementById('direct-mat-photo-dropzone').classList.add('hidden');
          document.getElementById('btn-save-direct-photo').disabled = false;
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }

    function cancelDirectMatPhoto() {
      directMatPhotoDataUrl = null;
      document.getElementById('direct-mat-photo-input').value = '';
      document.getElementById('direct-mat-preview-box').classList.add('hidden');
      document.getElementById('direct-mat-photo-dropzone').classList.remove('hidden');
      document.getElementById('btn-save-direct-photo').disabled = true;
    }

    function saveDirectMaterialPhoto() {
      const sel = document.getElementById('select-mat-for-photo');
      const code = sel.value;
      if (!code) {
        alert('Silakan pilih material yang ingin diperbarui fotonya!');
        return;
      }
      if (!directMatPhotoDataUrl) {
        alert('Silakan pilih atau jepret foto material terlebih dahulu!');
        return;
      }

      try {
        localStorage.setItem('wh_photo_' + code, directMatPhotoDataUrl);

        const list = JSON.parse(localStorage.getItem('wh_custom_photos_list') || '[]');
        if (!list.includes(code)) {
          list.push(code);
          localStorage.setItem('wh_custom_photos_list', JSON.stringify(list));
        }

        inspectMaterialByCode(code);
        renderMasterTable();
        renderCustomPhotoStats();

        alert('Foto fisik baru untuk suku cadang ' + code + ' berhasil disimpan!');
        cancelDirectMatPhoto();
      } catch (err) {
        alert('Gagal menyimpan foto ke memori peramban: ' + err.message);
      }
    }

    // Camera Scan implementation via Html5Qrcode
    let html5QrCode = null;
    function startCameraScan() {
      document.getElementById('camera-placeholder').classList.add('hidden');
      document.getElementById('reader').classList.remove('hidden');
      document.getElementById('btn-start-cam').classList.add('hidden');
      document.getElementById('btn-stop-cam').classList.remove('hidden');

      if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
      }

      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          stopCameraScan();
          inspectMaterialByCode(decodedText);
        },
        () => {}
      ).catch(err => {
        alert("Akses kamera tidak diizinkan atau kamera tidak ditemukan. Gunakan tab 'Unggah File QR' atau Input Manual.");
        stopCameraScan();
      });
    }

    function stopCameraScan() {
      if (html5QrCode) {
        html5QrCode.stop().then(() => {
          html5QrCode = null;
        }).catch(() => {});
      }
      document.getElementById('camera-placeholder').classList.remove('hidden');
      document.getElementById('reader').classList.add('hidden');
      document.getElementById('btn-start-cam').classList.remove('hidden');
      document.getElementById('btn-stop-cam').classList.add('hidden');
    }

    function handleQrFileUpload(e) {
      const file = e.target.files[0];
      if (!file) return;

      const qrScanner = new Html5Qrcode("reader");
      qrScanner.scanFile(file, false)
        .then(decodedText => {
          inspectMaterialByCode(decodedText);
        })
        .catch(() => {
          alert("Kode QR tidak terdeteksi pada gambar. Pastikan gambar jelas dan tidak blur.");
        });
    }

    // Transaction Modal Logic
    let modalTxType = 'GR';
    function openTransactionModalForCurrent(type) {
      if (!selectedMaterial) return;
      modalTxType = type;
      setModalTxType(type);
      document.getElementById('tx-mat-name').textContent = selectedMaterial.materialCode + ' - ' + selectedMaterial.description;
      document.getElementById('tx-mat-current').textContent = Number(selectedMaterial.currentStock).toLocaleString('id-ID') + ' ' + selectedMaterial.uom;
      document.getElementById('tx-qty').value = '';
      document.getElementById('tx-ref').value = '';
      document.getElementById('tx-notes').value = '';
      calculateTxPreview();
      document.getElementById('modal-transaction').classList.remove('hidden');
    }

    function setModalTxType(type) {
      modalTxType = type;
      const btnGR = document.getElementById('btn-tx-gr');
      const btnGI = document.getElementById('btn-tx-gi');
      if (type === 'GR') {
        btnGR.className = 'rounded-xl py-2 font-bold border border-sky-600 bg-sky-50 text-sky-900 text-xs';
        btnGI.className = 'rounded-xl py-2 font-bold border border-slate-200 text-slate-600 text-xs';
      } else {
        btnGI.className = 'rounded-xl py-2 font-bold border border-rose-600 bg-rose-50 text-rose-900 text-xs';
        btnGR.className = 'rounded-xl py-2 font-bold border border-slate-200 text-slate-600 text-xs';
      }
      calculateTxPreview();
    }

    function calculateTxPreview() {
      if (!selectedMaterial) return;
      const qty = parseFloat(document.getElementById('tx-qty').value) || 0;
      const cur = Number(selectedMaterial.currentStock) || 0;
      const sim = modalTxType === 'GR' ? cur + qty : cur - qty;

      const simVal = document.getElementById('tx-sim-val');
      simVal.textContent = cur + ' ' + (modalTxType === 'GR' ? '+' : '-') + ' ' + qty + ' = ' + sim + ' ' + selectedMaterial.uom;

      if (modalTxType === 'GI' && qty > cur) {
        simVal.textContent += ' ⚠️ Melebihi Stok!';
        simVal.className = 'text-rose-600 font-bold';
      } else {
        simVal.className = 'text-sky-900 font-bold';
      }
    }

    function submitTransaction() {
      if (!selectedMaterial) return;
      const qty = parseFloat(document.getElementById('tx-qty').value) || 0;
      if (qty <= 0) {
        alert('Kuantitas wajib lebih besar dari 0!');
        return;
      }

      const cur = Number(selectedMaterial.currentStock) || 0;
      if (modalTxType === 'GI' && qty > cur) {
        alert('Kuantitas pengeluaran melebihi saldo fisik saat ini!');
        return;
      }

      const newBal = modalTxType === 'GR' ? cur + qty : cur - qty;
      selectedMaterial.currentStock = newBal;

      const newTx = {
        id: 'tx-offline-' + Date.now(),
        transactionNumber: 'TR-' + modalTxType + '-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000),
        materialId: selectedMaterial.id,
        transactionType: modalTxType,
        quantity: qty,
        previousBalance: cur,
        newBalance: newBal,
        referenceNumber: document.getElementById('tx-ref').value || null,
        remarks: document.getElementById('tx-notes').value || 'Pencatatan QR',
        transactionDate: new Date().toISOString(),
        material: {
          materialCode: selectedMaterial.materialCode,
          description: selectedMaterial.description,
          uom: selectedMaterial.uom,
          storageLocation: selectedMaterial.storageLocation,
          category: selectedMaterial.category
        }
      };

      transactions.unshift(newTx);
      saveState();

      // Refresh inspect view
      inspectMaterialByCode(selectedMaterial.materialCode);
      closeModal('modal-transaction');
      alert('Transaksi ' + modalTxType + ' berhasil dicatat! Saldo baru: ' + newBal + ' ' + selectedMaterial.uom);
    }

    // Label Print Generator via QRCode.js
    function openLabelPrintForCurrent() {
      if (!selectedMaterial) return;
      document.getElementById('print-mat-code').textContent = selectedMaterial.materialCode;
      document.getElementById('print-mat-desc').textContent = selectedMaterial.description;
      document.getElementById('print-mat-loc').textContent = selectedMaterial.storageLocation;
      document.getElementById('print-mat-uom').textContent = selectedMaterial.uom;

      const qrContainer = document.getElementById('qrcode-container');
      qrContainer.innerHTML = '';
      new QRCode(qrContainer, {
        text: 'QR-' + selectedMaterial.materialCode,
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      });

      document.getElementById('modal-label').classList.remove('hidden');
    }

    function closeModal(id) {
      document.getElementById(id).classList.add('hidden');
    }

    // Reset Data ke Kondisi Awal Excel
    function resetDataDefault() {
      if (confirm('Apakah Anda yakin ingin mereset seluruh data ke 52 Master Material & 252 Transaksi Asli dari Excel?')) {
        materials = JSON.parse(JSON.stringify(RAW_MATERIALS));
        transactions = JSON.parse(JSON.stringify(RAW_TRANSACTIONS));
        saveState();
        alert('Data berhasil direset ke kondisi default pabrik (52 Material & 252 Transaksi)!');
        if (selectedMaterial) {
          inspectMaterialByCode(selectedMaterial.materialCode);
        }
      }
    }

    // Unduh File Mandiri index.html
    function downloadSelfHtml() {
      const htmlContent = '<!DOCTYPE html>\\n' + document.documentElement.outerHTML;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // Real-time Clock
    function updateClock() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour12: false });
      const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      
      const timeEl = document.getElementById('sidebar-time');
      const dateEl = document.getElementById('sidebar-date');
      const dTimeEl = document.getElementById('drawer-time');
      const dDateEl = document.getElementById('drawer-date');
      
      if (timeEl) timeEl.textContent = timeStr;
      if (dateEl) dateEl.textContent = dateStr;
      if (dTimeEl) dTimeEl.textContent = timeStr;
      if (dDateEl) dDateEl.textContent = dateStr;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Mini Calendar Logic
    let calDate = new Date();
    function renderCalendar() {
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const y = calDate.getFullYear();
      const m = calDate.getMonth();
      const labelEl = document.getElementById('calendar-month-year');
      if (labelEl) labelEl.textContent = monthNames[m] + ' ' + y;

      const firstDay = new Date(y, m, 1).getDay();
      const totalDays = new Date(y, m + 1, 0).getDate();
      const prevDays = new Date(y, m, 0).getDate();

      const container = document.getElementById('calendar-days');
      if (!container) return;
      container.innerHTML = '';

      const today = new Date();
      const isCurMonth = today.getFullYear() === y && today.getMonth() === m;

      for (let i = firstDay - 1; i >= 0; i--) {
        const d = prevDays - i;
        container.innerHTML += \`<div class="h-6 flex items-center justify-center text-slate-500/50">\${d}</div>\`;
      }

      for (let d = 1; d <= totalDays; d++) {
        const isToday = isCurMonth && today.getDate() === d;
        const cls = isToday 
          ? 'bg-sky-500 text-white font-extrabold ring-1 ring-sky-300 rounded shadow-sm'
          : 'text-slate-200 hover:bg-sky-800/60 rounded';
        container.innerHTML += \`<div class="h-6 flex items-center justify-center font-semibold cursor-pointer \${cls}">\${d}</div>\`;
      }
    }

    function prevMonth() {
      calDate.setMonth(calDate.getMonth() - 1);
      renderCalendar();
    }
    function nextMonth() {
      calDate.setMonth(calDate.getMonth() + 1);
      renderCalendar();
    }

    // Init App
    saveState();
    renderCalendar();
    renderCustomPhotoStats();
  </script>
</body>
</html>`;

  fs.writeFileSync("index.html", html, "utf-8");
  fs.writeFileSync("public/index.html", html, "utf-8");
  fs.writeFileSync("dist_netlify/index.html", html, "utf-8");
  console.log("Successfully generated index.html, public/index.html, and dist_netlify/index.html!");
  await prisma.$disconnect();
}

generate().catch(console.error);
