export interface Identifiable {
  id?: number | null;
}

export function addSelectedId(ids: number[], item?: Identifiable): number[] {
  const id = item?.id;
  if (id == null || ids.includes(id)) return ids;
  return [...ids, id];
}

export function removeSelectedId(ids: number[], item?: Identifiable): number[] {
  const id = item?.id;
  if (id == null) return ids;
  return ids.filter((selectedId) => selectedId !== id);
}

export function getUniqueNumericIds(ids: unknown[]): number[] {
  return Array.from(new Set(ids)).filter(
    (id): id is number => typeof id === "number",
  );
}
