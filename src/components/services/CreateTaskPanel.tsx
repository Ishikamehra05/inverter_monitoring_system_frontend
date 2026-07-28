"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Calendar } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format, formatISO, isSameDay, parseISO, startOfToday } from "date-fns";
import DeviceSelectorPanel from "./DeviceSelectorPanel";
import type { InverterSummary } from "@/lib/api/schemas/devices";
import { useFirmware, useCreateUpgradeTask } from "@/hooks/api/useService";

const START_TIME_REQUIRED_MESSAGE = "Please select a future date and time.";

// Calendar-only start-time picker: no text entry anywhere. The calendar
// (react-date-range) disables past dates via minDate; hour/minute selects
// disable past values when today is picked; Apply is disabled as a final
// guard against the value going stale between opening the popover and
// committing it. Stores/returns a Date — the parent converts to/from the
// ISO-with-offset string (e.g. 2026-07-28T10:30:00+05:30) via date-fns.
function StartTimePicker({
  value,
  onChange,
  error,
}: {
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(value ?? new Date());
  const [draftHour, setDraftHour] = useState<number>((value ?? new Date()).getHours());
  const [draftMinute, setDraftMinute] = useState<number>((value ?? new Date()).getMinutes());

  const openPicker = () => {
    const base = value ?? new Date();
    setDraftDate(base);
    setDraftHour(base.getHours());
    setDraftMinute(base.getMinutes());
    setOpen(true);
  };

  const now = new Date();
  const isDraftToday = isSameDay(draftDate, now);

  const draftCombined = new Date(draftDate);
  draftCombined.setHours(draftHour, draftMinute, 0, 0);
  const isDraftInFuture = draftCombined.getTime() > now.getTime();

  const handleApply = () => {
    if (!isDraftInFuture) return;
    onChange(draftCombined);
    setOpen(false);
  };

  // Picking a date closes the popover immediately, using whichever time is
  // currently set (defaults to "now"). If that combination isn't valid yet
  // (rare — e.g. popover sat open past midnight into a stale past time),
  // stay open so the time can still be adjusted via Apply instead.
  const handleDateSelect = (date: Date) => {
    setDraftDate(date);
    const combined = new Date(date);
    combined.setHours(draftHour, draftMinute, 0, 0);
    if (combined.getTime() > Date.now()) {
      onChange(combined);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        readOnly
        onClick={openPicker}
        // While the popover is open, show the live draft (updates the instant a
        // date/hour/minute is picked) instead of only the last-committed value —
        // otherwise clicking a date gives no visible feedback until Apply.
        value={
          open
            ? format(draftCombined, "yyyy-MM-dd HH:mm")
            : value
              ? format(value, "yyyy-MM-dd HH:mm")
              : ""
        }
        placeholder="Please select start date & time"
        className={`w-full h-8 px-[11px] text-[14px] border ${
          error ? "border-[#ff4d4f]" : "border-[#d9d9d9]"
        } rounded-[2px] cursor-pointer bg-white focus:outline-none focus:border-[#40a9ff] focus:ring-2 focus:ring-[#1890ff]/20 transition`}
      />

      {open && (
        <div className="absolute z-30 mt-2 bg-white shadow-lg border border-[rgba(0,0,0,0.06)] rounded-[2px]">
          <Calendar date={draftDate} onChange={handleDateSelect} minDate={startOfToday()} />

          <div className="flex items-center gap-2 px-4 py-3 border-t border-[rgba(0,0,0,0.06)]">
            <span className="text-[12px] text-[rgba(0,0,0,0.65)]">Time:</span>
            <select
              value={draftHour}
              onChange={(e) => setDraftHour(Number(e.target.value))}
              className="h-8 px-2 text-[14px] border border-[#d9d9d9] rounded-[2px] focus:outline-none focus:border-[#40a9ff]"
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h} disabled={isDraftToday && h < now.getHours()}>
                  {String(h).padStart(2, "0")}
                </option>
              ))}
            </select>
            <span className="text-[14px] text-[rgba(0,0,0,0.65)]">:</span>
            <select
              value={draftMinute}
              onChange={(e) => setDraftMinute(Number(e.target.value))}
              className="h-8 px-2 text-[14px] border border-[#d9d9d9] rounded-[2px] focus:outline-none focus:border-[#40a9ff]"
            >
              {Array.from({ length: 60 }, (_, m) => (
                <option
                  key={m}
                  value={m}
                  disabled={isDraftToday && draftHour === now.getHours() && m < now.getMinutes()}
                >
                  {String(m).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>

          {!isDraftInFuture && (
            <p className="px-4 pb-2 text-[12px] text-[#ff4d4f]">{START_TIME_REQUIRED_MESSAGE}</p>
          )}

          <div className="flex justify-end gap-2 px-4 py-3 border-t border-[rgba(0,0,0,0.06)]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-8 px-4 text-[14px] border border-[#d9d9d9] rounded-[2px] hover:border-[#1890ff] hover:text-[#1890ff] transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!isDraftInFuture}
              className="h-8 px-4 text-[14px] rounded-[2px] bg-[#1890ff] text-white hover:bg-[#40a9ff] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Apply
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-[12px] text-[#ff4d4f] mt-1">{error}</p>}
    </div>
  );
}

export default function CreateTaskPanel({
  onClose,
  targetEndUserId,
}: {
  onClose: () => void;
  targetEndUserId?: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isVerifyOpen, setIsVerifyOpen] = useState(true);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<InverterSummary[]>([]);
  const [step, setStep] = useState(1);

  // Form state
  const [taskName, setTaskName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [selectedFirmwareId, setSelectedFirmwareId] = useState("");
  const [updateType, setUpdateType] = useState<"" | "NORMAL" | "FORCE">("");
  const [currentFirmware, setCurrentFirmware] = useState("");

  // Firmware Package dropdown — sourced from the real firmware catalog.
  // Chip Type is intrinsic to whichever firmware is picked (firmware.chip_type
  // already exists in the DB), so it's shown inline in the option label rather
  // than as its own field. Update Type and Current Firmware are NOT stored on
  // the firmware catalog row — they're per-job choices, so they stay independent inputs.
  const firmwareQuery = useFirmware({ pageSize: 100 });
  const firmwareOptions = firmwareQuery.data?.items ?? [];

  // Validation errors
  const [errors, setErrors] = useState({
    taskName: "",
    firmwares: "",
    updateType: "",
    startTime: "",
    devices: ""
  });

  useEffect(() => {
    document.body.classList.add("body-no-scroll");
    return () => {
      document.body.classList.remove("body-no-scroll");
    };
  }, []);

  const validateStep1 = () => {
    const newErrors = {
      taskName: "",
      firmwares: "",
      updateType: "",
      startTime: "",
      devices: ""
    };
    let isValid = true;

    // Validate Task Name
    if (!taskName.trim()) {
      newErrors.taskName = "Task name is required";
      isValid = false;
    }

    // Validate Firmware Package — exactly one selection required
    if (!selectedFirmwareId) {
      newErrors.firmwares = "Firmware package is required";
      isValid = false;
    }

    // Validate Update Type
    if (!updateType) {
      newErrors.updateType = "Update type is required";
      isValid = false;
    }

    // Validate Start Time — required, and must be in the future
    if (!startTime || parseISO(startTime).getTime() <= Date.now()) {
      newErrors.startTime = START_TIME_REQUIRED_MESSAGE;
      isValid = false;
    }

    // Validate Devices
    if (selectedDevices.length === 0) {
      newErrors.devices = "Please select at least one device";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const createUpgradeTaskMutation = useCreateUpgradeTask();
  const [submitError, setSubmitError] = useState("");

  // plantId/loggerImei/firmwareUrl are omitted here — the backend defaults
  // them (placeholder plant / "-1" / "http://-1") until the inverter->logger
  // ->plant join and a real firmware download URL exist. See
  // coding_action/Zcreate-job-01.md.
  const handleSubmit = async () => {
    setSubmitError("");
    const firmware = firmwareOptions.find((item) => item.id === selectedFirmwareId);
    if (!firmware || !firmware.chipType || !updateType) {
      setSubmitError("Missing required task info — please go back to Step 1.");
      return;
    }

    try {
      await createUpgradeTaskMutation.mutateAsync({
        name: taskName,
        newFirmwareVersion: firmware.version,
        firmwareId: firmware.id,
        chipType: firmware.chipType,
        updateType,
        devices: selectedDevices.map((device) => ({
          inverterSerialNo: device.serialNumber,
          ...(currentFirmware.trim() ? { currentFirmware: currentFirmware.trim() } : {}),
        })),
      });
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit task. Please try again."
      );
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#f5f5f5] overflow-y-auto">
        {/* HEADER */}
        <div className="bg-white border-b border-[rgba(0,0,0,0.06)] px-4 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-[16px] font-medium text-[rgba(0,0,0,0.85)]">
            Task Info
          </h2>
          <button
            onClick={onClose}
            className="h-8 px-4 text-[14px] rounded-[2px] border border-[#d9d9d9] text-[rgba(0,0,0,0.65)] hover:border-[#1890ff] hover:text-[#1890ff] transition"
          >
            Close
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-4 sm:px-8 py-8 space-y-10 max-w-6xl mx-auto">
          {/* STEP INDICATOR WITH CONNECTING LINE - LEFT TO RIGHT */}
          <div className="flex items-center justify-start">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-full text-sm flex items-center justify-center ${
                  step >= 1
                    ? "bg-[#1890ff] text-white"
                    : "border border-[#d9d9d9] text-[rgba(0,0,0,0.65)]"
                }`}
              >
                {step > 1 ? "✓" : "1"}
              </div>
              <span className="text-[14px] font-medium text-[rgba(0,0,0,0.85)]">
                Step 1
              </span>
            </div>

            {/* Connecting Line - 100px wide blue line */}
            <div className="w-[100px] h-[2px] mx-4 bg-[#1890ff]"></div>

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-full text-sm flex items-center justify-center ${
                  step === 2
                    ? "bg-[#1890ff] text-white"
                    : step > 2
                    ? "bg-[#1890ff] text-white"
                    : "border border-[#d9d9d9] text-[rgba(0,0,0,0.65)]"
                }`}
              >
                {step > 2 ? "✓" : "2"}
              </div>
              <span className="text-[14px] text-[rgba(0,0,0,0.65)]">
                Step 2
              </span>
            </div>
          </div>

          {/* ACCORDION - Changes based on step */}
          <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[2px] overflow-hidden">
            {/* STEP 1 CONTENT */}
            {step === 1 && (
              <>
                <div
                  onClick={() => setIsOpen(!isOpen)}
                  className="px-6 py-5 border-b border-[rgba(0,0,0,0.06)] flex items-center gap-3 cursor-pointer"
                >
                  <ChevronRight
                    size={18}
                    className={`transition-transform ${isOpen ? "rotate-90" : ""}`}
                  />
                  <h3 className="text-[14px] font-medium text-[rgba(0,0,0,0.85)]">
                    Enter Info
                  </h3>
                </div>

                {isOpen && (
                  <div className="px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* LEFT SIDE */}
                    <div className="space-y-6">
                      {/* TASK NAME */}
                      <div className="space-y-2">
                        <label className="text-[14px] text-[rgba(0,0,0,0.65)]">
                          <span className="text-[#ff4d4f]">*</span> Task Name
                        </label>
                        <input
                          value={taskName}
                          onChange={(e) => setTaskName(e.target.value)}
                          className={`w-full h-8 px-[11px] text-[14px] border ${
                            errors.taskName ? "border-[#ff4d4f]" : "border-[#d9d9d9]"
                          } rounded-[2px] focus:outline-none focus:border-[#40a9ff] focus:ring-2 focus:ring-[#1890ff]/20 transition`}
                          placeholder="Please Input Task Name"
                        />
                        {errors.taskName && (
                          <p className="text-[12px] text-[#ff4d4f]">{errors.taskName}</p>
                        )}
                      </div>

                      {/* FIRMWARE PACKAGE SECTION */}
                      <div className="space-y-5">
                        <p className="text-[14px] font-medium text-[rgba(0,0,0,0.65)]">
                          Firmware Package
                        </p>

                        {/* Firmware Package — single select, sourced from the real firmware catalog */}
                        <div className="space-y-2">
                          <label className="text-[14px] text-[rgba(0,0,0,0.65)]">
                            <span className="text-[#ff4d4f]">*</span> Firmware Package
                          </label>
                          <select
                            value={selectedFirmwareId}
                            onChange={(e) => setSelectedFirmwareId(e.target.value)}
                            disabled={firmwareQuery.isLoading}
                            className={`w-full h-8 px-[11px] text-[14px] border ${
                              errors.firmwares ? "border-[#ff4d4f]" : "border-[#d9d9d9]"
                            } rounded-[2px] focus:outline-none focus:border-[#40a9ff]`}
                          >
                            <option value="">
                              {firmwareQuery.isLoading
                                ? "Loading firmware..."
                                : "Please select firmware package"}
                            </option>
                            {firmwareOptions.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.version})
                                {item.chipType ? ` — ${item.chipType}` : ""}
                              </option>
                            ))}
                          </select>
                          {firmwareQuery.isError && (
                            <p className="text-[12px] text-[#ff4d4f]">
                              Unable to load firmware list.
                            </p>
                          )}
                          {errors.firmwares && (
                            <p className="text-[12px] text-[#ff4d4f]">{errors.firmwares}</p>
                          )}
                        </div>

                        {/* Update Type — per-job choice, not stored on the firmware catalog row */}
                        <div className="space-y-2">
                          <label className="text-[14px] text-[rgba(0,0,0,0.65)]">
                            <span className="text-[#ff4d4f]">*</span> Update Type
                          </label>
                          <div className="flex gap-6 text-[14px]">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                checked={updateType === "NORMAL"}
                                onChange={() => setUpdateType("NORMAL")}
                              />
                              Normal
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                checked={updateType === "FORCE"}
                                onChange={() => setUpdateType("FORCE")}
                              />
                              Force
                            </label>
                          </div>
                          {errors.updateType && (
                            <p className="text-[12px] text-[#ff4d4f]">{errors.updateType}</p>
                          )}
                        </div>

                        {/* Current Firmware — optional reference; the version already on the
                            device, not something the firmware catalog can supply */}
                        <div className="space-y-2">
                          <label className="text-[14px] text-[rgba(0,0,0,0.65)]">
                            Current Firmware{" "}
                            <span className="text-[12px] text-[rgba(0,0,0,0.45)]">
                              (optional, for reference)
                            </span>
                          </label>
                          <input
                            value={currentFirmware}
                            onChange={(e) => setCurrentFirmware(e.target.value)}
                            placeholder="Existing firmware version on the device"
                            className="w-full h-8 px-[11px] text-[14px] border border-[#d9d9d9] rounded-[2px] focus:outline-none focus:border-[#40a9ff] focus:ring-2 focus:ring-[#1890ff]/20 transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="space-y-6">
                      {/* START TIME */}
                      <div className="space-y-2">
                        <label className="text-[14px] text-[rgba(0,0,0,0.65)]">
                          <span className="text-[#ff4d4f]">*</span> Task Start Time
                        </label>

                        <StartTimePicker
                          value={startTime ? parseISO(startTime) : null}
                          onChange={(date) => setStartTime(formatISO(date))}
                          error={errors.startTime}
                        />
                      </div>

                      {/* DEVICES — one entry point; List vs. Upload is chosen
                          inside the picker itself, not duplicated out here. */}
                      <div className="space-y-2">
                        <label className="text-[14px] text-[rgba(0,0,0,0.65)]">
                          <span className="text-[#ff4d4f]">*</span> Devices
                        </label>
                        <div className="flex">
                          <input
                            readOnly
                            value={
                              selectedDevices.length
                                ? `${selectedDevices.length} device(s) selected`
                                : ""
                            }
                            className={`flex-1 h-8 px-[11px] text-[14px] border ${
                              errors.devices ? "border-[#ff4d4f]" : "border-[#d9d9d9]"
                            } rounded-l-[2px] bg-white truncate`}
                            placeholder="Click to select or upload devices"
                          />

                          <button
                            onClick={() => setShowDeviceSelector(true)}
                            className="h-8 px-4 border border-l-0 border-[#d9d9d9] rounded-r-[2px] hover:bg-[#fafafa]"
                          >
                            📋
                          </button>
                        </div>
                        {errors.devices && (
                          <p className="text-[12px] text-[#ff4d4f]">{errors.devices}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* FOOTER */}
                <div className="flex justify-end p-6 border-t border-[rgba(0,0,0,0.06)]">
                  <button
                    onClick={handleNext}
                    className="px-8 h-8 text-[14px] rounded-[2px] bg-[#1677ff] text-white hover:bg-[#4096ff] transition"
                  >
                    Next →
                  </button>
                </div>
              </>
            )}

            {/* STEP 2 CONTENT */}
            {step === 2 && (
              <>
                {/* Verify Info Accordion Header */}
                <div
                  onClick={() => setIsVerifyOpen(!isVerifyOpen)}
                  className="px-6 py-5 border-b border-[rgba(0,0,0,0.06)] flex items-center gap-3 cursor-pointer"
                >
                  <ChevronRight
                    size={18}
                    className={`transition-transform ${isVerifyOpen ? "rotate-90" : ""}`}
                  />
                  <h3 className="text-[14px] font-medium text-[rgba(0,0,0,0.85)]">
                    Verify Info
                  </h3>
                </div>

                {/* Accordion Content - Table */}
                {isVerifyOpen && (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-[600px] w-full text-[14px]">
                        <thead className="bg-[#fafafa] text-[rgba(0,0,0,0.65)]">
                          <tr>
                            <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                              Serial Number
                            </th>
                            <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {selectedDevices.map((device) => {
                            const isOnline = device.status.toLowerCase() === "online";
                            return (
                              <tr key={device.serialNumber} className="hover:bg-[#fafafa] transition">
                                <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
                                  {device.name}
                                </td>
                                <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] font-mono">
                                  {device.serialNumber}
                                </td>
                                <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
                                  <span className="flex items-center gap-2">
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        isOnline ? "bg-[#52c41a]" : "bg-[#d9d9d9]"
                                      }`}
                                    />
                                    {device.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {selectedDevices.length === 0 && (
                            <tr>
                              <td
                                colSpan={3}
                                className="px-6 py-6 text-center text-[rgba(0,0,0,0.45)] border-b border-[rgba(0,0,0,0.06)]"
                              >
                                No devices selected.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Count */}
                    <div className="flex justify-end px-6 py-4 text-[rgba(0,0,0,0.45)] text-sm border-b border-[rgba(0,0,0,0.06)]">
                      {selectedDevices.length} item{selectedDevices.length === 1 ? "" : "s"}
                    </div>
                  </>
                )}

                {/* Step 2 Footer - Bottom Right */}
                <div className="flex flex-col items-end gap-2 p-6">
                  {submitError && (
                    <p className="text-[12px] text-[#ff4d4f]">{submitError}</p>
                  )}
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setStep(1)}
                      disabled={createUpgradeTaskMutation.isPending}
                      className="px-6 h-8 text-[14px] rounded-[2px] border border-[#d9d9d9] text-[rgba(0,0,0,0.65)] hover:border-[#1890ff] hover:text-[#1890ff] transition disabled:opacity-50"
                    >
                      ← Previous
                    </button>

                    <button
                      onClick={handleSubmit}
                      disabled={createUpgradeTaskMutation.isPending}
                      className="px-6 h-8 text-[14px] rounded-[2px] bg-[#1890ff] text-white hover:bg-[#40a9ff] transition disabled:opacity-60"
                    >
                      {createUpgradeTaskMutation.isPending ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showDeviceSelector && (
        <DeviceSelectorPanel
          selectedDevices={selectedDevices}
          onClose={() => setShowDeviceSelector(false)}
          onConfirm={(devices) => setSelectedDevices(devices)}
          targetEndUserId={targetEndUserId}
        />
      )}
    </>
  );
}