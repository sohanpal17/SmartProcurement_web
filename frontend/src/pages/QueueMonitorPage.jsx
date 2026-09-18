import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { STAGE_LABELS, filterTokensByTab, getDisplaySlot } from "../utils/queueUtils";
import { Search, Ticket, ArrowRight, Calendar, Clock } from "lucide-react";

export const QueueMonitorPage = ({ onOpenReschedule, onOpenFlag, onOpenFarmerDetails }) => {
  const { farmers } = useApp();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedBatch, setSelectedBatch] = useState("All");

  // Stage line counts
  const arrivalLineCount = farmers.filter((f) => f.currentStage === "arrival" && f.status !== "COMPLETED").length;
  const weighingLineCount = farmers.filter((f) => f.currentStage === "weighing" && f.status !== "COMPLETED").length;
  const qualityLineCount = farmers.filter((f) => f.currentStage === "quality" && f.status !== "COMPLETED").length;
  const paymentLineCount = farmers.filter((f) => f.currentStage === "payment" && f.status !== "COMPLETED").length;
  const flaggedCount = farmers.filter((f) => f.status === "FLAGGED").length;
  const completedCount = farmers.filter((f) => f.status === "COMPLETED").length;

  let filtered = farmers;
  if (activeTab === "arrival") {
    filtered = farmers.filter((f) => f.currentStage === "arrival" && f.status !== "COMPLETED");
  } else if (activeTab === "weighing") {
    filtered = farmers.filter((f) => f.currentStage === "weighing" && f.status !== "COMPLETED");
  } else if (activeTab === "quality") {
    filtered = farmers.filter((f) => f.currentStage === "quality" && f.status !== "COMPLETED");
  } else if (activeTab === "payment") {
    filtered = farmers.filter((f) => f.currentStage === "payment" && f.status !== "COMPLETED");
  } else if (activeTab === "flagged") {
    filtered = farmers.filter((f) => f.status === "FLAGGED");
  } else if (activeTab === "completed") {
    filtered = farmers.filter((f) => f.status === "COMPLETED");
  } else if (activeTab === "late") {
    filtered = farmers.filter((f) => f.status === "LATE");
  } else {
    filtered = filterTokensByTab(farmers, activeTab);
  }

  if (selectedBatch !== "All") {
    filtered = filtered.filter((f) => f.batch && f.batch.toLowerCase().includes(selectedBatch.toLowerCase()));
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (f) =>
        f.tokenNumber.toLowerCase().includes(q) ||
        f.farmerName.toLowerCase().includes(q) ||
        (f.phone && f.phone.includes(q)) ||
        (f.crop && f.crop.toLowerCase().includes(q))
    );
  }

  const getFormattedDate = (farmer) => {
    const dStr = farmer.date || farmer.created_at || (farmer.history && farmer.history[0]?.timestamp);
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const todayFormatted = `${day}/${month}/${year}`;

    if (!dStr) return todayFormatted;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dStr)) return dStr;
    const parsed = new Date(dStr);
    if (!isNaN(parsed.getTime())) {
      const pDay = String(parsed.getDate()).padStart(2, "0");
      const pMonth = String(parsed.getMonth() + 1).padStart(2, "0");
      const pYear = parsed.getFullYear();
      return `${pDay}/${pMonth}/${pYear}`;
    }
    return todayFormatted;
  };

  const getFormattedTime = (farmer) => {
    if (farmer.history && farmer.history.length > 0 && farmer.history[0].timestamp) {
      const ts = farmer.history[0].timestamp;
      if (ts.includes("AM") || ts.includes("PM") || ts.includes(":")) {
        return ts;
      }
    }
    if (farmer.batch) {
      return farmer.batch.split("–")[0].trim();
    }
    return "08:00 AM";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Operational Live Queue Management</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Live operational queue telemetry by stage lines.
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Token #, Farmer Name..."
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F2B5C] shadow-xs font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Stage Lines Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveTab("arrival")}
          className="bg-blue-50 border border-blue-200 p-4 rounded-xl cursor-pointer hover:shadow-sm transition-all"
        >
          <span className="text-xs font-bold text-blue-900 block uppercase">Check-in / Arrival Line</span>
          <span className="text-2xl font-black text-blue-950 block mt-1 font-mono">{arrivalLineCount}</span>
          <span className="text-[11px] text-blue-700 font-medium">Farmers Arrived</span>
        </div>
        <div
          onClick={() => setActiveTab("weighing")}
          className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl cursor-pointer hover:shadow-sm transition-all"
        >
          <span className="text-xs font-bold text-indigo-900 block uppercase">Weighing Line</span>
          <span className="text-2xl font-black text-indigo-950 block mt-1 font-mono">{weighingLineCount}</span>
          <span className="text-[11px] text-indigo-700 font-medium">Awaiting Weighing</span>
        </div>
        <div
          onClick={() => setActiveTab("quality")}
          className="bg-amber-50 border border-amber-200 p-4 rounded-xl cursor-pointer hover:shadow-sm transition-all"
        >
          <span className="text-xs font-bold text-amber-900 block uppercase">Quality Check Line</span>
          <span className="text-2xl font-black text-amber-950 block mt-1 font-mono">{qualityLineCount}</span>
          <span className="text-[11px] text-amber-700 font-medium">Awaiting Inspection</span>
        </div>
        <div
          onClick={() => setActiveTab("payment")}
          className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl cursor-pointer hover:shadow-sm transition-all"
        >
          <span className="text-xs font-bold text-emerald-900 block uppercase">Payment Line</span>
          <span className="text-2xl font-black text-emerald-950 block mt-1 font-mono">{paymentLineCount}</span>
          <span className="text-[11px] text-emerald-700 font-medium">Awaiting Payment</span>
        </div>
      </div>

      {/* Date & Batch Filter Control */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Ticket className="w-4 h-4 text-[#0F2B5C]" />
          <span>Queue Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Date:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-[#0F2B5C] font-extrabold focus:outline-none cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="Tomorrow">Tomorrow</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Slot:</span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="bg-transparent text-[#0F2B5C] font-extrabold focus:outline-none cursor-pointer"
            >
              <option value="All">All Slots</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: "all", label: "All Tokens", count: farmers.length },
          { id: "arrival", label: "Check-in Line", count: arrivalLineCount },
          { id: "weighing", label: "Weighing Line", count: weighingLineCount },
          { id: "quality", label: "Quality Check Line", count: qualityLineCount },
          { id: "payment", label: "Payment Line", count: paymentLineCount },
          { id: "flagged", label: "Flagged Issues", count: flaggedCount },
          { id: "completed", label: "Completed", count: completedCount },
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

      {/* Centre Administrator Operational Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Token No.</th>
                <th className="px-6 py-3.5">Farmer Name</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Slot</th>
                <th className="px-6 py-3.5">Current Process</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    No tokens match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((farmer) => {
                  const currentProcessLabel = STAGE_LABELS[farmer.currentStage] || farmer.currentStage;
                  const isFlagged = farmer.status === "FLAGGED";
                  const isCompleted = farmer.status === "COMPLETED";
                  
                  const statusText = isFlagged ? "Flagged" : (isCompleted ? "Completed" : "In Process");
                  const statusStyle = isFlagged
                    ? "bg-rose-100 text-rose-800 border-rose-200"
                    : (isCompleted
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : "bg-blue-50 text-[#102A56] border-blue-200");

                  return (
                    <tr key={farmer.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#102A56] text-sm">
                        {farmer.tokenNumber || farmer.token_number || `TBR-${farmer.id}`}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                        {farmer.farmerName}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-700 font-semibold">
                        {getFormattedDate(farmer)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {getDisplaySlot(farmer)}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-semibold">
                        {currentProcessLabel}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyle}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onOpenFarmerDetails(farmer.id)}
                          className="text-[#2563EB] hover:underline font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Info</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
