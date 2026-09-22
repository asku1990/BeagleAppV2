ALTER TABLE "Dog"
ADD COLUMN "originTypeText" TEXT;

COMMENT ON COLUMN "Dog"."originTypeText" IS
  'Registry-provided origin type text; intentionally not normalized to an application enum.';

ALTER TABLE "Dog"
ADD COLUMN "originCountryText" TEXT;

COMMENT ON COLUMN "Dog"."originCountryText" IS
  'Registry-provided origin country text; intentionally not normalized to an ISO country code.';

ALTER TABLE "Dog"
ADD COLUMN "tailText" TEXT;

COMMENT ON COLUMN "Dog"."tailText" IS
  'Registry-provided tail description text.';

ALTER TABLE "DogRegistration"
ADD COLUMN "registeredOn" DATE;

COMMENT ON COLUMN "DogRegistration"."registeredOn" IS
  'Calendar date when this registration was recorded; stored as PostgreSQL DATE without a time zone.';
