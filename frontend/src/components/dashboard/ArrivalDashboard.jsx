import React from "react";
import { useApp } from "../../context/AppContext";
import { NowServingCard } from "../tokens/NowServingCard";
import { TokenCard } from "../tokens/TokenCard";
import { getBatchCapacityDetails } from "../../utils/queueUtils";
import { Clock, ShieldCheck, ArrowRight } from "lucide-react";

export const ArrivalDashboard = ({ onOpenReschedule, onOpenFarmerDetails }) => {
  const { farmers, slotConfig } = useApp();

  const upcomingQueue = farmers.filter(
    (f) => (f.status === "ARRIVED" || f.status === "BOOKED") && f.status !== "COMPLETED"
  );
  const lateFarmers = farmers.filter((f) => f.status === "LATE");
  const morningBatches = slotConfig.Morning ? slotConfig.Morning.batches : [];
  const morningBuffer = slotConfig.Morning ? slotConfig.Morning.buffer : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero NOW SERVING Card */}

      <NowServingCard onOpenFarmerDetails={onOpenFarmerDetails} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming Queue & Late Farmers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Late Farmers Management */}
          {lateFarmers.length > 0 && (
            <div className="bg-amber-50/90 rounded-2xl border border-amber-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">
                      Late Arriving Farmers ({lateFarmers.length})
                    </h3>
                    <p className="text-xs text-amber-700">
                      Farmers missed original batch window. Reschedule to assign new batch or buffer period.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {lateFarmers.map((farmer) => (
                  <div
                    key={farmer.id}
                    className="bg-white p-4 rounded-xl border border-amber-300 shadow-xs flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-base font-black text-amber-900 font-mono">
                        {farmer.tokenNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{farmer.farmerName}</h4>
                      <p className="text-xs text-slate-500">
                        Original: {farmer.slot} • {farmer.batch} | Crop: {farmer.crop}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenReschedule(farmer)}
                        className="px-4 py-2 bg-[#102A56] hover:bg-[#173763] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <span>Reschedule Token</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Tokens Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Upcoming Tokens Queue ({upcomingQueue.length})
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Ordered by Token sequence & Arrival status
              </span>
            </div>

            {upcomingQueue.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-400">
                No upcoming farmers waiting in arrival queue.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingQueue.map((farmer) => (
                  <TokenCard
                    key={farmer.id}
                    farmer={farmer}
                    onOpenReschedule={onOpenReschedule}
                    onOpenFarmerDetails={onOpenFarmerDetails}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Batch Capacity Monitor Cards */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Morning Session Capacities</h3>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                7:00 AM – 11:00 AM
              </span>
            </div>

            <div className="space-y-3">
              {morningBatches.map((b) => {
                const details = getBatchCapacityDetails("Morning", b.name, farmers, slotConfig);
                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      details.isFull
                        ? "bg-rose-50/60 border-rose-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{b.name} ({b.time})</span>
                      {details.isFull ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px]">
                          FULL (10/10)
                        </span>
                      ) : (
                        <span className="text-emerald-700">
                          {details.available} spaces remaining
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>Occupied: {details.occupied}</span>
                      <span>Total: {details.capacity}</span>
                    </div>
                  </div>
                );
              })}

              {/* Buffer Card */}
              {morningBuffer && (() => {
                const bufDetails = getBatchCapacityDetails("Morning", morningBuffer.name, farmers, slotConfig);
                return (
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-amber-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                        <span>Buffer Period ({morningBuffer.time})</span>
                      </span>
                      <span className="text-amber-800 font-bold">
                        {bufDetails.available} spaces
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700 mt-1">
                      Reserved for rescheduled / delayed farmers
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
