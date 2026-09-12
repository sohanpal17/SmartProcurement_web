// Official Mock data for SmartProcure Mandi Management System (SIH 26032)
// Department of Agricultural Marketing - Government Procurement Portal

export const MANDI_INFO = {
  department: "Department of Agricultural Marketing",
  portalName: "Government Procurement Portal",
  name: "Turbhe APMC Mandi, Navi Mumbai",
  code: "MH-NMB-01",
  location: "Kopar Khairane, Navi Mumbai",
  adminName: "Rajeshwar Patil (Mandi Director)",
  contactPhone: "+91 98220 12345",
  totalCapacityDaily: 100,
  statusBadge: "MSP Procurement Active",
};

export const ROLES = {
  ADMIN: "Admin",
  ARRIVAL: "Arrival & Token Officer",
  WEIGHING: "Weighing Officer",
  QUALITY: "Quality Check Officer",
  PAYMENT: "Payment Status Officer",
};

export const DEFAULT_SLOT_CONFIG = {
  Morning: {
    name: "Morning",
    mainTime: "7:00 AM – 10:00 AM",
    bufferTime: "10:00 AM – 11:00 AM",
    batches: [
      { id: "m-b1", name: "Batch 1", time: "07:00 - 08:00", capacity: 10 },
      { id: "m-b2", name: "Batch 2", time: "08:00 - 09:00", capacity: 10 },
      { id: "m-b3", name: "Batch 3", time: "09:00 - 10:00", capacity: 10 },
    ],
    buffer: { id: "m-buf", name: "Morning Buffer", time: "10:00 - 11:00", capacity: 10 },
  },
  Afternoon: {
    name: "Afternoon",
    mainTime: "12:00 PM – 3:00 PM",
    bufferTime: "3:00 PM – 4:00 PM",
    batches: [
      { id: "a-b1", name: "Batch 1", time: "12:00 - 13:00", capacity: 10 },
      { id: "a-b2", name: "Batch 2", time: "13:00 - 14:00", capacity: 10 },
      { id: "a-b3", name: "Batch 3", time: "14:00 - 15:00", capacity: 10 },
    ],
    buffer: { id: "a-buf", name: "Afternoon Buffer", time: "15:00 - 16:00", capacity: 10 },
  },
  Evening: {
    name: "Evening",
    mainTime: "5:00 PM – 8:00 PM",
    bufferTime: "No additional buffer",
    batches: [
      { id: "e-b1", name: "Batch 1", time: "17:00 - 18:30", capacity: 10 },
      { id: "e-b2", name: "Batch 2", time: "18:30 - 20:00", capacity: 10 },
    ],
    buffer: null,
  },
};

export const INITIAL_OFFICERS = [];

export const INITIAL_FARMERS = [];
