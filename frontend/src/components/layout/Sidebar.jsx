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
  Building2,
  Layers,
  ShieldAlert,
  Scale,
  Microscope,
  Landmark,
  CreditCard,
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
      { id: "queue-monitor", label: "Operational Queue", icon: Ticket },
      { id: "batch-capacity", label: "Batch & Capacity Config", icon: Layers },
      { id: "history", label: "Audit Logs & History", icon: History },
      { id: "settings", label: "Centre Settings", icon: Settings },
    ];
  } else {
    let homeLabel = `${currentDemoRole} Workstation`;
    let homeIcon = LayoutDashboard;
    if (currentDemoRole === ROLES.CHECKIN) {
      homeLabel = "Check-in Workstation";
      homeIcon = LayoutDashboard;
    } else if (currentDemoRole === ROLES.WEIGHING) {
      homeLabel = "Weighing Workstation";
      homeIcon = Scale;
    } else if (currentDemoRole === ROLES.QUALITY) {
      homeLabel = "Quality Workstation";
      homeIcon = Microscope;
    } else if (currentDemoRole === ROLES.PAYMENT) {
      homeLabel = "Payment Workstation";
      homeIcon = CreditCard;
    }

    navItems = [
      { id: "dashboard", label: homeLabel, icon: homeIcon },
      { id: "queue-monitor", label: "Operational Queue", icon: Ticket },
      { id: "settings", label: "Settings", icon: Settings },
    ];
  }

  return (
    <aside className="w-full md:w-64 bg-[#0F2B5C] text-slate-200 border-r border-[#1A3A73] flex flex-col shrink-0">
      {/* Current Role Workstation Banner */}
      <div className="p-4 border-b border-[#1A3A73] bg-[#091C3E]">
        <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
          Current Workstation
        </span>
        <div className="text-sm font-black text-white mt-0.5 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
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
                  ? "bg-[#15803D] text-white shadow-md border border-emerald-400/40"
                  : "text-blue-100/90 hover:text-white hover:bg-[#162C5B]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-amber-300"}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? "bg-white text-emerald-950" : "bg-rose-600 text-white"
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
      <div className="p-4 border-t border-[#1A3A73] text-[11px] text-blue-200/80 text-center font-medium bg-[#091C3E]">
        Department of Agricultural Marketing
        <br />
        Government of Maharashtra
      </div>
    </aside>
  );
};

