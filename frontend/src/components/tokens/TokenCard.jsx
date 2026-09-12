import React from "react";
import { useApp } from "../../context/AppContext";
import { StageBadge, StatusBadge } from "../common/Badge";
import { TokenStepper } from "./TokenStepper";
import { ROLES } from "../../data/mockData";
import { getStageOfficerRole } from "../../utils/permissions";
import { STAGE_LABELS } from "../../utils/queueUtils";
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, MapPin } from "lucide-react";

export const TokenCard = ({ farmer, onOpenReschedule, onOpenFlag, onOpenFarmerDetails }) => {
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
    (currentStageKey === "procurement" && normRole.includes("procurement")) ||
    (currentStageKey === "weighing" && normRole.includes("weighing")) ||
    (currentStageKey === "quality" && normRole.includes("quality")) ||
    (currentStageKey === "arrival" && normRole.includes("arrival")) ||
    (currentStageKey === "payment" && normRole.includes("payment"));

  const isMyActionableStage =
    isRoleMatch &&
    farmer.status !== "COMPLETED" &&
    farmer.status !== "FLAGGED";

  const canArrivalManage =
    (currentDemoRole === ROLES.ADMIN || normRole.includes("arrival") || normRole.includes("admin")) &&
    farmer.status !== "COMPLETED";

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
            <p className="text-xs sm:text-sm text-slate-600 font-medium flex flex-wrap items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{farmer.location || "Navi Mumbai"}</span>
              </span>
              <span>•</span>
              <span>{farmer.slot} ({farmer.batch})</span>
              <span>•</span>
              <span className="font-semibold text-slate-800">{farmer.crop || farmer.commodity || "Crop"}</span>
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

      {/* Metric Breakdown Row: Clear Readable Sizing */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 my-3">
        <div>
          <span className="text-slate-500 block text-xs font-medium">Phone Contact</span>
          <span className="font-bold text-slate-900 font-mono text-sm sm:text-base">{farmer.phone}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-xs font-medium">Registered Quantity</span>
          <span className="font-bold text-slate-900 text-sm sm:text-base">{farmer.expectedQuantityQuintals} Quintals</span>
        </div>
        <div>
          <span className="text-slate-500 block text-xs font-medium">Weighbridge Weight</span>
          <span className="font-bold text-slate-900 text-sm sm:text-base">
            {farmer.measuredWeightQuintals ? `${farmer.measuredWeightQuintals} Quintals` : "Pending"}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-xs font-medium">Quality Verification</span>
          <span className="font-bold text-slate-900 text-sm sm:text-base">
            {farmer.qualityGrade || "Pending check"}
          </span>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={() => onOpenFarmerDetails(farmer.id)}
          className="text-xs sm:text-sm text-[#102A56] hover:text-blue-700 font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <span>View Full Profile & History</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-2">
          {canArrivalManage && (
            <>
              {farmer.arrivalStatus === "BOOKED" && (
                <button
                  onClick={() => markArrived(farmer.id)}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  Mark Arrived
                </button>
              )}

              {farmer.status === "ARRIVED" && (
                <button
                  onClick={() => callNextToken(farmer.id)}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  Call Token
                </button>
              )}

              {(farmer.status === "BOOKED" || farmer.status === "LATE") && (
                <>
                  <button
                    onClick={() => markLate(farmer.id)}
                    className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs sm:text-sm font-semibold border border-amber-300 cursor-pointer"
                  >
                    Mark Late
                  </button>
                  <button
                    onClick={() => onOpenReschedule(farmer)}
                    className="px-4 py-2 bg-[#102A56] hover:bg-[#16376c] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => cancelBooking(farmer.id)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs sm:text-sm font-semibold border border-rose-200 cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                </>
              )}
            </>
          )}

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
                  if (currentStageKey === "weighing") {
                    const w = prompt("Enter measured weight in Quintals:", farmer.expectedQuantityQuintals);
                    if (w) completeStage(farmer.id, "weighing", { measuredWeightQuintals: parseFloat(w) });
                  } else if (currentStageKey === "quality") {
                    const g = prompt("Enter Quality Grade (e.g., Grade A, Grade B):", "Grade A");
                    if (g) completeStage(farmer.id, "quality", { qualityGrade: g });
                  } else if (currentStageKey === "procurement") {
                    const r = prompt("Enter Procurement Rate per Quintal (INR):", farmer.procurementRatePerQuintal || 2275);
                    if (r) completeStage(farmer.id, "procurement", { procurementRatePerQuintal: parseFloat(r) });
                  } else if (currentStageKey === "payment") {
                    const ref = `DBT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
                    completeStage(farmer.id, "payment", { transactionRef: ref, totalAmountPaid: (farmer.measuredWeightQuintals || farmer.expectedQuantityQuintals) * (farmer.procurementRatePerQuintal || 2275) });
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
    </div>
  );
};
