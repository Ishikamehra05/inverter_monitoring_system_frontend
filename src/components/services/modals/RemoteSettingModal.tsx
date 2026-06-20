"use client";

import { useState } from "react";
import { X, ChevronDown, Settings2 } from "lucide-react";

interface RemoteSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  sn?: string;
}

type ModalTab =
  | "grid"
  | "feature"
  | "reactive"
  | "powerLimit"
  | "other"
  | "masking";



function FieldInput({
  label,
  placeholder,
}: {
  label: string;
  placeholder?: string;
}) {
  return (
    <div>
      <div className="text-sm text-gray-700 mb-1.5 leading-snug">{label}</div>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full bg-gray-100 border-0 rounded px-3 py-2 text-sm text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1890FF]"
      />
    </div>
  );
}

function FieldSelect({
  label,
  placeholder,
  options = [],
}: {
  label: string;
  placeholder?: string;
  options?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  return (
    <div className="relative">
      <div className="text-sm text-gray-700 mb-1.5 leading-snug">{label}</div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-gray-100 rounded px-3 py-2 text-sm text-left text-gray-400 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#1890FF]"
      >
        <span>{selected || placeholder || ""}</span>
        <ChevronDown size={14} className="text-gray-400 shrink-0" />
      </button>
      {open && options.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-20">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => { setSelected(o); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Toggle({ label }: { label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div>
      <div className="text-sm text-gray-700 mb-2 leading-snug">{label}</div>
      <button
        onClick={() => setOn(!on)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          on ? "bg-[#1890FF]" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            on ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function ActionButton({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="text-sm text-gray-700 mb-2 leading-snug">{label}</div>
      <button className="px-4 py-1.5 text-sm text-gray-500 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
        {text}
      </button>
    </div>
  );
}

// ─── Tab content panels ───────────────────────────────────────────────────────

function GridParametersTab() {
  return (
    <div className="space-y-8">
      {/* Standard Code */}
      <div className="max-w-xs">
        <FieldSelect
          label="Standard Code"
          placeholder="IN (IEC61727)"
          options={["IN (IEC61727)", "EU (EN50549)", "AU (AS4777)"]}
        />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-4 gap-6">
        <FieldInput label="First Connect Delay Time(s)" placeholder="120" />
        <FieldInput label="Reconnect Delay Time(s)" placeholder="120" />
        <FieldInput label="First Connect Power Gradient(%/min)" placeholder="100" />
        <FieldInput label="Reconnect Power Gradient(%/min)" placeholder="100" />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-4 gap-6">
        <FieldInput label="Grid First Connection Voltage High Limit (V)" placeholder="999.9" />
        <FieldInput label="Grid First Connection Voltage Low Limit (V)" placeholder="0" />
        <FieldInput label="Grid First Connection Frequency High Limit (Hz)" placeholder="99.9" />
        <FieldInput label="Grid First Connection Frequency Low Limit (Hz)" placeholder="0" />
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-4 gap-6">
        <FieldInput label="Grid Reconnection Voltage High Limit (V)" placeholder="999.9" />
        <FieldInput label="Grid Reconnection Voltage Low Limit (V)" placeholder="0" />
        <FieldInput label="Grid Reconnection Frequency High Limit (Hz)" placeholder="99.9" />
        <FieldInput label="Grid Reconnection Frequency Low Limit (Hz)" placeholder="0" />
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-4 gap-6">
        <FieldInput label="Frequency High Loss Level_1(Hz)" placeholder="53" />
        <FieldInput label="Frequency Low Loss Level_1(Hz)" placeholder="47" />
        <FieldInput label="Voltage High Loss Level_1(V)" placeholder="280" />
        <FieldInput label="Voltage Low Loss Level_1(V)" placeholder="170" />
      </div>

      {/* Row 5 */}
      <div className="grid grid-cols-4 gap-6">
        <FieldInput label="Frequency High Loss Time Level_1(ms)" placeholder="200" />
        <FieldInput label="Frequency Low Loss Time Level_1(ms)" placeholder="200" />
        <FieldInput label="Voltage High Loss Time Level_1(ms)" placeholder="2000" />
        <FieldInput label="Voltage Low Loss Time Level_1(ms)" placeholder="2000" />
      </div>

      {/* Row 6 - only 2 cols */}
      <div className="grid grid-cols-4 gap-6">
        <FieldInput label="Voltage High Loss Level_2(V)" placeholder="310.5" />
        <FieldInput label="Voltage Low Loss Level_2(V)" placeholder="115" />
      </div>

      {/* Row 7 - only 2 cols */}
      <div className="grid grid-cols-4 gap-6">
        <FieldInput label="Voltage High Loss Time Level_2(ms)" placeholder="50" />
        <FieldInput label="Voltage Low Loss Time Level_2(ms)" placeholder="100" />
      </div>

      {/* Toggles */}
      <div className="space-y-6">
        <Toggle label="Over Frequency Derating Function" />
        <Toggle label="Under Frequency Function" />
        <Toggle label="Over Voltage Derating" />
      </div>
    </div>
  );
}

function FeatureParametersTab() {
  return (
    <div className="space-y-8">
      {/* Toggles row */}
      <div className="grid grid-cols-4 gap-6">
        <Toggle label="Fault ride through function" />
        <Toggle label="Island Detection" />
        <Toggle label="Terminal Resistor" />
      </div>

      {/* Input fields row */}
      <div className="grid grid-cols-4 gap-6">
        <FieldInput label="Derated Power(%)" placeholder="" />
        <FieldInput label="Insulation Impedance(KΩ)" placeholder="" />
        <FieldInput label="Leakage Current Point(mA)" placeholder="" />
        <FieldInput label="Moving Average Voltage Limit(V)" placeholder="" />
      </div>
    </div>
  );
}

function ReactiveTab() {
  return (
    <div className="space-y-8">
      <div className="max-w-xs">
        <FieldInput label="Reactive Power Control Setting Time(s)" placeholder="" />
      </div>
      <div className="max-w-xs">
        <FieldSelect label="Reactive Power Control Mode" options={["Mode 1", "Mode 2", "Mode 3"]} />
      </div>
    </div>
  );
}

function PowerLimitTab() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-6">
        <FieldSelect label="Power Control" options={["Disable", "Enable"]} />
        <FieldSelect label="Meter Location" options={["Grid side", "Load side"]} />
        <FieldSelect label="Power Flow Direction" options={["Export", "Import"]} />
        <FieldInput label="Maximum Feed In Grid Power(W)" placeholder="" />
      </div>
      <div className="max-w-xs">
        <FieldInput label="Modbus address" placeholder="" />
      </div>
    </div>
  );
}

function OtherSettingTab() {
  return (
    <div className="space-y-8">
      {/* Toggles */}
      <div className="grid grid-cols-4 gap-6">
        <Toggle label="AFD Function" />
        <Toggle label="Power On" />
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-6">
        <ActionButton label="AFD Reset" text="Click to confirm" />
        <ActionButton label="Date and Time" text="Click to synchronize" />
        <ActionButton label="Reset" text="Click to confirm" />
        <ActionButton label="Clear All Data" text="Click to confirm" />
      </div>

      {/* Dropdown */}
      <div className="max-w-xs">
        <FieldSelect label="Grid Voltage Type" options={["Single Phase", "Three Phase"]} />
      </div>
    </div>
  );
}

function MaskingFaultTab() {
  const faults = [
    "A3-Grid over frequency",
    "A4-Grid under frequency",
    "B1-PV insulation abnormal",
    "B2-Leakage current abnormal",
    "CL-Inverter in power limit state",
    "B4-PV under voltage",
    "C2-Inverter over dc-bias current",
    "C3-Inverter relay abnormal",
    "Cn-Remote off",
    "CE-Data inconsistency",
    "Bb-AFCI module lost",
    "A8-Grid N abnormal",
  ];
  return (
    <div className="grid grid-cols-4 gap-x-6 gap-y-8">
      {faults.map((f) => (
        <Toggle key={f} label={f} />
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function RemoteSettingModal({
  isOpen,
  onClose,
  sn = "2502-65764179P",
}: RemoteSettingModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("grid");

  if (!isOpen) return null;

  const tabs: { key: ModalTab; label: string }[] = [
    { key: "grid", label: "Grid Parameters" },
    { key: "feature", label: "Feature Parameters" },
    { key: "reactive", label: "Reactive Power Control" },
    { key: "powerLimit", label: "Power Limit" },
    { key: "other", label: "Other Setting" },
    { key: "masking", label: "Masking Fault Detection" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold text-gray-900">Remote Setting</span>
              <span className="text-sm text-gray-500">
                <span className="font-medium text-gray-600">SN:</span>  {sn}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6 flex-shrink-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-4 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  activeTab === tab.key
                    ? "text-[#1890FF] border-b-2 border-[#1890FF]"
                    : "text-gray-600 hover:text-[#1890FF]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
            {activeTab === "grid" && <GridParametersTab />}
            {activeTab === "feature" && <FeatureParametersTab />}
            {activeTab === "reactive" && <ReactiveTab />}
            {activeTab === "powerLimit" && <PowerLimitTab />}
            {activeTab === "other" && <OtherSettingTab />}
            {activeTab === "masking" && <MaskingFaultTab />}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Settings2 size={15} className="text-[#1890FF] shrink-0" />
              <span>
                The parameters are loading.When setting multiple parameters, the time will increase proportionally.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <button className="px-5 py-1.5 text-sm text-gray-500 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                Read
              </button>
              <button className="px-5 py-1.5 text-sm text-gray-500 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}