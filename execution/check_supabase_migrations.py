#!/usr/bin/env python3
from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS_DIR = ROOT / "supabase" / "migrations"


def migration_files() -> list[Path]:
    files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    if not files:
        raise SystemExit("No Supabase migrations found.")

    return files


def read_migrations(files: list[Path]) -> str:
    return "\n\n".join(file.read_text(encoding="utf-8") for file in files)


def created_public_tables(sql: str) -> set[str]:
    return set(re.findall(r"create\s+table\s+public\.([a-z_]+)\s*\(", sql, flags=re.IGNORECASE))


def rls_enabled_tables(sql: str) -> set[str]:
    return set(re.findall(r"alter\s+table\s+public\.([a-z_]+)\s+enable\s+row\s+level\s+security", sql, flags=re.IGNORECASE))


def storage_object_policies(sql: str) -> list[tuple[str, str]]:
    return re.findall(
        r"create\s+policy\s+\"([^\"]+)\"\s+on\s+storage\.objects\s+for\s+(select|insert|update|delete)",
        sql,
        flags=re.IGNORECASE,
    )


def compact_sql(sql: str) -> str:
    return re.sub(r"\s+", " ", sql.lower())


def main() -> int:
    files = migration_files()
    sql = read_migrations(files)
    errors: list[str] = []

    public_tables = created_public_tables(sql)
    rls_tables = rls_enabled_tables(sql)
    missing_rls = sorted(public_tables - rls_tables)
    if missing_rls:
        errors.append(f"Tables without RLS enabled: {', '.join(missing_rls)}")

    all_sql_lower = sql.lower()
    compacted_sql = compact_sql(sql)

    for file in files:
        file_sql = file.read_text(encoding="utf-8")
        public_security_definers = re.findall(
            r"create\s+or\s+replace\s+function\s+public\.([\w_]+)\([^)]*\).*?security\s+definer",
            file_sql,
            flags=re.IGNORECASE | re.DOTALL,
        )

        for function_name in public_security_definers:
            file_index = files.index(file)
            later_sql = "\n\n".join(item.read_text(encoding="utf-8") for item in files[file_index + 1 :])
            drop_pattern = rf"drop\s+function\s+if\s+exists\s+public\.{re.escape(function_name)}\s*\("
            function_pattern = rf"create\s+or\s+replace\s+function\s+public\.{re.escape(function_name)}\s*\("
            dropped_later = re.search(drop_pattern, later_sql, flags=re.IGNORECASE) is not None
            recreated_later = re.search(function_pattern, later_sql, flags=re.IGNORECASE) is not None

            if not dropped_later or recreated_later:
                errors.append(f"Security definer function public.{function_name} found in {file.name}.")

    if "user_metadata" in all_sql_lower or "raw_user_meta_data" in all_sql_lower:
        errors.append("Migration references user-editable metadata for authorization.")

    if "create schema if not exists private" in all_sql_lower and "grant usage on schema private to authenticated" not in all_sql_lower:
        errors.append("Private schema is used without GRANT USAGE for authenticated role.")

    private_security_definers = re.findall(
        r"create\s+or\s+replace\s+function\s+private\.([\w_]+)\([^)]*\).*?security\s+definer.*?set\s+search_path\s*=\s*([^\n]+)",
        sql,
        flags=re.IGNORECASE | re.DOTALL,
    )
    for function_name, search_path in private_security_definers:
        if "public" in search_path.lower():
            errors.append(f"Security definer function private.{function_name} includes public in search_path.")

    if "function private.decide_payment_receipt" in all_sql_lower:
        if "p_decision is null" not in all_sql_lower:
            errors.append("Payment decision RPC does not explicitly reject null decisions.")
        if "other_receipt.status = 'aprovado'" not in all_sql_lower:
            errors.append("Payment rejection can downgrade a profile despite another approved receipt.")

    if "payment_receipts_sync_profile_status" not in all_sql_lower:
        errors.append("Payment receipt awaiting status does not sync profile payment_status.")
    if "payment_status <> 'pago'" not in all_sql_lower:
        errors.append("Payment receipt profile sync can downgrade an already paid profile.")

    if "'payment-receipts'" in all_sql_lower:
        if "payment_receipts_storage_path_required" not in all_sql_lower:
            errors.append("Payment receipts can reach review/approval without a storage_path constraint.")
        if "insert into storage.buckets" not in all_sql_lower:
            errors.append("Payment receipts bucket is referenced but not created in storage.buckets.")
        if re.search(r"public\s*=\s*false", sql, flags=re.IGNORECASE) is None:
            errors.append("Payment receipts bucket is not explicitly private.")
        if "allowed_mime_types" not in all_sql_lower or "file_size_limit" not in all_sql_lower:
            errors.append("Payment receipts bucket is missing mime type or file size restrictions.")
        if "storage.foldername(name))[1] = (select auth.uid())::text" not in all_sql_lower:
            errors.append("Payment receipts storage upload is not restricted to the user's own folder.")
        if "owner_id = (select auth.uid())::text" not in all_sql_lower:
            errors.append("Payment receipts storage policy does not bind object owner to auth.uid().")
        if "private.current_user_is_super_admin()" not in all_sql_lower:
            errors.append("Payment receipts storage policy does not grant Super Admin review access.")

        policies = storage_object_policies(sql)
        payment_policy_actions = {
            action.lower()
            for policy_name, action in policies
            if "payment_receipts_storage" in policy_name.lower()
        }
        for action in ("insert", "select"):
            if action not in payment_policy_actions:
                errors.append(f"Payment receipts storage is missing {action.upper()} policy.")
        risky_actions = sorted(payment_policy_actions & {"update", "delete"})
        if risky_actions:
            errors.append(
                "Payment receipts storage unexpectedly grants "
                + ", ".join(action.upper() for action in risky_actions)
                + "."
            )

    expected_fk_indexes = {
        "app_settings_updated_by_idx": "on public.app_settings (updated_by)",
        "bets_champion_team_id_idx": "on public.bets (champion_team_id)",
        "bets_runner_up_team_id_idx": "on public.bets (runner_up_team_id)",
        "bets_third_place_team_id_idx": "on public.bets (third_place_team_id)",
        "matches_home_team_id_idx": "on public.matches (home_team_id)",
        "matches_away_team_id_idx": "on public.matches (away_team_id)",
        "payment_receipts_approved_by_idx": "on public.payment_receipts (approved_by)",
    }
    for index_name, index_target in expected_fk_indexes.items():
        if f"create index if not exists {index_name} {index_target}" not in compacted_sql:
            errors.append(f"Missing performance index: {index_name}.")

    if "create unique index bets_user_id_idx on public.bets (user_id)" in compacted_sql:
        if "drop index if exists public.bets_user_id_idx" not in compacted_sql:
            errors.append("Duplicate bets_user_id_idx is created without a later drop.")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    print(f"OK: {len(public_tables)} public tables checked with RLS enabled.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
