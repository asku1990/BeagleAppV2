export type DeleteAdminDogRequest = {
  id: string;
};

export type AdminDogDeleteImpactOwner = {
  id: string;
  name: string;
};

export type AdminDogDeleteImpactBreeder = {
  id: string;
  name: string;
};

export type AdminDogDeleteImpact = {
  dogId: string;
  deleted: {
    registrations: number;
    ownerships: number;
    titles: number;
    legacyTrialResults: number;
  };
  detached: {
    canonicalTrialEntries: number;
    showEntries: number;
    diseaseRows: number;
    sireReferences: number;
    damReferences: number;
  };
  orphanWarnings: {
    owners: AdminDogDeleteImpactOwner[];
    breeder: AdminDogDeleteImpactBreeder | null;
  };
};

export type GetAdminDogDeleteImpactRequest = {
  id: string;
};

export type GetAdminDogDeleteImpactResponse = AdminDogDeleteImpact;

export type DeleteAdminDogResponse = {
  deletedDogId: string;
};
