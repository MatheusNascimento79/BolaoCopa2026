"use client";

import { useMemo, useState } from "react";
import { Check, Info, Lock, RotateCcw, X } from "lucide-react";
import {
  AppFrame,
  GlassCard,
  LiveBottomNav,
  StatusBadge,
  TeamFlag,
  TeamPickCard,
} from "@/components/live-ui";
import type { Bet, Team } from "@/lib/domain/types";

type Slot = "championTeamId" | "runnerUpTeamId" | "thirdPlaceTeamId";

type ApostaClientProps = {
  bet: Bet | null;
  betsOpen: boolean;
  teams: Team[];
};

const slotLabels: Record<Slot, string> = {
  championTeamId: "Campeão",
  runnerUpTeamId: "Vice-campeão",
  thirdPlaceTeamId: "Terceiro colocado",
};

export function ApostaClient({ bet, betsOpen, teams }: ApostaClientProps) {
  const initialPicks = useMemo(
    () => ({
      championTeamId: bet?.championTeamId ?? "",
      runnerUpTeamId: bet?.runnerUpTeamId ?? "",
      thirdPlaceTeamId: bet?.thirdPlaceTeamId ?? "",
    }),
    [bet],
  );
  const [picks, setPicks] = useState(initialPicks);
  const [locked, setLocked] = useState(Boolean(bet?.locked));
  const [openSlot, setOpenSlot] = useState<Slot | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const immutableBet = locked;
  const hasTeams = teams.length > 0;
  const blockedByClosedBets = !betsOpen && !immutableBet;

  const duplicateIds = Object.values(picks).filter((teamId, index, all) => teamId && all.indexOf(teamId) !== index);
  const hasDuplicate = duplicateIds.length > 0;
  const hasMissingPick = Object.values(picks).some((teamId) => !teamId);
  const teamIds = useMemo(() => new Set(teams.map((team) => team.id)), [teams]);
  const hasInvalidPick = Object.values(picks).some((teamId) => teamId && !teamIds.has(teamId));
  const canSubmit = hasTeams && !hasMissingPick && !hasDuplicate && !hasInvalidPick && !immutableBet && !blockedByClosedBets && !saving;

  function updatePick(slot: Slot, teamId: string) {
    setLocked(false);
    setPicks((current) => ({ ...current, [slot]: teamId }));
    setOpenSlot(null);
  }

  function requestConfirmation() {
    if (!canSubmit) {
      setFeedback(
        !hasTeams
          ? "Seleções ainda não disponíveis."
          : hasMissingPick
            ? "Escolha campeão, vice e terceiro lugar."
            : hasDuplicate
              ? "Escolha times diferentes para cada posição."
              : "Revise os dados antes de confirmar.",
      );
      return;
    }

    setConfirmOpen(true);
  }

  async function submitConfirmedBet() {
    if (!canSubmit) return;

    setSaving(true);
    setFeedback("");

    try {
      const response = await fetch("/api/bets", {
        body: JSON.stringify(picks),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) throw new Error("bet_submit_failed");

      setLocked(true);
      setConfirmOpen(false);
      setFeedback("Aposta feita.");
    } catch {
      setFeedback("Não foi possível salvar a aposta agora.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppFrame
      eyebrow="Bolão Copa 2026"
      title="Aposta"
      action={<StatusBadge tone={locked ? "locked" : hasDuplicate ? "warning" : "success"}>{locked ? "Travada" : "Editando"}</StatusBadge>}
      nav={<LiveBottomNav current="/aposta" />}
    >
      <GlassCard className="live-bet-intro live-bet-lock-card" tone="gold">
        <strong>
          {locked
            ? "Aposta salva — não será possível editar"
            : !hasTeams
              ? "Seleções indisponíveis"
            : blockedByClosedBets
              ? "Palpites encerrados"
              : "Escolha campeão, vice e terceiro lugar"}
        </strong>
        <p>
          {feedback ||
            (locked
              ? "A regra do bolão permite apenas uma aposta confirmada por participante."
              : !hasTeams
                ? "Aguardando o Super Admin carregar a lista oficial de seleções."
              : blockedByClosedBets
                ? "O Super Admin encerrou o envio de novas apostas."
                : "Selecione times diferentes para cada posição antes de confirmar.")}
        </p>
      </GlassCard>

      <button className="live-rules-trigger" onClick={() => setRulesOpen(true)} type="button">
        <span>
          <Info size={18} />
        </span>
        <strong>Regras da Premiação</strong>
      </button>

      <section className="live-stack">
        {(Object.keys(slotLabels) as Slot[]).map((slot) => {
          const team = teams.find((entry) => entry.id === picks[slot]) ?? null;
          const duplicated = duplicateIds.includes(picks[slot]);

          return (
            <button
              className="live-pick-button"
              disabled={locked || blockedByClosedBets}
              key={slot}
              onClick={() => setOpenSlot(slot)}
              type="button"
            >
              <TeamPickCard
                label={slotLabels[slot]}
                teamName={team?.name}
                flagSrc={team?.flagUrl}
                selected={Boolean(team)}
                locked={locked}
                helper={duplicated ? "Escolha um time diferente para cada posição." : team?.groupName}
                action={<Check size={20} />}
              />
            </button>
          );
        })}
      </section>

      <div className="live-action-row">
        <button className="live-secondary-action" type="button" onClick={() => {
          if (!immutableBet && !blockedByClosedBets && hasTeams) {
            setLocked(false);
            setOpenSlot("championTeamId");
          }
        }} disabled={immutableBet || blockedByClosedBets || !hasTeams}>
          <RotateCcw size={18} />
          {immutableBet ? "Aposta travada" : blockedByClosedBets ? "Encerrado" : "Editar"}
        </button>
        <button className="live-primary-action live-gold-action" type="button" disabled={!canSubmit} onClick={requestConfirmation}>
          {saving ? "Salvando..." : "Confirmar aposta"}
        </button>
      </div>

      {rulesOpen && (
        <div className="live-modal-backdrop" onClick={() => setRulesOpen(false)} role="presentation">
          <GlassCard
            aria-labelledby="bet-rules-title"
            aria-modal="true"
            className="live-team-modal live-rules-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            tone="blue"
          >
            <div className="live-modal-head">
              <div>
                <span className="live-section-label">Apostas</span>
                <strong id="bet-rules-title">Regras da Premiação</strong>
              </div>
              <button aria-label="Fechar regras da premiação" onClick={() => setRulesOpen(false)} type="button">
                <X size={20} />
              </button>
            </div>

            <div className="live-rules-content">
              <p>
                O prêmio será distribuído conforme a melhor categoria de acerto alcançada entre os participantes,
                seguindo esta ordem de prioridade:
              </p>
              <ol>
                <li>
                  <span>Acertar os três colocados: Campeão, Vice-Campeão e Terceiro Colocado.</span>
                </li>
                <li>
                  <span>Acertar Campeão e Vice-Campeão.</span>
                </li>
                <li>
                  <span>Acertar Campeão e Terceiro Colocado.</span>
                </li>
                <li>
                  <span>Acertar somente o Campeão.</span>
                </li>
                <li>
                  <span>Acertar somente o Vice-Campeão e Terceiro Colocado.</span>
                </li>
                <li>
                  <span>Acertar somente o Vice-Campeão.</span>
                </li>
                <li>
                  <span>Acertar somente o Terceiro Colocado.</span>
                </li>
              </ol>
              <p>
                O valor total arrecadado será dividido igualmente entre todos os participantes que se
                enquadrarem na categoria mais alta com ganhadores.
              </p>
              <p>
                Se não houver nenhum ganhador na categoria 1, o prêmio passa para a categoria 2.
                Se também não houver ganhadores na categoria 2, passa para a categoria 3, e assim
                sucessivamente até encontrar uma categoria com pelo menos um ganhador.
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      {confirmOpen && (
        <div className="live-modal-backdrop" onClick={() => setConfirmOpen(false)} role="presentation">
          <GlassCard
            aria-labelledby="confirm-bet-title"
            aria-modal="true"
            className="live-team-modal live-confirm-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            tone="blue"
          >
            <div className="live-modal-head">
              <div>
                <span className="live-section-label">Confirmar</span>
                <strong id="confirm-bet-title">Sua aposta</strong>
              </div>
              <button aria-label="Fechar confirmação" onClick={() => setConfirmOpen(false)} type="button">
                <X size={20} />
              </button>
            </div>

            <div className="live-confirm-list">
              {(Object.keys(slotLabels) as Slot[]).map((slot) => {
                const team = teams.find((entry) => entry.id === picks[slot]);
                return (
                  <div key={slot}>
                    <span>{slotLabels[slot]}</span>
                    <strong>{team?.name ?? "Não selecionado"}</strong>
                  </div>
                );
              })}
            </div>

            <button className="live-primary-action live-gold-action" disabled={saving} onClick={submitConfirmedBet} type="button">
              {saving ? "Salvando..." : "Salvar aposta"}
            </button>
          </GlassCard>
        </div>
      )}

      {openSlot && !locked && (
        <div className="live-modal-backdrop" onClick={() => setOpenSlot(null)} role="presentation">
          <GlassCard
            aria-labelledby="team-select-title"
            aria-modal="true"
            className="live-team-modal live-select-team-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            tone="blue"
          >
            <div className="live-modal-head">
              <div>
                <span className="live-section-label">Selecionar</span>
                <strong id="team-select-title">{slotLabels[openSlot]}</strong>
              </div>
              <button aria-label="Fechar seleção" onClick={() => setOpenSlot(null)} type="button">
                <X size={20} />
              </button>
            </div>

            <div className="live-modal-team-list">
              {teams.map((team) => {
                const selectedElsewhere = Object.entries(picks).some(
                  ([slot, teamId]) => slot !== openSlot && teamId === team.id,
                );
                const selectedHere = picks[openSlot] === team.id;

                return (
                  <button
                    aria-pressed={selectedHere}
                    disabled={selectedElsewhere}
                    key={team.id}
                    onClick={() => updatePick(openSlot, team.id)}
                    type="button"
                  >
                    <TeamFlag label={team.name} src={team.flagUrl} />
                    <span>
                      <strong>{team.name}</strong>
                      <small>{selectedElsewhere ? "Já selecionado" : team.groupName}</small>
                    </span>
                    {selectedElsewhere ? <Lock size={17} /> : selectedHere ? <Check size={18} /> : null}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}
    </AppFrame>
  );
}
