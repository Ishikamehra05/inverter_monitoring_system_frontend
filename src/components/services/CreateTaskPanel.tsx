"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Trash2 } from "lucide-react";
import DeviceSelectorPanel from "./DeviceSelectorPanel";

export default function CreateTaskPanel({ onClose }: { onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isVerifyOpen, setIsVerifyOpen] = useState(true);
  const [deviceMode, setDeviceMode] = useState<"select" | "upload">("select");
  const [firmwares, setFirmwares] = useState([1]);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  
  // Form state
  const [taskName, setTaskName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [firmwareSelections, setFirmwareSelections] = useState<string[]>([""]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Validation errors
  const [errors, setErrors] = useState({
    taskName: "",
    firmwares: "",
    startTime: "",
    devices: ""
  });

  useEffect(() => {
    document.body.classList.add("body-no-scroll");
    return () => {
      document.body.classList.remove("body-no-scroll");
    };
  }, []);

  const addFirmware = () => {
    setFirmwares((prev) => [...prev, prev.length + 1]);
    setFirmwareSelections((prev) => [...prev, ""]);
  };

  const removeFirmware = (index: number) => {
    setFirmwares((prev) => prev.filter((_, i) => i !== index));
    setFirmwareSelections((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFirmwareSelection = (index: number, value: string) => {
    const updated = [...firmwareSelections];
    updated[index] = value;
    setFirmwareSelections(updated);
  };

  const validateStep1 = () => {
    const newErrors = {
      taskName: "",
      firmwares: "",
      startTime: "",
      devices: ""
    };
    let isValid = true;

    // Validate Task Name
    if (!taskName.trim()) {
      newErrors.taskName = "Task name is required";
      isValid = false;
    }

    // Validate Firmwares - at least one firmware selected
    const hasValidFirmware = firmwareSelections.some(fw => fw.trim() !== "");
    if (!hasValidFirmware) {
      newErrors.firmwares = "At least one firmware package is required";
      isValid = false;
    }

    // Validate Start Time
    if (!startTime) {
      newErrors.startTime = "Start time is required";
      isValid = false;
    }

    // Validate Devices based on mode
    if (deviceMode === "select" && selectedDevices.length === 0) {
      newErrors.devices = "Please select at least one device";
      isValid = false;
    } else if (deviceMode === "upload" && !uploadedFile) {
      newErrors.devices = "Please upload a device file";
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  // Dummy firmware options
  const firmwareOptions = [
    "Firmware v1.0.0",
    "Firmware v1.1.0", 
    "Firmware v1.2.0",
    "Firmware v2.0.0",
    "Firmware v2.1.0"
  ];

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

                      {/* FIRMWARE SECTION */}
                      <div className="space-y-5">
                        <p className="text-[14px] font-medium text-[rgba(0,0,0,0.65)]">
                          Firmware Package <span className="text-[#ff4d4f]">*</span>
                        </p>

                        {firmwares.map((fw, index) => (
                          <div key={index} className="space-y-2">
                            <label className="text-[14px] text-[rgba(0,0,0,0.65)]">
                              Sequence {fw}-Firmware
                            </label>

                            <div className="flex items-center gap-3">
                              <select
                                value={firmwareSelections[index] || ""}
                                onChange={(e) => updateFirmwareSelection(index, e.target.value)}
                                className="flex-1 h-8 px-[11px] text-[14px] border border-[#d9d9d9] rounded-[2px] focus:outline-none focus:border-[#40a9ff]"
                              >
                                <option value="">Please select firmware</option>
                                {firmwareOptions.map((option, i) => (
                                  <option key={i} value={option}>{option}</option>
                                ))}
                              </select>

                              {firmwares.length > 1 && (
                                <button
                                  onClick={() => removeFirmware(index)}
                                  className="text-[rgba(0,0,0,0.45)] hover:text-[#ff4d4f] transition"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {errors.firmwares && (
                          <p className="text-[12px] text-[#ff4d4f]">{errors.firmwares}</p>
                        )}

                        <button
                          onClick={addFirmware}
                          className="w-full h-8 text-[14px] border border-dashed border-[#d9d9d9] rounded-[2px] bg-white hover:border-[#1890ff] hover:text-[#1890ff] transition"
                        >
                          + Add Firmware
                        </button>
                      </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="space-y-6">
                      {/* START TIME */}
                      <div className="space-y-2">
                        <label className="text-[14px] text-[rgba(0,0,0,0.65)]">
                          <span className="text-[#ff4d4f]">*</span> Task Start Time
                        </label>

                        <input
                          type="datetime-local"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className={`w-full h-8 px-[11px] text-[14px] border ${
                            errors.startTime ? "border-[#ff4d4f]" : "border-[#d9d9d9]"
                          } rounded-[2px] focus:outline-none focus:border-[#40a9ff] focus:ring-2 focus:ring-[#1890ff]/20 transition`}
                        />
                        {errors.startTime && (
                          <p className="text-[12px] text-[#ff4d4f]">{errors.startTime}</p>
                        )}
                      </div>

                      {/* DEVICE MODE */}
                      <div className="space-y-4">
                        <div className="flex gap-6 text-[14px]">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={deviceMode === "select"}
                              onChange={() => setDeviceMode("select")}
                            />
                            Select Devices
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={deviceMode === "upload"}
                              onChange={() => setDeviceMode("upload")}
                            />
                            Upload Devices
                          </label>
                        </div>

                        {deviceMode === "select" && (
                          <div className="space-y-2">
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
                                placeholder="Please click right side to select devices"
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
                        )}

                        {deviceMode === "upload" && (
                          <div className="space-y-2">
                            <div 
                              className={`h-28 border border-dashed ${
                                errors.devices ? "border-[#ff4d4f]" : "border-[#d9d9d9]"
                              } rounded-[2px] flex flex-col items-center justify-center bg-white text-center px-4 cursor-pointer hover:border-[#1890ff] transition relative`}
                              onClick={() => document.getElementById('file-upload')?.click()}
                            >
                              <input
                                id="file-upload"
                                type="file"
                                accept=".xlsx"
                                className="hidden"
                                onChange={handleFileUpload}
                              />
                              {uploadedFile ? (
                                <p className="text-[14px] text-[#1890ff]">{uploadedFile.name}</p>
                              ) : (
                                <>
                                  <p className="text-[14px] font-medium text-[rgba(0,0,0,0.85)]">
                                    Click to upload file
                                  </p>
                                  <p className="text-[12px] text-[rgba(0,0,0,0.45)]">
                                    (Currently only supports .xlsx format files)
                                  </p>
                                </>
                              )}
                            </div>
                            {errors.devices && (
                              <p className="text-[12px] text-[#ff4d4f]">{errors.devices}</p>
                            )}
                          </div>
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
                              SN
                            </th>
                            <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                              Pass
                            </th>
                            <th className="px-6 py-3 text-left border-b border-[rgba(0,0,0,0.06)]">
                              Info
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          <tr className="hover:bg-[#fafafa] transition">
                            <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)]">
                              2248-50900391P
                            </td>
                            <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] text-[#52c41a]">
                              ✔
                            </td>
                            <td className="px-6 py-4 border-b border-[rgba(0,0,0,0.06)] text-[rgba(0,0,0,0.45)]">
                              -
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-end px-6 py-4 text-[rgba(0,0,0,0.45)] text-sm border-b border-[rgba(0,0,0,0.06)]">
                      1-1 of 1 items
                    </div>
                  </>
                )}

                {/* Step 2 Footer - Bottom Right */}
                <div className="flex justify-end gap-4 p-6">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 h-8 text-[14px] rounded-[2px] border border-[#d9d9d9] text-[rgba(0,0,0,0.65)] hover:border-[#1890ff] hover:text-[#1890ff] transition"
                  >
                    ← Previous
                  </button>

                  <button className="px-6 h-8 text-[14px] rounded-[2px] bg-[#1890ff] text-white hover:bg-[#40a9ff] transition">
                    Submit
                  </button>
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
        />
      )}
    </>
  );
}