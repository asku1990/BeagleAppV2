export type VirtualPairingSearchField = "ek" | "reg" | "name";

export type VirtualPairingSearchRequest = {
  field: VirtualPairingSearchField;
  query: string;
  page?: number;
  pageSize?: number;
};

export type VirtualPairingDogOption = {
  id: string;
  ekNo: number | null;
  registrationNo: string;
  name: string;
  sex: "U" | "N" | "-";
};

export type VirtualPairingSearchResponse = {
  field: VirtualPairingSearchField;
  query: string;
  total: number;
  totalPages: number;
  page: number;
  items: VirtualPairingDogOption[];
};
