import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Settings, Building2, Clock, Plus, Save } from "lucide-react";

export const SettingsPage = () => {
  const { mandiInfo, slotConfig, updateEveningSlotConfig } = useApp();

  const [eveningBatches, setEveningBatches] = useState(
    slotConfig.Evening ? slotConfig.Evening.batches : []
  );

  const handleBatchChange = (index, field, value) => {
    const updated = [...eveningBatches];
    updated[index] = { ...updated[index], [field]: value };
    setEveningBatches(updated);
  };

  const handleSaveEveningConfig = (e) => {
    e.preventDefault();
    updateEveningSlotConfig(eveningBatches);
  };

  const handleAddBatch = () => {
    const nextNum = eveningBatches.length + 1;
    setEveningBatches([
      ...eveningBatches,
      {
        id: `e-b${nextNum}`,
        name: `Batch ${nextNum}`,
        time: "19:30 - 20:30",
        capacity: 10,
      },
    ]);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>

        <h2 className="text-xl font-black text-slate-900">Centre System & Slot Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Department of Agricultural Marketing - Configure Centre profile and custom Evening slot batch divisions.
        </p>
      </div>

      {/* Centre Profile */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#102A56]" />
          <span>Department & Procurement Centre Profile</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Department</label>
            <input
              type="text"
              disabled
              value={mandiInfo.department || "Department of Agricultural Marketing"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-800 font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Portal Name</label>
            <input
              type="text"
              disabled
              value={mandiInfo.portalName || "Government Procurement Portal"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-800 font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Centre Name & Registration Code</label>
            <input
              type="text"
              disabled
              value={`${mandiInfo.name} (${mandiInfo.code})`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-800 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Director / Admin Contact</label>
            <input
              type="text"
              disabled
              value={`${mandiInfo.adminName} (${mandiInfo.contactPhone})`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Fixed Slots Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#102A56]" />
          <span>Primary Operating Slots Summary</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Morning Slot</h4>
            <p className="text-slate-500 mt-0.5">Main: 7:00 AM – 10:00 AM | Buffer: 10:00 AM – 11:00 AM</p>
            <ul className="mt-2 space-y-1 text-slate-700">
              <li>• Batch 1 (07:00 - 08:00)</li>
              <li>• Batch 2 (08:00 - 09:00)</li>
              <li>• Batch 3 (09:00 - 10:00)</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Afternoon Slot</h4>
            <p className="text-slate-500 mt-0.5">Main: 12:00 PM – 3:00 PM | Buffer: 3:00 PM – 4:00 PM</p>
            <ul className="mt-2 space-y-1 text-slate-700">
              <li>• Batch 1 (12:00 - 13:00)</li>
              <li>• Batch 2 (13:00 - 14:00)</li>
              <li>• Batch 3 (14:00 - 15:00)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Evening Slot Customization */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Evening Slot Batch Division Configuration
            </h3>
            <p className="text-xs text-slate-500">
              Evening slot operates from 5:00 PM – 8:00 PM (No buffer). Customize batch split below:
            </p>
          </div>

          <button
            onClick={handleAddBatch}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Batch</span>
          </button>
        </div>

        <form onSubmit={handleSaveEveningConfig} className="space-y-4">
          {eveningBatches.map((batch, idx) => (
            <div key={batch.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Batch Label</label>
                <input
                  type="text"
                  value={batch.name}
                  onChange={(e) => handleBatchChange(idx, "name", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Time Window</label>
                <input
                  type="text"
                  value={batch.time}
                  onChange={(e) => handleBatchChange(idx, "time", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Target Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={batch.capacity}
                  onChange={(e) => handleBatchChange(idx, "capacity", parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                />
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#102A56] hover:bg-[#173763] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Save Evening Slot Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
