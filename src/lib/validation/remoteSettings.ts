import type {
  FeatureParameters,
  GridParameters,
  PowerLimit,
  ReactivePowerControl,
  RemoteSettings,
} from "@/lib/api/schemas/devices";

// Generic, standard-agnostic sanity checks only: relational limits, non-negative
// magnitudes, percentage ranges, and the Modbus RTU unicast address range (1-247).
// Grid-code-specific thresholds (IEC61727 / EN50549 / AS4777) are NOT enforced
// here — those vary by utility and must come from the real compliance spec.

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export type RemoteSettingsErrors = {
  gridParameters: FieldErrors<GridParameters>;
  featureParameters: FieldErrors<FeatureParameters>;
  reactivePowerControl: FieldErrors<ReactivePowerControl>;
  powerLimit: FieldErrors<PowerLimit>;
};

const NON_NEGATIVE_MESSAGE = "Must be 0 or greater";
const PERCENTAGE_MESSAGE = "Must be between 0 and 100";
const HIGH_LOW_MESSAGE = "High limit must be ≥ low limit";

function validateGridParameters(v: GridParameters): FieldErrors<GridParameters> {
  const errors: FieldErrors<GridParameters> = {};

  (
    [
      "firstConnectDelayTime",
      "reconnectDelayTime",
      "frequencyHighLossTimeLevel1",
      "frequencyLowLossTimeLevel1",
      "voltageHighLossTimeLevel1",
      "voltageLowLossTimeLevel1",
      "voltageHighLossTimeLevel2",
      "voltageLowLossTimeLevel2",
    ] as const
  ).forEach((key) => {
    const value = v[key];
    if (value != null && value < 0) errors[key] = NON_NEGATIVE_MESSAGE;
  });

  (["firstConnectPowerGradient", "reconnectPowerGradient"] as const).forEach(
    (key) => {
      const value = v[key];
      if (value != null && (value < 0 || value > 100)) {
        errors[key] = PERCENTAGE_MESSAGE;
      }
    },
  );

  const limitPairs: [keyof GridParameters, keyof GridParameters][] = [
    ["gridFirstConnectionVoltageHighLimit", "gridFirstConnectionVoltageLowLimit"],
    ["gridFirstConnectionFrequencyHighLimit", "gridFirstConnectionFrequencyLowLimit"],
    ["gridReconnectionVoltageHighLimit", "gridReconnectionVoltageLowLimit"],
    ["gridReconnectionFrequencyHighLimit", "gridReconnectionFrequencyLowLimit"],
    ["voltageHighLossLevel1", "voltageLowLossLevel1"],
    ["frequencyHighLossLevel1", "frequencyLowLossLevel1"],
    ["voltageHighLossLevel2", "voltageLowLossLevel2"],
  ];

  limitPairs.forEach(([highKey, lowKey]) => {
    const high = v[highKey];
    const low = v[lowKey];
    if (typeof high === "number" && typeof low === "number" && high < low) {
      errors[highKey] = HIGH_LOW_MESSAGE;
    }
  });

  return errors;
}

function validateFeatureParameters(
  v: FeatureParameters,
): FieldErrors<FeatureParameters> {
  const errors: FieldErrors<FeatureParameters> = {};

  if (v.deratedPower != null && (v.deratedPower < 0 || v.deratedPower > 100)) {
    errors.deratedPower = PERCENTAGE_MESSAGE;
  }

  (
    ["insulationImpedance", "leakageCurrentPoint", "movingAverageVoltageLimit"] as const
  ).forEach((key) => {
    const value = v[key];
    if (value != null && value < 0) errors[key] = NON_NEGATIVE_MESSAGE;
  });

  return errors;
}

function validateReactivePowerControl(
  v: ReactivePowerControl,
): FieldErrors<ReactivePowerControl> {
  const errors: FieldErrors<ReactivePowerControl> = {};

  if (v.settingTime != null && v.settingTime < 0) {
    errors.settingTime = NON_NEGATIVE_MESSAGE;
  }

  return errors;
}

function validatePowerLimit(v: PowerLimit): FieldErrors<PowerLimit> {
  const errors: FieldErrors<PowerLimit> = {};

  if (v.maxFeedInGridPower != null && v.maxFeedInGridPower < 0) {
    errors.maxFeedInGridPower = NON_NEGATIVE_MESSAGE;
  }

  if (
    v.modbusAddress != null &&
    (!Number.isInteger(v.modbusAddress) ||
      v.modbusAddress < 1 ||
      v.modbusAddress > 247)
  ) {
    errors.modbusAddress = "Must be a whole number from 1 to 247";
  }

  return errors;
}

export function validateRemoteSettings(
  settings: RemoteSettings,
): RemoteSettingsErrors {
  return {
    gridParameters: validateGridParameters(settings.gridParameters ?? {}),
    featureParameters: validateFeatureParameters(settings.featureParameters ?? {}),
    reactivePowerControl: validateReactivePowerControl(
      settings.reactivePowerControl ?? {},
    ),
    powerLimit: validatePowerLimit(settings.powerLimit ?? {}),
  };
}

export function countRemoteSettingsErrors(errors: RemoteSettingsErrors): number {
  return Object.values(errors).reduce(
    (total, group) => total + Object.keys(group).length,
    0,
  );
}
