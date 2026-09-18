import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { ToastContainer } from "./components/common/ToastContainer";
import { FarmerDetailsDrawer } from "./components/common/FarmerDetailsDrawer";
import { StageInputModal } from "./components/common/StageInputModal";

import { DashboardPage } from "./pages/DashboardPage";
import { QueueMonitorPage } from "./pages/QueueMonitorPage";
import { ProcurementMonitorPage } from "./pages/ProcurementMonitorPage";
import { FarmersPage } from "./pages/FarmersPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { CentreManagementPage } from "./pages/CentreManagementPage";
import { BatchCapacityPage } from "./pages/BatchCapacityPage";

import { OfficerTable } from "./components/officers/OfficerTable";
import { FlagTable } from "./components/flags/FlagTable";
import { RescheduleModal } from "./components/tokens/RescheduleModal";
import { FlagModal } from "./components/flags/FlagModal";
import { LoginModal } from "./components/auth/LoginModal";
import { ROLES } from "./data/mockData";

import { LandingPage } from "./pages/LandingPage";

function MainLayout() {
  const { authUser, currentDemoRole, selectedFarmerId, setSelectedFarmerId, completeStage, updateStageData } = useApp();
  const [viewMode, setViewMode] = useState(() => (authUser ? "dashboard" : "landing"));
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [rescheduleFarmer, setRescheduleFarmer] = useState(null);
  const [flagTarget, setFlagTarget] = useState(null); // { farmer, stageKey }
  const [stageModalTarget, setStageModalTarget] = useState(null); // { farmer, stageKey, isEdit }

  // Redirect officers directly to their own home page (workstation dashboard) on login or role switch
  useEffect(() => {
    if (authUser) {
      setViewMode("dashboard");
      setCurrentTab("dashboard");
    }
  }, [currentDemoRole, authUser]);

  // PUBLIC LANDING PAGE MODE (Shown by default or when requested)
  if (viewMode === "landing" || !authUser) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <LandingPage
          onOpenLogin={() => setIsLoginOpen(true)}
          onEnterDashboard={() => setViewMode("dashboard")}
          authUser={authUser}
        />

        {/* Login Modal Overlay */}
        {isLoginOpen && (
          <LoginModal
            isOpen={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
          />
        )}

        <ToastContainer />
      </div>
    );
  }

  const handleOpenReschedule = (farmer) => {
    setRescheduleFarmer(farmer);
  };

  const handleOpenFlag = (farmer, stageKey) => {
    setFlagTarget({ farmer, stageKey });
  };

  const handleOpenFarmerDetails = (farmerId) => {
    setSelectedFarmerId(farmerId);
  };

  const handleOpenStageModal = (farmer, stageKey, isEdit = false) => {
    setStageModalTarget({ farmer, stageKey, isEdit });
  };

  const handleStageModalSubmit = (farmerId, stageKey, payload, isEdit) => {
    if (isEdit) {
      updateStageData(farmerId, stageKey, payload);
    } else {
      completeStage(farmerId, stageKey, payload);
    }
    setStageModalTarget(null);
  };

  const renderTabContent = () => {
    // Non-admin officers redirected to their workstation home page if accessing admin-only sections
    if (currentDemoRole !== ROLES.ADMIN && currentTab === "batch-capacity") {
      return (
        <DashboardPage
          onNavigateTab={(tab) => setCurrentTab(tab)}
          onOpenReschedule={handleOpenReschedule}
          onOpenFlag={handleOpenFlag}
          onOpenFarmerDetails={handleOpenFarmerDetails}
          onOpenStageModal={handleOpenStageModal}
        />
      );
    }

    switch (currentTab) {
      case "dashboard":
        return (
          <DashboardPage
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenReschedule={handleOpenReschedule}
            onOpenFlag={handleOpenFlag}
            onOpenFarmerDetails={handleOpenFarmerDetails}
            onOpenStageModal={handleOpenStageModal}
          />
        );
      case "batch-capacity":
        return <BatchCapacityPage />;
      case "queue-monitor":
      case "late-farmers":
        return (
          <QueueMonitorPage
            onOpenReschedule={handleOpenReschedule}
            onOpenFlag={handleOpenFlag}
            onOpenFarmerDetails={handleOpenFarmerDetails}
            onOpenStageModal={handleOpenStageModal}
          />
        );
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
            onOpenStageModal={handleOpenStageModal}
          />
        );
    }
  };


  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Header with Sticky Demo Role Switcher & Auth */}
      <Header
        onOpenLogin={() => setIsLoginOpen(true)}
        onViewLandingPage={() => setViewMode("landing")}
      />

      {/* Body Area with Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {renderTabContent()}
        </main>
      </div>

      {/* Login Modal */}
      {isLoginOpen && (
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
        />
      )}

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

      {/* Stage Input Modal */}
      {stageModalTarget && (
        <StageInputModal
          isOpen={!!stageModalTarget}
          onClose={() => setStageModalTarget(null)}
          farmer={stageModalTarget.farmer}
          stageKey={stageModalTarget.stageKey}
          isEdit={stageModalTarget.isEdit}
          onSubmit={handleStageModalSubmit}
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
