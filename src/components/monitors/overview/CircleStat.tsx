type Props = {
  title: string;
  value: string | number;
  unit?: string;
  variant?: "highlight" | "simple" | "wave";
};

export default function StatCard({
  title,
  value,
  unit,
  variant = "simple",
}: Props) {
  // WAVE CARD (REAL WATER WAVE)
  if (variant === "wave") {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-gray-300">{title}</p>

        <div className="relative w-28 h-28 rounded-full border-4 border-green-400 overflow-hidden bg-transparent">
          {/* SVG WAVE */}
          <svg
            className="absolute bottom-0 left-0 w-[200%] h-2/3 animate-wave-x"
            viewBox="0 0 1200 200"
            preserveAspectRatio="none"
          >
            <path
              d="M0,100 
                 C150,130 350,70 600,100 
                 C850,130 1050,70 1200,100 
                 L1200,200 L0,200 Z"
              fill="#22c55e"
              opacity="0.9"
            />
          </svg>

          {/* TEXT */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <p className="text-2xl font-semibold text-white">{value}</p>
            {unit && <p className="text-sm text-white">{unit}</p>}
          </div>
        </div>
      </div>
    );
  }

  // SIMPLE ARC CARD
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg viewBox="5 -20 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#e0f2fe" />
            </linearGradient>
          </defs>

          {/* ARC */}
          <path
            d="M 30 60 A 38 38 0 1 1 80 60"
            fill="none"
            stroke="url(#arcGradient)"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>

        {/* CENTER TEXT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xl font-semibold text-white">{value}</p>
          {unit && <p className="text-xs text-gray-300">{unit}</p>}
        </div>
      </div>

      <p className="text-sm text-gray-300">{title}</p>
    </div>
  );
}
