"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { time: "06:00", value: 0 },
  { time: "08:00", value: 40 },
  { time: "10:00", value: 120 },
  { time: "12:00", value: 220 },
  { time: "13:30", value: 180 },
];

export default function EnergyChart() {
  return (
    <div className="bg-black/40 p-4 rounded-lg">
      <div className="flex justify-between mb-2">
        <p>Energy</p>
        <div className="flex gap-2 text-sm">
          <button className="px-2 bg-blue-600 rounded">Day</button>
          <button className="px-2">Month</button>
          <button className="px-2">Year</button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
