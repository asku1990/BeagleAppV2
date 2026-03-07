import { describe, expect, it, vi } from "vitest";
import {
  copyShowDetailRowToClipboard,
  copyShowSearchRowsToClipboard,
} from "../clipboard";

function createToastMocks() {
  return {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  };
}

const searchLabels = {
  date: "Päivä",
  place: "Paikka",
  judge: "Tuomari",
  dogCount: "Koiria",
};

const detailLabels = {
  registrationNo: "Rek.nro",
  name: "Nimi",
  sex: "Sukupuoli",
  result: "Tulos",
  reviewText: "Arvostelu",
  height: "Korkeus",
  judge: "Tuomari",
  sexMale: "Uros",
  sexFemale: "Narttu",
  sexUnknown: "-",
};

const messages = {
  success: "copy.success",
  error: "copy.error",
  unsupported: "copy.unsupported",
};

describe("show clipboard actions", () => {
  it("writes search rows to clipboard and shows success toast", async () => {
    const toast = createToastMocks();
    const writeText = vi.fn().mockResolvedValue(undefined);

    const result = await copyShowSearchRowsToClipboard({
      rows: [
        {
          showId: "s1",
          eventDate: "2025-06-01",
          eventPlace: "Helsinki",
          judge: "Judge A",
          dogCount: 7,
        },
      ],
      labels: searchLabels,
      messages,
      clipboard: { writeText },
      toast,
    });

    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith(
      "Päivä\tPaikka\tTuomari\tKoiria\n2025-06-01\tHelsinki\tJudge A\t7",
    );
    expect(toast.success).toHaveBeenCalledWith("copy.success");
  });

  it("shows unsupported toast when clipboard is unavailable", async () => {
    const toast = createToastMocks();

    const result = await copyShowSearchRowsToClipboard({
      rows: [
        {
          showId: "s1",
          eventDate: "2025-06-01",
          eventPlace: "Helsinki",
          judge: "Judge A",
          dogCount: 7,
        },
      ],
      labels: searchLabels,
      messages,
      toast,
    });

    expect(result).toBe(false);
    expect(toast.warning).toHaveBeenCalledWith("copy.unsupported");
  });

  it("shows error toast when detail row clipboard write fails", async () => {
    const toast = createToastMocks();
    const writeText = vi.fn().mockRejectedValue(new Error("boom"));

    const result = await copyShowDetailRowToClipboard({
      row: {
        id: "r1",
        dogId: "d1",
        registrationNo: "FI-1/20",
        name: "Aatu",
        sex: "U",
        result: "ERI",
        reviewText: "Pending later",
        heightCm: 40,
        judge: "Judge A",
      },
      labels: detailLabels,
      messages,
      clipboard: { writeText },
      toast,
    });

    expect(result).toBe(false);
    expect(writeText).toHaveBeenCalledWith(
      "Rek.nro\tNimi\tSukupuoli\tTulos\tArvostelu\tKorkeus\tTuomari\nFI-1/20\tAatu\tUros\tERI\tPending later\t40 cm\tJudge A",
    );
    expect(toast.error).toHaveBeenCalledWith("copy.error");
  });
});
