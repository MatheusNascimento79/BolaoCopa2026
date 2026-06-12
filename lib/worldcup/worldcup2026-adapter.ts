import type { Match, MatchStatus, Team, TournamentStage } from "@/lib/mock";
import type { WorldCupAdapter, WorldCupStanding } from "./types";

const defaultBaseUrl = "https://worldcup26.ir";

type UnknownRecord = Record<string, unknown>;

function now() {
  return new Date().toISOString();
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as UnknownRecord) : {};
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  const candidates = [record.data, record.result, record.results, record.games, record.matches, record.teams];
  return candidates.find(Array.isArray) ?? [];
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeStage(value: unknown): TournamentStage {
  const text = asString(value).toLowerCase();
  if (text.includes("final")) return "final";
  if (text.includes("third") || text.includes("terceiro")) return "terceiro_lugar";
  if (text.includes("semi")) return "semifinais";
  if (text.includes("quarter") || text.includes("quarta")) return "quartas";
  if (text.includes("16") || text.includes("oitava")) return "oitavas";
  if (text.includes("32")) return "32_avos";
  return "fase_de_grupos";
}

function normalizeStatus(value: unknown): MatchStatus {
  const text = asString(value).toLowerCase();
  if (text.includes("live") || text.includes("ao vivo")) return "ao_vivo";
  if (text.includes("finished") || text.includes("ended") || text.includes("encerr")) return "encerrado";
  if (text.includes("postponed") || text.includes("adiad")) return "adiado";
  if (text.includes("cancel")) return "cancelado";
  return "agendado";
}

function maybeFlagUrl(code: string) {
  return code.length === 2 ? `https://flagcdn.com/${code.toLowerCase()}.svg` : "https://flagcdn.com/un.svg";
}

export class WorldCup2026Adapter implements WorldCupAdapter {
  source = "worldcup2026";

  constructor(private readonly baseUrl = process.env.WORLDCUP2026_API_BASE_URL ?? defaultBaseUrl) {}

  async syncTeams() {
    const payload = await this.fetchJson("/get/teams");
    const data = asArray(payload).map((entry) => this.normalizeTeam(entry)).filter(Boolean) as Team[];

    return {
      data,
      source: this.source,
      syncedAt: now(),
    };
  }

  async syncMatches() {
    const payload = await this.fetchJson("/get/games");
    const data = asArray(payload).map((entry) => this.normalizeMatch(entry)).filter(Boolean) as Match[];

    return {
      data,
      source: this.source,
      syncedAt: now(),
    };
  }

  async syncStandings() {
    const teams = (await this.syncTeams()).data;
    const data: WorldCupStanding[] = teams.map((team) => ({
      teamId: team.id,
      ...team.stats,
    }));

    return {
      data,
      source: this.source,
      syncedAt: now(),
    };
  }

  async syncResults() {
    const matches = (await this.syncMatches()).data;

    return {
      data: matches.filter((match) => match.status === "encerrado" || match.status === "ao_vivo"),
      source: this.source,
      syncedAt: now(),
    };
  }

  private async fetchJson(path: string) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`worldcup2026_fetch_failed:${path}:${response.status}`);
    }

    return response.json() as Promise<unknown>;
  }

  private normalizeTeam(value: unknown): Team | null {
    const record = asRecord(value);
    const name = asString(record.name ?? record.team ?? record.country ?? record.title);
    if (!name) return null;

    const externalId = asString(record.code ?? record.fifaCode ?? record.iso2 ?? record.id, slug(name).slice(0, 3).toUpperCase()).toUpperCase();
    const iso2 = asString(record.iso2 ?? record.countryCode ?? record.code).slice(0, 2);

    return {
      id: `team-${slug(externalId || name)}`,
      externalId,
      name,
      flagUrl: asString(record.flag ?? record.flagUrl, maybeFlagUrl(iso2)),
      groupName: asString(record.group ?? record.groupName, "Grupo"),
      confederation: "CONMEBOL",
      fifaRanking: asNumber(record.fifaRanking ?? record.ranking, 120),
      coach: asString(record.coach ?? record.manager, "A definir"),
      stats: {
        played: asNumber(record.played ?? record.matchesPlayed),
        wins: asNumber(record.wins),
        draws: asNumber(record.draws),
        losses: asNumber(record.losses),
        goalsFor: asNumber(record.goalsFor ?? record.gf),
        goalsAgainst: asNumber(record.goalsAgainst ?? record.ga),
        goalDifference: asNumber(record.goalDifference ?? record.gd),
        points: asNumber(record.points),
      },
      status: "ativo",
    };
  }

  private normalizeMatch(value: unknown): Match | null {
    const record = asRecord(value);
    const externalId = asString(record.id ?? record._id ?? record.matchId);
    const homeName = asString(record.homeTeam ?? record.home ?? record.teamA ?? record.home_team);
    const awayName = asString(record.awayTeam ?? record.away ?? record.teamB ?? record.away_team);

    if (!externalId && !homeName && !awayName) return null;

    return {
      id: `match-${slug(externalId || `${homeName}-${awayName}`)}`,
      externalId: externalId || slug(`${homeName}-${awayName}`),
      stage: normalizeStage(record.stage ?? record.round ?? record.phase),
      groupName: asString(record.group ?? record.groupName) || undefined,
      kickoffAt: asString(record.date ?? record.kickoffAt ?? record.datetime, new Date().toISOString()),
      venue: asString(record.stadium ?? record.venue, "A definir"),
      city: asString(record.city, "A definir"),
      homeTeamId: `team-${slug(asString(record.homeTeamCode ?? record.homeCode, homeName))}`,
      awayTeamId: `team-${slug(asString(record.awayTeamCode ?? record.awayCode, awayName))}`,
      homeScore: record.homeScore === null ? null : asNumber(record.homeScore ?? record.scoreA, 0),
      awayScore: record.awayScore === null ? null : asNumber(record.awayScore ?? record.scoreB, 0),
      status: normalizeStatus(record.status),
    };
  }
}
