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

      {/* Upcoming Queue & Late Farmers Full Width Section */}
      <div className="space-y-6">
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
    </div>
  );
};
