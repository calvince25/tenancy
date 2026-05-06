"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
} from "recharts";

const data = [
  { name: "Jan", revenue: 4000, water: 2400 },
  { name: "Feb", revenue: 3000, water: 1398 },
  { name: "Mar", revenue: 2000, water: 9800 },
  { name: "Apr", revenue: 2780, water: 3908 },
  { name: "May", revenue: 1890, water: 4800 },
  { name: "Jun", revenue: 2390, water: 3800 },
  { name: "Jul", revenue: 3490, water: 4300 },
  { name: "Aug", revenue: 4000, water: 2400 },
  { name: "Sep", revenue: 3000, water: 1398 },
  { name: "Oct", revenue: 2000, water: 9800 },
  { name: "Nov", revenue: 2780, water: 3908 },
  { name: "Dec", revenue: 1890, water: 4800 },
];

export function RevenueCharts() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-full bg-slate-50/50 animate-pulse rounded-2xl" />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
        />
        <Tooltip 
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ 
            borderRadius: '16px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            padding: '12px'
          }}
          labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
        />
        <Bar 
          dataKey="revenue" 
          fill="#1e293b" 
          radius={[6, 6, 0, 0]} 
          barSize={24}
        />
        <Bar 
          dataKey="water" 
          fill="#6366f1" 
          radius={[6, 6, 0, 0]} 
          barSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
