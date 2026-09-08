export interface PageSelectionLike {
  mode: string;
  first_count?: number;
  last_count?: number;
  specific_pages?: number[];
}

export function getTargetPages(totalPages: number, selection: PageSelectionLike): number[] {
  const mode = selection?.mode ?? "all";
  const first = selection?.first_count ?? 1;
  const last = selection?.last_count ?? 1;
  const specific = selection?.specific_pages ?? [];

  if (mode === "all") return Array.from({ length: totalPages }, (_, i) => i);
  if (mode === "first_only") return totalPages > 0 ? [0] : [];
  if (mode === "last_only") return totalPages > 0 ? [totalPages - 1] : [];
  if (mode === "first_n") return Array.from({ length: Math.min(first, totalPages) }, (_, i) => i);
  if (mode === "last_n") {
    const start = Math.max(0, totalPages - last);
    return Array.from({ length: totalPages - start }, (_, i) => start + i);
  }
  if (mode === "first_n_and_last_m") {
    const firstIds = Array.from({ length: Math.min(first, totalPages) }, (_, i) => i);
    const lastStart = Math.max(0, totalPages - last);
    const lastIds = Array.from({ length: totalPages - lastStart }, (_, i) => lastStart + i);
    return Array.from(new Set([...firstIds, ...lastIds])).sort((a, b) => a - b);
  }
  if (mode === "specific") {
    return specific.filter((p) => p >= 0 && p < totalPages);
  }
  return Array.from({ length: totalPages }, (_, i) => i);
}
