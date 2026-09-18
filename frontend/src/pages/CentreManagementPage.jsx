import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Building2,
  PlusCircle,
  Search,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Filter,
  Globe,
  Layers,
} from "lucide-react";
import { getCapacityStatusBadge } from "../utils/queueUtils";

export const CentreManagementPage = () => {
  const { centres, registerCentre, selectedDistrict, setSelectedDistrict } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedCommodity, setSelectedCommodity] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Registration Form State
  const [formData, setFormData] = useState({
    name: "",
    state: "Maharashtra",
    district: "Thane / Navi Mumbai",
    location: "",
    latitude: "19.0760",
    longitude: "73.0077",
    supportedCommodities: ["Wheat", "Paddy / Rice"],
    batchCapacity: 30,
    dailyCapacity: 90,
    operationalStatus: "Active",
  });

  const availableCommodities = ["Wheat", "Paddy / Rice", "Cotton", "Maize", "Mustard", "Gram / Pulses", "Soyabean"];
  const availableDistricts = ["All", "Thane / Navi Mumbai", "Nashik", "Pune", "Nagpur"];

  const handleCommodityToggle = (comm) => {
    setFormData((prev) => {
      const exists = prev.supportedCommodities.includes(comm);
      if (exists) {
        return { ...prev, supportedCommodities: prev.supportedCommodities.filter((c) => c !== comm) };
      } else {
        return { ...prev, supportedCommodities: [...prev.supportedCommodities, comm] };
      }
    });
  };

  const handleSubmitRegistration = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.district || !formData.location) {
      alert("Please fill in Centre Name, District, and Location address.");
      return;
    }
    registerCentre(formData);
    setIsRegisterOpen(false);
    setFormData({
      name: "",
      state: "Maharashtra",
      district: "Thane / Navi Mumbai",
      location: "",
      latitude: "19.0760",
      longitude: "73.0077",
      supportedCommodities: ["Wheat", "Paddy / Rice"],
      batchCapacity: 30,
      dailyCapacity: 90,
      operationalStatus: "Active",
    });
  };

  // Filter centres per PRD 4
  const filteredCentres = centres.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = selectedState === "All" || c.state === selectedState;
    const matchesDistrict = selectedDistrict === "All" || c.district === selectedDistrict;
    const matchesStatus = selectedStatus === "All" || c.operationalStatus === selectedStatus;
    const matchesCommodity =
      selectedCommodity === "All" ||
      (c.supportedCommodities && c.supportedCommodities.includes(selectedCommodity));

    return matchesSearch && matchesState && matchesDistrict && matchesStatus && matchesCommodity;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner with Gov Blue Theme */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F2B5C] flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Centre Registration & Search Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            PRD 2 Sections 3 & 4 — Register procurement centres, filter by District/State, configure batch capacities & commodity capabilities.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="px-4 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-98"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Procurement Centre</span>
        </button>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Filter className="w-4 h-4 text-[#0F2B5C]" />
            <span>District & Centre Filters (PRD Section 4)</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredCentres.length} of {centres.length} Registered Centres
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by centre name, district, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2B5C]"
            />
          </div>

          {/* District Dropdown (Returns registered centres in selected district) */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              District Search
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2B5C]"
            >
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "All Districts" : d}
                </option>
              ))}
            </select>
          </div>

          {/* Commodity Dropdown */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Commodity
            </label>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2B5C]"
            >
              <option value="All">All Commodities</option>
              {availableCommodities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F2B5C]"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registered Centres Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCentres.map((centre) => {
          const capBadge = getCapacityStatusBadge(18, centre.batchCapacity);
          return (
            <div
              key={centre.id}
              className="gov-card overflow-hidden card-hover-effect flex flex-col justify-between"
            >
              <div>
                {/* Header Strip */}
                <div className="gov-card-header flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>{centre.name}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      centre.operationalStatus === "Active"
                        ? "bg-emerald-500 text-white"
                        : "bg-amber-500 text-slate-950"
                    }`}
                  >
                    {centre.operationalStatus}
                  </span>
                </div>

                {/* Details Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-slate-600 font-medium">
                    <MapPin className="w-4 h-4 text-[#0F2B5C] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">{centre.location}</p>
                      <p className="text-[11px] text-slate-500">
                        District: <strong className="text-slate-800">{centre.district}</strong> • State: {centre.state}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Coordinates: Lat {centre.latitude}, Lng {centre.longitude}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Batch Cap</span>
                      <span className="text-xs font-black text-[#0F2B5C]">{centre.batchCapacity} Q / Batch</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Daily Cap</span>
                      <span className="text-xs font-black text-emerald-700">{centre.dailyCapacity} Farmers</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Active Staff</span>
                      <span className="text-xs font-black text-amber-700">{centre.activeStaffCount} Officers</span>
                    </div>
                  </div>

                  {/* Supported Commodities Tags */}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                      Supported Commodities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {centre.supportedCommodities?.map((comm) => (
                        <span
                          key={comm}
                          className="px-2 py-0.5 bg-blue-50 text-[#0F2B5C] border border-blue-200 text-[10px] font-bold rounded-md"
                        >
                          {comm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">ID: {centre.id}</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Authorized Government Centre
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Modal (PRD Section 3) */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="gov-card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>Centre Registration Form (PRD Section 3)</span>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-white hover:text-amber-300 font-bold text-base cursor-pointer"
              >
                X
              </button>
            </div>

            <form onSubmit={handleSubmitRegistration} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Centre Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lasalgaon MSP Grain Procurement Hub"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0F2B5C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-medium border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nashik, Thane, Pune"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-medium border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Location Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gate 2, APMC Market Yard, Kopar Khairane"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-medium border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Batch Capacity (Q) *</label>
                  <input
                    type="number"
                    required
                    value={formData.batchCapacity}
                    onChange={(e) => setFormData({ ...formData, batchCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Operational Status</label>
                  <select
                    value={formData.operationalStatus}
                    onChange={(e) => setFormData({ ...formData, operationalStatus: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Supported Commodities (Multi-select)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableCommodities.map((comm) => {
                    const isSelected = formData.supportedCommodities.includes(comm);
                    return (
                      <button
                        key={comm}
                        type="button"
                        onClick={() => handleCommodityToggle(comm)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-[#0F2B5C] text-white border border-amber-400"
                            : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected ? "Selected: " : "+ "}{comm}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-[#0F2B5C] gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#15803D] hover:bg-[#166534] text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Submit Centre Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
