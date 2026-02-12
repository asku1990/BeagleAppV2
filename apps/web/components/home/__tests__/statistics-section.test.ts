import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HomeStatisticsResponse } from "@beagle/contracts";
import { StatisticsSection } from "../statistics-section";

type Locale = "fi" | "sv";

const translations: Record<string, string> = {
  "common.dataPending": "Data pending",
  "common.dataUnavailable": "Data unavailable",
};

let mockedLocale: Locale = "fi";
let mockedQueryResult: {
  data?: HomeStatisticsResponse;
  isLoading: boolean;
  isError: boolean;
} = {
  data: undefined,
  isLoading: false,
  isError: false,
};

vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    locale: mockedLocale,
    t: (key: string) => translations[key] ?? key,
  }),
}));

vi.mock("@/queries/home/use-home-statistics-query", () => ({
  useHomeStatisticsQuery: () => mockedQueryResult,
}));

function renderSection() {
  return renderToStaticMarkup(React.createElement(StatisticsSection));
}

const baseData: HomeStatisticsResponse = {
  registrations: {
    registeredDogs: 12345,
    youngestRegisteredBirthDate: "2024-01-15T00:00:00.000Z",
  },
  trials: {
    resultsPeriodStart: "2023-01-01T00:00:00.000Z",
    resultsPeriodEnd: "2023-12-31T00:00:00.000Z",
    totalEntries: 1450,
    performedByDogs: 321,
  },
  shows: {
    resultsPeriodStart: "2022-01-01T00:00:00.000Z",
    resultsPeriodEnd: "2022-12-31T00:00:00.000Z",
    totalEntries: 980,
    performedByDogs: 250,
  },
};

describe("StatisticsSection", () => {
  beforeEach(() => {
    mockedLocale = "fi";
    mockedQueryResult = {
      data: undefined,
      isLoading: false,
      isError: false,
    };
  });

  it("renders loading skeletons during initial loading", () => {
    mockedQueryResult = {
      data: undefined,
      isLoading: true,
      isError: false,
    };

    const html = renderSection();

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('data-slot="skeleton"');
  });

  it("renders formatted values for successful fi locale data", () => {
    mockedLocale = "fi";
    mockedQueryResult = {
      data: baseData,
      isLoading: false,
      isError: false,
    };

    const html = renderSection();
    const fiNumber = new Intl.NumberFormat("fi-FI").format(
      baseData.registrations.registeredDogs,
    );
    const fiDate = new Intl.DateTimeFormat("fi-FI").format(
      new Date(baseData.registrations.youngestRegisteredBirthDate!),
    );

    expect(html).toContain(fiNumber);
    expect(html).toContain(fiDate);
    expect(html).not.toContain("Data unavailable");
  });

  it("renders formatted values for successful sv locale data", () => {
    mockedLocale = "sv";
    mockedQueryResult = {
      data: baseData,
      isLoading: false,
      isError: false,
    };

    const html = renderSection();
    const svNumber = new Intl.NumberFormat("sv-SE").format(
      baseData.trials.totalEntries,
    );
    const svDate = new Intl.DateTimeFormat("sv-SE").format(
      new Date(baseData.shows.resultsPeriodStart!),
    );

    expect(html).toContain(svNumber);
    expect(html).toContain(svDate);
  });

  it("renders unavailable fallback when query errors", () => {
    mockedQueryResult = {
      data: undefined,
      isLoading: false,
      isError: true,
    };

    const html = renderSection();

    expect(html).toContain("Data unavailable");
  });

  it("renders pending fallback when response fields are missing", () => {
    mockedQueryResult = {
      data: {
        ...baseData,
        registrations: {
          ...baseData.registrations,
          youngestRegisteredBirthDate: null,
        },
      },
      isLoading: false,
      isError: false,
    };

    const html = renderSection();

    expect(html).toContain("Data pending");
  });
});
