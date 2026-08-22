// plant/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePlants } from "@/hooks/api/usePlants";
import {
  ChevronLeft,
  ChevronRight,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

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

export default function PlantPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedEndUserId = searchParams.get("userid") ?? undefined;

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
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

  const pageSize = 10;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const plantsQuery = usePlants({
    page,
    pageSize,
    selectedEndUserId,
  });

  const plants = plantsQuery.data?.items ?? [];

  // console.log(plantsQuery.data?.items);

  const totalItems = plantsQuery.data?.pagination.totalItems ?? 0;

  const totalPages = plantsQuery.data?.pagination.totalPages ?? 1;

  const sortedPlants = useMemo(() => {
    if (!sortKey) return plants;

    return [...plants].sort((a, b) => {
      const aVal = a[sortKey as keyof typeof a];
      const bVal = b[sortKey as keyof typeof b];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [plants, sortKey, sortOrder]);

  // console.log("selectedEndUserId", selectedEndUserId);
  // console.log("plantsQuery", plantsQuery.data);

  if (plantsQuery.isLoading) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-lg border p-6">
          Loading plants...
        </div>
      </div>
    );
  }
  return (
    <div className="p-4">
      {/* Card container - now handles horizontal scroll if needed, but does NOT clip overflow */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 overflow-x-auto overflow-y-visible">
        {/* Back button */}
        <div className="mb-4">
          <span
            onClick={() => router.back()}
            className="inline-flex items-center text-[#1890FF] cursor-pointer hover:underline text-base font-medium"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </span>
        </div>

        <div className="border border-gray-300 rounded-lg inline-block min-w-full">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-black">
                  Status
                </th>
                <th className="px-4 py-2 text-left font-medium text-black">
                  PlantName
                </th>
                <th className="px-4 py-2 text-left font-medium text-black">
                  Image
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
                  sortKey="eToday"
                  currentKey={sortKey}
                  order={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="E-Total"
                  sortKey="eTotal"
                  currentKey={sortKey}
                  order={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Capacity"
                  sortKey="capacity"
                  currentKey={sortKey}
                  order={sortOrder}
                  onSort={handleSort}
                />
                <th className="px-4 py-2 text-left font-medium text-black">
                  Installed Date
                </th>
                <th className="px-4 py-2 text-left font-medium text-black">
                  PlantType
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedPlants.map((plant) => (
                <tr key={plant.id}>
                  <td className="px-4 py-2">{plant.plantStatus.status}</td>

                  <td className="px-4 py-2">
                    <Link
                      href={`/services/monitor/list/devices?plantId=${plant.id}&userid=${selectedEndUserId}&targetEndUserId=${selectedEndUserId}`}
                      className="text-[#1890FF] hover:underline"
                    >
                      {plant.name}
                    </Link>
                  </td>

                  <td className="px-4 py-2">
                    {getPlantPictureUrl(
                      plant.picture ?? plant.pictureUrl ?? plant.imageUrl,
                    ) ? (
                      <button
                        type="button"
                        onClick={() =>
                          openImagePreview(
                            getPlantPictureUrl(
                              plant.picture ??
                                plant.pictureUrl ??
                                plant.imageUrl,
                            ),
                            `${plant.name} plant`,
                          )
                        }
                        className="cursor-zoom-in"
                        aria-label={`Preview ${plant.name} image`}
                      >
                        <img
                          src={getPlantPictureUrl(
                            plant.picture ?? plant.pictureUrl ?? plant.imageUrl,
                          )}
                          alt={`${plant.name} plant`}
                          className="h-12 w-20 rounded object-cover"
                        />
                      </button>
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </td>

                  <td className="px-4 py-2">
                    {plant.power?.value ?? 0} {plant.power?.unit ?? "W"}
                  </td>

                  <td className="px-4 py-2">
                    {plant.eToday?.value ?? 0} {plant.eToday?.unit ?? ""}
                  </td>

                  <td className="px-4 py-2">
                    {plant.eTotal?.value ?? 0} {plant.eTotal?.unit ?? ""}
                  </td>

                  <td className="px-4 py-2">{Number(plant.kwp ?? 0)} kW</td>

                  <td className="px-4 py-2">{plant.installed}</td>

                  <td className="px-4 py-2">{plant.type ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

        <div className="flex items-center justify-end gap-4 mt-4 text-sm">
          <span>
            {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalItems)}{" "}
            of {totalItems} items
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1 rounded border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-2">
              {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1 rounded border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

/* ================= Sortable Header Component ================= */
function SortableHeader({ label, sortKey, currentKey, order, onSort }: any) {
  const isActive = currentKey === sortKey;
  const nextOrder = !isActive ? "asc" : order === "asc" ? "desc" : "asc";
  const tooltipText =
    nextOrder === "asc"
      ? "Click to sort ascending"
      : "Click to sort descending";

  return (
    <th className="px-4 py-2 text-left font-medium text-black overflow-visible">
      <button
        onClick={() => onSort(sortKey)}
        className="relative flex items-center gap-1 text-[14px] font-medium focus:outline-none group cursor-pointer whitespace-nowrap"
      >
        {label}
        <div className="flex flex-col text-[10px] leading-none ml-1">
          <span
            className={
              isActive && order === "asc" ? "text-[#1677ff]" : "text-[#bfbfbf]"
            }
          >
            ▲
          </span>
          <span
            className={
              isActive && order === "desc" ? "text-[#1677ff]" : "text-[#bfbfbf]"
            }
          >
            ▼
          </span>
        </div>

        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#595959] text-white text-[12px] px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none shadow-lg">
          {tooltipText}
          <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#595959] rotate-45" />
        </div>
      </button>
    </th>
  );
}
