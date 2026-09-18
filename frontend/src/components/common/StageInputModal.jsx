import React, { useState, useEffect } from "react";
import { X, Scale, Award, CreditCard, CheckCircle2, ShieldCheck, Edit3 } from "lucide-react";
import { STAGE_LABELS } from "../../utils/queueUtils";

export const StageInputModal = ({ isOpen, onClose, farmer, stageKey, isEdit = false, onSubmit }) => {
  const [weight, setWeight] = useState("");
  const [grade, setGrade] = useState("Grade A (Premium)");
  const [remarks, setRemarks] = useState("");
  const [txnRef, setTxnRef] = useState("");

  useEffect(() => {
    if (farmer) {
      // Pre-fill weight
      const initialWeight = farmer.measuredWeightQuintals || farmer.expectedQuantityQuintals || 50;
      setWeight(initialWeight);

      // Pre-fill quality grade
      setGrade(farmer.qualityGrade || "Grade A (Premium)");

      // Pre-fill transaction ref
      const defaultRef = farmer.transactionRef || `DBT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      setTxnRef(defaultRef);
    }
  }, [farmer, stageKey]);

  if (!isOpen || !farmer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    let payload = {};

    if (stageKey === "weighing") {
      const parsedWeight = parseFloat(weight);
      if (isNaN(parsedWeight) || parsedWeight <= 0) {
        alert("Please enter a valid weight in Quintals.");
        return;
      }
      payload = { measuredWeightQuintals: parsedWeight };
    } else if (stageKey === "quality") {
      payload = { qualityGrade: grade, qualityRemarks: remarks };
    } else if (stageKey === "payment") {
      if (!txnRef.trim()) {
        alert("Please enter a DBT Transaction Reference.");
        return;
      }
      const weightUsed = farmer.measuredWeightQuintals || farmer.expectedQuantityQuintals || 50;
      const rateUsed = farmer.procurementRatePerQuintal || 2275;
      payload = {
        transactionRef: txnRef,
        totalAmountPaid: weightUsed * rateUsed,
      };
    }

    onSubmit(farmer.id, stageKey, payload, isEdit);
    onClose();
  };

  const expectedWeight = farmer.expectedQuantityQuintals || farmer.declaredWeight || 50;
  const rate = farmer.procurementRatePerQuintal || 2275;
  const currentWeightNum = parseFloat(weight) || expectedWeight;
  const totalAmount = currentWeightNum * rate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#102A56] to-[#1e427d] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              {stageKey === "weighing" && <Scale className="w-5 h-5 text-amber-300" />}
              {stageKey === "quality" && <Award className="w-5 h-5 text-emerald-300" />}
              {stageKey === "payment" && <CreditCard className="w-5 h-5 text-blue-300" />}
              {stageKey === "arrival" && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>{isEdit ? `Edit ${STAGE_LABELS[stageKey]} Data` : STAGE_LABELS[stageKey]}</span>
                {isEdit && <span className="text-[10px] bg-amber-400/30 text-amber-200 border border-amber-300/40 px-2 py-0.5 rounded-full font-bold">EDIT MODE</span>}
              </h3>
              <p className="text-xs text-blue-200">
                {farmer.tokenNumber || `TBR-${farmer.id}`} • {farmer.farmerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Farmer Summary Pill */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Farmer / Commodity</span>
              <strong className="text-slate-900 font-bold">{farmer.farmerName} ({farmer.crop || farmer.commodity || "Wheat"})</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Expected Weight</span>
              <strong className="text-emerald-700 font-bold">{expectedWeight} Quintals</strong>
            </div>
          </div>

          {/* WEIGHING INPUT */}
          {stageKey === "weighing" && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Enter Measured Weight (in Quintals)
              </label>
              <div className="flex rounded-xl border-2 border-slate-300 overflow-hidden focus-within:border-[#102A56] focus-within:ring-2 focus-within:ring-[#102A56]/20 transition-all bg-slate-50">
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent font-mono text-xl font-black text-slate-900 outline-none"
                  placeholder="e.g. 50.5"
                  required
                  autoFocus
                />
                <div className="bg-slate-200/80 px-4 flex items-center justify-center border-l border-slate-300 text-xs font-extrabold text-slate-700 uppercase tracking-wider select-none shrink-0">
                  Quintals
                </div>
              </div>

              {/* Quick Preset Helpers */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setWeight(expectedWeight)}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  Match Expected ({expectedWeight})
                </button>
                <button
                  type="button"
                  onClick={() => setWeight((prev) => Math.max(0, (parseFloat(prev) || expectedWeight) - 0.5))}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  -0.5 Q
                </button>
                <button
                  type="button"
                  onClick={() => setWeight((prev) => (parseFloat(prev) || expectedWeight) + 0.5)}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition"
                >
                  +0.5 Q
                </button>
              </div>
            </div>
          )}

          {/* QUALITY INPUT */}
          {stageKey === "quality" && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Select Quality Inspection Grade
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { name: "Grade A (Premium)", color: "emerald", border: "emerald" },
                  { name: "Grade B (Standard)", color: "blue", border: "blue" },
                  { name: "Grade C (Sub-Standard)", color: "amber", border: "amber" },
                  { name: "Rejected (Failed)", color: "rose", border: "rose" },
                ].map((g) => {
                  const isSelected = grade === g.name;
                  return (
                    <button
                      key={g.name}
                      type="button"
                      onClick={() => setGrade(g.name)}
                      className={`p-3 rounded-xl border font-bold text-left transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? `bg-${g.color}-50 border-${g.color}-500 text-${g.color}-900 ring-2 ring-${g.color}-300`
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{g.name}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Inspection Remarks (Optional)
                </label>
                <textarea
                  rows="2"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Moisture content 11%, clean grain."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-slate-400"
                ></textarea>
              </div>
            </div>
          )}

          {/* PAYMENT INPUT */}
          {stageKey === "payment" && (
            <div className="space-y-3">
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs space-y-1">
                <div className="flex justify-between text-emerald-800">
                  <span>Weight Settled:</span>
                  <strong>{currentWeightNum} Quintals</strong>
                </div>
                <div className="flex justify-between text-emerald-800">
                  <span>MSP Procurement Rate:</span>
                  <strong>₹{rate.toLocaleString()} / Quintal</strong>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-emerald-950 pt-1 border-t border-emerald-200">
                  <span>Total Payable via DBT:</span>
                  <span className="text-emerald-700 font-mono">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                DBT Transaction Reference ID
              </label>
              <input
                type="text"
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 focus:border-[#102A56] focus:bg-white rounded-xl font-mono text-sm font-bold text-slate-900 outline-none transition"
                placeholder="e.g. DBT-2026-98712"
                required
              />
            </div>
          )}

          {/* ARRIVAL INPUT */}
          {stageKey === "arrival" && (
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Confirm Farmer Physical Arrival
              </p>
              <p>
                Verify identity of <strong>{farmer.farmerName}</strong> for Token <strong>{farmer.tokenNumber}</strong> and proceed to check-in.
              </p>
            </div>
          )}

          {/* Footer Submit / Cancel Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#102A56] hover:bg-[#173870] text-white font-bold text-xs shadow-md cursor-pointer transition flex items-center gap-1.5"
            >
              {isEdit ? <Edit3 className="w-4 h-4 text-amber-300" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              <span>{isEdit ? "Update Stage Data" : "Save & Complete Stage"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
