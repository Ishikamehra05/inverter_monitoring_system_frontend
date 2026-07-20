"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, ChevronDown, Settings2 } from "lucide-react";
import type { z } from "zod";
import {
  useRemoteSettingsTab,
  useSubmitRemoteCommand,
  useSubmitRemoteSettingsTab,
} from "@/hooks/api/useDevices";
import {
  featureParametersSchema,
  gridParametersSchema,
  maskingFaultDetectionSchema,
  otherSettingSchema,
  powerLimitSchema,
  reactivePowerControlSchema,
  type FeatureParameters,
  type GridParameters,
  type MaskingFaultDetection,
  type OtherSetting,
  type PowerLimit,
  type ReactivePowerControl,
  type RemoteSettings,
  type RemoteSettingsCommand,
  type RemoteSettingsTabEntry,
  type RemoteSettingsTabKey,
} from "@/lib/api/schemas/devices";
import {
  validateRemoteSettings,
  type FieldErrors,
} from "@/lib/validation/remoteSettings";

interface RemoteSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceId?: string;
  plantId?: string;
  sn?: string;
  targetEndUserId?: string;
}

type ModalTab =
  | "grid"
  | "feature"
  | "reactive"
  | "powerLimit"
  | "other"
  | "masking";

const STANDARD_CODE_OPTIONS: { value: "IN" | "EU" | "AU"; label: string }[] = [
  { value: "IN", label: "IN (IEC61727)" },
  { value: "EU", label: "EU (EN50549)" },
  { value: "AU", label: "AU (AS4777)" },
];

const toOptions = (values: string[]) =>
  values.map((v) => ({ value: v, label: v }));

const FAULT_FIELDS: { key: keyof MaskingFaultDetection; label: string }[] = [
  { key: "a3", label: "A3-Grid over frequency" },
  { key: "a4", label: "A4-Grid under frequency" },
  { key: "b1", label: "B1-PV insulation abnormal" },
  { key: "b2", label: "B2-Leakage current abnormal" },
  { key: "cl", label: "CL-Inverter in power limit state" },
  { key: "b4", label: "B4-PV under voltage" },
  { key: "c2", label: "C2-Inverter over dc-bias current" },
  { key: "c3", label: "C3-Inverter relay abnormal" },
  { key: "cn", label: "Cn-Remote off" },
  { key: "ce", label: "CE-Data inconsistency" },
  { key: "bb", label: "Bb-AFCI module lost" },
  { key: "a8", label: "A8-Grid N abnormal" },
];

// Each tab is its own backend entity — this pairs the UI tab key with the
// exact settings-object key/slug the API expects for that entity.
const TABS: { key: ModalTab; label: string; settingsKey: RemoteSettingsTabKey }[] = [
  { key: "grid", label: "Grid Parameters", settingsKey: "gridParameters" },
  { key: "feature", label: "Feature Parameters", settingsKey: "featureParameters" },
  { key: "reactive", label: "Reactive Power Control", settingsKey: "reactivePowerControl" },
  { key: "powerLimit", label: "Power Limit", settingsKey: "powerLimit" },
  { key: "other", label: "Other Setting", settingsKey: "otherSetting" },
  { key: "masking", label: "Masking Fault Detection", settingsKey: "maskingFaultDetection" },
];

function buildTabEntry(tab: ModalTab, settings: RemoteSettings): RemoteSettingsTabEntry {
  switch (tab) {
    case "grid":
      return { tab: "gridParameters", settings: settings.gridParameters ?? {} };
    case "feature":
      return { tab: "featureParameters", settings: settings.featureParameters ?? {} };
    case "reactive":
      return { tab: "reactivePowerControl", settings: settings.reactivePowerControl ?? {} };
    case "powerLimit":
      return { tab: "powerLimit", settings: settings.powerLimit ?? {} };
    case "other":
      return { tab: "otherSetting", settings: settings.otherSetting ?? {} };
    case "masking":
      return { tab: "maskingFaultDetection", settings: settings.maskingFaultDetection ?? {} };
  }
}

// The GET response carries backend-only metadata alongside the real
// settings fields (e.g. `registers`, `read_pattern` — Modbus register
// mapping for engineers/downstream tooling, not form data). Parsing
// through the tab's own schema strips anything that isn't a real field,
// so it never round-trips back into a POST body via Upload.
// function parseTabSettings<T>(schema: z.ZodType<T>, data: unknown): T {
//   const result = schema.safeParse(data);
//   return result.success ? result.data : ({} as T);
// }

function transformSettings(data: any) {
  const rawSettings = Array.isArray(data?.rawSettings)
    ? data.rawSettings
    : [];

  const obj = Object.fromEntries(
    rawSettings.map((item: any) => [
      item.fieldKey,
      item.value,
    ])
  );

  const standardCodeMap: Record<number, "IN" | "EU" | "AU"> = {
    94: "IN",
    95: "EU",
    96: "AU",
  };

  obj.standardCode = standardCodeMap[obj.standardCode];

  // obj.overFrequencyDeratingFunction =
  //   obj.overFrequencyDeratingFunction === 1;

  // obj.underFrequencyFunction =
  //   obj.underFrequencyFunction === 1;

  // obj.overVoltageDerating =
  //   obj.overVoltageDerating === 1;

  return obj;
}
function parseTabSettings<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  // console.log("safeParse result:", result);

  return result.success ? result.data : ({} as T);
}

// function applyTabData(tab: ModalTab, data: unknown, prev: RemoteSettings): RemoteSettings {
//   switch (tab) {
//     case "grid":
//       return {
//         ...prev,
//         gridParameters: parseTabSettings(
//           gridParametersSchema,
//           transformSettings(data)
//         )
//       };
//     // case "grid":
//     //   return { ...prev, gridParameters: parseTabSettings(gridParametersSchema, data) };
//     case "feature":
//       return { ...prev, featureParameters: parseTabSettings(featureParametersSchema, data) };
//     case "reactive":
//       return { ...prev, reactivePowerControl: parseTabSettings(reactivePowerControlSchema, data) };
//     case "powerLimit":
//       return { ...prev, powerLimit: parseTabSettings(powerLimitSchema, data) };
//     case "other":
//       return { ...prev, otherSetting: parseTabSettings(otherSettingSchema, data) };
//     case "masking":
//       return { ...prev, maskingFaultDetection: parseTabSettings(maskingFaultDetectionSchema, data) };
//   }
// }

// ─── Shared field controls ─────────────────────────────────────────────────────

function applyTabData(
  tab: ModalTab,
  data: unknown,
  prev: RemoteSettings
): RemoteSettings {
  const transformed = transformSettings(data);
  console.log("TAB:", tab);
  console.log("TRANSFORMED:", transformed);

  switch (tab) {
    case "grid":
      return {
        ...prev,
        gridParameters: parseTabSettings(
          gridParametersSchema,
          transformed
        ),
      };

    case "feature":
      return {
        ...prev,
        featureParameters: parseTabSettings(
          featureParametersSchema,
          transformed
        ),
      };

    case "reactive":
      return {
        ...prev,
        reactivePowerControl: parseTabSettings(
          reactivePowerControlSchema,
          transformed
        ),
      };

    case "powerLimit":
      return {
        ...prev,
        powerLimit: parseTabSettings(
          powerLimitSchema,
          transformed
        ),
      };

    case "other":
      return {
        ...prev,
        otherSetting: parseTabSettings(
          otherSettingSchema,
          transformed
        ),
      };

    case "masking":
      return {
        ...prev,
        maskingFaultDetection: parseTabSettings(
          maskingFaultDetectionSchema,
          transformed
        ),
      };

    default:
      return prev;
  }
}

function FieldInput({
  label,
  placeholder,
  value,
  onCommit,
  error,
}: {
  label: string;
  placeholder?: string;
  value?: number;
  onCommit?: (value: number | undefined) => void;
  error?: string;
}) {
  // const [draft, setDraft] = useState(value != null ? String(value) : "");
  // const [prevValue, setPrevValue] = useState(value);

  // if (value !== prevValue) {
  //   setPrevValue(value);
  //   setDraft(value != null ? String(value) : "");
  // }

  const [draft, setDraft] = useState(value != null ? String(value) : "");

  useEffect(() => {
    setDraft(value != null ? String(value) : "");
  }, [value]);

  return (
    <div>
      <div className="text-sm text-gray-500 mb-1.5 leading-snug">{label}</div>
      <input
        type="text"
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const trimmed = draft.trim();
          if (trimmed === "") {
            onCommit?.(undefined);
            return;
          }
          const parsed = Number(trimmed);
          onCommit?.(Number.isNaN(parsed) ? undefined : parsed);
        }}
        className={`w-full bg-gray-100 border rounded px-3 py-2 text-sm text-black focus:outline-none focus:ring-1 ${error
          ? "border-red-400 focus:ring-red-400"
          : "border-transparent focus:ring-[#1890FF]"
          }`}
      />
      {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
    </div>
  );
}

function FieldSelect({
  label,
  placeholder,
  options = [],
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="relative">
      <div className="text-sm text-black mb-1.5 leading-snug">{label}</div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-gray-100 rounded px-3 py-2 text-sm text-left text-black flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#1890FF]"
      >
        <span>{selectedLabel || placeholder || ""}</span>
        <ChevronDown size={14} className="text-black shrink-0" />
      </button>
      {open && options.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-20">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange?.(o.value);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-black hover:bg-blue-50 transition-colors"
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <div>
      <div className="text-sm text-black mb-2 leading-snug">{label}</div>
      <button
        onClick={() => onChange?.(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? "bg-[#1890FF]" : "bg-gray-300"
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"
            }`}
        />
      </button>
    </div>
  );
}

function ActionButton({
  label,
  text,
  onClick,
  disabled,
}: {
  label: string;
  text: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="text-sm text-black mb-2 leading-snug">{label}</div>
      <button
        onClick={onClick}
        disabled={disabled}
        className="px-4 py-1.5 text-sm text-black border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {text}
      </button>
    </div>
  );
}

// ─── Tab content panels ───────────────────────────────────────────────────────

function GridParametersTab({
  value,
  onChange,
  errors,
}: {
  value: GridParameters;
  onChange: (patch: Partial<GridParameters>) => void;
  errors: FieldErrors<GridParameters>;
}) {
  return (
    <div className="space-y-8">
      {/* Standard Code */}
      <div className="max-w-xs">
        <FieldSelect
          label="Standard Code"
          placeholder="IN (IEC61727)"
          options={STANDARD_CODE_OPTIONS}
          value={value.standardCode}
          onChange={(v) => onChange({ standardCode: v as GridParameters["standardCode"] })}
        />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-4 gap-6">
        <FieldInput label="First Connect Delay Time(s)" placeholder="120" value={value.firstConnectDelayTime} onCommit={(v) => onChange({ firstConnectDelayTime: v })} error={errors.firstConnectDelayTime} />
        <FieldInput label="Reconnect Delay Time(s)" placeholder="120" value={value.reconnectDelayTime} onCommit={(v) => onChange({ reconnectDelayTime: v })} error={errors.reconnectDelayTime} />
        <FieldInput label="First Connect Power Gradient(%/min)" placeholder="100" value={value.firstConnectPowerGradient} onCommit={(v) => onChange({ firstConnectPowerGradient: v })} error={errors.firstConnectPowerGradient} />
        <FieldInput label="Reconnect Power Gradient(%/min)" placeholder="100" value={value.reconnectPowerGradient} onCommit={(v) => onChange({ reconnectPowerGradient: v })} error={errors.reconnectPowerGradient} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-4 gap-6">
        <FieldInput label="Grid First Connection Voltage High Limit (V)" placeholder="999.9" value={value.gridFirstConnectionVoltageHighLimit} onCommit={(v) => onChange({ gridFirstConnectionVoltageHighLimit: v })} error={errors.gridFirstConnectionVoltageHighLimit} />
        <FieldInput label="Grid First Connection Voltage Low Limit (V)" placeholder="0" value={value.gridFirstConnectionVoltageLowLimit} onCommit={(v) => onChange({ gridFirstConnectionVoltageLowLimit: v })} />
        <FieldInput label="Grid First Connection Frequency High Limit (Hz)" placeholder="99.9" value={value.gridFirstConnectionFrequencyHighLimit} onCommit={(v) => onChange({ gridFirstConnectionFrequencyHighLimit: v })} error={errors.gridFirstConnectionFrequencyHighLimit} />
        <FieldInput label="Grid First Connection Frequency Low Limit (Hz)" placeholder="0" value={value.gridFirstConnectionFrequencyLowLimit} onCommit={(v) => onChange({ gridFirstConnectionFrequencyLowLimit: v })} />
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-4 gap-6">
        <FieldInput label="Grid Reconnection Voltage High Limit (V)" placeholder="999.9" value={value.gridReconnectionVoltageHighLimit} onCommit={(v) => onChange({ gridReconnectionVoltageHighLimit: v })} error={errors.gridReconnectionVoltageHighLimit} />
        <FieldInput label="Grid Reconnection Voltage Low Limit (V)" placeholder="0" value={value.gridReconnectionVoltageLowLimit} onCommit={(v) => onChange({ gridReconnectionVoltageLowLimit: v })} />
        <FieldInput label="Grid Reconnection Frequency High Limit (Hz)" placeholder="99.9" value={value.gridReconnectionFrequencyHighLimit} onCommit={(v) => onChange({ gridReconnectionFrequencyHighLimit: v })} error={errors.gridReconnectionFrequencyHighLimit} />
        <FieldInput label="Grid Reconnection Frequency Low Limit (Hz)" placeholder="0" value={value.gridReconnectionFrequencyLowLimit} onCommit={(v) => onChange({ gridReconnectionFrequencyLowLimit: v })} />
      </div>

      {/* Row 4 */}
      {/* <div className="grid grid-cols-4 gap-6">
        <FieldInput label="Frequency High Loss Level_1(Hz)" placeholder="53" value={value.frequencyHighLossLevel1} onCommit={(v) => onChange({ frequencyHighLossLevel1: v })} error={errors.frequencyHighLossLevel1} />
        <FieldInput label="Frequency Low Loss Level_1(Hz)" placeholder="47" value={value.frequencyLowLossLevel1} onCommit={(v) => onChange({ frequencyLowLossLevel1: v })} />
        <FieldInput label="Voltage High Loss Level_1(V)" placeholder="280" value={value.voltageHighLossLevel1} onCommit={(v) => onChange({ voltageHighLossLevel1: v })} error={errors.voltageHighLossLevel1} />
        <FieldInput label="Voltage Low Loss Level_1(V)" placeholder="170" value={value.voltageLowLossLevel1} onCommit={(v) => onChange({ voltageLowLossLevel1: v })} />
      </div> */}

      {/* Row 5 */}
      {/* <div className="grid grid-cols-4 gap-6">
        <FieldInput label="Frequency High Loss Time Level_1(ms)" placeholder="200" value={value.frequencyHighLossTimeLevel1} onCommit={(v) => onChange({ frequencyHighLossTimeLevel1: v })} error={errors.frequencyHighLossTimeLevel1} />
        <FieldInput label="Frequency Low Loss Time Level_1(ms)" placeholder="200" value={value.frequencyLowLossTimeLevel1} onCommit={(v) => onChange({ frequencyLowLossTimeLevel1: v })} error={errors.frequencyLowLossTimeLevel1} />
        <FieldInput label="Voltage High Loss Time Level_1(ms)" placeholder="2000" value={value.voltageHighLossTimeLevel1} onCommit={(v) => onChange({ voltageHighLossTimeLevel1: v })} error={errors.voltageHighLossTimeLevel1} />
        <FieldInput label="Voltage Low Loss Time Level_1(ms)" placeholder="2000" value={value.voltageLowLossTimeLevel1} onCommit={(v) => onChange({ voltageLowLossTimeLevel1: v })} error={errors.voltageLowLossTimeLevel1} />
      </div> */}

      {/* Row 6 */}
      {/* <div className="grid grid-cols-4 gap-6">
        <FieldInput label="Voltage High Loss Level_2(V)" placeholder="310.5" value={value.voltageHighLossLevel2} onCommit={(v) => onChange({ voltageHighLossLevel2: v })} error={errors.voltageHighLossLevel2} />
        <FieldInput label="Voltage Low Loss Level_2(V)" placeholder="115" value={value.voltageLowLossLevel2} onCommit={(v) => onChange({ voltageLowLossLevel2: v })} />
      </div> */}

      {/* Row 7 */}
      {/* <div className="grid grid-cols-4 gap-6">
        <FieldInput label="Voltage High Loss Time Level_2(ms)" placeholder="50" value={value.voltageHighLossTimeLevel2} onCommit={(v) => onChange({ voltageHighLossTimeLevel2: v })} error={errors.voltageHighLossTimeLevel2} />
        <FieldInput label="Voltage Low Loss Time Level_2(ms)" placeholder="100" value={value.voltageLowLossTimeLevel2} onCommit={(v) => onChange({ voltageLowLossTimeLevel2: v })} error={errors.voltageLowLossTimeLevel2} />
      </div> */}

      {/* Toggles */}
      <div className="space-y-6">
        <Toggle
          label="Over Frequency Derating Function"
          checked={value.overFrequencyDeratingFunction === 1}
          onChange={(checked) =>
            onChange({
              overFrequencyDeratingFunction: checked ? 1 : 0,
            })
          }
        />

        <Toggle
          label="Under Frequency Function"
          checked={value.underFrequencyFunction === 1}
          onChange={(checked) =>
            onChange({
              underFrequencyFunction: checked ? 1 : 0,
            })
          }
        />

        <Toggle
          label="Over Voltage Derating"
          checked={value.overVoltageDerating === 1}
          onChange={(checked) =>
            onChange({
              overVoltageDerating: checked ? 1 : 0,
            })
          }
        />
      </div>
    </div>
  );
}

function FeatureParametersTab({
  value,
  onChange,
  errors,
}: {
  value: FeatureParameters;
  onChange: (patch: Partial<FeatureParameters>) => void;
  errors: FieldErrors<FeatureParameters>;
}) {
  return (
    <div className="space-y-8">
      {/* Toggles row */}
      <div className="grid grid-cols-4 gap-6">
        <Toggle
          label="Fault ride through function"
          checked={value.faultRideThroughFunction === 1}
          onChange={(checked) =>
            onChange({
              faultRideThroughFunction: checked ? 1 : 0,
            })
          }
        />

        <Toggle
          label="Island Detection"
          checked={value.islandDetection === 1}
          onChange={(checked) =>
            onChange({
              islandDetection: checked ? 1 : 0,
            })
          }
        />

        <Toggle
          label="Terminal Resistor"
          checked={value.terminalResistor === 1}
          onChange={(checked) =>
            onChange({
              terminalResistor: checked ? 1 : 0,
            })
          }
        />
      </div>

      {/* Input fields row */}
      <div className="grid grid-cols-4 gap-6">
        <FieldInput label="Derated Power(%)" value={value.deratedPower} onCommit={(v) => onChange({ deratedPower: v })} error={errors.deratedPower} />
        <FieldInput label="Insulation Impedance(KΩ)" value={value.insulationImpedance} onCommit={(v) => onChange({ insulationImpedance: v })} error={errors.insulationImpedance} />
        <FieldInput label="Leakage Current Point(mA)" value={value.leakageCurrentPoint} onCommit={(v) => onChange({ leakageCurrentPoint: v })} error={errors.leakageCurrentPoint} />
        <FieldInput label="Moving Average Voltage Limit(V)" value={value.movingAverageVoltageLimit} onCommit={(v) => onChange({ movingAverageVoltageLimit: v })} error={errors.movingAverageVoltageLimit} />
      </div>
    </div>
  );
}

function ReactiveTab({
  value,
  onChange,
  errors,
}: {
  value: ReactivePowerControl;
  onChange: (patch: Partial<ReactivePowerControl>) => void;
  errors: FieldErrors<ReactivePowerControl>;
}) {
  return (
    <div className="space-y-8">
      <div className="max-w-xs">
        <FieldInput label="Reactive Power Control Setting Time(s)" value={value.settingTime} onCommit={(v) => onChange({ settingTime: v })} error={errors.settingTime} />
      </div>
      <div className="max-w-xs">
        <FieldInput
          label="Reactive Power Control Mode"
          value={value.mode}
          onCommit={(v) =>
            onChange({
              mode: v,
            })
          }
        />
      </div>
    </div>
  );
}

function PowerLimitTab({
  value,
  onChange,
  errors,
}: {
  value: PowerLimit;
  onChange: (patch: Partial<PowerLimit>) => void;
  errors: FieldErrors<PowerLimit>;
}) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-6">
        <FieldInput
          label="Power Control"
          value={Number(value.powerControl)}
          onCommit={(v) => onChange({ powerControl: v as any })}
        />

        <FieldInput
          label="Meter Location"
          value={Number(value.meterLocation)}
          onCommit={(v) => onChange({ meterLocation: v as any })}
        />

        <FieldInput
          label="Power Flow Direction"
          value={Number(value.powerFlowDirection)}
          onCommit={(v) => onChange({ powerFlowDirection: v as any })}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Maximum Feed In Grid Power (W)
          </label>

          <div className="grid grid-cols-2 gap-4">
            <FieldInput
              label="Value 1"
              value={value.maxFeedInGridPower?.[0]}
              onCommit={(v) =>
                onChange({
                  maxFeedInGridPower: [
                    v ?? 0,
                    value.maxFeedInGridPower?.[1] ?? 0,
                  ],
                })
              }
            />

            <FieldInput
              label="Value 2"
              value={value.maxFeedInGridPower?.[1]}
              onCommit={(v) =>
                onChange({
                  maxFeedInGridPower: [
                    value.maxFeedInGridPower?.[0] ?? 0,
                    v ?? 0,
                  ],
                })
              }
            />
          </div>
        </div>

        {/* <FieldInput
          label="Maximum Feed In Grid Power(W)"
          value={value.maxFeedInGridPower}
          onCommit={(v) => onChange({ maxFeedInGridPower: v })}
          error={errors.maxFeedInGridPower}
        /> */}
      </div>
      <div className="max-w-xs">
        <FieldInput label="Modbus address" value={value.modbusAddress} onCommit={(v) => onChange({ modbusAddress: v })} error={errors.modbusAddress} />
      </div>
    </div>
  );
}

function OtherSettingTab({
  value,
  onChange,
  onCommand,
  commandPending,
}: {
  value: OtherSetting;
  onChange: (patch: Partial<OtherSetting>) => void;
  onCommand: (command: RemoteSettingsCommand) => void;
  commandPending: boolean;
}) {
  return (
    <div className="space-y-8">
      {/* Input fields */}
      <div className="grid grid-cols-4 gap-6">
        <FieldInput
          label="AFD Function"
          value={value.afdFunction as any}
          onCommit={(v) => onChange({ afdFunction: v as any })}
        />

        <FieldInput
          label="Power On"
          value={value.powerOn as any}
          onCommit={(v) => onChange({ powerOn: v as any })}
        />

        <FieldInput
          label="Grid Voltage Type"
          value={value.gridVoltageType as any}
          onCommit={(v) => onChange({ gridVoltageType: v as any })}
        />
      </div>

      {/* Action buttons */}
      {/* <div className="grid grid-cols-4 gap-6">
        <ActionButton
          label="AFD Reset"
          text="Click to confirm"
          disabled={commandPending}
          onClick={() => onCommand({ afdReset: true })}
        />

        <ActionButton
          label="Date and Time"
          text="Click to synchronize"
          disabled={commandPending}
          onClick={() => onCommand({ syncDateTime: true })}
        />

        <ActionButton
          label="Reset"
          text="Click to confirm"
          disabled={commandPending}
          onClick={() => onCommand({ reset: true })}
        />

        <ActionButton
          label="Clear All Data"
          text="Click to confirm"
          disabled={commandPending}
          onClick={() => onCommand({ clearAllData: true })}
        />
      </div> */}
    </div>
  );
}

function MaskingFaultTab({
  value,
  onChange,
}: {
  value: MaskingFaultDetection;
  onChange: (patch: Partial<MaskingFaultDetection>) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-x-6 gap-y-8">
      {FAULT_FIELDS.map((f) => (
        <FieldInput
          key={f.key}
          label={f.label}
          value={value[f.key] as number | undefined}
          onCommit={(v) =>
            onChange({
              [f.key]: v,
            } as Partial<MaskingFaultDetection>)
          }
        />
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function RemoteSettingModal({
  isOpen,
  onClose,
  deviceId,
  plantId,
  sn = "2502-65764179P",
  targetEndUserId,
}: RemoteSettingModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("grid");
  const [settings, setSettings] = useState<RemoteSettings>({});
  const [changedSettings, setChangedSettings] = useState<RemoteSettings>({});
  const [lastAction, setLastAction] = useState<"read" | "upload" | null>(null);
  const [lastActionTab, setLastActionTab] = useState<ModalTab | null>(null);
  const [session, setSession] = useState<{ open: boolean; deviceId?: string }>({
    open: false,
  });

  if (isOpen && (!session.open || session.deviceId !== deviceId)) {
    setSession({ open: true, deviceId });
    setSettings({});
    setActiveTab("grid");
    setLastAction(null);
    setLastActionTab(null);
  } else if (!isOpen && session.open) {
    setSession({ open: false });
  }

  const scopeParams = targetEndUserId
    ? { fromService: true, targetEndUserId }
    : {};

  const activeTabConfig = TABS.find((t) => t.key === activeTab) ?? TABS[0];

  // Each tab is a distinct backend entity — Read/Upload only ever act on
  // whichever tab is currently open, never on all 6 at once.
  const remoteSettingsTabQuery = useRemoteSettingsTab(
    deviceId ?? "",
    activeTabConfig.settingsKey,
    plantId ?? "",
    scopeParams,
    { enabled: false },
  );
  const submitTab = useSubmitRemoteSettingsTab(plantId ?? "", scopeParams);
  const submitCommand = useSubmitRemoteCommand(plantId ?? "", scopeParams);

  if (!isOpen) return null;

  const errors = validateRemoteSettings(settings);
  const activeTabErrorCount = (() => {
    switch (activeTab) {
      case "grid":
        return Object.keys(errors.gridParameters).length;
      case "feature":
        return Object.keys(errors.featureParameters).length;
      case "reactive":
        return Object.keys(errors.reactivePowerControl).length;
      case "powerLimit":
        return Object.keys(errors.powerLimit).length;
      default:
        return 0;
    }
  })();

  const uploadedForThisTab =
    submitTab.isSuccess &&
    submitTab.variables?.deviceId === deviceId &&
    submitTab.variables?.entry.tab === activeTabConfig.settingsKey;
  const uploadErrorForThisTab =
    submitTab.isError &&
    submitTab.variables?.deviceId === deviceId &&
    submitTab.variables?.entry.tab === activeTabConfig.settingsKey;

  // const updateGrid = (patch: Partial<GridParameters>) =>
  //   setSettings((prev) => ({ ...prev, gridParameters: { ...prev.gridParameters, ...patch } }));
  const updateGrid = (patch: Partial<GridParameters>) => {
    setSettings((prev) => ({
      ...prev,
      gridParameters: {
        ...prev.gridParameters,
        ...patch,
      },
    }));

    setChangedSettings((prev) => ({
      ...prev,
      gridParameters: {
        ...prev.gridParameters,
        ...patch,
      },
    }));
  };
  const updateFeature = (patch: Partial<FeatureParameters>) => {
    setSettings((prev) => ({
      ...prev,
      featureParameters: {
        ...prev.featureParameters,
        ...patch,
      },
    }));

    setChangedSettings((prev) => ({
      ...prev,
      featureParameters: {
        ...prev.featureParameters,
        ...patch,
      },
    }));
  };

  const updateReactive = (patch: Partial<ReactivePowerControl>) => {
    setSettings((prev) => ({
      ...prev,
      reactivePowerControl: {
        ...prev.reactivePowerControl,
        ...patch,
      },
    }));

    setChangedSettings((prev) => ({
      ...prev,
      reactivePowerControl: {
        ...prev.reactivePowerControl,
        ...patch,
      },
    }));
  };

  const updatePowerLimit = (patch: Partial<PowerLimit>) => {
    setSettings((prev) => ({
      ...prev,
      powerLimit: {
        ...prev.powerLimit,
        ...patch,
      },
    }));

    setChangedSettings((prev) => ({
      ...prev,
      powerLimit: {
        ...prev.powerLimit,
        ...patch,
      },
    }));
  };

  const updateOther = (patch: Partial<OtherSetting>) => {
    setSettings((prev) => ({
      ...prev,
      otherSetting: {
        ...prev.otherSetting,
        ...patch,
      },
    }));

    setChangedSettings((prev) => ({
      ...prev,
      otherSetting: {
        ...prev.otherSetting,
        ...patch,
      },
    }));
  };

  const updateMasking = (patch: Partial<MaskingFaultDetection>) => {
    setSettings((prev) => ({
      ...prev,
      maskingFaultDetection: {
        ...prev.maskingFaultDetection,
        ...patch,
      },
    }));

    setChangedSettings((prev) => ({
      ...prev,
      maskingFaultDetection: {
        ...prev.maskingFaultDetection,
        ...patch,
      },
    }));
  };

  // const handleRead = async () => {
  //   if (!deviceId || !plantId) return;
  //   setLastAction("read");
  //   setLastActionTab(activeTab);
  //   const result = await remoteSettingsTabQuery.refetch();
  //   console.log("RESULT", result.data);
  //   if (result.data) setSettings((prev) => applyTabData(activeTab, result.data, prev));
  // };

  const handleRead = async () => {
    if (!deviceId || !plantId) return;

    try {
      const result = await remoteSettingsTabQuery.refetch();

      if (result.data) {
        setSettings((prev) => applyTabData(activeTab, result.data, prev));

        setLastAction("read");
        setLastActionTab(activeTab);
      }
    } catch (err) {
      setLastAction("read");
      setLastActionTab(activeTab);
    }
  };

  const handleUpload = () => {
    if (!deviceId || !plantId || activeTabErrorCount > 0) return;
    setLastAction("upload");
    setLastActionTab(activeTab);
    submitTab.mutate({ deviceId, sn, entry: buildTabEntry(activeTab, changedSettings) });
  };

  const handleCommand = (command: RemoteSettingsCommand) => {
    if (!deviceId || !plantId) return;
    submitCommand.mutate({ deviceId, sn, command });
  };

  const isReading = remoteSettingsTabQuery.isFetching;
  const isUploading = submitTab.isPending;

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
              <span className="text-sm text-black">
                <span className="font-medium text-gray-600">SN:</span>  {sn}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 text-black hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6 flex-shrink-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-4 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab.key
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
            {activeTab === "grid" && <GridParametersTab value={settings.gridParameters ?? {}} onChange={updateGrid} errors={errors.gridParameters} />}
            {activeTab === "feature" && <FeatureParametersTab value={settings.featureParameters ?? {}} onChange={updateFeature} errors={errors.featureParameters} />}
            {activeTab === "reactive" && <ReactiveTab value={settings.reactivePowerControl ?? {}} onChange={updateReactive} errors={errors.reactivePowerControl} />}
            {activeTab === "powerLimit" && <PowerLimitTab value={settings.powerLimit ?? {}} onChange={updatePowerLimit} errors={errors.powerLimit} />}
            {activeTab === "other" && (
              <OtherSettingTab
                value={settings.otherSetting ?? {}}
                onChange={updateOther}
                onCommand={handleCommand}
                commandPending={submitCommand.isPending}
              />
            )}
            {activeTab === "masking" && <MaskingFaultTab value={settings.maskingFaultDetection ?? {}} onChange={updateMasking} />}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Settings2 size={15} className="text-[#1890FF] shrink-0" />

              {activeTabErrorCount > 0 ? (
                <span className="text-red-500">
                  Fix {activeTabErrorCount} field error
                  {activeTabErrorCount > 1 ? "s" : ""} before uploading.
                </span>
              ) : isReading ? (
                <span className="text-[#1890FF]">
                  Reading parameters...
                </span>
              ) : lastAction === "read" &&
                lastActionTab === activeTab &&
                remoteSettingsTabQuery.isSuccess ? (
                <span className="text-green-600">
                  Parameters loaded successfully.
                </span>
              ) : lastAction === "read" &&
                lastActionTab === activeTab &&
                remoteSettingsTabQuery.isError ? (
                <span className="text-red-500">
                  Read failed. Please try again.
                </span>
              ) : isUploading ? (
                <span className="text-[#1890FF]">
                  Uploading parameters...
                </span>
              ) : lastAction === "upload" &&
                lastActionTab === activeTab &&
                uploadedForThisTab ? (
                <span className="text-green-600">
                  Parameters Uploaded Successfully.
                  {/* <Link
                    href="/services/batch/setting"
                    className="underline hover:text-green-700"
                  >
                    View task status
                  </Link> */}
                </span>
              ) : lastAction === "upload" &&
                lastActionTab === activeTab &&
                uploadErrorForThisTab ? (
                <span className="text-red-500">
                  Upload failed. Please try again.
                </span>
              ) : (
                <span>
                  Click <strong>Read</strong> to fetch the latest parameters from the
                  device.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-4">
              <button
                onClick={handleRead}
                disabled={!deviceId || !plantId || isReading}
                className="px-5 py-1.5 text-sm text-black border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReading ? "Reading..." : "Read"}
              </button>

              <button
                onClick={handleUpload}
                disabled={
                  !deviceId ||
                  !plantId ||
                  isUploading ||
                  activeTabErrorCount > 0
                }
                className="px-5 py-1.5 text-sm text-black border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
