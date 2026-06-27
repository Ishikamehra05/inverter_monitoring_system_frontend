"use client";

<<<<<<< HEAD
import { useState, useMemo } from "react";
=======
import { useState, useMemo, useEffect } from "react";
>>>>>>> second/dev
import Header from "@/components/services/serviceLayout/MonitorHeader";
import Pagination from "@/components/ui/Pagination";
import { useRouter } from "next/navigation";
import CreateUserModal from "@/components/services/modals/CreateUserModal";
import AssignUserModal from "@/components/services/modals/AssignUserModal";
import RelateUserModal from "@/components/services/modals/RelateUserModal";
import Link from "next/link";
import { useMonitorUsers } from "@/hooks/api/useService";
<<<<<<< HEAD
=======
import { MonitorFilters } from "@/lib/api/schemas/service";
>>>>>>> second/dev
const PAGE_SIZE = 10;

type MonitorUserRow = {
  id: string | number;
  account: string;
  affiliation: string;
  power: number;
  today: number;
  total: number;
  status: {
    normal: number;
    fault: number;
    standby: number;
    offline: number;
  };
};

type MonitorUserSortKey = "power" | "today" | "total";

export default function MonitorUserListPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
<<<<<<< HEAD

=======
  const initialFilters: MonitorFilters = {
    status: "all",
    sortBy: "",
    sortOrder: "asc",
    searchUser: "",
    searchSN: "",
    searchInstallationDate: "",
    searchAffiliation: "",
  };
  const [filterForm, setFilterForm] = useState(initialFilters);
  const [queryFilters, setQueryFilters] = useState(initialFilters);
>>>>>>> second/dev
  const [sortKey, setSortKey] = useState<MonitorUserSortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [openCreate, setOpenCreate] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [openRelate, setOpenRelate] = useState(false);
  const monitorUsersQuery = useMonitorUsers({
    page,
    pageSize: PAGE_SIZE,
<<<<<<< HEAD
    status: statusFilter,
    sortBy: sortKey ?? undefined,
    sortOrder,
  });

=======
    ...queryFilters,
  });

  useEffect(() => {
    if (monitorUsersQuery.data?.filters) {
      setFilterForm(monitorUsersQuery.data.filters);
      setQueryFilters(monitorUsersQuery.data.filters);
    }
  }, [monitorUsersQuery.data]);

>>>>>>> second/dev
  const totalPages = monitorUsersQuery.data?.pagination.totalPages ?? 1;
  const totalItems = monitorUsersQuery.data?.pagination.totalItems ?? 0;

  const users = useMemo<MonitorUserRow[]>(() => {
    return (
      monitorUsersQuery.data?.items.map((user) => ({
        id: user.id,
        account: user.account,
        affiliation: user.affiliation,
        power: user.power.value,
        today: user.today.value,
        total: user.total.value,
        status: user.status,
      })) ?? []
    );
  }, [monitorUsersQuery.data]);
  const sortedUsers = useMemo(() => {
    if (!sortKey) return users;

    return [...users].sort((a, b) => {
      if (sortOrder === "asc") return a[sortKey] - b[sortKey];
      return b[sortKey] - a[sortKey];
    });
  }, [users, sortKey, sortOrder]);

  const handleSort = (key: MonitorUserSortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };
  const router = useRouter();

  const handleAccountClick = (userId: string | number) => {
    const url = `/monitor/plants?userid=${userId}&fromService=true`;
    console.log("Navigating to:", url);
    router.push(url);
  };

  {
<<<<<<< HEAD
    !monitorUsersQuery.isLoading &&
      users.length === 0 && (
        <div className="py-6 text-center text-[#8c8c8c]">
          No users found.
        </div>
      )
=======
    !monitorUsersQuery.isLoading && users.length === 0 && (
      <div className="py-6 text-center text-[#8c8c8c]">No users found.</div>
    );
>>>>>>> second/dev
  }

  return (
    <div className="space-y-6">
<<<<<<< HEAD
      <Header />
=======
      <Header
        filters={filterForm}
        setFilters={setFilterForm}
        onQuery={() => {
          setPage(1);
          setQueryFilters(filterForm);
        }}
        onReset={() => {
          setPage(1);
          setFilterForm(initialFilters);
          setQueryFilters(initialFilters);
        }}
      />
>>>>>>> second/dev

      {/* Table container with shadow, rounded corners, and border */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-4 overflow-hidden">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-[18px] font-medium text-[#262626]">
            Monitor User List
          </h2>

          <div className="flex flex-wrap items-center gap-6 text-[14px] text-[#595959]">
            <FilterBtn
              active={statusFilter === "all"}
              onClick={() => setStatusFilter("all")}
            >
              All ({totalItems})
            </FilterBtn>

            <FilterWithCount
              label="Normal"
              count={0}
              color="green"
              active={statusFilter === "normal"}
              onClick={() => setStatusFilter("normal")}
            />

            <FilterWithCount
              label="Fault"
              count={0}
              color="red"
              active={statusFilter === "fault"}
              onClick={() => setStatusFilter("fault")}
            />

            <FilterWithCount
              label="Standby"
              count={0}
              color="yellow"
              active={statusFilter === "standby"}
              onClick={() => setStatusFilter("standby")}
            />

            <FilterWithCount
              label="Offline"
              count={0}
              color="gray"
              active={statusFilter === "offline"}
              onClick={() => setStatusFilter("offline")}
            />
          </div>
        </div>

        {/* DESKTOP TABLE */}
        {monitorUsersQuery.isLoading && (
<<<<<<< HEAD
          <div className="py-6 text-center text-[#8c8c8c]">Loading users...</div>
=======
          <div className="py-6 text-center text-[#8c8c8c]">
            Loading users...
          </div>
>>>>>>> second/dev
        )}
        {monitorUsersQuery.isError && (
          <div className="py-6 text-center text-[#ff4d4f]">
            Unable to load users.
          </div>
        )}
        <div className="hidden lg:block overflow-x-auto border border-[#f0f0f0] rounded-lg">
          <table className="w-full text-[14px]">
            {/* HEADER */}
            <thead className="bg-[#fafafa] text-[#595959]">
              <tr>
                <th className="px-4 py-3 text-left border-b border-[#f0f0f0]">
                  <input type="checkbox" className="w-4 h-4" />
                </th>

                <th className="px-4 py-3 text-left border-b border-[#f0f0f0]">
                  Account
                </th>

                <th className="px-4 py-3 text-left border-b border-[#f0f0f0]">
                  Affiliations
                </th>

                <SortableHeader
                  label="Power"
                  sortKey="power"
                  currentKey={sortKey}
                  order={sortOrder}
                  onSort={handleSort}
                />

                <SortableHeader
                  label="E-Today"
                  sortKey="today"
                  currentKey={sortKey}
                  order={sortOrder}
                  onSort={handleSort}
                />

                <SortableHeader
                  label="E-Total"
                  sortKey="total"
                  currentKey={sortKey}
                  order={sortOrder}
                  onSort={handleSort}
                />

                <th className="px-4 py-3 text-left border-b border-[#f0f0f0]">
                  Device Status
                </th>

                <th className="px-4 py-3 text-right border-b border-[#f0f0f0] w-[90px] min-w-[90px]">
                  Operation
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {sortedUsers.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-[#fafafa] transition-colors duration-300"
                >
                  <td className="px-4 py-3 border-b border-[#f0f0f0]">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>

                  <td
                    className="px-4 py-3 border-b border-[#f0f0f0] text-[#1677ff] cursor-pointer"
                    onClick={() => handleAccountClick(u.id)}
                  >
                    {u.account}
                  </td>

                  <td className="px-4 py-3 border-b border-[#f0f0f0]">
                    {u.affiliation}
                  </td>

                  <td className="px-4 py-3 border-b border-[#f0f0f0]">
                    {u.power.toFixed(2)} kW
                  </td>

                  <td className="px-4 py-3 border-b border-[#f0f0f0]">
                    {u.today.toFixed(2)} kWh
                  </td>

                  <td className="px-4 py-3 border-b border-[#f0f0f0]">
                    {u.total.toFixed(2)} kWh
                  </td>

                  {/* DEVICE STATUS */}
                  <td className="px-4 py-3 border-b border-[#f0f0f0]">
                    <div className="flex items-center justify-start gap-2">
                      <StatusBadge type="normal" count={u.status.normal} />
                      <StatusBadge type="fault" count={u.status.fault} />
                      <StatusBadge type="standby" count={u.status.standby} />
                      <StatusBadge type="offline" count={u.status.offline} />
                    </div>
                  </td>

                  {/* OPERATION */}
                  <td className="px-4 py-3 border-b border-[#f0f0f0] text-right w-[90px] min-w-[90px]">
                    <div className="flex justify-end">
<<<<<<< HEAD
                      <Link href={`/services/monitor/list/plant?userid=${u.id}&fromService=true`}>
=======
                      <Link
                        href={`/services/monitor/list/plant?userid=${u.id}&fromService=true`}
                      >
>>>>>>> second/dev
                        <div className="w-8 h-8 flex items-center justify-center rounded-full border border-[#d9d9d9] hover:border-[#1677ff] hover:text-[#1677ff] cursor-pointer transition flex-shrink-0">
                          &gt;
                        </div>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE VIEW */}
        <div className="lg:hidden p-4 space-y-4">
          {sortedUsers.map((u) => (
            <div
              key={u.id}
              className="border border-[#f0f0f0] rounded-md p-4 space-y-2"
            >
              <div className="text-[#1677ff] font-medium">{u.account}</div>
              <div className="text-sm text-[#595959]">{u.affiliation}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Power: {u.power} kW</div>
                <div>Today: {u.today} kWh</div>
                <div>Total: {u.total} kWh</div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-6 py-4 border-t rounded-xl shadow-sm border-[#f0f0f0] bg-[#fafafa]">
          <div className="flex flex-wrap gap-3">
            <AntBlueBtn
              label="Relate User"
              onClick={() => setOpenRelate(true)}
            />
            <AntBlueBtn
              label="Assign User"
              onClick={() => setOpenAssign(true)}
            />
            <AntBlueBtn
              label="Create User"
              onClick={() => setOpenCreate(true)}
            />
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

<<<<<<< HEAD
      {openCreate && (
        <CreateUserModal
          onClose={() => setOpenCreate(false)}
        />
      )}
=======
      {openCreate && <CreateUserModal onClose={() => setOpenCreate(false)} />}
>>>>>>> second/dev
      {openAssign && <AssignUserModal onClose={() => setOpenAssign(false)} />}
      {openRelate && <RelateUserModal onClose={() => setOpenRelate(false)} />}
    </div>
  );
}

/* ================= COMPONENTS ================= */

function SortableHeader({ label, sortKey, currentKey, order, onSort }: any) {
  const isActive = currentKey === sortKey;

  const nextOrder = !isActive ? "asc" : order === "asc" ? "desc" : "asc";

  const tooltipText =
    nextOrder === "asc"
      ? "Click to sort ascending"
      : "Click to sort descending";

  return (
    <th className="px-4 py-3 text-left border-b border-[#f0f0f0] relative">
      <div className="inline-flex items-center gap-2 group relative">
        <button
          onClick={() => onSort(sortKey)}
          className="flex items-center gap-1 text-[14px] font-medium"
        >
          {label}

          <div className="flex flex-col text-[10px] leading-none ml-1">
            <span
<<<<<<< HEAD
              className={`${isActive && order === "asc"
                ? "text-[#1677ff]"
                : "text-[#bfbfbf]"
                }`}
=======
              className={`${
                isActive && order === "asc"
                  ? "text-[#1677ff]"
                  : "text-[#bfbfbf]"
              }`}
>>>>>>> second/dev
            >
              ▲
            </span>
            <span
<<<<<<< HEAD
              className={`${isActive && order === "desc"
                ? "text-[#1677ff]"
                : "text-[#bfbfbf]"
                }`}
=======
              className={`${
                isActive && order === "desc"
                  ? "text-[#1677ff]"
                  : "text-[#bfbfbf]"
              }`}
>>>>>>> second/dev
            >
              ▼
            </span>
          </div>
        </button>

        {/* TOOLTIP */}
        <div
          className="
            absolute
            -top-12
            left-1/2
            -translate-x-1/2
            bg-[#595959]
            text-white
            text-[12px]
            px-3 py-1
            rounded
            whitespace-nowrap
            opacity-0
            group-hover:opacity-100
            transition
            z-50
            pointer-events-none
          "
        >
          {tooltipText}

          {/* small arrow */}
          <div
            className="
            absolute
            bottom-[-4px]
            left-1/2
            -translate-x-1/2
            w-2 h-2
            bg-[#595959]
            rotate-45
          "
          />
        </div>
      </div>
    </th>
  );
}

function FilterBtn({ children, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-1 rounded
        transition
        ${active ? "bg-[#f5f5f5] text-[#262626]" : "hover:bg-[#f5f5f5]"}
      `}
    >
      {children}
    </button>
  );
}

function FilterWithCount({ label, count, color, active, onClick }: any) {
  const map: any = {
    green: "bg-[#52c41a]",
    red: "bg-[#ff4d4f]",
    yellow: "bg-[#faad14]",
    gray: "bg-[#bfbfbf]",
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2
        transition
        px-2 py-1 rounded
        ${active ? "bg-[#f5f5f5]" : "hover:bg-[#f5f5f5]"}
      `}
    >
      <span>{label}</span>

      <span
        className={`px-3 py-[2px] text-white rounded-full text-[12px] ${map[color]}`}
      >
        {count}
      </span>
    </button>
  );
}

function AntBlueBtn({ label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="h-9 px-5 text-white text-[14px] font-medium rounded-md border border-[#1677ff] bg-gradient-to-b from-[#1890ff] to-[#1677ff] shadow-[0_2px_0_rgba(0,0,0,0.045)] hover:from-[#40a9ff]"
    >
      {label}
    </button>
  );
}

function StatusBadge({ type, count }: any) {
  const config: any = {
    normal: {
      text: "text-[#52c41a]",
      bg: "bg-[#f6ffed]",
      border: "border-[#b7eb8f]",
      label: "Normal",
    },
    fault: {
      text: "text-[#ff4d4f]",
      bg: "bg-[#fff2f0]",
      border: "border-[#ffccc7]",
      label: "Fault",
    },
    standby: {
      text: "text-[#faad14]",
      bg: "bg-[#fffbe6]",
      border: "border-[#ffe58f]",
      label: "Standby",
    },
    offline: {
      text: "text-[rgba(0,0,0,0.85)]",
      bg: "bg-[#fafafa]",
      border: "border-[#d9d9d9]",
      label: "Offline",
    },
  };

  const c = config[type];

  return (
    <div className="relative group inline-block mr-2">
      {/* MAIN TAG */}
      <span
        className={`
          inline-block
          w-[70px]
          text-center
          text-[12px]
          leading-[20px]
          px-[7px]
          border
          rounded-[2px]
          transition-all duration-300
          ${c.text}
          ${c.bg}
          ${c.border}
        `}
      >
        {count}
      </span>

      {/* TOOLTIP */}
      <div
        className="
          absolute
          -top-9
          left-1/2
          -translate-x-1/2
          bg-[#595959]
          text-white
          text-[12px]
          px-2 py-1
          rounded
          opacity-0
          group-hover:opacity-100
          transition
          whitespace-nowrap
          z-50
        "
      >
        {c.label}

        <div
          className="
            absolute
            bottom-[-4px]
            left-1/2
            -translate-x-1/2
            w-2 h-2
            bg-[#595959]
            rotate-45
          "
        />
      </div>
    </div>
  );
}
