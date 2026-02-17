import { readFile } from "node:fs/promises";
import path from "node:path";

export type ReleaseNotesSection = "Added" | "Changed" | "Fixed" | "Removed";

export type ReleaseNotesBlock = {
  section: ReleaseNotesSection;
  items: string[];
};

export type ReleaseHistoryEntry = {
  version: string;
  date: string;
  blocks: ReleaseNotesBlock[];
};

export type ReleaseNotesData = {
  latestUpdatesFi: string[];
  history: ReleaseHistoryEntry[];
};

const SECTION_ORDER: ReleaseNotesSection[] = [
  "Added",
  "Changed",
  "Fixed",
  "Removed",
];

function uniqueItems(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const item of items) {
    const key = item.trim();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(key);
  }

  return out;
}

async function readChangelogFile(): Promise<string> {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "CHANGELOG.md"),
    path.join(cwd, "..", "CHANGELOG.md"),
    path.join(cwd, "..", "..", "CHANGELOG.md"),
  ];

  for (const candidate of candidates) {
    try {
      return await readFile(candidate, "utf8");
    } catch {
      // try next candidate
    }
  }

  throw new Error("CHANGELOG.md not found");
}

function parseVersionBlocks(changelogText: string): ReleaseHistoryEntry[] {
  const lines = changelogText.split(/\r?\n/);
  const releaseIndices = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => /^## \[[^\]]+\](?: - \d{4}-\d{2}-\d{2})?$/.test(line))
    .map(({ index }) => index);

  const releases: ReleaseHistoryEntry[] = [];

  for (let i = 0; i < releaseIndices.length; i += 1) {
    const start = releaseIndices[i];
    const end =
      i + 1 < releaseIndices.length ? releaseIndices[i + 1] : lines.length;
    const header = lines[start];
    const match = header.match(/^## \[([^\]]+)\](?: - (\d{4}-\d{2}-\d{2}))?$/);

    if (!match) {
      continue;
    }

    const version = match[1];
    const date = match[2];
    if (version === "Unreleased" || !date) {
      continue;
    }

    const sectionItems: Record<ReleaseNotesSection, string[]> = {
      Added: [],
      Changed: [],
      Fixed: [],
      Removed: [],
    };

    let currentSection: ReleaseNotesSection | null = null;
    for (let j = start + 1; j < end; j += 1) {
      const line = lines[j];
      const sectionMatch = line.match(/^### (Added|Changed|Fixed|Removed)$/);
      if (sectionMatch) {
        currentSection = sectionMatch[1] as ReleaseNotesSection;
        continue;
      }

      const bulletMatch = line.match(/^- (.+)$/);
      if (bulletMatch && currentSection) {
        sectionItems[currentSection].push(bulletMatch[1].trim());
      }
    }

    const blocks: ReleaseNotesBlock[] = SECTION_ORDER.map((section) => ({
      section,
      items: uniqueItems(sectionItems[section]),
    })).filter((block) => block.items.length > 0);

    releases.push({ version, date, blocks });
  }

  return releases;
}

function isNonUserVisiblePlaceholder(item: string): boolean {
  const trimmed = item.trim();
  return (
    /^No user-visible /i.test(trimmed) ||
    /^Ei käyttäjälle näkyviä /i.test(trimmed) ||
    /^Ei poistettu käyttäjälle näkyviä /i.test(trimmed)
  );
}

export async function getReleaseNotesData(): Promise<ReleaseNotesData> {
  const changelogText = await readChangelogFile();
  const history = parseVersionBlocks(changelogText);
  const latest = history[0];
  const latestItems = latest
    ? uniqueItems(
        latest.blocks.flatMap((block) =>
          block.items.filter((item) => !isNonUserVisiblePlaceholder(item)),
        ),
      ).slice(0, 10)
    : [];

  return {
    latestUpdatesFi: latestItems,
    history,
  };
}
