import { describe, expect, it } from "vitest";
import {
  getAdminTrialEventCreateHref,
  getAdminTrialEventHref,
  getAdminTrialsHref,
} from "../trial-route";

describe("admin trial route helpers", () => {
  it("returns the admin trials root", () => {
    expect(getAdminTrialsHref()).toBe("/admin/trials");
  });

  it("builds an event workspace href", () => {
    expect(getAdminTrialEventHref("event-1")).toBe("/admin/trials/event-1");
  });

  it("builds the event creation href", () => {
    expect(getAdminTrialEventCreateHref()).toBe("/admin/trials/new");
  });

  it("encodes the event id as one path segment", () => {
    expect(getAdminTrialEventHref("event/with spaces")).toBe(
      "/admin/trials/event%2Fwith%20spaces",
    );
  });
});
