export function presetModeLabel(mode: string): string {
  return mode === "multiple_logos" ? "Múltiplos logos" : "Múltiplos PDFs";
}

export function pageSelectionLabel(mode: string): string {
  switch (mode) {
    case "all":
      return "Todas as páginas";
    case "first_only":
      return "Somente a 1ª página";
    case "last_only":
      return "Somente a última página";
    case "first_n":
      return "Primeiras N páginas";
    case "last_n":
      return "Últimas N páginas";
    case "first_n_and_last_m":
      return "Primeiras N e últimas M";
    case "specific":
      return "Páginas específicas";
    default:
      return mode;
  }
}

export function presetStrategyLabel(pos_strategy: string): string {
  return pos_strategy === "individual" ? "Posição individual" : "Posição compartilhada";
}