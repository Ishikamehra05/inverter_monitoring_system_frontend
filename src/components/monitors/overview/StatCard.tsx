import { div } from "framer-motion/client";

type Props = {
  title: string;
  value: string | number;
  unit?: string;
  variant?: "highlight" | "simple";
};

export default function StatCard({
  title,
  value,
  unit,
  variant = "simple",
}: Props) {
  if (variant === "highlight") {
    return (
      <div className="p-2 text-center space-y-4">
        <p className="text-md text-gray-300">{title}</p>
        <div
          className="relative px-0 py-3 min-w-48 bg-black/20"
        >
          {/* corner lines */}
          <span className="absolute left-1 top-1 h-3 w-3 border-l-2 border-t-2 border-cyan-400" />
          <span className="absolute right-1 top-1 h-3 w-3 border-r-2 border-t-2 border-cyan-400" />
          <span className="absolute left-1 bottom-1 h-3 w-3 border-l-2 border-b-2 border-cyan-400" />
          <span className="absolute right-1 bottom-1 h-3 w-3 border-r-2 border-b-2 border-cyan-400" />

          <div className="flex items-end justify-center gap-2">
            <p className="text-3xl font-semibold text-cyan-400">{value}</p>
            {unit && <span className="text-sm text-gray-400 mb-1">{unit}</span>}
          </div>
        </div>
      </div>
    );
  }

  // SIMPLE CARD
  return (
    <div className="px-3 py-2 text-center space-y-4">
      <p className="text-md text-gray-300">{title}</p>
      <p className="text-4xl font-normal text-white">{value}</p>
    </div>
  );
}
