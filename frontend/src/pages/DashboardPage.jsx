import React from "react";
import { useApp } from "../context/AppContext";
import { ROLES } from "../data/mockData";
import { AdminDashboard } from "../components/dashboard/AdminDashboard";
import { ArrivalDashboard } from "../components/dashboard/ArrivalDashboard";
import { OfficerStageDashboard } from "../components/dashboard/OfficerStageDashboard";

export const DashboardPage = ({ onNavigateTab, onOpenReschedule, onOpenFlag, onOpenFarmerDetails }) => {
  const { currentDemoRole } = useApp();

  if (currentDemoRole === ROLES.ADMIN) {
    return (
      <AdminDashboard
        onNavigateTab={onNavigateTab}
        onOpenFarmerDetails={onOpenFarmerDetails}
      />
    );
  }

  if (currentDemoRole === ROLES.ARRIVAL) {
    return (
      <ArrivalDashboard
        onOpenReschedule={onOpenReschedule}
        onOpenFarmerDetails={onOpenFarmerDetails}
      />
    );
  }

  return (
    <OfficerStageDashboard
      onOpenFlag={onOpenFlag}
      onOpenFarmerDetails={onOpenFarmerDetails}
    />
  );
};
