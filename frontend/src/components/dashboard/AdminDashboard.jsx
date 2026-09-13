import React from "react";
import { useApp } from "../../context/AppContext";
import { StatCard } from "../common/StatCard";
import { FlagTable } from "../flags/FlagTable";
import { getBatchCapacityDetails } from "../../utils/queueUtils";
import {
  Ticket,
  Clock,
  Workflow,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Building2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const AdminDashboard = ({ onNavigateTab, onOpenFarmerDetails }) => {
  const { farmers, officers, centres, selectedCentreId, setSelectedCentreId, slotConfig } = useApp();


  const [selectedDate, setSelectedDate] = React.useState("Today");
  const [selectedBatchFilter, setSelectedBatchFilter] = React.useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState("All");

  const currentCentre = centres.find((c) => c.id === selectedCentreId) || centres[0];
  const maxDailyCap = currentCentre?.dailyCapacity || 100;

  // PRD 5 Metrics
  const todaysBookings = farmers.length;
  const activeFarmers = farmers.filter((f) => f.status !== "COMPLETED" && f.status !== "CANCELLED").length;
  const waitingCount = farmers.filter((f) => f.status === "BOOKED" || f.status === "ARRIVED").length;
  const currentlyProcessing = farmers.filter((f) =>
    ["WEIGHING", "QUALITY", "PROCUREMENT"].includes(f.status)
  ).length;
  const completedProcurements = farmers.filter((f) => f.status === "COMPLETED" || f.currentStage === "payment").length;
  const pendingPayments = farmers.filter((f) => f.currentStage === "payment" && f.status !== "COMPLETED").length;
  const availableSlots = Math.max(0, maxDailyCap - todaysBookings);
  const centreUtilizationPercentage = Math.min(100, Math.round((todaysBookings / maxDailyCap) * 100));

  const pendingOfficerReqs = officers.filter((o) => o.status === "PENDING").length;

  const stageCounts = {
    arrival: farmers.filter((f) => f.currentStage === "arrival" && f.status !== "COMPLETED").length,
    weighing: farmers.filter((f) => f.currentStage === "weighing" && f.status !== "COMPLETED").length,
    quality: farmers.filter((f) => f.currentStage === "quality" && f.status !== "COMPLETED").length,
    procurement: farmers.filter((f) => f.currentStage === "procurement" && f.status !== "COMPLETED").length,
    payment: farmers.filter((f) => f.currentStage === "payment" && f.status !== "COMPLETED").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs card-hover-effect">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Centre Operations Command Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> MSP Procurement Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Department of Agricultural Marketing — Government Procurement Portal (PRD Section 5 Metrics & Telemetry)
          </p>
        </div>

        {pendingOfficerReqs > 0 && (
          <button
            onClick={() => onNavigateTab("officer-requests")}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all duration-200"
          >
            <UserCheck className="w-4 h-4 text-slate-950" />
            <span>Review {pendingOfficerReqs} Pending Requests</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        )}
      </div>

      {/* Dashboard Filter Bar (PRD Section 5 Filters) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Building2 className="w-4 h-4 text-[#0F2B5C]" />
          <span>Dashboard Interactive Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Centre Filter */}
          <select
            value={selectedCentreId}
            onChange={(e) => setSelectedCentreId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none"
          >
            {centres.map((c) => (
              <option key={c.id} value={c.id}>🏢 {c.name}</option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none"
          >
            <option value="Today">📅 Today (13 Sep 2026)</option>
            <option value="Tomorrow">📅 Tomorrow</option>
            <option value="ThisWeek">📅 This Week</option>
          </select>

          {/* Batch Filter */}
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none"
          >
            <option value="All">🕒 All Batches</option>
            <option value="Morning">Morning Batch</option>
            <option value="Afternoon">Afternoon Batch</option>
            <option value="Evening">Evening Batch</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 text-xs font-bold border border-slate-300 rounded-lg focus:outline-none"
          >
            <option value="All">⚡ All Statuses</option>
            <option value="BOOKED">Booked</option>
            <option value="ARRIVED">Arrived</option>
            <option value="WEIGHING">Weighing</option>
            <option value="QUALITY">Quality Check</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* PRD Section 5: 8 Essential Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5 sm:gap-3">
        <StatCard
          title="Today's Bookings"
          value={todaysBookings}
          subtitle="Issued Slots"
          icon={Ticket}
          color="slate"
          onClick={() => onNavigateTab("farmers")}
        />
        <StatCard
          title="Active Farmers"
          value={activeFarmers}
          subtitle="On Premises"
          icon={Building2}
          color="blue"
          onClick={() => onNavigateTab("queue-monitor")}
        />
        <StatCard
          title="Farmers Waiting"
          value={waitingCount}
          subtitle="Gate / Check-in"
          icon={Clock}
          color="blue"
          onClick={() => onNavigateTab("queue-monitor")}
        />
        <StatCard
          title="Currently Processing"
          value={currentlyProcessing}
          subtitle="Weighing & Lab"
          icon={Workflow}
          color="emerald"
          onClick={() => onNavigateTab("procurement-monitor")}
        />
        <StatCard
          title="Completed"
          value={completedProcurements}
          subtitle="Procurements"
          icon={CheckCircle2}
          color="indigo"
          onClick={() => onNavigateTab("history")}
        />
        <StatCard
          title="Pending Payments"
          value={pendingPayments}
          subtitle="Awaiting Payout"
          icon={Clock}
          color="amber"
          onClick={() => onNavigateTab("queue-monitor")}
        />
        <StatCard
          title="Available Slots"
          value={availableSlots}
          subtitle="Remaining Cap"
          icon={Ticket}
          color="emerald"
          onClick={() => onNavigateTab("batch-capacity")}
        />
        <StatCard
          title="Centre Utilization"
          value={`${centreUtilizationPercentage}%`}
          subtitle="Capacity Used"
          icon={ShieldCheck}
          color="indigo"
          onClick={() => onNavigateTab("batch-capacity")}
        />
      </div>


      {/* Procurement Pipeline Status Gauge */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs card-hover-effect">
        <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Workflow className="w-4 h-4 text-[#102A56]" />
          <span>Procurement Sequential Pipeline Status</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-center transition-transform hover:scale-[1.02]">
            <span className="text-xs font-bold text-blue-900 uppercase block">1. Arrival Gate</span>
            <span className="text-2xl font-extrabold text-blue-900 mt-1 block font-mono">{stageCounts.arrival}</span>
            <span className="text-xs text-blue-700 font-medium">Arrived / Calling</span>
          </div>
          <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 text-center transition-transform hover:scale-[1.02]">
            <span className="text-xs font-bold text-indigo-900 uppercase block">2. Weighbridge</span>
            <span className="text-2xl font-extrabold text-indigo-900 mt-1 block font-mono">{stageCounts.weighing}</span>
            <span className="text-xs text-indigo-700 font-medium">Weighing Active</span>
          </div>
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-center transition-transform hover:scale-[1.02]">
            <span className="text-xs font-bold text-amber-900 uppercase block">3. Quality Lab</span>
            <span className="text-2xl font-extrabold text-amber-900 mt-1 block font-mono">{stageCounts.quality}</span>
            <span className="text-xs text-amber-700 font-medium">Moisture / Grade</span>
          </div>
          <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 text-center transition-transform hover:scale-[1.02]">
            <span className="text-xs font-bold text-purple-900 uppercase block">4. Procurement Order</span>
            <span className="text-2xl font-extrabold text-purple-900 mt-1 block font-mono">{stageCounts.procurement}</span>
            <span className="text-xs text-purple-700 font-medium">Rate / Slip</span>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-center transition-transform hover:scale-[1.02]">
            <span className="text-xs font-bold text-emerald-900 uppercase block">5. DBT Payment</span>
            <span className="text-2xl font-extrabold text-emerald-900 mt-1 block font-mono">{stageCounts.payment}</span>
            <span className="text-xs text-emerald-700 font-medium">Bank Transfer</span>
          </div>
        </div>
      </div>

      {/* Batch Occupancy Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 card-hover-effect">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#102A56]" />
          <span>Batch Occupancy & Slot Capacity Analytics</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(slotConfig).map(([slotName, slotObj]) => (
            <div key={slotName} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900 text-xs">{slotName} Session</span>
                <span className="text-xs text-slate-500 font-medium">{slotObj.mainTime}</span>
              </div>
              <div className="space-y-2.5">
                {slotObj.batches.map((b) => {
                  const details = getBatchCapacityDetails(slotName, b.name, farmers, slotConfig);
                  const pct = Math.min(100, Math.round((details.occupied / details.capacity) * 100));
                  return (
                    <div key={b.id} className="text-xs">
                      <div className="flex justify-between font-semibold text-slate-700 mb-1">
                        <span>{b.name} ({b.time})</span>
                        <span className="font-mono">
                          {details.occupied}/{details.capacity} ({details.isFull ? "FULL" : `${details.available} left`})
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            details.isFull ? "bg-rose-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Flags Table Component */}
      <FlagTable onOpenFarmerDetails={onOpenFarmerDetails} />
    </div>
  );
};
