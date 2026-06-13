import { HomeClient } from "./home-client";
import { requireAppAccess } from "@/lib/access/profile";
import { getBetForUser, getPaymentSummary } from "@/lib/app-data";

export default async function HomePage() {
  const profile = await requireAppAccess();
  const [bet, paymentSummary] = await Promise.all([getBetForUser(profile.id), getPaymentSummary()]);

  return (
    <HomeClient
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
