"use client";

import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`
        bg-white border-r transition-all
        ${open ? "w-64" : "w-16"}
        hidden md:block
      `}
    >
      <div className="p-4 font-semibold text-gray-700">
        Monitor
      </div>

      <nav className="text-sm">
        <SidebarItem label="User List" active />
        <SidebarItem label="User Management" />
        <SidebarItem label="Service" />
        <SidebarItem label="Batch Upgrade" />
        <SidebarItem label="Batch Setting" />
      </nav>
    </aside>
  );
}

function SidebarItem({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`
        px-4 py-2 cursor-pointer
        ${active ? "bg-blue-50 text-blue-600" : "text-gray-600"}
        hover:bg-gray-100
      `}
    >
      {label}
    </div>
  );
}
