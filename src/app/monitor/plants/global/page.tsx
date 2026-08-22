"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { usePlantSummary, usePlants } from "@/hooks/api/usePlants";
import { usePlantInformation } from "@/hooks/api/useDashboard";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type EnergyRange = "day" | "month" | "year";

type Plant = {
  id: string;
  name: string;
  image: string;
  latitude: number;
  longitude: number;
  status: "Offline" | "Online" | "Abnormal" | "Standby";
  effect: string;

  eToday: number;
  eTodayUnit: string;

  eTotal: number;
  eTotalUnit: string;

  capacity: number;
  capacityUnit: string;

  currentPower: number;
  currentPowerUnit: string;

  number: number;
  inverterNumber: number;

  normal: number;
  offline: number;
  abnormal: number;
  standby: number;

  reductionCO2: number;
  treePlanting: number;
};

const fallbackPlant: Plant = {
  id: "fallback-plant",

  name: "PMplastic",

  image: "/images/solar-plant.jpg",
  latitude: 23.0225,
  longitude: 72.5714,
  status: "Online",
  effect: "1.76",

  eToday: 879,
  eTodayUnit: "kWh",

  eTotal: 1.1,
  eTotalUnit: "GWh",

  capacity: 500,
  capacityUnit: "kWp",

  currentPower: 255.77,
  currentPowerUnit: "kW",

  number: 1,
  inverterNumber: 4,

  normal: 4,
  offline: 0,
  abnormal: 0,
  standby: 0,

  reductionCO2: 571.9,
  treePlanting: 1600,
};

const markerIcon = L.divIcon({
  className: "global-plant-marker",
  html: '<span class="global-plant-marker__pulse"></span><span class="global-plant-marker__icon"></span>',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

const formatPlantEffect = (effect: unknown) => {
  if (effect === null || effect === undefined) return "0";
  if (typeof effect === "string" || typeof effect === "number") {
    return String(effect);
  }

  if (typeof effect === "object") {
    const value = effect as { value?: unknown; unit?: unknown };
    if (value.value !== undefined) {
      return `${value.value}${value.unit ? ` ${value.unit}` : ""}`;
    }
  }

  return "0";
};

const dayData = [
  { time: "00:00", value: 0 },
  { time: "02:30", value: 0 },
  { time: "05:30", value: 0 },
  { time: "06:30", value: 10 },
  { time: "07:00", value: 25 },
  { time: "07:30", value: 55 },
  { time: "08:00", value: 105 },
  { time: "08:20", value: 75 },
  { time: "08:40", value: 125 },
  { time: "09:00", value: 95 },
  { time: "09:20", value: 160 },
  { time: "09:40", value: 85 },
  { time: "10:00", value: 220 },
  { time: "10:15", value: 90 },
  { time: "10:30", value: 260 },
  { time: "10:40", value: 170 },
  { time: "10:50", value: 285 },
  { time: "11:00", value: 200 },
  { time: "11:10", value: 315 },
  { time: "11:20", value: 180 },
  { time: "11:30", value: 245 },
];

const monthData = Array.from({ length: 30 }, (_, index) => ({
  time: `${index + 1}`,
  value: 200 + Math.round(Math.random() * 500),
}));

const yearData = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
].map((month) => ({
  time: month,
  value: 3000 + Math.round(Math.random() * 5000),
}));

function MapBounds({ plants }: { plants: Plant[] }) {
  const map = useMap();

  useEffect(() => {
    if (plants.length === 1) {
      map.setView([plants[0].latitude, plants[0].longitude], 8);
      return;
    }

    map.fitBounds(
      plants.map((item) => [item.latitude, item.longitude] as [number, number]),
      { padding: [40, 40], maxZoom: 8 },
    );
  }, [map, plants]);

  return null;
}

export default function GlobalMonitoringPage() {
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const plantsQuery = usePlants({ pageSize: 100 });
  const summaryQuery = usePlantSummary();

  const plants = useMemo<Plant[]>(() => {
    const apiPlants =
      plantsQuery.data?.items
        .map((item) => ({
          id: item.id,
          name: item.name || "Unnamed Plant",
          image: item.imageUrl ?? item.pictureUrl ?? "/images/solar-plant.jpg",
          latitude: Number(item.latitude),
          longitude: Number(item.longitude),
          status: item.plantStatus.status,
          effect: formatPlantEffect(item.effect),
          eToday: item.eToday.value,
          eTodayUnit: item.eToday.unit,
          eTotal: item.eTotal.value,
          eTotalUnit: item.eTotal.unit,
          capacity: item.kwp,
          capacityUnit: "kWp",
          currentPower: item.power.value,
          currentPowerUnit: item.power.unit,
          number: 1,
          inverterNumber: item.plantStatus.totalDevices,
          normal: item.plantStatus.normalCount,
          offline: item.plantStatus.offlineCount,
          abnormal: item.plantStatus.abnormalCount,
          standby: item.plantStatus.standbyCount,
          reductionCO2: 0,
          treePlanting: 0,
        }))
        .filter(
          (item) =>
            Number.isFinite(item.latitude) && Number.isFinite(item.longitude),
        ) ?? [];

    return apiPlants.length > 0 ? apiPlants : [fallbackPlant];
  }, [plantsQuery.data]);

  const plant = plants[0];
  const activePlant = selectedPlant ?? plant;
  const plantCount = plantsQuery.data?.pagination.totalItems ?? plants.length;
  const summary = summaryQuery.data;
  const deviceStatusTotal =
    activePlant.normal +
    activePlant.offline +
    activePlant.abnormal +
    activePlant.standby;
  const statusSegments = [
    { count: activePlant.normal, color: "#00e676" },
    { count: activePlant.offline, color: "#9ca3af" },
    { count: activePlant.abnormal, color: "#ff3038" },
    { count: activePlant.standby, color: "#f5b400" },
  ];
  let statusOffset = 0;
  const statusGradient =
    deviceStatusTotal > 0
      ? statusSegments
          .filter((segment) => segment.count > 0)
          .map((segment) => {
            const start = statusOffset;
            statusOffset += (segment.count / deviceStatusTotal) * 100;
            return `${segment.color} ${start}% ${statusOffset}%`;
          })
          .join(", ")
      : "#334155 0% 100%";
  const informationQuery = usePlantInformation(activePlant.id);
  const informationStats = informationQuery.data?.stats ?? [];
  const co2Value =
    informationStats.find((stat) => /co2/i.test(stat.label))?.value ??
    String(activePlant.reductionCO2);
  const treePlantingValue =
    informationStats.find((stat) => /tree\s*plant/i.test(stat.label))?.value ??
    `${(activePlant.treePlanting / 1000).toFixed(1)}`;

  const [range, setRange] = useState<EnergyRange>("day");

  const energyData = useMemo(() => {
    if (range === "month") {
      return monthData;
    }

    if (range === "year") {
      return yearData;
    }

    return dayData;
  }, [range]);

  const energyMax = Math.max(...energyData.map((point) => point.value), 1);
  const energyColor =
    energyMax >= 250 ? "#0095ff" : energyMax >= 100 ? "#00c2ff" : "#00d084";
  const energyFillOpacity = Math.min(0.55, 0.2 + energyMax / 700);

  return (
    <main
      className="
        relative
        h-full
        w-full
        overflow-hidden
        bg-[#071524]
        text-white
        animate-[dashboardIn_.7s_ease-out_both]
      "
    >
      {/* ===================================
          WORLD MAP BACKGROUND
      =================================== */}

      <MapContainer
        center={[20, 20]}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        scrollWheelZoom
        className="absolute inset-0 z-0 h-full w-full"
        zoomControl
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.7}
        />
        <MapBounds plants={plants} />
        {plants.map((item) => (
          <Marker
            key={item.id}
            position={[item.latitude, item.longitude]}
            icon={markerIcon}
            eventHandlers={{ click: () => setSelectedPlant(item) }}
          />
        ))}
      </MapContainer>

      {/* Dark overlay */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[#07131f]/65
        "
      />

      {/* Blue edge gradients */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-r
          from-blue-900/50
          via-transparent
          to-blue-900/50
        "
      />

      {/* Grid */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          grid
          grid-cols-4
          grid-rows-3
        "
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="
                border
                border-white/10
              "
          />
        ))}
      </div>

      {/* ===================================
          MAIN LAYOUT
      =================================== */}

      <div
        className="
          relative
          z-10
          pointer-events-none
          grid
          h-full
          grid-cols-[380px_1fr_520px]
        "
      >
        {/* =================================
            LEFT PANEL
        ================================= */}

        <section
          className="
            pointer-events-auto
            animate-[panelIn_.7s_ease-out_both]
            h-full
            min-w-0
            overflow-y-scroll
            global-panel-scroll
            border-r
            border-white/10
            bg-blue-950/25
            px-6
            py-8
            backdrop-blur-[2px]
          "
        >
          {/* E-Today / E-Total */}

          <div className="grid grid-cols-2 gap-6">
            <DigitalValue
              title="E-Today"
              value={summary?.eToday.value ?? activePlant.eToday}
              unit={summary?.eToday.unit ?? activePlant.eTodayUnit}
              green
            />

            <DigitalValue
              title="E-Total"
              value={summary?.eTotal.value ?? activePlant.eTotal}
              unit={summary?.eTotal.unit ?? activePlant.eTotalUnit}
            />
          </div>

          {/* Number */}

          <div className="mt-8 grid grid-cols-2 gap-6 animate-[contentIn_.7s_.15s_ease-out_both]">
            <SimpleValue title="Number" value={plantCount} />

            <SimpleValue
              title="Inverter Number"
              value={activePlant.inverterNumber}
            />
          </div>

          {/* Capacity */}

          <div className="mt-8 grid grid-cols-2 gap-7 animate-[contentIn_.7s_.25s_ease-out_both]">
            <CircleGauge
              title="Capacity"
              value={summary?.capacity.value ?? activePlant.capacity}
              unit={summary?.capacity.unit ?? activePlant.capacityUnit}
            />

            <CircleGauge
              title="Current Power"
              value={summary?.currentPower.value ?? activePlant.currentPower}
              unit={summary?.currentPower.unit ?? activePlant.currentPowerUnit}
            />
          </div>

          {/* Device status */}

          <div className="mt-12 animate-[contentIn_.7s_.35s_ease-out_both]">
            <p className="mb-7 text-sm">Device Status</p>

            <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-7 sm:gap-10">
              <div className="group relative">
                <div
                  className="relative h-28 w-28 rounded-full animate-[gaugeIn_.8s_ease-out_both] status-ring-glow"
                  style={{
                    background: `conic-gradient(${statusGradient})`,
                    WebkitMask:
                      "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px))",
                    mask: "radial-gradient(farthest-side, transparent calc(100% - 10px), #000 calc(100% - 9px))",
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[#071524]/80 text-center text-xs text-cyan-300">
                    {deviceStatusTotal} devices
                  </span>
                </div>

                <div className="pointer-events-none absolute left-1/2 top-full z-30 mt-3 w-44 -translate-x-1/2 translate-y-1 rounded-md border border-emerald-400 bg-[#071524] px-3 py-2 text-xs opacity-0 shadow-xl transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="mb-2 font-medium text-white">Device Status</p>
                  <div className="space-y-1">
                    <StatusTooltipRow
                      label="Normal"
                      value={activePlant.normal}
                      color="bg-emerald-500"
                    />
                    <StatusTooltipRow
                      label="Offline"
                      value={activePlant.offline}
                      color="bg-gray-300"
                    />
                    <StatusTooltipRow
                      label="Abnormal"
                      value={activePlant.abnormal}
                      color="bg-red-500"
                    />
                    <StatusTooltipRow
                      label="Standby"
                      value={activePlant.standby}
                      color="bg-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Status
                  label="Normal"
                  value={activePlant.normal}
                  color="bg-emerald-500"
                />

                <Status
                  label="Offline"
                  value={activePlant.offline}
                  color="bg-gray-500"
                />

                <Status
                  label="Abnormal"
                  value={activePlant.abnormal}
                  color="bg-red-500"
                />

                <Status
                  label="Standby"
                  value={activePlant.standby}
                  color="bg-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* Environment */}

          <div className="mt-2 grid grid-cols-2 gap-4 sm:gap-10 animate-[contentIn_.7s_.45s_ease-out_both]">
            <HalfGauge value={co2Value} title="Reduction CO2(t)" />
            <HalfGauge value={treePlantingValue} title="Tree Planting" />
          </div>
        </section>

        {/* =================================
            CENTER MAP
        ================================= */}

        <section className="pointer-events-none relative animate-[mapIn_.9s_ease-out_both] overflow-hidden">
          {/* Popup */}

          {selectedPlant && (
            <div className="pointer-events-auto">
              <PlantPopup
                plant={selectedPlant}
                onClose={() => setSelectedPlant(null)}
              />
            </div>
          )}
        </section>

        {/* =================================
            RIGHT PANEL
        ================================= */}

        <section
          className="
            pointer-events-auto
            h-full
            min-w-0
            overflow-y-auto
            global-panel-scroll
            border-l
            border-white/10
            bg-blue-950/20
            px-8
            py-8
          "
        >
          <h2 className="mb-6 text-sm">Energy</h2>

          {/* Day / Month / Year */}

          <div className="mb-10 flex">
            {(["day", "month", "year"] as EnergyRange[]).map((item) => (
              <button
                key={item}
                onClick={() => setRange(item)}
                className={`
                  border
                  border-gray-300
                  px-6
                  py-2
                  text-sm
                  capitalize

                  ${
                    range === item
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-800"
                  }

                  ${item === "day" ? "rounded-l-md" : ""}
                  ${item === "year" ? "rounded-r-md" : ""}
                `}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Unit */}

          <p className="mb-3 text-sm font-semibold">
            {range === "day" ? "kW" : "kWh"}
          </p>

          {/* Energy Chart */}

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyData}>
                <defs>
                  <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={energyColor}
                      stopOpacity={energyFillOpacity}
                    />

                    <stop
                      offset="95%"
                      stopColor={energyColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="5 8"
                  vertical={false}
                  stroke="rgba(255,255,255,.15)"
                />

                <XAxis
                  dataKey="time"
                  tick={{
                    fill: "#fff",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fill: "#fff",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: "#0b1e31",
                    border: "1px solid rgba(255,255,255,.2)",
                    borderRadius: 6,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={energyColor}
                  strokeWidth={2}
                  fill="url(#energyFill)"
                  dot={false}
                  isAnimationActive
                  animationBegin={150}
                  animationDuration={1400}
                  animationEasing="ease-out"
                  activeDot={{
                    r: 4,
                    fill: energyColor,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Effect */}

          <div className="mt-7 max-h-56 overflow-y-auto pr-1">
            <p className="mb-6 text-sm">Effect</p>

            <div className="space-y-5">
              {plants.map((item, index) => {
                const effectValue = Number.parseFloat(item.effect) || 0;
                const barWidth = Math.min(Math.max(effectValue, 0), 100);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedPlant(item)}
                    className={`block w-full text-left transition-opacity ${
                      item.id === activePlant.id
                        ? "opacity-100"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    style={{
                      animation: `contentIn .55s ease-out ${index * 80}ms both`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span
                        className="min-w-0 truncate text-blue-300/60"
                        title={item.name}
                      >
                        {item.name || "Unnamed Plant"}
                      </span>

                      <span className="shrink-0 font-mono text-blue-300/70">
                        {item.effect || "0"}
                      </span>
                    </div>

                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-cyan-950">
                      <div
                        className="h-full rounded-full bg-cyan-400 transition-all duration-1000"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================
   PLANT POPUP
========================================= */

function PlantPopup({ plant, onClose }: { plant: Plant; onClose: () => void }) {
  return (
    <div
      className="
        absolute
        left-1/2
        top-[35%]
        z-50
        w-[400px]
        -translate-x-1/2
        -translate-y-1/2
        animate-[popupIn_.3s_ease-out]
        overflow-hidden
        rounded-xl
        shadow-2xl
      "
    >
      {/* Header */}

      <div
        className="
          relative
          h-10
          bg-white
        "
      >
        <button
          onClick={onClose}
          className="
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            cursor-pointer
            text-gray-500
            transition
            hover:rotate-90
            hover:text-black
          "
        >
          <X size={25} />
        </button>
      </div>

      {/* Content */}

      <div
        className="
          flex
          items-center
          gap-5
          bg-gradient-to-r
          from-cyan-400/90
          to-green-400/80
          p-5
        "
      >
        <img
          src={plant.image}
          alt={plant.name}
          className="
            h-[115px]
            w-[145px]
            object-cover
          "
        />

        <div className="flex-1">
          <h3 className="mb-1 text-lg">{plant.name}</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="mr-2">
              <p className="text-xs">E-Today</p>

              <p className=" text-sm">
                {plant.eToday.toFixed(2)}

                <span className="ml-2 text-xs">{plant.eTodayUnit}</span>
              </p>
            </div>

            <div className="ml-2">
              <p className="text-xs">E-Total</p>

              <p className="mt text-sm">
                {plant.eTotal.toFixed(2)}

                <span className="ml-2 text-xs">{plant.eTotalUnit}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="
                  h-3
                  w-3
                  rounded-full
                  bg-green-300
                  shadow-[0_0_8px_#86efac]
                "
              />
              {plant.normal} Normal
            </div>

            <div className="flex items-center gap-2">
              <span
                className="
                  h-3
                  w-3
                  rounded-full
                  bg-red-400
                  shadow-[0_0_8px_#f87171]
                "
              />
              {plant.abnormal} Fault
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   DIGITAL VALUE
========================================= */

function DigitalValue({
  title,
  value,
  unit,
  green = false,
}: {
  title: string;
  value: number;
  unit: string;
  green?: boolean;
}) {
  return (
    <div>
      <p className="mb-3 text-sm">{title}</p>

      <div
        className="
          relative
          border-y
          border-cyan-400/50
          bg-blue-950/40
          px-5
          py-3
          text-center
        "
      >
        <span
          className={`
            font-mono
            text-3xl
            tracking-wider

            ${green ? "text-lime-400" : "text-cyan-400"}
          `}
        >
          {Number(value).toFixed(2)}
        </span>

        <span className="ml-2 text-xs text-blue-300/70">{unit}</span>
      </div>
    </div>
  );
}

/* =========================================
   SIMPLE VALUE
========================================= */

function SimpleValue({ title, value }: { title: string; value: number }) {
  return (
    <div>
      <p className="mb-4 text-sm">{title}</p>

      <p className="text-3xl text-blue-300/60">{value}</p>
    </div>
  );
}

/* =========================================
   CIRCLE GAUGE
========================================= */

function CircleGauge({
  title,
  value,
  unit,
}: {
  title: string;
  value: number;
  unit: string;
}) {
  return (
    <div>
      <p className="mb-5 text-sm">{title}</p>

      <div
        className="
          relative
          flex
          h-28
          w-28
          items-center
          justify-center
          rounded-full
          border-[4px]
          border-cyan-400
          bg-gradient-to-b
          from-green-400/80
          to-cyan-500/80
          shadow-[inset_0_0_25px_rgba(0,0,0,.35)]
        "
      >
        <div className="text-center">
          <p className="font-mono text-xl">{value}</p>

          <p className="text-xs">{unit}</p>
        </div>
      </div>
    </div>
  );
}

/* =========================================
   STATUS
========================================= */

function Status({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="group relative flex cursor-default items-center gap-3">
      <span
        className={`
          h-4
          w-4
          rounded-full
          ${color}
          ${value > 0 ? "status-light-active" : ""}
        `}
      />

      <span className="text-sm">{label}</span>

      <div className="pointer-events-none absolute left-full top-1/2 z-20 ml-3 flex min-w-36 -translate-y-1/2 translate-x-1 items-center justify-between rounded border-2 border-emerald-500 bg-white px-3 py-2 text-gray-500 opacity-0 shadow-lg transition duration-200 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100">
        <span className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${color}`} />
          {label}
        </span>
        <strong className="ml-5 text-gray-600">{value}</strong>
      </div>
    </div>
  );
}

function StatusTooltipRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between text-gray-300">
      <span className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        {label}
      </span>
      <strong className="text-white">{value}</strong>
    </div>
  );
}

/* =========================================
   HALF GAUGE
========================================= */

function HalfGauge({
  value,
  title,
}: {
  value: string | number;
  title: string;
}) {
  const gaugeId = `environmentGauge-${title.replace(/\W+/g, "-")}`;

  return (
    <div className="mx-auto w-full max-w-36 text-center text-cyan-300">
      <div className="relative aspect-[1.35] w-full">
        <svg
          viewBox="0 0 120 76"
          className="absolute inset-0 h-full w-full overflow-visible"
          role="img"
          aria-label={`${title}: ${value}`}
        >
          <defs>
            <linearGradient id={gaugeId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="55%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#d9f99d" />
            </linearGradient>
          </defs>
          <path
            d="M 12 64 A 48 48 0 0 1 108 64"
            fill="none"
            stroke="rgb(103 232 249 / 18%)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 12 64 A 48 48 0 0 1 108 64"
            fill="none"
            stroke={`url(#${gaugeId})`}
            strokeWidth="5"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset="100"
            className="environment-gauge-progress"
          />
        </svg>

        <span className="absolute inset-x-0 bottom-1 text-lg leading-none">
          {value}
        </span>
      </div>

      <p className="mt-2 text-xs">{title}</p>
    </div>
  );
}
