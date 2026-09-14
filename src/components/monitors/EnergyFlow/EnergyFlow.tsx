"use client";

import { useState } from "react";

type FlowIconProps = {
  className?: string;
};

type FlowIcon = React.ComponentType<FlowIconProps>;

type EnergyFlowProps = {
  solarPower?: number;
  meterPower?: number;
  gridPower?: number;
  consumption?: number;
  batteryPower?: number;
  consumptionUnit?: string;
  className?: string;
  plantType: string;
};

/* =====================================================
   ICONS
===================================================== */

const SolarIcon = ({ className }: FlowIconProps) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M13 25h22l-3-14H16l-3 14Z"
      fill="currentColor"
      opacity=".16"
    />

    <path
      d="M13 25h22l-3-14H16l-3 14Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />

    <path
      d="M20 11 18 25M27 11l3 14M15 18h16M12 29h24M24 25v7M18 36h12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const GridIcon = ({ className }: FlowIconProps) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M24 7 13 40M24 7l11 33M17 29h14M14 36h20M18 21h12M15 14h18M24 7v33M19 14l10 7-10 8 10 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InverterIcon = ({ className }: FlowIconProps) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="10"
      y="7"
      width="28"
      height="34"
      rx="2"
      fill="currentColor"
      opacity=".08"
    />

    <rect
      x="10"
      y="7"
      width="28"
      height="34"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />

    <rect
      x="21"
      y="17"
      width="6"
      height="14"
      rx="2"
      fill="currentColor"
    />
  </svg>
);

const MeterIcon = ({ className }: FlowIconProps) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="9"
      y="7"
      width="30"
      height="34"
      rx="3"
      stroke="currentColor"
      strokeWidth="2"
    />

    <circle
      cx="24"
      cy="20"
      r="7"
      stroke="currentColor"
      strokeWidth="2"
    />

    <path
      d="M24 20l4-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />

    <path
      d="M16 32h16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const HomeIcon = ({ className }: FlowIconProps) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M8 23 24 9l16 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M12 21v18h24V21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />

    <path
      d="M20 39V28h8v11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const CabinetIcon = ({ className }: FlowIconProps) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="12"
      y="8"
      width="24"
      height="32"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />

    <path
      d="M24 8v32M16 14h6M16 34h6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const BatteryIcon = ({ className }: FlowIconProps) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="9"
      y="13"
      width="30"
      height="22"
      rx="3"
      stroke="currentColor"
      strokeWidth="2"
    />

    <path
      d="M39 20h4v8h-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />

    <path
      d="M17 24h14M24 17v14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/* =====================================================
   ENERGY NODE
===================================================== */

type EnergyNodeProps = {
  icon: FlowIcon;
  label: string;
  value: number;
  unit?: string;
  isActive: boolean;
  colorClass: string;
  bgClass: string;
  nodeId: string;
  position: string;
  showValue?: boolean;
  showLabel?: boolean;
};

const EnergyNode = ({
  icon: Icon,
  label,
  value,
  unit = "kW",
  isActive,
  colorClass,
  bgClass,
  nodeId,
  position,
  showValue = false,
  showLabel = false,
}: EnergyNodeProps) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div
      className={`absolute ${position} flex flex-col items-center gap-1 sm:gap-2 transition-all duration-300 z-30 ${
        hoveredNode === nodeId ? "scale-110 z-40" : ""
      }`}
      onMouseEnter={() => setHoveredNode(nodeId)}
      onMouseLeave={() => setHoveredNode(null)}
    >
      {/* =================================================
          NODE CIRCLE
          Opaque background prevents SVG lines from showing
          through / behind the icon.
      ================================================= */}

      <div
        className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white transition-all duration-300 sm:h-14 sm:w-14 md:h-16 md:w-16 ${
          isActive
            ? `${colorClass} border-current`
            : `${colorClass} border-current opacity-80`
        } ${bgClass}`}
      >
        <Icon
          className={`h-7 w-7 sm:h-8 sm:w-8 ${
            isActive ? "animate-pulse" : ""
          }`}
        />
      </div>

      {(showLabel || showValue) && (
        <div className="text-center whitespace-nowrap">
          {showLabel && (
            <span className="block text-sm font-semibold text-black">
              {label}
            </span>
          )}

          {showValue && (
            <span className="block text-sm font-medium text-black">
              {value.toFixed(3)} {unit}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/* =====================================================
   MAIN COMPONENT
===================================================== */

const EnergyFlow = ({
  solarPower = 0,
  meterPower = 0,
  gridPower = 0,
  consumption = 0,
  batteryPower = 0,
  consumptionUnit = "kW",
  className = "",
  plantType,
}: EnergyFlowProps) => {
  const solar = Number.isFinite(solarPower) ? solarPower : 0;
  const meter = Number.isFinite(meterPower) ? meterPower : 0;
  const grid = Number.isFinite(gridPower) ? gridPower : 0;
  const home = Number.isFinite(consumption) ? consumption : 0;
  const battery = Number.isFinite(batteryPower) ? batteryPower : 0;

  /*
   * Backend values:
   * Grid
   * Grid + Meter
   * Storage
   */

  const plantTypeKey = (plantType ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/_/g, "");

  /* =====================================================
     ACTIVE STATES
  ===================================================== */

  const isSolarActive = solar > 0;

  const isMeterActive = meter !== 0;

  const isGridImporting = grid > 0;

  const isGridExporting = grid < 0;

  const isGridActive = isGridImporting || isGridExporting;

  const isHomeActive = home > 0;

  const isBatteryActive = battery !== 0;

  /* =====================================================
     GRID + STORAGE
  ===================================================== */

  if (plantTypeKey === "grid+storage") {
    return null;
  }

  /* =====================================================
     GRID
  ===================================================== */

  if (plantTypeKey === "grid") {
    return (
      <>
        <div
          className={`flex justify-center items-center p-2 sm:p-4 ${className}`}
        >
          <div className="relative w-full max-w-2xl h-80 sm:h-96">

            {/* =================================================
                FLOW LINES
                SVG stays below nodes
            ================================================= */}

            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Solar flow */}
                <linearGradient
                  id="gridSolarGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="#eab308"
                    stopOpacity="0.2"
                  />
                  <stop
                    offset="50%"
                    stopColor="#eab308"
                    stopOpacity="1"
                  />
                  <stop
                    offset="100%"
                    stopColor="#eab308"
                    stopOpacity="0.2"
                  />
                </linearGradient>

                {/* Grid import */}
                <linearGradient
                  id="gridImportGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="#0ea5e9"
                    stopOpacity="0.2"
                  />
                  <stop
                    offset="50%"
                    stopColor="#0ea5e9"
                    stopOpacity="1"
                  />
                  <stop
                    offset="100%"
                    stopColor="#0ea5e9"
                    stopOpacity="0.2"
                  />
                </linearGradient>

                {/* Grid export */}
                <linearGradient
                  id="gridExportGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="#f97316"
                    stopOpacity="0.2"
                  />
                  <stop
                    offset="50%"
                    stopColor="#f97316"
                    stopOpacity="1"
                  />
                  <stop
                    offset="100%"
                    stopColor="#f97316"
                    stopOpacity="0.2"
                  />
                </linearGradient>
              </defs>

              {/* =================================================
                  SOLAR → CONSUMPTION

                  Ends just before the node circle.
              ================================================= */}

              <line
                x1="27.5%"
                y1="31%"
                x2="48%"
                y2="68%"
                className={
                  isSolarActive
                    ? "energy-line-active"
                    : "energy-line-disabled"
                }
                stroke={
                  isSolarActive
                    ? "url(#gridSolarGradient)"
                    : "#d1d5db"
                }
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* =================================================
                  GRID → CONSUMPTION

                  Ends just before the node circle.
              ================================================= */}

              <line
                x1="72.5%"
                y1="31%"
                x2="52%"
                y2="68%"
                className={
                  isGridImporting
                    ? "energy-line-active"
                    : "energy-line-disabled"
                }
                stroke={
                  isGridImporting
                    ? "url(#gridImportGradient)"
                    : "#d1d5db"
                }
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* =================================================
                  CONSUMPTION → GRID
              ================================================= */}

              {isGridExporting && (
                <line
                  x1="52%"
                  y1="68%"
                  x2="72.5%"
                  y2="31%"
                  className="energy-line-active"
                  stroke="url(#gridExportGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>

            {/* =================================================
                SOLAR
            ================================================= */}

            <EnergyNode
              icon={SolarIcon}
              label="Solar"
              value={solar}
              unit="kW"
              isActive={isSolarActive}
              colorClass="text-yellow-500"
              bgClass="bg-yellow-50"
              nodeId="solar"
              position="top-[20%] left-1/4 -translate-x-1/2"
            />

            {/* =================================================
                GRID
            ================================================= */}

            <EnergyNode
              icon={GridIcon}
              label="Grid"
              value={Math.abs(grid)}
              unit="kW"
              isActive={isGridActive}
              colorClass={
                isGridExporting
                  ? "text-orange-500"
                  : "text-blue-500"
              }
              bgClass={
                isGridExporting
                  ? "bg-orange-50"
                  : "bg-blue-50"
              }
              nodeId="grid"
              position="top-[20%] right-1/4 translate-x-1/2"
            />

            {/* =================================================
                CONSUMPTION
            ================================================= */}

            <EnergyNode
              icon={InverterIcon}
              label="Consumption"
              value={home}
              unit={consumptionUnit}
              isActive={isHomeActive}
              colorClass="text-teal-500"
              bgClass="bg-teal-50"
              nodeId="consumption"
              position="bottom-[10%] left-1/2 -translate-x-1/2"
              showValue={true}
            />

            {/* =================================================
                FLOW DOTS
            ================================================= */}

            {isSolarActive && (
              <div
                className="absolute pointer-events-none z-15"
                style={{
                  left: "27.5%",
                  top: "31%",
                  width: "20.5%",
                  height: "37%",
                }}
              >
                <div className="energy-flow-dot solar-dot" />
              </div>
            )}

            {isGridImporting && (
              <div
                className="absolute pointer-events-none z-15"
                style={{
                  left: "52%",
                  top: "31%",
                  width: "20.5%",
                  height: "37%",
                }}
              >
                <div className="energy-flow-dot grid-dot" />
              </div>
            )}

            {isGridExporting && (
              <div
                className="absolute pointer-events-none z-15"
                style={{
                  left: "52%",
                  top: "31%",
                  width: "20.5%",
                  height: "37%",
                }}
              >
                <div className="energy-flow-dot export-dot" />
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .energy-line-active {
            stroke-dasharray: 8 4;
            animation: energy-flow 1.5s linear infinite;
          }

          .energy-line-disabled {
            stroke-dasharray: 4 4;
            opacity: 0.35;
          }

          .energy-flow-dot {
            position: absolute;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            opacity: 0.9;
          }

          .solar-dot {
            background: #eab308;
            animation: solar-flow-dot 2.5s linear infinite;
          }

          /* Grid import: exact direction Grid -> Consumption */
          .grid-dot {
            background: #0ea5e9;
            animation: grid-import-dot 2.5s linear infinite;
          }

          /* Grid export: exact direction Consumption -> Grid */
          .export-dot {
            background: #f97316;
            animation: grid-export-dot 2.5s linear infinite;
          }

          @keyframes energy-flow {
            to {
              stroke-dashoffset: -24;
            }
          }

          /* Solar line: top-left -> bottom-right */
          @keyframes solar-flow-dot {
            0% {
              left: -3.5px;
              top: -3.5px;
              opacity: 0;
            }

            15% {
              opacity: 1;
            }

            85% {
              opacity: 1;
            }

            100% {
              left: calc(100% - 3.5px);
              top: calc(100% - 3.5px);
              opacity: 0;
            }
          }

          /* Grid import line: top-right -> bottom-left */
          @keyframes grid-import-dot {
            0% {
              left: calc(100% - 3.5px);
              top: -3.5px;
              opacity: 0;
            }

            15% {
              opacity: 1;
            }

            85% {
              opacity: 1;
            }

            100% {
              left: -3.5px;
              top: calc(100% - 3.5px);
              opacity: 0;
            }
          }

          /* Grid export line: bottom-left -> top-right */
          @keyframes grid-export-dot {
            0% {
              left: -3.5px;
              top: calc(100% - 3.5px);
              opacity: 0;
            }

            15% {
              opacity: 1;
            }

            85% {
              opacity: 1;
            }

            100% {
              left: calc(100% - 3.5px);
              top: -3.5px;
              opacity: 0;
            }
          }

          @media (min-width: 640px) {
            line {
              stroke-width: 3;
            }
          }
        `}</style>
      </>
    );
  }

  /* =====================================================
     GRID + METER
  ===================================================== */

  if (plantTypeKey === "grid+meter") {
    return (
      <>
        <div
          className={`flex justify-center items-center p-2 sm:p-4 ${className}`}
        >
          <div className="relative w-full max-w-4xl h-80 sm:h-96">

            {/* =================================================
                FLOW LINES
                All lines stop at the edge of the icons.
            ================================================= */}

            <svg
              className="absolute inset-0 z-10 w-full h-full pointer-events-none"
              preserveAspectRatio="none"
            >

              <line
                x1="28%"
                y1="37%"
                x2="41%"
                y2="37%"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeLinecap="round"
                className={
                  isSolarActive
                    ? "energy-line-active"
                    : "energy-line-disabled"
                }
              />

              {/* =================================================
                  METER → MAIN JUNCTION
              ================================================= */}

              <line
                x1="49%"
                y1="37%"
                x2="55%"
                y2="37%"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeLinecap="round"
                className="energy-line-active"
              />

              {/* =================================================
                  MAIN VERTICAL BRANCH

                  IMPORTANT:
                  Vertical line does NOT enter Grid/Home icons.
              ================================================= */}

              <line
                x1="55%"
                y1="10%"
                x2="55%"
                y2="70%"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeLinecap="round"
                className="energy-line-active"
              />

              {/* =================================================
                  JUNCTION → GRID
              ================================================= */}

              <line
                x1="55%"
                y1="10%"
                x2="64%"
                y2="10%"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeLinecap="round"
                className="energy-line-active"
              />

              {/* =================================================
                  JUNCTION → HOME

                  Stops before Home icon.
              ================================================= */}

              <line
                x1="55%"
                y1="70%"
                x2="64%"
                y2="70%"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeLinecap="round"
                className="energy-line-active"
              />
            </svg>

            {/* =================================================
                SOLAR
            ================================================= */}

            <EnergyNode
              icon={SolarIcon}
              label="Solar"
              value={solar}
              unit="kW"
              isActive={isSolarActive}
              colorClass="text-yellow-500"
              bgClass="bg-yellow-50"
              nodeId="solar"
              position="top-[30%] left-[25%] -translate-x-1/2"
            />

            {/* =================================================
                METER
            ================================================= */}

            <EnergyNode
              icon={InverterIcon}
              label="Meter"
              value={meter}
              unit="kW"
              isActive={isMeterActive}
              colorClass="text-violet-500"
              bgClass="bg-violet-50"
              nodeId="meter"
              position="top-[30%] left-[45%] -translate-x-1/2"
            />

            {/* =================================================
                GRID
            ================================================= */}

            <EnergyNode
              icon={GridIcon}
              label="Grid"
              value={Math.abs(grid)}
              unit="kW"
              isActive={isGridActive}
              colorClass={
                isGridExporting
                  ? "text-orange-500"
                  : "text-blue-500"
              }
              bgClass={
                isGridExporting
                  ? "bg-orange-50"
                  : "bg-blue-50"
              }
              nodeId="grid"
              position="top-[0%] left-[65%] -translate-x-1/2"
            />

            {/* =================================================
                HOME

                Node is above SVG, so no line can appear
                inside / behind the icon.
            ================================================= */}

            <EnergyNode
              icon={HomeIcon}
              label="Home"
              value={home}
              unit="kW"
              isActive={isHomeActive}
              colorClass="text-teal-500"
              bgClass="bg-teal-50"
              nodeId="home"
              position="top-[66%] left-[65%] -translate-x-1/2"
            />
          </div>
        </div>

        <style jsx>{`
          .energy-line-active {
            stroke-dasharray: 8 4;
            animation: energy-flow 1.5s linear infinite;
          }

          .energy-line-disabled {
            stroke-dasharray: 4 4;
            opacity: 0.6;
          }

          @keyframes energy-flow {
            to {
              stroke-dashoffset: -24;
            }
          }

          @media (min-width: 640px) {
            line {
              stroke-width: 3;
            }
          }
        `}</style>
      </>
    );
  }

  /* =====================================================
     STORAGE
  ===================================================== */

  if (plantTypeKey === "storage") {
    return (
      <>
        <div
          className={`flex justify-center items-center p-2 sm:p-4 ${className}`}
        >
          <div className="relative w-full max-w-4xl h-96">

            {/* =================================================
                SOLAR
            ================================================= */}

            <EnergyNode
              icon={SolarIcon}
              label="Solar"
              value={solar}
              unit="kW"
              isActive={isSolarActive}
              colorClass="text-yellow-500"
              bgClass="bg-yellow-50"
              nodeId="solar"
              position="top-[28%] left-[25%] -translate-x-1/2"
            />

            {/* =================================================
                INVERTER
            ================================================= */}

            <EnergyNode
              icon={InverterIcon}
              label="Inverter"
              value={meter}
              unit="kW"
              isActive={isMeterActive}
              colorClass="text-indigo-500"
              bgClass="bg-indigo-50"
              nodeId="inverter"
              position="top-[28%] left-[45%] -translate-x-1/2"
            />

            {/* =================================================
                GRID
            ================================================= */}

            <EnergyNode
              icon={GridIcon}
              label="Grid"
              value={Math.abs(grid)}
              unit="kW"
              isActive={isGridActive}
              colorClass={
                isGridExporting
                  ? "text-orange-500"
                  : "text-blue-500"
              }
              bgClass={
                isGridExporting
                  ? "bg-orange-50"
                  : "bg-blue-50"
              }
              nodeId="grid"
              position="top-[28%] left-[65%] -translate-x-1/2"
            />

            {/* =================================================
                BATTERY
            ================================================= */}

            <EnergyNode
              icon={BatteryIcon}
              label="Battery"
              value={battery}
              unit="kW"
              isActive={isBatteryActive}
              colorClass="text-orange-500"
              bgClass="bg-orange-50"
              nodeId="battery"
              position="top-[61%] left-[45%] -translate-x-1/2"
            />

            {/* =================================================
                METER
            ================================================= */}

            <EnergyNode
              icon={CabinetIcon}
              label="Meter"
              value={meter}
              unit="kW"
              isActive={isMeterActive}
              colorClass="text-violet-500"
              bgClass="bg-violet-50"
              nodeId="storage-meter"
              position="top-[61%] left-[55%] -translate-x-1/2"
            />

            {/* =================================================
                HOME
            ================================================= */}

            <EnergyNode
              icon={HomeIcon}
              label="Home"
              value={home}
              unit="kW"
              isActive={isHomeActive}
              colorClass="text-teal-500"
              bgClass="bg-teal-50"
              nodeId="home"
              position="top-[61%] left-[65%] -translate-x-1/2"
            />

            {/* =================================================
                STORAGE BUS

                Lines remain behind the nodes.
                Endpoints are kept outside icon circles.
            ================================================= */}

            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              preserveAspectRatio="none"
            >
              {/* Main horizontal bus */}

               <line
                x1="28%"
                y1="36%"
                x2="41%"
                y2="36%"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <line
                x1="49%"
                y1="36%"
                x2="62%"
                y2="36%"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* =================================================
                  INVERTER → BATTERY

                  Stops before Battery icon.
              ================================================= */}

              <line
                x1="45%"
                y1="42%"
                x2="45%"
                y2="60%"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeLinecap="round"
                className="energy-line-active"
              />

              {/* =================================================
                  BUS → METER
              ================================================= */}

              <line
                x1="55%"
                y1="36%"
                x2="55%"
                y2="60%"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeLinecap="round"
                className={
                  isMeterActive
                    ? "energy-line-active"
                    : "energy-line-disabled"
                }
              />

              {/* =================================================
                  GRID → HOME

                  Stops before Home icon.
              ================================================= */}

              <line
                x1="65%"
                y1="35%"
                x2="65%"
                y2="60%"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeLinecap="round"
                className="energy-line-active"
              />
            </svg>
          </div>
        </div>

        <style jsx>{`
          .energy-line-active {
            stroke-dasharray: 8 4;
            animation: energy-flow 1.5s linear infinite;
          }

          .energy-line-disabled {
            stroke-dasharray: 4 4;
            opacity: 0.5;
          }

          @keyframes energy-flow {
            to {
              stroke-dashoffset: -24;
            }
          }

          @media (min-width: 640px) {
            line {
              stroke-width: 3;
            }
          }
        `}</style>
      </>
    );
  }

  /* =====================================================
     UNKNOWN / EMPTY PLANT TYPE
  ===================================================== */

  return null;
};

export default EnergyFlow;