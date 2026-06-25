"use client";

import { useEffect, useState } from "react";
import { ChevronRight, CheckCircle, XCircle } from "lucide-react";
import DeviceSelectorPanel from "@/components/services/DeviceSelectorPanel";

// Mock compliance check – replace with your real logic
const isDeviceCompliant = (deviceSn: string, model?: string) => {
  if (deviceSn.includes("2222")) return false;
  if (model && model.startsWith("G")) return false;
  return true;
};

export default function CreateBatchSettingTaskPanel({
  onClose,
}: {
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isOpen, setIsOpen] = useState(true);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [taskName, setTaskName] = useState("");
  const [settingCommand, setSettingCommand] = useState("");
  const [deviceDetails, setDeviceDetails] = useState<any[]>([]);

  // Mock device details – replace with real API data
  useEffect(() => {
    const mockAllDevices = [
      { sn: "2222-22222222T", model: "-" },
      { sn: "2248-50900391P", model: "G9500-058300-06_111200" },
      { sn: "224650430143p", model: "-" },
      { sn: "2246-50430151P", model: "iS-3K-SM1" },
      { sn: "2247-50410916P", model: "iS-2K-SM1" },
      { sn: "2247-50410900P", model: "iS-2K-SM1" },
    ];
    const filtered = mockAllDevices.filter((d) => selectedDevices.includes(d.sn));
    setDeviceDetails(filtered);
  }, [selectedDevices]);

  // Step 1 validation
  const [touched, setTouched] = useState({
    taskName: false,
    devices: false,
    command: false,
  });
  const isTaskNameValid = taskName.trim().length > 0;
  const isDevicesValid = selectedDevices.length > 0;
  const isCommandValid = settingCommand.trim().length > 0;
  const isStep1Valid = isTaskNameValid && isDevicesValid && isCommandValid;

  const handleNextFromStep1 = () => {
    setTouched({ taskName: true, devices: true, command: true });
    if (isStep1Valid) setStep(2);
  };

  const handleBackToStep1 = () => setStep(1);

  const clearNonCompliantDevices = () => {
    const compliantDevices = deviceDetails
      .filter((d) => isDeviceCompliant(d.sn, d.model))
      .map((d) => d.sn);
    setSelectedDevices(compliantDevices);
  };

  useEffect(() => {
    document.body.classList.add("body-no-scroll");
    return () => document.body.classList.remove("body-no-scroll");
  }, []);

  const hasNonCompliant = deviceDetails.some((d) => !isDeviceCompliant(d.sn, d.model));

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#f5f5f5] overflow-y-auto">
        {/* HEADER */}
        <div className="bg-white border-b border-[rgba(0,0,0,0.06)] px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between">
          <h2 className="text-[16px] font-medium text-[#000000D9]">Task Info</h2>
          <button
            onClick={onClose}
            className="h-8 px-4 text-[14px] rounded-[2px] border border-[#d9d9d9] text-[#000000D9] hover:border-[#1890ff] hover:text-[#1890ff] transition"
          >
            Close
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-5xl mx-auto space-y-8">
          {/* STEP INDICATOR */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-medium ${
                  step === 1
                    ? "bg-[#1890ff] text-white"
                    : "border border-[#d9d9d9] text-[#000000D9]"
                }`}
              >
                1
              </div>
              <span className={`text-[14px] ${step === 1 ? "text-[#000000D9] font-medium" : "text-[#00000073]"}`}>
                Step 1
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-medium ${
                  step === 2
                    ? "bg-[#1890ff] text-white"
                    : "border border-[#d9d9d9] text-[#000000D9]"
                }`}
              >
                2
              </div>
              <span className={`text-[14px] ${step === 2 ? "text-[#000000D9] font-medium" : "text-[#00000073]"}`}>
                Step 2
              </span>
            </div>
          </div>

          {step === 1 && (
            /* ================= STEP 1: ENTER INFO ================= */
            <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[2px] overflow-hidden">
              <div
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 sm:px-8 py-5 border-b border-[rgba(0,0,0,0.06)] flex items-center gap-3 cursor-pointer"
              >
                <ChevronRight
                  size={18}
                  className={`text-[#000000D9] transition-transform duration-200 ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
                <h3 className="text-[14px] font-medium text-[#000000D9]">Enter Info</h3>
              </div>

              {isOpen && (
                <div className="px-4 sm:px-8 py-6 sm:py-10 space-y-6 max-w-xl">
                  {/* Task Name */}
                  <div className="space-y-2">
                    <label className="text-[12px] text-[#000000D9]">
                      <span className="text-[#ff4d4f]">*</span> Task Name
                    </label>
                    <input
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, taskName: true }))}
                      className={`w-full h-10 px-3 text-[14px] border rounded-[2px] focus:outline-none focus:border-[#40a9ff] focus:ring-2 focus:ring-[#1890ff]/20 transition ${
                        touched.taskName && !isTaskNameValid
                          ? "border-[#ff4d4f]"
                          : "border-[#d9d9d9]"
                      }`}
                      placeholder="Please Input Task Name"
                    />
                    {touched.taskName && !isTaskNameValid && (
                      <p className="text-[12px] text-[#ff4d4f] mt-1">Task name is required</p>
                    )}
                  </div>

                  {/* Device List */}
                  <div className="space-y-2">
                    <label className="text-[12px] text-[#000000D9]">
                      <span className="text-[#ff4d4f]">*</span> Device List
                    </label>
                    <div className="flex w-full">
                      <input
                        readOnly
                        value={
                          selectedDevices.length
                            ? `${selectedDevices.length} device(s) selected`
                            : ""
                        }
                        className={`flex-1 h-10 px-3 text-[14px] border rounded-l-[2px] bg-[#f5f5f5] truncate ${
                          touched.devices && !isDevicesValid
                            ? "border-[#ff4d4f]"
                            : "border-[#d9d9d9]"
                        } border-r-0`}
                        placeholder="Please click right side to select devices"
                      />
                      <button
                        onClick={() => setShowDeviceSelector(true)}
                        className="h-10 px-4 border border-[#d9d9d9] rounded-r-[2px] bg-white hover:bg-[#f5f5f5] transition text-[#000000D9]"
                      >
                        📋
                      </button>
                    </div>
                    {touched.devices && !isDevicesValid && (
                      <p className="text-[12px] text-[#ff4d4f] mt-1">At least one device must be selected</p>
                    )}
                  </div>

                  {/* Setting Command */}
                  <div className="space-y-2">
                    <label className="text-[12px] text-[#000000D9]">
                      <span className="text-[#ff4d4f]">*</span> Setting Command
                    </label>
                    <input
                      value={settingCommand}
                      onChange={(e) => setSettingCommand(e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, command: true }))}
                      className={`w-full h-10 px-3 text-[14px] border rounded-[2px] focus:outline-none focus:border-[#40a9ff] focus:ring-2 focus:ring-[#1890ff]/20 transition ${
                        touched.command && !isCommandValid
                          ? "border-[#ff4d4f]"
                          : "border-[#d9d9d9]"
                      }`}
                      placeholder="Please Enter Setting Command"
                    />
                    {touched.command && !isCommandValid && (
                      <p className="text-[12px] text-[#ff4d4f] mt-1">Setting command is required</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            /* ================= STEP 2: VERIFY INFO ================= */
            <div className="space-y-6">
              <h3 className="text-[16px] font-medium text-[#000000D9]">Verify Info</h3>

              {/* Table */}
              <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[2px] overflow-hidden">
                <table className="w-full text-[14px]">
                  <thead className="bg-[#fafafa] text-[#00000073]">
                    <tr>
                      <th className="p-3 text-left font-medium">SN</th>
                      <th className="p-3 text-left font-medium">Pass</th>
                      <th className="p-3 text-left font-medium">Info</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(0,0,0,0.06)]">
                    {deviceDetails.map((device) => {
                      const compliant = isDeviceCompliant(device.sn, device.model);
                      return (
                        <tr key={device.sn}>
                          <td className="p-3 text-[#1890ff] font-mono whitespace-nowrap">
                            {device.sn}
                          </td>
                          <td className="p-3">
                            {compliant ? (
                              <CheckCircle size={18} className="text-[#52c41a]" />
                            ) : (
                              <XCircle size={18} className="text-[#ff4d4f]" />
                            )}
                          </td>
                          <td className="p-3 text-[#000000D9]">
                            {!compliant && (
                              <span className="text-[#ff4d4f]">
                                The old version module does not support this operation. It is recommended to upgrade the module version first.
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Item count */}
                <div className="px-4 py-3 border-t border-[rgba(0,0,0,0.06)] text-[14px] text-[#00000073]">
                  1-{deviceDetails.length} of {deviceDetails.length} items
                </div>
              </div>

              {/* Clear non‑compliant link */}
              {hasNonCompliant && (
                <button
                  onClick={clearNonCompliantDevices}
                  className="text-[#1890ff] text-[14px] hover:text-[#40a9ff] transition"
                >
                  Clear non-compliant devices
                </button>
              )}
            </div>
          )}

          {/* FOOTER buttons */}
          <div className="flex justify-end gap-3">
            {step === 2 && (
              <button
                onClick={handleBackToStep1}
                className="h-10 px-6 text-[14px] rounded-[2px] border border-[#d9d9d9] text-[#000000D9] hover:border-[#1890ff] hover:text-[#1890ff] transition"
              >
                Back
              </button>
            )}
            {step === 1 ? (
              <button
                onClick={handleNextFromStep1}
                disabled={!isStep1Valid}
                className={`h-10 px-8 text-[14px] rounded-[2px] transition ${
                  isStep1Valid
                    ? "bg-[#1890ff] text-white hover:bg-[#40a9ff]"
                    : "bg-[#f5f5f5] text-[#00000073] border border-[#d9d9d9] cursor-not-allowed"
                }`}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={() => {
                  console.log("Submit", { taskName, settingCommand, selectedDevices });
                  onClose();
                }}
                className="h-10 px-8 text-[14px] rounded-[2px] bg-[#1890ff] text-white hover:bg-[#40a9ff] transition"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DEVICE SELECTOR MODAL */}
      {showDeviceSelector && (
        <DeviceSelectorPanel
          selectedDevices={selectedDevices}
          onClose={() => setShowDeviceSelector(false)}
          onConfirm={(devices) => {
            setSelectedDevices(devices);
            setShowDeviceSelector(false);
            setTouched((p) => ({ ...p, devices: true }));
          }}
        />
      )}
    </>
  );
}