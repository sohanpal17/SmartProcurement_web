import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Plus,
  ShieldCheck,
  Building2,
  TrendingUp,
} from "lucide-react";
import { getCapacityStatusBadge } from "../utils/queueUtils";

export const BatchCapacityPage = () => {
  const { slotConfig, farmers, centres, selectedCentreId } = useApp();
  const [selectedSlot, setSelectedSlot] = useState("Morning");

  const currentCentre = centres.find((c) => c.id === selectedCentreId) || centres[0];
  const activeSlotObj = slotConfig[selectedSlot];

  // Calculate overall centre capacity utilization
  const totalBooked = farmers.filter((f) => f.status !== "CANCELLED").length;
  const maxDailyCap = currentCentre?.dailyCapacity || 100;
  const utilizationPercentage = Math.min(100, Math.round((totalBooked / maxDailyCap) * 100));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F2B5C] flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Batch & Capacity Config</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            View batch timings, slot capacity limits, and operating status for <strong className="text-slate-800">{currentCentre?.name}</strong>.
          </p>
        </div>
      </div>

      {/* Real-time Capacity Utilization Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0F2B5C]">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Daily Total Capacity</span>
            <div className="text-xl font-black text-slate-900">{maxDailyCap} Farmers / Day</div>
            <span className="text-[11px] text-slate-500 font-semibold">{currentCentre?.name}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Booked Capacity</span>
            <div className="text-xl font-black text-amber-700">{totalBooked} Slots Occupied</div>
            <span className="text-[11px] text-slate-500 font-semibold">{maxDailyCap - totalBooked} Available</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Utilization Rate</span>
            <div className="text-xl font-black text-emerald-700">{utilizationPercentage}%</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full"
                style={{ width: `${utilizationPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Slot & Batch Configuration Grid */}
      <div className="gov-card overflow-hidden">
        {/* Slot Tabs */}
        <div className="bg-[#0F2B5C] p-3 text-white flex items-center gap-2 border-b border-blue-900">
          {Object.keys(slotConfig).map((sName) => {
            const isActive = selectedSlot === sName;
            return (
              <button
                key={sName}
                onClick={() => setSelectedSlot(sName)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-md"
                    : "bg-[#162C5B] text-slate-200 hover:bg-[#1A3A73]"
                }`}
              >
                🕒 {sName} Session ({slotConfig[sName].mainTime})
              </button>
            );
          })}
        </div>

        {/* Batches Table */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {activeSlotObj.name} Batches & Capacity Limits
              </h3>
              <p className="text-xs text-slate-500">
                Official operating window: <strong className="text-slate-800">{activeSlotObj.mainTime}</strong>
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
              ✓ Server-side Capacity Enforced
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeSlotObj.batches.map((batch) => {
              const bookedCount = farmers.filter(
                (f) => f.slot === selectedSlot && f.batch === batch.name && f.status !== "CANCELLED"
              ).length;
              const isFull = bookedCount >= batch.capacity;
              const avail = Math.max(0, batch.capacity - bookedCount);

              return (
                <div
                  key={batch.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isFull
                      ? "bg-rose-50/50 border-rose-200"
                      : "bg-white border-slate-200 hover:border-blue-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-[#0F2B5C] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                      {batch.name}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isFull ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                      }`}
                    >
                      {isFull ? "FULL" : `${avail} SPACES LEFT`}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 font-medium mb-3">
                    ⏰ Time Window: <strong className="text-slate-900">{batch.time}</strong>
                  </div>

                  <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Booked Farmers:</span>
                      <span className="text-[#0F2B5C]">{bookedCount} / {batch.capacity}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${
                          isFull ? "bg-rose-600" : "bg-[#15803D]"
                        }`}
                        style={{ width: `${Math.min(100, (bookedCount / batch.capacity) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">Max Capacity per Batch:</span>
                    <span className="font-extrabold text-slate-900">{batch.capacity} Farmers</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
