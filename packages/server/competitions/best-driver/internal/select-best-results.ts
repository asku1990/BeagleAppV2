// Selects the highest-scoring valid triple for one dog under Paras ajuri rules.
import type { BestDriverCandidateDb } from "@beagle/db";

const REQUIRED_RESULT_COUNT = 3;
const MINIMUM_TOTAL_POINTS = 150;

function districtKey(result: BestDriverCandidateDb): string | null {
  const districtNo = result.kennelDistrictNo?.trim();
  if (districtNo) return `number:${districtNo}`;
  const district = result.kennelDistrict?.trim().toLocaleLowerCase("fi");
  return district ? `name:${district}` : null;
}

function isValidCombination(results: BestDriverCandidateDb[]): boolean {
  if (results.length !== REQUIRED_RESULT_COUNT) return false;
  if (new Set(results.map((result) => result.trialEventId)).size !== 3) {
    return false;
  }
  if (!results.some((result) => result.weather?.trim().toUpperCase() === "P")) {
    return false;
  }

  const districts = new Set(
    results.map(districtKey).filter((value): value is string => value !== null),
  );
  if (districts.size < 2) return false;

  return (
    results.filter((result) => result.trialType === "KOKOKAUDENKOE").length <= 1
  );
}

function totalPoints(results: BestDriverCandidateDb[]): number {
  return (
    Math.round(results.reduce((sum, result) => sum + result.points, 0) * 100) /
    100
  );
}

function compareResultOrder(
  left: BestDriverCandidateDb,
  right: BestDriverCandidateDb,
): number {
  return (
    right.points - left.points ||
    left.eventDate.getTime() - right.eventDate.getTime() ||
    left.trialEntryId.localeCompare(right.trialEntryId, "fi")
  );
}

function compareCombinations(
  left: BestDriverCandidateDb[],
  right: BestDriverCandidateDb[],
): number {
  const totalDifference = totalPoints(right) - totalPoints(left);
  if (totalDifference !== 0) return totalDifference;
  const leftSorted = [...left].sort(compareResultOrder);
  const rightSorted = [...right].sort(compareResultOrder);
  for (let index = 0; index < REQUIRED_RESULT_COUNT; index += 1) {
    const comparison = compareResultOrder(
      leftSorted[index]!,
      rightSorted[index]!,
    );
    if (comparison !== 0) return comparison;
  }
  return 0;
}

export function selectBestDriverResults(
  candidates: BestDriverCandidateDb[],
): BestDriverCandidateDb[] | null {
  let best: BestDriverCandidateDb[] | null = null;

  // V1 greedily accepted score-sorted rows and could miss a better valid triple.
  // Checking every triple preserves its written rules while fixing that bug.
  for (let first = 0; first < candidates.length - 2; first += 1) {
    for (let second = first + 1; second < candidates.length - 1; second += 1) {
      for (let third = second + 1; third < candidates.length; third += 1) {
        const combination = [
          candidates[first]!,
          candidates[second]!,
          candidates[third]!,
        ];
        if (!isValidCombination(combination)) continue;
        if (totalPoints(combination) < MINIMUM_TOTAL_POINTS) continue;
        if (!best || compareCombinations(combination, best) < 0) {
          best = combination;
        }
      }
    }
  }

  return best ? [...best].sort(compareResultOrder) : null;
}

export { totalPoints as getBestDriverTotalPoints };
