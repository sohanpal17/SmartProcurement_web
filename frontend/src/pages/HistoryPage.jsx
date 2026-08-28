import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { CheckCircle2, Clock, User, ArrowRight, Search, FileText } from "lucide-react";

export const HistoryPage = ({ onOpenFarmerDetails }) => {
  const { farmers } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const completedFarmers = farmers.filter((f) => f.status === "COMPLETED");

  const allAuditLog = [];
  farmers.forEach((f) => {
    if (f.history) {
      f.history.forEach((h) => {
        allAuditLog.push({
          ...h,
          farmerId: f.id,
          tokenNumber: f.tokenNumber,
          farmerName: f.farmerName,
          crop: f.crop,
        });
      });
    }
  });

  const filteredLog = allAuditLog.filter(
    (item) =>
      item.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.event.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

        <div>
          <h2 className="text-xl font-black text-slate-900">Audit History & Completed Transactions</h2>
          <p className="text-xs text-slate-500 mt-1">
            Department of Agricultural Marketing - Complete audit trail of stage completions, flags, and payment receipts.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search history by Token #, Name..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Completed Farmers Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Completed Procurement Records ({completedFarmers.length})</span>
        </h3>

        {completedFarmers.length === 0 ? (
          <p className="text-xs text-slate-400">No completed procurement transactions recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedFarmers.map((f) => (
              <div
                key={f.id}
                onClick={() => onOpenFarmerDetails(f.id)}
                className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 hover:border-emerald-400 transition-all cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-[#102A56] text-base">
                    {f.tokenNumber}
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> COMPLETED
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{f.farmerName}</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {f.slot} • {f.batch} | Crop: {f.crop}
                </p>

                <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Payout: <strong className="text-emerald-800">INR {f.totalAmountPaid?.toLocaleString("en-IN") || "N/A"}</strong>
                  </span>
                  <span className="text-[#2563EB] font-semibold flex items-center gap-1 hover:underline">
                    <span>View Audit</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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
                <th className="px-6 py-3.5">Time</th>
                <th className="px-6 py-3.5">Token / Farmer</th>
                <th className="px-6 py-3.5">Event Description</th>
                <th className="px-6 py-3.5">Actor / Officer</th>
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
                    <td className="px-6 py-4 font-mono font-medium text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.timestamp}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-[#102A56]">{log.tokenNumber}</span> -{" "}
                      <span className="text-slate-800 font-semibold">{log.farmerName}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 max-w-md">{log.event}</td>
                    <td className="px-6 py-4 text-slate-600 font-semibold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.actor}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onOpenFarmerDetails(log.farmerId)}
                        className="text-[#2563EB] hover:underline font-semibold flex items-center gap-1 ml-auto"
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
