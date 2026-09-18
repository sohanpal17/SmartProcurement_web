import { ROLES } from "../data/mockData";

export const getStageOfficerRole = (stageKey) => {
  switch (stageKey) {
    case "arrival":
      return ROLES.CHECKIN;
    case "weighing":
      return ROLES.WEIGHING;
    case "quality":
      return ROLES.QUALITY;
    case "payment":
      return ROLES.PAYMENT;
    default:
      return null;
  }
};

export const STAGE_ORDER = ["arrival", "weighing", "quality", "payment"];

export const STAGE_LABELS = {
  arrival: "Check-in / Arrival",
  weighing: "Weighing",
  quality: "Quality Check",
  payment: "Payment Confirmation",
};

export const getNextStageKey = (currentStageKey) => {
  const index = STAGE_ORDER.indexOf(currentStageKey);
  if (index >= 0 && index < STAGE_ORDER.length - 1) {
    return STAGE_ORDER[index + 1];
  }
  return null;
};

export const getCapacityStatusBadge = (occupied, capacity) => {
  if (!capacity || capacity <= 0) return { status: "Available", color: "emerald", label: "Available" };
  const percentage = (occupied / capacity) * 100;
  if (percentage >= 100) {
    return { status: "Full", color: "rose", label: "Full" };
  } else if (percentage >= 75) {
    return { status: "Limited", color: "amber", label: "Limited Availability" };
  }
  return { status: "Available", color: "emerald", label: "Available" };
};


// Calculate occupied capacity for a given slot & batch
export const getBatchCapacityDetails = (slotName, batchName, farmers, slotConfig) => {
  const slotObj = slotConfig[slotName];
  if (!slotObj) return { capacity: 10, occupied: 0, available: 10, isFull: false };

  let targetCapacity = 10;
  if (batchName.toLowerCase().includes("buffer") && slotObj.buffer) {
    targetCapacity = slotObj.buffer.capacity || 10;
  } else {
    const b = slotObj.batches.find((b) => b.name === batchName || batchName.includes(b.name));
    if (b) targetCapacity = b.capacity;
  }

  // Count active (non-completed/non-cancelled) farmers in this slot and batch
  const occupiedCount = farmers.filter(
    (f) => f.slot === slotName && f.batch === batchName && f.status !== "COMPLETED" && f.status !== "CANCELLED"
  ).length;

  return {
    capacity: targetCapacity,
    occupied: occupiedCount,
    available: Math.max(0, targetCapacity - occupiedCount),
    isFull: occupiedCount >= targetCapacity,
  };
};

// Intelligent rescheduling algorithm as per Rules 1-8
export const calculateRescheduleOptions = (farmer, slotConfig, farmers) => {
  const options = [];
  const currentSlot = farmer.slot || "Morning";
  const currentBatch = farmer.batch || "Batch 1";

  const slotObj = slotConfig[currentSlot];
  if (!slotObj) return options;

  // 1. Same Batch check
  const sameBatchDetails = getBatchCapacityDetails(currentSlot, currentBatch, farmers, slotConfig);
  options.push({
    type: "SAME_BATCH",
    title: `Original ${currentBatch} (End of Batch)`,
    slot: currentSlot,
    batch: currentBatch,
    available: sameBatchDetails.available,
    capacity: sameBatchDetails.capacity,
    isFull: sameBatchDetails.isFull,
    recommended: !sameBatchDetails.isFull,
    reason: sameBatchDetails.isFull
      ? "Original batch is currently at maximum capacity"
      : "Place farmer at the end of their original batch sequence",
  });

  // 2. Next available batches in same slot
  slotObj.batches.forEach((b) => {
    if (b.name !== currentBatch) {
      const details = getBatchCapacityDetails(currentSlot, b.name, farmers, slotConfig);
      options.push({
        type: "NEXT_BATCH",
        title: `${currentSlot} ${b.name} (${b.time})`,
        slot: currentSlot,
        batch: b.name,
        available: details.available,
        capacity: details.capacity,
        isFull: details.isFull,
        recommended: !details.isFull && sameBatchDetails.isFull,
        reason: details.isFull ? "Batch Full" : `${details.available} spaces remaining`,
      });
    }
  });

  // 3. Buffer period check
  if (slotObj.buffer) {
    const bufferDetails = getBatchCapacityDetails(currentSlot, slotObj.buffer.name, farmers, slotConfig);
    options.push({
      type: "BUFFER",
      title: `${currentSlot} Buffer Period (${slotObj.buffer.time})`,
      slot: currentSlot,
      batch: slotObj.buffer.name,
      available: bufferDetails.available,
      capacity: bufferDetails.capacity,
      isFull: bufferDetails.isFull,
      recommended: false,
      reason: bufferDetails.isFull ? "Buffer Occupied" : "Shift to official slot buffer period",
    });
  }

  // 4. Next Slots (Afternoon / Evening)
  const allSlots = Object.keys(slotConfig);
  const nextSlots = allSlots.slice(allSlots.indexOf(currentSlot) + 1);

  nextSlots.forEach((sName) => {
    const nextSlotObj = slotConfig[sName];
    if (nextSlotObj && nextSlotObj.batches.length > 0) {
      const firstBatch = nextSlotObj.batches[0];
      const details = getBatchCapacityDetails(sName, firstBatch.name, farmers, slotConfig);
      options.push({
        type: "NEXT_SLOT",
        title: `Shift to ${sName} Session (${firstBatch.name})`,
        slot: sName,
        batch: firstBatch.name,
        available: details.available,
        capacity: details.capacity,
        isFull: details.isFull,
        recommended: false,
        reason: `Move farmer to ${sName} slot`,
      });
    }
  });

  return options;
};

// Filter tokens by status tab
export const filterTokensByTab = (farmers, tab) => {
  switch (tab) {
    case "waiting":
      return farmers.filter((f) => f.status === "BOOKED" || f.status === "ARRIVED" || f.status === "ARRIVAL" || f.currentStage === "arrival");
    case "active":
      return farmers.filter((f) => ["ARRIVED", "ARRIVAL", "WEIGHING", "QUALITY", "PAYMENT"].includes(f.status) || (f.currentStage && f.status !== "COMPLETED"));
    case "late":
      return farmers.filter((f) => f.status === "LATE");
    case "flagged":
      return farmers.filter((f) => f.status === "FLAGGED");
    case "completed":
      return farmers.filter((f) => f.status === "COMPLETED");
    default:
      return farmers;
  }
};

export const getDisplaySlot = (farmer) => {
  if (!farmer) return "Morning";
  const slot = farmer.slot;
  const batchStr = (farmer.batch || "").toLowerCase();

  if (
    batchStr.includes("afternoon") ||
    batchStr.includes("12:") ||
    batchStr.includes("01:") ||
    batchStr.includes("1:") ||
    batchStr.includes("02:") ||
    batchStr.includes("2:") ||
    batchStr.includes("03:") ||
    batchStr.includes("3:")
  ) {
    return "Afternoon";
  }
  if (
    batchStr.includes("evening") ||
    batchStr.includes("05:") ||
    batchStr.includes("5:") ||
    batchStr.includes("06:") ||
    batchStr.includes("6:") ||
    batchStr.includes("07:00 pm") ||
    batchStr.includes("7:00 pm") ||
    batchStr.includes("08:") ||
    batchStr.includes("8:")
  ) {
    return "Evening";
  }
  if (slot && ["Morning", "Afternoon", "Evening"].includes(slot)) {
    return slot;
  }
  return "Morning";
};
