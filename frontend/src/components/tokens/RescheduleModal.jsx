import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Modal } from "../common/Modal";
import { calculateRescheduleOptions } from "../../utils/queueUtils";
import { Clock, CheckCircle2 } from "lucide-react";

export const RescheduleModal = ({ isOpen, onClose, farmer }) => {
  const { slotConfig, farmers, rescheduleToken } = useApp();
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [reason, setReason] = useState("Late arrival due to traffic congestion");

  if (!farmer) return null;

  const options = calculateRescheduleOptions(farmer, slotConfig, farmers);
  const selectedOption = options[selectedOptionIndex] || options[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedOption) return;
    rescheduleToken(farmer.id, selectedOption.slot, selectedOption.batch, reason);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Reschedule Token ${farmer.tokenNumber}`} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>Farmer: <strong className="text-slate-800">{farmer.farmerName}</strong></span>
            <span>Original Slot: <strong className="text-slate-800">{farmer.slot} • {farmer.batch}</strong></span>
          </div>
          <p className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2 font-medium flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Late Farmer Rescheduling Rules Applied (Original batch preserved in audit log)</span>
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Calculated Available Slot Options
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {options.map((opt, idx) => {
              const isSelected = selectedOptionIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedOptionIndex(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "border-[#2563EB] bg-blue-50/70 ring-2 ring-blue-200"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="rescheduleOpt"
                      checked={isSelected}
                      onChange={() => setSelectedOptionIndex(idx)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {opt.title}
                        {opt.recommended && (
                          <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md">
                            RECOMMENDED
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.reason}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        opt.isFull
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {opt.isFull ? "FULL (10/10)" : `${opt.capacity - opt.available}/${opt.capacity} Occupied`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Rescheduling Reason / Justification <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Reason for late arrival..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#102A56] hover:bg-[#173763] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Confirm Reschedule Token</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
