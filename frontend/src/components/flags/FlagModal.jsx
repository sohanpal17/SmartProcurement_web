import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Modal } from "../common/Modal";
import { STAGE_LABELS } from "../../utils/queueUtils";
import { AlertTriangle } from "lucide-react";

export const FlagModal = ({ isOpen, onClose, farmer, stageKey }) => {
  const { flagStage } = useApp();
  const [reason, setReason] = useState("");

  if (!farmer || !stageKey) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    flagStage(farmer.id, stageKey, reason);
    setReason("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Flag Stage Issue for Token ${farmer.tokenNumber}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">Flagging Stage: {STAGE_LABELS[stageKey] || stageKey}</p>
            <p>
              Flagging this stage will freeze farmer processing and notify Centre Admin for review.

              Subsequent stages remain locked until cleared.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Specify Issue Justification <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            placeholder="e.g. Weight discrepancy detected (58.5 Q vs 45 Q expected)..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Submit Issue Flag</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
