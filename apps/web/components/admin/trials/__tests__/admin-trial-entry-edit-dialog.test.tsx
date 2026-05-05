import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminTrialEntryEditDialog } from "../admin-trial-entry-edit-dialog";

const { buttonProps } = vi.hoisted(() => ({
  buttonProps: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    buttonProps.push({ ...props, children });
    return React.createElement("button", props, children);
  },
}));

vi.mock("@/components/admin", () => ({
  AdminFormModalShell: ({
    title,
    ariaLabel,
    footer,
    children,
  }: {
    title: React.ReactNode;
    ariaLabel: string;
    footer: React.ReactNode;
    children: React.ReactNode;
  }) =>
    React.createElement(
      "section",
      { "aria-label": ariaLabel },
      title,
      children,
      footer,
    ),
}));

describe("AdminTrialEntryEditDialog", () => {
  beforeEach(() => {
    buttonProps.length = 0;
  });

  it("renders header context for edited dog", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialEntryEditDialog, {
        open: true,
        trialEventId: "event-1",
        eventDate: "2026-04-14",
        eventPlace: "Helsinki",
        entry: {
          trialId: "entry-1",
          dogId: null,
          dogName: "Rex",
          registrationNo: "FI12345/21",
          entryKey: "entry-key",
          koemuoto: "AJOK",
          koetyyppi: "NORMAL",
          rank: "1",
          award: "VOI1",
          points: 95,
          judge: "Judge",
          eras: [
            {
              era: 1,
              alkoi: null,
              hakumin: null,
              ajomin: null,
              haku: null,
              hauk: null,
              yva: null,
              hlo: null,
              alo: null,
              tja: null,
              pin: null,
              huomautusTeksti: null,
              lisatiedot: [],
            },
            {
              era: 2,
              alkoi: null,
              hakumin: null,
              ajomin: null,
              haku: null,
              hauk: null,
              yva: null,
              hlo: null,
              alo: null,
              tja: null,
              pin: null,
              huomautusTeksti: null,
              lisatiedot: [],
            },
          ],
        },
        isPending: false,
        errorText: null,
        onClose: vi.fn(),
        onSave: vi.fn(async () => true),
      }),
    );

    expect(html).toContain("admin.trials.manage.entryModal.header.title");
    expect(html).toContain("Rex");
    expect(html).toContain("FI12345/21");
    expect(html).toContain("entry-1");
    expect(html).toContain("14.4.2026");
    expect(html).toContain("Helsinki");
  });

  it("saves the judge field without the snapshot field", () => {
    const onSave = vi.fn(async () => true);

    renderToStaticMarkup(
      React.createElement(AdminTrialEntryEditDialog, {
        open: true,
        trialEventId: "event-1",
        eventDate: "2026-04-14",
        eventPlace: "Helsinki",
        entry: {
          trialId: "entry-1",
          dogId: null,
          dogName: "Rex",
          registrationNo: "FI12345/21",
          entryKey: "entry-key",
          koemuoto: "AJOK",
          koetyyppi: "NORMAL",
          rank: "1",
          award: "VOI1",
          points: 95,
          judge: "Judge Snapshot",
          ylituomariNumeroSnapshot: "123",
          eras: [
            {
              era: 1,
              alkoi: null,
              hakumin: null,
              ajomin: null,
              haku: null,
              hauk: null,
              yva: null,
              hlo: null,
              alo: null,
              tja: null,
              pin: null,
              huomautusTeksti: null,
              lisatiedot: [],
            },
            {
              era: 2,
              alkoi: null,
              hakumin: null,
              ajomin: null,
              haku: null,
              hauk: null,
              yva: null,
              hlo: null,
              alo: null,
              tja: null,
              pin: null,
              huomautusTeksti: null,
              lisatiedot: [],
            },
          ],
        },
        isPending: false,
        errorText: null,
        onClose: vi.fn(),
        onSave,
      }),
    );

    const saveButton = buttonProps.find(
      (props) => props.children === "admin.trials.manage.eventModal.save",
    );
    expect(saveButton).toBeDefined();

    (saveButton?.onClick as (() => void) | undefined)?.();

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        entry: expect.objectContaining({
          judge: "Judge Snapshot",
          ylituomariNumeroSnapshot: "123",
        }),
      }),
    );
  });
});
