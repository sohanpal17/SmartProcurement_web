import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ArrowRight, Search, FileText } from "lucide-react";

export const HistoryPage = ({ onOpenFarmerDetails }) => {
  const { farmers } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  // Only COMPLETED tokens should be visible in audit history
  const completedFarmers = farmers.filter((f) => f.status === "COMPLETED");

  const allAuditLog = [];
  completedFarmers.forEach((f) => {
    if (f.history && f.history.length > 0) {
      f.history.forEach((h) => {
        if (
          !h.event?.toLowerCase().includes("procurement payout") &&
          !h.event?.toLowerCase().includes("procurement officer") &&
          !h.actor?.toLowerCase().includes("procurement")
        ) {
          allAuditLog.push({
            ...h,
            farmerId: f.id,
            tokenNumber: f.tokenNumber,
            farmerName: f.farmerName,
            crop: f.crop || f.commodity,
            slot: f.slot || "Morning",
            date: h.timestamp || "Today",
          });
        }
      });
    } else {
      allAuditLog.push({
        farmerId: f.id,
        tokenNumber: f.tokenNumber,
        farmerName: f.farmerName,
        crop: f.crop || f.commodity,
        slot: f.slot || "Morning",
        date: "Today",
        event: "Token Procurement Completed",
      });
    }
  });

  const filteredLog = allAuditLog.filter(
    (item) =>
      item.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.slot.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort by Date and Slot wise
  const slotOrder = { Morning: 1, Afternoon: 2, Evening: 3 };
  filteredLog.sort((a, b) => {
    const dateA = a.date || "";
    const dateB = b.date || "";
    const dateCompare = dateA.localeCompare(dateB);
    if (dateCompare !== 0) return dateCompare;

    const slotA = slotOrder[a.slot] || 99;
    const slotB = slotOrder[b.slot] || 99;
    return slotA - slotB;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Audit History</h2>
          <p className="text-xs text-slate-500 mt-1">
            Department of Agricultural Marketing - Complete audit trail of stage completions and activity logs.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit history by Token #, Name..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Full Audit Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#102A56]" />
          <h3 className="text-sm font-bold text-slate-900">System Activity Stream</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Token No.</th>
                <th className="px-6 py-3.5">Farmer Name</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Slot</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLog.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    No activity entries found matching search.
                  </td>
                </tr>
              ) : (
                filteredLog.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#102A56]">
                      {log.tokenNumber}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {log.farmerName}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {log.date}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">
                      {log.slot}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onOpenFarmerDetails(log.farmerId)}
                        className="text-[#2563EB] hover:underline font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
