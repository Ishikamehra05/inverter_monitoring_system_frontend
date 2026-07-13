"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import Image from "next/image";
import { Pagination } from "@/components/monitors/pagination";
import { FiX } from "react-icons/fi";
import AddPlantDrawer from "@/components/monitors/modals/AddPlantDrawer";
import { useRouter, useSearchParams } from "next/navigation";
import { navigateMonitor } from "@/utils/monitorNavigation";
import {
  usePlantSummary,
  usePlants,
  useDeletePlant,
  usePlantListExport,
} from "@/hooks/api/usePlants";
import { toast } from "sonner";
/* ---------- Types ---------- */
type Plant = {
  id: string;
  name: string;
  type: string;
  eToday: string;
  eTotal: string;
  power: string;
  effect: {
    value: string;
  };
  installed: string;
  updated: string;
  kwp: string;
  price: string;
  address: string;
  longitude: string;
  latitude: string;

  status: "Offline" | "Online" | "Abnormal" | "Standby";

  totalDevices: number;
  normalCount: number;
  abnormalCount: number;
  standbyCount: number;
  offlineCount: number;
};

/* ---------- Stat Card ---------- */
const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="relative flex items-center justify-between overflow-hidden rounded-xl bg-linear-to-r from-white to-gray-50 px-4 py-3 lg:py-5 shadow-sm">
      {/* Left text */}
      <div className="z-10">
        <p className="text-xs md:text-sm text-gray-400">{title}</p>
        <p className="mt-1 text-md md:text-xl font-semibold text-black">
          {value}
        </p>
      </div>

      {/* Right big faded icon */}
      <div className="absolute -right-6 lg:-right-8 top-1/2 -translate-y-1/2">
        <div className="flex w-20 h-20 lg:w-28 lg:h-28 items-center justify-center rounded-full bg-teal-100 opacity-40">
          {icon}
        </div>
      </div>
    </div>
  );
};

/* ---------- Filters ---------- */
const Filters = ({
  active,
  setActive,
  counts,
}: {
  active: string;
  setActive: (v: string) => void;
  counts: Record<string, number>;
}) => {
  const filters = [
    { label: "All", value: "All" },
    { label: "Online", value: "Online" },
    { label: "Abnormal", value: "Abnormal" },
    { label: "Standby", value: "Standby" },
    { label: "Offline", value: "Offline" },
  ];

  return (
    <div className="flex gap-8 overflow-x-auto">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => setActive(filter.value)}
          className={`text-sm flex items-center gap-1 pb-1 cursor-pointer ${
            active === filter.value
              ? "text-(--primary) border-b-2 font-semibold border-(--primary)"
              : "text-(--muted-fg)"
          }`}
        >
          {filter.label}
          <span className="bg-(--primary) text-(--white) text-xs px-2 rounded-full">
            {counts[filter.label]}
          </span>
        </button>
      ))}
    </div>
  );
};

/* ---------- Plant Type Filter Dropdown ---------- */
const PlantTypeFilterDropdown = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  // const types = ["Grid", "Hybrid", "Storage"];
  const types = ["on grid", "hybrid", "storage"];

  const toggle = (type: string) => {
    onChange(
      value.includes(type) ? value.filter((v) => v !== type) : [...value, type],
    );
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="ml-2 text-(--muted-fg) hover:text-(--strong-fg) cursor-pointer"
      >
        ▾
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-44 rounded-lg bg-(--theme-bg) border border-(--border) p-3 shadow-lg">
          <div className="space-y-2">
            {types.map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={value.includes(t)}
                  onChange={() => toggle(t)}
                  className="cursor-pointer"
                />
                {t}
              </label>
            ))}
          </div>

          <div className="mt-3 flex justify-between">
            <button
              onClick={() => onChange([])}
              className="text-xs text-(--subtle-fg) cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded bg-(--primary) hover:bg-(--primary-hover) px-3 py-1 text-xs text-(--white) cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SortHeader = ({
  label,
  field,
  sortField,
  sortOrder,
  onSort,
}: {
  label: string;
  field: keyof Plant;
  sortField: keyof Plant | null;
  onClick?: () => void;
  sortOrder: "asc" | "desc";
  onSort: (field: keyof Plant) => void;
}) => {
  return (
    <th
      onClick={() => onSort(field)}
      className="p-3 text-left text-gray-600 cursor-pointer select-none"
    >
      {label}
      {sortField === field && (
        <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
      )}
    </th>
  );
};

/* ---------- Table ---------- */

const PlantTable = ({
  plants,
  plantTypeFilter,
  setPlantTypeFilter,
  sortField,
  sortOrder,
  onSort,
  onDelete,
  onEdit,
}: {
  plants: Plant[];
  plantTypeFilter: string[];
  setPlantTypeFilter: (v: string[]) => void;
  sortField: keyof Plant | null;
  sortOrder: "asc" | "desc";
  onSort: (field: keyof Plant) => void;
  onDelete: (id: string) => void;
  onEdit: (plant: Plant) => void;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePlantClick = (plantId: string, status: Plant["status"]) => {
    const userId = searchParams.get("userid");

    const params = new URLSearchParams({
      plantId,
      status,
    });

    if (userId) {
      params.set("targetEndUserId", userId);
      params.set("fromService", "true");
    }

    navigateMonitor(
      router,
      searchParams,
      `/monitor/plants/plant-detail?${params.toString()}`,
    );
  };
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "online":
      case "normal":
        return "bg-green-100 border border-green-700 text-green-700";

      case "offline":
      case "abnormal":
        return "bg-red-100 border border-[#ff7875] text-red-700";

      case "warning":
        return "bg-yellow-100 border border-yellow-700 text-yellow-700";

      default:
        return "bg-gray-100 border border-gray-600 text-gray-700";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 whitespace-nowrap">
          <tr>
            <SortHeader
              label="Status"
              field="status"
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSort}
            />

            <SortHeader
              label="Plant Name"
              field="name"
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSort}
            />

            <th className="p-3 text-left text-gray-600">
              <div className="flex items-center">
                Plant Type
                {/* <PlantTypeFilterDropdown
                  value={plantTypeFilter}
                  onChange={setPlantTypeFilter}
                /> */}
              </div>
            </th>

            <SortHeader
              label="E-Today"
              field="eToday"
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <SortHeader
              label="E-Total"
              field="eTotal"
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <SortHeader
              label="Power"
              field="power"
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <SortHeader
              label="Effect"
              field="effect"
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <SortHeader
              label="Installed date"
              field="installed"
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <SortHeader
              label="Last Update"
              field="updated"
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <th className="p-3 text-left text-gray-600">Operation</th>
          </tr>
        </thead>

        <tbody>
          {plants.map((p) => (
            <tr key={p.name} className="border-t whitespace-nowrap">
              <td className="p-3">
                <span
                  className={`text-black text-xs px-2 py-1 rounded font-medium ${getStatusStyle(
                    p.status,
                  )}`}
                >
                  {p.status} ({p.totalDevices})
                </span>
              </td>
              <td
                className="p-3 text-blue-600 cursor-pointer"
                onClick={() => handlePlantClick(p.id, p.status)}
              >
                {p.name}
              </td>
              <td className="p-3 text-black">{p.type}</td>
              <td className="p-3 text-black">{p.eToday}</td>
              <td className="p-3 text-black">{p.eTotal}</td>
              <td className="p-3 text-black">{p.power}</td>
              <td className="p-3 text-black">{p.effect.value}</td>
              <td className="p-3 text-black">{p.installed}</td>
              <td className="p-3 text-black">{p.updated}</td>
              <td className="p-3 text-blue-600 flex gap-3">
                <button onClick={() => onEdit(p)}>Edit</button>
                <button className="text-red-500" onClick={() => onDelete(p.id)}>
                  Delete
                </button>
                {/* <button className="text-red-500">Delete</button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ---------- Main Page ---------- */
export default function PlantPage() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [plantTypeFilter, setPlantTypeFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState<keyof Plant | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const selectedEndUserId = searchParams.get("userid") ?? undefined;
  const serviceParams = selectedEndUserId
    ? {
        fromService: true,
        targetEndUserId: selectedEndUserId,
      }
    : undefined;

  const statusQueryMap: Record<string, string | undefined> = {
    All: undefined,
    Online: "Online",
    Abnormal: "Abnormal",
    Standby: "Standby",
    Offline: "Offline",
  };

  const plantsQuery = usePlants({
    page: currentPage,
    pageSize,
    status: statusQueryMap[active],
    plantTypes: plantTypeFilter,
    search,
    sortBy: sortField ?? undefined,
    sortOrder,
    selectedEndUserId,
  });
  const summaryQuery = usePlantSummary(
    selectedEndUserId
      ? {
          fromService: true,
          selectedEndUserId,
        }
      : {},
  );
  const exportPlants = usePlantListExport();
  const formatEffectValue = (eff: any) => {
    if (eff === null || eff === undefined) return "";
    if (typeof eff === "string" || typeof eff === "number") return String(eff);
    if (typeof eff === "object") {
      if ("value" in eff) {
        return `${eff.value}${eff.unit ? ` ${eff.unit}` : ""}`;
      }
      return JSON.stringify(eff);
    }
    return String(eff);
  };
  const apiPlantData =
    plantsQuery.data?.items?.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,

      kwp: String(p.kwp),
      price: String(p.price),

      address: p.address,
      longitude: p.longitude,
      latitude: p.latitude,

      eToday: `${p.eToday.value} ${p.eToday.unit}`,
      eTotal: `${p.eTotal.value} ${p.eTotal.unit}`,
      power: `${p.power.value} ${p.power.unit}`,

      effect: {
        value: formatEffectValue(p.effect),
      },
      installed: p.installed,
      updated: p.updated,

      // Flatten the nested object for the UI (backend returns `plantStatus` object)
      status: p.plantStatus?.status ?? "Offline",
      totalDevices: p.plantStatus?.totalDevices ?? 0,
      normalCount: p.plantStatus?.normalCount ?? 0,
      abnormalCount: p.plantStatus?.abnormalCount ?? 0,
      standbyCount: p.plantStatus?.standbyCount ?? 0,
      offlineCount: p.plantStatus?.offlineCount ?? 0,
    })) ?? [];

  const counts = {
    All:
      plantsQuery.data?.statusCounts?.All ??
      summaryQuery.data?.statusCounts?.All ??
      apiPlantData.length,
    Online:
      plantsQuery.data?.statusCounts?.Online ??
      summaryQuery.data?.statusCounts?.Normal ??
      apiPlantData.filter((p) => p.status === "Online").length,
    Abnormal:
      plantsQuery.data?.statusCounts?.Abnormal ??
      summaryQuery.data?.statusCounts?.Abnormal ??
      apiPlantData.filter((p) => p.status === "Abnormal").length,
    Standby:
      plantsQuery.data?.statusCounts?.Standby ??
      summaryQuery.data?.statusCounts?.Standby ??
      apiPlantData.filter((p) => p.status === "Standby").length,
    Offline:
      plantsQuery.data?.statusCounts?.Offline ??
      summaryQuery.data?.statusCounts?.Offline ??
      apiPlantData.filter((p) => p.status === "Offline").length,
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deletePlantId, setDeletePlantId] = useState<string | null>(null);

  const deletePlantMutation = useDeletePlant();

  const [editPlant, setEditPlant] = useState<Plant | null>(null);

  const handleExportPlants = async () => {
    try {
      const result = await exportPlants.mutateAsync(serviceParams);

      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

      window.location.href = `${apiBase}${result.downloadUrl}`;
    } catch (error) {
      console.error("Export failed", error);
    }
  };

  const filtered = apiPlantData
    .filter((p) => {
      const matchStatus = active === "All" || p.status === active;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());

      const matchType =
        plantTypeFilter.length === 0 || plantTypeFilter.includes(p.type);

      return matchStatus && matchSearch && matchType;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  // const start = (currentPage - 1) * pageSize;
  // const paginatedData = filtered.slice(start, start + pageSize);

  // const counts = {
  //   All: summaryQuery.data?.statusCounts.All ?? apiPlantData.length,
  //   Normal:
  //     summaryQuery.data?.statusCounts.Normal ??
  //     apiPlantData.filter((p) => p.status === "Normal").length,
  //   Abnormal:
  //     summaryQuery.data?.statusCounts.Abnormal ??
  //     apiPlantData.filter((p) => p.status === "Abnormal").length,
  //   Standby:
  //     summaryQuery.data?.statusCounts.Standby ??
  //     apiPlantData.filter((p) => p.status === "Standby").length,
  //   Offline:
  //     summaryQuery.data?.statusCounts.Offline ??
  //     apiPlantData.filter((p) => p.status === "Offline").length,
  // };

  const handleSort = (field: keyof Plant) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <>
      <div className="p-6 min-h-screen space-y-6">
        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
          <StatCard
            title="Current Power"
            value={`${summaryQuery.data?.currentPower.value ?? 0} ${summaryQuery.data?.currentPower.unit ?? "W"}`}
            icon={
              <div className="relative w-20 h-20 lg:w-28 lg:h-28">
                <Image
                  src="/images/dashboard/stat-img-1.png"
                  alt="stat icon"
                  fill
                  className="object-contain opacity-70"
                />
              </div>
            }
          />
          <StatCard
            title="E-Today"
            value={`${summaryQuery.data?.eToday.value ?? 0} ${summaryQuery.data?.eToday.unit ?? "kWh"}`}
            icon={
              <Image
                src="/images/dashboard/stat-img-2.png"
                alt="stat icon"
                fill
                className="opacity-70"
              />
            }
          />
          <StatCard
            title="E-Total"
            value={`${summaryQuery.data?.eTotal.value ?? 25} ${summaryQuery.data?.eTotal.unit ?? "kWh"}`}
            icon={
              <div className="relative w-20 h-20">
                <Image
                  src="/images/dashboard/stat-img-3.png"
                  alt="stat icon"
                  fill
                  className="opacity-70"
                />
              </div>
            }
          />
          <StatCard
            title="H-Total"
            value={`${summaryQuery.data?.hTotal.value ?? 16} ${summaryQuery.data?.hTotal.unit ?? "Hrs"}`}
            icon={
              <Image
                src="/images/dashboard/stat-img-4.png"
                alt="stat icon"
                fill
                className="opacity-70"
              />
            }
          />
          <StatCard
            title="Capacity"
            value={`${summaryQuery.data?.capacity.value ?? 0} ${summaryQuery.data?.capacity.unit ?? "kW"}`}
            icon={
              <div className="relative w-16 h-16">
                <Image
                  src="/images/dashboard/stat-img-5.png"
                  alt="stat icon"
                  fill
                  className="opacity-70"
                />
              </div>
            }
          />
        </div>

        {/* TABLE CARD */}
        <div className="bg-(--theme-bg) rounded-xl p-4 shadow-sm space-y-4">
          {/* TOP BAR */}
          <div className="flex flex-col lg:items-center lg:flex-row lg:justify-between gap-4">
            <Filters active={active} setActive={setActive} counts={counts} />

            <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
              <div className="w-full sm:w-105">
                <div className="flex items-center px-3 py-2 border border-gray-300 text-black rounded-sm overflow-hidden transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 bg-white ">
                  {/* Input */}
                  <Search size={16} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search plant or inverter SN"
                    className="flex-1 mx-2 text-sm outline-none bg-transparent"
                  />

                  {/* Clear button */}
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className=" text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <FiX />
                    </button>
                  )}

                  {/* Search button */}
                  {/* <button className=" bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 transition">
                  <span className="flex items-center gap-2">
                    <Search size={14} />
                    Search
                  </span>
                </button> */}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOpen(true)}
                  className="border rounded p-3 sm:px-3 sm:py-1.5 cursor-pointer transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <p className="whitespace-nowrap hidden sm:block">
                      Add Plant
                    </p>
                  </span>
                </button>
                <button
                  className="border rounded p-3 sm:px-3 sm:py-1.5 cursor-pointer transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  onClick={handleExportPlants}
                  disabled={exportPlants.isPending}
                >
                  {exportPlants.isPending ? "Exporting..." : "Download"}
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          {plantsQuery.isLoading ? (
            <div className="text-center text-gray-400 py-6">
              Loading plants...
            </div>
          ) : plantsQuery.isError ? (
            <div className="text-center text-red-500 py-6">
              Unable to load plants. Showing development fallback if available.
            </div>
          ) : filtered.length ? (
            // <PlantTable
            //   // plants={paginatedData}
            //   plants={filtered}
            //   plantTypeFilter={plantTypeFilter}
            //   setPlantTypeFilter={setPlantTypeFilter}
            //   sortField={sortField}
            //   sortOrder={sortOrder}
            //   onSort={handleSort}
            // />
            <PlantTable
              plants={filtered}
              plantTypeFilter={plantTypeFilter}
              setPlantTypeFilter={setPlantTypeFilter}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              onDelete={(id) => {
                console.log(id);
                setDeletePlantId(id);
                setShowDeleteModal(true);
              }}
              onEdit={(plant) => {
                setEditPlant(plant);
                setOpen(true);
              }}
            />
          ) : (
            <div className="text-center text-gray-400 py-6">No data found</div>
          )}

          {/* FOOTER */}
          <Pagination
            // totalItems={filtered.length}
            totalItems={plantsQuery.data?.pagination?.totalItems ?? 0}
            pageSize={pageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setPageSize={setPageSize}
          />
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="font-semibold text-lg text-black">Delete Plant</h2>

            <p className="mt-2 text-gray-500">
              Are you sure you want to delete?
            </p>

            <div className="flex justify-end gap-3 mt-5">
              <button
                className="text-black"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePlantId(null);
                }}
              >
                Cancel
              </button>

              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  if (!deletePlantId) return;

                  deletePlantMutation.mutate(
                    {
                      plantId: deletePlantId,
                      serviceParams,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Plant deleted successfully.");
                        plantsQuery.refetch();
                        setDeletePlantId(null);
                        setShowDeleteModal(false);
                      },

                      onError: (err) => {
                        toast.error(err?.message || "Failed to delete plant.");
                        console.error(err);
                      },
                    },
                  );
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <AddPlantDrawer
        open={open}
        onClose={() => {
          setOpen(false);
          setEditPlant(null);
        }}
        plant={editPlant}
      />
    </>
  );
}
