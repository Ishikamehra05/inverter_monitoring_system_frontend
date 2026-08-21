import Image from "next/image";
import { BiPlusCircle } from "react-icons/bi";

export type Stat = {
  label: string;
  value: string;
  icon: string;
};

const StatsGrid = ({ stats }: { stats: Stat[] }) => {
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg border bg-white p-3 shadow-md"
        >
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full text-lg`}
          >
            <Image src={stat.icon} alt={stat.label} width={64} height={64} />
          </div>

          <div>
            <div className="text-md text-gray-500">{stat.label}</div>
            <div className="text-2xl font-semibold text-black">
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
  return (
    <div className="mt-4 space-y-4">
      {/* Header info */}
      <div className="flex items-center gap-8 text-sm text-gray-600">
        <div>
          <span className="font-medium">Installation Time:</span>{" "}
          {installationDate}
        </div>
        <div>
          <span className="font-medium">Capacity:</span> {capacity}
        </div>
        <div>
          <span className="font-medium">Address:</span> {address}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Datalogger S/N:</span>
          <button className="rounded-full bg-transparent text-blue-500 cursor-pointer">
            <BiPlusCircle className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsGrid stats={stats} />
    </div>
  );
};

export default InformationTab;
