import { AdminTrialEventCreatePageClient } from "@/components/admin/trials";
import { toBusinessDateInputValue } from "@/lib/admin/core/date";

export default function AdminTrialEventCreatePage() {
  return (
    <AdminTrialEventCreatePageClient
      initialEventDate={toBusinessDateInputValue(new Date())}
    />
  );
}
