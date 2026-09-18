import React from "react";
import { useApp } from "../../context/AppContext";
import { StatusBadge, StageBadge } from "../common/Badge";
import { TokenStepper } from "../tokens/TokenStepper";
import { STAGE_ORDER, STAGE_LABELS } from "../../utils/queueUtils";
import { ShieldCheck, MapPin, Phone, Scale, X, Clock, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";

export const FarmerDetailsDrawer = ({ farmerId, onClose }) => {
  const { farmers } = useApp();
  const farmer = farmers.find((f) => f.id === farmerId);

  if (!farmer) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col transform transition-all animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 bg-[#102A56] text-white flex items-center justify-between sticky top-0 z-20 shadow-md">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-amber-400 font-mono">
                {farmer.tokenNumber}
              </span>
              <StatusBadge status={farmer.status} />
            </div>
            <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
              <span>{farmer.farmerName}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
              </span>
            </h2>
            <p className="text-xs text-blue-200 mt-0.5">
              {farmer.farmerIdNum || "FMR-7128912345"} • {farmer.location || "Navi Mumbai"} | Phone: {farmer.phone}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-blue-900/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Stepper */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
              Sequential Workflow Progress
            </h3>
            <TokenStepper farmer={farmer} />
          </div>

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Commodity / Crop</span>
              <span className="font-bold text-slate-900 text-sm">{farmer.crop}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Registered Area</span>
              <span className="font-bold text-slate-900 text-sm">{farmer.registeredArea || "8.7 Acres"}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Booked Quantity</span>
              <span className="font-bold text-slate-900 text-sm">{farmer.expectedQuantityQuintals} Quintals</span>
            </div>
          </div>

          {/* Stage Audit Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#102A56]" />
              <span>Stage Audit Breakdown</span>
            </h3>
            <div className="space-y-3">
              {STAGE_ORDER.map((stageKey) => {
                const st = farmer.stages ? farmer.stages[stageKey] : null;
                return (
                  <div
                    key={stageKey}
                    className="flex items-start justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">
                        {STAGE_LABELS[stageKey]}
                      </span>
                      {st?.completedAt ? (
                        <p className="text-slate-500 mt-0.5">
                          Completed at <strong className="text-slate-700">{st.completedAt}</strong> by{" "}
                          <span className="text-[#102A56] font-semibold">{st.officerName}</span>
                        </p>
                      ) : st?.status === "ACTIVE" ? (
                        <p className="text-blue-700 font-semibold mt-0.5">
                          Currently active at processing counter
                        </p>
                      ) : (
                        <p className="text-slate-400 mt-0.5">Stage locked until prior step completes</p>
                      )}
                    </div>
                    <StageBadge status={st?.status || "LOCKED"} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active / Resolved Flags */}
          {farmer.flags && farmer.flags.length > 0 && (
            <div className="bg-rose-50/80 rounded-2xl border border-rose-200 p-5">
              <h3 className="text-sm font-bold text-rose-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Issue Flags ({farmer.flags.length})</span>
              </h3>
              <div className="space-y-2">
                {farmer.flags.map((flag) => (
                  <div key={flag.id} className="p-3.5 bg-white rounded-xl border border-rose-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900">
                        {STAGE_LABELS[flag.stage]} Flag
                      </span>
                      <span className="font-semibold text-rose-700">{flag.status}</span>
                    </div>
                    <p className="text-slate-800 font-medium">"{flag.issue}"</p>
                    <p className="text-slate-400 text-[11px]">
                      Reported by {flag.reportedBy} at {flag.createdAt}
                    </p>
                    {flag.resolutionNotes && (
                      <div className="mt-2 p-2 bg-emerald-50 text-emerald-900 rounded-lg text-[11px]">
                        <strong>Resolution:</strong> {flag.resolutionNotes} ({flag.resolvedBy} @ {flag.resolvedAt})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* End of details */}
        </div>
      </div>
    </div>
  );
};
