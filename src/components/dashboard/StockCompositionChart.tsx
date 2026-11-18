"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface StockCompositionChartProps {
  data: {
    status: string;
    count: number;
    color: string;
  }[];
}

export default function StockCompositionChart({ data }: StockCompositionChartProps) {
  const totalItems = data.reduce((acc, curr) => acc + curr.count, 0);

  if (totalItems === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-slate-400">
        Belum ada data stok material.
      </div>
    );
  }

  return (
    <div className="relative h-80 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1E293B",
              borderRadius: "10px",
              border: "none",
              color: "#FFFFFF",
              fontSize: "12px",
            }}
            formatter={(value: any, name: any) => [`${value} Item`, name]}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label inside Donut */}
      <div className="pointer-events-none absolute inset-x-0 top-[38%] text-center">
        <span className="text-2xl font-black text-slate-800">{totalItems}</span>
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Total Item
        </div>
      </div>
    </div>
  );
}
