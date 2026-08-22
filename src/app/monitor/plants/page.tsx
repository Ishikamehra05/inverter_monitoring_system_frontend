"use client";

import { useState } from "react";
import {
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
  Search,
  Plus,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
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
  picture?: string | null;
  pictureFileId?: string | null;

  status: "Offline" | "Online" | "Abnormal" | "Standby";

  totalDevices: number;
  normalCount: number;
  abnormalCount: number;
  standbyCount: number;
  offlineCount: number;
};
type PlantSortField = Exclude<keyof Plant, "picture" | "pictureFileId">;

const getPlantPictureUrl = (picture: unknown) => {
  if (!picture) return "";

  if (typeof picture === "object") {
    const image = picture as Record<string, unknown>;
    return getPlantPictureUrl(
      image.url ?? image.uri ?? image.path ?? image.location,
    );
  }

  if (typeof picture !== "string") return "";
  if (/^(data:|blob:|https?:\/\/)/i.test(picture)) return picture;
  if (picture.startsWith("/")) return picture;

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBaseUrl) return picture;

  return `${apiBaseUrl.replace(/\/$/, "")}/${picture.replace(/^\//, "")}`;
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
  field: PlantSortField;
  sortField: PlantSortField | null;
  onClick?: () => void;
  sortOrder: "asc" | "desc";
  onSort: (field: PlantSortField) => void;
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
  sortField: PlantSortField | null;
  sortOrder: "asc" | "desc";
  onSort: (field: PlantSortField) => void;
  onDelete: (id: string) => void;
  onEdit: (plant: Plant) => void;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [previewRotation, setPreviewRotation] = useState(0);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewFlipX, setPreviewFlipX] = useState(false);
  const [previewFlipY, setPreviewFlipY] = useState(false);

  const openImagePreview = (src: string, alt: string) => {
    setPreviewImage({ src, alt });
    setPreviewRotation(0);
    setPreviewScale(1);
    setPreviewFlipX(false);
    setPreviewFlipY(false);
  };

  const handlePlantClick = (plantId: string, status: Plant["status"]) => {
    const userId = searchParams.get("userid");

    const params = new URLSearchParams({
      plantId,
      // status,
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
        return "bg-green-500 text-green-400";

      case "abnormal":
      case "fault":
        return "bg-red-400 text-white-400";

      case "standby":
        return "bg-yellow-400  text-white-400";

      case "offline":
        return "bg-gray-400  text-white-400";

      default:
        return "bg-gray-400  text-white-400";
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

            <th className="p-3 text-left text-gray-600">Image</th>

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
                  className={`text-white text-xs px-2 py-1 rounded font-medium ${getStatusStyle(
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
              <td className="p-3">
                {p.picture ? (
                  <button
                    type="button"
                    onClick={() =>
                      openImagePreview(p.picture as string, `${p.name} plant`)
                    }
                    className="cursor-zoom-in"
                    aria-label={`Preview ${p.name} image`}
                  >
                    <img
                      src={p.picture}
                      alt={`${p.name} plant`}
                      className="h-12 w-20 rounded object-cover"
                    />
                  </button>
                ) : (
                  <span className="text-gray-400">
                    {p.pictureFileId ? "Image unavailable" : "No image"}
                  </span>
                )}
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

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-2xl text-white hover:bg-black/70"
            aria-label="Close image preview"
          >
            ×
          </button>
          <img
            src={previewImage.src}
            alt={previewImage.alt}
            className="max-h-[75vh] max-w-[90vw] object-contain shadow-2xl transition-transform duration-200"
            style={{
              transform: `rotate(${previewRotation}deg) scale(${previewScale}) scaleX(${previewFlipX ? -1 : 1}) scaleY(${previewFlipY ? -1 : 1})`,
            }}
            onClick={(event) => event.stopPropagation()}
          />
          <div
            className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/55 p-2 text-white shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <PreviewToolButton
              label="Flip vertically"
              onClick={() => setPreviewFlipY((value) => !value)}
            >
              <FlipVertical size={18} />
            </PreviewToolButton>
            <PreviewToolButton
              label="Flip horizontally"
              onClick={() => setPreviewFlipX((value) => !value)}
            >
              <FlipHorizontal size={18} />
            </PreviewToolButton>
            <PreviewToolButton
              label="Rotate left"
              onClick={() => setPreviewRotation((value) => value - 90)}
            >
              <RotateCcw size={18} />
            </PreviewToolButton>
            <PreviewToolButton
              label="Rotate right"
              onClick={() => setPreviewRotation((value) => value + 90)}
            >
              <RotateCw size={18} />
            </PreviewToolButton>
            <PreviewToolButton
              label="Zoom out"
              onClick={() =>
                setPreviewScale((value) => Math.max(0.5, value - 0.25))
              }
            >
              <ZoomOut size={18} />
            </PreviewToolButton>
            <PreviewToolButton
              label="Zoom in"
              onClick={() =>
                setPreviewScale((value) => Math.min(3, value + 0.25))
              }
            >
              <ZoomIn size={18} />
            </PreviewToolButton>
          </div>
        </div>
      )}
    </div>
  );
};

function PreviewToolButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/15 hover:text-white"
    >
      {children}
    </button>
  );
}

/* ---------- Main Page ---------- */
export default function PlantPage() {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [plantTypeFilter, setPlantTypeFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState<PlantSortField | null>(null);
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
      picture: getPlantPictureUrl(p.picture ?? p.pictureUrl ?? p.imageUrl),
      pictureFileId: p.pictureFileId,

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

  const handleSort = (field: PlantSortField) => {
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
                // console.log(id);
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
