"use client";

import { useMemo, useState } from "react";
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

import { useSearchParams } from "next/navigation";
import { useAllPlantsChart } from "@/hooks/api/useDashboard";

type Range = "day" | "month" | "year";

const dayTicks = [
    0,
    180,
    360,
    540,
    720,
    900,
    1080,
    1260,
    1440,
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

const AllPlantsChart = () => {
    const searchParams = useSearchParams();

    const selectedEndUserId =
        searchParams.get("targetEndUserId");

    const serviceParams = selectedEndUserId
        ? {
            fromService: true,
            targetEndUserId:
                selectedEndUserId,
        }
        : {};

    const [range, setRange] =
        useState<Range>("day");

    const chartQuery = useAllPlantsChart({
        range,
        ...serviceParams,
    });

    const chartData = useMemo(() => {
        if (!chartQuery.data?.points) {
            return [];
        }

        return chartQuery.data.points.map((point) => {
            if (range !== "day") {
                return point;
            }

            const date = new Date(
                String(point.time).replace(" ", "T"),
            );

            return {
                ...point,
                originalTime: point.time,
                timeValue:
                    date.getHours() * 60 +
                    date.getMinutes(),
            };
        });
    }, [chartQuery.data, range]);

    const hasData = chartData.some(
        (row: any) =>
            Number(row.total ?? 0) > 0,
    );

    const handleRangeChange = (
        newRange: Range,
    ) => {
        setRange(newRange);
    };

    return (
        <div className="mt-4 w-full">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between mb-5">
                <div>
                    {/* <h2 className="text-lg font-semibold">
            All Plants
          </h2>

          <p className="text-sm text-gray-500">
            Combined plant performance
          </p> */}
                </div>

                {/* Day / Month / Year */}
                <div className="flex rounded-md p-1 bg-gray-100">
                    {(
                        ["day", "month", "year"] as Range[]
                    ).map((item) => (
                        <button
                            key={item}
                            onClick={() =>
                                handleRangeChange(item)
                            }
                            className={`px-4 py-2 rounded capitalize ${range === item
                                ? "bg-white shadow text-black"
                                : "text-gray-600"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {chartQuery.isLoading && (
                <div className="h-[400px] flex items-center justify-center text-gray-500">
                    Loading chart...
                </div>
            )}

            {/* Error */}
            {chartQuery.isError && (
                <div className="h-[400px] flex items-center justify-center text-red-500">
                    Failed to load plant data
                </div>
            )}

            {/* Unit */}
            {!chartQuery.isLoading &&
                !chartQuery.isError && (
                    <div className="text-sm text-white mb-2 ml-2">
                        {chartQuery.data?.unit}
                    </div>
                )}

            {/* No data */}
            {!chartQuery.isLoading &&
                !chartQuery.isError &&
                !hasData && (
                    <div className="w-full h-[400px] flex items-center justify-center text-gray-500">
                        No data available
                    </div>
                )}

            {/* Chart */}
            {!chartQuery.isLoading &&
                !chartQuery.isError &&
                hasData && (
                    <div className="w-full h-[400px]">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            {range === "day" ? (
                                <AreaChart data={chartData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="timeValue"
                                        type="number"
                                        domain={[0, 1440]}
                                        ticks={dayTicks}
                                        tickFormatter={formatTime}
                                        tick={{ fill: "#fff" }}
                                        axisLine={{ stroke: "#fff" }}
                                        tickLine={{ stroke: "#fff" }}
                                    />

                                    <YAxis
                                        tick={{ fill: "#fff" }}
                                        axisLine={{ stroke: "#fff" }}
                                        tickLine={{ stroke: "#fff" }}
                                    />

                                    <Tooltip
                                        cursor={false}
                                        content={({
                                            active,
                                            payload,
                                            label,
                                        }) => {
                                            if (
                                                !active ||
                                                !payload ||
                                                !payload.length
                                            ) {
                                                return null;
                                            }

                                            return (
                                                <div className="bg-white border rounded px-3 py-2 shadow">
                                                    <p className="font-medium text-black mb-1">
                                                        {payload[0]?.payload
                                                            ?.originalTime ??
                                                            formatTime(
                                                                Number(label),
                                                            )}
                                                    </p>

                                                    <p className="text-sm text-blue-700">
                                                        All Plants :{" "}
                                                        {payload[0]?.value}
                                                    </p>
                                                </div>
                                            );
                                        }}
                                    />

                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        name="All Plants"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        fillOpacity={0.15}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </AreaChart>
                            ) : (
                                <BarChart data={chartData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="time"
                                        interval="preserveStartEnd"
                                        tick={{ fill: "#fff" }}
                                        axisLine={{ stroke: "#fff" }}
                                        tickLine={{ stroke: "#fff" }}
                                    />

                                    <YAxis
                                        tick={{ fill: "#fff" }}
                                        axisLine={{ stroke: "#fff" }}
                                        tickLine={{ stroke: "#fff" }}
                                    />

                                    <Tooltip
                                        cursor={false}
                                        contentStyle={{
                                            color: "#000",
                                        }}
                                    />

                                    <Bar
                                        dataKey="total"
                                        name="All Plants"
                                        fill="#3b82f6"
                                        radius={[
                                            4,
                                            4,
                                            0,
                                            0,
                                        ]}
                                    />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                )}
        </div>
    );
};

export default AllPlantsChart;