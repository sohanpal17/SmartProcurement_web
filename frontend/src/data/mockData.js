// Official Mock data for SmartProcure Centre Management System
// Department of Agricultural Marketing - Government Procurement Portal

export const MANDI_INFO = {
  department: "Department of Agricultural Marketing",
  portalName: "Government Procurement Portal",
  name: "Main Grain Procurement Centre",
  code: "MH-NMB-01",
  district: "Thane",
  state: "Maharashtra",
  location: "Main Procurement Hub",
  adminName: "Rajeshwar Patil (Centre Administrator)",
  contactPhone: "+91 98220 12345",
  totalCapacityDaily: 100,
  statusBadge: "MSP Procurement Active",
};


export const ROLES = {
  ADMIN: "Centre Administrator",
  CHECKIN: "Check-in Staff",
  ARRIVAL: "Check-in Staff",
  WEIGHING: "Weighing Staff",
  QUALITY: "Quality Staff",
  PAYMENT: "Payment Staff",
};


export const INITIAL_CENTRES = [
  {
    id: "MH-NMB-01",
    name: "Main Grain Procurement Centre",
    state: "Maharashtra",
    district: "Thane",
    location: "Main Procurement Hub",
    latitude: "19.0760",
    longitude: "73.0077",
    supportedCommodities: ["Wheat", "Paddy / Rice", "Maize", "Cotton", "Mustard"],
    batchCapacity: 30, // quintals or max farmers per batch
    dailyCapacity: 100,
    operationalStatus: "Active",
    activeStaffCount: 12,
  },
  {
    id: "MH-NSK-02",
    name: "Lasalgaon Grain & Pulse Centre",
    state: "Maharashtra",
    district: "Nashik",
    location: "Lasalgaon Market Yard, Niphad",
    latitude: "20.1478",
    longitude: "74.2341",
    supportedCommodities: ["Wheat", "Gram / Pulses", "Soyabean", "Maize"],
    batchCapacity: 25,
    dailyCapacity: 80,
    operationalStatus: "Active",
    activeStaffCount: 9,
  },
  {
    id: "MH-PNE-03",
    name: "Gultekdi Grain Procurement Hub",
    state: "Maharashtra",
    district: "Pune",
    location: "Gultekdi Market Yard, Pune",
    latitude: "18.4984",
    longitude: "73.8647",
    supportedCommodities: ["Paddy / Rice", "Wheat", "Soyabean"],
    batchCapacity: 35,
    dailyCapacity: 120,
    operationalStatus: "Active",
    activeStaffCount: 15,
  },
  {
    id: "MH-NGP-04",
    name: "Kalamna Cotton & MSP Sub-Centre",
    state: "Maharashtra",
    district: "Nagpur",
    location: "Kalamna Market Complex, Nagpur",
    latitude: "21.1689",
    longitude: "79.1290",
    supportedCommodities: ["Cotton", "Soyabean", "Gram / Pulses"],
    batchCapacity: 20,
    dailyCapacity: 60,
    operationalStatus: "Maintenance",
    activeStaffCount: 6,
  },
];

export const DEFAULT_SLOT_CONFIG = {
  Morning: {
    name: "Morning",
    mainTime: "7:00 AM – 10:00 AM",
    batches: [
      { id: "m-b1", name: "Batch 1", time: "07:00 - 08:00", capacity: 10 },
      { id: "m-b2", name: "Batch 2", time: "08:00 - 09:00", capacity: 10 },
      { id: "m-b3", name: "Batch 3", time: "09:00 - 10:00", capacity: 10 },
    ],
  },
  Afternoon: {
    name: "Afternoon",
    mainTime: "12:00 PM – 3:00 PM",
    batches: [
      { id: "a-b1", name: "Batch 1", time: "12:00 - 13:00", capacity: 10 },
      { id: "a-b2", name: "Batch 2", time: "13:00 - 14:00", capacity: 10 },
      { id: "a-b3", name: "Batch 3", time: "14:00 - 15:00", capacity: 10 },
    ],
  },
  Evening: {
    name: "Evening",
    mainTime: "5:00 PM – 8:00 PM",
    batches: [
      { id: "e-b1", name: "Batch 1", time: "17:00 - 18:30", capacity: 10 },
      { id: "e-b2", name: "Batch 2", time: "18:30 - 20:00", capacity: 10 },
    ],
  },
};

export const INITIAL_OFFICERS = [];

export const INITIAL_FARMERS = [];

