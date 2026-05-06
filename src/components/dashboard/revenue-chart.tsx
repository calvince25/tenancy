"use client";

export function RevenueChart({ data }: { data: any[] }) {
  const maxValue = Math.max(...data.map(d => d.amount), 10000);
  const height = 120;
  
  return (
    <div className="w-full h-[150px] flex items-end gap-1 px-2 pt-4">
      {data.map((d, i) => {
        const barHeight = (d.amount / maxValue) * height;
        return (
          <div key={i} className="flex-1 flex flex-col items-center group relative">
            <div 
              className="w-full bg-primary/20 hover:bg-primary/40 transition-all rounded-t-sm"
              style={{ height: `${barHeight}px` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {d.amount.toLocaleString()}
              </div>
            </div>
            <span className="text-[8px] text-muted-foreground mt-1 uppercase font-bold">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}
