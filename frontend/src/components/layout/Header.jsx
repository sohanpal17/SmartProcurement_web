import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { ROLES } from "../../data/mockData";
import {
  Landmark,
  Clock,
  AlertTriangle,
  UserCheck,
  ChevronDown,
} from "lucide-react";

export const Header = () => {
  const { currentDemoRole, setCurrentDemoRole, mandiInfo, farmers, officers } = useApp();
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeFlagsCount = farmers.reduce(
    (acc, f) => acc + (f.flags ? f.flags.filter((fl) => fl.status === "ACTIVE").length : 0),
    0
  );

  const pendingOfficersCount = officers.filter((o) => o.status === "PENDING").length;

  return (
    <header className="sticky top-0 z-40 bg-[#102A56] text-white shadow-lg border-b border-[#1b3a70]">
      <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left Branding matching App Screenshot 1 */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white border-2 border-amber-400 flex items-center justify-center shadow-md shrink-0">
            <Landmark className="w-5.5 h-5.5 text-[#102A56]" />
          </div>

          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight">
              Department of Agricultural Marketing
            </h1>
            <p className="text-xs text-blue-200 font-medium tracking-wide">
              Government Procurement Portal • {mandiInfo.name}
            </p>
          </div>
        </div>

        {/* Center Live Telemetry Badges */}
        <div className="hidden xl:flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-2 bg-[#0a1e40] px-3 py-1.5 rounded-full border border-emerald-500/40 text-emerald-400 font-bold whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>MSP Procurement Active</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#173763] px-3 py-1.5 rounded-full border border-blue-400/20 text-slate-200 font-medium whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-bold text-amber-300">{timeStr}</span>
          </div>

          {activeFlagsCount > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-900/60 text-rose-200 px-3 py-1.5 rounded-full border border-rose-500/40 font-bold whitespace-nowrap">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{activeFlagsCount} Active Flags</span>
            </div>
          )}

          {pendingOfficersCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-900/60 text-amber-200 px-3 py-1.5 rounded-full border border-amber-500/40 font-bold whitespace-nowrap">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{pendingOfficersCount} Pending Requests</span>
            </div>
          )}
        </div>

        {/* Right Sticky Demo Role Switcher */}
        <div className="flex items-center gap-2 bg-[#173763] p-1.5 rounded-xl border border-blue-400/30">
          <span className="text-xs text-blue-200 font-semibold pl-2 hidden sm:inline whitespace-nowrap">
            Viewing Context:
          </span>
          <div className="relative">
            <select
              value={currentDemoRole}
              onChange={(e) => setCurrentDemoRole(e.target.value)}
              className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold text-xs py-1.5 pl-3 pr-8 rounded-lg appearance-none focus:outline-none cursor-pointer transition-colors shadow-sm"
            >
              <option value={ROLES.ADMIN}>Admin (Mandi Director)</option>
              <option value={ROLES.ARRIVAL}>Arrival & Token Officer</option>
              <option value={ROLES.WEIGHING}>Weighing Officer</option>
              <option value={ROLES.QUALITY}>Quality Check Officer</option>
              <option value={ROLES.PROCUREMENT}>Procurement Status Officer</option>
              <option value={ROLES.PAYMENT}>Payment Status Officer</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-white absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tricolor Accent Strip */}
      <div className="tricolor-bar w-full"></div>
    </header>
  );
};
