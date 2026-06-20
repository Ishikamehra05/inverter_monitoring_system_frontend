"use client";

import { IoIosArrowDropleftCircle } from "react-icons/io";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

type DeviceOverviewProps = {
  name: string;
  status: string;
  currentPower: number;
  todayEnergy: number;
  totalEnergy: number;
  hours: number;
  lastUpdate: string;
  className?: string;
};

const DeviceOverview = ({
  name,
  status,
  currentPower,
  todayEnergy,
  totalEnergy,
  hours,
  lastUpdate,
  className = "",
}: DeviceOverviewProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const plantId = searchParams.get("plantId");

  const isOnline = status?.toLowerCase() === "online";

  const handleBack = () => {
    const targetEndUserId =
      searchParams.get("targetEndUserId");

    if (targetEndUserId) {
      router.replace(
        `/monitor/plants/plant-detail?plantId=${plantId}&targetEndUserId=${targetEndUserId}&fromService=true`
      );
      return;
    }

    router.replace(
      `/monitor/plants/plant-detail?plantId=${plantId}`
    );
  };

  return (
    <div className={`bg-white p-2 md:p-6 rounded-lg ${className}`}>
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={handleBack}
          className="text-black cursor-pointer"
        >
          <IoIosArrowDropleftCircle size={30} />
        </button>

        <h1 className="font-semibold text-lg sm:text-xl text-black">
          {name}
        </h1>

        <Image
          src={
            isOnline
              ? "/images/device-icon/online-icon.png"
              : "/images/device-icon/offline-icon.png"
          }
          alt={isOnline ? "Online" : "Offline"}
          width={24}
          height={24}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 text-md text-gray-500 mt-6">
        <span className="flex flex-col items-center gap-2 md:gap-4 whitespace-nowrap">
          <p className="font-semibold text-sm sm:text-md">
            Current Power:
          </p>
          <p className="text-black text-lg sm:text-2xl font-semibold">
            {currentPower} kW
          </p>
        </span>

        <span className="flex flex-col items-center gap-2 md:gap-4 whitespace-nowrap">
          <p className="font-semibold text-sm sm:text-md">
            E-Today:
          </p>
          <p className="text-black text-lg sm:text-2xl font-semibold">
            {todayEnergy} kWh
          </p>
        </span>

        <span className="flex flex-col items-center gap-2 md:gap-4 whitespace-nowrap">
          <p className="font-semibold text-sm sm:text-md">
            E-Total:
          </p>
          <p className="text-black text-lg sm:text-2xl font-semibold">
            {totalEnergy} kWh
          </p>
        </span>

        <span className="flex flex-col items-center gap-2 md:gap-4 whitespace-nowrap">
          <p className="font-semibold text-sm sm:text-md">
            H-Total:
          </p>
          <p className="text-black text-lg sm:text-2xl font-semibold">
            {hours} Hrs
          </p>
        </span>

        <span className="flex flex-col items-center gap-2 md:gap-4 whitespace-nowrap">
          <p className="font-semibold text-sm sm:text-md">
            Last Update:
          </p>
          <p className="text-black text-sm sm:text-lg font-semibold text-center">
            {lastUpdate}
          </p>
        </span>
      </div>
    </div>
  );
};

export default DeviceOverview;