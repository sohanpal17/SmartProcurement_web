import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Modal } from "../common/Modal";
import { ROLES } from "../../data/mockData";
import { UserPlus } from "lucide-react";

export const RegisterOfficerModal = ({ isOpen, onClose }) => {
  const { addOfficerRequest, mandiInfo } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    age: 30,
    phone: "",
    role: ROLES.WEIGHING,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    addOfficerRequest(formData);
    setFormData({ name: "", age: 30, phone: "", role: ROLES.WEIGHING });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Officer Request" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Ramesh Deshmukh"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Age *</label>
            <input
              type="number"
              required
              min={21}
              max={65}
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 21 })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="9876500000"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Mandi</label>
          <input
            type="text"
            disabled
            value={mandiInfo.name}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Operational Role Requested *</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={ROLES.ARRIVAL}>{ROLES.ARRIVAL}</option>
            <option value={ROLES.WEIGHING}>{ROLES.WEIGHING}</option>
            <option value={ROLES.QUALITY}>{ROLES.QUALITY}</option>
            <option value={ROLES.PAYMENT}>{ROLES.PAYMENT}</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#102A56] hover:bg-[#173763] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>Submit Profile Request</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
