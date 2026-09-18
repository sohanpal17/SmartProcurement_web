import React from "react";
import { useApp } from "../context/AppContext";
import { STAGE_ORDER, STAGE_LABELS } from "../utils/queueUtils";
import { CheckCircle2, Workflow, AlertTriangle } from "lucide-react";

export const ProcurementMonitorPage = ({ onOpenFarmerDetails }) => {
  const { farmers } = useApp();

  const getStageFarmers = (stageKey) => {
    return farmers.filter((f) => f.currentStage === stageKey && f.status !== "COMPLETED");
  };

  const completedFarmers = farmers.filter((f) => f.status === "COMPLETED");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>

        <h2 className="text-xl font-black text-slate-900">Procurement Workflow Pipeline Monitor</h2>
        <p className="text-xs text-slate-500 mt-1">
          Department of Agricultural Marketing - Real-time stage-by-stage distribution matrix of active tokens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {STAGE_ORDER.map((stageKey, idx) => {
          const stageList = getStageFarmers(stageKey);
          return (
            <div key={stageKey} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col min-w-[200px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Stage {idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{STAGE_LABELS[stageKey]}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 font-black text-xs text-slate-800">
                  {stageList.length}
                </span>
              </div>

              <div className="space-y-2 flex-1 max-h-[500px] overflow-y-auto pr-1">
                {stageList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No active farmers</p>
                ) : (
                  stageList.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => onOpenFarmerDetails(f.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                        f.status === "FLAGGED"
                          ? "bg-rose-50 border-rose-200"
                          : "bg-slate-50 border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-xs text-slate-900">
                          {f.tokenNumber}
                        </span>
                        {f.status === "FLAGGED" && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-1 truncate">{f.farmerName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{f.crop}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completed Summary Bar */}
      <div className="bg-[#102A56] text-white rounded-2xl p-5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Total Completed & Paid Today</h4>
            <p className="text-xs text-blue-200">
              {completedFarmers.length} Farmers successfully processed through all 4 Mandi procurement stages.
            </p>
          </div>
        </div>
        <span className="text-3xl font-black text-amber-400 font-mono">
          {completedFarmers.length}
        </span>
      </div>
    </div>
  );
};
