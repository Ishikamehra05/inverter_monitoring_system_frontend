import type { ChartResponse, PlantInformation } from "./schemas/dashboard";
import type { ApiDevice } from "./schemas/devices";
import type { Plant, PlantSummary } from "./schemas/plants";
import type { Firmware, MonitorUser, Profile, ServiceTask } from "./schemas/service";

export const mockPlantSummary: PlantSummary = {
  currentPower: { value: 0, unit: "W" },
  eToday: { value: 0, unit: "kWh" },
  eTotal: { value: 25, unit: "kWh" },
  hTotal: { value: 16, unit: "Hrs" },
  capacity: { value: 0, unit: "kW" },
  statusCounts: {
    All: 5,
    Normal: 2,
    Abnormal: 1,
    Standby: 1,
    Offline: 1,
  },
};

export const mockPlants: Plant[] = [
 {
  id: "plant_service",
  name: "Service",
  type: "Grid",

  price: 0,
  priceUnit: "INR",
  kwp: 0,
  address: "Gandhinagar",
  latitude: "23.2156",
  longitude: "72.6369",

  eToday: { value: 0, unit: "Wh" },
  eTotal: { value: 25, unit: "kWh" },
  power: { value: 0, unit: "W" },
  effect: "0",
  installed: "2025-08-13",
  updated: "2025-08-25 15:39:21",
  plantStatus: {
  status: "Offline",
  totalDevices: 1,
  normalCount: 0,
  abnormalCount: 0,
  standbyCount: 0,
  offlineCount: 1,
  updatedAt: "2025-08-25 15:39:21",
},
},
  {
  id: "plant_service",
  name: "Service",
  type: "Grid",

  price: 0,
  priceUnit: "INR",
  kwp: 0,
  address: "Gandhinagar",
  latitude: "23.2156",
  longitude: "72.6369",

  eToday: { value: 0, unit: "Wh" },
  eTotal: { value: 25, unit: "kWh" },
  power: { value: 0, unit: "W" },
  effect: "0",
  installed: "2025-08-13",
  updated: "2025-08-25 15:39:21",
  plantStatus: {
  status: "Offline",
  totalDevices: 1,
  normalCount: 0,
  abnormalCount: 0,
  standbyCount: 0,
  offlineCount: 1,
  updatedAt: "2025-08-25 15:39:21",
},
},
];

export const mockPlantInformation: PlantInformation = {
  installationDate: "2024-12-29",
  capacity: "500 kW",
  address: "Gandhinagar",
  stats: [
    { label: "Input Power", value: "146.57 kW", icon: "/images/information-tab/info-img-1.png" },
    { label: "CO2", value: "383.95t", icon: "/images/information-tab/info-img-2.png" },
    { label: "Tree Planting", value: "1075", icon: "/images/information-tab/info-img-3.png" },
    { label: "Efficiency", value: "0.35", icon: "/images/information-tab/info-img-4.png" },
    { label: "Weather", value: "0.35", icon: "/images/information-tab/info-img-5.png" },
    { label: "Irradiance", value: "0.35", icon: "/images/information-tab/info-img-6.png" },
    { label: "Cell Temperature", value: "0.35", icon: "/images/information-tab/info-img-7.png" },
  ],
};


export const mockProfile: Profile = {
  account: "polycab.admin",
  email: "Bipin.Sonsale@Polycab.com",
  phone: "",
  address: "",
  timezone: "(UTC+05:30) Colombo, New Delhi",
};

export const mockMonitorUsers: MonitorUser[] = Array.from({ length: 10 }).map(
  (_, i) => ({
    id: i + 1,
    account: ".1Randhawanewas",
    affiliation: "polycab.admin",
    power: { value: 0, unit: "kW" },
    today: { value: 0, unit: "kWh" },
    total: { value: 25, unit: "kWh" },
    status: {
      online: i % 2,
      abnormal: 0,
      standby: i % 3 === 0 ? 1 : 0,
      offline: 1,
    },
  }),
);

export const mockFirmwares: Firmware[] = [
  {
    id: "firmware_1",
    name: "G9511-251401-13_212608",
    version: "G9511-251401-13_212608",
    createdTime: "2026-02-11 13:42:22",
    remark: "Release Firmware",
  },
  {
    id: "firmware_2",
    name: "G9511-251400-13_212603",
    version: "G9511-251400-13_212603",
    createdTime: "2026-02-11 13:41:29",
    remark: "Release Firmware",
  },
];

export const mockTasks: ServiceTask[] = [
  {
    id: 1,
    name: "Polycab Rocket 50pcs",
    status: "Finished",
    created: "2026-01-13 11:25:12",
    begin: "2026-01-13 11:19:11",
  },
  {
    id: 2,
    name: "1105",
    status: "Failed",
    created: "2025-11-05 07:45:40",
    begin: "2025-11-05 07:40:31",
  },
];
