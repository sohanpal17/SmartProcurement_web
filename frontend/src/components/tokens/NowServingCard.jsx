import React from "react";
import { useApp } from "../../context/AppContext";
import { StatusBadge } from "../common/Badge";
import { getDisplaySlot } from "../../utils/queueUtils";
import { Volume2, ArrowRight, Phone, Scale, MapPin, UserCheck, ShieldCheck } from "lucide-react";

export const NowServingCard = ({ onOpenFarmerDetails }) => {
  const { farmers, activeServingTokenId, callNextToken } = useApp();

  const currentServingFarmer = farmers.find((f) => f.id === activeServingTokenId) || farmers.find(f => f.status !== "COMPLETED");

  const upcomingTokens = farmers.filter(
    (f) =>
      f.id !== activeServingTokenId &&
      (f.status === "ARRIVED" || f.status === "BOOKED") &&
      f.status !== "COMPLETED"
  );

  const nextFarmerToCall = upcomingTokens[0];

  return (
    <div className="bg-[#102A56] text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-[#1b365d] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        {/* Main Serving Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              NOW SERVING
            </span>
            {currentServingFarmer && <StatusBadge status={currentServingFarmer.status} />}
          </div>

          {currentServingFarmer ? (
            <div className="mt-4">
              <div className="flex items-baseline gap-4">
                <h1 className="text-5xl sm:text-6xl font-black text-amber-400 tracking-tight drop-shadow-sm font-mono">
                  {currentServingFarmer.tokenNumber}
                </h1>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                      {currentServingFarmer.farmerName}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                    </span>
                  </div>
                  <p className="text-xs text-blue-200 font-medium flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-300" />
                    <span>{currentServingFarmer.location || "Kopar Khairane, Navi Mumbai"}</span>
                    <span>•</span>
                    <span>Slot: {getDisplaySlot(currentServingFarmer)}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200 w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-[#173763] px-3 py-1.5 rounded-lg border border-blue-400/20 flex items-center gap-1.5 font-medium">
                    <Scale className="w-3.5 h-3.5 text-blue-300" />
                    <span>Expected: {currentServingFarmer.expectedQuantityQuintals} Quintals</span>
                  </span>

                  {currentServingFarmer.farmerIdNum && (
                    <span className="bg-[#173763] px-3 py-1.5 rounded-lg border border-blue-400/20 font-mono text-blue-200">
                      ID: {currentServingFarmer.farmerIdNum}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onOpenFarmerDetails(currentServingFarmer.id)}
                  className="text-amber-300 hover:text-amber-200 font-semibold text-xs flex items-center gap-1 ml-auto cursor-pointer underline"
                >
                  <span>View Details & Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 py-4">
              <p className="text-xl text-blue-200">No active token currently serving</p>
            </div>
          )}
        </div>

        {/* Call Next Token Action */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
          {nextFarmerToCall ? (
            <button
              onClick={() => callNextToken(nextFarmerToCall.id)}
              className="w-full py-4 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg hover:shadow-amber-400/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Volume2 className="w-5 h-5 text-slate-950" />
              <span>CALL NEXT TOKEN ({nextFarmerToCall.tokenNumber})</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-4 px-6 bg-slate-800 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
            >
              <span>QUEUE EMPTY</span>
            </button>
          )}

          {nextFarmerToCall && (
            <p className="text-xs text-center text-blue-200 font-medium">
              Next in line: <strong className="text-white">{nextFarmerToCall.farmerName}</strong> ({nextFarmerToCall.tokenNumber})
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
