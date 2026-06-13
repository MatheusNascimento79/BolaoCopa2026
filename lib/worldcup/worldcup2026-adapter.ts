import type { Confederation, Match, MatchStatus, Team, TournamentStage } from "@/lib/domain/types";
import type { WorldCupAdapter, WorldCupStanding } from "./types";

const defaultBaseUrl = "https://worldcup26.ir";

type UnknownRecord = Record<string, unknown>;
type StadiumInfo = {
  city: string;
  id: string;
  name: string;
  timezone: string;
};

function now() {
  return new Date().toISOString();
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as UnknownRecord) : {};
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  const candidates = [record.data, record.result, record.results, record.games, record.matches, record.teams, record.stadiums];
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

function nullableScore(value: unknown, status: MatchStatus) {
  if (status === "agendado" || value === null || value === undefined || value === "null" || value === "") return null;
  return asNumber(value, 0);
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

function normalizeStadiumTimezone(stadium: UnknownRecord) {
  const city = asString(stadium.city_en ?? stadium.city).toLowerCase();
  const country = asString(stadium.country_en ?? stadium.country).toLowerCase();

  if (city.includes("vancouver")) return "America/Vancouver";
  if (city.includes("seattle")) return "America/Los_Angeles";
  if (city.includes("san francisco") || city.includes("santa clara")) return "America/Los_Angeles";
  if (city.includes("los angeles") || city.includes("inglewood")) return "America/Los_Angeles";
  if (city.includes("dallas") || city.includes("arlington")) return "America/Chicago";
  if (city.includes("houston")) return "America/Chicago";
  if (city.includes("kansas")) return "America/Chicago";
  if (city.includes("monterrey") || city.includes("guadalupe")) return "America/Monterrey";
  if (country.includes("mexico")) return "America/Mexico_City";
  if (city.includes("toronto")) return "America/Toronto";
  if (city.includes("atlanta")) return "America/New_York";
  if (city.includes("miami")) return "America/New_York";
  if (city.includes("boston") || city.includes("foxborough")) return "America/New_York";
  if (city.includes("philadelphia")) return "America/New_York";
  if (city.includes("new york") || city.includes("new jersey") || city.includes("east rutherford")) return "America/New_York";

  return "UTC";
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return asUtc - date.getTime();
}

function zonedTimeToUtc(year: string, month: string, day: string, hour: string, minute: string, timeZone: string) {
  const utcGuess = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)));
  const offset = getTimeZoneOffsetMs(utcGuess, timeZone);

  return new Date(utcGuess.getTime() - offset).toISOString();
}

function maybeFlagUrl(code: string) {
  return code.length === 2 ? `https://flagcdn.com/${code.toLowerCase()}.svg` : "https://flagcdn.com/un.svg";
}

function parseWorldCupDate(value: unknown, timeZone = "UTC") {
  const text = asString(value);
  const match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);

  if (!match) return asString(value, new Date().toISOString());

  const [, month, day, year, hour, minute] = match;
  return zonedTimeToUtc(year, month, day, hour, minute, timeZone);
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
    const matches = asArray(matchesPayload).map((entry) => this.normalizeMatch(entry, new Map())).filter(Boolean) as Match[];
    const data = this.applyMatchStats(teams, matches);

    return {
      data,
      source: this.source,
      syncedAt: now(),
    };
  }

  async syncMatches() {
    const [matchesPayload, stadiumsPayload] = await Promise.all([
      this.fetchJson("/get/games"),
      this.fetchJson("/get/stadiums").catch(() => null),
    ]);
    const stadiums = this.normalizeStadiums(stadiumsPayload);
    const data = asArray(matchesPayload).map((entry) => this.normalizeMatch(entry, stadiums)).filter(Boolean) as Match[];

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

  private normalizeStadiums(value: unknown) {
    const stadiums = new Map<string, StadiumInfo>();

    asArray(value).forEach((entry) => {
      const record = asRecord(entry);
      const id = asString(record.id ?? record._id);
      if (!id) return;

      stadiums.set(id, {
        city: asString(record.city_en ?? record.city, "A definir"),
        id,
        name: asString(record.name_en ?? record.fifa_name ?? record.name, "A definir"),
        timezone: normalizeStadiumTimezone(record),
      });
    });

    return stadiums;
  }

  private normalizeMatch(value: unknown, stadiums: Map<string, StadiumInfo>): Match | null {
    const record = asRecord(value);
    const externalId = asString(record.id ?? record._id ?? record.matchId);
    const homeName = asString(record.home_team_name_en ?? record.homeTeam ?? record.home ?? record.teamA ?? record.home_team);
    const awayName = asString(record.away_team_name_en ?? record.awayTeam ?? record.away ?? record.teamB ?? record.away_team);
    const stadium = stadiums.get(asString(record.stadium_id ?? record.stadiumId));

    if (!externalId && !homeName && !awayName) return null;

    const statusValue = record.finished === "TRUE" || record.finished === true
      ? "finished"
      : record.time_elapsed ?? record.status;
    const status = normalizeStatus(statusValue);

    return {
      id: `match-${slug(externalId || `${homeName}-${awayName}`)}`,
      externalId: externalId || slug(`${homeName}-${awayName}`),
      stage: normalizeStage(record.type ?? record.stage ?? record.round ?? record.phase),
      groupName: asString(record.group ?? record.groupName) || undefined,
      kickoffAt: parseWorldCupDate(record.local_date ?? record.date ?? record.kickoffAt ?? record.datetime, stadium?.timezone),
      venue: stadium?.name ?? asString(record.stadium ?? record.venue, "A definir"),
      city: stadium?.city ?? asString(record.city, "A definir"),
      homeTeamId: normalizeTeamId(record.home_team_id ?? record.homeTeamId ?? record.homeTeamCode ?? record.homeCode, homeName),
      awayTeamId: normalizeTeamId(record.away_team_id ?? record.awayTeamId ?? record.awayTeamCode ?? record.awayCode, awayName),
      homeScore: nullableScore(record.home_score ?? record.homeScore ?? record.scoreA, status),
      awayScore: nullableScore(record.away_score ?? record.awayScore ?? record.scoreB, status),
      status,
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
