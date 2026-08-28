import React from "react";
import { useApp } from "../../context/AppContext";
import { ROLES } from "../../data/mockData";
import {
  LayoutDashboard,
  UserCheck,
  Ticket,
  Workflow,
  AlertTriangle,
  Users,
  History,
  Settings,
  Clock,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export const Sidebar = ({ currentTab, setCurrentTab }) => {
  const { currentDemoRole, farmers, officers } = useApp();

  const activeFlagsCount = farmers.reduce(
    (acc, f) => acc + (f.flags ? f.flags.filter((fl) => fl.status === "ACTIVE").length : 0),
    0
  );
  const pendingOfficersCount = officers.filter((o) => o.status === "PENDING").length;
  const lateFarmersCount = farmers.filter((f) => f.status === "LATE").length;

  let navItems = [];

  if (currentDemoRole === ROLES.ADMIN) {
    navItems = [
      { id: "dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
      { id: "officer-requests", label: "Officer Requests", icon: UserCheck, badge: pendingOfficersCount },
      { id: "queue-monitor", label: "Queue Monitor", icon: Ticket },
      { id: "procurement-monitor", label: "Procurement Pipeline", icon: Workflow },
      { id: "flags", label: "Flag Monitor", icon: AlertTriangle, badge: activeFlagsCount },
      { id: "farmers", label: "Farmers & Tokens", icon: Users },
      { id: "history", label: "Audit History", icon: History },
      { id: "settings", label: "Mandi Settings", icon: Settings },
    ];
  } else if (currentDemoRole === ROLES.ARRIVAL) {
    navItems = [
      { id: "dashboard", label: "Arrival Dashboard", icon: LayoutDashboard },
      { id: "queue-monitor", label: "Token Queue", icon: Ticket },
      { id: "late-farmers", label: "Late Farmers", icon: Clock, badge: lateFarmersCount },
      { id: "farmers", label: "Search Farmers", icon: Users },
      { id: "history", label: "History Log", icon: History },
    ];
  } else {
    navItems = [
      { id: "dashboard", label: `${currentDemoRole} Dashboard`, icon: LayoutDashboard },
      { id: "queue-monitor", label: "Active Processing Queue", icon: Ticket },
      { id: "flags", label: "Flagged Issues", icon: ShieldAlert, badge: activeFlagsCount },
      { id: "history", label: "Completed History", icon: History },
    ];
  }

  return (
    <aside className="w-full md:w-64 bg-[#102A56] text-slate-200 border-r border-[#1b3a70] flex flex-col shrink-0">
      {/* Current Context Banner */}
      <div className="p-4 border-b border-[#1b3a70] bg-[#0a1e40]">
        <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider block">
          Role Workstation
        </span>
        <div className="text-sm font-bold text-white mt-0.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{currentDemoRole}</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#2563EB] text-white shadow-md"
                  : "text-blue-100/80 hover:text-white hover:bg-[#173763]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-blue-300"}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? "bg-white text-blue-900" : "bg-rose-500 text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#1b3a70] text-[11px] text-blue-300/80 text-center font-medium">
        Department of Agricultural Marketing
        <br />
        Government Procurement Portal
      </div>
    </aside>
  );
};
