import React from "react";
import { useApp } from "../context/AppContext";
import { Settings, Building2, Clock, LogOut, UserCheck, Shield } from "lucide-react";

export const SettingsPage = () => {
  const { mandiInfo, authUser, currentDemoRole, logoutUser, addToast } = useApp();

  const handleLogout = () => {
    logoutUser();
    if (addToast) addToast("Logged out successfully", "info");
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h2 className="text-xl font-black text-slate-900">Officer System Settings</h2>
        <p className="text-xs text-slate-500 mt-1">
          Department of Agricultural Marketing — Account management & workstation settings.
        </p>
      </div>

      {/* Officer Account Details Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#102A56]" />
          <span>Active Officer Profile & Session Info</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Officer Name</label>
            <input
              type="text"
              disabled
              value={authUser?.fullName || "Centre Official"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-800 font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Email / Officer ID</label>
            <input
              type="text"
              disabled
              value={authUser?.email || "officer@smartprocure.gov.in"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-800 font-semibold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Active Assigned Role</label>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>{currentDemoRole}</span>
            </div>
          </div>
        </div>
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
            <p className="text-slate-500 mt-0.5">Main Operating Hours: 7:00 AM – 10:00 AM</p>
            <ul className="mt-2 space-y-1 text-slate-700">
              <li>• Batch 1 (07:00 - 08:00)</li>
              <li>• Batch 2 (08:00 - 09:00)</li>
              <li>• Batch 3 (09:00 - 10:00)</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Afternoon Slot</h4>
            <p className="text-slate-500 mt-0.5">Main Operating Hours: 12:00 PM – 3:00 PM</p>
            <ul className="mt-2 space-y-1 text-slate-700">
              <li>• Batch 1 (12:00 - 13:00)</li>
              <li>• Batch 2 (13:00 - 14:00)</li>
              <li>• Batch 3 (14:00 - 15:00)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Account Session Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>Account Session</span>
        </h3>

        <div className="flex items-center justify-between p-4 bg-rose-50/60 rounded-xl border border-rose-200">
          <div>
            <h4 className="font-bold text-rose-950 text-xs sm:text-sm">Logout of Current Session</h4>
            <p className="text-xs text-rose-700 mt-0.5">Clicking logout will safely terminate your session.</p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
