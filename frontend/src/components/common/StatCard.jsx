import React from "react";

export const StatCard = ({ title, value, subtitle, icon: Icon, color = "slate", onClick }) => {
  const colorMap = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const currentTheme = colorMap[color] || colorMap.slate;

  return (
    <div
      onClick={onClick}
      className={`h-full p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs transition-all duration-300 hover:shadow-lg flex flex-col justify-between ${
        onClick ? "cursor-pointer hover:border-blue-500 hover:-translate-y-1 active:translate-y-0" : ""
      }`}
    >
      {/* Top Row: Full Title (No dots/truncation) & Icon */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider leading-snug whitespace-normal">
          {title}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${currentTheme}`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>

      {/* Middle & Bottom: Metric Number & Subtitle (No dots/truncation) */}
      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight leading-none">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 font-medium mt-1.5 leading-snug whitespace-normal">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
