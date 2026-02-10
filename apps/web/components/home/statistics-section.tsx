import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatRow = {
  label: string;
  value: string;
};

type StatGroup = {
  title: string;
  rows: StatRow[];
};

const statGroups: StatGroup[] = [
  {
    title: "Registrations",
    rows: [
      { label: "Registered dogs", value: "Data pending" },
      { label: "Youngest registered", value: "Data pending" },
    ],
  },
  {
    title: "Trials",
    rows: [
      { label: "Results period", value: "Data pending" },
      { label: "Total trial entries", value: "Data pending" },
      { label: "Performed by dogs", value: "Data pending" },
    ],
  },
  {
    title: "Shows",
    rows: [
      { label: "Results period", value: "Data pending" },
      { label: "Total show entries", value: "Data pending" },
      { label: "Performed by dogs", value: "Data pending" },
    ],
  },
];

export function StatisticsSection() {
  return (
    <Card className="beagle-panel gap-0 overflow-hidden py-0">
      <CardHeader className="px-5 pt-5 pb-4 md:px-6 md:pt-6 md:pb-4">
        <CardTitle className="text-xl text-[var(--beagle-ink)]">
          Beagle Database Statistics
        </CardTitle>
      </CardHeader>

      <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
        <div className="grid gap-3 md:grid-cols-2 lg:gap-4 xl:grid-cols-3">
          {statGroups.map((group) => (
            <section
              key={group.title}
              className="rounded-xl border border-[var(--beagle-border)] bg-white px-4 py-3.5 shadow-sm"
              aria-label={group.title}
            >
              <h3 className="text-base font-semibold text-[var(--beagle-ink)]">
                {group.title}
              </h3>
              <ul className="mt-2.5 space-y-2.5">
                {group.rows.map((row) => (
                  <li
                    key={row.label}
                    className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--beagle-border)] pb-2 last:border-b-0 last:pb-0"
                  >
                    <span className="text-sm leading-5 text-[var(--beagle-muted)]">
                      {row.label}
                    </span>
                    <span className="rounded-md bg-[var(--beagle-accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--beagle-ink)]">
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
