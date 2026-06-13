import { HomeClient } from "./home-client";
import { requireAppAccess } from "@/lib/access/profile";
import { getBetForUser } from "@/lib/app-data";

export default async function HomePage() {
  const profile = await requireAppAccess();
  const bet = await getBetForUser(profile.id);

  return (
    <HomeClient
      hasBet={Boolean(bet)}
      profile={{
        fullName: profile.full_name,
        id: profile.id,
        nickname: profile.nickname,
      }}
    />
  );
}
