import { DogSex, prisma } from "../index";

const DEFAULT_MAX_ROWS = 50;

function parseBooleanEnv(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
  return fallback;
}

function parseMaxRows(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return DEFAULT_MAX_ROWS;
  return Math.max(1, Math.min(DEFAULT_MAX_ROWS, parsed));
}

function takeMax(target: number, maxRows: number): number {
  return Math.min(target, maxRows);
}

function makeDate(dayOffset: number): Date {
  const base = new Date(Date.UTC(2020, 0, 1));
  base.setUTCDate(base.getUTCDate() + dayOffset);
  return base;
}

async function resetSeedTables(): Promise<void> {
  await prisma.trialResult.deleteMany();
  await prisma.showResult.deleteMany();
  await prisma.dogOwnership.deleteMany();
  await prisma.dogRegistration.deleteMany();
  // Break self-referential FK links before deleting dog rows.
  await prisma.dog.updateMany({
    data: {
      sireId: null,
      damId: null,
    },
  });
  await prisma.dog.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.breeder.deleteMany();
}

async function main(): Promise<void> {
  const maxRows = parseMaxRows(process.env.SEED_MAX_ROWS);
  const reset = parseBooleanEnv(process.env.SEED_RESET, true);

  if (!reset) {
    throw new Error(
      "SEED_RESET=false is not supported for this dataset. Use reset mode.",
    );
  }

  const breederCount = takeMax(20, maxRows);
  const dogCount = takeMax(50, maxRows);
  const ownerCount = takeMax(25, maxRows);
  const ownershipCount = takeMax(50, maxRows);
  const trialCount = takeMax(50, maxRows);
  const showCount = takeMax(50, maxRows);

  await resetSeedTables();

  const breederNames: string[] = [];
  for (let i = 1; i <= breederCount; i += 1) {
    breederNames.push(`KENNEL ${String(i).padStart(2, "0")}`);
  }

  await prisma.breeder.createMany({
    data: breederNames.map((name, index) => ({
      name,
      shortCode: `K${String(index + 1).padStart(2, "0")}`,
      grantedAtRaw: `20${String(10 + (index % 10)).padStart(2, "0")}0101`,
      ownerName: `Breeder Owner ${index + 1}`,
      city: `City ${((index % 8) + 1).toString()}`,
      legacyFlag: index % 7 === 0 ? "FLAG" : null,
      detailsSource: "kennel",
    })),
  });

  const breeders = await prisma.breeder.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  const breederIdByName = new Map(breeders.map((b) => [b.name, b.id]));

  const createdDogs: string[] = [];
  const registrationRows: Array<{
    dogId: string;
    registrationNo: string;
    source: string;
  }> = [];

  for (let i = 1; i <= dogCount; i += 1) {
    const linkedBreederName = breederNames[(i - 1) % breederNames.length];
    const isLinked = i % 5 !== 0;
    const breederNameText = isLinked
      ? linkedBreederName
      : `UNLINKED BREEDER ${i}`;

    const sireId = i > 3 ? (createdDogs[i - 3] ?? null) : null;
    const damId = i > 4 ? (createdDogs[i - 4] ?? null) : null;

    const dog = await prisma.dog.create({
      data: {
        name: `Test Dog ${String(i).padStart(3, "0")}`,
        sex: i % 2 === 0 ? DogSex.FEMALE : DogSex.MALE,
        birthDate: makeDate(i),
        breederNameText,
        breederId: isLinked
          ? (breederIdByName.get(linkedBreederName) ?? null)
          : null,
        sireId,
        damId,
        ekNo: i,
        note: i % 9 === 0 ? `Note ${i}` : null,
      },
      select: { id: true },
    });

    createdDogs.push(dog.id);
    registrationRows.push({
      dogId: dog.id,
      registrationNo: `FI-TEST/${String(2000 + i)}`,
      source: "CANONICAL",
    });
  }

  await prisma.dogRegistration.createMany({
    data: registrationRows,
  });

  await prisma.owner.createMany({
    data: Array.from({ length: ownerCount }, (_, index) => ({
      name: `Owner ${String(index + 1).padStart(2, "0")}`,
      postalCode: `00${String((index % 90) + 10)}`,
      city: `Owner City ${((index % 10) + 1).toString()}`,
    })),
  });

  const owners = await prisma.owner.findMany({
    select: { id: true },
    orderBy: { name: "asc" },
  });

  const ownershipRows = Array.from({ length: ownershipCount }, (_, index) => {
    const dogId = createdDogs[index % createdDogs.length] as string;
    const ownerId = owners[index % owners.length]?.id as string;
    const ownershipDate = makeDate(30 + index);
    const ownershipDateKey = ownershipDate.toISOString().slice(0, 10);

    return {
      dogId,
      ownerId,
      ownershipDate,
      ownershipDateKey,
    };
  });

  await prisma.dogOwnership.createMany({
    data: ownershipRows,
    skipDuplicates: true,
  });

  const trialRows = Array.from({ length: trialCount }, (_, index) => {
    const dogIndex = index % createdDogs.length;
    const eventDate = makeDate(100 + index);
    const eventPlace = `Trial Place ${((index % 12) + 1).toString()}`;
    const registrationNo = registrationRows[dogIndex]?.registrationNo as string;
    const sourceKey = `${registrationNo}|${eventDate.toISOString().slice(0, 10)}|${eventPlace}`;

    return {
      dogId: createdDogs[dogIndex] as string,
      eventDate,
      eventName: null,
      eventPlace,
      kennelDistrict: `KD-${(index % 6) + 1}`,
      kennelDistrictNo: `${(index % 6) + 1}`,
      ke: index % 3 === 0 ? "KE" : null,
      lk: index % 4 === 0 ? "LK" : null,
      pa: index % 5 === 0 ? "PA" : null,
      piste: null,
      sija: index % 7 === 0 ? `S${(index % 3) + 1}` : null,
      haku: null,
      hauk: null,
      yva: null,
      hlo: null,
      alo: null,
      tja: null,
      pin: null,
      judge: `Judge ${(index % 9) + 1}`,
      legacyFlag: index % 11 === 0 ? "FLAG" : null,
      sourceKey,
    };
  });

  await prisma.trialResult.createMany({
    data: trialRows,
    skipDuplicates: true,
  });

  const showRows = Array.from({ length: showCount }, (_, index) => {
    const dogIndex = index % createdDogs.length;
    const eventDate = makeDate(220 + index);
    const eventPlace = `Show Place ${((index % 10) + 1).toString()}`;
    const registrationNo = registrationRows[dogIndex]?.registrationNo as string;
    const sourceKey = `${registrationNo}|${eventDate.toISOString().slice(0, 10)}|${eventPlace}`;

    return {
      dogId: createdDogs[dogIndex] as string,
      eventDate,
      eventName: null,
      eventPlace,
      resultText: index % 3 === 0 ? "ERI" : "EH",
      heightText: `${35 + (index % 15)} cm`,
      judge: `Judge ${(index % 9) + 1}`,
      legacyFlag: index % 13 === 0 ? "FLAG" : null,
      sourceKey,
    };
  });

  await prisma.showResult.createMany({
    data: showRows,
    skipDuplicates: true,
  });

  const [
    breederTotal,
    dogTotal,
    registrationTotal,
    ownerTotal,
    ownershipTotal,
    trialTotal,
    showTotal,
  ] = await Promise.all([
    prisma.breeder.count(),
    prisma.dog.count(),
    prisma.dogRegistration.count(),
    prisma.owner.count(),
    prisma.dogOwnership.count(),
    prisma.trialResult.count(),
    prisma.showResult.count(),
  ]);

  console.log("[seed] initial test data seeded");
  console.log(
    `[seed] counts breeders=${breederTotal} dogs=${dogTotal} registrations=${registrationTotal} owners=${ownerTotal} ownerships=${ownershipTotal} trials=${trialTotal} shows=${showTotal}`,
  );
}

main()
  .catch((error) => {
    console.error("[seed] failed to seed initial test data", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
