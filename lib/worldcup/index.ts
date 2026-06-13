import { WorldCup2026Adapter } from "./worldcup2026-adapter";
import type { WorldCupAdapter } from "./types";

export function getWorldCupAdapter(): WorldCupAdapter {
  return new WorldCup2026Adapter();
}

export type { SyncResult, WorldCupAdapter, WorldCupStanding } from "./types";
