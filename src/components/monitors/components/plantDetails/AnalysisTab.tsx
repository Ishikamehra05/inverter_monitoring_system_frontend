"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Select from "react-select";
import { IoIosArrowUp } from "react-icons/io";

import {
  useAnalysisDevices,
  useAnalysisParameters,
  useAnalysisChart,
} from "@/hooks/api/useDashboard";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type Props = {
  chartDate: string;
  setChartDate: (d: string) => void;
  plantId: string;
};

const dayTicks = [
  "00:00",
  "03:00",
  "06:00",
  "09:00",
  "12:00",
  "15:00",
  "18:00",
  "21:00",
  "24:00",
];

const AnalysisTab = ({
  chartDate,
  setChartDate,
  plantId,
}: Props) => {
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
  const [selectedLogger, setSelectedLogger] =
    useState("");

  const [selectedKeys, setSelectedKeys] =
    useState<string[]>([]);

  const [openGroup, setOpenGroup] =
    useState<string | null>(null);

  const [isParamOpen, setIsParamOpen] =
    useState(false);

  const paramRef = useRef<HTMLDivElement>(null);

  /* ---------------- Devices ---------------- */

  const devicesQuery = useAnalysisDevices(plantId, serviceParams);

  const loggerOptions =
    devicesQuery.data?.items.map(
      (d: any) => ({
        value: d.id,
        label: d.name,
      })
    ) ?? [];

  /* ---------------- Parameters ---------------- */

  const parameterQuery =
    useAnalysisParameters(
      plantId,
      selectedLogger,
      chartDate,
      serviceParams
    );

  const groups = parameterQuery.data?.groups ?? [];
  // console.log(parameterQuery.data)

  /* ---------------- Chart ---------------- */

  // console.log("serviceParams", serviceParams);

  // console.log("analysisChart request", {
  //   plantId,
  //   selectedLogger,
  //   chartDate,
  //   selectedKeys,
  //   serviceParams,
  // });
  const analysisChart =
    useAnalysisChart(
      plantId,
      selectedLogger,
      chartDate,
      selectedKeys,
      serviceParams
    );

  const chartData = useMemo(() => {
    return (analysisChart.data?.points ?? []).map((p: any) => {
      const date = new Date(
        String(p.time).replace(" ", "T")
      );

      return {
        ...p,
        originalTime: p.time,
        timeValue:
          date.getHours() * 60 +
          date.getMinutes(),
      };
    });
  }, [analysisChart.data]);

  const selectedParams =
    analysisChart.data?.selectedParameters ?? [];


  useEffect(() => {
    const close = (
      e: MouseEvent
    ) => {
      if (
        paramRef.current &&
        !paramRef.current.contains(
          e.target as Node
        )
      ) {
        setIsParamOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      close
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        close
      );
  }, []);

  const noData =
    selectedLogger &&
    selectedKeys.length > 0 &&
    chartData.length === 0;

  const dayTicks = [
    0, 180, 360, 540,
    720, 900, 1080,
    1260, 1440,
  ];
  return (
    <div className="space-y-5 mt-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-black">
        <Select
          options={loggerOptions}
          className="w-60"
          placeholder="Select Logger"
          onChange={(selected) => {
            if (!selected)
              return;
            setSelectedLogger(
              String(selected.value)
            );
            setSelectedKeys([]);
          }}
        />

        {/* Parameters */}

        <div
          ref={paramRef}
          className="relative min-w-[260px] text-black"
        >
          <button
            type="button"
            onClick={() =>
              setIsParamOpen(
                !isParamOpen
              )
            }
            className="w-full border rounded-md px-4 py-2 bg-white flex justify-between items-center"
          >
            <span>

              {selectedKeys.length
                ? `${selectedKeys.length} selected`
                : "Select Parameters"}

            </span>

            <IoIosArrowUp
              className={`transition ${isParamOpen
                ? ""
                : "rotate-180"
                }`}
            />
          </button>

          {isParamOpen && (

            <div className="absolute top-full left-0 mt-2 z-50 w-[320px] max-h-[350px] overflow-auto rounded-lg border bg-white shadow-lg p-3">

              {groups.length === 0 && (

                <div className="text-sm text-gray-500">

                  No parameters found

                </div>

              )}

              {groups.map(
                (group: any) => {

                  const allChecked =
                    group.parameters.every(
                      (p: any) =>
                        selectedKeys.includes(
                          p.key
                        )
                    );

                  return (

                    <div
                      key={group.label}
                      className="mb-4"
                    >

                      <div
                        className="flex items-center gap-2 cursor-pointer font-medium"
                        onClick={() =>
                          setOpenGroup(

                            openGroup ===
                              group.label

                              ? null

                              : group.label
                          )
                        }
                      >

                        <IoIosArrowUp
                          className={`transition ${openGroup ===
                            group.label

                            ? "rotate-180"

                            : "-rotate-90"
                            }`}
                        />

                        <input
                          type="checkbox"
                          checked={
                            allChecked
                          }

                          onChange={() => {

                            const keys =
                              group.parameters.map(
                                (
                                  p: any
                                ) =>
                                  p.key
                              );

                            setSelectedKeys(
                              prev =>

                                allChecked

                                  ? prev.filter(
                                    x =>
                                      !keys.includes(
                                        x
                                      )
                                  )

                                  : [
                                    ...new Set(
                                      [
                                        ...prev,
                                        ...keys,
                                      ]
                                    ),
                                  ]
                            );
                          }}
                        />

                        {group.label}

                      </div>

                      {openGroup ===
                        group.label && (

                          <div className="ml-8 mt-2 space-y-2">

                            {group.parameters.map(
                              (p: any) => (

                                <label
                                  key={p.key}
                                  className="flex items-center gap-2 text-sm"
                                >

                                  <input
                                    type="checkbox"
                                    checked={selectedKeys.includes(
                                      p.key
                                    )}

                                    onChange={() => {

                                      setSelectedKeys(
                                        prev =>

                                          prev.includes(
                                            p.key
                                          )

                                            ? prev.filter(
                                              x =>
                                                x !==
                                                p.key
                                            )

                                            : [
                                              ...prev,
                                              p.key,
                                            ]
                                      );

                                    }}
                                  />

                                  <span>

                                    {p.label}

                                  </span>

                                </label>
                              )
                            )}

                          </div>
                        )}

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

        <input
          type="date"
          value={chartDate}
          onChange={(e) =>
            setChartDate(
              e.target.value
            )
          }
          className="border rounded px-3 py-2"
        />

      </div>

      {/* Chart */}

      {selectedLogger &&
        selectedKeys.length ? (

        <div className="p-6 w-full focus:outline-none">

          <div className="h-[420px]">

            {noData ? (
              <div className="h-[420px] flex items-center justify-center">
                <p className="text-gray-500 text-lg">
                  No data available for this date
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  style={{ outline: "none" }}
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 40,
                  }}
                >

                  {/* <CartesianGrid strokeDasharray="4 6" /> */}

                  <XAxis
                    dataKey="timeValue"
                    type="number"
                    domain={[0, 1440]}
                    ticks={dayTicks}
                    tickLine={false}
                    tickFormatter={(value) => {
                      const hrs = Math.floor(value / 60)
                        .toString()
                        .padStart(2, "0");

                      const mins = (value % 60)
                        .toString()
                        .padStart(2, "0");

                      return `${hrs}:${mins}`;
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      color: "#000",
                    }}
                    labelStyle={{
                      color: "#000",
                      fontWeight: 600,
                    }}
                    labelFormatter={(value, payload) => {
                      return payload?.[0]?.payload?.originalTime ?? "";
                    }}
                    formatter={(value, name) => {

                      const label =
                        selectedParams.find(
                          (p: any) =>
                            p.key === name
                        )?.label || name;

                      return [
                        value ?? "-",
                        label
                      ];

                    }}
                  />

                  {/* <Legend /> */}

                  {selectedParams.map(
                    (
                      param: any,
                      index: number
                    ) => (

                      <Line
                        key={
                          param.key
                        }
                        dataKey={
                          param.key
                        }
                        yAxisId={
                          param.axis
                        }
                        stroke={`hsl(${index * 55
                          },70%,50%)`}
                        dot={false}
                      />

                    )
                  )}

                  {[...new Set(
                    selectedParams.map(
                      (
                        p: any
                      ) =>
                        p.axis
                    )
                  )].map(
                    (
                      axis: any,
                      index
                    ) => (

                      <YAxis
                        key={axis}
                        yAxisId={
                          axis
                        }
                        orientation={
                          index === 0
                            ? "left"
                            : "right"
                        }
                        label={{
                          value:
                            axis,
                          angle:
                            -90,
                        }}
                      />

                    )
                  )}

                </LineChart>

              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-6">

            {selectedParams.map(
              (param: any, index: number) => (

                <div
                  key={param.key}
                  className="flex items-center gap-2"
                >

                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: `hsl(${index * 55},70%,50%)` }}
                  />

                  <span className="text-sm text-black">
                    {param.label}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      ) : (
        <div className=" p-10 text-center text-gray-500">
          Select logger and parameters
        </div>
      )}
    </div>
  );
};

export default AnalysisTab;