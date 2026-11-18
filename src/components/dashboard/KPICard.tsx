import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  badge?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  trend?: string;
  delayIndex?: number;
}

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  variant = "default",
  trend,
  delayIndex = 0,
}: KPICardProps) {
  const variantStyles = {
    default: {
      border: "border-sky-100 hover:border-sky-300",
      iconBg: "bg-sky-50 text-sky-700 group-hover:bg-sky-100",
      badgeBg: "bg-sky-50 text-sky-700 border border-sky-100",
    },
    success: {
      border: "border-sky-200 hover:border-sky-400",
      iconBg: "bg-sky-100 text-sky-800 group-hover:bg-sky-200",
      badgeBg: "bg-sky-50 text-sky-800 border border-sky-200",
    },
    warning: {
      border: "border-amber-200 hover:border-amber-300",
      iconBg: "bg-amber-50 text-amber-700 group-hover:bg-amber-100",
      badgeBg: "bg-amber-50 text-amber-700 border border-amber-200",
    },
    danger: {
      border: "border-rose-200 hover:border-rose-300",
      iconBg: "bg-rose-50 text-rose-700 group-hover:bg-rose-100",
      badgeBg: "bg-rose-50 text-rose-700 border border-rose-200",
    },
    info: {
      border: "border-blue-100 hover:border-blue-300",
      iconBg: "bg-blue-50 text-blue-700 group-hover:bg-blue-100",
      badgeBg: "bg-blue-50 text-blue-700 border border-blue-100",
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div
      style={{ animationDelay: `${delayIndex * 80}ms` }}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-soft animate-fade-in-up",
        style.border
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            {title}
          </span>
          <div className="mt-2 text-2xl font-black tracking-tight text-slate-900 lg:text-3xl transition-transform duration-200 group-hover:translate-x-0.5">
            {value}
          </div>
        </div>

        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl shadow-xs transition-all duration-300 group-hover:scale-110",
            style.iconBg
          )}
        >
          <Icon className="h-6 w-6 stroke-[2]" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="text-slate-500 text-[11px] truncate max-w-[130px]">{subtitle}</span>
        {badge && (
          <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold uppercase", style.badgeBg)}>
            {badge}
          </span>
        )}
        {trend && (
          <span className="font-semibold text-sky-700 text-[11px]">{trend}</span>
        )}
      </div>
    </div>
  );
}
