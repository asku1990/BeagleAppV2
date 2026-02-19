import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionCurrentUser } from "@/lib/server/current-user";

export default async function AccountProfilePage() {
  const user = await getSessionCurrentUser();
  if (!user) {
    redirect("/sign-in?returnTo=/account/profile");
  }

  const createdAt = user.createdAt ? new Date(user.createdAt) : null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Signed-in account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Name:</span> {user.name ?? "-"}
          </p>
          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-medium">Role:</span> {user.role}
          </p>
          <p>
            <span className="font-medium">Created:</span>{" "}
            {createdAt ? createdAt.toLocaleString("fi-FI") : "-"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
