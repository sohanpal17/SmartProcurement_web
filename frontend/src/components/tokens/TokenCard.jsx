import React from "react";
import { useApp } from "../../context/AppContext";
import { StageBadge, StatusBadge } from "../common/Badge";
import { TokenStepper } from "./TokenStepper";
import { ROLES } from "../../data/mockData";
import { getStageOfficerRole } from "../../utils/permissions";
import { STAGE_LABELS, getDisplaySlot } from "../../utils/queueUtils";
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, MapPin, Edit3 } from "lucide-react";

export const TokenCard = ({ farmer, onOpenReschedule, onOpenFlag, onOpenFarmerDetails, onOpenStageModal }) => {
  const {
    currentDemoRole,
    markArrived,
    markLate,
    callNextToken,
    completeStage,
    cancelBooking,
    activeServingTokenId,
  } = useApp();

  const currentStageKey = farmer.currentStage;
  const currentStageInfo = farmer.stages ? farmer.stages[currentStageKey] : null;
  const isCurrentServing = activeServingTokenId === farmer.id;

  const requiredOfficerRole = getStageOfficerRole(currentStageKey);
  const normRole = (currentDemoRole || "").toLowerCase();
  const normReq = (requiredOfficerRole || "").toLowerCase();

  const isRoleMatch =
    currentDemoRole === ROLES.ADMIN ||
    normRole === normReq ||
    (currentStageKey === "weighing" && normRole.includes("weighing")) ||
    (currentStageKey === "quality" && normRole.includes("quality")) ||
    (currentStageKey === "arrival" && normRole.includes("arrival")) ||
    (currentStageKey === "payment" && normRole.includes("payment"));

  const isMyActionableStage =
    isRoleMatch &&
    farmer.status !== "COMPLETED" &&
    farmer.status !== "FLAGGED";

  const canArrivalManage =
    (currentDemoRole === ROLES.ADMIN ||
      normRole.includes("arrival") ||
      normRole.includes("check") ||
      normRole.includes("admin")) &&
    farmer.status !== "COMPLETED";

  // Determine if the current officer completed their stage BUT the next officer hasn't ticked it yet
  // Edit option is ONLY for Weighing Staff and Quality Staff
  let myStageKey = null;
  if (normRole.includes("weigh")) myStageKey = "weighing";
  else if (normRole.includes("quality")) myStageKey = "quality";

  const nextStageMap = { weighing: "quality", quality: "payment" };
  const nextStageKey = myStageKey ? nextStageMap[myStageKey] : null;

  const isMyStageCompleted = myStageKey && farmer.stages?.[myStageKey]?.status === "COMPLETED";
  const isNextStageCompleted = nextStageKey ? farmer.stages?.[nextStageKey]?.status === "COMPLETED" : false;

  const canEditMyStage = myStageKey && isMyStageCompleted && !isNextStageCompleted && farmer.status !== "FLAGGED";

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md p-5 sm:p-6 ${
        isCurrentServing ? "border-amber-400 ring-2 ring-amber-200/60" : "border-slate-200"
      }`}
    >
      {/* Header Info: Big Token Number & Big Farmer Name */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          {/* Big Token Number Display */}
          <span className="text-xl sm:text-2xl font-black text-slate-900 bg-slate-100 px-3.5 py-1.5 rounded-xl font-mono border border-slate-200 tracking-tight">
            {farmer.tokenNumber || farmer.token_number || farmer.token_no || `TBR-${farmer.id}`}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3
                onClick={() => onOpenFarmerDetails(farmer.id)}
                className="text-lg sm:text-xl font-extrabold text-slate-900 hover:text-[#102A56] cursor-pointer transition-colors"
              >
                {farmer.farmerName}
              </h3>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-2 mt-0.5">
              <span>Slot: <strong>{getDisplaySlot(farmer)}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={farmer.status} />
          {farmer.status === "LATE" && (
            <span className="text-xs text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 font-semibold">
              Requires Rescheduling
            </span>
          )}
        </div>
      </div>

      {/* Workflow Progress Stepper with Green Connecting Lines */}
      <div className="my-3">
        <TokenStepper farmer={farmer} />
      </div>

      {/* Active Flag Notice */}
      {farmer.status === "FLAGGED" && (
        <div className="mb-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Active Flag Issue:</span>{" "}
            {farmer.flags.find((f) => f.status === "ACTIVE")?.issue || "Issue pending Admin review"}
          </div>
        </div>
      )}

      {/* Action Footer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenFarmerDetails(farmer.id)}
            className="text-xs sm:text-sm text-[#102A56] hover:text-blue-700 font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Full Profile & History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Edit Option if completed by current officer but NOT yet ticked by next officer */}
          {canEditMyStage && (
            <button
              onClick={() => onOpenStageModal && onOpenStageModal(farmer, myStageKey, true)}
              className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold border border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
              <span>Edit {STAGE_LABELS[myStageKey]} Data</span>
            </button>
          )}
        </div>

        {/* Processing Officer Specific Action */}
        {isMyActionableStage && farmer.status !== "FLAGGED" && (
          <div className="flex items-center gap-2 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
            <span className="text-xs sm:text-sm font-bold text-emerald-900 px-1.5 uppercase tracking-wider">
              STAGE ACTION:
            </span>

            <button
              onClick={() => onOpenFlag(farmer, currentStageKey)}
              className="px-3.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs sm:text-sm font-bold border border-rose-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Flag Issue</span>
            </button>

            <button
              onClick={() => {
                if (onOpenStageModal) {
                  onOpenStageModal(farmer, currentStageKey, false);
                } else {
                  completeStage(farmer.id, currentStageKey);
                }
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete {STAGE_LABELS[currentStageKey]}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
