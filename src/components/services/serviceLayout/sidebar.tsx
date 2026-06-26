"use client";

import { useState, useEffect } from "react";
import {
  Monitor,
  Users,
  Search,
  Upload,
  Settings,
  ChevronDown,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

/* ---------------- MENU ---------------- */

const MENU = [
  {
    title: "Monitor",
    icon: Monitor,
    children: [{ label: "User List", href: "/services/monitor/list" }],
  },
  {
    title: "User Management",
    icon: Users,
    children: [
      { label: "SubAccount", href: "/services/user/subaccount" },
      { label: "Information", href: "/services/user/info" },
    ],
  },
  {
    title: "Service",
    icon: Search,
    children: [
      { label: "Global Search", href: "/services/service/search" },
      { label: "App Export", href: "/services/service/export" },
    ],
  },
  {
    title: "Batch Upgrade",
    icon: Upload,
    children: [
      { label: "Batch-Firmware List", href: "/services/batch/firmware" },
      { label: "Batch Task", href: "/services/batch/task" },
    ],
  },
  {
    title: "Batch Setting",
    icon: Settings,
    children: [{ label: "Batch Setting", href: "/services/batch/setting" }],
  },
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);

  /* Prevent scroll on mobile */
  useEffect(() => {
    if (isOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  const sidebarWidth = collapsed ? "w-16" : "w-64";

  return (
    <>
      {/* ================= MOBILE OVERLAY ================= */}
      <div
        onClick={onClose}
        className={clsx(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible",
        )}
      />

      {/* ================= SIDEBAR ================= */}
      <aside
        className={clsx(
          "fixed md:static z-50 top-0 left-0 h-full flex flex-col",
          "bg-white border-r border-[#f0f0f0]",
          "text-[rgba(0,0,0,0.85)]",
          "shadow-lg",
          "transition-all duration-300",
          sidebarWidth,
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        )}
      >
        {/* ================= MENU ================= */}
        <nav className="flex-1 overflow-y-auto py-2 space-y-1 relative">
          {MENU.map((item) => {
            const Icon = item.icon;
            const isExpanded = openMenu === item.title;
            const isHover = hoverMenu === item.title;

            const active = item.children.some((child) =>
              pathname.startsWith(child.href),
            );

            return (
              <div
                key={item.title}
                className="relative"
                onMouseEnter={() => collapsed && setHoverMenu(item.title)}
                onMouseLeave={() => setHoverMenu(null)}
              >
                {/* -------- Parent Button -------- */}
                <button
                  onClick={() =>
                    !collapsed && setOpenMenu(isExpanded ? null : item.title)
                  }
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm",
                    "cursor-pointer",
                    "transition-all duration-200",
                    "hover:bg-[#e6f7ff] hover:text-[#1890ff]",
                    active && "bg-[#e6f7ff] text-[#1890ff]",
                  )}
                >
                  <Icon size={18} />

                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left truncate">
                        {item.title}
                      </span>

                      <ChevronDown
                        size={14}
                        className={clsx(
                          "transition-transform",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </>
                  )}
                </button>

                {/* -------- Expanded Dropdown -------- */}
                {!collapsed && isExpanded && (
                  <div className="ml-9 border-l border-[#f0f0f0]">
                    {item.children.map((child) => {
                      const childActive = pathname === child.href;

                      return (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => {
                            if (window.innerWidth < 768) onClose();
                          }}
                          className={clsx(
                            "block px-4 py-2 text-sm truncate transition-colors",
                            "hover:bg-[#f5f5f5]",
                            childActive && "bg-[#e6f7ff] text-[#1890ff]",
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* -------- Flyout (Collapsed Mode) -------- */}
                {collapsed && isHover && (
                  <div className="absolute left-full top-0 ml-2 bg-white border border-[#f0f0f0] rounded-md shadow-md w-56 z-50">
                    <div className="px-4 py-2 text-sm font-semibold border-b border-[#f0f0f0]">
                      {item.title}
                    </div>

                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2 text-sm hover:bg-[#f5f5f5]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ================= COLLAPSE BUTTON ================= */}
        <div className="border-t border-[#f0f0f0] p-2 hidden md:flex justify-center">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded hover:bg-[#f5f5f5]"
          >
            {collapsed ? (
              <ChevronsRight size={18} />
            ) : (
              <ChevronsLeft size={18} />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
