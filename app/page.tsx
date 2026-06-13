import { HomeClient } from "./home-client";
import { requireAppAccessOrBettingGate } from "@/lib/access/betting-gate";
import { getPaymentSummary } from "@/lib/app-data";

export default async function HomePage() {
  const { bet, profile, settings } = await requireAppAccessOrBettingGate();
  const paymentSummary = await getPaymentSummary();

  return (
    <HomeClient
      betsDeadlineAt={settings.betsDeadlineAt}
      betsOpen={settings.betsOpen}
      hasBet={Boolean(bet)}
      prizePoolCents={paymentSummary.totalRaisedCents}
      profile={{
        fullName: profile.full_name,
        id: profile.id,
        nickname: profile.nickname,
      }}
    />
  );
}
