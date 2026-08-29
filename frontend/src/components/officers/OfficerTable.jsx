import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { RegisterOfficerModal } from "./RegisterOfficerModal";
import { UserPlus, CheckCircle2, XCircle, Clock } from "lucide-react";

export const OfficerTable = () => {
  const { officers, approveOfficer, rejectOfficer } = useApp();
  const [activeTab, setActiveTab] = useState("PENDING");
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const filteredOfficers = officers.filter((o) => o.status === activeTab);

  const pendingCount = officers.filter((o) => o.status === "PENDING").length;
  const approvedCount = officers.filter((o) => o.status === "ACTIVE").length;
  const rejectedCount = officers.filter((o) => o.status === "REJECTED").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Officer Registration & Staff Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Department of Agricultural Marketing - Review officer signup requests and manage active staff.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "PENDING"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Pending Approvals</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-black">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "ACTIVE"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Approved Officers ({approvedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("REJECTED")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "REJECTED"
              ? "border-[#2563EB] text-[#2563EB]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Rejected Requests ({rejectedCount})</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Officer Name</th>
                <th className="px-6 py-3.5">Age</th>
                <th className="px-6 py-3.5">Phone Number</th>
                <th className="px-6 py-3.5">Assigned Mandi</th>
                <th className="px-6 py-3.5">Requested Role</th>
                <th className="px-6 py-3.5">Request Date</th>
                <th className="px-6 py-3.5 text-right">Actions / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    No officers found in this category.
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((officer) => (
                  <tr key={officer.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{officer.name}</td>
                    <td className="px-6 py-4">{officer.age} yrs</td>
                    <td className="px-6 py-4 font-mono">{officer.phone}</td>
                    <td className="px-6 py-4">{officer.mandi}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 font-semibold">
                        {officer.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {officer.joinedDate || officer.requestDate || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {officer.status === "PENDING" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => approveOfficer(officer.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              const r = prompt("Reason for rejection:", "Documentation mismatch");
                              if (r) rejectOfficer(officer.id, r);
                            }}
                            className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl border border-rose-300 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}

                      {officer.status === "ACTIVE" && (
                        <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-full text-[11px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ACTIVE
                        </span>
                      )}

                      {officer.status === "REJECTED" && (
                        <span className="px-3 py-1 bg-slate-200 text-slate-600 font-medium rounded-full text-[11px]">
                          REJECTED
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RegisterOfficerModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
};
