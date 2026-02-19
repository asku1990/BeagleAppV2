import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Admin Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Settings module placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Admin settings options will be added in the next phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
