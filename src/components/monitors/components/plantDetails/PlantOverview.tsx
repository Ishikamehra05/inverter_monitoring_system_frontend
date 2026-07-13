"use client";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { useRouter, useSearchParams } from "next/navigation";

type PlantOverviewProps = {
  name: string;
  type: string;
  status: string;
  currentPower: number;
  todayEnergy: number;
  totalEnergy: number;
  income: number;
  hours: number;
  capacity: number;
  installDate: string;
  className?: string;
};

const PlantOverview = ({
  name,
  type,
  status,
  currentPower,
  todayEnergy,
  totalEnergy,
  income,
  hours,
  capacity,
  installDate,
  className = "",
}: PlantOverviewProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBack = () => {
    const userId =
      searchParams.get("targetEndUserId") ?? searchParams.get("userid");

    if (userId) {
      router.replace(`/monitor/plants?userid=${userId}&fromService=true`);
      return;
    }

    router.replace("/monitor/plants");
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "online":
        return "bg-green-500 text-white";

      case "offline":
        return "bg-red-500 text-white";

      case "warning":
        return "bg-yellow-500 text-gray-800";

      case "fault":
      case "abnormal":
        return "bg-red-500 text-white";

      default:
        return "bg-gray-100 border border-gray-400 text-gray-600";
    }
  };
  return (
    <div className={`bg-white p-2 md:p-6 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3">
        <button onClick={handleBack} className="text-black cursor-pointer">
          <IoIosArrowDropleftCircle size={30} />
        </button>

        <h1 className="font-semibold text-lg sm:text-xl text-black">{name}</h1>

        {/* Grid badge */}
        <span className="px-2 py-0.5 text-xs sm:text-sm font-semibold rounded bg-blue-500 text-white">
          {type}
        </span>

        {/* Mode badge */}
        <span
          className={`px-2 py-0.5 text-xs sm:text-sm font-semibold rounded-md ${getStatusStyle(
            status,
          )}`}
        >
          {status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 text-md text-gray-500 mt-6">
        <span className="flex items-center gap-2">
          <p className="font-semibold">Current Power:</p>
          <p className="text-black">{currentPower} kW</p>
        </span>
        <span className="flex items-center gap-2">
          <p className="font-semibold">E-Today:</p>
          <p className="text-black">{todayEnergy} kWh</p>
        </span>

        <span className="flex items-center gap-2">
          <p className="font-semibold">E-Total:</p>
          <p className="text-black">{totalEnergy} MWh</p>
        </span>
        <span className="flex items-center gap-2">
          <p className="font-semibold">Total Income:</p>
          <p className="text-black">₹ {income.toLocaleString("en-IN")}</p>
        </span>
        <span className="flex items-center gap-2">
          <p className="font-semibold">H-Total:</p>
          <p className="text-black">{hours} Hrs</p>
        </span>
        <span className="flex items-center gap-2">
          <p className="font-semibold">Capacity:</p>
          <p className="text-black">{capacity} Wp</p>
        </span>
        <span className="flex items-center gap-2">
          <p className="font-semibold">Installation Time:</p>
          <p className="text-black">{installDate}</p>
        </span>
      </div>
    </div>
  );
};

export default PlantOverview;
