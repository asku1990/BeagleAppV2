import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateAdminShowEntry } from "@server/admin/shows/manage/update-show-entry";
import { encodeShowId } from "@server/shows/internal/show-id";

const { updateAdminShowEntryWriteDbMock } = vi.hoisted(() => ({
  updateAdminShowEntryWriteDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  updateAdminShowEntryWriteDb: updateAdminShowEntryWriteDbMock,
}));

describe("updateAdminShowEntry", () => {
  beforeEach(() => {
    updateAdminShowEntryWriteDbMock.mockReset();
  });

  it("returns 400 for invalid show id", async () => {
    await expect(
      updateAdminShowEntry(
        {
          showId: "invalid",
          entryId: "entry-1",
          judge: "Judge",
          critiqueText: "Text",
          heightCm: "38",
          classCode: "AVO",
          qualityGrade: "ERI",
          classPlacement: "1",
          pupn: "PU1",
          awards: ["SERT"],
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Invalid show id.",
        code: "INVALID_SHOW_ID",
      },
    });
  });

  it("returns 400 for invalid entry id", async () => {
    const showId = encodeShowId(
      "2025-06-01",
      "Helsinki",
      "2025-06-01|HELSINKI",
    );

    await expect(
      updateAdminShowEntry(
        {
          showId,
          entryId: " ",
          judge: "Judge",
          critiqueText: "Text",
          heightCm: "38",
          classCode: "AVO",
          qualityGrade: "ERI",
          classPlacement: "1",
          pupn: "PU1",
          awards: ["SERT"],
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Entry id is required.",
        code: "INVALID_ENTRY_ID",
      },
    });
  });

  it("returns 400 for invalid height", async () => {
    const showId = encodeShowId(
      "2025-06-01",
      "Helsinki",
      "2025-06-01|HELSINKI",
    );

    await expect(
      updateAdminShowEntry(
        {
          showId,
          entryId: "entry-1",
          judge: "Judge",
          critiqueText: "Text",
          heightCm: "-1",
          classCode: "",
          qualityGrade: "",
          classPlacement: "",
          pupn: "",
          awards: [],
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Height must be a non-negative number.",
        code: "INVALID_HEIGHT_CM",
      },
    });
  });

  it("returns 400 for invalid class placement", async () => {
    const showId = encodeShowId(
      "2025-06-01",
      "Helsinki",
      "2025-06-01|HELSINKI",
    );

    await expect(
      updateAdminShowEntry(
        {
          showId,
          entryId: "entry-1",
          judge: "Judge",
          critiqueText: "Text",
          heightCm: "38",
          classCode: "",
          qualityGrade: "",
          classPlacement: "1.5",
          pupn: "",
          awards: [],
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Class placement must be a positive integer.",
        code: "INVALID_CLASS_PLACEMENT",
      },
    });
  });

  it("returns 400 for zero class placement", async () => {
    const showId = encodeShowId(
      "2025-06-01",
      "Helsinki",
      "2025-06-01|HELSINKI",
    );

    await expect(
      updateAdminShowEntry(
        {
          showId,
          entryId: "entry-1",
          judge: "Judge",
          critiqueText: "Text",
          heightCm: "38",
          classCode: "",
          qualityGrade: "",
          classPlacement: "0",
          pupn: "",
          awards: [],
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Class placement must be a positive integer.",
        code: "INVALID_CLASS_PLACEMENT",
      },
    });
  });

  it("returns 400 for invalid pupn", async () => {
    const showId = encodeShowId(
      "2025-06-01",
      "Helsinki",
      "2025-06-01|HELSINKI",
    );

    await expect(
      updateAdminShowEntry(
        {
          showId,
          entryId: "entry-1",
          judge: "Judge",
          critiqueText: "Text",
          heightCm: "38",
          classCode: "",
          qualityGrade: "",
          classPlacement: "",
          pupn: "PU",
          awards: [],
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "PUPN must use PU/PN with rank 1-4.",
        code: "INVALID_PUPN",
      },
    });
  });

  it("returns 400 for out-of-range pupn rank", async () => {
    const showId = encodeShowId(
      "2025-06-01",
      "Helsinki",
      "2025-06-01|HELSINKI",
    );

    await expect(
      updateAdminShowEntry(
        {
          showId,
          entryId: "entry-1",
          judge: "Judge",
          critiqueText: "Text",
          heightCm: "38",
          classCode: "",
          qualityGrade: "",
          classPlacement: "",
          pupn: "PU5",
          awards: [],
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "PUPN must use PU/PN with rank 1-4.",
        code: "INVALID_PUPN",
      },
    });
  });

  it("maps not found from db", async () => {
    updateAdminShowEntryWriteDbMock.mockResolvedValue({ status: "not_found" });
    const showId = encodeShowId(
      "2025-06-01",
      "Helsinki",
      "2025-06-01|HELSINKI",
    );

    await expect(
      updateAdminShowEntry(
        {
          showId,
          entryId: "entry-1",
          judge: "",
          critiqueText: "",
          heightCm: "",
          classCode: "",
          qualityGrade: "",
          classPlacement: "",
          pupn: "",
          awards: [],
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 404,
      body: {
        ok: false,
        error: "Entry not found in selected show.",
        code: "ENTRY_NOT_FOUND",
      },
    });
  });

  it("maps invalid award code from db", async () => {
    updateAdminShowEntryWriteDbMock.mockResolvedValue({
      status: "invalid_award_code",
      awardCode: "UNKNOWN",
    });
    const showId = encodeShowId(
      "2025-06-01",
      "Helsinki",
      "2025-06-01|HELSINKI",
    );

    await expect(
      updateAdminShowEntry(
        {
          showId,
          entryId: "entry-1",
          judge: "",
          critiqueText: "",
          heightCm: "",
          classCode: "",
          qualityGrade: "",
          classPlacement: "",
          pupn: "",
          awards: ["UNKNOWN"],
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Invalid award code: UNKNOWN.",
        code: "INVALID_AWARD_CODE",
      },
    });
  });

  it("returns 200 for successful update", async () => {
    updateAdminShowEntryWriteDbMock.mockResolvedValue({
      status: "updated",
      entryId: "entry-1",
    });
    const showId = encodeShowId(
      "2025-06-01",
      "Helsinki",
      "2025-06-01|HELSINKI",
    );

    const result = await updateAdminShowEntry(
      {
        showId,
        entryId: "entry-1",
        judge: " Judge A ",
        critiqueText: " Balanced ",
        heightCm: "38",
        classCode: " AVO ",
        qualityGrade: " ERI ",
        classPlacement: "2",
        pupn: "pu2",
        awards: [" SERT ", "SERT"],
      },
      {
        id: "u_1",
        email: "admin@example.com",
        username: null,
        role: "ADMIN",
      },
    );

    expect(result).toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          entryId: "entry-1",
        },
      },
    });
    expect(updateAdminShowEntryWriteDbMock).toHaveBeenCalledWith({
      eventKey: "2025-06-01|HELSINKI",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      entryId: "entry-1",
      judge: "Judge A",
      critiqueText: "Balanced",
      heightText: "38",
      classCode: "AVO",
      qualityGrade: "ERI",
      classPlacement: 2,
      pupn: "PU2",
      awards: ["SERT"],
    });
  });
});
