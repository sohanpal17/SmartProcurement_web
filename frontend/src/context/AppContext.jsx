import React, { createContext, useContext, useState } from "react";
import {
  MANDI_INFO,
  ROLES,
  DEFAULT_SLOT_CONFIG,
  INITIAL_OFFICERS,
  INITIAL_FARMERS,
} from "../data/mockData";
import { getNextStageKey, STAGE_LABELS } from "../utils/queueUtils";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentDemoRole, setCurrentDemoRole] = useState(ROLES.ADMIN);
  const [farmers, setFarmers] = useState(INITIAL_FARMERS);
  const [officers, setOfficers] = useState(INITIAL_OFFICERS);
  const [slotConfig, setSlotConfig] = useState(DEFAULT_SLOT_CONFIG);
  const [mandiInfo, setMandiInfo] = useState(MANDI_INFO);
  const [activeServingTokenId, setActiveServingTokenId] = useState("farmer-023");
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const addToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper timestamp
  const getNowFormatted = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Admin Officer Management
  const approveOfficer = (officerId) => {
    setOfficers((prev) =>
      prev.map((off) => {
        if (off.id === officerId) {
          return {
            ...off,
            status: "ACTIVE",
            joinedDate: new Date().toISOString().split("T")[0],
          };
        }
        return off;
      })
    );
    const target = officers.find((o) => o.id === officerId);
    addToast(`Approved officer request for ${target?.name || "Officer"}`, "success");
  };

  const rejectOfficer = (officerId, reason = "Request rejected by Admin") => {
    setOfficers((prev) =>
      prev.map((off) => {
        if (off.id === officerId) {
          return { ...off, status: "REJECTED", rejectedReason: reason };
        }
        return off;
      })
    );
    const target = officers.find((o) => o.id === officerId);
    addToast(`Rejected officer request for ${target?.name || "Officer"}`, "error");
  };

  const addOfficerRequest = (newOfficerData) => {
    const newReq = {
      id: `request-${Date.now()}`,
      ...newOfficerData,
      mandi: mandiInfo.name,
      status: "PENDING",
      requestDate: `${new Date().toISOString().split("T")[0]} ${getNowFormatted()}`,
    };
    setOfficers((prev) => [newReq, ...prev]);
    addToast(`Registration request submitted for ${newOfficerData.name}`, "info");
  };

  // Arrival & Token Officer Queue Controls
  const markArrived = (farmerId) => {
    setFarmers((prev) =>
      prev.map((f) => {
        if (f.id === farmerId) {
          const timestamp = getNowFormatted();
          return {
            ...f,
            status: "ARRIVED",
            arrivalStatus: "ARRIVED",
            history: [
              ...f.history,
              {
                timestamp,
                event: "Marked Arrived & Verified",
                actor: `${currentDemoRole}`,
              },
            ],
          };
        }
        return f;
      })
    );
    const target = farmers.find((f) => f.id === farmerId);
    addToast(`Marked ${target?.tokenNumber} (${target?.farmerName}) as ARRIVED`, "success");
  };

  const markLate = (farmerId) => {
    setFarmers((prev) =>
      prev.map((f) => {
        if (f.id === farmerId) {
          const timestamp = getNowFormatted();
          return {
            ...f,
            status: "LATE",
            arrivalStatus: "LATE",
            history: [
              ...f.history,
              {
                timestamp,
                event: "Marked LATE by Arrival Officer",
                actor: `${currentDemoRole}`,
              },
            ],
          };
        }
        return f;
      })
    );
    const target = farmers.find((f) => f.id === farmerId);
    addToast(`Token ${target?.tokenNumber} marked as LATE`, "warning");
  };

  const callNextToken = (farmerId) => {
    setActiveServingTokenId(farmerId);
    setFarmers((prev) =>
      prev.map((f) => {
        if (f.id === farmerId) {
          const timestamp = getNowFormatted();
          const nextStages = { ...f.stages };
          if (nextStages.arrival.status !== "COMPLETED") {
            nextStages.arrival = {
              status: "COMPLETED",
              completedAt: timestamp,
              officerName: "Arrival Officer",
            };
          }
          if (nextStages.weighing.status === "LOCKED" || nextStages.weighing.status === "PENDING") {
            nextStages.weighing.status = "ACTIVE";
          }
          return {
            ...f,
            status: "WEIGHING",
            arrivalStatus: "ARRIVED",
            currentStage: "weighing",
            stages: nextStages,
            history: [
              ...f.history,
              {
                timestamp,
                event: `Token ${f.tokenNumber} Called to Processing Counters`,
                actor: `${currentDemoRole}`,
              },
            ],
          };
        }
        return f;
      })
    );
    const target = farmers.find((f) => f.id === farmerId);
    addToast(`NOW SERVING Token ${target?.tokenNumber} (${target?.farmerName})`, "info");
  };

  const rescheduleToken = (farmerId, newSlot, newBatch, reason) => {
    setFarmers((prev) =>
      prev.map((f) => {
        if (f.id === farmerId) {
          const timestamp = getNowFormatted();
          const oldSlot = f.slot;
          const oldBatch = f.batch;
          return {
            ...f,
            slot: newSlot,
            batch: newBatch,
            status: f.arrivalStatus === "ARRIVED" ? "ARRIVED" : "BOOKED",
            rescheduleCount: (f.rescheduleCount || 0) + 1,
            history: [
              ...f.history,
              {
                timestamp,
                event: `Rescheduled from ${oldSlot} ${oldBatch} to ${newSlot} ${newBatch}. Reason: ${reason}`,
                actor: `${currentDemoRole}`,
              },
            ],
          };
        }
        return f;
      })
    );
    const target = farmers.find((f) => f.id === farmerId);
    addToast(
      `Token ${target?.tokenNumber} rescheduled to ${newSlot} - ${newBatch}`,
      "success"
    );
  };

  // Workflow Stage Completion
  const completeStage = (farmerId, stageKey, payload = {}) => {
    setFarmers((prev) =>
      prev.map((f) => {
        if (f.id === farmerId) {
          const timestamp = getNowFormatted();
          const nextStages = { ...f.stages };

          // Mark current stage as COMPLETED
          nextStages[stageKey] = {
            ...nextStages[stageKey],
            status: "COMPLETED",
            completedAt: timestamp,
            officerName: currentDemoRole,
            ...payload,
          };

          const nextStageKey = getNextStageKey(stageKey);
          let newOverallStatus = f.status;
          let newCurrentStage = f.currentStage;

          if (nextStageKey) {
            // Unlock & activate next stage
            nextStages[nextStageKey] = {
              ...nextStages[nextStageKey],
              status: "ACTIVE",
            };
            newCurrentStage = nextStageKey;
            newOverallStatus = nextStageKey.toUpperCase();
          } else {
            // Final stage (payment) completed!
            newOverallStatus = "COMPLETED";
            newCurrentStage = "payment";
          }

          // Build audit entry
          let detailStr = "";
          if (stageKey === "weighing" && payload.measuredWeightQuintals) {
            detailStr = ` (Weight: ${payload.measuredWeightQuintals} Quintal)`;
          } else if (stageKey === "quality" && payload.qualityGrade) {
            detailStr = ` (Grade: ${payload.qualityGrade})`;
          } else if (stageKey === "procurement" && payload.procurementRatePerQuintal) {
            detailStr = ` (Rate: ₹${payload.procurementRatePerQuintal}/Q)`;
          } else if (stageKey === "payment" && payload.transactionRef) {
            detailStr = ` (Txn Ref: ${payload.transactionRef})`;
          }

          const updatedFarmer = {
            ...f,
            ...payload,
            status: newOverallStatus,
            currentStage: newCurrentStage,
            stages: nextStages,
            history: [
              ...f.history,
              {
                timestamp,
                event: `${STAGE_LABELS[stageKey]} Completed${detailStr}`,
                actor: `${currentDemoRole}`,
              },
            ],
          };

          return updatedFarmer;
        }
        return f;
      })
    );

    const target = farmers.find((f) => f.id === farmerId);
    if (stageKey === "payment") {
      addToast(`Payment & Procurement Completed for Token ${target?.tokenNumber}! Token moved to History.`, "success");
    } else {
      addToast(`${STAGE_LABELS[stageKey]} completed for Token ${target?.tokenNumber}`, "success");
    }
  };

  // Workflow Flagging
  const flagStage = (farmerId, stageKey, issueReason) => {
    const flagId = `flag-${Date.now()}`;
    const timestamp = getNowFormatted();

    setFarmers((prev) =>
      prev.map((f) => {
        if (f.id === farmerId) {
          const nextStages = { ...f.stages };
          nextStages[stageKey] = {
            ...nextStages[stageKey],
            status: "FLAGGED",
            issueReason,
          };

          const newFlag = {
            id: flagId,
            stage: stageKey,
            issue: issueReason,
            reportedBy: currentDemoRole,
            createdAt: timestamp,
            status: "ACTIVE",
          };

          return {
            ...f,
            status: "FLAGGED",
            stages: nextStages,
            flags: [...f.flags, newFlag],
            history: [
              ...f.history,
              {
                timestamp,
                event: `FLAGGED at ${STAGE_LABELS[stageKey]} stage. Reason: "${issueReason}"`,
                actor: `${currentDemoRole}`,
              },
            ],
          };
        }
        return f;
      })
    );

    const target = farmers.find((f) => f.id === farmerId);
    addToast(`Issue flagged for Token ${target?.tokenNumber}. Sent to Admin queue.`, "error");
  };

  // Admin Flag Resolution
  const resolveFlag = (farmerId, flagId, resolutionNotes = "Issue verified and cleared by Admin") => {
    const timestamp = getNowFormatted();

    setFarmers((prev) =>
      prev.map((f) => {
        if (f.id === farmerId) {
          const updatedFlags = f.flags.map((fl) => {
            if (fl.id === flagId) {
              return {
                ...fl,
                status: "RESOLVED",
                resolvedAt: timestamp,
                resolvedBy: currentDemoRole,
                resolutionNotes,
              };
            }
            return fl;
          });

          // Check remaining active flags
          const hasRemainingActiveFlags = updatedFlags.some((fl) => fl.status === "ACTIVE");

          // Restore current stage to ACTIVE
          const currentStageKey = f.currentStage;
          const nextStages = { ...f.stages };
          if (nextStages[currentStageKey]) {
            nextStages[currentStageKey].status = "ACTIVE";
            delete nextStages[currentStageKey].issueReason;
          }

          const restoredStatus = hasRemainingActiveFlags
            ? "FLAGGED"
            : currentStageKey.toUpperCase();

          return {
            ...f,
            status: restoredStatus,
            stages: nextStages,
            flags: updatedFlags,
            history: [
              ...f.history,
              {
                timestamp,
                event: `Flag Resolved by Admin. Notes: "${resolutionNotes}"`,
                actor: `${currentDemoRole}`,
              },
            ],
          };
        }
        return f;
      })
    );

    const target = farmers.find((f) => f.id === farmerId);
    addToast(`Flag resolved for Token ${target?.tokenNumber}. Restored to active queue.`, "success");
  };

  // Config Update
  const updateEveningSlotConfig = (newBatches) => {
    setSlotConfig((prev) => ({
      ...prev,
      Evening: {
        ...prev.Evening,
        batches: newBatches,
      },
    }));
    addToast("Evening slot batch configuration updated", "success");
  };

  return (
    <AppContext.Provider
      value={{
        currentDemoRole,
        setCurrentDemoRole,
        farmers,
        officers,
        slotConfig,
        mandiInfo,
        activeServingTokenId,
        setActiveServingTokenId,
        selectedFarmerId,
        setSelectedFarmerId,
        toasts,
        addToast,
        removeToast,
        approveOfficer,
        rejectOfficer,
        addOfficerRequest,
        markArrived,
        markLate,
        callNextToken,
        rescheduleToken,
        completeStage,
        flagStage,
        resolveFlag,
        updateEveningSlotConfig,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
