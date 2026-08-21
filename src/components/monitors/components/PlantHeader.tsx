type Props = {
  name: string;
  mode: "Grid" | "Normal";
};

export default function PlantHeader({ name, mode }: Props) {
  return (
    <div className="flex items-center gap-3">
      <button className="w-8 h-8 rounded-full bg-black text-white">←</button>

      <h1 className="font-semibold text-lg">{name}</h1>

      <span className="px-2 py-1 text-xs rounded bg-blue-500 text-white">
        Grid
      </span>
      <span className="px-2 py-1 text-xs rounded bg-green-500 text-white">
        {mode}
      </span>
    </div>
  );
}
