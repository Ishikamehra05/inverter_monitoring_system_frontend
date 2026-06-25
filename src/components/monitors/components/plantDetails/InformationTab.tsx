"use client";
import { useState } from "react";
import Image from "next/image";
import { BiPlusCircle } from "react-icons/bi";
import AddLoggerModal from "@/components/monitors/modals/AddLoggerModal";
import { useAddLogger } from "@/hooks/api/useDevices";

export type Stat = {
  label: string;
  value: string;
  icon: string;
};

const StatsGrid = ({ stats }: { stats: Stat[] }) => {
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex items-center md:min-w-54 gap-3 rounded-lg border bg-white p-3 shadow-md"
        >
          {/* <div
            className={`flex h-12 w-12 md:h-20 md:w-20 items-center justify-center rounded-full text-lg`}
          > */}
          <Image
            className="h-12 w-12 md:h-14 md:w-14 lg:h-20 lg:w-20"
            src={stat.icon}
            alt={stat.label}
            width={64}
            height={64}
          />
          {/* </div> */}

          <div>
            <div className="text-xs md:text-md text-gray-500 whitespace-nowrap">
              {stat.label}
            </div>
            <div className="text-md md:text-2xl font-semibold text-black whitespace-nowrap">
              {stat.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

type InfoProps = {
  installationDate: string;
  capacity: string;
  address: string;
  stats: Stat[];
};

const InformationTab = ({
  installationDate,
  capacity,
  address,
  stats,
}: InfoProps) => {
  const [open, setOpen] = useState(false);
  // const addLogger = useAddLogger();
  return (
    <>
      <div className="mt-4 space-y-4">
        {/* Header info */}
        <div className="flex items-center flex-wrap gap-4 sm:gap-6 md:gap-8 text-sm text-gray-600">
          <div className="whitespace-nowrap">
            <span className="font-medium pr-2">Installation Time:</span>
            {installationDate}
          </div>
          <div className="whitespace-nowrap">
            <span className="font-medium">Capacity:</span> {capacity}
          </div>
          <div className="whitespace-nowrap">
            <span className="font-medium">Address:</span> {address}
          </div>
          {/* <div className="flex items-center gap-2 flex-nowrap">
            <span className="font-medium whitespace-nowrap">
              Datalogger S/N:
            </span>
            <button
              onClick={() => setOpen(true)}
              className="rounded-full bg-transparent text-blue-500 cursor-pointer"
            >
              <BiPlusCircle className="h-5 w-5" />
            </button>
          </div> */}
        </div>

        {/* Stats */}
        <StatsGrid stats={stats} />
      </div>
      {/* <AddLoggerModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(value) => addLogger.mutate(value)}
      /> */}
    </>
  );
};

export default InformationTab;
