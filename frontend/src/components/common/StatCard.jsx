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
      className={`h-full p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs transition-all duration-300 hover:shadow-lg flex flex-col justify-between overflow-hidden relative ${
        onClick ? "cursor-pointer hover:border-blue-500 hover:-translate-y-0.5 active:translate-y-0" : ""
      }`}
    >
      {/* Top Row: Title & Icon */}
      <div className="flex items-start justify-between gap-1.5 min-w-0">
        <span className="text-[10px] xl:text-xs font-extrabold text-slate-600 uppercase tracking-tight leading-tight block break-words min-w-0 flex-1">
          {title}
        </span>
        {Icon && (
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center shrink-0 ${currentTheme}`}>
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        )}
      </div>

      {/* Middle & Bottom: Metric Number & Subtitle */}
      <div className="mt-2 min-w-0">
        <div className="text-lg sm:text-xl xl:text-2xl font-black text-slate-900 font-mono tracking-tight leading-none">
          {value}
        </div>
        {subtitle && (
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 leading-tight break-words">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

