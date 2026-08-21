"use client";

import { useState, useEffect } from "react";

type StatusType = "Normal" | "Offline" | "Abnormal" | "Standby";

const STATUS_DATA: Record<
  StatusType,
  { color: string; dot: string; count: number }
> = {
  Normal: { color: "#22c55e", dot: "bg-green-500", count: 4 },
  Offline: { color: "#9ca3af", dot: "bg-gray-400", count: 2 },
  Abnormal: { color: "#ef4444", dot: "bg-red-500", count: 1 },
  Standby: { color: "#f59e0b", dot: "bg-yellow-500", count: 3 },
};

export default function DeviceStatus() {
  const [active, setActive] = useState<StatusType>("Normal");
  const [hover, setHover] = useState(false);
  const [animate, setAnimate] = useState(false);

  const current = STATUS_DATA[active];

  // trigger animation when status changes
  useEffect(() => {
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-white">Device Status</p>

      <div className="flex items-center justify-between gap-8 px-12 relative">
        {/* RING */}
        <div
          className="relative w-28 h-28"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            {/* background ring */}
            <circle
              cx="18"
              cy="18"
              r="15.915"
              fill="transparent"
              stroke="#1f2937"
              strokeWidth="2.5"
              strokeDashoffset={animate ? "0" : "100"}
            />

            {/* animated ring */}
            <circle
              cx="18"
              cy="18"
              r="15.915"
              fill="transparent"
              stroke={current.color}
              strokeWidth="2.5"
              strokeDasharray="100"
              strokeDashoffset={animate ? "0" : "100"}
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* TOOLTIP */}
          {hover && (
            <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white text-black px-3 py-1.5 rounded shadow-md flex items-center gap-2 whitespace-nowrap">
              <span className={`w-2.5 h-2.5 rounded-full ${current.dot}`} />
              <span className="text-sm font-medium">{active}</span>
              <span className="text-sm">{current.count}</span>
            </div>
          )}
        </div>

        {/* STATUS LIST */}
        <div className="space-y-2 text-sm">
          {(Object.keys(STATUS_DATA) as StatusType[]).map((status) => (
            <div
              key={status}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setActive(status)}
            >
              <span
                className={`w-3 h-3 rounded-full ${STATUS_DATA[status].dot}`}
              />
              <span
                className={
                  active === status ? "text-white font-medium" : "text-gray-400"
                }
              >
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
