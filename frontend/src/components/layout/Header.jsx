import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { ROLES } from "../../data/mockData";
import {
  Landmark,
  Clock,
  AlertTriangle,
  UserCheck,
  ChevronDown,
  ShieldCheck,
  PhoneCall,
  User,
} from "lucide-react";

export const Header = ({ onOpenLogin }) => {
  const { authUser, logoutUser, mandiInfo, farmers, officers, currentDemoRole, setCurrentDemoRole } = useApp();
  const [timeStr, setTimeStr] = useState("");
  const [textSize, setTextSize] = useState("normal"); // normal, large, xlarge

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
    <header className="sticky top-0 z-40 bg-[#0F2B5C] text-white shadow-xl border-b border-[#1A3A73]">
      {/* 1. Top Government Utility Strip (Inspired by Gov Portal Design) */}
      <div className="bg-[#091C3E] text-slate-300 text-[11px] px-4 sm:px-6 py-1 flex flex-wrap items-center justify-between border-b border-blue-900/50">
        <div className="flex items-center gap-4 font-semibold text-slate-300">
          <span>Government of Maharashtra | Agricultural Marketing Department</span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-amber-300 font-medium">Official MSP Procurement Portal</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-slate-300">
            <PhoneCall className="w-3 h-3 text-amber-400" />
            <span>Helpdesk: <strong className="text-white">1800-233-1000</strong> (Toll Free)</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 border-l border-slate-700 pl-3">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>Hours: Mon - Sat, 9:00 AM - 6:00 PM</span>
          </div>

          <div className="flex items-center gap-1 border-l border-slate-700 pl-3 text-[10px] font-bold">
            <button onClick={() => setTextSize("normal")} className={`px-1 rounded ${textSize === "normal" ? "bg-amber-500 text-slate-950" : "hover:text-white"}`}>A-</button>
            <button onClick={() => setTextSize("large")} className={`px-1 rounded ${textSize === "large" ? "bg-amber-500 text-slate-950" : "hover:text-white"}`}>A</button>
            <button onClick={() => setTextSize("xlarge")} className={`px-1 rounded ${textSize === "xlarge" ? "bg-amber-500 text-slate-950" : "hover:text-white"}`}>A+</button>
          </div>
        </div>
      </div>

      {/* 2. Main Portal Branding & Evaluator Demo Role Bar */}
      <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white border-2 border-amber-400 flex items-center justify-center shadow-md shrink-0">
            <Landmark className="w-6 h-6 text-[#0F2B5C]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                SmartProcure Admin Portal
              </h1>
              

            </div>
            <p className="text-xs text-blue-200 font-medium tracking-wide">
              Agricultural Produce Market Committee (APMC) — Navi Mumbai
            </p>
          </div>
        </div>

        {/* Center: Demo Role Selector */}

        <div className="flex items-center gap-2 bg-[#162C5B] p-1.5 rounded-xl border border-blue-400/30">
          <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider px-2 hidden sm:inline">
            Evaluator Role:
          </span>
          <select
            value={currentDemoRole}
            onChange={(e) => setCurrentDemoRole(e.target.value)}
            className="bg-[#091C3E] text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-inner"
          >
            <option value={ROLES.ADMIN}>👑 Centre Administrator</option>
            <option value={ROLES.CHECKIN}>📌 Check-in Staff</option>
            <option value={ROLES.WEIGHING}>⚖️ Weighing Staff</option>
            <option value={ROLES.QUALITY}>🔬 Quality Staff</option>
            <option value={ROLES.PAYMENT}>💳 Payment Staff</option>
          </select>

        </div>

        {/* Right Telemetry & Auth Status */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-[#091C3E] px-3 py-1.5 rounded-full border border-emerald-500/40 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>MSP Active</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#162C5B] px-3 py-1.5 rounded-full border border-blue-400/20 text-slate-200 font-mono font-bold text-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{timeStr}</span>
            </div>
          </div>

          {authUser ? (
            <div className="flex items-center gap-2.5 bg-[#162C5B] px-3 py-1.5 rounded-xl border border-blue-400/30">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-white">{authUser.fullName || authUser.email}</span>
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
                  {authUser.role || "Official"}
                </span>
              </div>
              <button
                onClick={logoutUser}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-2.5 py-1 rounded-lg transition shadow-xs"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Official Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Tricolor Accent Strip */}
      <div className="tricolor-bar w-full"></div>
    </header>
  );
};

