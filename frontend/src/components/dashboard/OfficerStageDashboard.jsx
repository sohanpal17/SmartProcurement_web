import React from "react";
import { useApp } from "../../context/AppContext";
import { TokenCard } from "../tokens/TokenCard";
import { getStageOfficerRole } from "../../utils/permissions";
import { STAGE_LABELS } from "../../utils/queueUtils";
import { Workflow, CheckCircle2 } from "lucide-react";

export const OfficerStageDashboard = ({ onOpenFlag, onOpenFarmerDetails, onOpenStageModal }) => {
  const { currentDemoRole, farmers } = useApp();

  const activeTokens = farmers.filter((f) => f.status !== "COMPLETED");

  let stageKey = "weighing";
  if (currentDemoRole.includes("Weighing")) stageKey = "weighing";
  else if (currentDemoRole.includes("Quality")) stageKey = "quality";
  else if (currentDemoRole.includes("Payment")) stageKey = "payment";

  const myActionableTokens = activeTokens.filter(
    (f) => f.currentStage === stageKey && f.status !== "FLAGGED"
  );

  const otherTokensInQueue = activeTokens.filter(
    (f) => f.currentStage !== stageKey || f.status === "FLAGGED"
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Officer Workstation Header */}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-xl font-black text-slate-900">{currentDemoRole} Workstation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Department of Agricultural Marketing - Sequential stage: <strong className="text-slate-800">{STAGE_LABELS[stageKey]}</strong>. Only modify your authorized stage.
          </p>
        </div>

        <div className="px-4 py-2 bg-blue-50 text-[#102A56] border border-blue-200 rounded-xl font-bold text-xs flex items-center gap-2">
          <Workflow className="w-4 h-4 text-blue-600" />
          <span>{myActionableTokens.length} Farmers Awaiting Your Action</span>
        </div>
      </div>

      {/* Actionable Tokens Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Awaiting Your Action ({STAGE_LABELS[stageKey]})</span>
        </h2>

        {myActionableTokens.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No pending farmers at your counter right now. All tokens up to date!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myActionableTokens.map((farmer) => (
              <TokenCard
                key={farmer.id}
                farmer={farmer}
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
