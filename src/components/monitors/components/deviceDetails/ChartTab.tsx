import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
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
import { Download } from "lucide-react";
import { useDeviceChartExport } from "@/hooks/api/useDevices"

type Range = "day" | "month" | "year";

type ChartTabProps = {
  chartDate: string;
  setChartDate: (date: string) => void;
  range: Range;
  setRange: (range: Range) => void;
  chartData?: any;
  deviceId: string;
  plantId: string;
};

const dayTicks = [
  0, 180, 360, 540,
  720, 900, 1080,
  1260, 1440,
];

const formatTime = (minutes: number) => {
  const hrs = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");

  const mins = (minutes % 60)
    .toString()
    .padStart(2, "0");

  return `${hrs}:${mins}`;
};


const ChartTab = ({
  chartDate,
  setChartDate,
  range,
  setRange,
  chartData,
  deviceId,
  plantId,
}: ChartTabProps) => {
  const searchParams = useSearchParams();
  const selectedEndUserId = searchParams.get("targetEndUserId");

  const serviceParams =
    selectedEndUserId
      ? {
        fromService: true,
        targetEndUserId: selectedEndUserId,
      }
      : {};
  const apiChart = chartData;

  const chartPoints = useMemo(() => {
    return (
      apiChart?.points?.map((p: any) => {
        if (apiChart?.range === "day") {
          const date = new Date(
            p.time.replace(" ", "T")
          );

          return {
            ...p,
            timeValue:
              date.getHours() * 60 +
              date.getMinutes(),
            originalTime: p.time,
            total: Number(p.total ?? 0),
          };
        }

        return {
          time:
            apiChart?.range === "year"
              ? p.month
              : p.date,
          total: Number(p.total ?? 0),
        };
      }) ?? []
    );
  }, [apiChart]);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: any) => {
    if (!active || !payload?.length)
      return null;

    const point =
      payload[0]?.payload;

    return (
      <div className="bg-white border rounded shadow px-3 py-2">
        <p className="text-sm font-medium text-black">
          {range === "day"
            ? point?.originalTime
            : apiChart?.range === "year"
              ? `Month: ${label}`
              : `Date: ${label}`}
        </p>

        <p className="text-blue-600">
          Total: {payload[0].value} {apiChart?.unit}
        </p>
      </div>
    );
  };

  const hasData =
    chartPoints.length > 0 &&
    chartPoints.some(
      (item: any) => Number(item.total ?? 0) > 0
    );

  const activeBtn = "bg-white text-black shadow-md";
  const inactiveBtn = "bg-gray-100 text-gray-700";

  const chartExportMutation = useDeviceChartExport();

  const handleExport = async () => {
    try {
      const csv = await chartExportMutation.mutateAsync({
        deviceId,
        params: {
          plantId,
          date: chartDate,
          range,
          format: "csv",
          ...serviceParams,
        },
      });

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `chart-${range}-${chartDate}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="mt-4 w-full">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-end mb-3">
        {/* Day / Month / Year */}
        <div className="flex rounded-md p-1.5 cursor-pointer overflow-hidden border bg-gray-100">
          {(["day", "month", "year"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-sm rounded-sm cursor-pointer capitalize ${range === r ? activeBtn : inactiveBtn
                }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Date */}
        <input
          type="date"
          className="border rounded px-3 py-1.5 cursor-pointer transition-all duration-200 text-black hover:border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          value={chartDate}
          onChange={(e) => setChartDate(e.target.value)}
        />
        <button
          onClick={handleExport}
          disabled={chartExportMutation.isPending}
          className="border rounded p-2 sm:px-3 sm:py-2 bg-blue-500 text-white"
        >
          <span className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {chartExportMutation.isPending
              ? "Exporting..."
              : "Download"}
          </span>
        </button>
      </div>

      {/* Chart */}
      <div className="w-full mt-6 pt-6 h-56 md:h-84 lg:h-112">
        <div className="w-full mt-6 pt-6 h-56 md:h-84 lg:h-112">
          {range === "day" && !hasData ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data available for this date
            </div>
          ) : !chartPoints.length ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <div className="text-sm text-gray-500 mb-2">
                {apiChart?.unit}
              </div>
              {apiChart?.chartType === "area" ? (
                <AreaChart data={chartPoints}>
                  <CartesianGrid strokeDasharray="5 5" vertical={false} />
                  <XAxis
                    dataKey={
                      range === "day"
                        ? "timeValue"
                        : "time"
                    }
                    type={
                      range === "day"
                        ? "number"
                        : "category"
                    }
                    domain={
                      range === "day"
                        ? [0, 1440]
                        : undefined
                    }
                    ticks={
                      range === "day"
                        ? dayTicks
                        : undefined
                    }
                    tickFormatter={(value) =>
                      range === "day"
                        ? formatTime(value)
                        : value
                    }
                  />
                  <YAxis />
                  <Tooltip
                    // cursor={false}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;

                      const point = payload[0].payload;

                      return (
                        <div className="bg-white border rounded shadow px-3 py-2">
                          <p className="text-black font-medium mb-1">
                            {point.originalTime}
                          </p>

                          <p className="text-blue-600">
                            Total : {payload[0].value} {apiChart?.unit}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#2f80ed"
                    fill="#2f80ed"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartPoints}>
                  <CartesianGrid strokeDasharray="5 5" vertical={false} />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip
                    cursor={false}
                    content={<CustomTooltip />}
                  />
                  <Bar
                    dataKey="total"
                    fill="#2f80ed"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartTab;
