import { useState, useMemo, useEffect } from "react";
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
import { TfiLayoutGrid2 } from "react-icons/tfi";
import { FaList } from "react-icons/fa";
import { Download } from "lucide-react";
import { usePlantChart, usePlantChartExport } from "@/hooks/api/useDashboard";

type ChartTabProps = {
  chartDate: string;
  setChartDate: (date: string) => void;
  plantId: string;
};

type Mode = "total" | "single";
type Range = "day" | "month" | "year";

type SeriesItem = {
  key: string;
  label: string;
  color: string;
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
  plantId,
}: ChartTabProps) => {
  const searchParams = useSearchParams();
  const selectedEndUserId = searchParams.get("targetEndUserId");
  // console.log("userid", selectedEndUserId)

  const serviceParams =
    selectedEndUserId
      ? {
        fromService: true,
        targetEndUserId: selectedEndUserId,
      }
      : {};

  const [mode, setMode] =
    useState<Mode>("total");

  const [range, setRange] =
    useState<Range>("day");

  const [visible, setVisible] =
    useState<Record<string, boolean>>({});

  const chartQuery = usePlantChart(
    plantId,
    {
      date: chartDate,
      range,
      mode,
      ...serviceParams,
    }
  );
  const exportMutation = usePlantChartExport();

  const handleExport = async () => {
    try {
      const result =
        await exportMutation.mutateAsync({
          plantId,
          params: {
            date: chartDate,
            range,
            mode,
            format: "csv",
            ...serviceParams
          },
        });

      // console.log({
      //   date: chartDate,
      //   range,
      //   mode,
      //   format: "csv",
      //   ...serviceParams,
      // });

      const apiBase =
        process.env.NEXT_PUBLIC_API_URL ?? "";

      // console.log(result.downloadUrl);

      window.open(
        `${apiBase}${result.downloadUrl}`,
        "_blank"
      );
    } catch (error) {
      console.error(
        "Export failed",
        error
      );
    }
  };

  const series: SeriesItem[] =
    chartQuery.data?.series ?? [];

  useEffect(() => {
    const obj: Record<
      string,
      boolean
    > = {};

    series.forEach((s) => {
      obj[s.key] = true;
    });

    setVisible(obj);

  }, [chartQuery.data?.series]);

  const chartData = useMemo(() => {

    if (!chartQuery.data?.points)
      return [];

    return chartQuery.data.points.map(
      (p) => {

        if (range !== "day")
          return p;

        const date =
          new Date(
            p.time.replace(
              " ",
              "T"
            )
          );

        return {
          ...p,

          originalTime:
            p.time,

          timeValue:
            date.getHours() * 60 +
            date.getMinutes(),
        };
      }
    );

  }, [
    chartQuery.data,
    range,
  ]);

  const filteredSeries =
    mode === "single"
      ? series.filter(
        (s) => visible[s.key]
      )
      : series;

  const hasData =
    chartData.length > 0 &&
    chartData.some((row) =>
      filteredSeries.some(
        (series) => Number(row[series.key] ?? 0) > 0
      )
    );

  return (
    <div className="mt-4 w-full">

      {/* Controls */}

      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">

        <div className="flex flex-col sm:flex-row items-center gap-3">

          {/* Total / Single */}

          <div className="flex rounded-md p-1 bg-gray-100">

            <button
              onClick={() => setMode("total")}
              className={`px-3 py-2 rounded cursor-pointer flex items-center gap-2 ${mode === "total"
                ? "bg-white shadow text-black"
                : "text-gray-600"
                }`}
            >
              <TfiLayoutGrid2 size={14} />
              Total
            </button>

            <button
              onClick={() => setMode("single")}
              className={`px-3 py-2 rounded cursor-pointer flex items-center gap-2 ${mode === "single"
                ? "bg-white shadow text-black"
                : "text-gray-600"
                }`}
            >
              <FaList size={14} />
              Single
            </button>

          </div>

          {/* Day Month Year */}

          <div className="flex rounded-md p-1 bg-gray-100">

            {(["day", "month", "year"] as Range[]).map((r) => (

              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-2 rounded capitalize ${range === r
                  ? "bg-white shadow text-black"
                  : "text-gray-600"
                  }`}
              >
                {r}
              </button>

            ))}

          </div>

        </div>

        {/* Right side */}

        <div className="flex items-center gap-3">

          <input
            type="date"
            value={chartDate}
            onChange={(e) =>
              setChartDate(e.target.value)
            }
            className="border rounded px-3 py-2 text-black"
          />

          <button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
          >

            <Download size={16} />

            {exportMutation.isPending
              ? "Exporting..."
              : "Download"}

            {/* Download */}

          </button>

        </div>

      </div>

      {/* Single mode legend */}

      {mode === "single" &&
        series.length > 0 && (

          <div className="flex flex-wrap gap-4 mb-5 text-black">
            {series.map((s) => (
              <button
                key={s.key}
                onClick={() =>
                  setVisible((prev) => ({
                    ...prev,
                    [s.key]:
                      !prev[s.key],
                  }))
                }
                className={`flex items-center gap-2 ${visible[s.key]
                  ? ""
                  : "opacity-40"
                  }`}
              >
                <span className="w-3 h-3 rounded-sm" style={{ background: s.color }}
                />
                {s.label}
              </button>
            ))}
          </div>

        )}

      {/* Empty state */}

      {mode === "single" && series.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No logger data available
        </div>

      )}
      {/* Unit */}

      <div className="text-sm text-gray-500 mb-2 ml-2">
        {chartQuery.data?.unit}
      </div>

      {/* Chart */}
      <div className="w-full h-[450px]">
        {range === "day" && !hasData ? (
          <div className="w-full h-[450px] flex items-center justify-center">
            <div className="text-center text-gray-500">
              No data available for this date
            </div>
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            {chartQuery.data?.chartType ===
              "area" ? (

              <AreaChart
                data={chartData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

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
                  tickFormatter={(v) =>
                    range === "day"
                      ? formatTime(v)
                      : v
                  }
                />

                <YAxis />

                <Tooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (
                      !active ||
                      !payload ||
                      !payload.length
                    )
                      return null;

                    return (
                      <div className="bg-white border rounded px-3 py-2 shadow">

                        <p className="font-medium text-gray-700 mb-1">

                          {range === "day"
                            ? payload[0].payload
                              ?.originalTime ??
                            label
                            : label}

                        </p>

                        {payload.map((item) => (

                          <div
                            key={String(
                              item.dataKey
                            )}
                            className="flex gap-2"
                          >

                            <span
                              style={{
                                color:
                                  item.color,
                              }}
                            >

                              {String(
                                item.name ??
                                item.dataKey
                              )}

                              {" : "}

                              {item.value}

                              {" "}

                              {/* {unit} */}

                            </span>

                          </div>

                        ))}

                      </div>
                    );
                  }}
                />

                {filteredSeries.map(
                  (s) => (

                    <Area
                      key={s.key}
                      dataKey={s.key}
                      stroke={s.color}
                      fill={s.color}
                      fillOpacity={0.15}
                      strokeWidth={2}
                      dot={false}
                      legendType="none"
                    />

                  )
                )}

              </AreaChart>

            ) : (

              <BarChart
                data={chartData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="time"
                  interval="preserveStartEnd"
                  tickFormatter={(value, index) => {
                    if (range === "month") {
                      return index % 2 === 0
                        ? value
                        : "";
                    }

                    return value;
                  }}
                />

                <YAxis />

                <Tooltip
                  cursor={false}
                  wrapperStyle={{
                    outline: "none",
                  }}
                  content={({ active, payload, label }) => {

                    if (
                      !active ||
                      !payload ||
                      !payload.length
                    ) {
                      return null;
                    }

                    return (
                      <div className="bg-white border shadow rounded px-3 py-2">

                        <div className="text-gray-700 text-sm mb-1">

                          {label}

                        </div>

                        {payload.map((item) => (

                          <div
                            key={String(item.dataKey)}
                            style={{
                              color:
                                item.color,
                            }}
                            className="text-sm"
                          >

                            {String(
                              item.dataKey
                            )}

                            {" : "}

                            {item.value}

                            {" "}

                            {/* {unit} */}

                          </div>

                        ))}

                      </div>
                    );
                  }}
                />

                {filteredSeries.map(
                  (s) => (

                    <Bar
                      key={s.key}
                      dataKey={s.key}
                      fill={s.color}
                      activeBar={false}
                      radius={[4, 4, 0, 0]}
                    />

                  )
                )}

              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div >
  );
};

export default ChartTab;