import React, { createContext, useContext, useState, useEffect } from "react";
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
  const [authUser, setAuthUser] = useState(() => {
    const saved = localStorage.getItem("smartprocure_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [currentDemoRole, setCurrentDemoRole] = useState(ROLES.ADMIN);
  const [farmers, setFarmers] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [slotConfig, setSlotConfig] = useState(DEFAULT_SLOT_CONFIG);
  const [mandiInfo, setMandiInfo] = useState(MANDI_INFO);
  const [activeServingTokenId, setActiveServingTokenId] = useState(null);
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Auto-sync active workstation role when authUser logs in
  useEffect(() => {
    if (authUser) {
      if (authUser.role === "admin") {
        setCurrentDemoRole("Admin");
      } else if (authUser.role) {
        setCurrentDemoRole(authUser.role);
      }
    }
  }, [authUser]);

  // AUTH API INTEGRATION WITH BACKEND (http://localhost:5000/api)
  const loginUser = async (email, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("smartprocure_token", data.token);
        localStorage.setItem("smartprocure_user", JSON.stringify(data.user));
        setAuthUser(data.user);
        if (data.user.role === "admin") {
          setCurrentDemoRole("Admin");
        } else if (data.user.role) {
          setCurrentDemoRole(data.user.role);
        }
      }
      return data;
    } catch (e) {
      return { success: false, error: "Unable to connect to Node.js backend server." };
    }
  };

  const registerUser = async (userData) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.user && data.user.isApproved) {
        localStorage.setItem("smartprocure_token", data.token);
        localStorage.setItem("smartprocure_user", JSON.stringify(data.user));
        setAuthUser(data.user);
      }
      return data;
    } catch (e) {
      return { success: false, error: "Unable to connect to Node.js backend server." };
    }
  };

  // REAL OFFICER & QUEUE SYNC FROM BACKEND
  useEffect(() => {
    if (!authUser) return;

    const fetchRealData = async () => {
      try {
        const token = localStorage.getItem("smartprocure_token");
        const mandiId = authUser.mandiId || "turbhe";
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. Fetch Real Queue Tokens
        const queueRes = await fetch(`http://localhost:5000/api/queue/mandi-tokens?mandiId=${mandiId}`, { headers });
        const queueData = await queueRes.json();
        if (queueData.success && Array.isArray(queueData.queueRecords)) {
          const mappedRealFarmers = queueData.queueRecords.map((q) => {
            const b = q.bookings || {};
            const stageNames = ["arrival", "weighing", "quality", "procurement", "payment"];
            const currentStageKey = stageNames[Math.min(q.current_stage - 1, 4)];
            const statusStr = q.current_stage === 6 ? "COMPLETED" : currentStageKey.toUpperCase();

            return {
              id: q.id || q.booking_id,
              tokenNumber: q.token_number,
              farmerName: b.farmer_name || "Farmer",
              phone: "9876543210",
              commodity: b.commodity_name || "Crop",
              declaredWeight: b.quantity_quintals || 0,
              slot: "Morning",
              batch: b.time_range || "07:00 AM – 08:00 AM",
              status: statusStr,
              arrivalStatus: q.current_stage > 1 ? "ARRIVED" : "BOOKED",
              currentStage: currentStageKey,
              queuePosition: q.people_ahead || 0,
              estimatedWaitMins: q.estimated_wait_mins || 0,
              stages: {
                arrival: { status: q.current_stage > 1 ? "COMPLETED" : "ACTIVE" },
                weighing: { status: q.current_stage > 2 ? "COMPLETED" : q.current_stage === 2 ? "ACTIVE" : "LOCKED" },
                quality: { status: q.current_stage > 3 ? "COMPLETED" : q.current_stage === 3 ? "ACTIVE" : "LOCKED" },
                procurement: { status: q.current_stage > 4 ? "COMPLETED" : q.current_stage === 4 ? "ACTIVE" : "LOCKED" },
                payment: { status: q.current_stage > 5 ? "COMPLETED" : q.current_stage === 5 ? "ACTIVE" : "LOCKED" },
              },
              flags: [],
              history: [{ timestamp: new Date(q.updated_at).toLocaleTimeString(), event: "Token Synced from Backend", actor: "System" }],
            };
          });
          setFarmers(mappedRealFarmers);
        }

        // 2. Fetch Real Officer Requests (Admin only)
        if (authUser.role === "admin") {
          const offRes = await fetch(`http://localhost:5000/api/auth/pending-officers?mandiId=${mandiId}`, { headers });
          const offData = await offRes.json();
          if (offData.success && Array.isArray(offData.officers)) {
            const mappedOfficers = offData.officers.map((o) => ({
              id: o.id,
              name: o.full_name || o.email,
              phone: o.phone || "9876543210",
              email: o.email,
              mandi: o.mandi_id ? o.mandi_id.toUpperCase() : "Turbhe",
              role: o.role === "officer" ? ROLES.ARRIVAL : o.role,
              status: o.is_approved ? "ACTIVE" : "PENDING",
              requestDate: new Date(o.created_at).toLocaleDateString(),
            }));
            setOfficers(mappedOfficers);
          }
        }
      } catch (err) {
        console.error("Real Data Sync Error:", err);
      }
    };

    fetchRealData();
    const interval = setInterval(fetchRealData, 4000);
    return () => clearInterval(interval);
  }, [authUser]);

  const logoutUser = () => {
    localStorage.removeItem("smartprocure_token");
    localStorage.removeItem("smartprocure_user");
    setAuthUser(null);
  };

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

  // Admin Officer Approval Methods via Backend API
  const approveOfficer = async (officerId) => {
    try {
      const token = localStorage.getItem("smartprocure_token");
      const res = await fetch("http://localhost:5000/api/auth/approve-officer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ officerId, approve: true }),
      });
      const data = await res.json();
      if (data.success) {
        setOfficers((prev) =>
          prev.map((off) => (off.id === officerId ? { ...off, status: "ACTIVE" } : off))
        );
        addToast("Officer approved successfully!", "success");
      } else {
        addToast(data.error || "Approval failed.", "error");
      }
    } catch (e) {
      addToast("Failed to connect to server.", "error");
    }
  };

  const rejectOfficer = async (officerId, reason = "Request rejected by Mandi Admin") => {
    try {
      const token = localStorage.getItem("smartprocure_token");
      const res = await fetch("http://localhost:5000/api/auth/approve-officer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ officerId, approve: false }),
      });
      const data = await res.json();
      if (data.success) {
        setOfficers((prev) =>
          prev.map((off) => (off.id === officerId ? { ...off, status: "REJECTED", rejectedReason: reason } : off))
        );
        addToast("Officer request rejected.", "error");
      } else {
        addToast(data.error || "Rejection failed.", "error");
      }
    } catch (e) {
      addToast("Failed to connect to server.", "error");
    }
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
        authUser,
        loginUser,
        registerUser,
        logoutUser,
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
