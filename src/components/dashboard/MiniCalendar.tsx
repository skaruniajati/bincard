"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  ArrowRight,
  ClipboardList,
  Package,
} from "lucide-react";

export default function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<string>("");

  // Live Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Hari pertama dalam bulan ini
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Jumlah hari dalam bulan ini
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Jumlah hari dalam bulan sebelumnya
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const isToday = (d: number, m: number, y: number) => {
    const today = new Date();
    return (
      d === today.getDate() &&
      m === today.getMonth() &&
      y === today.getFullYear()
    );
  };

  const isSelected = (d: number, m: number, y: number) => {
    return (
      d === selectedDate.getDate() &&
      m === selectedDate.getMonth() &&
      y === selectedDate.getFullYear()
    );
  };

  // Menghasilkan daftar hari untuk kalender
  const calendarCells = [];

  // Hari dari bulan sebelumnya
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    calendarCells.push({
      day: d,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }

  // Hari dari bulan berjalan
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({
      day: d,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }

  // Hari dari bulan berikutnya untuk mengisi sisa grid (total 35 atau 42 cell)
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    calendarCells.push({
      day: d,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  // Format tanggal terpilih dalam bahasa Indonesia
  const selectedFormatted = selectedDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-soft transition-all duration-300 hover:border-sky-200">
      {/* Header Widget */}
      <div className="flex flex-col gap-3 border-b border-sky-100/70 bg-gradient-to-r from-sky-50/60 via-white to-blue-50/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 shadow-sm">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Kalender Operasional Gudang
            </h3>
            <p className="text-xs text-slate-500">
              Jadwal shift, stock opname, dan agenda mutasi fisik
            </p>
          </div>
        </div>

        {/* Live Clock & Hari Ini Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-sky-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            <Clock className="h-3.5 w-3.5 text-sky-600 animate-pulse" />
            <span className="font-mono font-bold text-sky-950">
              {currentTime || "Memuat..."}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToday}
            className="rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-sky-700 transition-colors"
          >
            Hari Ini
          </button>
        </div>
      </div>

      {/* Grid Content: Left (Calendar) | Right (Daily Schedule / Events) */}
      <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-12">
        {/* Left: Mini Calendar Grid (7 cols) */}
        <div className="lg:col-span-7">
          {/* Navigation Month */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-black text-slate-800">
              {monthNames[month]} {year}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Bulan Sebelumnya"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Bulan Berikutnya"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Day Names Header */}
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
            {dayNames.map((day, idx) => (
              <div
                key={day}
                className={`py-1 ${idx === 0 ? "text-rose-500" : ""}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="mt-1 grid grid-cols-7 gap-1 text-xs">
            {calendarCells.map((cell, idx) => {
              const active = isToday(cell.day, cell.month, cell.year);
              const selected = isSelected(cell.day, cell.month, cell.year);
              const isSunday = idx % 7 === 0;

              return (
                <button
                  key={`${cell.year}-${cell.month}-${cell.day}-${idx}`}
                  type="button"
                  onClick={() =>
                    setSelectedDate(new Date(cell.year, cell.month, cell.day))
                  }
                  className={`group relative flex h-9 w-full items-center justify-center rounded-xl text-xs font-semibold transition-all duration-200 ${
                    selected
                      ? "bg-sky-600 text-white shadow-md font-bold ring-2 ring-sky-300 scale-105 z-10"
                      : active
                      ? "bg-sky-100 text-sky-800 font-extrabold ring-1 ring-sky-400"
                      : cell.isCurrentMonth
                      ? isSunday
                        ? "text-rose-600 hover:bg-rose-50"
                        : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                      : "text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>{cell.day}</span>
                  {/* Subtle indicator dot for active day */}
                  {active && !selected && (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-sky-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Operational Schedule for Selected Date (5 cols) */}
        <div className="flex flex-col justify-between rounded-xl border border-sky-100/80 bg-gradient-to-br from-sky-50/40 via-white to-blue-50/30 p-4 lg:col-span-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-sky-100 pb-2">
              <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                Agenda Harian Gudang
              </span>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                Shift 1 & 2
              </span>
            </div>

            <div>
              <h5 className="text-xs font-black text-slate-800 leading-snug">
                {selectedFormatted}
              </h5>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Pencatatan persediaan berjalan normal dan real-time.
              </p>
            </div>

            {/* List of operational tasks */}
            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">
                    Penerimaan Barang (GR)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Verifikasi Surat Jalan & QR label sparepart masuk
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sky-700">
                  <Package className="h-4 w-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">
                    Pengeluaran Barang (GI)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Penyaluran suku cadang unit traksi & operasional
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">
                    Stock Opname Fisik
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Pemeriksaan berkala kesesuaian saldo rak & kartu bin card
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-sky-100 pt-3 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Server SSE Sync: <strong>Aktif</strong></span>
            <span className="text-sky-600 font-semibold">Live System 2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
