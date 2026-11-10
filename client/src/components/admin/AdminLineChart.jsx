import React from "react";

const AdminLineChart = ({ data = [], dataKey, label }) => {
  const values = data.map((point) => Number(point[dataKey] || 0));
  const max = Math.max(...values, 0);
  const width = 720;
  const height = 220;
  const inset = 12;
  const usableHeight = height - inset * 2;
  const points = values.map((value, index) => {
    const x = values.length <= 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = max === 0 ? height - inset : inset + (1 - value / max) * usableHeight;
    return `${x},${y}`;
  }).join(" ");
  const hasEvents = values.some((value) => value > 0);

  return (
    <div className="min-w-0">
      {hasEvents ? (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full overflow-visible" role="img" aria-label={`${label} over the selected period`} preserveAspectRatio="none">
          <line x1="0" y1={height - inset} x2={width} y2={height - inset} stroke="#e2e8f0" strokeWidth="1" />
          <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
          {values.map((value, index) => {
            if (value === 0) return null;
            const x = values.length <= 1 ? width / 2 : (index / (values.length - 1)) * width;
            const y = inset + (1 - value / max) * usableHeight;
            return <circle key={`${data[index].date}-${index}`} cx={x} cy={y} r="3" fill="#2563eb"><title>{`${data[index].date}: ${value}`}</title></circle>;
          })}
        </svg>
      ) : <div className="flex h-52 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500">No recorded activity for this period.</div>}
      {data.length > 0 && <div className="mt-2 flex justify-between text-xs text-slate-500"><span>{data[0].date}</span><span>{data[data.length - 1].date}</span></div>}
    </div>
  );
};

export default AdminLineChart;
