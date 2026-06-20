"use client";
import { useState } from "react";
import { IconType } from "react-icons";
import { FaSolarPanel, FaBolt, FaPlug } from "react-icons/fa";

type EnergyFlowProps = {
  solarPower?: number; // kW from solar
  gridPower?: number; // kW from grid (negative = exporting)
  consumption?: number; // kW consumption
  batteryPower?: number; // kW battery (positive = charging, negative = discharging)
  className?: string;
};

type EnergyNodeProps = {
  icon: IconType;
  label: string;
  value: number;
  unit?: string;
  isActive: boolean;
  colorClass: string;
  bgClass: string;
  nodeId: string;
  position: string;
  hoveredNode: string | null;
  setHoveredNode: (id: string | null) => void;
};


const EnergyFlow = ({
  solarPower = 0,
  gridPower = 0,
  consumption = 0,

  className = "",
}: EnergyFlowProps) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Determine active states
  const isSolarActive = solarPower > 0;
  const isGridImporting = gridPower > 0;
  const isGridExporting = gridPower < 0;

  const isConsumptionActive = consumption > 0;

  // Node component with hover state
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
  }: {
    icon: any;
    label: string;
    value: number;
    unit?: string;
    isActive: boolean;
    colorClass: string;
    bgClass: string;
    nodeId: string;
    position: string;
  }) => (
    <div
      className={`absolute ${position} flex flex-col items-center gap-1 sm:gap-2 transition-all duration-300 z-50 ${hoveredNode === nodeId ? "scale-110 z-10" : ""
        }`}
      onMouseEnter={() => setHoveredNode(nodeId)}
      onMouseLeave={() => setHoveredNode(null)}
    >
      <div
        className={`relative ${isActive ? bgClass : "bg-gray-200"
          } ${isActive ? colorClass : "text-gray-400"
          } text-xl sm:text-2xl md:text-3xl p-2 sm:p-3 md:p-4 border-2 ${isActive ? "border-current" : "border-gray-400"
          } rounded-full transition-all duration-300 shadow-lg ${isActive ? "shadow-current/30" : ""
          } ${hoveredNode === nodeId && isActive ? "shadow-2xl" : ""}`}
      >
        <Icon className={`${isActive ? "animate-pulse" : ""}`} />
        {isActive && (
          <div className="absolute inset-0 rounded-full bg-current opacity-20 animate-ping" />
        )}
      </div>

      <div className="text-center">
        <span className="text-[10px] sm:text-xs font-medium text-gray-600 block">
          {label}
        </span>
      </div>

      {/* Tooltip on hover */}
      {hoveredNode === nodeId && (
        <div className="absolute -top-12 sm:-top-16 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-2 rounded-lg whitespace-nowrap shadow-xl z-20 animate-fade-in">
          {isActive ? `Active: ${Math.abs(value).toFixed(2)} ${unit}` : "Inactive"}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className={`flex justify-center items-center p-2 sm:p-4 ${className}`}>
        <div className="relative w-full max-w-2xl h-64 sm:h-80 md:h-96">
          {/* Solar */}
          <EnergyNode
            icon={FaSolarPanel}
            label="Solar"
            value={solarPower}
            isActive={isSolarActive}
            colorClass="text-yellow-500"
            bgClass="bg-yellow-50"
            nodeId="solar"
            position="top-2 sm:top-4 left-1/4 -translate-x-1/2"
          />

          {/* Grid */}
          <EnergyNode
            icon={FaBolt}
            label={isGridExporting ? "Grid (Export)" : "Grid"}
            value={gridPower}
            isActive={isGridImporting || isGridExporting}
            colorClass={isGridExporting ? "text-orange-500" : "text-blue-500"}
            bgClass={
              isGridExporting
                ? "bg-orange-50"
                : "bg-blue-50 dark:bg-blue-900/30"
            }
            nodeId="grid"
            position="top-2 sm:top-4 right-1/4 translate-x-1/2"
          />

          {/* Consumption/Load */}
          <EnergyNode
            icon={FaPlug}
            label="Consumption"
            value={consumption}
            isActive={isConsumptionActive}
            colorClass="text-teal-500"
            bgClass="bg-teal-50"
            nodeId="consumption"
            position="bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2"
          />

          {/* SVG Lines with Particles */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              {/* Gradient for active lines */}
              <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="lime" stopOpacity="0.2" />
                <stop offset="50%" stopColor="lime" stopOpacity="1" />
                <stop offset="100%" stopColor="lime" stopOpacity="0.2" />
              </linearGradient>

              {/* Animated particle for flow */}
              <circle id="particle" r="4" fill="lime">
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </defs>

            {/* Solar -> Consumption */}
            <line
              x1="25%"
              y1="18%"
              x2="50%"
              y2="70%"
              className={isSolarActive ? "energy-line-active" : "energy-line-disabled"}
              stroke={isSolarActive ? "url(#activeGradient)" : "#d1d5db"}
              strokeWidth="2"
            />
            {isSolarActive && (
              <>
                <circle r="4" className="sm:r-6" fill="lime" opacity="0.8">
                  <animateMotion dur="2s" repeatCount="indefinite" path="M 160,60 L 320,250" />
                </circle>
                <circle r="3" className="sm:r-4" fill="yellow" opacity="0.6">
                  <animateMotion dur="2s" begin="0.5s" repeatCount="indefinite" path="M 160,60 L 320,250" />
                </circle>
              </>
            )}

            {/* Grid -> Consumption */}
            <line
              x1="75%"
              y1="18%"
              x2="50%"
              y2="70%"
              className={isGridImporting ? "energy-line-active" : "energy-line-disabled"}
              stroke={isGridImporting ? "deepskyblue" : "#d1d5db"}
              strokeWidth="2"
            />
            {isGridImporting && (
              <>
                <circle r="4" className="sm:r-6" fill="deepskyblue" opacity="0.8">
                  <animateMotion dur="2s" repeatCount="indefinite" path="M 75,18 L 50,70" />
                </circle>
                <circle r="3" className="sm:r-4" fill="cyan" opacity="0.6">
                  <animateMotion dur="2s" begin="0.7s" repeatCount="indefinite" path="M 75,18 L 50,70" />
                </circle>
              </>
            )}

            {/* Consumption -> Grid (Exporting) */}
            <line
              x1="50%"
              y1="70%"
              x2="75%"
              y2="18%"
              className={isGridExporting ? "energy-line-active" : "energy-line-disabled"}
              stroke={isGridExporting ? "orange" : "#d1d5db"}
              strokeWidth="2"
            />
            {isGridExporting && (
              <circle r="4" className="sm:r-3" fill="orange" opacity="0.8">
                <animateMotion dur="2s" repeatCount="indefinite" path="M 351,250 L 511,60" />
              </circle>
            )}
          </svg>

          {/* Status Indicator */}
          {/* <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            {isSolarActive || isGridImporting || isConsumptionActive ? (
              <span className="flex items-center gap-1 sm:gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="hidden sm:inline">System Active</span>
                <span className="sm:hidden">Active</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 sm:gap-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full"></span>
                <span className="hidden sm:inline">System Idle</span>
                <span className="sm:hidden">Idle</span>
              </span>
            )}
          </div> */}
        </div>
      </div>

      <style jsx>{`
        .energy-line-active {
          stroke-dasharray: 8 4;
          animation: energy-flow 1.5s linear infinite;
          filter: drop-shadow(0 0 6px currentColor);
        }

        .energy-line-disabled {
          stroke-dasharray: 4 4;
          opacity: 0.3;
        }

        @keyframes energy-flow {
          to {
            stroke-dashoffset: -24;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        /* Responsive stroke width */
        @media (min-width: 640px) {
          line {
            stroke-width: 3;
          }
        }
      `}</style>
    </>
  );
};

export default EnergyFlow;
