const fs = require("fs");
const path = require("path");

const rawData = JSON.parse(fs.readFileSync("temp_data.json", "utf-8"));
const materialsJson = JSON.stringify(rawData.materials);
const transactionsJson = JSON.stringify(rawData.transactions);

const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Warehouse Inventory System | Standalone Offline & Online</title>
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
            marquee: 'marquee 40s linear infinite',
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

  <!-- TOP RUNNING TEXT TICKER -->
  <div class="relative flex items-center border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50/80 px-4 py-2 text-xs shadow-xs overflow-hidden select-none">
    <div class="relative z-10 flex shrink-0 items-center gap-2 rounded-xl bg-sky-600 px-3 py-1 font-extrabold text-white shadow-sm ring-2 ring-sky-200">
      <div class="flex h-5 w-5 items-center justify-center rounded-lg bg-sky-700 text-white">
        <!-- Warehouse Icon Animated -->
        <svg class="h-3.5 w-3.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 7v14M21 7v14M6 21V11M18 21V11M6 11l6-4 6 4M6 11h12M10 21v-5h4v5" />
        </svg>
      </div>
      <span class="text-[10px] tracking-wider uppercase">INFO GUDANG</span>
    </div>

    <div class="relative ml-3 flex flex-1 overflow-hidden">
      <div class="animate-marquee flex items-center gap-8 text-slate-700 font-medium whitespace-nowrap">
        <span class="flex items-center gap-2 text-xs">
          <span class="rounded bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 text-[9px]">STANDALONE</span>
          Format HTML Mandiri: Siap Digunakan Secara Offline Maupun Daring (Host Bebas di GitHub / Netlify)
        </span>
        <span class="text-slate-300 font-bold">&bull;</span>
        <span class="flex items-center gap-2 text-xs">
          <span class="rounded bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 text-[9px]">SOP SCAN</span>
          Seluruh mutasi Barang Masuk (GR) dan Barang Keluar (GI) wajib tercatat dengan scan QR Code Bin Card
        </span>
        <span class="text-slate-300 font-bold">&bull;</span>
        <span class="flex items-center gap-2 text-xs">
          <span class="rounded bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 text-[9px]">AKURASI</span>
          Validasi saldo fisik terhitung otomatis secara instan untuk memastikan 0% selisih stok
        </span>
        <span class="text-slate-300 font-bold">&bull;</span>
        <span class="flex items-center gap-2 text-xs">
          <span class="rounded bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 text-[9px]">STOCK OPNAME</span>
          Jadwal pemeriksaan rutin fisik kartu bin card dilaksanakan pada setiap akhir periode
        </span>
        <span class="text-slate-300 font-bold">&bull;</span>
        <span class="flex items-center gap-2 text-xs">
          <span class="rounded bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 text-[9px]">FASILITAS</span>
          PT Muaratoyu Subur Lestari &bull; Central Digital Warehouse 2.0
        </span>
        <span class="text-slate-300 font-bold">&bull;</span>
      </div>
    </div>
  </div>

  <div class="flex flex-1 overflow-hidden">
    <!-- SIDEBAR -->
    <aside id="sidebar" class="fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-gradient-to-b from-[#0B2545] via-[#103158] to-[#091D33] text-white shadow-2xl transition-transform duration-300 -translate-x-full lg:static lg:translate-x-0">
      <!-- Sidebar Header / Logo -->
      <div class="flex h-20 items-center justify-between border-b border-sky-900/60 px-6">
        <div class="flex items-center gap-3">
          <div class="group flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-400 text-white shadow-lg shadow-sky-950/40">
            <!-- Animated Warehouse Icon -->
            <svg class="h-6 w-6 stroke-[2.2] animate-float-slow transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 7v14M21 7v14M6 21V11M18 21V11M6 11l6-4 6 4M6 11h12M10 21v-5h4v5" />
            </svg>
          </div>
          <div>
            <div class="text-[11px] font-bold tracking-wider text-sky-300 uppercase">
              PT Muaratoyu Subur Lestari
            </div>
            <div class="text-base font-extrabold tracking-tight text-white">
              Warehouse System
            </div>
          </div>
        </div>

        <button onclick="toggleSidebar()" class="rounded-lg p-1.5 text-sky-200 hover:bg-sky-800/60 lg:hidden">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Sub-brand Banner -->
      <div className="mx-4 mt-3 rounded-xl border border-sky-700/40 bg-sky-900/30 p-2.5 text-xs text-sky-100">
        <div class="flex items-center gap-1.5 font-bold text-sky-300 text-[11px]">
          <span class="h-2 w-2 rounded-full bg-sky-400 animate-pulse"></span>
          DIGITAL BIN CARD 2.0 (OFFLINE & ONLINE)
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 space-y-1 overflow-y-auto px-4 py-3">
        <div class="px-3 pb-1 text-[10px] font-bold tracking-wider text-sky-300/70 uppercase">
          Menu Operasional
        </div>

        <button onclick="switchView('dashboard')" id="nav-dashboard" class="nav-btn w-full group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all bg-white text-sky-950 shadow-md">
          <div class="flex items-center gap-3">
            <svg class="h-4 w-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            <span>Dashboard Monitoring</span>
          </div>
          <span class="rounded-full bg-sky-100 px-2 py-0.5 text-[9px] font-bold uppercase text-sky-800">Live</span>
        </button>

        <button onclick="switchView('scan')" id="nav-scan" class="nav-btn w-full group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium text-sky-100 hover:bg-sky-800/50 hover:text-white transition-all">
          <div class="flex items-center gap-3">
            <svg class="h-4 w-4 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
            <span>Scan QR Code Bin Card</span>
          </div>
        </button>

        <button onclick="switchView('materials')" id="nav-materials" class="nav-btn w-full group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium text-sky-100 hover:bg-sky-800/50 hover:text-white transition-all">
          <div class="flex items-center gap-3">
            <svg class="h-4 w-4 text-sky-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            <span>Master Data Material</span>
          </div>
        </button>

        <button onclick="switchView('transactions')" id="nav-transactions" class="nav-btn w-full group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium text-sky-100 hover:bg-sky-800/50 hover:text-white transition-all">
          <div class="flex items-center gap-3">
            <svg class="h-4 w-4 text-sky-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Riwayat Transaksi (GR/GI)</span>
          </div>
        </button>

        <button onclick="switchView('settings')" id="nav-settings" class="nav-btn w-full group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium text-sky-100 hover:bg-sky-800/50 hover:text-white transition-all">
          <div class="flex items-center gap-3">
            <svg class="h-4 w-4 text-sky-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>Pengaturan Sistem</span>
          </div>
        </button>

        <!-- KALENDER & WAKTU TEPAT DIBAWAH FITUR PENGATURAN SISTEM -->
        <div class="mt-4 pt-3 border-t border-sky-800/40">
          <div class="rounded-2xl border border-sky-800/60 bg-gradient-to-b from-sky-950/70 to-[#0A1F36] p-3 text-white shadow-inner">
            <div class="flex items-center justify-between border-b border-sky-800/50 pb-2">
              <div class="flex items-center gap-1.5">
                <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  <!-- Warehouse Icon Animated -->
                  <svg class="h-3.5 w-3.5 animate-pulse-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 7v14M21 7v14M6 21V11M18 21V11M6 11l6-4 6 4M6 11h12M10 21v-5h4v5" />
                  </svg>
                </div>
                <div class="text-[10px] font-bold text-sky-300 uppercase tracking-wider">
                  Waktu Gudang
                </div>
              </div>
              <div class="flex items-center gap-1 rounded bg-sky-900/80 px-1.5 py-0.5 text-[10px] font-mono font-bold text-sky-200">
                <span class="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                <span id="sidebar-clock">12:00:00 WIB</span>
              </div>
            </div>

            <!-- Mini Calendar View -->
            <div class="mt-2 flex items-center justify-between px-1">
              <span id="calendar-month-year" class="text-xs font-bold text-white tracking-wide">November 2026</span>
              <div class="flex items-center gap-1">
                <button onclick="prevMonth()" class="rounded p-0.5 text-sky-300 hover:bg-sky-800/60 hover:text-white">&lt;</button>
                <button onclick="todayMonth()" class="rounded px-1 text-[9px] font-bold uppercase text-sky-300 hover:bg-sky-800/60">Hari Ini</button>
                <button onclick="nextMonth()" class="rounded p-0.5 text-sky-300 hover:bg-sky-800/60 hover:text-white">&gt;</button>
              </div>
            </div>

            <div class="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-sky-300/70">
              <span class="text-rose-400">M</span><span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span>
            </div>
            <div id="calendar-days" class="mt-1 grid grid-cols-7 gap-1 text-[10px]">
              <!-- Generated dynamically -->
            </div>
          </div>
        </div>
      </nav>

      <!-- Bottom User Role Badge -->
      <div class="border-t border-sky-900/60 p-3">
        <div class="flex items-center gap-2.5 rounded-xl bg-sky-950/50 p-2.5 border border-sky-900/40">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-800 text-sky-200 font-bold text-xs">
            PG
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-[10px] font-medium text-sky-300 truncate">Hak Akses</div>
            <div class="text-xs font-bold text-white uppercase">Admin Gudang</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- MAIN CONTENT AREA -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- TOPBAR -->
      <header class="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-sky-100 bg-white/95 px-4 backdrop-blur-md sm:px-6">
        <div class="flex items-center gap-3">
          <button onclick="toggleSidebar()" class="rounded-lg p-2 text-slate-600 hover:bg-sky-50 lg:hidden">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-sky-700">
              <svg class="h-3.5 w-3.5 text-sky-600 animate-pulse-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M3 7v14M21 7v14M6 21V11M18 21V11M6 11l6-4 6 4M6 11h12M10 21v-5h4v5"/></svg>
              <span>PT Muaratoyu Subur Lestari &bull; Central Digital Warehouse</span>
            </div>
            <h1 id="view-title" class="text-lg font-bold text-slate-900 sm:text-xl">Dashboard Monitoring Persediaan</h1>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Button Download index.html -->
          <button onclick="downloadSelfHtml()" class="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:from-sky-700 hover:to-blue-700 transition-all hover:scale-105 active:scale-95">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            <span>Download index.html</span>
          </button>

          <!-- Real-Time status pill -->
          <div class="hidden items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs sm:flex">
            <span class="h-2 w-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span class="font-medium text-slate-700">Standalone Siap Pakai</span>
          </div>
        </div>
      </header>

      <!-- VIEW CONTAINER -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div class="mx-auto max-w-7xl">

          <!-- VIEW: DASHBOARD -->
          <div id="view-dashboard" class="space-y-6">
            <!-- Top Banner with Animated Warehouse Status -->
            <div class="relative overflow-hidden flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-[#0369A1] via-[#0284C7] to-[#38BDF8] p-7 text-white shadow-sm md:flex-row md:items-center md:justify-between">
              <div class="relative z-10">
                <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-100">
                  <span class="flex h-2.5 w-2.5 rounded-full bg-sky-200 animate-pulse"></span>
                  General Warehouse Monitoring Dashboard
                </div>
                <h2 class="mt-1.5 text-xl font-black sm:text-2xl lg:text-3xl">
                  Sistem Inventaris Pergudangan Digital
                </h2>
                <p class="mt-1 text-xs text-sky-100/90 max-w-xl">
                  Monitoring mutasi fisik suku cadang, pelumas mesin, perlengkapan operasional, dan material persediaan secara real-time berbasis QR Code.
                </p>
              </div>

              <div class="relative z-10 flex items-center gap-3">
                <div class="hidden lg:flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-md border border-white/20">
                  <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm">
                    <svg class="h-5 w-5 stroke-[2.2] animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M3 7v14M21 7v14M6 21V11M18 21V11M6 11l6-4 6 4M6 11h12M10 21v-5h4v5" /></svg>
                  </div>
                  <div class="text-left">
                    <div class="text-[10px] font-bold uppercase text-sky-200">Status Fasilitas</div>
                    <div class="text-xs font-black text-white">Gudang Sentral Aktif</div>
                  </div>
                </div>

                <button onclick="switchView('scan')" class="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-sky-800 shadow-md hover:bg-sky-50 transition-all hover:scale-105">
                  <svg class="h-4 w-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
                  <span>Scan Bin Card</span>
                </button>
              </div>
            </div>

            <!-- KPI CARDS -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <div class="card-hover-fx rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                <span class="text-[11px] font-bold text-slate-500 uppercase">Jenis Material</span>
                <div id="kpi-total-items" class="mt-2 text-2xl font-black text-slate-900">52</div>
                <div class="mt-2 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded w-max">Katalog Aktif</div>
              </div>

              <div class="card-hover-fx rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                <span class="text-[11px] font-bold text-slate-500 uppercase">Total Fisik Stok</span>
                <div id="kpi-total-stock" class="mt-2 text-2xl font-black text-slate-900">0</div>
                <div class="mt-2 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded w-max">Akumulasi Unit</div>
              </div>

              <div class="card-hover-fx rounded-2xl border border-sky-200 bg-white p-4 shadow-sm">
                <span class="text-[11px] font-bold text-slate-500 uppercase">Barang Masuk (GR)</span>
                <div id="kpi-gr-count" class="mt-2 text-2xl font-black text-slate-900">0</div>
                <div class="mt-2 text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded w-max">Penerimaan</div>
              </div>

              <div class="card-hover-fx rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
                <span class="text-[11px] font-bold text-slate-500 uppercase">Barang Keluar (GI)</span>
                <div id="kpi-gi-count" class="mt-2 text-2xl font-black text-slate-900">0</div>
                <div class="mt-2 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded w-max">Pengeluaran</div>
              </div>

              <div class="card-hover-fx rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
                <span class="text-[11px] font-bold text-slate-500 uppercase">Stok Minimum</span>
                <div id="kpi-low-stock" class="mt-2 text-2xl font-black text-slate-900">0</div>
                <div class="mt-2 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded w-max">Perlu Atensi</div>
              </div>

              <div class="card-hover-fx rounded-2xl border border-rose-200 bg-white p-4 shadow-sm">
                <span class="text-[11px] font-bold text-slate-500 uppercase">Stok Kosong</span>
                <div id="kpi-empty-stock" class="mt-2 text-2xl font-black text-slate-900">0</div>
                <div class="mt-2 text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded w-max">Saldo 0</div>
              </div>
            </div>

            <!-- Quick Material Table on Dashboard -->
            <div class="card-hover-fx rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-sky-50 pb-4">
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Pencarian Cepat Material & Transaksi Fisik</h3>
                  <p class="text-xs text-slate-500">Pilih material untuk melihat detail foto, cetak label, atau catat GR/GI</p>
                </div>
                <div class="w-full sm:w-72">
                  <input type="text" id="dash-search" oninput="renderDashboardTable()" placeholder="Cari kode atau nama material..." class="w-full rounded-xl border border-sky-100 bg-sky-50/50 py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                </div>
              </div>

              <div class="overflow-x-auto mt-3">
                <table class="w-full text-left text-xs">
                  <thead class="bg-sky-50/60 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th class="py-2.5 px-3">Kode Material</th>
                      <th class="py-2.5 px-3">Deskripsi Suku Cadang</th>
                      <th class="py-2.5 px-3">Kategori</th>
                      <th class="py-2.5 px-3">Lokasi Rak</th>
                      <th class="py-2.5 px-3 text-right">Saldo Stok</th>
                      <th class="py-2.5 px-3 text-center">Status</th>
                      <th class="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody id="dash-table-body" class="divide-y divide-slate-100 text-slate-700">
                    <!-- Populated by JS -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- VIEW: SCAN QR CODE -->
          <div id="view-scan" class="hidden space-y-6">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div class="lg:col-span-7 space-y-4">
                <!-- Tab Selector -->
                <div class="flex items-center gap-2 rounded-2xl border border-sky-100 bg-white p-1.5 shadow-sm">
                  <button onclick="setScanMode('camera')" id="tab-cam" class="flex-1 rounded-xl py-2.5 text-xs font-bold transition-all bg-sky-700 text-white">📷 Kamera Langsung</button>
                  <button onclick="setScanMode('upload')" id="tab-up" class="flex-1 rounded-xl py-2.5 text-xs font-bold transition-all text-slate-600 hover:bg-sky-50">📁 Unggah Foto QR</button>
                </div>

                <!-- Camera Box -->
                <div id="scan-camera-box" class="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm text-center">
                  <div class="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-2xl border-2 border-dashed border-sky-400 bg-slate-950 flex items-center justify-center">
                    <div id="reader" class="w-full h-full hidden"></div>
                    <div id="camera-placeholder" class="p-6 text-slate-400">
                      <svg class="h-12 w-12 mx-auto text-sky-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      <span class="text-xs font-bold text-slate-200">Kamera Scanner QR</span>
                      <p class="text-[11px] text-slate-400 mt-1">Arahkan kamera ke barcode label Bin Card pada rak</p>
                    </div>
                  </div>
                  <div class="mt-4 flex justify-center gap-2">
                    <button onclick="startCameraScan()" id="btn-start-cam" class="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700">Mulai Kamera</button>
                    <button onclick="stopCameraScan()" id="btn-stop-cam" class="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 hidden">Tutup Kamera</button>
                  </div>
                </div>

                <!-- Upload Foto QR Box -->
                <div id="scan-upload-box" class="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm text-center hidden">
                  <div onclick="document.getElementById('qr-file-input').click()" class="cursor-pointer aspect-video w-full max-w-sm mx-auto flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/40 p-6 hover:bg-sky-50">
                    <svg class="h-10 w-10 text-sky-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    <span class="text-xs font-bold text-slate-800">Klik untuk Pilih Foto QR</span>
                    <span class="text-[10px] text-slate-500 mt-0.5">Mendukung file gambar dari galeri smartphone / komputer</span>
                  </div>
                  <input type="file" id="qr-file-input" accept="image/*" class="hidden" onchange="handleQrFileUpload(event)" />
                </div>
              </div>

              <!-- Side Column: Manual Fallback & Material Detail View -->
              <div class="lg:col-span-5 space-y-4">
                <div class="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
                  <h4 class="text-xs font-bold text-slate-800 mb-2">Input Manual Kode / QR:</h4>
                  <div class="flex gap-2">
                    <input type="text" id="manual-scan-input" placeholder="Contoh: 202040992 atau QR-202040992" class="w-full rounded-xl border border-sky-100 bg-sky-50/50 px-3 py-2 text-xs uppercase focus:outline-none" />
                    <button onclick="handleManualScanSubmit()" class="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shrink-0 hover:bg-sky-700">Cari</button>
                  </div>
                  <div class="mt-3">
                    <span class="text-[10px] text-slate-400 font-bold block mb-1">Shortcut Contoh Demo:</span>
                    <div class="flex flex-wrap gap-1.5">
                      <button onclick="inspectMaterialByCode('202040992')" class="rounded bg-sky-50 text-sky-800 font-mono text-[10px] font-bold px-2 py-0.5 border border-sky-200">202040992</button>
                      <button onclick="inspectMaterialByCode('202041139')" class="rounded bg-sky-50 text-sky-800 font-mono text-[10px] font-bold px-2 py-0.5 border border-sky-200">202041139</button>
                      <button onclick="inspectMaterialByCode('212043651')" class="rounded bg-sky-50 text-sky-800 font-mono text-[10px] font-bold px-2 py-0.5 border border-sky-200">212043651</button>
                    </div>
                  </div>
                </div>

                <!-- Inspected Material Panel -->
                <div id="scan-result-card" class="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm hidden">
                  <div class="flex items-center justify-between border-b border-sky-50 pb-2 mb-3">
                    <span id="inspect-code" class="rounded bg-sky-100 text-sky-900 font-mono text-xs font-black px-2 py-0.5">202040992</span>
                    <span id="inspect-badge" class="rounded-full px-2 py-0.5 text-[10px] font-black uppercase bg-sky-100 text-sky-800">Aman</span>
                  </div>

                  <h3 id="inspect-desc" class="text-sm font-black text-slate-900 leading-snug">PUMP ASSY OIL</h3>
                  
                  <!-- Current Stock Display -->
                  <div class="mt-3 rounded-xl bg-sky-50/80 p-3 border border-sky-100">
                    <div class="text-[10px] font-bold uppercase text-slate-500">Saldo Fisik Terkini</div>
                    <div class="text-3xl font-black text-slate-900 mt-1">
                      <span id="inspect-stock">0</span> <span id="inspect-uom" class="text-sm font-bold text-slate-500">PCS</span>
                    </div>
                    <div class="text-[11px] text-slate-600 mt-1">
                      Lokasi Rak: <strong id="inspect-loc">R-01-A</strong> &bull; Min: <span id="inspect-min">0</span>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="mt-4 grid grid-cols-2 gap-2">
                    <button onclick="openTransactionModalForCurrent('GR')" class="rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-700">Barang Masuk (GR)</button>
                    <button onclick="openTransactionModalForCurrent('GI')" class="rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700">Barang Keluar (GI)</button>
                  </div>
                  <button onclick="openLabelPrintForCurrent()" class="mt-2 w-full rounded-xl border border-sky-200 bg-white py-2 text-xs font-bold text-sky-800 hover:bg-sky-50">Cetak Label Bin Card QR</button>
                </div>
              </div>
            </div>
          </div>

          <!-- VIEW: MASTER MATERIAL -->
          <div id="view-materials" class="hidden space-y-6">
            <div class="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-sky-50 pb-4">
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Katalog Master Material & Suku Cadang (52 Item)</h3>
                  <p class="text-xs text-slate-500">Daftar lengkap material operasional gudang dari database Excel</p>
                </div>
                <div class="flex gap-2">
                  <input type="text" id="mat-search" oninput="renderMasterTable()" placeholder="Cari material..." class="rounded-xl border border-sky-100 bg-sky-50/50 py-1.5 px-3 text-xs focus:bg-white focus:outline-none" />
                </div>
              </div>

              <div class="overflow-x-auto mt-4">
                <table class="w-full text-left text-xs">
                  <thead class="bg-sky-50/60 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th class="py-2.5 px-3">No</th>
                      <th class="py-2.5 px-3">Kode Material</th>
                      <th class="py-2.5 px-3">Deskripsi</th>
                      <th class="py-2.5 px-3">Kategori</th>
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
          <div id="view-transactions" class="hidden space-y-6">
            <div class="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
              <div class="border-b border-sky-50 pb-3 mb-3">
                <h3 class="text-sm font-bold text-slate-900">Riwayat Mutasi Fisik Bin Card (GR / GI)</h3>
                <p class="text-xs text-slate-500">Catatan transaksi penerimaan dan pengeluaran barang</p>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-sky-50/60 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th class="py-2.5 px-3">Waktu</th>
                      <th class="py-2.5 px-3">No. Transaksi</th>
                      <th class="py-2.5 px-3">Kode & Nama Material</th>
                      <th class="py-2.5 px-3 text-center">Jenis</th>
                      <th class="py-2.5 px-3 text-right">Kuantitas</th>
                      <th class="py-2.5 px-3 text-right">Saldo Akhir</th>
                      <th class="py-2.5 px-3">Dokumen / Catatan</th>
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
          <div id="view-settings" class="hidden space-y-6 max-w-4xl">
            <div class="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm space-y-4">
              <div class="flex items-center gap-2 border-b border-sky-50 pb-3">
                <svg class="h-5 w-5 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <h3 class="text-sm font-bold text-slate-900">Pengaturan Sistem Standalone</h3>
              </div>
              <p class="text-xs text-slate-600">
                Aplikasi ini dikemas dalam format <code>index.html</code> mandiri (self-contained). Seluruh data transaksi dan stok tersimpan secara lokal di <code>localStorage</code> peramban Anda dan tidak akan hilang saat dimuat ulang.
              </p>
              <div class="flex gap-3">
                <button onclick="downloadSelfHtml()" class="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700">💾 Download Salinan index.html Ini</button>
                <button onclick="resetDataDefault()" class="rounded-xl border border-rose-200 text-rose-700 px-4 py-2 text-xs font-semibold hover:bg-rose-50">Reset ke Data Default</button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>

  <!-- MODAL TRANSAKSI GR / GI -->
  <div id="modal-transaction" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm hidden">
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 id="tx-modal-title" class="text-sm font-bold text-slate-900">Form Pencatatan Transaksi Bin Card</h4>
        <button onclick="closeModal('modal-transaction')" class="text-slate-400 hover:text-slate-600">&times;</button>
      </div>

      <div class="mt-4 space-y-3 text-xs">
        <div class="rounded-xl bg-sky-50 p-3 border border-sky-100">
          <div class="font-bold text-slate-900" id="tx-mat-name">-</div>
          <div class="text-slate-500 text-[11px]">Saldo Saat Ini: <strong id="tx-mat-current" class="text-slate-800">0</strong></div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Jenis Transaksi</label>
          <div class="grid grid-cols-2 gap-2">
            <button type="button" id="btn-tx-gr" onclick="setModalTxType('GR')" class="rounded-xl py-2 font-bold border border-sky-600 bg-sky-50 text-sky-900">MASUK (GR)</button>
            <button type="button" id="btn-tx-gi" onclick="setModalTxType('GI')" class="rounded-xl py-2 font-bold border border-slate-200 text-slate-600">KELUAR (GI)</button>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Jumlah Kuantitas <span class="text-rose-500">*</span></label>
          <input type="number" id="tx-qty" step="any" min="0.01" oninput="calculateTxPreview()" placeholder="Masukkan jumlah" class="w-full rounded-xl border border-sky-100 bg-slate-50 py-2 px-3 text-sm font-bold focus:bg-white focus:outline-none" />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Nomor Dokumen (Surat Jalan / PO / SPB)</label>
          <input type="text" id="tx-ref" placeholder="Contoh: SJ-2026-881 atau SPB-004" class="w-full rounded-xl border border-sky-100 bg-slate-50 py-2 px-3 text-xs focus:bg-white focus:outline-none" />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Catatan Transaksi</label>
          <input type="text" id="tx-notes" placeholder="Contoh: Penggantian sparepart unit operasional" class="w-full rounded-xl border border-sky-100 bg-slate-50 py-2 px-3 text-xs focus:bg-white focus:outline-none" />
        </div>

        <!-- Simulation Preview -->
        <div id="tx-sim-box" class="rounded-xl bg-slate-100 p-2.5 text-center text-xs font-semibold text-slate-700">
          Simulasi Saldo: <span id="tx-sim-val">-</span>
        </div>
      </div>

      <div class="mt-5 flex justify-end gap-2">
        <button onclick="closeModal('modal-transaction')" class="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
        <button onclick="submitTransaction()" id="btn-submit-tx" class="rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700">Simpan Transaksi</button>
      </div>
    </div>
  </div>

  <!-- MODAL CETAK LABEL BIN CARD -->
  <div id="modal-label" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto hidden">
    <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
        <h4 class="text-sm font-bold text-slate-900">Preview Label Bin Card</h4>
        <button onclick="closeModal('modal-label')" class="text-slate-400 hover:text-slate-600">&times;</button>
      </div>

      <!-- Printable area -->
      <div class="my-4 flex justify-center">
        <div class="bin-card-print-container border-2 border-slate-900 bg-white p-4 text-slate-900 rounded-xl w-72 text-center">
          <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-2">
            <span class="text-[9px] font-black uppercase text-sky-800">PT MUARATOYU SUBUR LESTARI</span>
            <span class="bg-slate-900 text-white text-[8px] font-bold px-1 rounded">BIN CARD</span>
          </div>
          <div class="text-[10px] font-bold text-slate-600">LOKASI: <span id="lbl-loc" class="text-slate-900 font-black">R-01-A</span></div>
          <div id="lbl-code" class="text-base font-black tracking-wide mt-1">202040992</div>
          <div id="lbl-desc" class="text-[11px] font-bold text-slate-700 line-clamp-2">PUMP ASSY OIL</div>

          <div id="lbl-qrcode" class="my-3 flex justify-center"></div>

          <div class="rounded-full bg-sky-100 text-sky-900 text-[9px] font-black py-0.5 uppercase tracking-wider">SCAN TO UPDATE STOCK</div>
          <div id="lbl-token" class="font-mono text-[9px] text-slate-400 mt-1">QR-202040992</div>
        </div>
      </div>

      <div class="flex justify-end gap-2 no-print">
        <button onclick="closeModal('modal-label')" class="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">Tutup</button>
        <button onclick="window.print()" class="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700">Cetak Dokumen</button>
      </div>
    </div>
  </div>

  <!-- JAVASCRIPT LOGIC & LOCALSTORAGE DATABASE -->
  <script>
    // Inisialisasi Data
    const RAW_MATERIALS = ${materialsJson};
    const RAW_TRANSACTIONS = ${transactionsJson};

    let materials = JSON.parse(localStorage.getItem('wh_materials')) || RAW_MATERIALS;
    let transactions = JSON.parse(localStorage.getItem('wh_transactions')) || RAW_TRANSACTIONS;

    function saveState() {
      localStorage.setItem('wh_materials', JSON.stringify(materials));
      localStorage.setItem('wh_transactions', JSON.stringify(transactions));
      renderKPIs();
      renderDashboardTable();
      renderMasterTable();
      renderTransactionsTable();
    }

    // Switch Views
    function switchView(viewName) {
      ['dashboard', 'scan', 'materials', 'transactions', 'settings'].forEach(v => {
        document.getElementById('view-' + v).classList.add('hidden');
        const navBtn = document.getElementById('nav-' + v);
        if (navBtn) {
          navBtn.classList.remove('bg-white', 'text-sky-950', 'shadow-md', 'font-bold');
          navBtn.classList.add('text-sky-100', 'font-medium');
        }
      });

      document.getElementById('view-' + viewName).classList.remove('hidden');
      const activeNav = document.getElementById('nav-' + viewName);
      if (activeNav) {
        activeNav.classList.add('bg-white', 'text-sky-950', 'shadow-md', 'font-bold');
        activeNav.classList.remove('text-sky-100', 'font-medium');
      }

      const titles = {
        dashboard: 'Dashboard Monitoring Persediaan',
        scan: 'Scan QR Code Bin Card',
        materials: 'Master Data Material & Suku Cadang',
        transactions: 'Riwayat Transaksi Barang (GR / GI)',
        settings: 'Pengaturan Sistem Gudang'
      };
      document.getElementById('view-title').textContent = titles[viewName] || 'Digital Warehouse System';

      if (window.innerWidth < 1024) {
        document.getElementById('sidebar').classList.add('-translate-x-full');
      }
    }

    function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('-translate-x-full');
    }

    // KPIs calculation
    function renderKPIs() {
      const totalItems = materials.length;
      let totalStock = 0;
      let lowCount = 0;
      let emptyCount = 0;

      materials.forEach(m => {
        totalStock += Number(m.currentStock) || 0;
        if (m.currentStock <= 0) emptyCount++;
        else if (m.currentStock <= m.minimumStock) lowCount++;
      });

      const grCount = transactions.filter(t => t.transactionType === 'GR').length;
      const giCount = transactions.filter(t => t.transactionType === 'GI').length;

      document.getElementById('kpi-total-items').textContent = totalItems;
      document.getElementById('kpi-total-stock').textContent = Math.round(totalStock).toLocaleString('id-ID');
      document.getElementById('kpi-gr-count').textContent = grCount;
      document.getElementById('kpi-gi-count').textContent = giCount;
      document.getElementById('kpi-low-stock').textContent = lowCount;
      document.getElementById('kpi-empty-stock').textContent = emptyCount;
    }

    // Render Dashboard Table
    function renderDashboardTable() {
      const q = (document.getElementById('dash-search')?.value || '').toLowerCase();
      const filtered = materials.filter(m => 
        m.materialCode.toLowerCase().includes(q) || 
        m.description.toLowerCase().includes(q) ||
        (m.storageLocation || '').toLowerCase().includes(q)
      ).slice(0, 8);

      const tbody = document.getElementById('dash-table-body');
      tbody.innerHTML = filtered.map(m => {
        const isOut = m.currentStock <= 0;
        const isLow = m.currentStock > 0 && m.currentStock <= m.minimumStock;
        const badge = isOut 
          ? '<span class="rounded-full bg-rose-100 text-rose-800 text-[9px] font-black px-2 py-0.5">HABIS</span>'
          : isLow
          ? '<span class="rounded-full bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5">MINIMUM</span>'
          : '<span class="rounded-full bg-sky-100 text-sky-800 text-[9px] font-black px-2 py-0.5">AMAN</span>';

        return \`
          <tr class="hover:bg-sky-50/50 transition-colors">
            <td class="py-2.5 px-3 font-mono font-bold text-slate-900">\${m.materialCode}</td>
            <td class="py-2.5 px-3 font-semibold text-slate-800 max-w-xs truncate">\${m.description}</td>
            <td class="py-2.5 px-3 text-slate-500">\${m.category}</td>
            <td class="py-2.5 px-3 text-slate-600 font-semibold">\${m.storageLocation}</td>
            <td class="py-2.5 px-3 text-right font-black \${isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-sky-700'}">
              \${Number(m.currentStock).toLocaleString('id-ID')} <span class="text-[10px] font-normal text-slate-400">\${m.uom}</span>
            </td>
            <td class="py-2.5 px-3 text-center">\${badge}</td>
            <td class="py-2.5 px-3 text-right">
              <button onclick="inspectMaterialByCode('\${m.materialCode}'); switchView('scan')" class="rounded-lg bg-sky-100 text-sky-800 px-2.5 py-1 text-[11px] font-bold hover:bg-sky-200">Buka / Mutasi</button>
            </td>
          </tr>
        \`;
      }).join('');
    }

    // Render Master Table
    function renderMasterTable() {
      const q = (document.getElementById('mat-search')?.value || '').toLowerCase();
      const filtered = materials.filter(m => 
        m.materialCode.toLowerCase().includes(q) || 
        m.description.toLowerCase().includes(q)
      );

      const tbody = document.getElementById('mat-table-body');
      tbody.innerHTML = filtered.map((m, idx) => \`
        <tr class="hover:bg-sky-50/40">
          <td class="py-2.5 px-3 text-slate-400">\${idx + 1}</td>
          <td class="py-2.5 px-3 font-mono font-bold text-slate-900">\${m.materialCode}</td>
          <td class="py-2.5 px-3 font-semibold">\${m.description}</td>
          <td class="py-2.5 px-3 text-slate-500">\${m.category}</td>
          <td class="py-2.5 px-3 text-slate-600">\${m.storageLocation}</td>
          <td class="py-2.5 px-3 text-right font-black">\${Number(m.currentStock).toLocaleString('id-ID')} \${m.uom}</td>
          <td class="py-2.5 px-3 text-right text-slate-500">\${m.minimumStock} \${m.uom}</td>
          <td class="py-2.5 px-3 text-right">
            <button onclick="inspectMaterialByCode('\${m.materialCode}'); switchView('scan')" class="rounded bg-sky-100 text-sky-800 font-bold px-2 py-0.5 text-[11px]">Pilih</button>
          </td>
        </tr>
      \`).join('');
    }

    // Render Transactions Table
    function renderTransactionsTable() {
      const tbody = document.getElementById('tx-table-body');
      tbody.innerHTML = transactions.map(t => {
        const isGR = t.transactionType === 'GR';
        const dateStr = new Date(t.transactionDate).toLocaleString('id-ID');
        return \`
          <tr class="hover:bg-sky-50/40">
            <td class="py-2.5 px-3 text-slate-500">\${dateStr}</td>
            <td class="py-2.5 px-3 font-mono font-bold text-slate-900">\${t.transactionNumber}</td>
            <td class="py-2.5 px-3 font-semibold">\${t.material?.materialCode || '-'} - \${t.material?.description || ''}</td>
            <td class="py-2.5 px-3 text-center">
              <span class="rounded-full px-2 py-0.5 text-[9px] font-black \${isGR ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'}">
                \${isGR ? 'MASUK (GR)' : 'KELUAR (GI)'}
              </span>
            </td>
            <td class="py-2.5 px-3 text-right font-black \${isGR ? 'text-sky-700' : 'text-rose-600'}">
              \${isGR ? '+' : '-'}\${Number(t.quantity).toLocaleString('id-ID')}
            </td>
            <td class="py-2.5 px-3 text-right font-bold">\${Number(t.newBalance).toLocaleString('id-ID')}</td>
            <td class="py-2.5 px-3 text-slate-500">\${t.referenceNumber || ''} \${t.remarks ? '(' + t.remarks + ')' : ''}</td>
          </tr>
        \`;
      }).join('');
    }

    // Inspect Material
    let selectedMaterial = null;
    function inspectMaterialByCode(rawCode) {
      const clean = (rawCode || '').replace(/^QR-/i, '').trim().toUpperCase();
      const mat = materials.find(m => m.materialCode.toUpperCase() === clean);
      if (!mat) {
        alert('Material dengan kode "' + rawCode + '" tidak ditemukan!');
        return;
      }

      selectedMaterial = mat;
      document.getElementById('inspect-code').textContent = mat.materialCode;
      document.getElementById('inspect-desc').textContent = mat.description;
      document.getElementById('inspect-stock').textContent = Number(mat.currentStock).toLocaleString('id-ID');
      document.getElementById('inspect-uom').textContent = mat.uom;
      document.getElementById('inspect-loc').textContent = mat.storageLocation;
      document.getElementById('inspect-min').textContent = mat.minimumStock + ' ' + mat.uom;

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

      document.getElementById('scan-result-card').classList.remove('hidden');
    }

    function handleManualScanSubmit() {
      const val = document.getElementById('manual-scan-input').value;
      if (!val) return;
      inspectMaterialByCode(val);
    }

    // Scan Mode Switcher
    function setScanMode(mode) {
      if (mode === 'camera') {
        document.getElementById('scan-camera-box').classList.remove('hidden');
        document.getElementById('scan-upload-box').classList.add('hidden');
        document.getElementById('tab-cam').className = 'flex-1 rounded-xl py-2.5 text-xs font-bold transition-all bg-sky-700 text-white';
        document.getElementById('tab-up').className = 'flex-1 rounded-xl py-2.5 text-xs font-bold transition-all text-slate-600 hover:bg-sky-50';
      } else {
        stopCameraScan();
        document.getElementById('scan-camera-box').classList.add('hidden');
        document.getElementById('scan-upload-box').classList.remove('hidden');
        document.getElementById('tab-up').className = 'flex-1 rounded-xl py-2.5 text-xs font-bold transition-all bg-sky-700 text-white';
        document.getElementById('tab-cam').className = 'flex-1 rounded-xl py-2.5 text-xs font-bold transition-all text-slate-600 hover:bg-sky-50';
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
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          stopCameraScan();
          inspectMaterialByCode(decodedText);
        },
        () => {}
      ).catch(err => {
        alert("Akses kamera tidak diizinkan atau kamera tidak ditemukan. Gunakan tab 'Unggah Foto QR' atau Input Manual.");
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
        btnGR.className = 'rounded-xl py-2 font-bold border border-sky-600 bg-sky-50 text-sky-900';
        btnGI.className = 'rounded-xl py-2 font-bold border border-slate-200 text-slate-600';
      } else {
        btnGI.className = 'rounded-xl py-2 font-bold border border-rose-600 bg-rose-50 text-rose-900';
        btnGR.className = 'rounded-xl py-2 font-bold border border-slate-200 text-slate-600';
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
        simVal.textContent += ' ⚠️ Melebihi Stok Tersedia!';
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

      const txNumber = (modalTxType === 'GR' ? 'GR-' : 'GI-') + Date.now().toString().slice(-6);
      transactions.unshift({
        id: 'tx-' + Date.now(),
        transactionNumber: txNumber,
        transactionType: modalTxType,
        quantity: qty,
        previousBalance: cur,
        newBalance: newBal,
        transactionDate: new Date().toISOString(),
        referenceNumber: document.getElementById('tx-ref').value || null,
        remarks: document.getElementById('tx-notes').value || null,
        material: {
          materialCode: selectedMaterial.materialCode,
          description: selectedMaterial.description
        }
      });

      saveState();
      inspectMaterialByCode(selectedMaterial.materialCode);
      closeModal('modal-transaction');
      alert('Transaksi ' + modalTxType + ' berhasil disimpan! Saldo baru: ' + newBal + ' ' + selectedMaterial.uom);
    }

    // Bin Card Label Print
    function openLabelPrintForCurrent() {
      if (!selectedMaterial) return;
      document.getElementById('lbl-loc').textContent = selectedMaterial.storageLocation;
      document.getElementById('lbl-code').textContent = selectedMaterial.materialCode;
      document.getElementById('lbl-desc').textContent = selectedMaterial.description;
      document.getElementById('lbl-token').textContent = 'QR-' + selectedMaterial.materialCode;

      const qrContainer = document.getElementById('lbl-qrcode');
      qrContainer.innerHTML = '';
      new QRCode(qrContainer, {
        text: 'QR-' + selectedMaterial.materialCode,
        width: 140,
        height: 140,
        colorDark: "#0369A1",
        colorLight: "#FFFFFF",
      });

      document.getElementById('modal-label').classList.remove('hidden');
    }

    function closeModal(id) {
      document.getElementById(id).classList.add('hidden');
    }

    // Reset Data
    function resetDataDefault() {
      if (confirm('Apakah Anda yakin ingin mereset data persediaan ke default pabrik?')) {
        materials = RAW_MATERIALS;
        transactions = RAW_TRANSACTIONS;
        saveState();
        alert('Data berhasil direset ke default!');
      }
    }

    // Download Self HTML (Fitur Unduh index.html)
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

    // Live Sidebar Clock & Calendar
    function updateClock() {
      const now = new Date();
      document.getElementById('sidebar-clock').textContent = now.toLocaleTimeString('id-ID', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }) + ' WIB';
    }
    setInterval(updateClock, 1000);
    updateClock();

    let calDate = new Date();
    const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

    function renderCalendar() {
      const y = calDate.getFullYear();
      const m = calDate.getMonth();
      document.getElementById('calendar-month-year').textContent = monthNames[m] + ' ' + y;

      const firstDay = new Date(y, m, 1).getDay();
      const totalDays = new Date(y, m + 1, 0).getDate();
      const prevDays = new Date(y, m, 0).getDate();

      const container = document.getElementById('calendar-days');
      container.innerHTML = '';

      const today = new Date();
      const isCurMonth = today.getFullYear() === y && today.getMonth() === m;

      // Trailing prev month
      for (let i = firstDay - 1; i >= 0; i--) {
        const d = prevDays - i;
        container.innerHTML += \`<div class="h-6 flex items-center justify-center text-slate-500/50">\${d}</div>\`;
      }

      // Current month
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
    function todayMonth() {
      calDate = new Date();
      renderCalendar();
    }

    // Init
    saveState();
    renderCalendar();
  </script>
</body>
</html>`;

fs.writeFileSync("index.html", html, "utf-8");
fs.writeFileSync("public/index.html", html, "utf-8");
console.log("Successfully generated index.html and public/index.html!");
