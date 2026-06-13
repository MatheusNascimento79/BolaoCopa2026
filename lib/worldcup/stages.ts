import type { TournamentStage } from "@/lib/domain/types";

export const stageLabels: Record<TournamentStage, string> = {
  fase_de_grupos: "Fase de grupos",
  "32_avos": "32 avos",
  oitavas: "Oitavas",
  quartas: "Quartas",
  semifinais: "Semifinais",
  terceiro_lugar: "Disputa de terceiro lugar",
  final: "Final",
};

export const stageOrder: TournamentStage[] = [
  "fase_de_grupos",
  "32_avos",
  "oitavas",
  "quartas",
  "semifinais",
  "terceiro_lugar",
  "final",
];
