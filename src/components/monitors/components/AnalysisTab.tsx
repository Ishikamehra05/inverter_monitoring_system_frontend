"use client";
import { useState } from "react";
import type { Device } from "./DeviceTab";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

/* ---------- MOCK DATA ---------- */
const data = [
  {
    time: "07:00",
    Vac1: 230,
    Vac2: 228,
    Vac3: 232,
    Iac1: 5,
    Iac2: 4.8,
    Pac1: 1.1,
    Pdc1: 0.9,
  },
  {
    time: "09:00",
    Vac1: 240,
    Vac2: 238,
    Vac3: 242,
    Iac1: 25,
    Iac2: 24,
    Pac1: 6.5,
    Pdc1: 5.8,
  },
  {
    time: "11:00",
    Vac1: 245,
    Vac2: 242,
    Vac3: 244,
    Iac1: 60,
    Iac2: 58,
    Pac1: 15,
    Pdc1: 14.2,
  },
  {
    time: "13:00",
    Vac1: 243,
    Vac2: 240,
    Vac3: 241,
    Iac1: 55,
    Iac2: 53,
    Pac1: 14,
    Pdc1: 13.5,
  },
  {
    time: "14:00",
    Vac1: 238,
    Vac2: 236,
    Vac3: 237,
    Iac1: 45,
    Iac2: 44,
    Pac1: 11,
    Pdc1: 10.6,
  },
];

/* ---------- PARAM CONFIG ---------- */
const PARAMS = {
  Voltage: [
    { key: "Vac1", color: "#f59e0b" },
    { key: "Vac2", color: "#fbbf24" },
    { key: "Vac3", color: "#fde68a" },
  ],
  Current: [
    { key: "Iac1", color: "#ef4444" },
    { key: "Iac2", color: "#f87171" },
  ],
  Power: [{ key: "Pac1", color: "#2563eb" }],
  DC: [{ key: "Pdc1", color: "#10b981" }],
};

/* ---------- CHART ---------- */
const AnalysisChart = ({ selectedParams }: { selectedParams: string[] }) => {
  return (
    <div className="w-full h-[450px] border rounded-lg p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 6" />
          <XAxis dataKey="time" />

          {/* Voltage */}
          <YAxis yAxisId="V" label={{ value: "(V)", angle: -90 }} />

          {/* Current */}
          <YAxis
            yAxisId="A"
            orientation="right"
            label={{ value: "(A)", angle: 90 }}
          />

          {/* Power */}
          <YAxis
            yAxisId="kW"
            orientation="right"
            offset={60}
            label={{ value: "(kW)", angle: 90 }}
          />

          <Tooltip />
          <Legend verticalAlign="top" height={40} />

          {selectedParams.flatMap((param) =>
            PARAMS[param as keyof typeof PARAMS].map((line) => (
              <Line
                key={line.key}
                dataKey={line.key}
                stroke={line.color}
                dot={false}
                strokeWidth={2}
                yAxisId={
                  param === "Voltage"
                    ? "V"
                    : param === "Current"
                      ? "A"
                      : "kW"
                }
              />
            )),
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/* ---------- TAB ---------- */
const AnalysisTab = ({
  chartDate,
  setChartDate,
  devices,
}: {
  chartDate: string;
  setChartDate: (d: string) => void;
  devices: Device[];
}) => {
  const [selectedLoggers, setSelectedLoggers] = useState<Device[]>([]);
  const [activeSN, setActiveSN] = useState<string | null>(null);
  const [selectedParams, setSelectedParams] = useState<string[]>([]);

  return (
    <div className="mt-4 space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Logger multi-select */}
        <select
          multiple
          className="border rounded px-2 py-1 min-w-[220px] h-28"
          onChange={(e) => {
            const ids = Array.from(e.target.selectedOptions).map((o) =>
              Number(o.value),
            );
            const sel = devices.filter((d) => ids.includes(d.id));
            setSelectedLoggers(sel);
            if (!activeSN && sel.length) setActiveSN(sel[0].sn);
          }}
        >
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        {/* Parameter multi-select */}
        <select
          multiple
          className="border rounded px-2 py-1 min-w-[180px] h-28"
          onChange={(e) =>
            setSelectedParams(
              Array.from(e.target.selectedOptions).map((o) => o.value),
            )
          }
        >
          <option value="Voltage">Voltage</option>
          <option value="Current">Current</option>
          <option value="Power">Power</option>
          <option value="DC">DC</option>
        </select>

        <input
          type="date"
          value={chartDate}
          onChange={(e) => setChartDate(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      {/* Logger Tabs */}
      {selectedLoggers.length > 0 && (
        <div className="flex gap-4 border-b">
          {selectedLoggers.map((l) => (
            <button
              key={l.sn}
              onClick={() => setActiveSN(l.sn)}
              className={`pb-2 text-sm ${
                activeSN === l.sn
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {l.sn}
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      {activeSN && selectedParams.length > 0 ? (
        <AnalysisChart selectedParams={selectedParams} />
      ) : (
        <div className="border border-dashed rounded-lg py-10 text-center text-gray-500">
          Select loggers and parameters
        </div>
      )}
    </div>
  );
};

export default AnalysisTab;
