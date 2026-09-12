import { ROLES } from "../data/mockData";

export const PERMISSIONS = {
  [ROLES.ADMIN]: [
    "view_tokens",
    "view_officers",
    "approve_officer",
    "reject_officer",
    "view_flags",
    "resolve_flags",
    "monitor_queue",
    "monitor_procurement",
    "configure_settings",
    "view_history",
  ],
  [ROLES.ARRIVAL]: [
    "view_tokens",
    "mark_arrival",
    "call_token",
    "reorder_queue",
    "reschedule",
    "mark_late",
    "view_flags",
    "view_history",
  ],
  [ROLES.WEIGHING]: [
    "view_tokens",
    "complete_weighing",
    "flag_weighing",
    "view_flags",
    "view_history",
  ],
  [ROLES.QUALITY]: [
    "view_tokens",
    "complete_quality",
    "flag_quality",
    "view_flags",
    "view_history",
  ],
  [ROLES.PAYMENT]: [
    "view_tokens",
    "complete_payment",
    "flag_payment",
    "view_flags",
    "view_history",
  ],
};

export const hasPermission = (role, action) => {
  if (!role || !PERMISSIONS[role]) return false;
  return PERMISSIONS[role].includes(action);
};

export const getStageOfficerRole = (stageKey) => {
  switch (stageKey) {
    case "arrival":
      return ROLES.ARRIVAL;
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
