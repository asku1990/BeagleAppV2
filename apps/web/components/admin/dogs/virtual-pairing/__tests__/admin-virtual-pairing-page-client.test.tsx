import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminVirtualPairingPageClient } from "../admin-virtual-pairing-page-client";

const {
  useAdminVirtualPairingSearchQueryMock,
  useCalculateAdminVirtualPairingMutationMock,
} = vi.hoisted(() => ({
  useAdminVirtualPairingSearchQueryMock: vi.fn(),
  useCalculateAdminVirtualPairingMutationMock: vi.fn(),
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/queries/admin/dogs", () => ({
  useAdminVirtualPairingSearchQuery: useAdminVirtualPairingSearchQueryMock,
  useCalculateAdminVirtualPairingMutation:
    useCalculateAdminVirtualPairingMutationMock,
}));

describe("AdminVirtualPairingPageClient", () => {
  beforeEach(() => {
    useAdminVirtualPairingSearchQueryMock.mockReset();
    useCalculateAdminVirtualPairingMutationMock.mockReset();
    useAdminVirtualPairingSearchQueryMock.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });
    useCalculateAdminVirtualPairingMutationMock.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
  });

  it("renders the admin virtual pairing shell with the disabled calculate action", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminVirtualPairingPageClient),
    );

    expect(html).toContain("admin.virtualPairing.title");
    expect(html).toContain("admin.virtualPairing.result.empty");
    expect(html).toContain("disabled");
  });
});
