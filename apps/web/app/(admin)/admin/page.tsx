import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminHomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
      <Card>
        <CardHeader>
          <CardTitle>Modules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Start with Users and Dogs management. More modules can be added here
            later.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/admin/users">Open Users</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/dogs">Open Dogs</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
