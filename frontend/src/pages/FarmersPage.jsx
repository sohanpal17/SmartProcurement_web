import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { StatusBadge } from "../components/common/Badge";
import { Search, ArrowRight, ShieldCheck } from "lucide-react";

export const FarmersPage = ({ onOpenFarmerDetails }) => {
  const { farmers } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  let filtered = farmers;

  if (statusFilter !== "ALL") {
    filtered = filtered.filter((f) => f.status === statusFilter);
  }

  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (f) =>
        (f.tokenNumber || f.token_number || "").toLowerCase().includes(q) ||
        (f.farmerName || "").toLowerCase().includes(q) ||
        (f.phone || "").includes(q) ||
        (f.crop || f.commodity || "").toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

        <div>
          <h2 className="text-xl font-black text-slate-900">Farmer Token Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Department of Agricultural Marketing - Search and inspect procurement records of registered farmers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="BOOKED">BOOKED</option>
            <option value="ARRIVED">ARRIVED</option>
            <option value="WEIGHING">WEIGHING</option>
            <option value="QUALITY">QUALITY</option>
            <option value="PROCUREMENT">PROCUREMENT</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="FLAGGED">FLAGGED</option>
            <option value="LATE">LATE</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search farmer name, token..."
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Token #</th>
                <th className="px-6 py-3.5">Farmer Name</th>
                <th className="px-6 py-3.5">Phone Number</th>
                <th className="px-6 py-3.5">Crop Commodity</th>
                <th className="px-6 py-3.5">Slot & Batch</th>
                <th className="px-6 py-3.5">Booked Qty</th>
                <th className="px-6 py-3.5">Current Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                    No farmers found matching query.
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-black text-slate-900 text-sm">
                      {f.tokenNumber || f.token_number || f.token_no || `TBR-${f.id}`}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{f.farmerName}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono">{f.phone}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{f.crop || f.commodity || "Crop"}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {f.slot} • {f.batch}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {f.expectedQuantityQuintals} Q
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onOpenFarmerDetails(f.id)}
                        className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#102A56] font-bold rounded-xl border border-blue-200 transition-all flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <span>View Details</span>
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
