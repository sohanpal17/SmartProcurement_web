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
  const { farmers, centres, selectedCentreId } = useApp();

  const currentCentre = centres.find((c) => c.id === selectedCentreId) || centres[0];
  const maxDailyCap = currentCentre?.dailyCapacity || 100;

  const todaysBookings = farmers.length;
  const waitingCount = farmers.filter((f) => f.status === "BOOKED" || f.status === "ARRIVED").length;
  const currentlyProcessing = farmers.filter((f) =>
    ["WEIGHING", "QUALITY", "PROCUREMENT"].includes(f.status)
  ).length;
  const completedProcurements = farmers.filter((f) => f.status === "COMPLETED" || f.currentStage === "payment").length;
  const availableSlots = Math.max(0, maxDailyCap - todaysBookings);

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
            Department of Agricultural Marketing — Government Procurement Portal
          </p>
        </div>
      </div>

      {/* 5 Essential Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          title="Today's Bookings"
          value={todaysBookings}
          subtitle="Issued Slots"
          icon={Ticket}
          color="slate"
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
          title="Currently Processing"
          value={currentlyProcessing}
          subtitle="Weighing & Lab"
          icon={Workflow}
          color="emerald"
          onClick={() => onNavigateTab("queue-monitor")}
        />
        <StatCard
          title="Completed Procurement"
          value={completedProcurements}
          subtitle="Procurements"
          icon={CheckCircle2}
          color="indigo"
          onClick={() => onNavigateTab("history")}
        />
        <StatCard
          title="Farmers in Waiting"
          value={waitingCount}
          subtitle="Procurement Not Started"
          icon={Clock}
          color="blue"
          onClick={() => onNavigateTab("queue-monitor")}
        />
      </div>
    </div>
  );
};
