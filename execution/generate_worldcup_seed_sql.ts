import { WorldCup2026Adapter } from "../lib/worldcup/worldcup2026-adapter";

function sqlString(value: unknown) {
  return `'${String(value ?? "").replaceAll("'", "''")}'`;
}

function deterministicTeamUuid(teamId: string) {
  const numericId = teamId.replace(/^team-/, "");
  return `00000000-0000-0000-0000-${numericId.padStart(12, "0")}`;
}

async function main() {
  const adapter = new WorldCup2026Adapter(process.env.WORLDCUP2026_API_BASE_URL ?? "https://worldcup26.ir");
  const teams = (await adapter.syncTeams()).data;

  const values = teams.map((team) => {
    const stats = JSON.stringify(team.stats).replaceAll("'", "''");

    return [
      `'${deterministicTeamUuid(team.id)}'::uuid`,
      sqlString(team.externalId),
      sqlString(team.name),
      sqlString(team.flagUrl),
      sqlString(team.groupName),
      sqlString(team.confederation),
      team.fifaRanking,
      `'${stats}'::jsonb`,
      sqlString(team.status),
    ].join(",");
  });

  console.log(`insert into public.teams (
  id,
  external_id,
  name,
  flag_url,
  group_name,
  confederation,
  fifa_ranking,
  stats,
  status
) values
${values.map((value) => `(${value})`).join(",\n")}
on conflict (external_id) do update set
  name = excluded.name,
  flag_url = excluded.flag_url,
  group_name = excluded.group_name,
  confederation = excluded.confederation,
  fifa_ranking = excluded.fifa_ranking,
  stats = excluded.stats,
  status = excluded.status,
  updated_at = now();`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
