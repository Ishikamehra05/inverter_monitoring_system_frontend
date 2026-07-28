"use client";

import { useRef, useState } from "react";
import { X, UploadCloud } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { useInverters, useUploadInverterList } from "@/hooks/api/useDevices";
import type { InverterSummary } from "@/lib/api/schemas/devices";

const PAGE_SIZE = 8;

export type { InverterSummary as SelectedDevice } from "@/lib/api/schemas/devices";

export default function DeviceSelectorPanel({
  onClose,
  onConfirm,
  selectedDevices,
  targetEndUserId,
}: {
  onClose: () => void;
  onConfirm: (devices: InverterSummary[]) => void;
  selectedDevices: InverterSummary[];
  targetEndUserId?: string;
}) {
  const [mode, setMode] = useState<"list" | "upload">("list");
  const [selected, setSelected] = useState<InverterSummary[]>(selectedDevices);
  const [currentPage, setCurrentPage] = useState(1);

  // Real device_inverters rows only (name, serialNumber, status) — no mock data,
  // no dataloggers. See coding_action/DeviceSelectorPanel.md for why loggerImei/
  // plantId aren't part of this list yet (separate join, not built here).
  //
  // A service_admin's own account owns no plants — plants belong to
  // monitoring-portal accounts — so without fromService+targetEndUserId this
  // always returns zero rows. Same requirement as every other service-portal
  // device list in this app (see devicesApi.plantDevices/deviceListSidePanel.tsx).
  const scopeParams = targetEndUserId ? { fromService: true, targetEndUserId } : {};
  const invertersQuery = useInverters({
    page: currentPage,
    pageSize: PAGE_SIZE,
    ...scopeParams,
  });
  const inverters = invertersQuery.data?.items ?? [];
  const totalPages = invertersQuery.data?.pagination.totalPages ?? 1;

  const toggleDevice = (device: InverterSummary) => {
    setSelected((prev) =>
      prev.some((d) => d.serialNumber === device.serialNumber)
        ? prev.filter((d) => d.serialNumber !== device.serialNumber)
        : [...prev, device],
    );
  };

  // Upload Devices — an .xlsx sheet of Serial No / Name. Trusted directly,
  // no cross-check against device_inverters — whatever the file says is
  // shown and added to the same `selected` array the checkbox table uses,
  // so both modes drive one consistent selection. Only the file's own
  // format is validated (right columns, valid .xlsx, non-empty).
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const uploadMutation = useUploadInverterList();

  // Uploading starts the instant a file is picked — no separate "Upload"
  // click. uploadMutation.isPending drives the in-progress state below.
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setUploadFile(file);

    // Reset the input's value so selecting the SAME file again still fires
    // onChange next time — browsers don't fire "change" when the value
    // (file path) doesn't actually change from the previous selection.
    e.target.value = "";

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    // mutateAsync rejects on failure (unlike .mutate()) — catch it here so a
    // bad upload surfaces as the inline error message below instead of an
    // unhandled rejection (which Next.js's dev overlay would otherwise show
    // in place of the intended UI). uploadMutation.isError/.error are already
    // populated by react-query regardless of whether we catch here.
    let result;
    try {
      result = await uploadMutation.mutateAsync(formData);
    } catch {
      return;
    }

    setSelected((prev) => {
      const bySerial = new Map(prev.map((d) => [d.serialNumber, d]));
      result.devices.forEach((device:any) =>
        bySerial.set(device.serialNumber, {
          id: device.serialNumber,
          name: device.name || device.serialNumber,
          serialNumber: device.serialNumber,
          status: "—",
        }),
      );
      return Array.from(bySerial.values());
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f5f5f5] overflow-y-auto">
      {/* HEADER */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.06)] px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
        <h2 className="text-[16px] font-medium text-[#000000D9]">
          Device List
        </h2>
        <button
          onClick={onClose}
          className="text-[#000000D9] hover:text-[#1890ff] transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* CONTENT */}
      <div className="px-4 sm:px-6 lg:px-10 py-8 space-y-8 max-w-7xl mx-auto">
        {/* MODE TABS */}
        <div className="flex gap-6 text-[14px] border-b border-[rgba(0,0,0,0.06)]">
          <button
            onClick={() => setMode("list")}
            className={`pb-3 -mb-px border-b-2 transition ${
              mode === "list"
                ? "border-[#1890ff] text-[#1890ff] font-medium"
                : "border-transparent text-[#000000D9] hover:text-[#1890ff]"
            }`}
          >
            Device List
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`pb-3 -mb-px border-b-2 transition ${
              mode === "upload"
                ? "border-[#1890ff] text-[#1890ff] font-medium"
                : "border-transparent text-[#000000D9] hover:text-[#1890ff]"
            }`}
          >
            Upload Devices
          </button>
        </div>

        {mode === "list" && (
          <>
            {/* FILTER SECTION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-[rgba(0,0,0,0.06)] pb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[#000000D9]">Device SN:</span>
                <input
                  className="h-8 px-[11px] text-[14px] text-[#000000D9] border border-[#d9d9d9] rounded-[2px] focus:outline-none focus:border-[#40a9ff] focus:ring-2 focus:ring-[#1890ff]/20 transition placeholder:text-[#000000D9]"
                  placeholder="Please enter"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[#000000D9]">Device Status:</span>
                <select className="h-8 px-[11px] text-[14px] text-[#000000D9] border border-[#d9d9d9] rounded-[2px] focus:outline-none focus:border-[#40a9ff]">
                  <option className="text-[#000000D9]">Please select</option>
                </select>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[2px] overflow-hidden">
              {invertersQuery.isLoading && (
                <div className="py-6 text-center text-[rgba(0,0,0,0.45)]">
                  Loading devices...
                </div>
              )}
              {invertersQuery.isError && (
                <div className="py-6 text-center text-[#ff4d4f]">
                  Unable to load devices.
                </div>
              )}

              <div className="overflow-x-auto relative">
                <table className="w-full text-[14px] border-collapse">
                  <thead className="bg-[#fafafa] text-[#000000D9]">
                    <tr>
                      <th className="p-3 w-12" />
                      <th className="p-3 text-left font-medium text-[#000000D9]">
                        Name
                      </th>
                      <th className="p-3 text-left font-medium text-[#000000D9]">
                        Serial Number
                      </th>
                      <th className="p-3 text-left font-medium text-[#000000D9]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
                    {inverters.map((device) => {
                      const isOnline = device.status.toLowerCase() === "online";
                      return (
                        <tr key={device.serialNumber} className="hover:bg-[#fafafa] transition">
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={selected.some((d) => d.serialNumber === device.serialNumber)}
                              onChange={() => toggleDevice(device)}
                              className="rounded border-[#d9d9d9] text-[#1890ff] focus:ring-[#1890ff]"
                            />
                          </td>
                          <td className="p-3 text-[#000000D9]">{device.name}</td>
                          <td className="p-3 font-mono text-[#000000D9]">{device.serialNumber}</td>
                          <td className="p-3">
                            <span className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isOnline ? "bg-[#52c41a]" : "bg-[#d9d9d9]"
                                }`}
                              />
                              <span className="text-[#000000D9]">{device.status}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {!invertersQuery.isLoading && inverters.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-[rgba(0,0,0,0.45)]">
                          No devices found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION - BOTTOM */}
              <div className="flex justify-center sm:justify-end px-4 py-4 border-t border-[rgba(0,0,0,0.06)]">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </>
        )}

        {mode === "upload" && (
          <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[2px] p-6 space-y-6">
            <div>
              <p className="text-[14px] text-[#000000D9] mb-1">
                Upload an .xlsx sheet with <strong>Serial No</strong> and{" "}
                <strong>Name</strong> columns. Every device in the file is shown below
                and added to your selection.
              </p>
              <p className="text-[12px] text-[rgba(0,0,0,0.45)]">Max file size 5MB.</p>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-28 border border-dashed border-[#d9d9d9] rounded-[2px] flex flex-col items-center justify-center bg-[#fafafa] text-center px-4 cursor-pointer hover:border-[#1890ff] transition gap-1"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleFileSelected}
              />
              <UploadCloud size={20} className="text-[rgba(0,0,0,0.45)]" />
              {uploadFile ? (
                <p className="text-[14px] text-[#1890ff]">{uploadFile.name}</p>
              ) : (
                <p className="text-[14px] text-[rgba(0,0,0,0.65)]">Click to choose a .xlsx file</p>
              )}
            </div>

            {uploadMutation.isPending && (
              <div className="flex items-center gap-2 text-[13px] text-[rgba(0,0,0,0.65)]">
                <span className="w-3.5 h-3.5 border-2 border-[#d9d9d9] border-t-[#1890ff] rounded-full animate-spin" />
                Uploading and validating...
              </div>
            )}

            {uploadMutation.isError && (
              <p className="text-[13px] text-[#ff4d4f]">
                {uploadMutation.error instanceof Error ? uploadMutation.error.message : "Upload failed."}
              </p>
            )}

            {uploadMutation.isSuccess && (
              <div className="space-y-4 pt-2 border-t border-[rgba(0,0,0,0.06)]">
                <p className="text-[13px] text-[#000000D9]">
                  <span className="text-[#52c41a] font-medium">
                    {uploadMutation.data.devices.length} device{uploadMutation.data.devices.length === 1 ? "" : "s"}
                  </span>{" "}
                  found in the file and added to your selection.
                </p>

                <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[2px] overflow-hidden">
                  <div className="overflow-x-auto max-h-80 overflow-y-auto">
                    <table className="w-full text-[14px] border-collapse">
                      <thead className="bg-[#fafafa] text-[#000000D9] sticky top-0">
                        <tr>
                          <th className="p-3 w-12" />
                          <th className="p-3 text-left font-medium text-[#000000D9]">Name</th>
                          <th className="p-3 text-left font-medium text-[#000000D9]">Serial Number</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
                        {uploadMutation.data.devices.map((device) => (
                          <tr key={device.serialNumber} className="hover:bg-[#fafafa] transition">
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={selected.some((d) => d.serialNumber === device.serialNumber)}
                                onChange={() =>
                                  toggleDevice({
                                    id: device.serialNumber,
                                    name: device.name || device.serialNumber,
                                    serialNumber: device.serialNumber,
                                    status: "—",
                                  })
                                }
                                className="rounded border-[#d9d9d9] text-[#1890ff] focus:ring-[#1890ff]"
                              />
                            </td>
                            <td className="p-3 text-[#000000D9]">{device.name || "—"}</td>
                            <td className="p-3 font-mono text-[#000000D9]">{device.serialNumber}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FOOTER with Cancel/OK */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] text-[rgba(0,0,0,0.45)]">
            {selected.length} device(s) selected
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="h-8 px-6 text-[14px] rounded-[2px] border border-[#d9d9d9] text-[#000000D9] hover:border-[#1890ff] hover:text-[#1890ff] transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(selected);
                onClose();
              }}
              className="h-8 px-6 text-[14px] rounded-[2px] bg-[#1890ff] text-white hover:bg-[#40a9ff] transition"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
