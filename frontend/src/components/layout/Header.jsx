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
  Building2,
} from "lucide-react";

export const Header = ({ onOpenLogin, onViewLandingPage }) => {
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
          <div className="w-11 h-11 rounded-full bg-white border-2 border-amber-400 flex items-center justify-center shadow-md shrink-0 overflow-hidden">
            <img src="/Weblogo.png" alt="SAMARTH Logo" className="w-full h-full object-cover rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                SAMARTH
              </h1>
            </div>
            <p className="text-[10px] font-semibold text-amber-300/90 leading-none mt-0.5">
              Smart Agricultural Management & Resource Tracking Hub
            </p>
          </div>
        </div>

        {/* Right Telemetry & Auth Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-[#162C5B] px-3 py-1.5 rounded-full border border-amber-400/30 text-amber-300 font-bold">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Turbhe Centre</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#162C5B] px-3 py-1.5 rounded-full border border-blue-400/20 text-slate-200 font-mono font-bold text-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{timeStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tricolor Accent Strip */}
      <div className="tricolor-bar w-full"></div>
    </header>
  );
};

