import { ItemUnit } from "../models/ItemUnit";

export const ITEM_UNIT_STATUSES = [
  { value: "AVAILABLE", label: "Disponível" },
  { value: "UNAVAILABLE", label: "Indisponível" },
  { value: "MAINTENANCE", label: "Em manutenção" },
  { value: "DAMAGED", label: "Danificada" },
  { value: "LOST", label: "Não localizada" },
];

export const ITEM_UNIT_CONDITIONS = [
  { value: "NEW", label: "Nova" },
  { value: "GOOD", label: "Boa" },
  { value: "FAIR", label: "Regular" },
  { value: "DAMAGED", label: "Danificada" },
];

export function getItemUnitStatusLabel(status?: string | null): string {
  for (const option of ITEM_UNIT_STATUSES) {
    if (option.value === status) {
      return option.label;
    }
  }

  return status || "-";
}

export function getItemUnitConditionLabel(condition: string): string {
  for (const option of ITEM_UNIT_CONDITIONS) {
    if (option.value === condition) {
      return option.label;
    }
  }

  return condition || "-";
}

export function getItemUnitAvailabilityLabel(unit: ItemUnit): string {
  if (!unit.active) {
    return "Inativa";
  }

  if (
    unit.status === "AVAILABLE" &&
    (unit.item?.active === false || unit.item?.category?.active === false)
  ) {
    return "Indisponível";
  }

  return getItemUnitStatusLabel(unit.status);
}
