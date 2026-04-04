import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAdminShowEntry } from "@server/admin/shows/manage/delete-show-entry";
import { encodeShowId } from "@server/shows/internal/show-id";

const { deleteAdminShowEntryWriteDbMock } = vi.hoisted(() => ({
  deleteAdminShowEntryWriteDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  deleteAdminShowEntryWriteDb: deleteAdminShowEntryWriteDbMock,
}));

describe("deleteAdminShowEntry", () => {
  beforeEach(() => {
    deleteAdminShowEntryWriteDbMock.mockReset();
  });

  it("returns 400 for invalid show id", async () => {
    await expect(
      deleteAdminShowEntry(
        {
          showId: "invalid",
          entryId: "entry-1",
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
      deleteAdminShowEntry(
        {
          showId,
          entryId: " ",
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

  it("returns 404 when db reports not_found", async () => {
    deleteAdminShowEntryWriteDbMock.mockResolvedValue({ status: "not_found" });
    const showId = encodeShowId(
      "2025-06-01",
      "Helsinki",
      "2025-06-01|HELSINKI",
    );

    await expect(
      deleteAdminShowEntry(
        {
          showId,
          entryId: "entry-1",
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

  it("returns 200 when entry is deleted", async () => {
    deleteAdminShowEntryWriteDbMock.mockResolvedValue({
      status: "deleted",
      entryId: "entry-1",
    });
    const showId = encodeShowId(
      "2025-06-01",
      "Helsinki",
      "2025-06-01|HELSINKI",
    );

    await expect(
      deleteAdminShowEntry(
        {
          showId,
          entryId: " entry-1 ",
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          deletedEntryId: "entry-1",
        },
      },
    });

    expect(deleteAdminShowEntryWriteDbMock).toHaveBeenCalledWith({
      eventKey: "2025-06-01|HELSINKI",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      entryId: "entry-1",
    });
  });

  it("returns 500 when delete throws", async () => {
    deleteAdminShowEntryWriteDbMock.mockRejectedValue(new Error("boom"));
    const showId = encodeShowId(
      "2025-06-01",
      "Helsinki",
      "2025-06-01|HELSINKI",
    );

    await expect(
      deleteAdminShowEntry(
        {
          showId,
          entryId: "entry-1",
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to delete admin show entry.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
