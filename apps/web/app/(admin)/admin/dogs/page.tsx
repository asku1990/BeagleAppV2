import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDogsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Admin Dogs</h1>
      <Card>
        <CardHeader>
          <CardTitle>Dogs module placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            CRUD for dogs will be added in the next phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
