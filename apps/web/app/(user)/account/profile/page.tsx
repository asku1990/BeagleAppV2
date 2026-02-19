import { redirect } from "next/navigation";
import { AccountProfilePageClient } from "@/components/account/account-profile-page-client";
import { getSessionCurrentUser } from "@/lib/server/current-user";

export default async function AccountProfilePage() {
  const user = await getSessionCurrentUser();
  if (!user) {
    redirect("/sign-in?returnTo=/account/profile");
  }
  return <AccountProfilePageClient user={user} />;
}
