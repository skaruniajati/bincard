"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Warehouse,
} from "lucide-react";

export default function SidebarCalendarWidget() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
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

  const dayHeaders = ["M", "S", "S", "R", "K", "J", "S"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  // Build calendar matrix
  const days = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      day: daysInPreviousMonth - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    days.push({
      day: d,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }

  // Next month leading days (to fill 35 or 42 slots)
  const totalSlots = days.length > 35 ? 42 : 35;
  const remaining = totalSlots - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({
      day: d,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  const dateFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-sky-800/60 bg-gradient-to-b from-sky-950/70 to-[#0A1F36] p-3 text-white shadow-inner">
      {/* Header Widget with Animated Warehouse Icon and Live Clock */}
      <div className="flex items-center justify-between border-b border-sky-800/50 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30">
            <Warehouse className="h-4 w-4 animate-pulse-soft" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-sky-300 uppercase tracking-wider">
              Waktu Operasional
            </div>
            <div className="text-[11px] font-semibold text-slate-200">
              {dateFormatted}
            </div>
          </div>
        </div>

        {/* Live Digital Clock Badge */}
        <div className="flex items-center gap-1 rounded-lg bg-sky-900/60 px-2 py-1 text-[11px] font-mono font-bold text-sky-200 border border-sky-700/40">
          <span className="flex h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span>{currentTime || "12:00 WIB"}</span>
        </div>
      </div>

      {/* Mini Calendar Month Bar */}
      <div className="mt-2.5 flex items-center justify-between px-1">
        <span className="text-xs font-bold text-white tracking-wide">
          {monthNames[month]} {year}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleToday}
            className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase text-sky-300 hover:bg-sky-800/60 transition-colors"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="rounded p-1 text-sky-300 hover:bg-sky-800/60 hover:text-white transition-colors"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="rounded p-1 text-sky-300 hover:bg-sky-800/60 hover:text-white transition-colors"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Day Headers (M, S, S, R, K, J, S) */}
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-sky-300/70">
        {dayHeaders.map((dh, i) => (
          <div key={`dh-${i}`} className={i === 0 ? "text-rose-400" : ""}>
            {dh}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="mt-1 grid grid-cols-7 gap-1 text-[11px]">
        {days.map((item, idx) => {
          const active = isToday(item.day, item.month, item.year);
          const selected = isSelected(item.day, item.month, item.year);
          const isSunday = idx % 7 === 0;

          return (
            <button
              key={`day-${item.year}-${item.month}-${item.day}-${idx}`}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedDate(new Date(item.year, item.month, item.day));
              }}
              className={`flex h-6 w-full items-center justify-center rounded-md font-semibold transition-all ${
                selected
                  ? "bg-sky-500 text-white font-extrabold shadow-sm ring-1 ring-sky-300 scale-105"
                  : active
                  ? "bg-sky-700/80 text-sky-100 font-bold ring-1 ring-sky-400"
                  : item.isCurrentMonth
                  ? isSunday
                    ? "text-rose-300 hover:bg-sky-800/50"
                    : "text-slate-200 hover:bg-sky-800/50 hover:text-white"
                  : "text-slate-500/50 hover:bg-sky-900/30"
              }`}
            >
              {item.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
