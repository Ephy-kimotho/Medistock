import { DOSAGE_FREQUENCY_OPTIONS } from "@/constants";

/// Get the multiplier for a frequency 
export function getFrequencyMultiplier(frequency: string): number {
  const option = DOSAGE_FREQUENCY_OPTIONS.find((f) => f.value === frequency);
  return option?.multiplier ?? 1;
}

// Get the display label for a frequency
export function getFrequencyLabel(frequency: string): string {
  const option = DOSAGE_FREQUENCY_OPTIONS.find((f) => f.value === frequency);
  return option?.label ?? frequency;
}

export function getDosageDisplayUnit(unit: string): string {
  const lowerUnit = unit.toLowerCase();

  // Liquid containers → ml
  if (
    ["bottles", "bottle", "vials", "vial", "ampoules", "ampoule", "syringes", "syringe"].includes(lowerUnit)
  ) {
    return "ml";
  }

  // Topical containers → g
  if (["tubes", "tube", "jars", "jar"].includes(lowerUnit)) {
    return "g";
  }

  // Inhalers → puffs
  if (["inhalers", "inhaler"].includes(lowerUnit)) {
    return "puffs";
  }

  // Everything else (tablets, capsules, sachets, drops, etc.) → use as-is
  return unit.toLowerCase();
}

export function formatDosage(
  quantity: number | null,
  frequency: string | null,
  days: number | null,
  unit: string
): string {
  if (!quantity || !frequency) {
    return "Not specified";
  }

  const frequencyLabel = getFrequencyLabel(frequency).toLowerCase();
  const displayUnit = getDosageDisplayUnit(unit);

  // For as_needed or single_dose, don't show days
  if (frequency === "as_needed" || frequency === "single_dose") {
    return `${quantity} ${displayUnit} ${frequencyLabel}`;
  }

  // For prescription drugs with days
  if (days) {
    return `${quantity} ${displayUnit} ${frequencyLabel} for ${days} day${days > 1 ? "s" : ""}`;
  }

  // Frequency specified but no days
  return `${quantity} ${displayUnit} ${frequencyLabel}`;
}

// Calculate total quantity needed for a course
// Formula: quantity × frequency multiplier × days
export function calculateTotalQuantity(
  quantity: number,
  frequency: string,
  days: number | null
): number {
  const multiplier = getFrequencyMultiplier(frequency);

  // For as_needed or single_dose, just return the quantity
  if (frequency === "as_needed" || frequency === "single_dose") {
    return quantity;
  }

  // If no days specified, return single day's worth
  if (!days) {
    return quantity * multiplier;
  }

  return quantity * multiplier * days;
}

export function calculateTotalPrice(
  quantity: number,
  frequency: string,
  days: number | null,
  unitPrice: number
): number {
  const totalQuantity = calculateTotalQuantity(quantity, frequency, days);
  return totalQuantity * unitPrice;
}


/**
 * Check if a frequency requires days to be specified
 * Only "as_needed" does NOT require days
 * "single_dose" requires days but auto-sets to 1
 */
export function requiresDays(frequency: string | null): boolean {
  if (!frequency) return false;
  return frequency !== "as_needed";
}
