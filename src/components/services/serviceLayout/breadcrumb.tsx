"use client";

import { usePathname } from "next/navigation";

const ROUTE_LABELS: Record<string, string> = {
  monitor: "Monitor",
  list: "User List",
  user: "User Management",
  subaccount: "SubAccount",
  info: "Information",
  service: "Service",
  search: "Global Search",
  export: "App Export",
  batch: "Batch Upgrade",
  firmware: "Batch-Firmware List",
  task: "Batch Task",
  setting: "Batch Setting",
};

export default function Breadcrumb() {
  const pathname = usePathname();

  
  const parts = pathname
    .replace("/services", "")
    .split("/")
    .filter(Boolean);

  const labels = parts.map(
    (segment) => ROUTE_LABELS[segment] || segment
  );

  const title = labels[labels.length - 1] || "";

  return (
    <div
      className="
        bg-(--surface)
        border-b border-(--divider)
        px-4 sm:px-6 lg:px-8
        py-3 sm:py-4
        w-full
      "
    >
      
      <div
        className="
          text-xs sm:text-sm
          text-(--muted-fg)
          flex flex-wrap items-center
          gap-x-1 gap-y-1
          max-w-full
          overflow-hidden
        "
      >
        {labels.map((label, index) => (
          <div
            key={index}
            className="flex items-center min-w-0"
          >
            <span
              className="
                truncate
                max-w-[140px] sm:max-w-[200px] lg:max-w-none
              "
              title={label}
            >
              {label}
            </span>

            {index < labels.length - 1 && (
              <span className="mx-1 text-(--border-strong)">
                /
              </span>
            )}
          </div>
        ))}
      </div>

     
      <h1
        className="
          mt-1
          text-base sm:text-lg lg:text-xl
          font-semibold
          text-(--strong-fg)
          truncate
        "
        title={title}
      >
        {title}
      </h1>
    </div>
  );
}
