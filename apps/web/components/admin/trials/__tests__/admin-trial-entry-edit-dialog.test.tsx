import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminTrialEventEntry } from "@beagle/contracts";
import { AdminTrialEntryEditDialog } from "../admin-trial-entry-edit-dialog";
import { EraSection } from "../internal/era-section";

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

function trialEntryWithEras(eras: number[]): AdminTrialEventEntry {
  return {
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
    eras: eras.map((era) => ({
      era,
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
    })),
  };
}

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
        entry: trialEntryWithEras([1, 2]),
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

  it("saves the judge and ylituomari number snapshot fields", () => {
    const onSave = vi.fn(async () => true);

    renderToStaticMarkup(
      React.createElement(AdminTrialEntryEditDialog, {
        open: true,
        trialEventId: "event-1",
        eventDate: "2026-04-14",
        eventPlace: "Helsinki",
        entry: {
          ...trialEntryWithEras([1, 2]),
          judge: "Judge Snapshot",
          ylituomariNumeroSnapshot: "123",
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

  it("saves a one-era entry as only era 1", () => {
    const onSave = vi.fn(async () => true);

    const html = renderToStaticMarkup(
      React.createElement(AdminTrialEntryEditDialog, {
        open: true,
        trialEventId: "event-1",
        eventDate: "2026-04-14",
        eventPlace: "Helsinki",
        entry: trialEntryWithEras([1]),
        isPending: false,
        errorText: null,
        onClose: vi.fn(),
        onSave,
      }),
    );

    expect(html).toContain("Erä 1");
    expect(html).not.toContain("Erä 2");

    const saveButton = buttonProps.find(
      (props) => props.children === "admin.trials.manage.eventModal.save",
    );
    (saveButton?.onClick as (() => void) | undefined)?.();

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        eras: [expect.objectContaining({ era: 1 })],
      }),
    );
  });

  it("saves existing eras 1 and 2", () => {
    const onSave = vi.fn(async () => true);

    renderToStaticMarkup(
      React.createElement(AdminTrialEntryEditDialog, {
        open: true,
        trialEventId: "event-1",
        eventDate: "2026-04-14",
        eventPlace: "Helsinki",
        entry: trialEntryWithEras([1, 2]),
        isPending: false,
        errorText: null,
        onClose: vi.fn(),
        onSave,
      }),
    );

    const saveButton = buttonProps.find(
      (props) => props.children === "admin.trials.manage.eventModal.save",
    );
    (saveButton?.onClick as (() => void) | undefined)?.();

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        eras: [
          expect.objectContaining({ era: 1 }),
          expect.objectContaining({ era: 2 }),
        ],
      }),
    );
  });

  it("allows removing era 2 but not era 1", () => {
    const onRemoveEra = vi.fn();

    renderToStaticMarkup(
      React.createElement(EraSection, {
        eras: [
          {
            era: 1,
            alkoi: "",
            hakumin: "",
            ajomin: "",
            haku: "",
            hauk: "",
            yva: "",
            hlo: "",
            alo: "",
            tja: "",
            pin: "",
            huomautusTeksti: "",
          },
          {
            era: 2,
            alkoi: "",
            hakumin: "",
            ajomin: "",
            haku: "",
            hauk: "",
            yva: "",
            hlo: "",
            alo: "",
            tja: "",
            pin: "",
            huomautusTeksti: "",
          },
        ],
        isPending: false,
        onAddEra: vi.fn(),
        onRemoveEra,
        onChangeEraField: vi.fn(),
      }),
    );

    const removeButtons = buttonProps.filter(
      (props) => props.children === "Poista erä",
    );
    expect(removeButtons).toHaveLength(1);

    (removeButtons[0]?.onClick as (() => void) | undefined)?.();
    expect(onRemoveEra).toHaveBeenCalledWith(2);
  });
});
