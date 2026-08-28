import React from "react";
import { CheckCircle2, AlertTriangle, Clock, Lock, ShieldCheck } from "lucide-react";

export const StageBadge = ({ status }) => {
  switch (status) {
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Completed
        </span>
      );
    case "ACTIVE":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300 animate-pulse-subtle">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          Active
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Pending
        </span>
      );
    case "FLAGGED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          Flagged
        </span>
      );
    case "LOCKED":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          Locked
        </span>
      );
  }
};

export const StatusBadge = ({ status }) => {
  switch (status) {
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          COMPLETED
        </span>
      );
    case "FLAGGED":
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
          <AlertTriangle className="w-3.5 h-3.5" />
          FLAGGED
        </span>
      );
    case "LATE":
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
          <Clock className="w-3.5 h-3.5" />
          LATE
        </span>
      );
    case "ARRIVED":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#2563EB] text-white shadow-xs">
          ARRIVED
        </span>
      );
    case "WEIGHING":
    case "QUALITY":
    case "PROCUREMENT":
    case "PAYMENT":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#102A56] text-white shadow-xs">
          {status}
        </span>
      );
    case "BOOKED":
    default:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 border border-slate-300">
          BOOKED
        </span>
      );
  }
};
