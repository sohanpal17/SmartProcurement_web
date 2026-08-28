import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { TokenCard } from "../components/tokens/TokenCard";
import { filterTokensByTab } from "../utils/queueUtils";
import { Search, Ticket } from "lucide-react";

export const QueueMonitorPage = ({ onOpenReschedule, onOpenFlag, onOpenFarmerDetails }) => {
  const { farmers } = useApp();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  let filtered = filterTokensByTab(farmers, activeTab);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (f) =>
        f.tokenNumber.toLowerCase().includes(q) ||
        f.farmerName.toLowerCase().includes(q) ||
        f.phone.includes(q) ||
        f.crop.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

        <div>
          <h2 className="text-xl font-black text-slate-900">Mandi Live Queue Monitor</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Department of Agricultural Marketing - Real-time status of active tokens and sequential workflow state.
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Token #, Name, Phone..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: "all", label: "All Tokens", count: farmers.length },
          { id: "waiting", label: "Waiting Queue", count: farmers.filter((f) => f.status === "BOOKED" || f.status === "ARRIVED").length },
          { id: "active", label: "Active Processing", count: farmers.filter((f) => ["ARRIVED", "WEIGHING", "QUALITY", "PROCUREMENT", "PAYMENT"].includes(f.status)).length },
          { id: "late", label: "Late Farmers", count: farmers.filter((f) => f.status === "LATE").length },
          { id: "flagged", label: "Flagged Issues", count: farmers.filter((f) => f.status === "FLAGGED").length },
          { id: "completed", label: "Completed", count: farmers.filter((f) => f.status === "COMPLETED").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#102A56] text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Queue List */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center text-slate-400">
            No tokens match your search or filter criteria.
          </div>
        ) : (
          filtered.map((farmer) => (
            <TokenCard
              key={farmer.id}
              farmer={farmer}
              onOpenReschedule={onOpenReschedule}
              onOpenFlag={onOpenFlag}
              onOpenFarmerDetails={onOpenFarmerDetails}
            />
          ))
        )}
      </div>
    </div>
  );
};
