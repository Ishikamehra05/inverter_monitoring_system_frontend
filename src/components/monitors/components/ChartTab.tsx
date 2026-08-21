import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Mode = "total" | "single";
type Range = "day" | "month" | "year";
type LoggerKey = "inverter1" | "inverter2" | "inverter3";

const ChartTab = ({
  chartDate,
  setChartDate,
}: {
  chartDate: string;
  setChartDate: (date: string) => void;
}) => {
  const [mode, setMode] = useState<Mode>("total");
  const [range, setRange] = useState<Range>("day");

  // legend visibility (for single mode)-------------
  const [visible, setVisible] = useState<Record<LoggerKey, boolean>>({
  inverter1: true,
  inverter2: true,
  inverter3: true,
});

const loggerKeys: LoggerKey[] = ["inverter1", "inverter2", "inverter3"];

  // ---------- BASE DATA (hourly) ----------
  const baseData = useMemo(() => {
    const hours = Array.from({ length: 49 }, (_, i) => i * 0.5);

    return hours.map((h) => {
      const base =
        h >= 4 && h <= 11 ? 150 * Math.exp(-Math.pow((h - 7.5) / 3.5, 2)) : 0;

      const inverter1 = base * 0.4;
      const inverter2 = base * 0.35;
      const inverter3 = base * 0.25;

      return {
        time: `${h}:00`,
        inverter1,
        inverter2,
        inverter3,
        total: inverter1 + inverter2 + inverter3,
      };
    });
  }, []);

  // ---------- RANGE DATA ----------
  const chartData = useMemo(() => {
    if (range === "day") {
      return baseData.map((d) => ({
        ...d,
        inverter1: +d.inverter1.toFixed(2),
        inverter2: +d.inverter2.toFixed(2),
        inverter3: +d.inverter3.toFixed(2),
        total: +d.total.toFixed(2),
      }));
    }

    if (range === "month") {
      // 30 days (mock)
      return Array.from({ length: 30 }, (_, i) => ({
        time: `Day ${i + 1}`,
        inverter1: 40 + Math.random() * 20,
        inverter2: 30 + Math.random() * 15,
        inverter3: 20 + Math.random() * 10,
        total: 0,
      })).map((d) => ({
        ...d,
        total: d.inverter1 + d.inverter2 + d.inverter3,
      }));
    }

    // YEAR
    return [
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
    ].map((m) => {
      const l1 = 900 + Math.random() * 200;
      const l2 = 700 + Math.random() * 150;
      const l3 = 500 + Math.random() * 100;
      return {
        time: m,
        inverter1: l1,
        inverter2: l2,
        inverter3: l3,
        total: l1 + l2 + l3,
      };
    });
  }, [range, baseData]);

  const activeBtn = "bg-white text-black shadow-md";
  const inactiveBtn = "bg-gray-100 text-gray-700";

  const CustomLegend = () => (
    <div className="flex gap-4 text-sm mb-2">
      {loggerKeys.map((key) => (
        <button
          key={key}
          onClick={() =>
            setVisible((prev) => ({
              ...prev,
              [key]: !prev[key],
            }))
          }
          className={`flex items-center gap-1 ${
            visible[key as keyof typeof visible] ? "opacity-100" : "opacity-40"
          }`}
        >
          <span
            className={`w-3 h-3 rounded-sm ${
              key === "inverter1"
                ? "bg-[#54AF3A]"
                : key === "inverter2"
                  ? "bg-[#FAB832]"
                  : "bg-[#D32224]"
            }`}
          />
          {key}
        </button>
      ))}
    </div>
  );

  return (
    <div className="mt-4 w-full">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between mb-3">
        <div className="flex gap-2">
          {/* Total / Single */}
          <div className="flex rounded-md overflow-hidden border bg-gray-100 p-1">
            <button
              onClick={() => setMode("total")}
              className={`px-3 py-1 text-sm ${
                mode === "total" ? activeBtn : inactiveBtn
              }`}
            >
              📊 Total
            </button>
            <button
              onClick={() => setMode("single")}
              className={`px-3 py-1 text-sm ${
                mode === "single" ? activeBtn : inactiveBtn
              }`}
            >
              📈 Single
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Day / Month / Year */}
          <div className="flex rounded-md overflow-hidden border bg-gray-100 p-1">
            {(["day", "month", "year"] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-sm capitalize ${
                  range === r ? activeBtn : inactiveBtn
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Date */}
          <input
            type="date"
            className="border border-black rounded-md px-2 py-1 text-sm"
            value={chartDate}
            onChange={(e) => setChartDate(e.target.value)}
          />
        </div>
      </div>

      {/* Chart */}
      {mode === "single" && <CustomLegend />}
      {/* Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          {range === "day" ? (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="5 5" vertical={false} />
              <XAxis dataKey="time" />
              <YAxis unit=" kW" />
              <Tooltip />

              {mode === "total" && (
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#2f80ed"
                  fill="rgba(47,128,237,0.2)"
                />
              )}

              {mode === "single" && (
                <>
                  {visible.inverter1 && (
                    <Area
                      dataKey="inverter1"
                      stroke="#54AF3A"
                      fill="rgba(84,175,58,0.15)"
                    />
                  )}
                  {visible.inverter2 && (
                    <Area
                      dataKey="inverter2"
                      stroke="#FAB832"
                      fill="rgba(250,184,50,0.15)"
                    />
                  )}
                  {visible.inverter3 && (
                    <Area
                      dataKey="inverter3"
                      stroke="#D32224"
                      fill="rgba(211,34,36,0.15)"
                    />
                  )}
                </>
              )}
            </AreaChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="5 5" vertical={false} />
              <XAxis dataKey="time" />
              <YAxis unit=" kW" />
              <Tooltip />

              {mode === "single" && (
                <>
                  {visible.inverter1 && <Bar dataKey="inverter1" fill="#54AF3A" />}
                  {visible.inverter2 && <Bar dataKey="inverter2" fill="#FAB832" />}
                  {visible.inverter3 && <Bar dataKey="inverter3" fill="#D32224" />}
                </>
              )}

              {mode === "total" && (
                <Bar dataKey="total" fill="#2f80ed" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartTab;
