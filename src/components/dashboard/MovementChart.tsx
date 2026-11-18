"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MovementChartProps {
  data: {
    period: string;
    masuk: number;
    keluar: number;
  }[];
}

export default function MovementChart({ data }: MovementChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-slate-400">
        Belum ada data pergerakan barang dalam periode ini.
      </div>
    );
  }

  return (
    <div className="h-80 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0F2FE" />
          <XAxis
            dataKey="period"
            tick={{ fill: "#64748B", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#E2E8F0" }}
          />
          <YAxis
            tick={{ fill: "#64748B", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#E2E8F0" }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0F172A",
              borderRadius: "12px",
              border: "1px solid #1E293B",
              color: "#FFFFFF",
              fontSize: "12px",
              boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.2)",
            }}
            labelStyle={{ fontWeight: "bold", color: "#F8FAFC", marginBottom: "4px" }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: 15, fontSize: "12px" }}
          />
          <Bar
            name="Barang Masuk (GR)"
            dataKey="masuk"
            fill="#0284C7"
            radius={[6, 6, 0, 0]}
            maxBarSize={38}
          />
          <Bar
            name="Barang Keluar (GI)"
            dataKey="keluar"
            fill="#F43F5E"
            radius={[6, 6, 0, 0]}
            maxBarSize={38}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
