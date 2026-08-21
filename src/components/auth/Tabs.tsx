// "use client";

// import { useState } from "react";

// export default function Tabs() {
//   const [active, setActive] = useState("Monitoring");

//   return (
//     <div className="flex gap-12 border-b mb-6 justify-center ">
//       {["Monitoring", "Service"].map(tab => (
//         <button
//           key={tab}
//           onClick={() => setActive(tab)}
//           className={`pb-2 text-md cursor-pointer ${
//             active === tab
//               ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
//               : "text-gray-500"
//           }`}
//         >
//           {tab}
//         </button>
//       ))}
//     </div>
//   );
// }

"use client";

type TabType = "Monitoring" | "Service";

interface TabsProps {
  active: TabType;
  onChange: (tab: TabType) => void;
}

export default function Tabs({ active, onChange }: TabsProps) {
  return (
    <div className="flex gap-12 border-b mb-6 justify-center">
      {["Monitoring", "Service"].map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab as TabType)}
          className={`pb-2 text-md cursor-pointer ${
            active === tab
              ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
              : "text-gray-500"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}