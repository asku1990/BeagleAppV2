export type DiseaseResultsLabels = {
  empty: string;
  public: {
    yes: string;
    no: string;
  };
  evidenceKind: {
    dog: string;
    litter: string;
  };
  unknownName: string;
  sex: {
    male: string;
    female: string;
    unknown: string;
  };
  parents: {
    sire: string;
    dam: string;
  };
  tableHeaders: {
    disease: string;
    evidenceKind: string;
    public: string;
    registration: string;
    sex: string;
    name: string;
    counts: string;
    metadata: string;
    actions: string;
  };
  cardLabels: {
    public: string;
    registration: string;
    sex: string;
    name: string;
    counts: string;
    litter: string;
    description: string;
    source: string;
    other: string;
  };
  actions: {
    more: string;
    delete: string;
  };
};

export function buildDogProfileHref(dogId: string): string {
  return `/admin/dogs/${encodeURIComponent(dogId)}/profile`;
}
