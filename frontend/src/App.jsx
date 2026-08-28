import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { ToastContainer } from "./components/common/ToastContainer";
import { FarmerDetailsDrawer } from "./components/common/FarmerDetailsDrawer";

import { DashboardPage } from "./pages/DashboardPage";
import { QueueMonitorPage } from "./pages/QueueMonitorPage";
import { ProcurementMonitorPage } from "./pages/ProcurementMonitorPage";
import { FarmersPage } from "./pages/FarmersPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";

import { OfficerTable } from "./components/officers/OfficerTable";
import { FlagTable } from "./components/flags/FlagTable";
import { RescheduleModal } from "./components/tokens/RescheduleModal";
import { FlagModal } from "./components/flags/FlagModal";

function MainLayout() {
  const { currentDemoRole, selectedFarmerId, setSelectedFarmerId } = useApp();
  const [currentTab, setCurrentTab] = useState("dashboard");

  // Modal States
  const [rescheduleFarmer, setRescheduleFarmer] = useState(null);
  const [flagTarget, setFlagTarget] = useState(null); // { farmer, stageKey }

  const handleOpenReschedule = (farmer) => {
    setRescheduleFarmer(farmer);
  };

  const handleOpenFlag = (farmer, stageKey) => {
    setFlagTarget({ farmer, stageKey });
  };

  const handleOpenFarmerDetails = (farmerId) => {
    setSelectedFarmerId(farmerId);
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <DashboardPage
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenReschedule={handleOpenReschedule}
            onOpenFlag={handleOpenFlag}
            onOpenFarmerDetails={handleOpenFarmerDetails}
          />
        );
      case "officer-requests":
        return <OfficerTable />;
      case "queue-monitor":
      case "late-farmers":
        return (
          <QueueMonitorPage
            onOpenReschedule={handleOpenReschedule}
            onOpenFlag={handleOpenFlag}
            onOpenFarmerDetails={handleOpenFarmerDetails}
          />
        );
      case "procurement-monitor":
        return <ProcurementMonitorPage onOpenFarmerDetails={handleOpenFarmerDetails} />;
      case "flags":
        return <FlagTable onOpenFarmerDetails={handleOpenFarmerDetails} />;
      case "farmers":
        return <FarmersPage onOpenFarmerDetails={handleOpenFarmerDetails} />;
      case "history":
        return <HistoryPage onOpenFarmerDetails={handleOpenFarmerDetails} />;
      case "settings":
        return <SettingsPage />;
      default:
        return (
          <DashboardPage
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenReschedule={handleOpenReschedule}
            onOpenFlag={handleOpenFlag}
            onOpenFarmerDetails={handleOpenFarmerDetails}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Header with Sticky Demo Role Switcher */}
      <Header />

      {/* Body Area with Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {renderTabContent()}
        </main>
      </div>

      {/* Slide-over Farmer Details & Audit Drawer */}
      {selectedFarmerId && (
        <FarmerDetailsDrawer
          farmerId={selectedFarmerId}
          onClose={() => setSelectedFarmerId(null)}
        />
      )}

      {/* Reschedule Modal */}
      {rescheduleFarmer && (
        <RescheduleModal
          isOpen={!!rescheduleFarmer}
          onClose={() => setRescheduleFarmer(null)}
          farmer={rescheduleFarmer}
        />
      )}

      {/* Flag Modal */}
      {flagTarget && (
        <FlagModal
          isOpen={!!flagTarget}
          onClose={() => setFlagTarget(null)}
          farmer={flagTarget.farmer}
          stageKey={flagTarget.stageKey}
        />
      )}

      {/* Toast Feedback Messages */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
