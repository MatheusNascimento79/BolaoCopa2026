import { mockWorldCupAdapter } from "./mock-adapter";
import { WorldCup2026Adapter } from "./worldcup2026-adapter";
import type { WorldCupAdapter } from "./types";

export function getWorldCupAdapter(): WorldCupAdapter {
  if (process.env.WORLDCUP_PROVIDER === "worldcup2026") {
    return new WorldCup2026Adapter();
  }

  return mockWorldCupAdapter;
}

export type { SyncResult, WorldCupAdapter, WorldCupStanding } from "./types";
