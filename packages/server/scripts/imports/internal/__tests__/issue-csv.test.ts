import { describe, expect, it } from "vitest";
import { formatPerCodeIssueCsv } from "../issue-csv";

describe("formatPerCodeIssueCsv", () => {
  it("places the review message first and preserves the remaining column order", () => {
    const csv = formatPerCodeIssueCsv([
      {
        message: "Imported reference-only parent.",
        registrationNo: "FI12345/21",
        sourceTable: "bearek_id",
        stage: "relations",
        severity: "WARNING",
        code: "RELATION_REFERENCE_ONLY_PARENT_CREATED",
        payloadJson: '{"dogId":"dog-1"}',
      },
    ]);

    expect(csv).toBe(
      "message,registrationNo,sourceTable,stage,severity,payloadJson\n" +
        'Imported reference-only parent.,FI12345/21,bearek_id,relations,WARNING,"{""dogId"":""dog-1""}"\n',
    );
  });

  it("escapes commas, quotes, and line breaks in the message column", () => {
    const csv = formatPerCodeIssueCsv([
      {
        message: 'Review, "created"\nparent',
        registrationNo: null,
        sourceTable: null,
        stage: "relations",
        severity: "WARNING",
        code: "TEST",
        payloadJson: null,
      },
    ]);

    expect(csv).toContain('"Review, ""created""\nparent",,,relations,WARNING,');
  });
});
