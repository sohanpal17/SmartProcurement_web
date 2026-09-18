import React from "react";
import { useApp } from "../../context/AppContext";
import { TokenCard } from "../tokens/TokenCard";
import { STAGE_LABELS, getDisplaySlot } from "../../utils/queueUtils";
import { Workflow, CheckCircle2, Clock, ArrowRight } from "lucide-react";

export const ArrivalDashboard = ({ onOpenReschedule, onOpenFlag, onOpenFarmerDetails, onOpenStageModal }) => {
  const { currentDemoRole, farmers } = useApp();

  const activeTokens = farmers.filter((f) => f.status !== "COMPLETED");

  const myActionableTokens = activeTokens.filter(
    (f) => (f.currentStage === "arrival" || f.status === "BOOKED" || f.status === "ARRIVAL") && f.status !== "FLAGGED" && f.status !== "LATE"
  );

  const otherTokensInQueue = activeTokens.filter(
    (f) => (f.currentStage !== "arrival" && f.status !== "BOOKED" && f.status !== "ARRIVAL") || f.status === "FLAGGED"
  );

  const lateFarmers = farmers.filter((f) => f.status === "LATE");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Officer Workstation Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-xl font-black text-slate-900">{currentDemoRole || "Check-in Staff"} Workstation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Department of Agricultural Marketing - Sequential stage: <strong className="text-slate-800">{STAGE_LABELS["arrival"]}</strong>. Verify farmer identity and record arrival.
          </p>
        </div>

        <div className="px-4 py-2 bg-blue-50 text-[#102A56] border border-blue-200 rounded-xl font-bold text-xs flex items-center gap-2">
          <Workflow className="w-4 h-4 text-blue-600" />
          <span>{myActionableTokens.length} Farmers Awaiting Your Action</span>
        </div>
      </div>

      {/* Late Farmers Notice Section */}
      {lateFarmers.length > 0 && (
        <div className="bg-amber-50/90 rounded-2xl border border-amber-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  Late Arriving Farmers ({lateFarmers.length})
                </h3>
                <p className="text-xs text-amber-700">
                  Farmers missed original batch window. Reschedule to assign new batch or buffer period.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {lateFarmers.map((farmer) => (
              <div
                key={farmer.id}
                className="bg-white p-4 rounded-xl border border-amber-300 shadow-xs flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <span className="text-base font-black text-amber-900 font-mono">
                    {farmer.tokenNumber}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{farmer.farmerName}</h4>
                  <p className="text-xs text-slate-500">
                    Original Slot: {getDisplaySlot(farmer)} | Crop: {farmer.crop}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenReschedule(farmer)}
                    className="px-4 py-2 bg-[#102A56] hover:bg-[#173763] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <span>Reschedule Token</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Tokens Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Awaiting Your Action ({STAGE_LABELS["arrival"]})</span>
        </h2>

        {myActionableTokens.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No pending farmers at check-in counter right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myActionableTokens.map((farmer) => (
              <TokenCard
                key={farmer.id}
                farmer={farmer}
                onOpenReschedule={onOpenReschedule}
                onOpenFlag={onOpenFlag}
                onOpenFarmerDetails={onOpenFarmerDetails}
                onOpenStageModal={onOpenStageModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Other Active Tokens in Queue */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <h3 className="text-sm font-bold text-slate-700">
          Other Active Centre Tokens (Cross-Officer Visibility)
        </h3>
        <p className="text-xs text-slate-500">
          You can observe full progress across all stages, but action controls are restricted to your assigned stage.
        </p>

        <div className="grid grid-cols-1 gap-4">
          {otherTokensInQueue.map((farmer) => (
            <TokenCard
              key={farmer.id}
              farmer={farmer}
              onOpenReschedule={onOpenReschedule}
              onOpenFlag={onOpenFlag}
              onOpenFarmerDetails={onOpenFarmerDetails}
              onOpenStageModal={onOpenStageModal}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
