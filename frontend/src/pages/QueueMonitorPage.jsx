import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { TokenCard } from "../components/tokens/TokenCard";
import { filterTokensByTab } from "../utils/queueUtils";
import { Search, Ticket } from "lucide-react";

export const QueueMonitorPage = ({ onOpenReschedule, onOpenFlag, onOpenFarmerDetails }) => {
  const { farmers, centres, selectedCentreId, setSelectedCentreId } = useApp();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedBatch, setSelectedBatch] = useState("All");

  const currentCentre = centres.find((c) => c.id === selectedCentreId) || centres[0];

  let filtered = filterTokensByTab(farmers, activeTab);

  if (selectedBatch !== "All") {
    filtered = filtered.filter((f) => f.batch && f.batch.toLowerCase().includes(selectedBatch.toLowerCase()));
  }

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
          <h2 className="text-xl font-extrabold text-slate-900">Centre Live Queue Management</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            PRD Section 7 — Operational queue telemetry filtered by Centre → Date → Batch.
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Token #, Farmer Name, Phone..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F2B5C] shadow-xs font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* PRD Section 7 Filter Control: Centre → Date → Batch */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Ticket className="w-4 h-4 text-[#0F2B5C]" />
          <span>Operational Queue Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <span>🏢 Centre:</span>
            <select
              value={selectedCentreId}
              onChange={(e) => setSelectedCentreId(e.target.value)}
              className="bg-transparent text-[#0F2B5C] font-extrabold focus:outline-none cursor-pointer"
            >
              {centres.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <span>📅 Date:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-[#0F2B5C] font-extrabold focus:outline-none cursor-pointer"
            >
              <option value="Today">Today (13 Sep 2026)</option>
              <option value="Tomorrow">Tomorrow</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <span>🕒 Batch:</span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="bg-transparent text-[#0F2B5C] font-extrabold focus:outline-none cursor-pointer"
            >
              <option value="All">All Batches</option>
              <option value="Batch 1">Batch 1 (07:00 - 08:00)</option>
              <option value="Batch 2">Batch 2 (08:00 - 09:00)</option>
              <option value="Batch 3">Batch 3 (09:00 - 10:00)</option>
            </select>
          </div>
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
