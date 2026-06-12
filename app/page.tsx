import { HomeClient } from "./home-client";
import { requireAppAccess } from "@/lib/access/profile";

export default async function HomePage() {
  const profile = await requireAppAccess();

  return (
    <HomeClient
      profile={{
        fullName: profile.full_name,
        id: profile.id,
        nickname: profile.nickname,
      }}
    />
  );
}
