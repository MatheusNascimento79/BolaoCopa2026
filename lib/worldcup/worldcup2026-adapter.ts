import type { Confederation, Match, MatchStatus, Team, TournamentStage } from "@/lib/domain/types";
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
  if (text === "final" || text.includes("final")) return "final";
  if (text === "third" || text === "3rd" || text.includes("terceiro")) return "terceiro_lugar";
  if (text === "sf" || text.includes("semi")) return "semifinais";
  if (text === "qf" || text.includes("quarter") || text.includes("quarta")) return "quartas";
  if (text === "r16" || text.includes("16") || text.includes("oitava")) return "oitavas";
  if (text === "r32" || text.includes("32")) return "32_avos";
  return "fase_de_grupos";
}

function normalizeStatus(value: unknown): MatchStatus {
  const text = asString(value).toLowerCase();
  if (text === "true" || text === "finished") return "encerrado";
  if (text === "false" || text === "notstarted") return "agendado";
  if (/^\d+$/.test(text)) return "ao_vivo";
  if (text.includes("live") || text.includes("ao vivo")) return "ao_vivo";
  if (text.includes("finished") || text.includes("ended") || text.includes("encerr")) return "encerrado";
  if (text.includes("postponed") || text.includes("adiad")) return "adiado";
  if (text.includes("cancel")) return "cancelado";
  return "agendado";
}

function maybeFlagUrl(code: string) {
  return code.length === 2 ? `https://flagcdn.com/${code.toLowerCase()}.svg` : "https://flagcdn.com/un.svg";
}

function parseWorldCupDate(value: unknown) {
  const text = asString(value);
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);

  if (!match) return asString(value, new Date().toISOString());

  const [, month, day, year, hour, minute] = match;
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:00-03:00`).toISOString();
}

function normalizeTeamId(value: unknown, fallback: string) {
  return `team-${slug(asString(value, fallback))}`;
}

function normalizeConfederation(value: unknown): Confederation {
  const text = asString(value).toUpperCase();
  const allowed = new Set<Confederation>(["AFC", "CAF", "CONCACAF", "CONMEBOL", "OFC", "UEFA"]);

  return allowed.has(text as Confederation) ? (text as Confederation) : "CONMEBOL";
}

export class WorldCup2026Adapter implements WorldCupAdapter {
  source = "worldcup2026";

  constructor(private readonly baseUrl = process.env.WORLDCUP2026_API_BASE_URL ?? defaultBaseUrl) {}

  async syncTeams() {
    const [teamsPayload, matchesPayload] = await Promise.all([
      this.fetchJson("/get/teams"),
      this.fetchJson("/get/games").catch(() => null),
    ]);
    const teams = asArray(teamsPayload).map((entry) => this.normalizeTeam(entry)).filter(Boolean) as Team[];
    const matches = asArray(matchesPayload).map((entry) => this.normalizeMatch(entry)).filter(Boolean) as Match[];
    const data = this.applyMatchStats(teams, matches);

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
    const name = asString(record.name_en ?? record.name ?? record.team ?? record.country ?? record.title);
    if (!name) return null;

    const externalId = asString(record.fifa_code ?? record.code ?? record.fifaCode ?? record.iso2 ?? record.id, slug(name).slice(0, 3).toUpperCase()).toUpperCase();
    const iso2 = asString(record.iso2 ?? record.countryCode ?? record.code).slice(0, 2);

    return {
      id: normalizeTeamId(record.id, externalId || name),
      externalId,
      name,
      flagUrl: asString(record.flag ?? record.flagUrl, maybeFlagUrl(iso2)),
      groupName: asString(record.groups ?? record.group ?? record.groupName, "Grupo"),
      confederation: normalizeConfederation(record.confederation),
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
    const homeName = asString(record.home_team_name_en ?? record.homeTeam ?? record.home ?? record.teamA ?? record.home_team);
    const awayName = asString(record.away_team_name_en ?? record.awayTeam ?? record.away ?? record.teamB ?? record.away_team);

    if (!externalId && !homeName && !awayName) return null;

    const statusValue = record.finished === "TRUE" || record.finished === true
      ? "finished"
      : record.time_elapsed ?? record.status;

    return {
      id: `match-${slug(externalId || `${homeName}-${awayName}`)}`,
      externalId: externalId || slug(`${homeName}-${awayName}`),
      stage: normalizeStage(record.type ?? record.stage ?? record.round ?? record.phase),
      groupName: asString(record.group ?? record.groupName) || undefined,
      kickoffAt: parseWorldCupDate(record.local_date ?? record.date ?? record.kickoffAt ?? record.datetime),
      venue: asString(record.stadium ?? record.venue, "A definir"),
      city: asString(record.city, "A definir"),
      homeTeamId: normalizeTeamId(record.home_team_id ?? record.homeTeamId ?? record.homeTeamCode ?? record.homeCode, homeName),
      awayTeamId: normalizeTeamId(record.away_team_id ?? record.awayTeamId ?? record.awayTeamCode ?? record.awayCode, awayName),
      homeScore: record.homeScore === null ? null : asNumber(record.home_score ?? record.homeScore ?? record.scoreA, 0),
      awayScore: record.awayScore === null ? null : asNumber(record.away_score ?? record.awayScore ?? record.scoreB, 0),
      status: normalizeStatus(statusValue),
    };
  }

  private applyMatchStats(teams: Team[], matches: Match[]) {
    const stats = new Map(teams.map((team) => [team.id, { ...team.stats }]));

    matches
      .filter((match) => match.status === "encerrado" && match.homeTeamId !== "team-0" && match.awayTeamId !== "team-0")
      .forEach((match) => {
        const homeStats = stats.get(match.homeTeamId);
        const awayStats = stats.get(match.awayTeamId);
        const homeScore = match.homeScore ?? 0;
        const awayScore = match.awayScore ?? 0;

        if (!homeStats || !awayStats) return;

        homeStats.played += 1;
        awayStats.played += 1;
        homeStats.goalsFor += homeScore;
        homeStats.goalsAgainst += awayScore;
        awayStats.goalsFor += awayScore;
        awayStats.goalsAgainst += homeScore;
        homeStats.goalDifference = homeStats.goalsFor - homeStats.goalsAgainst;
        awayStats.goalDifference = awayStats.goalsFor - awayStats.goalsAgainst;

        if (homeScore > awayScore) {
          homeStats.wins += 1;
          homeStats.points += 3;
          awayStats.losses += 1;
        } else if (awayScore > homeScore) {
          awayStats.wins += 1;
          awayStats.points += 3;
          homeStats.losses += 1;
        } else {
          homeStats.draws += 1;
          awayStats.draws += 1;
          homeStats.points += 1;
          awayStats.points += 1;
        }
      });

    return teams.map((team) => ({
      ...team,
      stats: stats.get(team.id) ?? team.stats,
    }));
  }
}
