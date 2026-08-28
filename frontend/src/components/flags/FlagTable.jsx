import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { STAGE_LABELS } from "../../utils/queueUtils";
import { Modal } from "../common/Modal";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

export const FlagTable = ({ onOpenFarmerDetails }) => {
  const { farmers, resolveFlag, currentDemoRole } = useApp();
  const [selectedFlagForResolve, setSelectedFlagForResolve] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState("Issue inspected and cleared by Admin.");

  const allFlags = [];
  farmers.forEach((f) => {
    if (f.flags && f.flags.length > 0) {
      f.flags.forEach((fl) => {
        allFlags.push({
          ...fl,
          farmerId: f.id,
          tokenNumber: f.tokenNumber,
          farmerName: f.farmerName,
          crop: f.crop,
        });
      });
    }
  });

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!selectedFlagForResolve) return;
    resolveFlag(
      selectedFlagForResolve.farmerId,
      selectedFlagForResolve.id,
      resolutionNotes
    );
    setSelectedFlagForResolve(null);
  };

  const isAdmin = currentDemoRole === "Admin";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Procurement Flag Monitoring</h3>
          <p className="text-xs text-slate-500">Active and resolved stage issue reports</p>
        </div>
        <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold border border-rose-200 flex items-center gap-1.5 whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>{allFlags.filter((f) => f.status === "ACTIVE").length} Active Flags</span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5 whitespace-nowrap">Token / Farmer</th>
              <th className="px-6 py-3.5 whitespace-nowrap">Stage</th>
              <th className="px-6 py-3.5 whitespace-nowrap">Issue Description</th>
              <th className="px-6 py-3.5 whitespace-nowrap">Reported By</th>
              <th className="px-6 py-3.5 whitespace-nowrap">Created At</th>
              <th className="px-6 py-3.5 whitespace-nowrap">Status</th>
              <th className="px-6 py-3.5 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allFlags.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                  No flags recorded. All procurement stages running smoothly.
                </td>
              </tr>
            ) : (
              allFlags.map((flag) => (
                <tr key={flag.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap align-middle">
                    <span
                      onClick={() => onOpenFarmerDetails(flag.farmerId)}
                      className="font-bold text-[#2563EB] hover:underline cursor-pointer font-mono text-sm block"
                    >
                      {flag.tokenNumber}
                    </span>
                    <span className="text-xs text-slate-600 font-semibold">{flag.farmerName}</span>
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    <span className="font-semibold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 whitespace-nowrap inline-block text-xs">
                      {STAGE_LABELS[flag.stage] || flag.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-rose-900 max-w-xs leading-relaxed align-middle">
                    {flag.issue}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap align-middle">
                    {flag.reportedBy}
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap align-middle">
                    {flag.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-middle">
                    {flag.status === "ACTIVE" ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-300 inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> ACTIVE
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> RESOLVED
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap align-middle">
                    {flag.status === "ACTIVE" && isAdmin ? (
                      <button
                        onClick={() => setSelectedFlagForResolve(flag)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve Flag</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenFarmerDetails(flag.farmerId)}
                        className="text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1"
                      >
                        <span>View Audit Log</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Admin Resolve Modal */}
      {selectedFlagForResolve && (
        <Modal
          isOpen={!!selectedFlagForResolve}
          onClose={() => setSelectedFlagForResolve(null)}
          title={`Resolve Flag for Token ${selectedFlagForResolve.tokenNumber}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleResolveSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <p className="text-slate-500">
                Farmer: <strong className="text-slate-800">{selectedFlagForResolve.farmerName}</strong>
              </p>
              <p className="text-slate-500 mt-1">
                Issue: <span className="text-rose-800 font-semibold">{selectedFlagForResolve.issue}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resolution Notes / Action Taken <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Describe resolution details..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedFlagForResolve(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Flag Resolved</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
