export { createDogsService, dogsService } from "./search";
export { searchVirtualPairingDogs } from "./virtual-pairing";
export { calculateVirtualPairing } from "./virtual-pairing/calculate-virtual-pairing";
export { calculatePublicVirtualPairing } from "./virtual-pairing/calculate-public-virtual-pairing";
export {
  getBeagleDogProfileService,
  type DogsServiceLogContext,
} from "./profile/get-beagle-dog-profile";
export { getBeagleDogTrialsService } from "./profile/get-beagle-dog-trials";
export { parseDogId } from "./core";
export {
  calculateInbreedingCoefficientForParentsPct,
  calculateInbreedingCoefficientPct,
} from "./core";
