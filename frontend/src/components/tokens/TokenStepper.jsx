import React from "react";
import { STAGE_ORDER, STAGE_LABELS } from "../../utils/queueUtils";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export const TokenStepper = ({ farmer }) => {
  if (!farmer || !farmer.stages) return null;

  return (
    <div className="w-full py-3">
      {/* Row 1: Circles & Connecting Line Segments */}
      <div className="flex items-center w-full px-2">
        {STAGE_ORDER.map((stageKey, idx) => {
          const stageInfo = farmer.stages[stageKey] || { status: "LOCKED" };
          const isCompleted = stageInfo.status === "COMPLETED";
          const isActive = stageInfo.status === "ACTIVE";
          const isFlagged = stageInfo.status === "FLAGGED";
          const isLast = idx === STAGE_ORDER.length - 1;

          let circleClasses = "bg-slate-100 text-slate-600 border-slate-300";
          let icon = <span className="text-sm font-bold">{idx + 1}</span>;

          if (isCompleted) {
            circleClasses = "bg-emerald-600 text-white border-emerald-600 shadow-sm";
            icon = <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5]" />;
          } else if (isActive) {
            circleClasses = "bg-[#2563EB] text-white border-[#2563EB] shadow-md ring-4 ring-blue-100 animate-pulse";
          } else if (isFlagged) {
            circleClasses = "bg-rose-600 text-white border-rose-600 shadow-md ring-4 ring-rose-100";
            icon = <AlertTriangle className="w-4 h-4 text-white" />;
          }

          return (
            <React.Fragment key={stageKey}>
              {/* Step Circle */}
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${circleClasses}`}>
                  {icon}
                </div>
              </div>

              {/* Progress Line Segment to next step */}
              {!isLast && (
                <div className="flex-1 h-[4px] mx-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isCompleted ? "bg-emerald-600 w-full" : isFlagged ? "bg-rose-500 w-full" : "w-0"
                    }`}
                  ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Row 2: Step Labels & Completion Timestamps */}
      <div className="flex justify-between w-full mt-2.5 text-center">
        {STAGE_ORDER.map((stageKey) => {
          const stageInfo = farmer.stages[stageKey] || { status: "LOCKED" };
          const isCompleted = stageInfo.status === "COMPLETED";
          const isActive = stageInfo.status === "ACTIVE";
          const isFlagged = stageInfo.status === "FLAGGED";

          let labelClasses = "text-slate-500 font-semibold";
          if (isCompleted) labelClasses = "text-emerald-700 font-bold";
          else if (isActive) labelClasses = "text-[#2563EB] font-extrabold";
          else if (isFlagged) labelClasses = "text-rose-700 font-bold";

          return (
            <div key={stageKey} className="w-1/4 px-1 flex flex-col items-center">
              <p className={`text-xs sm:text-sm leading-tight ${labelClasses}`}>
                {STAGE_LABELS[stageKey]}
              </p>
              {stageInfo.completedAt && (
                <span className="text-xs text-slate-500 font-medium mt-1">
                  {stageInfo.completedAt}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
