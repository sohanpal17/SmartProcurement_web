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
              Department of Agricultural Marketing — Government Procurement Portal
            </p>
          </div>
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

          {/* User badge box removed as requested */}
        </div>
      </div>

      {/* Tricolor Accent Strip */}
      <div className="tricolor-bar w-full"></div>
    </header>
  );
};

